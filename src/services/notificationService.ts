import { getToken, deleteToken, onMessage, MessagePayload } from 'firebase/messaging';
import api from '../utils/api';
import { getFirebaseMessaging, isFirebaseConfigured, serviceWorkerUrl, VAPID_KEY } from '../utils/firebase';

const API_BASE = process.env.REACT_APP_API_BASE;

const DEVICE_TOKEN_ENDPOINT = '/register-fcm/';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  createdAt: Date | null;
  entityType: string | null;
  entityId: string | null;
}

// FCM data payloads are flat strings and field names vary, so normalise once here.
export const normalizeNotification = (raw: any): AppNotification => ({
  id: String(raw.id ?? raw.activity_id ?? ''),
  title: raw.title || '',
  description: raw.description || raw.message || raw.body || '',
  createdAt: parseTimestamp(raw.created_at ?? raw.createdAt ?? raw.timestamp) ?? new Date(),
  entityType: String(raw.entity_type ?? raw.entityType ?? '').trim().toLowerCase() || null,
  entityId: raw.entity_id ?? raw.entityId ?? null,
});

const parseTimestamp = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  // Firestore-style { seconds } or epoch millis sent as a string over FCM
  if (typeof value === 'object' && typeof value.seconds === 'number') {
    return new Date(value.seconds * 1000);
  }
  const numeric = Number(value);
  if (!isNaN(numeric) && String(value).trim() !== '') {
    return new Date(numeric > 1e12 ? numeric : numeric * 1000);
  }
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
};

// Route an activity to the record it describes.
export const notificationLink = (notification: AppNotification): string => {
  const { entityType, entityId } = notification;
  switch (entityType) {
    case 'expense':
      return '/expenses';
    case 'payment':
      return '/payments';
    case 'lease':
      return entityId ? `/leases/${entityId}` : '/leases';
    case 'tenant':
      return entityId ? `/tenants/${entityId}` : '/tenants';
    case 'property':
      return entityId ? `/properties/${entityId}` : '/properties';
    case 'unit':
      return '/properties';
    default:
      return '/dashboard';
  }
};

const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.register(serviceWorkerUrl());
};

/**
 * Obtains an FCM registration token and hands it to the backend, which uses it
 * as the delivery address for pushes. Safe to call on every app load — tokens
 * rotate, and re-registering is how the backend learns the new one.
 *
 * Never prompts on its own: it returns null unless permission is already
 * granted, so the prompt stays tied to an explicit user action.
 */
export const registerForPush = async ({ prompt = false } = {}): Promise<string | null> => {
  if (!isFirebaseConfigured || !VAPID_KEY) return null;

  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  if (Notification.permission === 'denied') return null;
  if (Notification.permission !== 'granted') {
    if (!prompt) return null;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;
  }

  try {
    const serviceWorkerRegistration = await registerServiceWorker();
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      ...(serviceWorkerRegistration ? { serviceWorkerRegistration } : {}),
    });
    if (!token) return null;

    await api.post(`${API_BASE}${DEVICE_TOKEN_ENDPOINT}`, {
      token,
      device_type: 'web',
      user_agent: navigator.userAgent,
    });
    localStorage.setItem('fcm_token', token);
    return token;
  } catch (error) {
    // A failed push registration must never block the app from loading.
    console.warn('Push registration failed', error);
    return null;
  }
};

/**
 * Detaches this browser from the account on logout. Without it the token stays
 * mapped to the previous user, and whoever logs in next on a shared machine
 * receives their notifications.
 */
export const unregisterFromPush = async (): Promise<void> => {
  const token = localStorage.getItem('fcm_token');
  localStorage.removeItem('fcm_token');
  if (!token) return;

  try {
    await api.delete(`${API_BASE}${DEVICE_TOKEN_ENDPOINT}`, { data: { token } });
  } catch {
    // Backend may already have pruned it; the local delete below still matters.
  }

  try {
    const messaging = await getFirebaseMessaging();
    if (messaging) await deleteToken(messaging);
  } catch {
    // Nothing actionable if the SDK cannot revoke it.
  }
};

// Foreground pushes: the browser does not display these, the app does.
export const onPushMessage = (
  callback: (notification: AppNotification, payload: MessagePayload) => void
): (() => void) => {
  let unsubscribe: (() => void) | null = null;
  let cancelled = false;

  getFirebaseMessaging().then((messaging) => {
    if (!messaging || cancelled) return;
    unsubscribe = onMessage(messaging, (payload) => {
      const data = { ...(payload.data || {}), ...(payload.notification || {}) };
      const notification = normalizeNotification(data);
      callback({ ...notification, id: notification.id || payload.messageId || String(Date.now()) }, payload);
    });
  });

  return () => {
    cancelled = true;
    if (unsubscribe) unsubscribe();
  };
};

export const pushPermission = (): NotificationPermission | 'unsupported' =>
  typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;
