// src/pages/doctor/DoctorSettings.tsx
import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../layout/doctorLayout';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import {
    FaKey,
    FaBell,
    FaEye,
    FaEyeSlash,
    FaSpinner,
    FaUser,
    FaShieldAlt,
    FaToggleOn,
    FaToggleOff,
    FaSave
} from 'react-icons/fa';

interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface NotificationSettings {
    email: boolean;
    sms: boolean;
    appPush: boolean;
}

interface ProfileData {
    name: string;
    email: string;
    speciality: string;
    phoneNumber: string;
    bio: string;
}

const DoctorSettings: React.FC = () => {
    // Password change state
    const [passwordData, setPasswordData] = useState<PasswordFormData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Profile data state
    const [profileData, setProfileData] = useState<ProfileData>({
        name: '',
        email: '',
        speciality: '',
        phoneNumber: '',
        bio: ''
    });

    // Notification settings state
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        email: true,
        sms: true,
        appPush: true
    });

    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingNotifications, setIsSavingNotifications] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const { updateUser } = useAuth();

    // Fetch doctor profile on component mount
    useEffect(() => {
        fetchDoctorProfile();
    }, []);

    const fetchDoctorProfile = async () => {
        try {
            setIsLoadingProfile(true);
            setError('');

            const response = await apiClient.get('/doctors/profile');
            const data = response.data.data;

            setProfileData({
                name: data.name,
                email: data.email,
                speciality: data.speciality || '',
                phoneNumber: data.phoneNumber || '',
                bio: data.bio || ''
            });

            // If notification settings exist in the response, set them
            if (data.notifications) {
                setNotificationSettings({
                    email: data.notifications.email ?? true,
                    sms: data.notifications.sms ?? true,
                    appPush: data.notifications.appPush ?? true
                });
            }
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to load profile:', err);
            setError(err.response?.data?.message || 'Failed to load profile data. Please refresh the page.');
        } finally {
            setIsLoadingProfile(false);
        }
    };

    // Password change handlers
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prevData => ({
            ...prevData,
            [name]: value
        }));

        // Clear error for this field
        if (formErrors[name]) {
            const updatedErrors = { ...formErrors };
            delete updatedErrors[name];
            setFormErrors(updatedErrors);
        }
    };

    const validatePasswordForm = (): boolean => {
        const validationErrors: Record<string, string> = {};
        let isValid = true;

        // Validate current password
        if (!passwordData.currentPassword) {
            validationErrors.currentPassword = 'Current password is required';
            isValid = false;
        }

        // Validate new password
        if (!passwordData.newPassword) {
            validationErrors.newPassword = 'New password is required';
            isValid = false;
        } else if (passwordData.newPassword.length < 6) {
            validationErrors.newPassword = 'New password must be at least 6 characters';
            isValid = false;
        }

        // Validate confirm password
        if (!passwordData.confirmPassword) {
            validationErrors.confirmPassword = 'Please confirm your new password';
            isValid = false;
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            validationErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setFormErrors(validationErrors);
        return isValid;
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError('');

        if (!validatePasswordForm()) return;

        try {
            setIsSubmitting(true);

            await apiClient.put('/doctors/profile/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setSuccessMessage('Password changed successfully');

            // Reset form
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to change password:', err);
            setError(err.response?.data?.message || 'Failed to change password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Profile data handlers
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfileData(prevData => ({
            ...prevData,
            [name]: value
        }));

        // Clear error for this field
        if (formErrors[name]) {
            const updatedErrors = { ...formErrors };
            delete updatedErrors[name];
            setFormErrors(updatedErrors);
        }
    };

    const validateProfileForm = (): boolean => {
        const validationErrors: Record<string, string> = {};
        let isValid = true;

        if (!profileData.name.trim()) {
            validationErrors.name = 'Name is required';
            isValid = false;
        }

        if (!profileData.speciality.trim()) {
            validationErrors.speciality = 'Speciality is required';
            isValid = false;
        }

        // Validate phone number (optional)
        if (profileData.phoneNumber && !/^\+?[0-9\s\-()]{8,20}$/.test(profileData.phoneNumber)) {
            validationErrors.phoneNumber = 'Please enter a valid phone number';
            isValid = false;
        }

        // Validate bio (optional)
        if (profileData.bio && profileData.bio.length > 500) {
            validationErrors.bio = 'Bio must not exceed 500 characters';
            isValid = false;
        }

        setFormErrors(validationErrors);
        return isValid;
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError('');

        if (!validateProfileForm()) return;

        try {
            setIsSavingProfile(true);

            const response = await apiClient.put('/doctors/profile', {
                name: profileData.name,
                speciality: profileData.speciality,
                phoneNumber: profileData.phoneNumber,
                bio: profileData.bio
            });

            // Update user in context if needed
            if (updateUser) {
                updateUser(response.data.data);
            }

            setSuccessMessage('Profile updated successfully');

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to update profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsSavingProfile(false);
        }
    };

    // Notification settings handlers
    const handleNotificationToggle = (setting: keyof NotificationSettings) => {
        setNotificationSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
    };

    const handleNotificationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError('');

        try {
            setIsSavingNotifications(true);

            await apiClient.put('/doctors/profile/notifications', notificationSettings);

            setSuccessMessage('Notification settings updated successfully');

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to update notification settings:', err);
            setError(err.response?.data?.message || 'Failed to update notification settings. Please try again.');
        } finally {
            setIsSavingNotifications(false);
        }
    };

    // Renders a toggle button for notification settings
    const renderToggle = (
        label: string,
        value: boolean,
        onChange: () => void,
        description: string
    ) => (
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div>
                <h3 className="font-medium text-gray-800">{label}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            <button
                type="button"
                onClick={onChange}
                className="focus:outline-none"
                aria-pressed={value}
            >
                {value ? (
                    <FaToggleOn className="text-[#FFB915] text-2xl" />
                ) : (
                    <FaToggleOff className="text-gray-400 text-2xl" />
                )}
            </button>
        </div>
    );

    // Helper function to show alert messages (error or success)
    const renderAlert = () => {
        if (error) {
            return (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                    {error}
                </div>
            );
        }

        if (successMessage) {
            return (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
                    {successMessage}
                </div>
            );
        }

        return null;
    };

    // Tab navigation
    const renderTabNavigation = () => (
        <div className="border-b border-gray-200 mb-6">
            <nav className="flex -mb-px">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                        ? 'border-[#FFB915] text-[#FFB915]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    <FaUser className="inline mr-2" /> Profile
                </button>

                <button
                    onClick={() => setActiveTab('password')}
                    className={`mr-6 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'password'
                        ? 'border-[#FFB915] text-[#FFB915]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    <FaKey className="inline mr-2" /> Password
                </button>

                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'notifications'
                        ? 'border-[#FFB915] text-[#FFB915]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    <FaBell className="inline mr-2" /> Notifications
                </button>
            </nav>
        </div>
    );

    // Profile information form
    const renderProfileForm = () => (
        <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 flex items-center mb-4">
                <FaUser className="mr-2 text-[#FFB915]" /> Personal Information
            </h2>

            {isLoadingProfile ? (
                <div className="flex justify-center py-8">
                    <FaSpinner className="animate-spin text-2xl text-[#FFB915]" />
                </div>
            ) : (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={profileData.name}
                            onChange={handleProfileChange}
                            className={`w-full p-2 border rounded-md ${formErrors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-[#FFB915] focus:border-[#FFB915]`}
                            required
                        />
                        {formErrors.name && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={profileData.email}
                            disabled
                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 focus:ring-[#FFB915] focus:border-[#FFB915]"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Email cannot be changed. Contact administrator for assistance.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="speciality" className="block text-sm font-medium text-gray-700 mb-1">
                            Speciality <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="speciality"
                            name="speciality"
                            value={profileData.speciality}
                            onChange={handleProfileChange}
                            className={`w-full p-2 border rounded-md ${formErrors.speciality ? 'border-red-500' : 'border-gray-300'} focus:ring-[#FFB915] focus:border-[#FFB915]`}
                            required
                        />
                        {formErrors.speciality && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.speciality}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={profileData.phoneNumber}
                            onChange={handleProfileChange}
                            className={`w-full p-2 border rounded-md ${formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'} focus:ring-[#FFB915] focus:border-[#FFB915]`}
                        />
                        {formErrors.phoneNumber && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            rows={4}
                            value={profileData.bio}
                            onChange={handleProfileChange}
                            className={`w-full p-2 border rounded-md ${formErrors.bio ? 'border-red-500' : 'border-gray-300'} focus:ring-[#FFB915] focus:border-[#FFB915]`}
                            placeholder="Tell patients about yourself and your experience..."
                        />
                        {formErrors.bio && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.bio}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            {profileData.bio?.length || 0}/500 characters
                        </p>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSavingProfile}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#FFB915] hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915]"
                        >
                            {isSavingProfile ? (
                                <span className="flex items-center">
                                    <FaSpinner className="animate-spin mr-2" />
                                    Saving...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <FaSave className="mr-2" />
                                    Save Changes
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );

    // Password change form
    const renderPasswordForm = () => (
        <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 flex items-center mb-4">
                <FaKey className="mr-2 text-[#FFB915]" /> Change Password
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="currentPassword"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className={`w-full p-2 pr-10 border rounded-md ${formErrors.currentPassword ? 'border-red-500' : 'border-gray-300'} focus:ring-[#FFB915] focus:border-[#FFB915]`}
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {formErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.currentPassword}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="newPassword"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className={`w-full p-2 pr-10 border rounded-md ${formErrors.newPassword ? 'border-red-500' : 'border-gray-300'} focus:ring-[#FFB915] focus:border-[#FFB915]`}
                            required
                            minLength={6}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {formErrors.newPassword ? (
                        <p className="mt-1 text-sm text-red-600">{formErrors.newPassword}</p>
                    ) : (
                        <p className="mt-1 text-xs text-gray-500">
                            Password must be at least 6 characters long
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className={`w-full p-2 pr-10 border rounded-md ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:ring-[#FFB915] focus:border-[#FFB915]`}
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {formErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                    )}
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#FFB915] hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915]"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center">
                                <FaSpinner className="animate-spin mr-2" />
                                Updating...
                            </span>
                        ) : (
                            'Change Password'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );

    // Notification settings form
    const renderNotificationSettings = () => (
        <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 flex items-center mb-4">
                <FaBell className="mr-2 text-[#FFB915]" /> Notification Preferences
            </h2>

            {isLoadingProfile ? (
                <div className="flex justify-center py-8">
                    <FaSpinner className="animate-spin text-2xl text-[#FFB915]" />
                </div>
            ) : (
                <form onSubmit={handleNotificationSubmit}>
                    {renderToggle(
                        'Email Notifications',
                        notificationSettings.email,
                        () => handleNotificationToggle('email'),
                        'Receive appointment notifications and updates via email'
                    )}

                    {renderToggle(
                        'SMS Notifications',
                        notificationSettings.sms,
                        () => handleNotificationToggle('sms'),
                        'Receive appointment reminders via SMS'
                    )}

                    {renderToggle(
                        'App Notifications',
                        notificationSettings.appPush,
                        () => handleNotificationToggle('appPush'),
                        'Receive in-app push notifications'
                    )}

                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={isSavingNotifications}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#FFB915] hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915]"
                        >
                            {isSavingNotifications ? (
                                <span className="flex items-center">
                                    <FaSpinner className="animate-spin mr-2" />
                                    Saving...
                                </span>
                            ) : (
                                'Save Notification Settings'
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );

    return (
        <DoctorLayout>
            <div className="container mx-auto max-w-3xl">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h1>

                {renderAlert()}

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {renderTabNavigation()}
                    {activeTab === 'profile' && renderProfileForm()}
                    {activeTab === 'password' && renderPasswordForm()}
                    {activeTab === 'notifications' && renderNotificationSettings()}
                </div>

                <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-800 flex items-center mb-4">
                            <FaShieldAlt className="mr-2 text-[#FFB915]" /> Account Security
                        </h2>

                        <div className="border-t border-gray-200 pt-4">
                            <p className="text-sm text-gray-500 mb-2">
                                For security reasons, we recommend changing your password periodically.
                                If you notice any suspicious activity on your account, please contact
                                support immediately.
                            </p>

                            <button
                                onClick={() => setActiveTab('password')}
                                className="text-[#FFB915] hover:text-[#2C4A6B] font-medium text-sm"
                            >
                                Change password now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DoctorLayout>
    );
};

export default DoctorSettings;