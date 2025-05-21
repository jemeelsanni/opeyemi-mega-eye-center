// src/pages/events/index.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaChevronRight, FaSearch, FaSpinner, FaImages } from 'react-icons/fa';
import Header from '../../layout/header';
import Navbar from '../../layout/navbar';
import Footer from '../../layout/footer';
import PastEventGalleries from './pastEventGalleries';
import { eventApi, Event } from '../../api/apiClient';

const EventsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showGalleryOnly, setShowGalleryOnly] = useState(false);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

    // Fetch events based on active tab
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                let response;

                if (activeTab === 'upcoming') {
                    response = await eventApi.getUpcomingEvents();
                } else {
                    response = await eventApi.getPastEvents();
                }

                setEvents(response.data);
                setFilteredEvents(response.data);
            } catch (err) {
                console.error(`Error fetching ${activeTab} events:`, err);
                setError(`Failed to load ${activeTab} events. Please try again.`);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [activeTab]);

    // Filter events based on search term and gallery filter
    useEffect(() => {
        let filtered = events;

        // Apply gallery filter
        if (showGalleryOnly) {
            filtered = filtered.filter(event =>
                event.gallery && event.gallery.length > 0
            );
        }

        // Apply search term
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(
                event =>
                    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredEvents(filtered);
    }, [searchTerm, events, showGalleryOnly]);

    // Reset filters
    const resetFilters = () => {
        setSearchTerm('');
        setShowGalleryOnly(false);
    };

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

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <Navbar />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-gradient-to-r from-[#2C4A6B] to-[#FFB915] py-16 md:py-24">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto text-center text-white">
                            <motion.h1
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7 }}
                                className="text-4xl md:text-6xl font-bold mb-4"
                            >
                                Our Events
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.7, delay: 0.3 }}
                                className="text-xl md:text-2xl opacity-90"
                            >
                                Discover our past events and stay informed about upcoming ones
                            </motion.p>
                        </div>
                    </div>
                </section>

                {/* Events Section */}
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        {/* Tabs */}
                        <div className="flex justify-center mb-8">
                            <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
                                <button
                                    onClick={() => setActiveTab('upcoming')}
                                    className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${activeTab === 'upcoming'
                                        ? 'bg-[#FFB915] text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    Upcoming Events
                                </button>
                                <button
                                    onClick={() => setActiveTab('past')}
                                    className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${activeTab === 'past'
                                        ? 'bg-[#FFB915] text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    Past Events
                                </button>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="max-w-4xl mx-auto mb-12">
                            <div className="bg-white rounded-lg shadow-sm p-4">
                                {/* Search Bar */}
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search events..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-[#FFB915] focus:border-[#FFB915]"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className="h-5 w-5 text-gray-400" />
                                    </div>
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                {/* Filters */}
                                <div className="flex flex-wrap items-center justify-between">
                                    {/* <div className="flex items-center mb-2 sm:mb-0">
                                        <input
                                            id="gallery-filter"
                                            type="checkbox"
                                            checked={showGalleryOnly}
                                            onChange={(e) => setShowGalleryOnly(e.target.checked)}
                                            className="h-4 w-4 text-[#FFB915] focus:ring-[#FFB915] border-gray-300 rounded"
                                        />
                                        <label htmlFor="gallery-filter" className="ml-2 text-sm text-gray-700 flex items-center">
                                            <FaImages className="mr-1 text-[#FFB915]" />
                                            Show events with photos only
                                        </label>
                                    </div> */}

                                    {(searchTerm || showGalleryOnly) && (
                                        <button
                                            onClick={resetFilters}
                                            className="text-sm text-[#FFB915] hover:text-[#2C4A6B]"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Events List */}
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <FaSpinner className="animate-spin h-12 w-12 text-[#FFB915]" />
                            </div>
                        ) : error ? (
                            <div className="text-center p-8 bg-red-50 rounded-lg text-red-600">
                                <p>{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : filteredEvents.length === 0 ? (
                            <div className="text-center p-12 bg-white rounded-lg shadow-md">
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                    {searchTerm || showGalleryOnly
                                        ? "No events match your filters"
                                        : `No ${activeTab} events found`}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {searchTerm || showGalleryOnly
                                        ? "Try different filters or clear them"
                                        : activeTab === 'upcoming'
                                            ? "Check back later for upcoming events"
                                            : "We haven't had any past events yet"}
                                </p>
                                {(searchTerm || showGalleryOnly) && (
                                    <button
                                        onClick={resetFilters}
                                        className="px-4 py-2 bg-[#FFB915] text-white rounded-md hover:bg-[#2C4A6B] transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredEvents.map((event, index) => (
                                    <motion.div
                                        key={event._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full"
                                    >
                                        <div className="h-48 overflow-hidden relative">
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
                                                <div className="w-full h-full bg-gradient-to-r from-[#2C4A6B]/80 to-[#FFB915]/80 flex items-center justify-center">
                                                    <span className="text-white text-xl font-bold">
                                                        {event.title}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Gallery Indicator */}
                                            {event.gallery && event.gallery.length > 0 && (
                                                <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full flex items-center">
                                                    <FaImages className="mr-1" />
                                                    {event.gallery.length}
                                                </div>
                                            )}

                                            {event.featured && (
                                                <div className="absolute top-4 right-4 bg-[#FFB915] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                                                    Featured
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 flex-grow">
                                            <div className="mb-4">
                                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                                    {event.title}
                                                </h3>
                                                <p className="text-gray-600 text-sm line-clamp-2">
                                                    {event.shortDescription}
                                                </p>
                                            </div>

                                            <div className="space-y-3 text-sm">
                                                <div className="flex items-start">
                                                    <FaCalendarAlt className="text-[#FFB915] mt-1 mr-3 flex-shrink-0" />
                                                    <span className="text-gray-700">
                                                        {formatDate(event.eventDate)}
                                                    </span>
                                                </div>
                                                <div className="flex items-start">
                                                    <FaClock className="text-[#FFB915] mt-1 mr-3 flex-shrink-0" />
                                                    <span className="text-gray-700">{event.eventTime}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <FaMapMarkerAlt className="text-[#FFB915] mt-1 mr-3 flex-shrink-0" />
                                                    <span className="text-gray-700">{event.location}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-6 pb-6">
                                            <Link
                                                to={`/events/${event._id}${event.gallery && event.gallery.length > 0 ? '#gallery' : ''}`}
                                                className="inline-flex items-center font-medium text-[#FFB915] hover:text-[#2C4A6B] transition-colors"
                                            >
                                                {event.gallery && event.gallery.length > 0 && activeTab === 'past' ? 'View Gallery' : 'View Details'}
                                                <FaChevronRight className="ml-1 text-xs" />
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Past Event Galleries Section - Only show when on "past" tab and not filtering */}
                {activeTab === 'past' && !searchTerm && !showGalleryOnly && (
                    <PastEventGalleries />
                )}
            </main>

            <Footer />
        </div>
    );
};

export default EventsPage;