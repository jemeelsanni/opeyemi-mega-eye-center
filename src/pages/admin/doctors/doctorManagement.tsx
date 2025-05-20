// src/pages/admin/DoctorManagementPage.tsx
import React, { useState, useEffect } from 'react';
import {
    FaUserMd,
    FaEye,
    FaEdit,
    FaTrash,
    FaPowerOff,
    FaPlus,
    FaSearch,
    FaFilter,
    FaSpinner,
    FaEnvelope,
    FaPhone
} from 'react-icons/fa';
import AdminLayout from '../../../layout/adminLayout';
import apiClient from '../../../api/apiClient';
import { useAuth } from '../../../context/AuthContext';
import AddDoctor from './addDoctor';
import EditDoctor from './editDoctor';
import DoctorDetails from './doctorDetails';

interface Doctor {
    _id: string;
    name: string;
    email: string;
    speciality: string;
    phoneNumber?: string;
    bio?: string;
    image?: string;
    isActive: boolean;
    createdAt: string;
}

const DoctorManagementPage: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [filters, setFilters] = useState({
        speciality: '',
        status: 'all'
    });

    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'superadmin';

    // Fetch doctors
    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            setIsLoading(true);
            setError('');

            const response = await apiClient.get('/doctors/admin');
            setDoctors(response.data.data);
            setFilteredDoctors(response.data.data);

        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to fetch doctors:', err);
            setError(err.response?.data?.message || 'Failed to load doctors. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter doctors based on search term and filters
    useEffect(() => {
        let filtered = doctors;

        // Apply status filter
        if (filters.status !== 'all') {
            const isActive = filters.status === 'active';
            filtered = filtered.filter(doctor => doctor.isActive === isActive);
        }

        // Apply speciality filter
        if (filters.speciality) {
            filtered = filtered.filter(doctor =>
                doctor.speciality.toLowerCase().includes(filters.speciality.toLowerCase())
            );
        }

        // Apply search term
        if (searchTerm.trim()) {
            filtered = filtered.filter(doctor =>
                doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredDoctors(filtered);
    }, [searchTerm, filters, doctors]);

    // Reset filters
    const resetFilters = () => {
        setFilters({
            speciality: '',
            status: 'all'
        });
        setSearchTerm('');
        setShowFiltersModal(false);
    };

    // Toggle doctor active status
    const toggleDoctorStatus = async (doctor: Doctor) => {
        if (!isSuperAdmin) {
            setError('Only Super Admins can change doctor status');
            return;
        }

        try {
            setIsSubmitting(true);
            const newStatus = !doctor.isActive;

            await apiClient.put(`/doctors/admin/${doctor._id}/status`, {
                isActive: newStatus
            });

            // Update local state
            const updatedDoctors = doctors.map(d =>
                d._id === doctor._id ? { ...d, isActive: newStatus } : d
            );

            setDoctors(updatedDoctors);
            setSuccessMessage(`Doctor ${doctor.name} ${newStatus ? 'activated' : 'deactivated'} successfully`);

            // Clear message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(err.response?.data?.message || 'Failed to update doctor status');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete doctor
    const deleteDoctor = async () => {
        if (!selectedDoctor) return;
        if (!isSuperAdmin) {
            setError('Only Super Admins can delete doctors');
            return;
        }

        try {
            setIsSubmitting(true);
            await apiClient.delete(`/doctors/admin/${selectedDoctor._id}`);

            // Update local state
            setDoctors(doctors.filter(d => d._id !== selectedDoctor._id));
            setSuccessMessage(`Doctor ${selectedDoctor.name} deleted successfully`);

            // Close modal
            setShowDeleteModal(false);
            setSelectedDoctor(null);

            // Clear message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(err.response?.data?.message || 'Failed to delete doctor');
        } finally {
            setIsSubmitting(false);
        }
    };

    // View doctor details
    const viewDoctorDetails = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setShowDetailsModal(true);
    };

    // Edit doctor
    const editDoctor = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setShowEditModal(true);
    };

    // Handle doctor create success
    const handleDoctorCreated = (newDoctor: Doctor) => {
        setDoctors([...doctors, newDoctor]);
        setSuccessMessage(`Doctor ${newDoctor.name} created successfully`);

        // Clear message after 3 seconds
        setTimeout(() => {
            setSuccessMessage('');
        }, 3000);
    };

    // Handle doctor update success
    const handleDoctorUpdated = (updatedDoctor: Doctor) => {
        // Update the doctor in the state
        const updatedDoctors = doctors.map(d =>
            d._id === updatedDoctor._id ? updatedDoctor : d
        );

        setDoctors(updatedDoctors);
        setSuccessMessage(`Doctor ${updatedDoctor.name} updated successfully`);

        // Clear message after 3 seconds
        setTimeout(() => {
            setSuccessMessage('');
        }, 3000);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <AdminLayout>
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Doctor Management</h1>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowFiltersModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                        >
                            <FaFilter className="mr-2" />
                            Filters
                        </button>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-[#FFB915] hover:bg-[#2C4A6B] text-white font-medium rounded-lg transition-colors"
                        >
                            <FaPlus className="mr-2" />
                            Add New Doctor
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
                            placeholder="Search by name, email, or speciality..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Active filters display */}
                    {(filters.status !== 'all' || filters.speciality) && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-sm text-gray-500">Active filters:</span>

                            {filters.status !== 'all' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Status: {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
                                </span>
                            )}

                            {filters.speciality && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Speciality: {filters.speciality}
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

                {/* Doctors Table */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFB915]"></div>
                    </div>
                ) : filteredDoctors.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-lg text-gray-600 mb-4">No doctors found.</p>
                        {(searchTerm || filters.status !== 'all' || filters.speciality) && (
                            <button
                                onClick={resetFilters}
                                className="text-[#FFB915] hover:text-[#008787] font-medium"
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
                                            Doctor
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Speciality
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
                                    {filteredDoctors.map((doctor) => (
                                        <tr key={doctor._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-[#FFB915]/10 flex items-center justify-center">
                                                        {doctor.image ? (
                                                            <img
                                                                src={doctor.image}
                                                                alt={doctor.name}
                                                                className="h-full w-full object-cover"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.onerror = null;
                                                                    target.src = 'https://via.placeholder.com/40?text=DR';
                                                                }}
                                                            />
                                                        ) : (
                                                            <FaUserMd className="text-[#FFB915]" />
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            Added on {formatDate(doctor.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 flex items-center">
                                                    <FaEnvelope className="mr-1 text-gray-400" /> {doctor.email}
                                                </div>
                                                {doctor.phoneNumber && (
                                                    <div className="text-sm text-gray-500 flex items-center">
                                                        <FaPhone className="mr-1 text-gray-400" /> {doctor.phoneNumber}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{doctor.speciality}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${doctor.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {doctor.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => viewDoctorDetails(doctor)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View Details"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => editDoctor(doctor)}
                                                        className="text-yellow-600 hover:text-yellow-900"
                                                        title="Edit Doctor"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    {isSuperAdmin && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedDoctor(doctor);
                                                                    setShowDeleteModal(true);
                                                                }}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Delete Doctor"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                            <button
                                                                onClick={() => toggleDoctorStatus(doctor)}
                                                                className={`${doctor.isActive
                                                                    ? 'text-red-600 hover:text-red-900'
                                                                    : 'text-green-600 hover:text-green-900'
                                                                    }`}
                                                                title={doctor.isActive ? 'Deactivate' : 'Activate'}
                                                                disabled={isSubmitting}
                                                            >
                                                                <FaPowerOff />
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

                {/* Add Doctor Modal */}
                {showCreateModal && (
                    <AddDoctor
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={handleDoctorCreated}
                    />
                )}

                {/* Edit Doctor Modal */}
                {showEditModal && selectedDoctor && (
                    <EditDoctor
                        doctor={selectedDoctor}
                        onClose={() => setShowEditModal(false)}
                        onSuccess={handleDoctorUpdated}
                    />
                )}

                {/* View Doctor Details Modal */}
                {showDetailsModal && selectedDoctor && (
                    <DoctorDetails
                        doctor={selectedDoctor}
                        onClose={() => setShowDetailsModal(false)}
                    />
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && selectedDoctor && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowDeleteModal(false)}></div>
                            </div>

                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                            <div
                                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <FaTrash className="h-6 w-6 text-red-600" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                Delete Doctor
                                            </h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Are you sure you want to delete <strong>{selectedDoctor.name}</strong>? This action cannot be undone.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={deleteDoctor}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center">
                                                <FaSpinner className="animate-spin mr-2" />
                                                Deleting...
                                            </span>
                                        ) : (
                                            'Delete'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => setShowDeleteModal(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters Modal */}
                {showFiltersModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowFiltersModal(false)}></div>
                            </div>

                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                            <div
                                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <FaFilter className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                Filter Doctors
                                            </h3>
                                            <div className="mt-4 space-y-4">
                                                <div>
                                                    <label htmlFor="speciality-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Speciality
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="speciality-filter"
                                                        value={filters.speciality}
                                                        onChange={(e) => setFilters({ ...filters, speciality: e.target.value })}
                                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#FFB915] focus:border-[#FFB915]"
                                                        placeholder="Filter by speciality..."
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Status
                                                    </label>
                                                    <select
                                                        id="status-filter"
                                                        value={filters.status}
                                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#FFB915] focus:border-[#FFB915]"
                                                    >
                                                        <option value="all">All</option>
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#FFB915] text-base font-medium text-white hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => setShowFiltersModal(false)}
                                    >
                                        Apply Filters
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={resetFilters}
                                    >
                                        Reset Filters
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

export default DoctorManagementPage;