// src/context/NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doctorApi } from '../api/apiClient';

// Types
interface NotificationContextType {
    isSupported: boolean;
    permission: NotificationPermission;
    isEnabled: boolean;
    isProcessing: boolean;
    error: string | null;
    enableNotifications: () => Promise<boolean>;
    disableNotifications: () => Promise<boolean>;
    checkSubscriptionStatus: () => Promise<void>;
    clearError: () => void;
}

interface NotificationProviderProps {
    children: ReactNode;
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Helper function to convert VAPID key - FIXED to avoid TypeScript errors
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    // Create proper ArrayBuffer and Uint8Array to ensure correct buffer type
    const arrayBuffer = new ArrayBuffer(rawData.length);
    const outputArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
};

// Provider component
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isEnabled, setIsEnabled] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if notifications are supported
    useEffect(() => {
        const checkSupport = () => {
            const supported = 'Notification' in window &&
                'serviceWorker' in navigator &&
                'PushManager' in window;

            setIsSupported(supported);

            if (supported) {
                setPermission(Notification.permission);

                // Check existing subscription if permission is granted
                if (Notification.permission === 'granted') {
                    checkSubscriptionStatus();
                }
            } else {
                console.log('Push notifications are not supported in this browser');
            }
        };

        checkSupport();
    }, []);

    // Check subscription status
    const checkSubscriptionStatus = async (): Promise<void> => {
        if (!isSupported) return;

        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                setIsEnabled(false);
                return;
            }

            const subscription = await registration.pushManager.getSubscription();
            setIsEnabled(!!subscription);
        } catch (error) {
            console.error('Error checking subscription status:', error);
            setIsEnabled(false);
        }
    };

    // Enable notifications
    const enableNotifications = async (): Promise<boolean> => {
        if (!isSupported) {
            setError('Push notifications are not supported by your browser');
            return false;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // Request permission if not already granted
            if (Notification.permission !== 'granted') {
                const newPermission = await Notification.requestPermission();
                setPermission(newPermission);

                if (newPermission !== 'granted') {
                    throw new Error('Notification permission not granted');
                }
            }

            // Register service worker if not already registered
            let registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                registration = await navigator.serviceWorker.register('/service-worker.js', {
                    scope: '/'
                });

                // Wait for the service worker to be ready
                await navigator.serviceWorker.ready;
                console.log('Service worker registered successfully');
            }

            // Get VAPID public key from server
            const vapidResponse = await doctorApi.getVapidPublicKey();
            if (!vapidResponse.success || !vapidResponse.publicKey) {
                throw new Error('Failed to get VAPID public key from server');
            }

            // Create push subscription - FIXED: Convert VAPID key and use proper type assertion
            const applicationServerKey = urlBase64ToUint8Array(vapidResponse.publicKey);
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey as BufferSource
            });

            console.log('Push subscription created:', subscription);

            // Save subscription to server
            const saveResponse = await doctorApi.savePushSubscription(subscription.toJSON());
            if (!saveResponse.success) {
                throw new Error(saveResponse.message || 'Failed to save subscription on server');
            }

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
    };

    // Disable notifications
    const disableNotifications = async (): Promise<boolean> => {
        if (!isSupported) {
            setError('Push notifications are not supported');
            return false;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                setIsEnabled(false);
                return true;
            }

            const subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
                setIsEnabled(false);
                return true;
            }

            // Unsubscribe locally
            const success = await subscription.unsubscribe();
            if (!success) {
                throw new Error('Failed to unsubscribe from push notifications');
            }

            // Remove subscription from server
            const response = await doctorApi.deletePushSubscription();
            if (!response.success) {
                console.warn('Failed to remove subscription from server:', response.message);
                // Continue anyway since local unsubscribe was successful
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
    };

    // Clear error
    const clearError = () => {
        setError(null);
    };

    const value: NotificationContextType = {
        isSupported,
        permission,
        isEnabled,
        isProcessing,
        error,
        enableNotifications,
        disableNotifications,
        checkSubscriptionStatus,
        clearError
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

// Custom hook to use notification context
export const useNotificationContext = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
};

export default NotificationContext;