// src/pages/doctor/DoctorAppointments.tsx
import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../layout/doctorLayout';
import { doctorApi } from '../../api/apiClient';
import { FaCalendarAlt, FaUserAlt, FaEye, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

interface Appointment {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    appointmentDate: string;
    appointmentTime: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    isHmoRegistered: boolean;
    hasPreviousVisit: boolean;
    briefHistory: string;
    createdAt: string;
}

const DoctorAppointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [filter, setFilter] = useState({
        status: 'all',
        date: ''
    });

    useEffect(() => {
        fetchAppointments();
    }, [filter]);

    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
            setError('');

            const statusParam = filter.status !== 'all' ? filter.status : undefined;
            const dateParam = filter.date ? filter.date : undefined;

            const response = await doctorApi.getAppointments(statusParam, dateParam);
            setAppointments(response.data.data);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to fetch appointments:', err);
            setError(err.response?.data?.message || 'Failed to load appointments. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: 'confirmed' | 'cancelled') => {
        try {
            setIsUpdating(true);

            await doctorApi.updateAppointmentStatus(id, status);

            // Update the appointment in local state
            setAppointments(prevAppointments =>
                prevAppointments.map(app =>
                    app._id === id ? { ...app, status } : app
                )
            );

            if (selectedAppointment && selectedAppointment._id === id) {
                setSelectedAppointment({ ...selectedAppointment, status });
            }

        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to update appointment status:', err);
            setError(err.response?.data?.message || 'Failed to update appointment status. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const viewAppointmentDetails = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setShowDetailsModal(true);
    };

    // Format date
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
            <div className="container mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Appointments</h1>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                        {error}
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                id="status-filter"
                                value={filter.status}
                                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#FFB915] focus:border-[#FFB915]"
                            >
                                <option value="all">All</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                Date
                            </label>
                            <input
                                type="date"
                                id="date-filter"
                                value={filter.date}
                                onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#FFB915] focus:border-[#FFB915]"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => setFilter({ status: 'all', date: '' })}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Appointments Table */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFB915]"></div>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-lg text-gray-600 mb-4">No appointments found.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Patient
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date & Time
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {appointments.map((appointment) => (
                                        <tr key={appointment._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#FFB915]/10 flex items-center justify-center">
                                                        <FaUserAlt className="text-[#FFB915]" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{appointment.fullName}</div>
                                                        <div className="text-sm text-gray-500">{appointment.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 flex items-center">
                                                    <FaCalendarAlt className="mr-1 text-gray-400" />
                                                    {formatDate(appointment.appointmentDate)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {appointment.appointmentTime}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${appointment.status === 'confirmed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : appointment.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {appointment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => viewAppointmentDetails(appointment)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View Details"
                                                    >
                                                        <FaEye />
                                                    </button>

                                                    {appointment.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                                                                className="text-green-600 hover:text-green-900"
                                                                title="Confirm"
                                                                disabled={isUpdating}
                                                            >
                                                                {isUpdating && selectedAppointment?._id === appointment._id ? (
                                                                    <FaSpinner className="animate-spin" />
                                                                ) : (
                                                                    <FaCheck />
                                                                )}
                                                            </button>

                                                            <button
                                                                onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Cancel"
                                                                disabled={isUpdating}
                                                            >
                                                                {isUpdating && selectedAppointment?._id === appointment._id ? (
                                                                    <FaSpinner className="animate-spin" />
                                                                ) : (
                                                                    <FaTimes />
                                                                )}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Appointment Details Modal */}
                {showDetailsModal && selectedAppointment && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowDetailsModal(false)}></div>
                            </div>

                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                            <div
                                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        Appointment Details
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Patient Name</h4>
                                            <p className="text-sm text-gray-900 mt-1">{selectedAppointment.fullName}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                            <p className="text-sm text-gray-900 mt-1">{selectedAppointment.email}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                                            <p className="text-sm text-gray-900 mt-1">{selectedAppointment.phoneNumber}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Appointment Date</h4>
                                            <p className="text-sm text-gray-900 mt-1">{formatDate(selectedAppointment.appointmentDate)}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Appointment Time</h4>
                                            <p className="text-sm text-gray-900 mt-1">{selectedAppointment.appointmentTime}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                            <p className="text-sm mt-1">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedAppointment.status === 'confirmed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : selectedAppointment.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {selectedAppointment.status}
                                                </span>
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">HMO Registration</h4>
                                            <p className="text-sm text-gray-900 mt-1">
                                                {selectedAppointment.isHmoRegistered ? 'Yes' : 'No'}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Previous Visit</h4>
                                            <p className="text-sm text-gray-900 mt-1">
                                                {selectedAppointment.hasPreviousVisit ? 'Yes' : 'No'}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Brief History</h4>
                                            <p className="text-sm text-gray-900 mt-1">{selectedAppointment.briefHistory || 'None provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    {selectedAppointment.status === 'pending' && (
                                        <>
                                            <button
                                                type="button"
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                                                onClick={() => handleStatusUpdate(selectedAppointment._id, 'confirmed')}
                                                disabled={isUpdating}
                                            >
                                                {isUpdating ? (
                                                    <span className="flex items-center">
                                                        <FaSpinner className="animate-spin mr-2" />
                                                        Confirming...
                                                    </span>
                                                ) : (
                                                    'Confirm Appointment'
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                                onClick={() => handleStatusUpdate(selectedAppointment._id, 'cancelled')}
                                                disabled={isUpdating}
                                            >
                                                {isUpdating ? (
                                                    <span className="flex items-center">
                                                        <FaSpinner className="animate-spin mr-2" />
                                                        Cancelling...
                                                    </span>
                                                ) : (
                                                    'Cancel Appointment'
                                                )}
                                            </button>
                                        </>
                                    )}

                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => setShowDetailsModal(false)}
                                    >
                                        Close
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

export default DoctorAppointments;