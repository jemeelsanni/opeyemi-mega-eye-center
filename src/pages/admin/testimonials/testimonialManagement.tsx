// src/pages/admin/testimonials/testimonialManagement.tsx
import React, { useState, useEffect } from 'react';
import {
    FaStar,
    FaEye,
    FaEdit,
    FaTrash,
    FaCheck,
    FaTimes,
    FaSpinner,
    FaSearch,
    FaFilter,
    FaUserCircle
} from 'react-icons/fa';
import AdminLayout from '../../../layout/adminLayout';
import { testimonialApi, Testimonial } from '../../../api/apiClient';
import TestimonialDetails from './testimonialDetails';
import EditTestimonial from './editTestimonial';

const TestimonialManagement: React.FC = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');
    const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch testimonials
    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            setIsLoading(true);
            setError('');

            const response = await testimonialApi.getAllAdminTestimonials();
            setTestimonials(response.data);
            setFilteredTestimonials(response.data);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to fetch testimonials:', err);
            setError(err.response?.data?.message || 'Failed to load testimonials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter testimonials based on search term and filter status
    useEffect(() => {
        let filtered = testimonials;

        // Apply status filter
        if (filterStatus !== 'all') {
            const isApproved = filterStatus === 'approved';
            filtered = filtered.filter(testimonial => testimonial.isApproved === isApproved);
        }

        // Apply search term
        if (searchTerm.trim()) {
            filtered = filtered.filter(testimonial =>
                testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                testimonial.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                testimonial.review.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredTestimonials(filtered);
    }, [searchTerm, filterStatus, testimonials]);

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

    // View testimonial details
    const viewTestimonialDetails = (testimonial: Testimonial) => {
        setSelectedTestimonial(testimonial);
        setShowDetailsModal(true);
    };

    // Edit testimonial
    const editTestimonial = (testimonial: Testimonial) => {
        setSelectedTestimonial(testimonial);
        setShowEditModal(true);
    };

    // Delete testimonial
    const deleteTestimonial = async () => {
        if (!selectedTestimonial) return;

        try {
            setIsSubmitting(true);
            setError('');

            await testimonialApi.deleteTestimonial(selectedTestimonial._id);

            // Update local state by removing the deleted testimonial
            setTestimonials(testimonials.filter(t => t._id !== selectedTestimonial._id));
            setSuccessMessage(`Testimonial from ${selectedTestimonial.name} deleted successfully`);

            // Close modal
            setShowDeleteModal(false);
            setSelectedTestimonial(null);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to delete testimonial:', err);
            setError(err.response?.data?.message || 'Failed to delete testimonial. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const approveTestimonial = async (testimonial: Testimonial) => {
        try {
            setIsSubmitting(true);
            setError('');

            const response = await testimonialApi.approveTestimonial(testimonial._id);

            // Update local state
            setTestimonials(
                testimonials.map(t => (t._id === testimonial._id ? response.data : t))
            );

            setSuccessMessage(`Testimonial from ${testimonial.name} approved successfully`);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to approve testimonial:', err);
            setError(err.response?.data?.message || 'Failed to approve testimonial. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reject testimonial
    const rejectTestimonial = async (testimonial: Testimonial) => {
        try {
            setIsSubmitting(true);
            setError('');

            const response = await testimonialApi.rejectTestimonial(testimonial._id);

            // Update local state
            setTestimonials(
                testimonials.map(t => (t._id === testimonial._id ? response.data : t))
            );

            setSuccessMessage(`Testimonial from ${testimonial.name} rejected successfully`);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to reject testimonial:', err);
            setError(err.response?.data?.message || 'Failed to reject testimonial. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle testimonial updated
    const handleTestimonialUpdated = (updatedTestimonial: Testimonial) => {
        // Update the testimonial in the state
        setTestimonials(
            testimonials.map(t => (t._id === updatedTestimonial._id ? updatedTestimonial : t))
        );

        setSuccessMessage(`Testimonial from ${updatedTestimonial.name} updated successfully`);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    return (
        <AdminLayout>
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Testimonial Management</h1>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => setFilterStatus('pending')}
                            className={`inline-flex items-center px-4 py-2 ${filterStatus === 'pending'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-yellow-100 text-yellow-800'
                                } font-medium rounded-lg transition-colors`}
                        >
                            <FaFilter className="mr-2" />
                            Pending Approval
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
                                    placeholder="Search by name, position, or content..."
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
                                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'approved' | 'pending')}
                                >
                                    <option value="all">All Testimonials</option>
                                    <option value="approved">Approved</option>
                                    <option value="pending">Pending</option>
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

                {/* Testimonials Table */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFB915]"></div>
                    </div>
                ) : filteredTestimonials.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-lg text-gray-600 mb-4">No testimonials found.</p>
                        {(searchTerm || filterStatus !== 'all') && (
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
                                            Customer
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rating
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Review
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredTestimonials.map((testimonial) => (
                                        <tr key={testimonial._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                                                        {testimonial.image ? (
                                                            <img
                                                                src={testimonial.image}
                                                                alt={testimonial.name}
                                                                className="h-full w-full object-cover"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.onerror = null;
                                                                    target.src = 'https://via.placeholder.com/40?text=User';
                                                                }}
                                                            />
                                                        ) : (
                                                            <FaUserCircle className="h-full w-full text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{testimonial.name}</div>
                                                        <div className="text-sm text-gray-500">{testimonial.position}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex">
                                                    {Array.from({ length: 5 }, (_, i) => (
                                                        <FaStar
                                                            key={i}
                                                            className={`${i < testimonial.rating ? 'text-[#FFB915]' : 'text-gray-300'
                                                                } w-4 h-4`}
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 truncate w-48">
                                                    {testimonial.review.length > 60
                                                        ? `${testimonial.review.substring(0, 60)}...`
                                                        : testimonial.review}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${testimonial.isApproved
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                >
                                                    {testimonial.isApproved ? 'Approved' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatDate(testimonial.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => viewTestimonialDetails(testimonial)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View Details"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => editTestimonial(testimonial)}
                                                        className="text-yellow-600 hover:text-yellow-900"
                                                        title="Edit Testimonial"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTestimonial(testimonial);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete Testimonial"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                    {!testimonial.isApproved ? (
                                                        <button
                                                            onClick={() => approveTestimonial(testimonial)}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Approve Testimonial"
                                                            disabled={isSubmitting}
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => rejectTestimonial(testimonial)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Reject Testimonial"
                                                            disabled={isSubmitting}
                                                        >
                                                            <FaTimes />
                                                        </button>
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

                {/* View Testimonial Details Modal */}
                {showDetailsModal && selectedTestimonial && (
                    <TestimonialDetails
                        testimonial={selectedTestimonial}
                        onClose={() => setShowDetailsModal(false)}
                        onApprove={approveTestimonial}
                        onReject={rejectTestimonial}
                    />
                )}

                {/* Edit Testimonial Modal */}
                {showEditModal && selectedTestimonial && (
                    <EditTestimonial
                        testimonial={selectedTestimonial}
                        onClose={() => setShowEditModal(false)}
                        onSuccess={handleTestimonialUpdated}
                    />
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && selectedTestimonial && (
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
                                                Delete Testimonial
                                            </h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Are you sure you want to delete the testimonial from <strong>{selectedTestimonial.name}</strong>? This action cannot be undone.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={deleteTestimonial}
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
            </div>
        </AdminLayout>
    );
};

export default TestimonialManagement;