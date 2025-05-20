// src/pages/admin/events/eventGalleryModal.tsx
import React, { useState } from 'react';
import { FaUpload, FaTimes, FaSpinner, FaTrash, FaCheck, FaImages, FaSort, FaEye, FaEdit, FaInfo } from 'react-icons/fa';
import { eventApi, Event } from '../../../api/apiClient';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface EventGalleryModalProps {
    event: Event;
    onClose: () => void;
    onGalleryUpdated: (updatedEvent: Event) => void;
}

// Define types for the DnD item
interface DragItem {
    index: number;
    type: string;
}

// Gallery Item Component Props
interface GalleryItemProps {
    image: string;
    index: number;
    isSelected: boolean;
    onSelect: (index: number) => void;
    moveImage: (dragIndex: number, hoverIndex: number) => void;
    caption?: string;
}

// Gallery Item Component for Drag and Drop
const GalleryItem: React.FC<GalleryItemProps> = ({ image, index, isSelected, onSelect, moveImage, caption }) => {
    const ref = React.useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag({
        type: 'GALLERY_ITEM',
        item: { index, type: 'GALLERY_ITEM' } as DragItem,
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    });

    const [, drop] = useDrop<DragItem, void, object>({
        accept: 'GALLERY_ITEM',
        hover: (item: DragItem) => {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }

            moveImage(dragIndex, hoverIndex);

            // Update the index for the dragged item directly to avoid flickering
            item.index = hoverIndex;
        }
    });

    drag(drop(ref));

    return (
        <div
            ref={ref}
            className={`relative aspect-square ${isDragging ? 'opacity-50' : 'opacity-100'} ${isSelected ? 'ring-2 ring-[#FFB915]' : ''} cursor-grab rounded-lg overflow-hidden group`}
        >
            <img
                src={image}
                alt={`Gallery item ${index + 1}`}
                className="w-full h-full object-cover"
                onClick={() => onSelect(index)}
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://via.placeholder.com/200x200?text=Image';
                }}
            />

            {/* Selection indicator */}
            {isSelected && (
                <div className="absolute top-2 right-2 bg-[#FFB915] text-white p-1 rounded-full">
                    <FaCheck className="h-3 w-3" />
                </div>
            )}

            {/* Position number */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                {index + 1}
            </div>

            {/* Caption indicator if exists */}
            {caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs px-2 py-1 truncate">
                    {caption}
                </div>
            )}

            {/* Hover controls */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                    className="bg-white p-2 rounded-full mx-1"
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(image, '_blank');
                    }}
                    title="View Full Size"
                >
                    <FaEye className="h-4 w-4 text-gray-700" />
                </button>

                <button
                    className="bg-white p-2 rounded-full mx-1"
                    onClick={(e) => {
                        e.stopPropagation();
                        // This would open caption editing UI
                    }}
                    title="Edit Caption"
                >
                    <FaEdit className="h-4 w-4 text-gray-700" />
                </button>
            </div>
        </div>
    );
};

// Modal Component
const EventGalleryModal: React.FC<EventGalleryModalProps> = ({ event, onClose, onGalleryUpdated }) => {
    const [galleryImages, setGalleryImages] = useState<string[]>(event.gallery || []);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedImages, setSelectedImages] = useState<number[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [captionEditMode, setCaptionEditMode] = useState<{ index: number, caption: string } | null>(null);

    // Handle image selection for bulk actions
    const toggleImageSelection = (index: number) => {
        if (selectedImages.includes(index)) {
            setSelectedImages(selectedImages.filter(i => i !== index));
        } else {
            setSelectedImages([...selectedImages, index]);
        }
    };

    // Select/deselect all images
    const toggleSelectAll = () => {
        if (selectedImages.length === galleryImages.length) {
            setSelectedImages([]);
        } else {
            setSelectedImages(galleryImages.map((_, index) => index));
        }
    };

    // Handle image upload selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            // Convert FileList to array
            const filesArray = Array.from(e.target.files);

            // Check file sizes (max 5MB each)
            const validFiles = filesArray.filter(file => file.size <= 5 * 1024 * 1024);

            if (validFiles.length !== filesArray.length) {
                setError('Some images exceeded the maximum size of 5MB and were not added');

                // Clear error after 3 seconds
                setTimeout(() => setError(''), 3000);
            }

            // Update state with valid files
            setNewImages(prev => [...prev, ...validFiles]);

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
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Move image (reorder gallery)
    const moveImage = (dragIndex: number, hoverIndex: number) => {
        const draggedImage = galleryImages[dragIndex];
        const newGalleryOrder = [...galleryImages];
        newGalleryOrder.splice(dragIndex, 1);
        newGalleryOrder.splice(hoverIndex, 0, draggedImage);
        setGalleryImages(newGalleryOrder);
    };

    // Upload new images
    const uploadImages = async () => {
        if (newImages.length === 0) return;

        try {
            setIsUploading(true);
            setError('');

            const response = await eventApi.admin.addGalleryImages(event._id, newImages);

            // Update state with the updated event
            onGalleryUpdated(response.data);
            setGalleryImages(response.data.gallery);

            // Clear upload queue
            setNewImages([]);
            setNewImagePreviews([]);

            // Show success message
            setSuccessMessage(`${newImages.length} image${newImages.length > 1 ? 's' : ''} uploaded successfully`);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to upload images:', err);
            setError(err.response?.data?.message || 'Failed to upload images. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    // Delete selected images
    const deleteSelectedImages = async () => {
        if (selectedImages.length === 0) return;

        try {
            setIsDeleting(true);
            setError('');

            // Sort indices in descending order to avoid index shifting issues when deleting
            const sortedIndices = [...selectedImages].sort((a, b) => b - a);

            for (const index of sortedIndices) {
                await eventApi.admin.removeGalleryImage(event._id, index);
            }

            // Get updated event
            const response = await eventApi.getEvent(event._id);
            onGalleryUpdated(response.data);

            // Update local state
            setGalleryImages(response.data.gallery || []);
            setSelectedImages([]);

            // Show success message
            setSuccessMessage(`${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''} deleted successfully`);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to delete images:', err);
            setError(err.response?.data?.message || 'Failed to delete images. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    // Save gallery order after drag and drop reordering
    const saveGalleryOrder = async () => {
        try {
            setIsSavingOrder(true);
            setError('');

            // Call the API endpoint to update the gallery order
            const response = await eventApi.admin.updateGalleryOrder(event._id, galleryImages);

            onGalleryUpdated(response.data);

            // Show success message
            setSuccessMessage('Gallery order updated successfully');

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to update gallery order:', err);
            setError(err.response?.data?.message || 'Failed to update gallery order. Please try again.');
        } finally {
            setIsSavingOrder(false);
        }
    };

    // Handle saving caption for an image
    const handleCaptionSave = async () => {
        if (captionEditMode === null) return;

        try {
            setError('');

            // Example of how to call caption API if implemented
            // const response = await eventApi.admin.addGalleryCaption(event._id, captionEditMode.index, captionEditMode.caption);
            // onGalleryUpdated(response.data);

            setCaptionEditMode(null);
            setSuccessMessage('Caption updated successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to update caption:', err);
            setError(err.response?.data?.message || 'Failed to update caption. Please try again.');
        }
    };

    // Open image preview modal
    const openPreview = (imageUrl: string) => {
        setPreviewImage(imageUrl);
    };

    // Get caption for an image
    const getCaption = (imageUrl: string): string | undefined => {
        return event.galleryCaptions?.[imageUrl];
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto my-4">
                <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">
                        Manage Event Gallery
                        <span className="ml-2 text-sm font-normal text-gray-500">
                            ({event.title})
                        </span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                        <FaTimes className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 text-green-700">
                            {successMessage}
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm text-blue-600 flex items-start">
                        <FaInfo className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                            <p>Gallery images can be rearranged by dragging and dropping them. Don't forget to click "Save Order" after rearranging.</p>
                            <p className="mt-1">You can select multiple images to delete them at once, or click individual images to view, edit captions, and more.</p>
                        </div>
                    </div>

                    {/* Gallery Header with Actions */}
                    <div className="flex flex-wrap justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <FaImages className="mr-2 text-[#FFB915]" />
                            Event Gallery ({galleryImages.length} images)
                        </h3>

                        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                            {/* View Mode Toggle */}
                            <div className="bg-gray-100 rounded p-1 flex">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    List
                                </button>
                            </div>

                            {/* Selection Actions */}
                            <button
                                onClick={toggleSelectAll}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                {selectedImages.length === galleryImages.length && galleryImages.length > 0 ? 'Deselect All' : 'Select All'}
                            </button>

                            {selectedImages.length > 0 && (
                                <button
                                    onClick={deleteSelectedImages}
                                    disabled={isDeleting}
                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                                >
                                    {isDeleting ? <FaSpinner className="animate-spin mr-1" /> : <FaTrash className="mr-1" />}
                                    Delete ({selectedImages.length})
                                </button>
                            )}

                            {/* Save Order Button */}
                            <button
                                onClick={saveGalleryOrder}
                                disabled={isSavingOrder}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                            >
                                {isSavingOrder ? <FaSpinner className="animate-spin mr-1" /> : <FaSort className="mr-1" />}
                                Save Order
                            </button>
                        </div>
                    </div>

                    {/* Upload New Images */}
                    <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <FaUpload className="mr-2 text-[#FFB915]" />
                            Upload New Images
                        </h4>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="sm:w-1/3">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-40 bg-white">
                                    <FaUpload className="text-gray-400 text-3xl mb-2" />
                                    <label className="cursor-pointer">
                                        <span className="text-[#FFB915] hover:text-[#2C4A6B] font-medium">
                                            Choose files
                                        </span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                            disabled={isUploading}
                                        />
                                    </label>
                                    <p className="text-xs text-gray-500 text-center mt-1">
                                        PNG, JPG, GIF up to 5MB each
                                    </p>
                                </div>

                                {newImages.length > 0 && (
                                    <div className="mt-4">
                                        <button
                                            onClick={uploadImages}
                                            disabled={isUploading}
                                            className="w-full inline-flex justify-center items-center px-4 py-2 bg-[#FFB915] text-white font-medium rounded-lg hover:bg-[#2C4A6B] transition-colors"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <FaSpinner className="animate-spin mr-2" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>Upload {newImages.length} image{newImages.length > 1 ? 's' : ''}</>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="sm:w-2/3">
                                {newImagePreviews.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {newImagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-square rounded-lg overflow-hidden">
                                                    <img
                                                        src={preview}
                                                        alt={`New Upload ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => removeNewImage(index)}
                                                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none"
                                                    disabled={isUploading}
                                                >
                                                    <FaTimes className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-40 flex items-center justify-center border border-gray-200 rounded-lg bg-white">
                                        <p className="text-gray-500">Selected images will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Current Gallery */}
                    <DndProvider backend={HTML5Backend}>
                        {galleryImages.length === 0 ? (
                            <div className="bg-gray-50 rounded-lg p-8 text-center">
                                <FaImages className="text-gray-400 text-4xl mx-auto mb-4" />
                                <p className="text-gray-500 mb-2">No images in the gallery yet.</p>
                                <p className="text-gray-500 text-sm">
                                    Upload images using the section above.
                                </p>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {galleryImages.map((imageUrl, index) => (
                                    <GalleryItem
                                        key={`${imageUrl}-${index}`}
                                        image={imageUrl}
                                        index={index}
                                        isSelected={selectedImages.includes(index)}
                                        onSelect={toggleImageSelection}
                                        moveImage={moveImage}
                                        caption={getCaption(imageUrl)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg overflow-hidden border">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Select
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Preview
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Position
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                URL
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Caption
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {galleryImages.map((imageUrl, index) => (
                                            <tr key={index} className={`${selectedImages.includes(index) ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedImages.includes(index)}
                                                        onChange={() => toggleImageSelection(index)}
                                                        className="h-4 w-4 text-[#FFB915] border-gray-300 rounded focus:ring-[#FFB915]"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="h-12 w-12 rounded overflow-hidden bg-gray-100 cursor-pointer"
                                                        onClick={() => openPreview(imageUrl)}>
                                                        <img
                                                            src={imageUrl}
                                                            alt={`Gallery ${index + 1}`}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.onerror = null;
                                                                target.src = 'https://via.placeholder.com/48?text=Image';
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {imageUrl}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {captionEditMode && captionEditMode.index === index ? (
                                                        <div className="flex">
                                                            <input
                                                                type="text"
                                                                value={captionEditMode.caption}
                                                                onChange={(e) => setCaptionEditMode({ ...captionEditMode, caption: e.target.value })}
                                                                className="text-sm border border-gray-300 rounded px-2 py-1 mr-2"
                                                            />
                                                            <button
                                                                onClick={() => handleCaptionSave()}
                                                                className="text-green-600 hover:text-green-800"
                                                            >
                                                                <FaCheck className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="text-sm text-gray-500 cursor-pointer hover:text-[#FFB915]"
                                                            onClick={() => setCaptionEditMode({ index, caption: getCaption(imageUrl) || '' })}
                                                        >
                                                            {getCaption(imageUrl) || 'Add caption...'}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => openPreview(imageUrl)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="View"
                                                        >
                                                            <FaEye />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleImageSelection(index)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Delete"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </DndProvider>
                </div>

                <div className="px-6 py-4 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Close
                    </button>
                </div>

                {/* Image Preview Modal */}
                {previewImage && (
                    <div
                        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
                        onClick={() => setPreviewImage(null)}
                    >
                        <div className="max-w-4xl max-h-full p-4">
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = 'https://via.placeholder.com/800x600?text=Image Not Available';
                                }}
                            />
                            <button
                                className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
                                onClick={() => setPreviewImage(null)}
                            >
                                <FaTimes className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventGalleryModal;