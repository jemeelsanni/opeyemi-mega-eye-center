// src/pages/events/pastEventGalleries.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaImages, FaChevronRight } from 'react-icons/fa';
import { eventApi, Event } from '../../api/apiClient';

const PastEventGalleries: React.FC = () => {
    const [pastEvents, setPastEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPastEvents = async () => {
            try {
                setLoading(true);
                const response = await eventApi.getPastEvents();

                // Filter to only show past events with galleries
                const eventsWithGalleries = response.data.filter((event: Event) =>
                    event.gallery && event.gallery.length > 0
                );

                setPastEvents(eventsWithGalleries);
            } catch (err) {
                console.error('Error fetching past events:', err);
                setError('Failed to load past event galleries');
            } finally {
                setLoading(false);
            }
        };

        fetchPastEvents();
    }, []);

    // Format date for display
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return (
            <div className="py-12">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFB915]"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-12">
                <div className="container mx-auto px-4">
                    <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    if (pastEvents.length === 0) {
        return null; // Don't render anything if there are no past events with galleries
    }

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                    >
                        Event Photo Galleries
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-lg text-gray-600 max-w-xl mx-auto"
                    >
                        Browse photos from our previous events
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pastEvents.map((event, index) => (
                        <motion.div
                            key={event._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                            className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full transform transition-transform hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="h-48 relative overflow-hidden">
                                <div className="grid grid-cols-2 grid-rows-2 h-full w-full gap-0.5">
                                    {event.gallery.slice(0, Math.min(4, event.gallery.length)).map((imageUrl, imgIndex) => (
                                        <div key={imgIndex} className="w-full h-full overflow-hidden">
                                            <img
                                                src={imageUrl}
                                                alt={`${event.title} - Gallery ${imgIndex + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.onerror = null;
                                                    target.src = 'https://via.placeholder.com/200x200?text=Event';
                                                }}
                                            />
                                        </div>
                                    ))}
                                    {/* Add placeholder boxes if we have fewer than 4 images */}
                                    {Array.from({ length: Math.max(0, 4 - event.gallery.length) }).map((_, i) => (
                                        <div key={`placeholder-${i}`} className="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <FaImages className="text-gray-400 text-xl" />
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white text-sm font-bold px-3 py-1 rounded-full">
                                    <div className="flex items-center">
                                        <FaImages className="mr-1" />
                                        {event.gallery.length} Photos
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                                <p className="text-gray-600 mb-4 line-clamp-2">{event.shortDescription}</p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-gray-600">
                                        <FaCalendarAlt className="text-[#FFB915] mr-2 flex-shrink-0" />
                                        <span>{formatDate(event.eventDate)}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <FaMapMarkerAlt className="text-[#FFB915] mr-2 flex-shrink-0" />
                                        <span>{event.location}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 pb-6 mt-auto">
                                <Link
                                    to={`/events/${event._id}`}
                                    className="text-[#FFB915] hover:text-[#2C4A6B] font-medium flex items-center transition-colors"
                                >
                                    View Gallery
                                    <FaChevronRight className="ml-2 text-sm" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PastEventGalleries;