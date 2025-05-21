import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUser, FaPhone, FaEnvelope, FaSearch, FaEye, FaCheck, FaTimes, FaSpinner, FaFilter, FaPaperPlane } from 'react-icons/fa';
import AdminLayout from '../../../layout/adminLayout';
import { adminApi } from '../../../api/apiClient';

interface Appointment {
    _id: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    appointmentDate: string;
    appointmentTime: string;
    doctorId: {
        _id: string;
        name: string;
        speciality: string;
    } | string; // Allow both object and string types for doctorId
    isHmoRegistered: boolean;
    hmoName?: string;
    hmoNumber?: string;
    hasPreviousVisit: boolean;
    medicalRecordNumber?: string;
    briefHistory: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    createdAt: string;
}

interface AppointmentFilters {
    status: string;
    date: string;
    physician: string;
}

const AdminAppointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<AppointmentFilters>({
        status: 'all',
        date: '',
        physician: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(10);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailForm, setEmailForm] = useState({
        subject: '',
        message: ''
    });
    const [sendingEmail, setSendingEmail] = useState(false);

    // Available physicians
    const physicians = [
        { value: '', label: 'All Physicians' },
        { value: 'Dr. Taoheed', label: 'Dr. Taoheed' },
        { value: 'Dr. Abdulkadr', label: 'Dr. Abdulkadr' },
        { value: 'Dr. Franklin', label: 'Dr. Franklin' },
    ];

    useEffect(() => {
        fetchAppointments();
    }, [currentPage, filters]);

    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
            setError('');

            const response = await adminApi.appointments.getAllAppointments(
                currentPage,
                itemsPerPage,
                filters
            );

            if (response.success) {
                const processedAppointments = response.data.map((appointment: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                    // Ensure doctorId is properly formatted
                    if (typeof appointment.doctorId === 'object' && appointment.doctorId !== null) {
                        return appointment;
                    } else {
                        // If doctorId is just a string, create a placeholder doctor object
                        return {
                            ...appointment,
                            doctorId: {
                                _id: appointment.doctorId,
                                name: "Unknown Doctor",
                                speciality: ""
                            }
                        };
                    }
                });

                setAppointments(processedAppointments);
                setFilteredAppointments(processedAppointments);
                setTotalPages(response.pages || 1);
                setTotalItems(response.total || processedAppointments.length);
            } else {
                setError('Failed to fetch appointments');
            }
        } catch (err: unknown) {
            console.error('Failed to fetch appointments:', err);
            setError(err instanceof Error ? err.message : 'Failed to load appointments. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Apply filters
    const applyFilters = () => {
        setCurrentPage(1);
        setShowFiltersModal(false);
        // fetchAppointments will be called due to useEffect dependency on filters
    };

    // Reset filters
    const resetFilters = () => {
        setFilters({
            status: 'all',
            date: '',
            physician: ''
        });
        setCurrentPage(1);
        setShowFiltersModal(false);
        // fetchAppointments will be called due to useEffect dependency on filters
    };

    // Filter appointments based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredAppointments(appointments);
        } else {
            const filtered = appointments.filter(appointment =>
                appointment.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.phoneNumber.includes(searchTerm) ||
                (appointment.medicalRecordNumber && appointment.medicalRecordNumber.includes(searchTerm))
            );
            setFilteredAppointments(filtered);
        }
    }, [searchTerm, appointments]);

    const viewDetails = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setShowDetailsModal(true);
    };

    const updateAppointmentStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
        try {
            setUpdatingStatus(true);
            setError('');

            const response = await adminApi.appointments.updateAppointmentStatus(id, status);

            if (response.success) {
                // Update the appointment in local state
                setAppointments(prevAppointments =>
                    prevAppointments.map(app =>
                        app._id === id ? { ...app, status } : app
                    )
                );

                setFilteredAppointments(prevAppointments =>
                    prevAppointments.map(app =>
                        app._id === id ? { ...app, status } : app
                    )
                );

                if (selectedAppointment && selectedAppointment._id === id) {
                    setSelectedAppointment({ ...selectedAppointment, status });
                }

                setSuccessMessage(`Appointment ${status === 'confirmed' ? 'confirmed' : 'cancelled'} successfully`);

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            } else {
                setError(response.message || 'Failed to update appointment status');
            }
        } catch (err: unknown) {
            console.error('Failed to update appointment status:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to update appointment status. Please try again.';
            setError(errorMessage);
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Open email modal
    const openEmailModal = () => {
        if (!selectedAppointment) return;

        // Pre-populate email subject based on appointment status
        let subject = '';
        if (selectedAppointment.status === 'confirmed') {
            subject = `Your Eye Center Appointment - Confirmed for ${formatDate(selectedAppointment.appointmentDate)}`;
        } else if (selectedAppointment.status === 'cancelled') {
            subject = `Your Eye Center Appointment - Cancelled`;
        } else {
            subject = `Your Eye Center Appointment - Update`;
        }

        setEmailForm({
            subject,
            message: `Dear ${selectedAppointment.fullName},\n\nRegarding your appointment on ${formatDate(selectedAppointment.appointmentDate)} at ${selectedAppointment.appointmentTime}.\n\n[Your message here]\n\nBest regards,\nThe Eye Center Team`
        });

        setShowEmailModal(true);
    };

    // Send email to patient
    const sendEmailToPatient = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAppointment) return;

        try {
            setSendingEmail(true);

            const response = await adminApi.appointments.sendEmailToPatient(
                selectedAppointment._id,
                emailForm.subject,
                emailForm.message
            );

            if (response.success) {
                setSuccessMessage('Email sent successfully');
                setShowEmailModal(false);

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            } else {
                setError(response.message || 'Failed to send email');
            }
        } catch (err: unknown) {
            console.error('Failed to send email:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to send email. Please try again.';
            setError(errorMessage);
        } finally {
            setSendingEmail(false);
        }
    };

    const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEmailForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 border border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border border-red-200';
            default:
                return 'bg-blue-100 text-blue-800 border border-blue-200';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const formatAppointmentDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    // Helper function to safely get doctor name
    const getDoctorName = (doctorId: any): string => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (!doctorId) return 'Unknown Doctor';

        if (typeof doctorId === 'object' && doctorId !== null && 'name' in doctorId) {
            return doctorId.name;
        }

        return 'Unknown Doctor';
    };

    return (
        <AdminLayout>
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Appointment Management</h1>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowFiltersModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                        >
                            <FaFilter className="mr-2" />
                            Filters
                        </button>
                    </div>
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

                {/* Search */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-[#FFB915] focus:border-[#FFB915]"
                            placeholder="Search by name, email, phone or medical record number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Active filters display */}
                    {(filters.status !== 'all' || filters.date || filters.physician) && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-sm text-gray-500">Active filters:</span>

                            {filters.status !== 'all' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Status: {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
                                </span>
                            )}

                            {filters.date && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Date: {new Date(filters.date).toLocaleDateString()}
                                </span>
                            )}

                            {filters.physician && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Physician: {filters.physician}
                                </span>
                            )}

                            <button
                                onClick={resetFilters}
                                className="text-sm text-red-600 hover:text-red-800"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* Appointments Table */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFB915]"></div>
                    </div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-lg text-gray-600 mb-4">No appointments found.</p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-[#FFB915] hover:text-[#008787] font-medium"
                            >
                                Clear search
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
                                            Patient
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Appointment
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
                                    {filteredAppointments.map((appointment) => (
                                        <tr key={appointment._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#FFB915]/10 flex items-center justify-center">
                                                        <FaUser className="text-[#FFB915]" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{appointment.fullName}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {appointment.isHmoRegistered ? (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                    HMO
                                                                </span>
                                                            ) : null}
                                                            {appointment.hasPreviousVisit ? (
                                                                <span className="inline-flex items-center ml-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                                    Returning
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 flex items-center">
                                                    <FaPhone className="mr-1 text-gray-400" /> {appointment.phoneNumber}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center">
                                                    <FaEnvelope className="mr-1 text-gray-400" /> {appointment.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 flex items-center">
                                                    <FaCalendarAlt className="mr-1 text-gray-400" /> {formatAppointmentDate(appointment.appointmentDate)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {appointment.appointmentTime} - {getDoctorName(appointment.doctorId)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(appointment.status)}`}>
                                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => viewDetails(appointment)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View Details"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    {appointment.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                                                                className="text-green-600 hover:text-green-900"
                                                                title="Confirm"
                                                                disabled={updatingStatus}
                                                            >
                                                                <FaCheck />
                                                            </button>
                                                            <button
                                                                onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Cancel"
                                                                disabled={updatingStatus}
                                                            >
                                                                <FaTimes />
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                            <span className="font-medium">
                                                {Math.min(currentPage * itemsPerPage, totalItems)}
                                            </span>{' '}
                                            of <span className="font-medium">{totalItems}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : 'text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span className="sr-only">Previous</span>
                                                &lt;
                                            </button>

                                            {/* Show limited page numbers with ellipsis for large page counts */}
                                            {[...Array(totalPages)].map((_, i) => {
                                                const pageNum = i + 1;

                                                // Always show first page, last page, current page, and pages adjacent to current page
                                                if (
                                                    pageNum === 1 ||
                                                    pageNum === totalPages ||
                                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                                ) {
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => setCurrentPage(pageNum)}
                                                            className={`relative inline-flex items-center px-4 py-2 border ${currentPage === pageNum
                                                                ? 'z-10 bg-[#FFB915] border-[#FFB915] text-white'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                } text-sm font-medium`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                }

                                                // Show ellipsis but avoid duplicate ellipses
                                                if (
                                                    (pageNum === 2 && currentPage > 3) ||
                                                    (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                                                ) {
                                                    return <span key={pageNum} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>;
                                                }

                                                return null;
                                            })}

                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : 'text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span className="sr-only">Next</span>
                                                &gt;
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Appointment Details Modal */}
                {showDetailsModal && selectedAppointment && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowDetailsModal(false)}></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-[#FFB915]/10 sm:mx-0 sm:h-10 sm:w-10">
                                            <FaCalendarAlt className="h-6 w-6 text-[#FFB915]" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                Appointment Details
                                            </h3>

                                            <div className="mt-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="text-sm font-medium text-gray-500">Status</div>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(selectedAppointment.status)}`}>
                                                        {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                                                    </span>
                                                </div>

                                                {selectedAppointment.status === 'pending' && (
                                                    <div className="mt-3 flex justify-end space-x-3">
                                                        <button
                                                            onClick={() => updateAppointmentStatus(selectedAppointment._id, 'confirmed')}
                                                            disabled={updatingStatus}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                        >
                                                            {updatingStatus ? <FaSpinner className="animate-spin mr-1" /> : <FaCheck className="mr-1" />}
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => updateAppointmentStatus(selectedAppointment._id, 'cancelled')}
                                                            disabled={updatingStatus}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                        >
                                                            {updatingStatus ? <FaSpinner className="animate-spin mr-1" /> : <FaTimes className="mr-1" />}
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-500">Patient Name</div>
                                                            <div className="text-sm text-gray-900">{selectedAppointment.fullName}</div>
                                                        </div>

                                                        <div>
                                                            <div className="text-sm font-medium text-gray-500">Appointment Date</div>
                                                            <div className="text-sm text-gray-900">
                                                                {formatAppointmentDate(selectedAppointment.appointmentDate)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-500">Phone Number</div>
                                                            <div className="text-sm text-gray-900 flex items-center">
                                                                <a href={`tel:${selectedAppointment.phoneNumber}`} className="hover:text-[#FFB915]">
                                                                    {selectedAppointment.phoneNumber}
                                                                </a>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="text-sm font-medium text-gray-500">Email</div>
                                                            <div className="text-sm text-gray-900">
                                                                <a href={`mailto:${selectedAppointment.email}`} className="hover:text-[#FFB915]">
                                                                    {selectedAppointment.email}
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-500">Doctor</div>
                                                            <div className="text-sm text-gray-900">
                                                                {getDoctorName(selectedAppointment.doctorId)}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="text-sm font-medium text-gray-500">Time</div>
                                                            <div className="text-sm text-gray-900">
                                                                {selectedAppointment.appointmentTime}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-500">HMO Registered</div>
                                                            <div className="text-sm text-gray-900">
                                                                {selectedAppointment.isHmoRegistered ? 'Yes' : 'No'}
                                                            </div>
                                                            {selectedAppointment.isHmoRegistered && selectedAppointment.hmoName && (
                                                                <>
                                                                    <div className="text-sm font-medium text-gray-500 mt-2">HMO Name</div>
                                                                    <div className="text-sm text-gray-900">
                                                                        {selectedAppointment.hmoName}
                                                                    </div>
                                                                    {selectedAppointment.hmoNumber && (
                                                                        <>
                                                                            <div className="text-sm font-medium text-gray-500 mt-2">HMO Number</div>
                                                                            <div className="text-sm text-gray-900">
                                                                                {selectedAppointment.hmoNumber}
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <div className="text-sm font-medium text-gray-500">Previous Visit</div>
                                                            <div className="text-sm text-gray-900">
                                                                {selectedAppointment.hasPreviousVisit ? 'Yes' : 'No'}
                                                            </div>
                                                            {selectedAppointment.hasPreviousVisit && selectedAppointment.medicalRecordNumber && (
                                                                <>
                                                                    <div className="text-sm font-medium text-gray-500 mt-2">Medical Record No.</div>
                                                                    <div className="text-sm text-gray-900">
                                                                        {selectedAppointment.medicalRecordNumber}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {selectedAppointment.briefHistory && (
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-500">Brief History</div>
                                                            <div className="text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded">
                                                                {selectedAppointment.briefHistory}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <div className="text-sm font-medium text-gray-500">Request Submitted</div>
                                                        <div className="text-sm text-gray-900">{formatDate(selectedAppointment.createdAt)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#FFB915] text-base font-medium text-white hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={openEmailModal}
                                    >
                                        <FaPaperPlane className="mr-2" />
                                        Send Email Notification
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm"
                                        onClick={() => setShowDetailsModal(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Email Modal */}
                {showEmailModal && selectedAppointment && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowEmailModal(false)}></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <form onSubmit={sendEmailToPatient}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                                        <div className="sm:flex sm:items-start">
                                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-[#FFB915]/10 sm:mx-0 sm:h-10 sm:w-10">
                                                <FaPaperPlane className="h-6 w-6 text-[#FFB915]" />
                                            </div>
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                    Send Email to Patient
                                                </h3>

                                                <div className="mt-4 space-y-4">
                                                    <div>
                                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                                                            Subject
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="subject"
                                                            id="subject"
                                                            value={emailForm.subject}
                                                            onChange={handleEmailInputChange}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FFB915] focus:border-[#FFB915] sm:text-sm"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                                            Message
                                                        </label>
                                                        <textarea
                                                            name="message"
                                                            id="message"
                                                            rows={6}
                                                            value={emailForm.message}
                                                            onChange={handleEmailInputChange}
                                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FFB915] focus:border-[#FFB915] sm:text-sm"
                                                            required
                                                        ></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="submit"
                                            disabled={sendingEmail}
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#FFB915] text-base font-medium text-white hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:ml-3 sm:w-auto sm:text-sm"
                                        >
                                            {sendingEmail ? (
                                                <>
                                                    <FaSpinner className="animate-spin mr-2" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <FaPaperPlane className="mr-2" />
                                                    Send
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm"
                                            onClick={() => setShowEmailModal(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters Modal */}
                {showFiltersModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowFiltersModal(false)}></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-[#FFB915]/10 sm:mx-0 sm:h-10 sm:w-10">
                                            <FaFilter className="h-6 w-6 text-[#FFB915]" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                Filter Appointments
                                            </h3>

                                            <div className="mt-4 space-y-4">
                                                <div>
                                                    <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Status
                                                    </label>
                                                    <select
                                                        id="statusFilter"
                                                        value={filters.status}
                                                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                                        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-[#FFB915] focus:border-[#FFB915]"
                                                    >
                                                        <option value="all">All Statuses</option>
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Appointment Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        id="dateFilter"
                                                        value={filters.date}
                                                        onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                                                        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-[#FFB915] focus:border-[#FFB915]"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="physicianFilter" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Physician
                                                    </label>
                                                    <select
                                                        id="physicianFilter"
                                                        value={filters.physician}
                                                        onChange={(e) => setFilters(prev => ({ ...prev, physician: e.target.value }))}
                                                        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-[#FFB915] focus:border-[#FFB915]"
                                                    >
                                                        {physicians.map((physician) => (
                                                            <option key={physician.value} value={physician.value}>
                                                                {physician.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        onClick={applyFilters}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#FFB915] text-base font-medium text-white hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Apply Filters
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Reset Filters
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:mt-0 sm:w-auto sm:text-sm"
                                        onClick={() => setShowFiltersModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminAppointments;