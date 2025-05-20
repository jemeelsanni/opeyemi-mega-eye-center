// src/components/home/featuredEvents.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import { eventApi, Event } from '../../api/apiClient';

const FeaturedEvents: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFeaturedEvents = async () => {
            try {
                setLoading(true);
                const response = await eventApi.getFeaturedEvents();

                // Get upcoming featured events only, limited to 3
                const upcomingEvents = response.data
                    .filter((event: Event) => event.status === 'upcoming')
                    .slice(0, 3);

                setEvents(upcomingEvents);
            } catch (err) {
                console.error('Error fetching featured events:', err);
                setError('Failed to load featured events');
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedEvents();
    }, []);

    // Format date for display
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
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

    if (error || events.length === 0) {
        // Don't render the section if there are no featured events
        return null;
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
                        Featured Events
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-lg text-gray-600 max-w-xl mx-auto"
                    >
                        Join us at these upcoming special events
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event, index) => (
                        <motion.div
                            key={event._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                            className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full transform transition-transform hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="h-48 relative overflow-hidden">
                                {event.coverImage ? (
                                    <img
                                        src={event.coverImage}
                                        alt={event.title}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = 'https://via.placeholder.com/400x200?text=Event';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-r from-[#2C4A6B] to-[#FFB915] flex items-center justify-center">
                                        <span className="text-white text-xl font-bold">
                                            {event.title}
                                        </span>
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 bg-[#FFB915] text-white text-sm font-bold px-3 py-1 rounded-full uppercase">
                                    Featured
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
                                    View Details
                                    <FaArrowRight className="ml-2 text-sm" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link
                        to="/events"
                        className="inline-flex items-center px-6 py-3 bg-[#FFB915] text-white font-medium rounded-lg hover:bg-[#2C4A6B] transition-colors"
                    >
                        View All Events
                        <FaArrowRight className="ml-2" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedEvents;