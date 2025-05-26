// src/pages/doctor/DoctorDashboard.tsx
import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../layout/doctorLayout';
import { doctorApi } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { FaBell, FaBellSlash, FaSpinner } from 'react-icons/fa';

interface Appointment {
    appointmentDate: string;  // ISO date string that can be parsed with new Date()
    status: string;           // Values include at least 'confirmed' and 'pending'
    // Other properties are likely present but not used in this code snippet
}

const DoctorDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        upcomingAppointments: 0,
        todayAppointments: 0,
        confirmedAppointments: 0,
        pendingAppointments: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    // Push notification states
    const [notificationsSupported, setNotificationsSupported] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'default'>('default');
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [isProcessingNotification, setIsProcessingNotification] = useState(false);

    useEffect(() => {
        fetchDashboardData();

        // Check if push notifications are supported by this browser
        if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
            setNotificationsSupported(true);
            setNotificationPermission(Notification.permission);

            // If permission is already granted, check if we have an active subscription
            if (Notification.permission === 'granted') {
                checkExistingSubscription();
            }
        } else {
            console.log('Push notifications are not supported in this browser');
        }
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const response = await doctorApi.appointments.getAppointments();
            const appointments: Appointment[] = response.data;

            // Now TypeScript will know the type of 'app' in these filter functions
            const today = new Date().toISOString().split('T')[0];
            const upcoming = appointments.filter((app: Appointment) =>
                new Date(app.appointmentDate).toISOString().split('T')[0] >= today
            ).length;

            const todayApps = appointments.filter((app: Appointment) =>
                new Date(app.appointmentDate).toISOString().split('T')[0] === today
            ).length;

            const confirmed = appointments.filter((app: Appointment) => app.status === 'confirmed').length;
            const pending = appointments.filter((app: Appointment) => app.status === 'pending').length;

            setStats({
                upcomingAppointments: upcoming,
                todayAppointments: todayApps,
                confirmedAppointments: confirmed,
                pendingAppointments: pending
            });
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Check if we already have a push notification subscription
    const checkExistingSubscription = async () => {
        try {
            // First check if service worker is registered
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                console.log('No service worker registered yet');
                return;
            }

            // Check if we have an active push subscription
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                console.log('Existing push subscription found', subscription);
                setNotificationsEnabled(true);
            } else {
                console.log('No push subscription found');
                setNotificationsEnabled(false);
            }
        } catch (error) {
            console.error('Error checking for existing subscription:', error);
        }
    };

    // Enable push notifications
    const enableNotifications = async () => {
        setIsProcessingNotification(true);

        try {
            // Request permission if not already granted
            if (Notification.permission !== 'granted') {
                const permission = await Notification.requestPermission();
                setNotificationPermission(permission);

                if (permission !== 'granted') {
                    throw new Error('Notification permission not granted');
                }
            }

            // Register service worker if not already registered
            let registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service worker registered successfully');
            }

            // Get VAPID public key from server
            const vapidResponse = await doctorApi.getVapidPublicKey();
            if (!vapidResponse.success || !vapidResponse.publicKey) {
                throw new Error('Failed to get VAPID public key from server');
            }

            // Create push subscription with proper applicationServerKey
            const applicationServerKey = urlBase64ToUint8Array(vapidResponse.publicKey);
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey as BufferSource
            });

            // Save subscription to server
            const saveResponse = await doctorApi.savePushSubscription(subscription);
            if (!saveResponse.success) {
                throw new Error(saveResponse.message || 'Failed to save subscription on server');
            }

            // Update state
            setNotificationsEnabled(true);
            alert('Push notifications enabled! You will now receive alerts for new appointments.');
        } catch (error) {
            console.error('Error enabling push notifications:', error);
            alert(error instanceof Error ? error.message : 'Failed to enable push notifications');
        } finally {
            setIsProcessingNotification(false);
        }
    };

    // Disable push notifications
    const disableNotifications = async () => {
        setIsProcessingNotification(true);

        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                throw new Error('No service worker registered');
            }

            const subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
                // No subscription to remove
                setNotificationsEnabled(false);
                return;
            }

            // Unsubscribe locally
            const success = await subscription.unsubscribe();
            if (!success) {
                throw new Error('Failed to unsubscribe from push notifications');
            }

            // Remove subscription from server
            const response = await doctorApi.deletePushSubscription();
            if (!response.success) {
                throw new Error(response.message || 'Failed to remove subscription from server');
            }

            // Update state
            setNotificationsEnabled(false);
            alert('Push notifications disabled successfully.');
        } catch (error) {
            console.error('Error disabling push notifications:', error);
            alert(error instanceof Error ? error.message : 'Failed to disable push notifications');
        } finally {
            setIsProcessingNotification(false);
        }
    };

    // Helper function to convert base64 string to Uint8Array for applicationServerKey
    // FIXED: Properly create ArrayBuffer to avoid TypeScript errors
    const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        // Create proper ArrayBuffer and Uint8Array
        const arrayBuffer = new ArrayBuffer(rawData.length);
        const outputArray = new Uint8Array(arrayBuffer);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    };

    return (
        <DoctorLayout>
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Doctor Dashboard</h1>

                    {/* Push Notification Button */}
                    {notificationsSupported && (
                        <button
                            onClick={notificationsEnabled ? disableNotifications : enableNotifications}
                            disabled={isProcessingNotification}
                            className={`inline-flex items-center px-4 py-2 rounded-md transition-colors ${isProcessingNotification
                                ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                                : notificationsEnabled
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-[#FFB915] text-white hover:bg-[#E6A813]'
                                }`}
                        >
                            {isProcessingNotification ? (
                                <>
                                    <FaSpinner className="mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : notificationsEnabled ? (
                                <>
                                    <FaBellSlash className="mr-2" />
                                    Disable Notifications
                                </>
                            ) : (
                                <>
                                    <FaBell className="mr-2" />
                                    Enable Notifications
                                </>
                            )}
                        </button>
                    )}
                </div>

                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Welcome, Dr. {user?.name || user?.fullName}!</h2>
                    <p className="text-gray-600">
                        Here's an overview of your appointments and schedule.
                    </p>
                </div>

                {/* Notification Information Card */}
                {notificationsSupported && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">Appointment Notifications</h3>
                        <p className="text-gray-600 mb-4">
                            {notificationsEnabled
                                ? 'You will receive push notifications when patients book new appointments with you.'
                                : 'Enable push notifications to be alerted when new appointments are booked.'}
                        </p>

                        {notificationPermission === 'denied' && (
                            <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md">
                                <p className="font-medium">Notifications are blocked by your browser</p>
                                <p className="text-sm mt-1">
                                    You need to allow notifications in your browser settings to receive appointment alerts.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFB915]"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Today's Appointments</h3>
                            <p className="text-3xl font-bold text-[#FFB915]">{stats.todayAppointments}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Upcoming Appointments</h3>
                            <p className="text-3xl font-bold text-[#FFB915]">{stats.upcomingAppointments}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Confirmed</h3>
                            <p className="text-3xl font-bold text-green-600">{stats.confirmedAppointments}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Pending</h3>
                            <p className="text-3xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
                        </div>
                    </div>
                )}
            </div>
        </DoctorLayout>
    );
};

export default DoctorDashboard;