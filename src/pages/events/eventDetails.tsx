// src/pages/events/eventDetails.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaArrowLeft, FaExternalLinkAlt, FaSpinner, FaTimes } from 'react-icons/fa';
import Header from '../../layout/header';
import Navbar from '../../layout/navbar';
import Footer from '../../layout/footer';
import { eventApi, Event } from '../../api/apiClient';

const EventDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showGallery, setShowGallery] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'about' | 'gallery'>('about');

    // Fetch event details
    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                setLoading(true);

                if (id) {
                    const response = await eventApi.getEvent(id);
                    setEvent(response.data);

                    // If the event has a gallery and URL has #gallery, switch to gallery tab
                    if (response.data.gallery &&
                        response.data.gallery.length > 0 &&
                        window.location.hash === '#gallery') {
                        setActiveTab('gallery');
                    }
                } else {
                    throw new Error('Event ID is required');
                }
            } catch (err) {
                console.error('Error fetching event details:', err);
                setError('Failed to load event details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [id]);

    // Update URL hash when tab changes
    useEffect(() => {
        if (activeTab === 'gallery') {
            window.history.replaceState(null, '', `#gallery`);
        } else {
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, [activeTab]);

    // Format date for display
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Open full-size gallery
    const openGallery = (imageUrl?: string) => {
        setSelectedImage(imageUrl || null);
        setShowGallery(true);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    // Close gallery
    const closeGallery = () => {
        setShowGallery(false);
        document.body.style.overflow = 'auto'; // Restore scrolling
    };

    // Handle next/previous navigation in gallery
    const navigateGallery = useCallback((direction: 'next' | 'prev') => {
        if (!event || !selectedImage) return;

        const currentIndex = event.gallery.indexOf(selectedImage);
        if (currentIndex === -1) return;

        let newIndex;
        if (direction === 'next') {
            newIndex = (currentIndex + 1) % event.gallery.length;
        } else {
            newIndex = (currentIndex - 1 + event.gallery.length) % event.gallery.length;
        }

        setSelectedImage(event.gallery[newIndex]);
    }, [event, selectedImage]);

    // Gallery keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!showGallery) return;

            if (e.key === 'Escape') {
                closeGallery();
            } else if (e.key === 'ArrowRight') {
                navigateGallery('next');
            } else if (e.key === 'ArrowLeft') {
                navigateGallery('prev');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showGallery, navigateGallery]);

    // Render function to handle loading, error, and content states
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <FaSpinner className="animate-spin h-12 w-12 text-[#FFB915]" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="container mx-auto px-4 py-16">
                    <div className="text-center p-8 bg-red-50 rounded-lg text-red-600">
                        <p>{error}</p>
                        <Link
                            to="/events"
                            className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Back to Events
                        </Link>
                    </div>
                </div>
            );
        }

        if (!event) {
            return (
                <div className="container mx-auto px-4 py-16">
                    <div className="text-center p-8 bg-red-50 rounded-lg text-red-600">
                        <p>Event not found</p>
                        <Link
                            to="/events"
                            className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Back to Events
                        </Link>
                    </div>
                </div>
            );
        }

        return (
            <>
                {/* Event Header */}
                <div className="relative">
                    <div className="h-64 md:h-96 w-full bg-gradient-to-r from-[#2C4A6B] to-[#FFB915] relative overflow-hidden">
                        {event.coverImage && (
                            <img
                                src={event.coverImage}
                                alt={event.title}
                                className="w-full h-full object-cover opacity-50"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = 'https://via.placeholder.com/1200x600?text=Event';
                                }}
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>

                    <div className="container mx-auto px-4">
                        <div className="relative -mt-24 md:-mt-32 bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
                            <Link
                                to="/events"
                                className="inline-flex items-center text-[#FFB915] hover:text-[#2C4A6B] font-medium mb-4 transition-colors"
                            >
                                <FaArrowLeft className="mr-2" />
                                Back to Events
                            </Link>

                            <div className="flex flex-wrap justify-between items-start">
                                <div className="mb-4 md:mb-0">
                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                        {event.title}
                                    </h1>
                                    <div className="flex flex-wrap items-center text-gray-600 text-sm md:text-base mt-3">
                                        <div className="flex items-center mr-6 mb-2">
                                            <FaCalendarAlt className="text-[#FFB915] mr-2" />
                                            {formatDate(event.eventDate)}
                                        </div>
                                        <div className="flex items-center mr-6 mb-2">
                                            <FaClock className="text-[#FFB915] mr-2" />
                                            {event.eventTime}
                                        </div>
                                        <div className="flex items-center mb-2">
                                            <FaMapMarkerAlt className="text-[#FFB915] mr-2" />
                                            {event.location}
                                        </div>
                                    </div>
                                </div>

                                {event.registrationRequired && (
                                    <div className="w-full md:w-auto">
                                        {event.status === 'upcoming' && event.registrationLink ? (
                                            <a
                                                href={event.registrationLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center px-6 py-3 bg-[#FFB915] text-white font-medium rounded-lg hover:bg-[#2C4A6B] transition-colors"
                                            >
                                                Register Now
                                                <FaExternalLinkAlt className="ml-2 text-xs" />
                                            </a>
                                        ) : (
                                            <span className="inline-block px-4 py-2 border border-gray-300 text-gray-500 rounded-lg">
                                                {event.status === 'past' ? 'Event Completed' : 'Registration Closed'}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Event Content */}
                <div className="container mx-auto px-4 pb-16">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Tab Navigation */}
                        <div className="flex border-b">
                            <button
                                onClick={() => setActiveTab('about')}
                                className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeTab === 'about'
                                    ? 'text-[#FFB915] border-b-2 border-[#FFB915]'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                About Event
                            </button>

                            {event.gallery.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('gallery')}
                                    className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeTab === 'gallery'
                                        ? 'text-[#FFB915] border-b-2 border-[#FFB915]'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Gallery <span className="ml-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">{event.gallery.length}</span>
                                </button>
                            )}
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'about' ? (
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col md:flex-row">
                                    <div className="md:w-2/3 md:pr-8">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4">About this Event</h2>
                                        <div
                                            className="prose prose-lg max-w-none text-gray-700"
                                            dangerouslySetInnerHTML={{ __html: event.description.replace(/\n/g, '<br />') }}
                                        />
                                    </div>

                                    <div className="md:w-1/3 mt-8 md:mt-0">
                                        <div className="bg-gray-50 p-6 rounded-lg">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Details</h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-700">Date and Time</h4>
                                                    <p className="text-gray-600">
                                                        {formatDate(event.eventDate)} at {event.eventTime}
                                                    </p>
                                                </div>

                                                <div>
                                                    <h4 className="font-medium text-gray-700">Location</h4>
                                                    <p className="text-gray-600">{event.location}</p>
                                                    <p className="text-gray-600">{event.address}</p>
                                                </div>

                                                {event.capacity && (
                                                    <div>
                                                        <h4 className="font-medium text-gray-700">Capacity</h4>
                                                        <p className="text-gray-600">{event.capacity} attendees</p>
                                                    </div>
                                                )}

                                                <div>
                                                    <h4 className="font-medium text-gray-700">Status</h4>
                                                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${event.status === 'upcoming'
                                                        ? 'bg-green-100 text-green-800'
                                                        : event.status === 'ongoing'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Teaser for Gallery */}
                                {event.gallery.length > 0 && (
                                    <div className="mt-8 pt-8 border-t border-gray-200">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-bold text-gray-800">Event Photos</h3>
                                            <button
                                                onClick={() => setActiveTab('gallery')}
                                                className="text-[#FFB915] hover:text-[#2C4A6B] font-medium"
                                            >
                                                View All Photos ({event.gallery.length})
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {event.gallery.slice(0, 4).map((imageUrl, index) => (
                                                <div
                                                    key={index}
                                                    className="aspect-square overflow-hidden rounded-lg cursor-pointer"
                                                    onClick={() => {
                                                        setActiveTab('gallery');
                                                    }}
                                                >
                                                    <img
                                                        src={imageUrl}
                                                        alt={`${event.title} - Gallery Preview ${index + 1}`}
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.onerror = null;
                                                            target.src = 'https://via.placeholder.com/150?text=Image';
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-6 md:p-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Event Gallery</h2>

                                {/* Enhanced Gallery Grid with Masonry-like Layout */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {event.gallery.map((imageUrl, index) => {
                                        // Create a varied aspect ratio for a more dynamic gallery look
                                        const aspectRatio = index % 5 === 0 ? "1/1.5" :
                                            index % 5 === 1 ? "1/1" :
                                                index % 5 === 2 ? "1.5/1" :
                                                    index % 5 === 3 ? "1/1" : "1/1.2";

                                        return (
                                            <div
                                                key={index}
                                                className="relative overflow-hidden rounded-lg cursor-pointer group"
                                                onClick={() => openGallery(imageUrl)}
                                                style={{ aspectRatio }}
                                            >
                                                <img
                                                    src={imageUrl}
                                                    alt={`${event.title} - Gallery ${index + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.onerror = null;
                                                        target.src = 'https://via.placeholder.com/300x300?text=Image';
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity"></div>
                                                <div className="absolute bottom-0 left-0 right-0 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black to-transparent">
                                                    <span className="text-white text-sm">Photo {index + 1}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Full Gallery Modal */}
                {showGallery && (
                    <div
                        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
                        onClick={closeGallery}
                    >
                        <div className="relative w-full h-full flex items-center justify-center">
                            {/* Close button */}
                            <button
                                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                                onClick={closeGallery}
                            >
                                <FaTimes className="w-6 h-6" />
                            </button>

                            {/* Gallery navigation */}
                            <button
                                className="absolute left-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigateGallery('prev');
                                }}
                            >
                                <FaArrowLeft className="w-5 h-5" />
                            </button>

                            <button
                                className="absolute right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigateGallery('next');
                                }}
                            >
                                <FaArrowLeft className="w-5 h-5 transform rotate-180" />
                            </button>

                            {/* Main image */}
                            <div
                                className="w-full h-full p-4 md:p-12 flex items-center justify-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <img
                                    src={selectedImage || (event.gallery.length > 0 ? event.gallery[0] : '')}
                                    alt={`${event.title} Gallery`}
                                    className="max-w-full max-h-full object-contain"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = 'https://via.placeholder.com/800x600?text=Image Not Available';
                                    }}
                                />
                            </div>

                            {/* Image counter */}
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 px-3 py-1 rounded-full text-white text-sm">
                                {selectedImage ? event.gallery.indexOf(selectedImage) + 1 : 1} of {event.gallery.length}
                            </div>

                            {/* Thumbnails */}
                            <div className="absolute bottom-0 inset-x-0 bg-black bg-opacity-70 p-2 flex overflow-x-auto">
                                {event.gallery.map((imageUrl, index) => (
                                    <div
                                        key={index}
                                        className={`h-16 w-16 md:h-20 md:w-20 flex-shrink-0 mx-1 rounded overflow-hidden transition-all ${selectedImage === imageUrl ? 'border-2 border-[#FFB915]' : ''
                                            }`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImage(imageUrl);
                                        }}
                                    >
                                        <img
                                            src={imageUrl}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null;
                                                target.src = 'https://via.placeholder.com/80x80?text=Thumb';
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <Navbar />
            <main className="flex-grow">
                {renderContent()}
            </main>
            <Footer />
        </div>
    );
};

export default EventDetails;