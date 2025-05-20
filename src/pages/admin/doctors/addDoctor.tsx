import React, { useState } from 'react';
import { FaSpinner, FaTimes, FaUpload } from 'react-icons/fa';
import apiClient from '../../../api/apiClient';

// Match the Doctor interface from the parent component
interface Doctor {
    _id: string;
    name: string;
    email: string;
    speciality: string;
    phoneNumber?: string;
    bio?: string;
    image?: string;
    isActive: boolean;
    createdAt: string;
}

interface DoctorFormData {
    name: string;
    email: string;
    password: string;
    speciality: string;
    phoneNumber: string;
    bio: string;
    isActive: boolean;
    image?: File | null;
}

// Define proper prop types
interface AddDoctorProps {
    onClose?: () => void;
    onSuccess?: (newDoctor: Doctor) => void;
    isModal?: boolean;
}

const AddDoctor: React.FC<AddDoctorProps> = ({ onClose, onSuccess, isModal = false }) => {
    const [formData, setFormData] = useState<DoctorFormData>({
        name: '',
        email: '',
        password: '',
        speciality: '',
        phoneNumber: '',
        bio: '',
        isActive: true,
        image: null
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Handle form input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        // Handle checkbox (isActive)
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        // Clear error for this field
        if (formErrors[name]) {
            const updatedErrors = { ...formErrors };
            delete updatedErrors[name];
            setFormErrors(updatedErrors);
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

            // Set the image in form data
            setFormData({ ...formData, image: selectedFile });

            // Clear any previous errors
            if (formErrors.image) {
                const updatedErrors = { ...formErrors };
                delete updatedErrors.image;
                setFormErrors(updatedErrors);
            }
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const validationErrors: Record<string, string> = {};
        let isValid = true;

        // Validate name
        if (!formData.name.trim()) {
            validationErrors.name = 'Name is required';
            isValid = false;
        } else if (formData.name.length < 2) {
            validationErrors.name = 'Name must be at least 2 characters';
            isValid = false;
        }

        // Validate email
        if (!formData.email.trim()) {
            validationErrors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            validationErrors.email = 'Please enter a valid email';
            isValid = false;
        }

        // Validate password
        if (!formData.password || formData.password.length < 6) {
            validationErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        // Validate speciality
        if (!formData.speciality.trim()) {
            validationErrors.speciality = 'Speciality is required';
            isValid = false;
        }

        // Validate phone number (optional)
        if (formData.phoneNumber && !/^\+?[0-9\s\-()]{8,20}$/.test(formData.phoneNumber)) {
            validationErrors.phoneNumber = 'Please enter a valid phone number';
            isValid = false;
        }

        // Validate bio (optional)
        if (formData.bio && formData.bio.length > 500) {
            validationErrors.bio = 'Bio must not exceed 500 characters';
            isValid = false;
        }

        setFormErrors(validationErrors);
        return isValid;
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            setError('');

            // Create FormData object for file upload
            const submitFormData = new FormData();
            submitFormData.append('name', formData.name);
            submitFormData.append('email', formData.email);
            submitFormData.append('password', formData.password);
            submitFormData.append('speciality', formData.speciality);
            submitFormData.append('isActive', formData.isActive.toString());

            if (formData.phoneNumber) {
                submitFormData.append('phoneNumber', formData.phoneNumber);
            }

            if (formData.bio) {
                submitFormData.append('bio', formData.bio);
            }

            if (formData.image) {
                submitFormData.append('image', formData.image);
            }

            const response = await apiClient.post('/doctors/admin', submitFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (isModal && onSuccess) {
                // If used as modal, call the onSuccess callback
                onSuccess(response.data.data);
                if (onClose) onClose();
            } else {
                // If used as standalone page, show success message
                setSuccessMessage('Doctor created successfully');
                // Reset form...
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    speciality: '',
                    phoneNumber: '',
                    bio: '',
                    isActive: true,
                    image: null
                });
                setImagePreview(null);
            }
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to create doctor:', err);
            setError(err.response?.data?.message || 'Failed to create doctor. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div
                    className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center bg-gray-50 px-4 py-3">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Doctor</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-4 mt-4">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mx-4 mt-4">
                            {successMessage}
                        </div>
                    )}

                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <form onSubmit={handleSubmit}>
                            {/* Image Upload */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                            <span className="text-gray-400">No image</span>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <label
                                            htmlFor="image-upload"
                                            className="cursor-pointer py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] inline-flex items-center"
                                        >
                                            <FaUpload className="mr-2" />
                                            Upload Image
                                        </label>
                                        <input
                                            id="image-upload"
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

                            <div className="mb-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full p-2 border rounded-md ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {formErrors.name && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full p-2 border rounded-md ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {formErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full p-2 border rounded-md ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {formErrors.password && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="speciality" className="block text-sm font-medium text-gray-700 mb-1">
                                    Speciality <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="speciality"
                                    name="speciality"
                                    value={formData.speciality}
                                    onChange={handleChange}
                                    className={`w-full p-2 border rounded-md ${formErrors.speciality ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {formErrors.speciality && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.speciality}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className={`w-full p-2 border rounded-md ${formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {formErrors.phoneNumber && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                                    Bio
                                </label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows={3}
                                    className={`w-full p-2 border rounded-md ${formErrors.bio ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {formErrors.bio && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.bio}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    {formData.bio?.length || 0}/500 characters
                                </p>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="h-4 w-4 text-[#FFB915] focus:ring-[#FFB915] border-gray-300 rounded"
                                    />
                                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                                        Active
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#FFB915] text-base font-medium text-white hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <FaSpinner className="animate-spin mr-2" />
                                    Creating...
                                </span>
                            ) : (
                                'Create Doctor'
                            )}
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddDoctor;