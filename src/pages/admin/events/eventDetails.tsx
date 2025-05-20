// src/pages/admin/events/eventDetails.tsx
import React, { useState } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaLink, FaUsers, FaStar, FaTimes, FaImages, FaExpand } from 'react-icons/fa';
import { Event } from '../../../api/apiClient';

interface EventDetailsProps {
    event: Event;
    onClose: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ event, onClose }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format datetime for display
    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Open image in full-screen modal
    const openImagePreview = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    };

    // Close image preview
    const closeImagePreview = () => {
        setSelectedImage(null);
    };

    // Get caption for an image
    const getCaption = (imageUrl: string): string | undefined => {
        return event.galleryCaptions?.[imageUrl];
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto my-4">
                <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Event Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                        <FaTimes className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Event Header */}
                    <div className="flex flex-col sm:flex-row mb-6">
                        <div className="sm:w-1/3 mb-4 sm:mb-0">
                            {event.coverImage ? (
                                <div className="relative group">
                                    <img
                                        src={event.coverImage}
                                        alt={event.title}
                                        className="w-full h-48 object-cover rounded-lg"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={() => openImagePreview(event.coverImage!)}
                                            className="p-2 bg-black bg-opacity-50 rounded-full text-white"
                                        >
                                            <FaExpand className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-500 text-lg">No Cover Image</span>
                                </div>
                            )}
                        </div>

                        <div className="sm:w-2/3 sm:pl-6">
                            <div className="flex justify-between items-start">
                                <h3 className="text-2xl font-bold text-gray-900">{event.title}</h3>
                                {event.featured && (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded-full flex items-center">
                                        <FaStar className="mr-1" />
                                        Featured
                                    </span>
                                )}
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="flex items-start">
                                    <FaCalendarAlt className="text-[#FFB915] mt-1 mr-3 flex-shrink-0" />
                                    <span className="text-gray-700">{formatDate(event.eventDate)}</span>
                                </div>

                                <div className="flex items-start">
                                    <FaClock className="text-[#FFB915] mt-1 mr-3 flex-shrink-0" />
                                    <span className="text-gray-700">{event.eventTime}</span>
                                </div>

                                <div className="flex items-start">
                                    <FaMapMarkerAlt className="text-[#FFB915] mt-1 mr-3 flex-shrink-0" />
                                    <div>
                                        <div className="text-gray-700">{event.location}</div>
                                        <div className="text-gray-600 text-sm">{event.address}</div>
                                    </div>
                                </div>

                                {event.capacity && (
                                    <div className="flex items-start">
                                        <FaUsers className="text-[#FFB915] mt-1 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">Capacity: {event.capacity} attendees</span>
                                    </div>
                                )}

                                {event.registrationRequired && event.registrationLink && (
                                    <div className="flex items-start">
                                        <FaLink className="text-[#FFB915] mt-1 mr-3 flex-shrink-0" />
                                        <a
                                            href={event.registrationLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            Registration Link
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${event.status === 'upcoming'
                                    ? 'bg-green-100 text-green-800'
                                    : event.status === 'ongoing'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Short Description</h4>
                            <p className="text-gray-700">{event.shortDescription}</p>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Full Description</h4>
                            <div
                                className="prose max-w-none text-gray-700"
                                dangerouslySetInnerHTML={{ __html: event.description.replace(/\n/g, '<br />') }}
                            />
                        </div>

                        {event.gallery && event.gallery.length > 0 && (
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <FaImages className="mr-2 text-[#FFB915]" />
                                        Gallery
                                        <span className="ml-2 text-sm font-normal text-gray-500">
                                            ({event.gallery.length} images)
                                        </span>
                                    </h4>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {event.gallery.map((imageUrl, index) => (
                                        <div
                                            key={index}
                                            className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative group cursor-pointer"
                                            onClick={() => openImagePreview(imageUrl)}
                                        >
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
                                            {getCaption(imageUrl) && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs px-2 py-1 truncate">
                                                    {getCaption(imageUrl)}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <FaExpand className="text-white h-5 w-5 opacity-80" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200 mt-6 pt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-gray-500">Created:</div>
                                <div className="text-gray-700">{formatDateTime(event.createdAt)}</div>
                            </div>
                            <div>
                                <div className="text-gray-500">Last Updated:</div>
                                <div className="text-gray-700">{formatDateTime(event.updatedAt)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-[#FFB915] text-white rounded-md shadow-sm hover:bg-[#2C4A6B] transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Image Preview Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-60 bg-black bg-opacity-90 flex items-center justify-center"
                    onClick={closeImagePreview}
                >
                    <div className="max-w-4xl max-h-full p-4">
                        <img
                            src={selectedImage}
                            alt="Image preview"
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = 'https://via.placeholder.com/800x600?text=Image Not Available';
                            }}
                        />
                        <button
                            className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
                            onClick={closeImagePreview}
                        >
                            <FaTimes className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDetails;