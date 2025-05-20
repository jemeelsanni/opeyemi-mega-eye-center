// src/pages/admin/events/eventManagement.tsx
import React, { useState, useEffect } from 'react';
import {
    FaCalendarAlt,
    FaEye,
    FaEdit,
    FaTrash,
    FaPlus,
    FaSearch,
    FaFilter,
    FaSpinner,
    FaImages,
    FaStar,
    FaRegStar,
    FaSync
} from 'react-icons/fa';
import AdminLayout from '../../../layout/adminLayout';
import { eventApi, Event } from '../../../api/apiClient';
import EventDetails from './eventDetails';
import CreateEventModal from './createEventModal';
import EditEventModal from './editEventModal';
import EventGalleryModal from './eventGalleryModal';

const EventManagement: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'ongoing' | 'past'>('all');
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showGalleryModal, setShowGalleryModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch events
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setIsLoading(true);
            setError('');

            const response = await eventApi.admin.getAllEvents();
            setEvents(response.data);
            setFilteredEvents(response.data);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to fetch events:', err);
            setError(err.response?.data?.message || 'Failed to load events. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Refresh events without full loading state
    const refreshEvents = async () => {
        try {
            setIsRefreshing(true);
            setError('');

            const response = await eventApi.admin.getAllEvents();
            setEvents(response.data);
            setFilteredEvents(applyFilters(response.data));

            // Show brief success message
            setSuccessMessage('Events refreshed successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to refresh events:', err);
            setError(err.response?.data?.message || 'Failed to refresh events. Please try again.');
        } finally {
            setIsRefreshing(false);
        }
    };

    // Apply filters to events
    const applyFilters = (eventList: Event[]) => {
        let filtered = eventList;

        // Apply status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(event => event.status === filterStatus);
        }

        // Apply search term
        if (searchTerm.trim()) {
            filtered = filtered.filter(
                event =>
                    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    event.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    };

    // Filter events based on search term and filter status
    useEffect(() => {
        setFilteredEvents(applyFilters(events));
    }, [searchTerm, filterStatus, events]);

    // Reset filters
    const resetFilters = () => {
        setSearchTerm('');
        setFilterStatus('all');
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // View event details
    const viewEventDetails = (event: Event) => {
        setSelectedEvent(event);
        setShowDetailsModal(true);
    };

    // Edit event
    const editEvent = (event: Event) => {
        setSelectedEvent(event);
        setShowEditModal(true);
    };

    // Toggle event featured status
    const toggleFeatured = async (event: Event, e: React.MouseEvent) => {
        // Prevent triggering row click
        e.stopPropagation();

        try {
            setIsSubmitting(true);

            const response = await eventApi.admin.updateEvent(event._id, {
                featured: !event.featured
            });

            // Update local state
            setEvents(
                events.map(e => (e._id === event._id ? response.data : e))
            );

            setSuccessMessage(`${event.title} ${!event.featured ? 'marked as featured' : 'removed from featured'}`);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to update featured status:', err);
            setError(err.response?.data?.message || 'Failed to update featured status. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update event status
    const updateEventStatus = async (event: Event, status: 'upcoming' | 'ongoing' | 'past', e: React.MouseEvent) => {
        // Prevent triggering parent clicks
        e.stopPropagation();

        try {
            setIsSubmitting(true);

            const response = await eventApi.admin.updateEventStatus(event._id, status);

            // Update local state
            setEvents(
                events.map(e => (e._id === event._id ? response.data : e))
            );

            setSuccessMessage(`${event.title} status updated to ${status}`);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to update event status:', err);
            setError(err.response?.data?.message || 'Failed to update event status. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Manage event gallery
    const manageGallery = (event: Event, e?: React.MouseEvent) => {
        // Prevent triggering row click if event is provided
        if (e) {
            e.stopPropagation();
        }

        setSelectedEvent(event);
        setShowGalleryModal(true);
    };

    // Delete event
    const deleteEvent = async () => {
        if (!selectedEvent) return;

        try {
            setIsSubmitting(true);
            setError('');

            await eventApi.admin.deleteEvent(selectedEvent._id);

            // Update local state by removing the deleted event
            setEvents(events.filter(e => e._id !== selectedEvent._id));
            setSuccessMessage(`${selectedEvent.title} deleted successfully`);

            // Close modal
            setShowDeleteModal(false);
            setSelectedEvent(null);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to delete event:', err);
            setError(err.response?.data?.message || 'Failed to delete event. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle event created
    const handleEventCreated = (newEvent: Event) => {
        setEvents([...events, newEvent]);
        setSuccessMessage(`${newEvent.title} created successfully`);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // Handle event updated
    const handleEventUpdated = (updatedEvent: Event) => {
        setEvents(
            events.map(e => (e._id === updatedEvent._id ? updatedEvent : e))
        );

        setSuccessMessage(`${updatedEvent.title} updated successfully`);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // Get status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming':
                return 'bg-green-100 text-green-800';
            case 'ongoing':
                return 'bg-blue-100 text-blue-800';
            case 'past':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get gallery count badge
    const getGalleryBadge = (event: Event) => {
        const count = event.gallery?.length || 0;

        if (count === 0) return <span className="text-gray-500">No images</span>;

        return (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    manageGallery(event, e);
                }}
                className="inline-flex items-center text-[#FFB915] hover:text-[#2C4A6B]"
            >
                <FaImages className="mr-1" />
                {count} image{count !== 1 ? 's' : ''}
            </button>
        );
    };

    return (
        <AdminLayout>
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <div className="flex items-center mb-4 md:mb-0">
                        <h1 className="text-2xl font-bold text-gray-800">Event Management</h1>
                        {!isLoading && (
                            <button
                                onClick={refreshEvents}
                                disabled={isRefreshing}
                                className="ml-3 text-gray-500 hover:text-[#FFB915] focus:outline-none"
                                title="Refresh events"
                            >
                                <FaSync className={`h-5 w-5 ${isRefreshing ? 'animate-spin text-[#FFB915]' : ''}`} />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-[#FFB915] hover:bg-[#2C4A6B] text-white font-medium rounded-lg transition-colors"
                    >
                        <FaPlus className="mr-2" />
                        Add New Event
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
                        {successMessage}
                    </div>
                )}

                {/* Search and Filter Bar */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="md:flex justify-between items-center">
                        <div className="md:w-1/2 mb-4 md:mb-0">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-[#FFB915] focus:border-[#FFB915]"
                                    placeholder="Search by title, location, or description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div>
                                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                    Status Filter
                                </label>
                                <select
                                    id="status-filter"
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#FFB915] focus:border-[#FFB915] sm:text-sm rounded-md"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
                                >
                                    <option value="all">All Events</option>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="past">Past</option>
                                </select>
                            </div>

                            {(searchTerm || filterStatus !== 'all') && (
                                <button
                                    onClick={resetFilters}
                                    className="text-sm text-red-600 hover:text-red-800"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Events Table */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFB915]"></div>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-lg text-gray-600 mb-4">No events found.</p>
                        {(searchTerm || filterStatus !== 'all') && (
                            <button
                                onClick={resetFilters}
                                className="text-[#FFB915] hover:text-[#2C4A6B] font-medium"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Event
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date & Location
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Gallery
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Featured
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredEvents.map((event) => (
                                        <tr
                                            key={event._id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => viewEventDetails(event)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                                                        {event.coverImage ? (
                                                            <img
                                                                src={event.coverImage}
                                                                alt={event.title}
                                                                className="h-full w-full object-cover"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.onerror = null;
                                                                    target.src = 'https://via.placeholder.com/40x40?text=Event';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-gray-300">
                                                                <FaCalendarAlt className="text-gray-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium text-gray-900">{event.title}</div>
                                                        <div className="text-sm text-gray-500 line-clamp-1">
                                                            {event.shortDescription}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{formatDate(event.eventDate)}</div>
                                                <div className="text-sm text-gray-500">{event.location}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="group inline-block relative">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                                            event.status
                                                        )} cursor-pointer`}
                                                    >
                                                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                        <FaFilter className="ml-1 text-xs mt-0.5" />
                                                    </span>
                                                    <div className="absolute hidden group-hover:block z-10 bg-white shadow-lg rounded-md mt-1 p-1 w-32">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={(e) => updateEventStatus(event, 'upcoming', e)}
                                                                disabled={isSubmitting}
                                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                            >
                                                                Upcoming
                                                            </button>
                                                            <button
                                                                onClick={(e) => updateEventStatus(event, 'ongoing', e)}
                                                                disabled={isSubmitting}
                                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                            >
                                                                Ongoing
                                                            </button>
                                                            <button
                                                                onClick={(e) => updateEventStatus(event, 'past', e)}
                                                                disabled={isSubmitting}
                                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                            >
                                                                Past
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {getGalleryBadge(event)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={(e) => toggleFeatured(event, e)}
                                                    disabled={isSubmitting}
                                                    className="text-yellow-500 hover:text-yellow-600 focus:outline-none"
                                                    title={event.featured ? 'Remove from featured' : 'Add to featured'}
                                                >
                                                    {event.featured ? (
                                                        <FaStar className="h-5 w-5" />
                                                    ) : (
                                                        <FaRegStar className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            viewEventDetails(event);
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="View Details"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            editEvent(event);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Edit Event"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedEvent(event);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete Event"
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
                    </div>
                )}
            </div>

            {/* Event Details Modal */}
            {showDetailsModal && selectedEvent && (
                <EventDetails
                    event={selectedEvent}
                    onClose={() => setShowDetailsModal(false)}
                />
            )}

            {/* Create Event Modal */}
            {showCreateModal && (
                <CreateEventModal
                    onClose={() => setShowCreateModal(false)}
                    onEventCreated={handleEventCreated}
                />
            )}

            {/* Edit Event Modal */}
            {showEditModal && selectedEvent && (
                <EditEventModal
                    event={selectedEvent}
                    onClose={() => setShowEditModal(false)}
                    onEventUpdated={handleEventUpdated}
                />
            )}

            {/* Gallery Modal */}
            {showGalleryModal && selectedEvent && (
                <EventGalleryModal
                    event={selectedEvent}
                    onClose={() => setShowGalleryModal(false)}
                    onGalleryUpdated={(updatedEvent) => {
                        setEvents(
                            events.map(e => (e._id === updatedEvent._id ? updatedEvent : e))
                        );
                        setSelectedEvent(updatedEvent);
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Deletion</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <span className="font-semibold">{selectedEvent.title}</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteEvent}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>Delete</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default EventManagement;