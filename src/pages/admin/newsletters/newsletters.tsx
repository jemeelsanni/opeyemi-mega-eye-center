import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaSearch, FaCalendarAlt, FaToggleOn, FaToggleOff, FaPaperPlane } from 'react-icons/fa';
import AdminLayout from '../../../layout/adminLayout';
import apiClient from '../../../api/apiClient';

interface Subscriber {
    _id: string;
    email: string;
    isActive: boolean;
    subscribedAt: string;
    unsubscribedAt?: string;
}

const AdminNewsletters: React.FC = () => {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showSendModal, setShowSendModal] = useState(false);
    const [newsletterSubject, setNewsletterSubject] = useState('');
    const [newsletterContent, setNewsletterContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        fetchSubscribers();
    }, [currentPage, statusFilter]);

    const fetchSubscribers = async () => {
        try {
            setIsLoading(true);
            setError('');

            const isActive = statusFilter !== 'all' ? `&isActive=${statusFilter === 'active'}` : '';
            const response = await apiClient.get(`/admin/subscribers?page=${currentPage}&limit=${itemsPerPage}${isActive}`);

            setSubscribers(response.data.data);
            setFilteredSubscribers(response.data.data);
            setTotalPages(response.data.pages);
        } catch (err) {
            console.error('Failed to fetch subscribers:', err);
            setError('Failed to load subscribers. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredSubscribers(subscribers);
        } else {
            const filtered = subscribers.filter(subscriber =>
                subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredSubscribers(filtered);
        }
    }, [searchTerm, subscribers]);

    useEffect(() => {
        if (selectAll) {
            setSelectedSubscribers(filteredSubscribers.filter(s => s.isActive).map(s => s._id));
        } else {
            setSelectedSubscribers([]);
        }
    }, [selectAll, filteredSubscribers]);

    const toggleSubscriberStatus = async (id: string, newStatus: boolean) => {
        try {
            // In a real app, you'd have an API endpoint to update subscriber status
            // For now, we'll just simulate a delay and update the local state
            await new Promise(resolve => setTimeout(resolve, 500));

            setSubscribers(prevSubscribers =>
                prevSubscribers.map(subscriber =>
                    subscriber._id === id ? { ...subscriber, isActive: newStatus } : subscriber
                )
            );

            setFilteredSubscribers(prevSubscribers =>
                prevSubscribers.map(subscriber =>
                    subscriber._id === id ? { ...subscriber, isActive: newStatus } : subscriber
                )
            );
        } catch (err) {
            console.error('Failed to update subscriber status:', err);
            setError('Failed to update subscriber status. Please try again.');
        }
    };

    const handleSendNewsletter = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newsletterSubject.trim() || !newsletterContent.trim()) {
            setError('Please enter both subject and content');
            return;
        }

        if (selectedSubscribers.length === 0) {
            setError('Please select at least one subscriber');
            return;
        }

        setIsSending(true);

        try {
            // In a real app, you'd have an API endpoint to send the newsletter
            // For now, we'll just simulate a delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            setIsSending(false);
            setShowSendModal(false);
            setNewsletterSubject('');
            setNewsletterContent('');
            setSelectedSubscribers([]);
            setSelectAll(false);

            // Show success feedback
            alert(`Newsletter sent to ${selectedSubscribers.length} subscriber(s)!`);
        } catch (err) {
            console.error('Failed to send newsletter:', err);
            setError('Failed to send newsletter. Please try again.');
            setIsSending(false);
        }
    };

    const handleSelectSubscriber = (id: string) => {
        if (selectedSubscribers.includes(id)) {
            setSelectedSubscribers(prev => prev.filter(s => s !== id));
        } else {
            setSelectedSubscribers(prev => [...prev, id]);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    return (
        <AdminLayout>
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Newsletter Subscribers</h1>

                    <button
                        onClick={() => {
                            if (filteredSubscribers.filter(s => s.isActive).length === 0) {
                                setError('There are no active subscribers to send a newsletter to');
                                return;
                            }
                            setShowSendModal(true);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-[#FFA500] hover:bg-[#FF9000] text-white font-medium rounded-lg transition-colors"
                    >
                        <FaPaperPlane className="mr-2" />
                        Send Newsletter
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                        {error}
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="search" className="sr-only">Search</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="search"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-[#FFA500] focus:border-[#FFA500]"
                                    placeholder="Search by email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                id="status"
                                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-[#FFA500] focus:border-[#FFA500]"
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1); // Reset to first page on filter change
                                }}
                            >
                                <option value="all">All Subscribers</option>
                                <option value="active">Active</option>
                                <option value="inactive">Unsubscribed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Subscribers Table */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFA500]"></div>
                    </div>
                ) : filteredSubscribers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-lg text-gray-600 mb-4">No subscribers found.</p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-[#FFA500] hover:text-[#FF9000] font-medium"
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
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 text-[#FFA500] focus:ring-[#FFA500] border-gray-300 rounded"
                                                    checked={selectAll}
                                                    onChange={() => setSelectAll(!selectAll)}
                                                    disabled={filteredSubscribers.filter(s => s.isActive).length === 0}
                                                />
                                            </div>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subscription Date
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
                                    {filteredSubscribers.map((subscriber) => (
                                        <tr key={subscriber._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 text-[#FFA500] focus:ring-[#FFA500] border-gray-300 rounded"
                                                        checked={selectedSubscribers.includes(subscriber._id)}
                                                        onChange={() => handleSelectSubscriber(subscriber._id)}
                                                        disabled={!subscriber.isActive}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#FFA500]/10 flex items-center justify-center">
                                                        <FaEnvelope className="text-[#FFA500]" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{subscriber.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 flex items-center">
                                                    <FaCalendarAlt className="mr-2 text-gray-400" /> {formatDate(subscriber.subscribedAt)}
                                                </div>
                                                {subscriber.unsubscribedAt && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Unsubscribed on {formatDate(subscriber.unsubscribedAt)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${subscriber.isActive
                                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                                    : 'bg-red-100 text-red-800 border border-red-200'}`}>
                                                    {subscriber.isActive ? 'Active' : 'Unsubscribed'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => toggleSubscriberStatus(subscriber._id, !subscriber.isActive)}
                                                    className={`text-sm ${subscriber.isActive
                                                        ? 'text-red-600 hover:text-red-900'
                                                        : 'text-green-600 hover:text-green-900'}`}
                                                    title={subscriber.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {subscriber.isActive ? (
                                                        <div className="flex items-center">
                                                            <FaToggleOn className="mr-1" /> Unsubscribe
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            <FaToggleOff className="mr-1" /> Reactivate
                                                        </div>
                                                    )}
                                                </button>
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
                                                {Math.min(currentPage * itemsPerPage, filteredSubscribers.length)}
                                            </span>{' '}
                                            of <span className="font-medium">{filteredSubscribers.length}</span> results
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
                                                        ? 'z-10 bg-[#FFA500] border-[#FFA500] text-white'
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

                {/* Send Newsletter Modal */}
                {showSendModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowSendModal(false)}></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-[#FFA500]/10 sm:mx-0 sm:h-10 sm:w-10">
                                            <FaPaperPlane className="h-6 w-6 text-[#FFA500]" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                Send Newsletter
                                            </h3>

                                            <form onSubmit={handleSendNewsletter} className="mt-4">
                                                <div className="mb-4">
                                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Subject
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="subject"
                                                        value={newsletterSubject}
                                                        onChange={(e) => setNewsletterSubject(e.target.value)}
                                                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#FFA500] focus:border-[#FFA500]"
                                                        placeholder="Enter newsletter subject..."
                                                        required
                                                    />
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Content
                                                    </label>
                                                    <textarea
                                                        id="content"
                                                        rows={10}
                                                        value={newsletterContent}
                                                        onChange={(e) => setNewsletterContent(e.target.value)}
                                                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#FFA500] focus:border-[#FFA500]"
                                                        placeholder="Enter newsletter content..."
                                                        required
                                                    />
                                                </div>

                                                <div className="mt-3 flex items-center">
                                                    <span className="text-sm text-gray-500">
                                                        Sending to {selectedSubscribers.length} active subscriber(s)
                                                    </span>
                                                </div>

                                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                                    <button
                                                        type="submit"
                                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#FFA500] text-base font-medium text-white hover:bg-[#FF9000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFA500] sm:ml-3 sm:w-auto sm:text-sm"
                                                        disabled={isSending}
                                                    >
                                                        {isSending ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Sending...
                                                            </>
                                                        ) : (
                                                            'Send Newsletter'
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFA500] sm:mt-0 sm:w-auto sm:text-sm"
                                                        onClick={() => setShowSendModal(false)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminNewsletters;