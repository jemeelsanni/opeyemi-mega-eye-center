// src/pages/home/testimonialModal.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaTimes, FaUpload, FaSpinner, FaUserCircle } from "react-icons/fa";
import { testimonialApi, TestimonialFormData } from "../../api/apiClient";

interface TestimonialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TestimonialModal: React.FC<TestimonialModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState<TestimonialFormData>({
        rating: 5,
        review: "",
        name: "",
        position: "",
        image: null,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Handle form input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

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
            setFormData({ ...formData, image: selectedFile });

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
        setFormData({ ...formData, image: null });
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
            validationErrors.review = "Please share your experience";
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

            const response = await testimonialApi.submitTestimonial(formData);

            setSuccessMessage(response.message || "Thank you for your testimonial! It will be reviewed and posted soon.");

            // Reset form after successful submission
            setTimeout(() => {
                setFormData({
                    rating: 5,
                    review: "",
                    name: "",
                    position: "",
                    image: null,
                });
                setImagePreview(null);
                onClose();
                setSuccessMessage("");
            }, 3000);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error("Failed to submit testimonial:", err);
            setErrors({
                ...errors,
                submit: err.response?.data?.message || "Failed to submit testimonial. Please try again."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Close modal with ESC key
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            window.addEventListener("keydown", handleEsc);
            // Prevent background scrolling
            document.body.style.overflow = "hidden";
        }

        return () => {
            window.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "auto";
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-lg p-6 mx-4 bg-white rounded-lg shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            <FaTimes className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Share Your Experience</h2>

                        {successMessage ? (
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="h-5 w-5 text-green-500"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-green-800">{successMessage}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
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
                                        Your Rating <span className="text-red-500">*</span>
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

                                {/* Profile Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Photo (optional)
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
                                            {!imagePreview ? (
                                                <label
                                                    htmlFor="testimonial-image"
                                                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915]"
                                                >
                                                    <FaUpload className="mr-2 h-4 w-4 text-gray-500" />
                                                    Upload Photo
                                                </label>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    <FaTimes className="mr-2 h-4 w-4" />
                                                    Remove Photo
                                                </button>
                                            )}
                                            <input
                                                id="testimonial-image"
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
                                        Your Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`block w-full p-3 border ${errors.name ? "border-red-500" : "border-gray-300"
                                            } rounded-md shadow-sm focus:ring-[#FFB915] focus:border-[#FFB915]`}
                                        placeholder="John Doe"
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
                                        Your Title/Position <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="position"
                                        name="position"
                                        value={formData.position}
                                        onChange={handleChange}
                                        className={`block w-full p-3 border ${errors.position ? "border-red-500" : "border-gray-300"
                                            } rounded-md shadow-sm focus:ring-[#FFB915] focus:border-[#FFB915]`}
                                        placeholder="Software Engineer"
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
                                        Your Experience <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="review"
                                        name="review"
                                        rows={4}
                                        value={formData.review}
                                        onChange={handleChange}
                                        className={`block w-full p-3 border ${errors.review ? "border-red-500" : "border-gray-300"
                                            } rounded-md shadow-sm focus:ring-[#FFB915] focus:border-[#FFB915]`}
                                        placeholder="Share your experience with our services..."
                                    />
                                    {errors.review ? (
                                        <p className="mt-1 text-sm text-red-600">{errors.review}</p>
                                    ) : (
                                        <p className="mt-1 text-xs text-gray-500">
                                            {formData.review.length}/500 characters
                                        </p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 mr-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#FFB915] border border-transparent rounded-md shadow-sm hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915]"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            "Submit Testimonial"
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TestimonialModal;