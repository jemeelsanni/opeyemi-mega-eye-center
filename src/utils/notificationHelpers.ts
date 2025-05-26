// src/utils/notificationHelpers.ts

/**
 * Check if push notifications are supported by the browser
 */
export const isNotificationSupported = (): boolean => {
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
};

/**
 * Convert VAPID public key from base64 string to Uint8Array
 * Fixed to return proper BufferSource type
 */
export const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  // Create a proper ArrayBuffer and Uint8Array
  const arrayBuffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(arrayBuffer);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported');
  }

  const permission = await Notification.requestPermission();
  return permission;
};

/**
 * Check if service worker is registered
 */
export const isServiceWorkerRegistered = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return !!registration;
  } catch (error) {
    console.error('Error checking service worker registration:', error);
    return false;
  }
};

/**
 * Register service worker
 */
export const registerServiceWorker = async (scriptURL: string = '/service-worker.js'): Promise<ServiceWorkerRegistration> => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers not supported');
  }

  try {
    const registration = await navigator.serviceWorker.register(scriptURL, {
      scope: '/',
      updateViaCache: 'none'
    });

    console.log('Service worker registered successfully:', registration);
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    throw error;
  }
};

/**
 * Get active push subscription
 */
export const getActivePushSubscription = async (): Promise<PushSubscription | null> => {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return null;
    }

    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Error getting push subscription:', error);
    return null;
  }
};

/**
 * Create push subscription
 * Fixed to handle the applicationServerKey type properly
 */
export const createPushSubscription = async (
  vapidPublicKey: string
): Promise<PushSubscription> => {
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    throw new Error('Service worker not registered');
  }

  // Convert the VAPID key to the proper format
  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

  return await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey as BufferSource
  });
};

/**
 * Alternative approach: Create push subscription with explicit type assertion
 */
export const createPushSubscriptionSafe = async (
  vapidPublicKey: string
): Promise<PushSubscription> => {
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    throw new Error('Service worker not registered');
  }

  // Method 1: Direct conversion with proper ArrayBuffer
  const padding = '='.repeat((4 - (vapidPublicKey.length % 4)) % 4);
  const base64 = (vapidPublicKey + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const bytes = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; i++) {
    bytes[i] = rawData.charCodeAt(i);
  }

  return await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: bytes
  });
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPush = async (): Promise<boolean> => {
  try {
    const subscription = await getActivePushSubscription();
    if (!subscription) {
      return true; // Already unsubscribed
    }

    return await subscription.unsubscribe();
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    return false;
  }
};

/**
 * Show a local notification (for testing)
 */
export const showLocalNotification = async (
  title: string,
  options: NotificationOptions = {}
): Promise<void> => {
  if (!isNotificationSupported()) {
    throw new Error('Notifications not supported');
  }

  if (getNotificationPermission() !== 'granted') {
    throw new Error('Notification permission not granted');
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    throw new Error('Service worker not registered');
  }

  const defaultOptions: NotificationOptions = {
    body: 'This is a notification from Eye Center',
    icon: '/logo.png',
    badge: '/badge-icon.png',
    tag: 'eye-center-notification',
    requireInteraction: false,
    ...options
  };

  await registration.showNotification(title, defaultOptions);
};

/**
 * Format date for notification display
 */
export const formatNotificationDate = (date: string | Date): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format time for notification display
 */
export const formatNotificationTime = (time: string): string => {
  // Assuming time is in format "HH:MM" or "HH:MM AM/PM"
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const min = parseInt(minutes, 10);
    
    if (isNaN(hour) || isNaN(min)) {
      return time; // Return original if parsing fails
    }
    
    const date = new Date();
    date.setHours(hour, min, 0, 0);
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return time;
  }
};

/**
 * Get notification permission status text
 */
export const getPermissionStatusText = (permission: NotificationPermission): string => {
  switch (permission) {
    case 'granted':
      return 'Notifications are enabled';
    case 'denied':
      return 'Notifications are blocked';
    case 'default':
      return 'Notification permission not requested';
    default:
      return 'Unknown permission status';
  }
};

/**
 * Get browser support information
 */
export const getBrowserSupportInfo = (): {
  notifications: boolean;
  serviceWorker: boolean;
  pushManager: boolean;
  overall: boolean;
} => {
  return {
    notifications: 'Notification' in window,
    serviceWorker: 'serviceWorker' in navigator,
    pushManager: 'PushManager' in window,
    overall: isNotificationSupported()
  };
};

/**
 * Debug notification setup
 */
export const debugNotificationSetup = async (): Promise<{
  supported: boolean;
  permission: NotificationPermission;
  serviceWorkerRegistered: boolean;
  hasActiveSubscription: boolean;
  browserInfo: ReturnType<typeof getBrowserSupportInfo>;
}> => {
  const supported = isNotificationSupported();
  const permission = getNotificationPermission();
  const serviceWorkerRegistered = await isServiceWorkerRegistered();
  const activeSubscription = await getActivePushSubscription();
  const browserInfo = getBrowserSupportInfo();

  return {
    supported,
    permission,
    serviceWorkerRegistered,
    hasActiveSubscription: !!activeSubscription,
    browserInfo
  };
};

/**
 * Validate push subscription object
 */
export const validatePushSubscription = (subscription: any): boolean => { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!subscription || typeof subscription !== 'object') {
    return false;
  }

  // Check required fields
  if (!subscription.endpoint || typeof subscription.endpoint !== 'string') {
    return false;
  }

  if (!subscription.keys || typeof subscription.keys !== 'object') {
    return false;
  }

  if (!subscription.keys.p256dh || !subscription.keys.auth) {
    return false;
  }

  if (typeof subscription.keys.p256dh !== 'string' || typeof subscription.keys.auth !== 'string') {
    return false;
  }

  return true;
};

/**
 * Get user-friendly error messages
 */
export const getNotificationErrorMessage = (error: Error | string): string => {
  const message = typeof error === 'string' ? error : error.message;
  
  if (message.includes('permission')) {
    return 'Notification permission was denied. Please enable notifications in your browser settings.';
  }
  
  if (message.includes('not supported')) {
    return 'Push notifications are not supported by your browser. Please try using Chrome, Firefox, or Edge.';
  }
  
  if (message.includes('service worker')) {
    return 'There was an issue with the notification service. Please refresh the page and try again.';
  }
  
  if (message.includes('VAPID')) {
    return 'There was a configuration issue. Please contact support if this problem persists.';
  }
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error occurred. Please check your internet connection and try again.';
  }
  
  return 'An unexpected error occurred while setting up notifications. Please try again.';
};