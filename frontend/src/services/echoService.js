import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

let echoInstance = null;

/**
 * Get (or create) the singleton Echo instance.
 * Lazily initialized so the token is available.
 */
export function getEcho() {
  if (echoInstance) return echoInstance;

  const key    = import.meta.env.VITE_PUSHER_KEY;
  const cluster = import.meta.env.VITE_PUSHER_CLUSTER || 'ap2';

  if (!key) {
    console.warn('[RTBMS] Pusher key not set — real-time disabled. Set VITE_PUSHER_KEY in .env');
    return null;
  }

  echoInstance = new Echo({
    broadcaster: 'pusher',
    key,
    cluster,
    forceTLS: true,
    authEndpoint: `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('rtbms-auth')
          ? JSON.parse(localStorage.getItem('rtbms-auth'))?.state?.token
          : ''}`,
      },
    },
  });

  return echoInstance;
}

export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}

/**
 * Subscribe to the public emergencies channel.
 * @param {function} onNew   - called with emergency payload when a new one arrives
 * @returns cleanup function
 */
export function subscribeToEmergencies(onNew) {
  const echo = getEcho();
  if (!echo) return () => {};

  const channel = echo.channel('emergencies');
  channel.listen('.emergency.new', onNew);

  return () => {
    channel.stopListening('.emergency.new');
    echo.leaveChannel('emergencies');
  };
}

/**
 * Subscribe to the public inventory channel.
 * @param {function} onUpdate - called with inventory payload when units change
 * @returns cleanup function
 */
export function subscribeToInventory(onUpdate) {
  const echo = getEcho();
  if (!echo) return () => {};

  const channel = echo.channel('inventory');
  channel.listen('.inventory.updated', onUpdate);

  return () => {
    channel.stopListening('.inventory.updated');
    echo.leaveChannel('inventory');
  };
}

/**
 * Subscribe to a user's private channel for request status updates.
 * @param {string}   userId
 * @param {function} onStatusChange
 * @returns cleanup function
 */
export function subscribeToUserNotifications(userId, onStatusChange) {
  const echo = getEcho();
  if (!echo || !userId) return () => {};

  const channel = echo.private(`user.${userId}`);
  channel.listen('.request.status_changed', onStatusChange);

  return () => {
    channel.stopListening('.request.status_changed');
    echo.leaveChannel(`private-user.${userId}`);
  };
}
