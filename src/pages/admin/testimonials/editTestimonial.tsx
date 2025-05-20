// src/pages/admin/testimonials/editTestimonial.tsx
import React, { useState, useEffect } from 'react';
import { FaStar, FaTimes, FaUpload, FaSpinner, FaUserCircle } from 'react-icons/fa';
import { testimonialApi, Testimonial } from '../../../api/apiClient';

interface EditTestimonialProps {
    testimonial: Testimonial;
    onClose: () => void;
    onSuccess: (updatedTestimonial: Testimonial) => void;
}

// Interface for update data
interface UpdateTestimonialData {
    rating: number;
    review: string;
    name: string;
    position: string;
    isApproved: boolean;
    image?: File;
    removeImage?: boolean;
}

const EditTestimonial: React.FC<EditTestimonialProps> = ({
    testimonial,
    onClose,
    onSuccess
}) => {
    const [formData, setFormData] = useState({
        rating: testimonial.rating,
        review: testimonial.review,
        name: testimonial.name,
        position: testimonial.position,
        isApproved: testimonial.isApproved
    });

    const [newImage, setNewImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(testimonial.image || null);
    const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update form data when testimonial prop changes
    useEffect(() => {
        setFormData({
            rating: testimonial.rating,
            review: testimonial.review,
            name: testimonial.name,
            position: testimonial.position,
            isApproved: testimonial.isApproved
        });
        setImagePreview(testimonial.image || null);
        setRemoveCurrentImage(false);
    }, [testimonial]);

    // Handle form input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        // Clear error for this field
        if (errors[name]) {
            const updatedErrors = { ...errors };
            delete updatedErrors[name];
            setErrors(updatedErrors);
        }
    };

    // Handle rating change
    const handleRatingChange = (rating: number) => {
        setFormData({ ...formData, rating });
    };

    // Handle image upload
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // Validate file size (5MB max)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setErrors({
                    ...errors,
                    image: 'Image size should be less than 5MB'
                });
                return;
            }

            // Validate file type
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
                setErrors({
                    ...errors,
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
            if (errors.image) {
                const updatedErrors = { ...errors };
                delete updatedErrors.image;
                setErrors(updatedErrors);
            }
        }
    };

    // Remove uploaded image
    const handleRemoveImage = () => {
        setImagePreview(null);
        setNewImage(null);
        setRemoveCurrentImage(true);
    };

    // Validate form
    const validateForm = (): boolean => {
        const validationErrors: Record<string, string> = {};
        let isValid = true;

        // Validate name
        if (!formData.name.trim()) {
            validationErrors.name = "Name is required";
            isValid = false;
        }

        // Validate position
        if (!formData.position.trim()) {
            validationErrors.position = "Position/Title is required";
            isValid = false;
        }

        // Validate review
        if (!formData.review.trim()) {
            validationErrors.review = "Review is required";
            isValid = false;
        } else if (formData.review.length > 500) {
            validationErrors.review = "Review must be less than 500 characters";
            isValid = false;
        }

        setErrors(validationErrors);
        return isValid;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsSubmitting(true);

            // Create data object for the API call
            const updateData: UpdateTestimonialData = {
                rating: formData.rating,
                review: formData.review,
                name: formData.name,
                position: formData.position,
                isApproved: formData.isApproved
            };

            // Add image if there's a new one
            if (newImage) {
                updateData.image = newImage;
            }

            // Add removeImage flag if needed
            if (removeCurrentImage) {
                updateData.removeImage = true;
            }

            const response = await testimonialApi.updateTestimonial(testimonial._id, updateData);

            onSuccess(response.data);
            onClose();
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error("Failed to update testimonial:", err);
            setErrors({
                ...errors,
                submit: err.response?.data?.message || "Failed to update testimonial. Please try again."
            });
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
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Testimonial</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Error message */}
                            {errors.submit && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                                    <p className="text-sm text-red-700">{errors.submit}</p>
                                </div>
                            )}

                            {/* Rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rating <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleRatingChange(star)}
                                            className="focus:outline-none"
                                        >
                                            <FaStar
                                                className={`w-8 h-8 ${star <= formData.rating
                                                    ? "text-[#FFB915]"
                                                    : "text-gray-300"
                                                    } cursor-pointer hover:text-[#FFB915]`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Approval Status */}
                            <div>
                                <div className="flex items-center">
                                    <input
                                        id="isApproved"
                                        name="isApproved"
                                        type="checkbox"
                                        checked={formData.isApproved}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-[#FFB915] focus:ring-[#FFB915] border-gray-300 rounded"
                                    />
                                    <label htmlFor="isApproved" className="ml-2 block text-sm text-gray-900">
                                        Approve this testimonial
                                    </label>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    {formData.isApproved
                                        ? "This testimonial will be visible to all users."
                                        : "This testimonial will be hidden from users until approved."}
                                </p>
                            </div>

                            {/* Profile Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Photo
                                </label>
                                <div className="flex items-center">
                                    <div className="h-16 w-16 rounded-full flex-shrink-0 overflow-hidden bg-gray-100 mr-4">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <FaUserCircle className="h-full w-full text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex space-x-2">
                                            <label
                                                htmlFor="testimonial-image-edit"
                                                className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915]"
                                            >
                                                <FaUpload className="mr-2 h-4 w-4 text-gray-500" />
                                                Upload Photo
                                            </label>
                                            {imagePreview && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    <FaTimes className="mr-2 h-4 w-4" />
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            id="testimonial-image-edit"
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
                                {errors.image && (
                                    <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                                )}
                            </div>

                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`block w-full p-2 border ${errors.name ? "border-red-500" : "border-gray-300"
                                        } rounded-md shadow-sm focus:ring-[#FFB915] focus:border-[#FFB915]`}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Position/Title */}
                            <div>
                                <label
                                    htmlFor="position"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Title/Position <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="position"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    className={`block w-full p-2 border ${errors.position ? "border-red-500" : "border-gray-300"
                                        } rounded-md shadow-sm focus:ring-[#FFB915] focus:border-[#FFB915]`}
                                />
                                {errors.position && (
                                    <p className="mt-1 text-sm text-red-600">{errors.position}</p>
                                )}
                            </div>

                            {/* Review */}
                            <div>
                                <label
                                    htmlFor="review"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Review <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="review"
                                    name="review"
                                    rows={4}
                                    value={formData.review}
                                    onChange={handleChange}
                                    className={`block w-full p-2 border ${errors.review ? "border-red-500" : "border-gray-300"
                                        } rounded-md shadow-sm focus:ring-[#FFB915] focus:border-[#FFB915]`}
                                />
                                {errors.review ? (
                                    <p className="mt-1 text-sm text-red-600">{errors.review}</p>
                                ) : (
                                    <p className="mt-1 text-xs text-gray-500">
                                        {formData.review.length}/500 characters
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#FFB915] text-base font-medium text-white hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <FaSpinner className="animate-spin mr-2" />
                                    Updating...
                                </span>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditTestimonial;