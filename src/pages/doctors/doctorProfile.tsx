import React, { useState, useEffect } from 'react';
import {
    FaEnvelope,
    FaPhone,
    FaEdit,
    FaSpinner,
    FaSave,
    FaEye,
    FaEyeSlash,
    FaUpload,
    FaTrash,
    FaUserMd
} from 'react-icons/fa';
import DoctorLayout from '../../layout/doctorLayout';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

interface DoctorProfileData {
    name: string;
    email: string;
    speciality: string;
    phoneNumber?: string;
    bio?: string;
    image?: string;
}

interface PasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    speciality?: string;
    phoneNumber?: string;
    bio?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    image?: string;
}

const DoctorProfile: React.FC = () => {
    const [profileData, setProfileData] = useState<DoctorProfileData>({
        name: '',
        email: '',
        speciality: '',
        phoneNumber: '',
        bio: '',
        image: ''
    });

    const [passwordData, setPasswordData] = useState<PasswordData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [newImage, setNewImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

    const { updateUser } = useAuth();

    useEffect(() => {
        fetchDoctorProfile();
    }, []);

    const fetchDoctorProfile = async () => {
        try {
            setIsLoading(true);
            setError('');

            const response = await apiClient.get('/doctors/profile');
            const data = response.data.data;

            setProfileData({
                name: data.name,
                email: data.email,
                speciality: data.speciality,
                phoneNumber: data.phoneNumber || '',
                bio: data.bio || '',
                image: data.image || ''
            });

            setImagePreview(data.image || null);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to fetch doctor profile:', err);
            setError(err.response?.data?.message || 'Failed to load profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setProfileData({ ...profileData, [name]: value });

        // Clear error for this field
        if (formErrors[name as keyof FormErrors]) {
            setFormErrors({ ...formErrors, [name]: undefined });
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setPasswordData({ ...passwordData, [name]: value });

        // Clear error for this field
        if (formErrors[name as keyof FormErrors]) {
            setFormErrors({ ...formErrors, [name]: undefined });
        }
    };

    // Handle image upload
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // Validate file size (5MB max)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setFormErrors({
                    ...formErrors,
                    image: 'Image size should be less than 5MB'
                });
                return;
            }

            // Validate file type
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
                setFormErrors({
                    ...formErrors,
                    image: 'Only JPG, JPEG, and PNG images are allowed'
                });
                return;
            }

            // Set image preview
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);

            // Set the image
            setNewImage(selectedFile);
            setRemoveCurrentImage(false);

            // Clear any previous errors
            if (formErrors.image) {
                const updatedErrors = { ...formErrors };
                delete updatedErrors.image;
                setFormErrors(updatedErrors);
            }
        }
    };

    // Remove current image
    const handleRemoveImage = () => {
        setImagePreview(null);
        setNewImage(null);
        setRemoveCurrentImage(true);
    };

    const validateProfileForm = (): boolean => {
        const errors: FormErrors = {};
        let isValid = true;

        // Validate name
        if (!profileData.name.trim()) {
            errors.name = 'Name is required';
            isValid = false;
        }

        // Validate speciality
        if (!profileData.speciality.trim()) {
            errors.speciality = 'Speciality is required';
            isValid = false;
        }

        // Validate phone number (optional)
        if (profileData.phoneNumber && !/^\+?[0-9\s\-()]{8,20}$/.test(profileData.phoneNumber)) {
            errors.phoneNumber = 'Please enter a valid phone number';
            isValid = false;
        }

        // Validate bio (optional)
        if (profileData.bio && profileData.bio.length > 500) {
            errors.bio = 'Bio must not exceed 500 characters';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const validatePasswordForm = (): boolean => {
        const errors: FormErrors = {};
        let isValid = true;

        // Validate current password
        if (!passwordData.currentPassword) {
            errors.currentPassword = 'Current password is required';
            isValid = false;
        }

        // Validate new password
        if (!passwordData.newPassword) {
            errors.newPassword = 'New password is required';
            isValid = false;
        } else if (passwordData.newPassword.length < 6) {
            errors.newPassword = 'New password must be at least 6 characters';
            isValid = false;
        }

        // Validate confirm password
        if (!passwordData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your new password';
            isValid = false;
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const saveProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateProfileForm()) return;

        try {
            setIsSaving(true);
            setError('');

            // Create FormData object for file upload
            const formData = new FormData();
            formData.append('name', profileData.name);
            formData.append('speciality', profileData.speciality);

            if (profileData.phoneNumber) {
                formData.append('phoneNumber', profileData.phoneNumber);
            }

            if (profileData.bio) {
                formData.append('bio', profileData.bio);
            }

            // Handle image
            if (newImage) {
                formData.append('image', newImage);
            }

            // If user wants to remove the image
            if (removeCurrentImage) {
                formData.append('removeImage', 'true');
            }

            const response = await apiClient.put('/doctors/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            // Update user in context if needed
            if (updateUser) {
                updateUser(response.data.data);
            }

            setSuccessMessage('Profile updated successfully');
            setIsEditing(false);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);

            // Refresh profile data
            fetchDoctorProfile();
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to update profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const changePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePasswordForm()) return;

        try {
            setIsSaving(true);
            setError('');

            await apiClient.put('/doctors/profile/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setSuccessMessage('Password changed successfully');
            setIsChangingPassword(false);

            // Reset password fields
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
            setIsSaving(false);
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        fetchDoctorProfile(); // Reset to original data
        setFormErrors({});
        setNewImage(null);
        setRemoveCurrentImage(false);
    };

    const cancelPasswordChange = () => {
        setIsChangingPassword(false);
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setFormErrors({});
    };

    return (
        <DoctorLayout>
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Doctor Profile</h1>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
                        {successMessage}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFB915]"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>

                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-[#FFB915] hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915]"
                                    >
                                        <FaEdit className="mr-1" /> Edit Profile
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <form onSubmit={saveProfile}>
                                    {/* Profile Image */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Profile Image
                                        </label>
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center mr-4">
                                                {imagePreview ? (
                                                    <img
                                                        src={imagePreview}
                                                        alt="Profile Preview"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <FaUserMd className="text-gray-400 text-3xl" />
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex space-x-2">
                                                    <label
                                                        htmlFor="profile-image-upload"
                                                        className="cursor-pointer py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] inline-flex items-center"
                                                    >
                                                        <FaUpload className="mr-2" />
                                                        Upload Image
                                                    </label>
                                                    {imagePreview && (
                                                        <button
                                                            type="button"
                                                            onClick={handleRemoveImage}
                                                            className="py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 inline-flex items-center"
                                                        >
                                                            <FaTrash className="mr-2" />
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <input
                                                    id="profile-image-upload"
                                                    name="image"
                                                    type="file"
                                                    accept="image/jpeg, image/png, image/jpg"
                                                    onChange={handleImageChange}
                                                    className="sr-only"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    JPG, JPEG or PNG. Max 5MB.
                                                </p>
                                            </div>
                                        </div>
                                        {formErrors.image && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.image}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                                                className={`w-full p-2 border rounded-md ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            />
                                            {formErrors.name && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={profileData.email}
                                                disabled
                                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
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
                                                className={`w-full p-2 border rounded-md ${formErrors.speciality ? 'border-red-500' : 'border-gray-300'
                                                    }`}
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
                                                type="text"
                                                id="phoneNumber"
                                                name="phoneNumber"
                                                value={profileData.phoneNumber}
                                                onChange={handleProfileChange}
                                                className={`w-full p-2 border rounded-md ${formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            />
                                            {formErrors.phoneNumber && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                                            Bio
                                        </label>
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            rows={4}
                                            value={profileData.bio}
                                            onChange={handleProfileChange}
                                            className={`w-full p-2 border rounded-md ${formErrors.bio ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Tell patients about yourself and your experience..."
                                        />
                                        {formErrors.bio && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.bio}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            {profileData.bio?.length || 0}/500 characters
                                        </p>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] mr-3"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#FFB915] hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915]"
                                        >
                                            {isSaving ? (
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
                            ) : (
                                <div>
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6">
                                        <div className="flex-shrink-0 h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 mb-4 sm:mb-0 sm:mr-6">
                                            {profileData.image ? (
                                                <img
                                                    src={profileData.image}
                                                    alt={profileData.name}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.onerror = null;
                                                        target.src = 'https://via.placeholder.com/200?text=No+Image';
                                                    }}
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-[#FFB915]/10">
                                                    <FaUserMd className="text-[#FFB915] text-3xl" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">{profileData.name}</h3>
                                            <p className="text-[#FFB915] font-medium">{profileData.speciality}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                            <p className="mt-1 text-sm text-gray-900 flex items-center">
                                                <FaEnvelope className="mr-1 text-gray-400" />
                                                {profileData.email}
                                            </p>
                                        </div>

                                        {profileData.phoneNumber && (
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                                                <p className="mt-1 text-sm text-gray-900 flex items-center">
                                                    <FaPhone className="mr-1 text-gray-400" />
                                                    {profileData.phoneNumber}
                                                </p>
                                            </div>
                                        )}

                                        {profileData.bio && (
                                            <div className="sm:col-span-2">
                                                <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                                                <p className="mt-1 text-sm text-gray-900">{profileData.bio}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium text-gray-900">Security</h2>

                                {!isChangingPassword && (
                                    <button
                                        onClick={() => setIsChangingPassword(true)}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915]"
                                    >
                                        Change Password
                                    </button>
                                )}
                            </div>

                            {isChangingPassword && (
                                <form onSubmit={changePassword} className="mt-4">
                                    <div className="space-y-4">
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
                                                    className={`w-full p-2 pl-3 pr-10 border rounded-md ${formErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
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
                                                    className={`w-full p-2 pl-3 pr-10 border rounded-md ${formErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                                </button>
                                            </div>
                                            {formErrors.newPassword && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.newPassword}</p>
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
                                                    className={`w-full p-2 pl-3 pr-10 border rounded-md ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                                </button>
                                            </div>
                                            {formErrors.confirmPassword && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                                            )}
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={cancelPasswordChange}
                                                className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] mr-3"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#FFB915] hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915]"
                                            >
                                                {isSaving ? (
                                                    <span className="flex items-center">
                                                        <FaSpinner className="animate-spin mr-2" />
                                                        Updating...
                                                    </span>
                                                ) : (
                                                    'Change Password'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DoctorLayout>
    );
};

export default DoctorProfile;