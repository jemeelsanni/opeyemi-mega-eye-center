import React, { useState, useEffect, useCallback } from 'react';
import {
    FaEye,
    FaSearch,
    FaTimes,
    FaPlay,
    FaDownload,
    FaCalendarAlt,
    FaUsers,
    FaEnvelopeOpen,
    FaExclamationTriangle,
    FaCheckCircle,
    FaClock,
    FaFilter
} from 'react-icons/fa';
import AdminLayout from '../../../layout/adminLayout';
import { emailApi, Email as ApiEmail, } from '../../../api/apiClient'; // Fixed: Import types from API client

// Fixed: Use API client interfaces for consistency
interface Email extends ApiEmail {
    // Extend with any additional properties if needed
}

// interface EmailRecipient extends ApiEmailRecipient {
//     // Extend with any additional properties if needed
// }

const EmailCampaigns: React.FC = () => {
    const [campaigns, setCampaigns] = useState<Email[]>([]);
    const [filteredCampaigns, setFilteredCampaigns] = useState<Email[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Modal states
    const [selectedCampaign, setSelectedCampaign] = useState<Email | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Filter and search states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [templateFilter, setTemplateFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Fixed: Use useCallback to memoize filterCampaigns function
    const filterCampaigns = useCallback(() => {
        let filtered = campaigns;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(campaign =>
                campaign.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                campaign.sender.fullName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(campaign => campaign.status === statusFilter);
        }

        // Template filter
        if (templateFilter !== 'all') {
            filtered = filtered.filter(campaign => campaign.template === templateFilter);
        }

        // Date range filter
        if (dateRange.start) {
            filtered = filtered.filter(campaign =>
                new Date(campaign.createdAt) >= new Date(dateRange.start)
            );
        }
        if (dateRange.end) {
            filtered = filtered.filter(campaign =>
                new Date(campaign.createdAt) <= new Date(dateRange.end)
            );
        }

        setFilteredCampaigns(filtered);
        setCurrentPage(1);
    }, [campaigns, searchTerm, statusFilter, templateFilter, dateRange]);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    // Fixed: Include filterCampaigns in dependency array
    useEffect(() => {
        filterCampaigns();
    }, [filterCampaigns]);

    const fetchCampaigns = async () => {
        try {
            setIsLoading(true);
            const response = await emailApi.getAllEmails({
                page: 1,
                limit: 100 // Get all campaigns for filtering
            });
            if (response.success) {
                setCampaigns(response.data);
            }
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to fetch campaigns:', error);
            setError('Failed to load email campaigns');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCampaign = async (campaignId: string) => {
        if (!window.confirm('Are you sure you want to resend this campaign to failed recipients?')) {
            return;
        }

        try {
            setIsLoading(true);
            await emailApi.resendEmail(campaignId);
            setSuccessMessage('Campaign resent successfully!');
            fetchCampaigns();
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to resend campaign:', error);
            setError(error.response?.data?.message || 'Failed to resend campaign');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetails = (campaign: Email) => {
        setSelectedCampaign(campaign);
        setShowDetailsModal(true);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: FaClock },
            scheduled: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FaCalendarAlt },
            sending: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FaPlay },
            sent: { bg: 'bg-green-100', text: 'text-green-800', icon: FaCheckCircle },
            failed: { bg: 'bg-red-100', text: 'text-red-800', icon: FaExclamationTriangle }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon className="mr-1 h-3 w-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const priorityConfig = {
            low: { bg: 'bg-gray-100', text: 'text-gray-800' },
            normal: { bg: 'bg-blue-100', text: 'text-blue-800' },
            high: { bg: 'bg-red-100', text: 'text-red-800' }
        };

        const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.normal;

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    };

    const exportCampaignData = (campaign: Email) => {
        const csvContent = [
            ['Email', 'Name', 'Status', 'Sent At', 'Delivered At', 'Failure Reason'],
            ...campaign.recipients.map(recipient => [
                recipient.email,
                recipient.name || '',
                recipient.status,
                recipient.sentAt ? formatDate(recipient.sentAt) : '',
                recipient.deliveredAt ? formatDate(recipient.deliveredAt) : '',
                recipient.failureReason || ''
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `campaign-${campaign.subject.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    // Pagination
    const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCampaigns = filteredCampaigns.slice(startIndex, endIndex);

    const templateOptions = [
        { value: 'all', label: 'All Templates' },
        { value: 'newsletter', label: 'Newsletter' },
        { value: 'appointment', label: 'Appointment' },
        { value: 'promotional', label: 'Promotional' },
        { value: 'notification', label: 'Notification' },
        { value: 'custom', label: 'Custom' }
    ];

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'draft', label: 'Draft' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'sending', label: 'Sending' },
        { value: 'sent', label: 'Sent' },
        { value: 'failed', label: 'Failed' }
    ];

    return (
        <AdminLayout>
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Email Campaigns</h1>
                    <div className="text-sm text-gray-600">
                        Total: {filteredCampaigns.length} campaigns
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                        {error}
                        <button onClick={() => setError('')} className="ml-4 text-red-500 hover:text-red-700">
                            <FaTimes />
                        </button>
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
                        {successMessage}
                        <button onClick={() => setSuccessMessage('')} className="ml-4 text-green-500 hover:text-green-700">
                            <FaTimes />
                        </button>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search campaigns..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-[#FFB915] focus:border-[#FFB915] w-full"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={templateFilter}
                                onChange={(e) => setTemplateFilter(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                            >
                                {templateOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    setTemplateFilter('all');
                                    setDateRange({ start: '', end: '' });
                                }}
                                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                <FaFilter className="mr-2" />
                                Clear Filters
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915] w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915] w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Campaigns Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFB915] mx-auto"></div>
                                <p className="mt-2 text-gray-500">Loading campaigns...</p>
                            </div>
                        </div>
                    ) : currentCampaigns.length === 0 ? (
                        <div className="text-center py-12">
                            <FaEnvelopeOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
                            <p className="text-gray-500">
                                {searchTerm || statusFilter !== 'all' || templateFilter !== 'all' || dateRange.start || dateRange.end
                                    ? 'Try adjusting your filters to see more campaigns.'
                                    : 'No email campaigns have been created yet.'
                                }
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Campaign
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Recipients
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Performance
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentCampaigns.map((campaign) => (
                                            <tr key={campaign._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {campaign.subject}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                by {campaign.sender.fullName}
                                                            </p>
                                                            <div className="flex items-center mt-1 space-x-2">
                                                                {getPriorityBadge(campaign.priority)}
                                                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                                                    {campaign.template}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        <div className="flex items-center">
                                                            <FaUsers className="mr-1 h-4 w-4 text-gray-400" />
                                                            {campaign.totalRecipients}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {campaign.sentCount} sent • {campaign.failedCount} failed
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(campaign.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div>
                                                        <div className="flex items-center">
                                                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                                <div
                                                                    className="bg-green-600 h-2 rounded-full"
                                                                    style={{
                                                                        width: `${campaign.totalRecipients > 0
                                                                            ? (campaign.deliveredCount / campaign.totalRecipients) * 100
                                                                            : 0}%`
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs">
                                                                {campaign.totalRecipients > 0
                                                                    ? Math.round((campaign.deliveredCount / campaign.totalRecipients) * 100)
                                                                    : 0}%
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {campaign.openRate.toFixed(1)}% open rate
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div>
                                                        {formatDate(campaign.createdAt)}
                                                        {campaign.scheduledFor && (
                                                            <div className="text-xs text-blue-600 mt-1">
                                                                Scheduled: {formatDate(campaign.scheduledFor)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button
                                                            onClick={() => handleViewDetails(campaign)}
                                                            className="text-[#FFB915] hover:text-[#2C4A6B] p-1"
                                                            title="View Details"
                                                        >
                                                            <FaEye />
                                                        </button>
                                                        <button
                                                            onClick={() => exportCampaignData(campaign)}
                                                            className="text-green-600 hover:text-green-800 p-1"
                                                            title="Export Data"
                                                        >
                                                            <FaDownload />
                                                        </button>
                                                        {campaign.status === 'failed' || campaign.failedCount > 0 ? (
                                                            <button
                                                                onClick={() => handleResendCampaign(campaign._id)}
                                                                className="text-blue-600 hover:text-blue-800 p-1"
                                                                title="Resend Failed"
                                                            >
                                                                <FaPlay />
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                                                <span className="font-medium">{Math.min(endIndex, filteredCampaigns.length)}</span> of{' '}
                                                <span className="font-medium">{filteredCampaigns.length}</span> results
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                <button
                                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                    disabled={currentPage === 1}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    Previous
                                                </button>

                                                {/* Page numbers */}
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + i;
                                                    } else {
                                                        pageNum = currentPage - 2 + i;
                                                    }

                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => setCurrentPage(pageNum)}
                                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                                                                ? 'z-10 bg-[#FFB915] border-[#FFB915] text-white'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}

                                                <button
                                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    Next
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Campaign Details Modal */}
                {showDetailsModal && selectedCampaign && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDetailsModal(false)}></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Campaign Details: {selectedCampaign.subject}
                                        </h3>
                                        <button
                                            onClick={() => setShowDetailsModal(false)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Left Column - Campaign Info */}
                                        <div className="lg:col-span-1">
                                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                                <h4 className="text-sm font-medium text-gray-900 mb-3">Campaign Information</h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="text-xs text-gray-500">Status</span>
                                                        <div className="mt-1">
                                                            {getStatusBadge(selectedCampaign.status)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-gray-500">Priority</span>
                                                        <div className="mt-1">
                                                            {getPriorityBadge(selectedCampaign.priority)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-gray-500">Template</span>
                                                        <p className="text-sm text-gray-900 mt-1 capitalize">{selectedCampaign.template}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-gray-500">Sender</span>
                                                        <p className="text-sm text-gray-900 mt-1">{selectedCampaign.sender.fullName}</p>
                                                        <p className="text-xs text-gray-500">{selectedCampaign.sender.email}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-gray-500">Created</span>
                                                        <p className="text-sm text-gray-900 mt-1">{formatDate(selectedCampaign.createdAt)}</p>
                                                    </div>
                                                    {selectedCampaign.scheduledFor && (
                                                        <div>
                                                            <span className="text-xs text-gray-500">Scheduled For</span>
                                                            <p className="text-sm text-gray-900 mt-1">{formatDate(selectedCampaign.scheduledFor)}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Performance Stats */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h4 className="text-sm font-medium text-gray-900 mb-3">Performance</h4>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-500">Total Recipients</span>
                                                        <span className="text-sm font-medium text-gray-900">{selectedCampaign.totalRecipients}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-500">Sent</span>
                                                        <span className="text-sm font-medium text-green-600">{selectedCampaign.sentCount}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-500">Delivered</span>
                                                        <span className="text-sm font-medium text-blue-600">{selectedCampaign.deliveredCount}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-500">Failed</span>
                                                        <span className="text-sm font-medium text-red-600">{selectedCampaign.failedCount}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                                        <span className="text-xs text-gray-500">Open Rate</span>
                                                        <span className="text-sm font-medium text-purple-600">{selectedCampaign.openRate.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-500">Click Rate</span>
                                                        <span className="text-sm font-medium text-orange-600">{selectedCampaign.clickRate.toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column - Recipients & Content */}
                                        <div className="lg:col-span-2">
                                            {/* Recipients Table */}
                                            <div className="bg-white border border-gray-200 rounded-lg mb-6">
                                                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                                    <h4 className="text-sm font-medium text-gray-900">Recipients</h4>
                                                    <button
                                                        onClick={() => exportCampaignData(selectedCampaign)}
                                                        className="text-[#FFB915] hover:text-[#2C4A6B] text-sm flex items-center"
                                                    >
                                                        <FaDownload className="mr-1" />
                                                        Export CSV
                                                    </button>
                                                </div>
                                                <div className="max-h-64 overflow-y-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Email
                                                                </th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Status
                                                                </th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Sent At
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {selectedCampaign.recipients.map((recipient, index) => (
                                                                <tr key={index} className="hover:bg-gray-50">
                                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                                        <div>
                                                                            {recipient.email}
                                                                            {recipient.name && (
                                                                                <p className="text-xs text-gray-500">{recipient.name}</p>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm">
                                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${recipient.status === 'sent' || recipient.status === 'delivered'
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : recipient.status === 'failed' || recipient.status === 'bounced'
                                                                                ? 'bg-red-100 text-red-800'
                                                                                : 'bg-yellow-100 text-yellow-800'
                                                                            }`}>
                                                                            {recipient.status}
                                                                        </span>
                                                                        {recipient.failureReason && (
                                                                            <p className="text-xs text-red-600 mt-1" title={recipient.failureReason}>
                                                                                {recipient.failureReason.length > 30
                                                                                    ? `${recipient.failureReason.substring(0, 30)}...`
                                                                                    : recipient.failureReason
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-gray-500">
                                                                        {recipient.sentAt ? formatDate(recipient.sentAt) : '-'}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Email Content Preview */}
                                            <div className="bg-white border border-gray-200 rounded-lg">
                                                <div className="px-4 py-3 border-b border-gray-200">
                                                    <h4 className="text-sm font-medium text-gray-900">Email Content</h4>
                                                </div>
                                                <div className="p-4">
                                                    <div className="mb-4">
                                                        <label className="text-xs font-medium text-gray-500">Subject:</label>
                                                        <p className="text-sm text-gray-900 mt-1">{selectedCampaign.subject}</p>
                                                    </div>

                                                    <div className="border border-gray-200 rounded-md">
                                                        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                                                            <span className="text-xs font-medium text-gray-500">Content Preview</span>
                                                        </div>
                                                        <div className="p-4 max-h-64 overflow-y-auto">
                                                            {selectedCampaign.htmlContent ? (
                                                                <div dangerouslySetInnerHTML={{ __html: selectedCampaign.htmlContent }} />
                                                            ) : (
                                                                <div className="whitespace-pre-wrap text-sm text-gray-700">
                                                                    {selectedCampaign.content}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    {(selectedCampaign.status === 'failed' || selectedCampaign.failedCount > 0) && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowDetailsModal(false);
                                                handleResendCampaign(selectedCampaign._id);
                                            }}
                                            className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                        >
                                            <FaPlay className="mr-2" />
                                            Resend Failed
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => exportCampaignData(selectedCampaign)}
                                        className="mt-3 w-full inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm"
                                    >
                                        <FaDownload className="mr-2" />
                                        Export Data
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm"
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
        </AdminLayout>
    );
};

export default EmailCampaigns;