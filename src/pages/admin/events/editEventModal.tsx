// src/pages/admin/events/editEventModal.tsx
import React, { useState } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUpload, FaTimes, FaSpinner, FaImages } from 'react-icons/fa';
import apiClient, { EventFormData, Event } from '../../../api/apiClient';
import GalleryUploader from '../../../components/common/galleryUploader';

interface EditEventModalProps {
    event: Event;
    onClose: () => void;
    onEventUpdated: (event: Event) => void;
}

const EditEventModal: React.FC<EditEventModalProps> = ({ event, onClose, onEventUpdated }) => {
    const [formData, setFormData] = useState<EventFormData>({
        title: event.title,
        description: event.description,
        shortDescription: event.shortDescription,
        eventDate: new Date(event.eventDate).toISOString().split('T')[0], // Format as YYYY-MM-DD
        eventTime: event.eventTime,
        location: event.location,
        address: event.address,
        featured: event.featured,
        registrationRequired: event.registrationRequired,
        registrationLink: event.registrationLink || '',
        capacity: event.capacity,
        coverImage: null,
        removeCoverImage: false,
        galleryImages: []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(
        event.coverImage || null
    );

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        // Handle checkbox fields
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData({ ...formData, [name]: checked });
        }
        // Handle number fields
        else if (type === 'number') {
            setFormData({ ...formData, [name]: value === '' ? undefined : Number(value) });
        }
        // Handle all other fields
        else {
            setFormData({ ...formData, [name]: value });
        }

        // Clear error when field is updated
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    // Handle cover image upload
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, coverImage: 'Image size should be less than 5MB' });
                return;
            }

            // Create preview URL
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            setFormData({
                ...formData,
                coverImage: file,
                removeCoverImage: false
            });

            // Clear error
            if (errors.coverImage) {
                setErrors({ ...errors, coverImage: '' });
            }
        }
    };

    // Remove cover image preview
    const removeImage = () => {
        setImagePreview(null);
        setFormData({
            ...formData,
            coverImage: null,
            removeCoverImage: true
        });
    };

    // Handle gallery images selection
    const handleGalleryImagesSelected = (files: File[]) => {
        setFormData({ ...formData, galleryImages: files });
    };

    // Validate form
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Required fields
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
        if (!formData.eventDate) newErrors.eventDate = 'Event date is required';
        if (!formData.eventTime.trim()) newErrors.eventTime = 'Event time is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';

        // Additional validations
        if (formData.title.length > 100) newErrors.title = 'Title cannot be more than 100 characters';
        if (formData.shortDescription.length > 200) newErrors.shortDescription = 'Short description cannot be more than 200 characters';

        // Registration link - only required if registration is required
        if (formData.registrationRequired && !formData.registrationLink) {
            newErrors.registrationLink = 'Registration link is required when registration is enabled';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    // Fix for handleSubmit in EditEventModal

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            setSubmitError('');

            // Create a new FormData object for multipart/form-data
            const formDataToSubmit = new FormData();

            // Add text and boolean fields
            Object.entries(formData).forEach(([key, value]) => {
                if (key !== 'coverImage' && key !== 'galleryImages' && value !== undefined) {
                    if (typeof value === 'boolean') {
                        formDataToSubmit.append(key, value.toString());
                    } else if (value !== null) {
                        formDataToSubmit.append(key, value as string);
                    }
                }
            });

            // Add cover image if provided
            if (formData.coverImage) {
                formDataToSubmit.append('coverImage', formData.coverImage);
            }

            // Add removeCoverImage flag if needed
            if (formData.removeCoverImage) {
                formDataToSubmit.append('removeCoverImage', 'true');
            }

            // Add gallery images if provided - IMPORTANT: Use 'images' not 'galleryImages'
            if (formData.galleryImages && formData.galleryImages.length > 0) {
                formData.galleryImages.forEach(image => {
                    formDataToSubmit.append('images', image);
                });
            }

            // Log formData contents for debugging (optional)
            console.log("Form data contains images:", formData.galleryImages?.length || 0);

            // Send the formData directly to the API instead of using eventApi.admin.updateEvent
            const response = await apiClient.put(`/events/admin/${event._id}`, formDataToSubmit, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            onEventUpdated(response.data.data);
            onClose();
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to update event:', err);
            setSubmitError(err.response?.data?.message || 'Failed to update event. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto my-4">
                <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Edit Event</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                        <FaTimes className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {submitError && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                            {submitError}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Event Title <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFB915] focus:ring-[#FFB915] sm:text-sm ${errors.title ? 'border-red-500' : ''}`}
                                    required
                                />
                                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                            </div>

                            {/* Short Description */}
                            <div>
                                <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                    Short Description <span className="text-red-600">*</span>
                                    <span className="text-gray-500 font-normal ml-1">(max 200 chars)</span>
                                </label>
                                <textarea
                                    id="shortDescription"
                                    name="shortDescription"
                                    rows={2}
                                    value={formData.shortDescription}
                                    onChange={handleChange}
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFB915] focus:ring-[#FFB915] sm:text-sm ${errors.shortDescription ? 'border-red-500' : ''}`}
                                    required
                                />
                                {errors.shortDescription && (
                                    <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>
                                )}
                            </div>

                            {/* Full Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Description <span className="text-red-600">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={6}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFB915] focus:ring-[#FFB915] sm:text-sm ${errors.description ? 'border-red-500' : ''}`}
                                    required
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
                                        Event Date <span className="text-red-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaCalendarAlt className="text-gray-400" />
                                        </div>
                                        <input
                                            type="date"
                                            id="eventDate"
                                            name="eventDate"
                                            value={formData.eventDate}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-[#FFB915] focus:ring-[#FFB915] sm:text-sm ${errors.eventDate ? 'border-red-500' : ''}`}
                                            required
                                        />
                                    </div>
                                    {errors.eventDate && (
                                        <p className="mt-1 text-sm text-red-600">{errors.eventDate}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700 mb-1">
                                        Event Time <span className="text-red-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaClock className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="eventTime"
                                            name="eventTime"
                                            placeholder="e.g. 6:00 PM - 9:00 PM"
                                            value={formData.eventTime}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-[#FFB915] focus:ring-[#FFB915] sm:text-sm ${errors.eventTime ? 'border-red-500' : ''}`}
                                            required
                                        />
                                    </div>
                                    {errors.eventTime && (
                                        <p className="mt-1 text-sm text-red-600">{errors.eventTime}</p>
                                    )}
                                </div>
                            </div>

                            {/* Gallery Uploader */}
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-medium text-gray-700 flex items-center">
                                        <FaImages className="mr-2 text-[#FFB915]" />
                                        Gallery Images
                                    </h3>
                                    {event.gallery && event.gallery.length > 0 && (
                                        <span className="text-sm text-gray-500">
                                            {event.gallery.length} image{event.gallery.length !== 1 ? 's' : ''} in gallery
                                        </span>
                                    )}
                                </div>

                                {event.gallery && event.gallery.length > 0 ? (
                                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                        <p className="text-sm text-blue-600 mb-2">
                                            This event has {event.gallery.length} image{event.gallery.length !== 1 ? 's' : ''} in its gallery.
                                        </p>
                                        <p className="text-sm text-blue-600">
                                            Images uploaded here will be added to the existing gallery.
                                            You can rearrange, add captions, or delete images after saving using the Gallery Management tool.
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600 mb-4">
                                        This event doesn't have any gallery images yet. Upload images to create a gallery.
                                    </p>
                                )}

                                <GalleryUploader
                                    onImagesSelected={handleGalleryImagesSelected}
                                    maxFiles={20}
                                    existingImages={event.gallery || []}
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Location */}
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                    Location Name <span className="text-red-600">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaMapMarkerAlt className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        placeholder="e.g. Conference Center"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className={`block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-[#FFB915] focus:ring-[#FFB915] sm:text-sm ${errors.location ? 'border-red-500' : ''}`}
                                        required
                                    />
                                </div>
                                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                            </div>

                            {/* Address */}
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Address <span className="text-red-600">*</span>
                                </label>
                                <textarea
                                    id="address"
                                    name="address"
                                    rows={2}
                                    value={formData.address}
                                    onChange={handleChange}
                                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFB915] focus:ring-[#FFB915] sm:text-sm ${errors.address ? 'border-red-500' : ''}`}
                                    required
                                />
                                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                            </div>

                            {/* Cover Image */}
                            <div>
                                <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
                                    Cover Image
                                </label>

                                {imagePreview ? (
                                    <div className="relative rounded-lg overflow-hidden h-40">
                                        <img
                                            src={imagePreview}
                                            alt="Cover Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none"
                                        >
                                            <FaTimes className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600">
                                                <label
                                                    htmlFor="coverImage"
                                                    className="relative cursor-pointer bg-white rounded-md font-medium text-[#FFB915] hover:text-[#2C4A6B] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#FFB915]"
                                                >
                                                    <span>Upload a file</span>
                                                    <input
                                                        id="coverImage"
                                                        name="coverImage"
                                                        type="file"
                                                        accept="image/*"
                                                        className="sr-only"
                                                        onChange={handleImageChange}
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG, GIF up to 5MB
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {errors.coverImage && (
                                    <p className="mt-1 text-sm text-red-600">{errors.coverImage}</p>
                                )}
                            </div>

                            {/* Registration */}
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="registrationRequired"
                                            name="registrationRequired"
                                            type="checkbox"
                                            checked={formData.registrationRequired}
                                            onChange={handleChange}
                                            className="focus:ring-[#FFB915] h-4 w-4 text-[#FFB915] border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="registrationRequired" className="font-medium text-gray-700">
                                            Registration Required
                                        </label>
                                        <p className="text-gray-500">
                                            Enable this if attendees need to register for the event
                                        </p>
                                    </div>
                                </div>

                                {formData.registrationRequired && (
                                    <>
                                        <div>
                                            <label htmlFor="registrationLink" className="block text-sm font-medium text-gray-700 mb-1">
                                                Registration Link
                                                <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                type="url"
                                                id="registrationLink"
                                                name="registrationLink"
                                                placeholder="https://example.com/register"
                                                value={formData.registrationLink}
                                                onChange={handleChange}
                                                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFB915] focus:ring-[#FFB915] sm:text-sm ${errors.registrationLink ? 'border-red-500' : ''}`}
                                                required={formData.registrationRequired}
                                            />
                                            {errors.registrationLink && (
                                                <p className="mt-1 text-sm text-red-600">{errors.registrationLink}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                                                Event Capacity <span className="text-gray-500">(optional)</span>
                                            </label>
                                            <input
                                                type="number"
                                                id="capacity"
                                                name="capacity"
                                                placeholder="Maximum number of attendees"
                                                min="1"
                                                value={formData.capacity || ''}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFB915] focus:ring-[#FFB915] sm:text-sm"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Featured */}
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="featured"
                                        name="featured"
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={handleChange}
                                        className="focus:ring-[#FFB915] h-4 w-4 text-[#FFB915] border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="featured" className="font-medium text-gray-700">
                                        Featured Event
                                    </label>
                                    <p className="text-gray-500">
                                        Featured events will be displayed prominently on the website
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-5 border-t flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-[#FFB915] text-white rounded-md shadow-sm hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] flex items-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2" />
                                    Updating...
                                </>
                            ) : (
                                <>Save Changes</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditEventModal;