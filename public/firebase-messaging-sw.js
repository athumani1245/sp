/* eslint-disable no-undef */
// Firebase Cloud Messaging service worker — handles pushes that arrive while the
// app is closed or in a background tab. Registered from src/services/notificationService.ts,
// which passes the Firebase config as query params (a service worker cannot read process.env).
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js');

const params = new URLSearchParams(self.location.search);

firebase.initializeApp({
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
});

const messaging = firebase.messaging();

// Only fires for data-only payloads. Messages carrying a `notification` block are
// displayed by the browser itself, so handling both here would double up.
messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const title = data.title || 'Tanaka';
  const options = {
    body: data.description || data.body || '',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: data.id || undefined, // collapses repeats of the same activity
    data: { link: data.link || linkFor(data.entity_type, data.entity_id) },
  };
  return self.registration.showNotification(title, options);
});

function linkFor(entityType, entityId) {
  if (!entityType) return '/dashboard';
  const routes = {
    expense: '/expenses',
    payment: '/payments',
    lease: entityId ? `/leases/${entityId}` : '/leases',
    tenant: entityId ? `/tenants/${entityId}` : '/tenants',
    property: entityId ? `/properties/${entityId}` : '/properties',
    unit: '/properties',
  };
  return routes[String(entityType).trim().toLowerCase()] || '/dashboard';
}

// Focus an open Tanaka tab instead of opening a duplicate one.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(new URL(link, self.location.origin).href);
          return client.focus();
        }
      }
      return self.clients.openWindow(link);
    })
  );
});
