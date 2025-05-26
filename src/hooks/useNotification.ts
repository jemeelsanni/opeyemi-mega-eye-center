// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { doctorApi } from '../api/apiClient';
import { urlBase64ToUint8Array, isNotificationSupported } from '../utils/notificationHelpers';

interface UseNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isEnabled: boolean;
  isProcessing: boolean;
  error: string | null;
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<boolean>;
  checkSubscriptionStatus: () => Promise<void>;
  clearError: () => void;
  requestTestNotification: () => Promise<boolean>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize on mount
  useEffect(() => {
    const supported = isNotificationSupported();
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      
      // Check existing subscription if permission is granted
      if (Notification.permission === 'granted') {
        checkSubscriptionStatus();
      }
    }
  }, []);

  // Check if there's an active subscription
  const checkSubscriptionStatus = useCallback(async (): Promise<void> => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setIsEnabled(false);
        return;
      }

      const subscription = await registration.pushManager.getSubscription();
      setIsEnabled(!!subscription);
      
      if (subscription) {
        console.log('Active push subscription found');
      } else {
        console.log('No active push subscription');
      }
    } catch (err) {
      console.error('Error checking subscription status:', err);
      setIsEnabled(false);
    }
  }, [isSupported]);

  // Enable push notifications
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported by your browser');
      return false;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Request permission
      if (Notification.permission !== 'granted') {
        console.log('Requesting notification permission...');
        const newPermission = await Notification.requestPermission();
        setPermission(newPermission);

        if (newPermission !== 'granted') {
          throw new Error('Notification permission was denied');
        }
        console.log('Notification permission granted');
      }

      // Step 2: Register service worker
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.log('Registering service worker...');
        registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
          updateViaCache: 'none'
        });
        
        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        console.log('Service worker registered and ready');
      } else {
        console.log('Service worker already registered');
      }

      // Step 3: Get VAPID public key
      console.log('Getting VAPID public key from server...');
      const vapidResponse = await doctorApi.getVapidPublicKey();
      if (!vapidResponse.success || !vapidResponse.publicKey) {
        throw new Error('Failed to get VAPID public key from server');
      }
      console.log('VAPID public key received');

      // Step 4: Subscribe to push manager
      console.log('Creating push subscription...');
      // FIXED: Convert VAPID key and use proper type assertion
      const applicationServerKey = urlBase64ToUint8Array(vapidResponse.publicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource
      });
      console.log('Push subscription created successfully');

      // Step 5: Save subscription to server
      console.log('Saving subscription to server...');
      const saveResponse = await doctorApi.savePushSubscription(subscription.toJSON());
      if (!saveResponse.success) {
        throw new Error(saveResponse.message || 'Failed to save subscription on server');
      }
      console.log('Subscription saved to server successfully');

      setIsEnabled(true);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable push notifications';
      setError(errorMessage);
      console.error('Error enabling push notifications:', err);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [isSupported]);

  // Disable push notifications
  const disableNotifications = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return false;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.log('No service worker registration found');
        setIsEnabled(false);
        return true;
      }

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        console.log('No active subscription found');
        setIsEnabled(false);
        return true;
      }

      // Unsubscribe locally
      console.log('Unsubscribing from push notifications...');
      const success = await subscription.unsubscribe();
      if (!success) {
        throw new Error('Failed to unsubscribe from push notifications');
      }
      console.log('Successfully unsubscribed locally');

      // Remove subscription from server
      console.log('Removing subscription from server...');
      const response = await doctorApi.deletePushSubscription();
      if (!response.success) {
        console.warn('Failed to remove subscription from server:', response.message);
        // Continue anyway since local unsubscribe was successful
      } else {
        console.log('Subscription removed from server successfully');
      }

      setIsEnabled(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disable push notifications';
      setError(errorMessage);
      console.error('Error disabling push notifications:', err);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [isSupported]);

  // Request a test notification
  const requestTestNotification = useCallback(async (): Promise<boolean> => {
    if (!isEnabled) {
      setError('Notifications are not enabled');
      return false;
    }

    try {
      // Show a local test notification
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        throw new Error('Service worker not registered');
      }

      await registration.showNotification('Test Notification', {
        body: 'This is a test notification from Eye Center',
        icon: '/logo.png',
        badge: '/badge-icon.png',
        tag: 'test-notification',
        requireInteraction: false,
        data: {
          url: '/doctor/dashboard',
          type: 'test'
        }
      });

      console.log('Test notification sent');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send test notification';
      setError(errorMessage);
      console.error('Error sending test notification:', err);
      return false;
    }
  }, [isEnabled]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isSupported,
    permission,
    isEnabled,
    isProcessing,
    error,
    enableNotifications,
    disableNotifications,
    checkSubscriptionStatus,
    clearError,
    requestTestNotification
  };
};