// src/components/doctor/DoctorAvailability.tsx
import React, { useState, useEffect } from 'react';
import {
    FaCalendarAlt,
    FaPlus,
    FaSpinner,
    FaSave,
    FaTimes
} from 'react-icons/fa';
import DoctorLayout from '../../layout/doctorLayout';
import apiClient from '../../api/apiClient';

interface TimeSlot {
    time: string;
    isAvailable: boolean;
}

interface Availability {
    date: Date;
    slots: TimeSlot[];
}

interface AvailabilityDisplayData {
    dateString: string;
    formattedDate: string;
    slots: TimeSlot[];
}

const DoctorAvailability: React.FC = () => {
    const [availabilityData, setAvailabilityData] = useState<AvailabilityDisplayData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDate, setNewDate] = useState('');
    const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
    const [selectedDateToEdit, setSelectedDateToEdit] = useState<string | null>(null);

    // Default time slots for new dates
    const defaultTimeSlots: TimeSlot[] = [
        { time: '9:00 AM', isAvailable: true },
        { time: '9:30 AM', isAvailable: true },
        { time: '10:00 AM', isAvailable: true },
        { time: '10:30 AM', isAvailable: true },
        { time: '11:00 AM', isAvailable: true },
        { time: '11:30 AM', isAvailable: true },
        { time: '12:00 PM', isAvailable: true },
        { time: '12:30 PM', isAvailable: true },
        { time: '1:00 PM', isAvailable: true },
        { time: '1:30 PM', isAvailable: true },
        { time: '2:00 PM', isAvailable: true },
        { time: '2:30 PM', isAvailable: true },
        { time: '3:00 PM', isAvailable: true },
        { time: '3:30 PM', isAvailable: true },
        { time: '4:00 PM', isAvailable: true },
        { time: '4:30 PM', isAvailable: true }
    ];

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            setIsLoading(true);
            setError('');

            const response = await apiClient.get('/doctors/availability');
            const data = response.data.data as Availability[];

            // Format data for display
            const formattedData = data.map(item => {
                const date = new Date(item.date);
                const dateString = date.toISOString().split('T')[0];
                const formattedDate = date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                return {
                    dateString,
                    formattedDate,
                    slots: item.slots
                };
            });

            // Sort by date
            formattedData.sort((a, b) => {
                return new Date(a.dateString).getTime() - new Date(b.dateString).getTime();
            });

            setAvailabilityData(formattedData);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to fetch availability:', err);
            setError(err.response?.data?.message || 'Failed to load availability. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };



    const handleAddDate = () => {
        // Make sure date is valid and in the future
        if (!newDate) {
            setError('Please select a date');
            return;
        }

        const selectedDate = new Date(newDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            setError('Please select a future date');
            return;
        }

        // Check if date already exists
        const dateExists = availabilityData.some(item => item.dateString === newDate);
        if (dateExists) {
            setError('This date already exists in your availability');
            return;
        }

        // Add new date with default time slots
        setSelectedTimeSlots([...defaultTimeSlots]);
        setSelectedDateToEdit(newDate);
        setShowAddModal(false);
    };

    const handleTimeSlotToggle = (index: number) => {
        setSelectedTimeSlots(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                isAvailable: !updated[index].isAvailable
            };
            return updated;
        });
    };

    const handleSaveAvailability = async () => {
        if (!selectedDateToEdit) return;

        try {
            setIsSubmitting(true);
            setError('');

            await apiClient.post('/doctors/availability', {
                date: selectedDateToEdit,
                slots: selectedTimeSlots
            });

            // Refresh availability data
            await fetchAvailability();

            setSuccessMessage('Availability updated successfully');
            setSelectedDateToEdit(null);
            setSelectedTimeSlots([]);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to update availability:', err);
            setError(err.response?.data?.message || 'Failed to update availability. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditAvailability = (date: string) => {
        const availabilityToEdit = availabilityData.find(item => item.dateString === date);
        if (availabilityToEdit) {
            setSelectedDateToEdit(date);
            setSelectedTimeSlots([...availabilityToEdit.slots]);
        }
    };

    const handleDeleteDate = async (date: string) => {
        try {
            setIsSubmitting(true);
            setError('');

            // For deleting, we set all slots to unavailable
            const availabilityToEdit = availabilityData.find(item => item.dateString === date);
            if (availabilityToEdit) {
                const unavailableSlots = availabilityToEdit.slots.map(slot => ({
                    ...slot,
                    isAvailable: false
                }));

                await apiClient.post('/doctors/availability', {
                    date,
                    slots: unavailableSlots
                });

                // Refresh availability data
                await fetchAvailability();

                setSuccessMessage('Date removed from availability');

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            }
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to delete date:', err);
            setError(err.response?.data?.message || 'Failed to delete date. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <DoctorLayout>
            <div className="container mx-auto max-w-5xl">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Manage Availability</h1>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-[#FFB915] hover:bg-[#2C4A6B] text-white font-medium rounded-lg transition-colors"
                    >
                        <FaPlus className="mr-2" />
                        Add New Date
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

                {/* Current Date Editing */}
                {selectedDateToEdit && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Edit Availability for {formatDate(selectedDateToEdit)}
                            </h2>
                            <button
                                onClick={() => setSelectedDateToEdit(null)}
                                className="p-1 text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                            {selectedTimeSlots.map((slot, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleTimeSlotToggle(index)}
                                    className={`p-3 border rounded-lg cursor-pointer text-center transition-colors ${slot.isAvailable
                                        ? 'bg-green-100 border-green-500 text-green-800'
                                        : 'bg-red-100 border-red-500 text-red-800'
                                        }`}
                                >
                                    {slot.time}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleSaveAvailability}
                                disabled={isSubmitting}
                                className="inline-flex items-center px-4 py-2 bg-[#FFB915] hover:bg-[#2C4A6B] text-white font-medium rounded-lg transition-colors"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center">
                                        <FaSpinner className="animate-spin mr-2" />
                                        Saving...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <FaSave className="mr-2" />
                                        Save Changes
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Available Dates List */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFB915]"></div>
                    </div>
                ) : availabilityData.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-lg text-gray-600 mb-4">You have not set any availability dates yet.</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-[#FFB915] hover:bg-[#2C4A6B] text-white font-medium rounded-lg transition-colors"
                        >
                            <FaPlus className="mr-2" />
                            Add Your First Date
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-800">Your Available Dates</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {availabilityData.map((item) => {
                                // Count available slots
                                const availableSlots = item.slots.filter(slot => slot.isAvailable).length;

                                return (
                                    <div key={item.dateString} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                                            <div className="mb-2 md:mb-0">
                                                <div className="flex items-center">
                                                    <FaCalendarAlt className="text-[#FFB915] mr-2" />
                                                    <span className="text-gray-800 font-medium">{item.formattedDate}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {availableSlots} {availableSlots === 1 ? 'slot' : 'slots'} available
                                                </p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditAvailability(item.dateString)}
                                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDate(item.dateString)}
                                                    className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting && selectedDateToEdit === item.dateString ? (
                                                        <FaSpinner className="animate-spin" />
                                                    ) : (
                                                        'Remove'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Add New Date Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowAddModal(false)}></div>
                            </div>

                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                            <div
                                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <FaCalendarAlt className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                Add New Availability Date
                                            </h3>
                                            <div className="mt-4">
                                                <label htmlFor="new-date" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Select Date
                                                </label>
                                                <input
                                                    type="date"
                                                    id="new-date"
                                                    name="new-date"
                                                    value={newDate}
                                                    onChange={(e) => setNewDate(e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#FFB915] focus:border-[#FFB915]"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Note: You can only select future dates and cannot duplicate existing dates.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#FFB915] text-base font-medium text-white hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={handleAddDate}
                                    >
                                        Add Date
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => setShowAddModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DoctorLayout>
    );
};

export default DoctorAvailability;