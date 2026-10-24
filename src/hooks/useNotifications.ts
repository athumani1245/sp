import { useCallback, useEffect, useMemo, useState } from 'react';
import { notification as toast } from 'antd';
import {
  AppNotification,
  onPushMessage,
  pushPermission,
  registerForPush,
} from '../services/notificationService';
import { decodeJWT } from '../utils/jwt';

const MAX_STORED = 50;

const currentUserId = (): string => {
  const token = localStorage.getItem('token');
  return (token && decodeJWT(token)?.user_id) || 'anon';
};

// There is no backend feed: the tray is the pushes this browser received while
// the app was open, kept per user. Unread is the timestamp the tray was last opened.
// ponytail: background pushes (app closed) aren't stored, add a backend list endpoint if the tray must show them.
const storageKey = () => `notifications_${currentUserId()}`;
const lastSeenKey = () => `notifications_last_seen_${currentUserId()}`;

const readStored = (): AppNotification[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey()) || '[]');
    return parsed.map((n: any) => ({ ...n, createdAt: n.createdAt ? new Date(n.createdAt) : null }));
  } catch {
    return [];
  }
};

const readLastSeen = (): number => {
  const parsed = Number(localStorage.getItem(lastSeenKey()));
  return isNaN(parsed) ? 0 : parsed;
};

export const useNotifications = (enabled: boolean = true) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(readStored);
  const [lastSeen, setLastSeen] = useState<number>(readLastSeen);

  // Another user may log in without a reload, so reload their own tray.
  useEffect(() => {
    if (!enabled) return;
    setNotifications(readStored());
    setLastSeen(readLastSeen());
  }, [enabled]);

  // Foreground pushes: the browser does not display these, so the app does.
  useEffect(() => {
    if (!enabled) return;
    return onPushMessage((incoming) => {
      setNotifications((prev) => {
        const next = [incoming, ...prev.filter((n) => n.id !== incoming.id)].slice(0, MAX_STORED);
        localStorage.setItem(storageKey(), JSON.stringify(next));
        return next;
      });
      toast.info({
        message: incoming.title || 'Tanaka',
        description: incoming.description,
        placement: 'topRight',
      });
    });
  }, [enabled]);

  // Register this browser for push once permission is already granted; the
  // prompt itself is left to an explicit user action.
  useEffect(() => {
    if (!enabled) return;
    registerForPush();
  }, [enabled]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => (n.createdAt?.getTime() ?? 0) > lastSeen).length,
    [notifications, lastSeen]
  );

  const markAllSeen = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(lastSeenKey(), String(now));
    setLastSeen(now);
  }, []);

  const isUnread = useCallback(
    (notification: AppNotification) => (notification.createdAt?.getTime() ?? 0) > lastSeen,
    [lastSeen]
  );

  const remove = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.filter((n) => n.id !== id);
      localStorage.setItem(storageKey(), JSON.stringify(next));
      return next;
    });
  }, []);

  const enablePush = useCallback(async () => {
    const token = await registerForPush({ prompt: true });
    return Boolean(token);
  }, []);

  return {
    notifications,
    isLoading: false,
    unreadCount,
    isUnread,
    markAllSeen,
    remove,
    enablePush,
    permission: pushPermission(),
  };
};
