import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaUser, FaPhone, FaSearch, FaEye, FaReply, FaCheck, FaTimes, FaFilter, FaSpinner } from 'react-icons/fa';
import AdminLayout from '../../../layout/adminLayout';
import apiClient from '../../../api/apiClient';

interface Contact {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    message: string;
    status: 'unread' | 'read' | 'replied';
    createdAt: string;
    updatedAt?: string;
    replyMessage?: string;
    replyDate?: string;
}

interface ContactFilters {
    status: string;
    date: string;
}

const AdminContacts: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<ContactFilters>({
        status: 'all',
        date: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, [currentPage]);

    const fetchContacts = async () => {
        try {
            setIsLoading(true);
            setError('');

            // In a real app, you'd pass filters to the backend
            const status = filters.status !== 'all' ? `&status=${filters.status}` : '';
            const date = filters.date ? `&date=${filters.date}` : '';

            const response = await apiClient.get(`/admin/contacts?page=${currentPage}&limit=${itemsPerPage}${status}${date}`);

            setContacts(response.data.data);
            setFilteredContacts(response.data.data);
            setTotalPages(response.data.pages);
        } catch (err: unknown) {
            console.error('Failed to fetch contacts:', err);
            interface ApiErrorResponse {
                response?: {
                    data?: {
                        message?: string;
                    };
                };
            }

            if (err && typeof err === 'object' && 'response' in err) {
                const errorResponse = (err as ApiErrorResponse).response;
                setError(errorResponse?.data?.message || 'Failed to load contact messages. Please try again.');
            } else {
                setError('Failed to load contact messages. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Apply filters
    const applyFilters = () => {
        setCurrentPage(1);
        fetchContacts();
        setShowFiltersModal(false);
    };

    // Reset filters
    const resetFilters = () => {
        setFilters({
            status: 'all',
            date: ''
        });
        setCurrentPage(1);
        fetchContacts();
        setShowFiltersModal(false);
    };

    // Filter contacts based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredContacts(contacts);
        } else {
            const filtered = contacts.filter(contact =>
                contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.phoneNumber.includes(searchTerm) ||
                contact.message.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredContacts(filtered);
        }
    }, [searchTerm, contacts]);

    const viewDetails = (contact: Contact) => {
        setSelectedContact(contact);
        setShowDetailsModal(true);
        setShowReplyForm(false);
        setReplyMessage('');

        // If the contact is unread, mark it as read
        if (contact.status === 'unread') {
            updateContactStatus(contact._id, 'read');
        }
    };

    const updateContactStatus = async (id: string, status: string) => {
        try {
            await apiClient.put(`/admin/contacts/${id}`, { status });

            // Update local state
            setContacts(prevContacts =>
                prevContacts.map(contact =>
                    contact._id === id ? { ...contact, status: status as 'unread' | 'read' | 'replied' } : contact
                )
            );

            setFilteredContacts(prevContacts =>
                prevContacts.map(contact =>
                    contact._id === id ? { ...contact, status: status as 'unread' | 'read' | 'replied' } : contact
                )
            );

            if (selectedContact && selectedContact._id === id) {
                setSelectedContact({ ...selectedContact, status: status as 'unread' | 'read' | 'replied' });
            }

            setSuccessMessage(`Message marked as ${status}`);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const apiError = err as { response?: { data?: { message?: string } } };
                setError(apiError.response?.data?.message || 'Failed to perform action. Please try again.');
            } else {
                setError('Failed to perform action. Please try again.');
            }
            console.error('Failed to update contact status:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const apiError = err as { response?: { data?: { message?: string } } };
                setError(apiError.response?.data?.message || 'Failed to update message status. Please try again.');
            } else {
                setError('Failed to update message status. Please try again.');
            }
        }
    };

    const handleBulkAction = async (action: 'markRead' | 'markReplied' | 'delete', ids: string[]) => {
        if (ids.length === 0) return;

        try {
            setIsLoading(true);

            if (action === 'markRead' || action === 'markReplied') {
                const status = action === 'markRead' ? 'read' : 'replied';

                await Promise.all(ids.map(id =>
                    apiClient.put(`/admin/contacts/${id}`, { status })
                ));

                // Update local state
                setContacts(prevContacts =>
                    prevContacts.map(contact =>
                        ids.includes(contact._id) ? { ...contact, status: status as 'unread' | 'read' | 'replied' } : contact
                    )
                );

                setFilteredContacts(prevContacts =>
                    prevContacts.map(contact =>
                        ids.includes(contact._id) ? { ...contact, status: status as 'unread' | 'read' | 'replied' } : contact
                    )
                );

                setSuccessMessage(`${ids.length} messages marked as ${status}`);
            } else if (action === 'delete') {
                await Promise.all(ids.map(id =>
                    apiClient.delete(`/admin/contacts/${id}`)
                ));

                // Update local state
                setContacts(prevContacts =>
                    prevContacts.filter(contact => !ids.includes(contact._id))
                );

                setFilteredContacts(prevContacts =>
                    prevContacts.filter(contact => !ids.includes(contact._id))
                );

                setSuccessMessage(`${ids.length} messages deleted`);
            }

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err: unknown) {
            console.error('Failed to perform bulk action:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const apiError = err as { response?: { data?: { message?: string } } };
                setError(apiError.response?.data?.message || 'Failed to perform action. Please try again.');
            } else {
                setError('Failed to perform action. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedContact) return;
        if (!replyMessage.trim()) {
            setError('Please enter a reply message');
            return;
        }

        setIsSending(true);
        setError('');

        try {
            // In a real app, you'd have an API endpoint to send the email
            await apiClient.post('/admin/send-email', {
                to: selectedContact.email,
                subject: `Re: Your Contact Message to Opeyemi Eye Center`,
                message: replyMessage
            });

            // Update the contact status to replied
            await updateContactStatus(selectedContact._id, 'replied');

            // Update the selectedContact with the reply
            setSelectedContact({
                ...selectedContact,
                status: 'replied',
                replyMessage: replyMessage,
                replyDate: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            setIsSending(false);
            setReplyMessage('');
            setShowReplyForm(false);
            setSuccessMessage('Reply sent successfully!');

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err: unknown) {
            console.error('Failed to send reply:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const apiError = err as { response?: { data?: { message?: string } } };
                setError(apiError.response?.data?.message || 'Failed to send reply. Please try again.');
            } else {
                setError('Failed to send reply. Please try again.');
            }
            setIsSending(false);
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'replied':
                return 'bg-green-100 text-green-800 border border-green-200';
            case 'read':
                return 'bg-blue-100 text-blue-800 border border-blue-200';
            case 'unread':
                return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200';
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

    return (
        <AdminLayout>
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Contact Message Management</h1>

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
                            placeholder="Search by name, email, phone or message content..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Active filters display */}
                    {(filters.status !== 'all' || filters.date) && (
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

                            <button
                                onClick={resetFilters}
                                className="text-sm text-red-600 hover:text-red-800"
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    {/* Bulk Actions */}
                    {filteredContacts.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-sm text-gray-500">Bulk actions:</span>

                            <button
                                onClick={() => handleBulkAction('markRead', filteredContacts.filter(c => c.status === 'unread').map(c => c._id))}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                                disabled={!filteredContacts.some(c => c.status === 'unread')}
                            >
                                <FaCheck className="mr-1" /> Mark All as Read
                            </button>

                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete all filtered messages?')) {
                                        handleBulkAction('delete', filteredContacts.map(c => c._id));
                                    }
                                }}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
                            >
                                <FaTimes className="mr-1" /> Delete All Filtered
                            </button>
                        </div>
                    )}
                </div>

                {/* Contacts Table */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFB915]"></div>
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-lg text-gray-600 mb-4">No contact messages found.</p>
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
                                            Sender
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Message
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
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
                                    {filteredContacts.map((contact) => (
                                        <tr
                                            key={contact._id}
                                            className={`hover:bg-gray-50 ${contact.status === 'unread' ? 'bg-yellow-50' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#FFB915]/10 flex items-center justify-center">
                                                        <FaUser className="text-[#FFB915]" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{contact.fullName}</div>
                                                        <div className="text-sm text-gray-500 flex items-center">
                                                            <FaEnvelope className="mr-1 text-xs" /> {contact.email}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center">
                                                            <FaPhone className="mr-1 text-xs" /> {contact.phoneNumber}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 line-clamp-2">
                                                    {contact.message}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(contact.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(contact.status)}`}>
                                                    {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => viewDetails(contact)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View Details"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    {contact.status !== 'replied' && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    viewDetails(contact);
                                                                    setShowReplyForm(true);
                                                                }}
                                                                className="text-green-600 hover:text-green-900"
                                                                title="Reply"
                                                            >
                                                                <FaReply />
                                                            </button>
                                                            {contact.status === 'unread' && (
                                                                <button
                                                                    onClick={() => updateContactStatus(contact._id, 'read')}
                                                                    className="text-gray-600 hover:text-gray-900"
                                                                    title="Mark as Read"
                                                                >
                                                                    <FaCheck />
                                                                </button>
                                                            )}
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
                                                {Math.min(currentPage * itemsPerPage, filteredContacts.length)}
                                            </span>{' '}
                                            of <span className="font-medium">{filteredContacts.length}</span> results
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

                                            {/* Page numbers */}
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`relative inline-flex items-center px-4 py-2 border ${currentPage === page
                                                        ? 'z-10 bg-[#FFB915] border-[#FFB915] text-white'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        } text-sm font-medium`}
                                                >
                                                    {page}
                                                </button>
                                            ))}

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

                {/* Contact Details Modal */}
                {showDetailsModal && selectedContact && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => {
                                setShowDetailsModal(false);
                                setShowReplyForm(false);
                            }}></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-[#FFB915]/10 sm:mx-0 sm:h-10 sm:w-10">
                                            <FaEnvelope className="h-6 w-6 text-[#FFB915]" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                    Contact Message
                                                </h3>
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(selectedContact.status)}`}>
                                                    {selectedContact.status.charAt(0).toUpperCase() + selectedContact.status.slice(1)}
                                                </span>
                                            </div>

                                            <div className="mt-4">
                                                <div className="mb-4">
                                                    <div className="text-sm font-medium text-gray-500">From</div>
                                                    <div className="text-sm text-gray-900">{selectedContact.fullName}</div>
                                                    <div className="text-sm text-gray-500">
                                                        <a href={`mailto:${selectedContact.email}`} className="hover:text-[#FFB915]">
                                                            {selectedContact.email}
                                                        </a>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        <a href={`tel:${selectedContact.phoneNumber}`} className="hover:text-[#FFB915]">
                                                            {selectedContact.phoneNumber}
                                                        </a>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <div className="text-sm font-medium text-gray-500">Date</div>
                                                    <div className="text-sm text-gray-900">{formatDate(selectedContact.createdAt)}</div>
                                                </div>

                                                <div className="mb-4">
                                                    <div className="text-sm font-medium text-gray-500">Message</div>
                                                    <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-900 whitespace-pre-wrap">
                                                        {selectedContact.message}
                                                    </div>
                                                </div>

                                                {/* Show reply if exists */}
                                                {selectedContact.replyMessage && (
                                                    <div className="mb-4 border-t border-gray-200 pt-3 mt-3">
                                                        <div className="text-sm font-medium text-gray-500">Your Reply</div>
                                                        <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm text-gray-900 whitespace-pre-wrap">
                                                            {selectedContact.replyMessage}
                                                        </div>
                                                        {selectedContact.replyDate && (
                                                            <div className="text-xs text-gray-500 mt-1 text-right">
                                                                Sent on {formatDate(selectedContact.replyDate)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {showReplyForm ? (
                                                    <div className="mt-6 border-t border-gray-200 pt-3">
                                                        <div className="text-sm font-medium text-gray-500 mb-2">Reply</div>
                                                        <form onSubmit={handleReply}>
                                                            <textarea
                                                                rows={5}
                                                                value={replyMessage}
                                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-[#FFB915] focus:border-[#FFB915]"
                                                                placeholder="Type your reply here..."
                                                                required
                                                            />
                                                            <div className="mt-3 flex justify-end space-x-3">
                                                                <button
                                                                    type="button"
                                                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915]"
                                                                    onClick={() => setShowReplyForm(false)}
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    type="submit"
                                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#FFB915] hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915]"
                                                                    disabled={isSending}
                                                                >
                                                                    {isSending ? (
                                                                        <>
                                                                            <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                                                                            Sending...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <FaReply className="mr-2" />
                                                                            Send Reply
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                ) : (
                                                    <div className="mt-6 flex justify-end space-x-3">
                                                        {selectedContact.status !== 'replied' && (
                                                            <button
                                                                type="button"
                                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#FFB915] hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915]"
                                                                onClick={() => setShowReplyForm(true)}
                                                            >
                                                                <FaReply className="mr-2" />
                                                                Reply
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    {selectedContact.status === 'unread' && (
                                        <button
                                            type="button"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                            onClick={() => updateContactStatus(selectedContact._id, 'read')}
                                        >
                                            <FaCheck className="mr-2" />
                                            Mark as Read
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            setShowReplyForm(false);
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
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
                                                Filter Messages
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
                                                        <option value="unread">Unread</option>
                                                        <option value="read">Read</option>
                                                        <option value="replied">Replied</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        id="dateFilter"
                                                        value={filters.date}
                                                        onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                                                        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-[#FFB915] focus:border-[#FFB915]"
                                                    />
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

export default AdminContacts;