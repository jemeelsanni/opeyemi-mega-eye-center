// src/components/common/GalleryUploader.tsx
import React, { useState } from 'react';
import { FaUpload, FaTimes, FaImages, FaInfo } from 'react-icons/fa';

interface GalleryUploaderProps {
    onImagesSelected: (files: File[]) => void;
    maxFiles?: number;
    existingImages?: string[];
    className?: string;
}

const GalleryUploader: React.FC<GalleryUploaderProps> = ({
    onImagesSelected,
    maxFiles = 20,
    existingImages = [],
    className = '',
}) => {
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [error, setError] = useState<string>('');

    // Handle image upload selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            // Convert FileList to array
            const filesArray = Array.from(e.target.files);

            // Check if adding these files would exceed the maximum
            if (existingImages.length + newImages.length + filesArray.length > maxFiles) {
                setError(`You can upload a maximum of ${maxFiles} images in total`);
                setTimeout(() => setError(''), 3000);
                return;
            }

            // Check file sizes (max 5MB each)
            const validFiles = filesArray.filter(file => file.size <= 5 * 1024 * 1024);

            if (validFiles.length !== filesArray.length) {
                setError('Some images exceeded the maximum size of 5MB and were not added');
                setTimeout(() => setError(''), 3000);
            }

            // Update state with valid files
            const updatedImages = [...newImages, ...validFiles];
            setNewImages(updatedImages);

            // Call the parent callback
            onImagesSelected(updatedImages);

            // Create previews for valid files
            validFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = () => {
                    setNewImagePreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    // Remove image from upload queue
    const removeNewImage = (index: number) => {
        const updatedImages = newImages.filter((_, i) => i !== index);
        setNewImages(updatedImages);
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));

        // Call the parent callback with updated list
        onImagesSelected(updatedImages);
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700 flex items-center">
                    <FaImages className="mr-2 text-[#FFB915]" />
                    Gallery Images
                    {(existingImages.length > 0 || newImages.length > 0) && (
                        <span className="ml-2 text-sm text-gray-500">
                            ({existingImages.length + newImages.length}/{maxFiles})
                        </span>
                    )}
                </h4>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-600 flex items-start">
                <FaInfo className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                    <p className="mb-1">Upload images to create a gallery for this event.</p>
                    {existingImages && existingImages.length > 0 ? (
                        <p>You can add more images here, or manage the full gallery after saving the event.</p>
                    ) : (
                        <p>After creating the event, you'll be able to rearrange and add captions to images.</p>
                    )}
                </div>
            </div>

            {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-white">
                <FaUpload className="text-gray-400 text-3xl mb-2" />
                <label className="cursor-pointer">
                    <span className="text-[#FFB915] hover:text-[#2C4A6B] font-medium">
                        Choose gallery images
                    </span>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={existingImages.length + newImages.length >= maxFiles}
                    />
                </label>
                <p className="text-xs text-gray-500 text-center mt-1">
                    PNG, JPG, GIF up to 5MB each ({maxFiles - existingImages.length - newImages.length} remaining)
                </p>
            </div>

            {/* Preview of existing images */}
            {existingImages && existingImages.length > 0 && (
                <div>
                    <h5 className="font-medium text-sm text-gray-700 mb-2">Current Gallery:</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {existingImages.slice(0, 8).map((imageUrl, index) => (
                            <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                    <img
                                        src={imageUrl}
                                        alt={`Gallery ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = 'https://via.placeholder.com/150?text=Image';
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                        {existingImages.length > 8 && (
                            <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-100">
                                <span className="text-gray-600 font-medium">+{existingImages.length - 8} more</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Preview of new images */}
            {newImagePreviews.length > 0 && (
                <div>
                    <h5 className="font-medium text-sm text-gray-700 mb-2">New Images to Upload:</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {newImagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                    <img
                                        src={preview}
                                        alt={`New Upload ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <button
                                    onClick={() => removeNewImage(index)}
                                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none"
                                >
                                    <FaTimes className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryUploader;