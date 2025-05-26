import React, { useState, useEffect } from 'react';
import {
    FaPaperPlane,
    FaPlus,
    FaEdit,
    FaTrash,
    FaEye,
    FaSearch,
    FaTimes,
    FaUsers,
    FaChartBar,
    FaFileAlt
} from 'react-icons/fa';
import AdminLayout from '../../../layout/adminLayout';
import { emailApi, EmailTemplate, EmailVariable } from '../../../api/apiClient'; // Fixed: Import types from API client

// Use the interfaces from the API client to ensure compatibility
interface Email {
    _id: string;
    subject: string;
    content: string;
    template: string;
    status: string;
    totalRecipients: number;
    sentCount: number;
    deliveredCount: number;
    failedCount: number;
    openRate: number;
    scheduledFor?: string;
    createdAt: string;
    sender: {
        fullName: string;
        email: string;
    };
}

interface Recipient {
    email: string;
    name?: string;
}

// Fixed: Use the EmailVariable interface from API client for consistency
interface TemplateFormData {
    name: string;
    description: string;
    category: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    variables: EmailVariable[]; // Use the API client type
}

const EmailComposer: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'compose' | 'templates' | 'campaigns' | 'analytics'>('compose');
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [emails, setEmails] = useState<Email[]>([]);
    // Fixed: Remove unused selectedTemplate variable
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Compose email states
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [recipientInput, setRecipientInput] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
    const [scheduledFor, setScheduledFor] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);

    // Template states
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [templateForm, setTemplateForm] = useState<TemplateFormData>({
        name: '',
        description: '',
        category: 'custom',
        subject: '',
        htmlContent: '',
        textContent: '',
        variables: []
    });

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        fetchTemplates();
        fetchEmails();
    }, []);

    const fetchTemplates = async () => {
        try {
            setIsLoading(true);
            const response = await emailApi.getAllTemplates();
            if (response.success) {
                setTemplates(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch templates:', error);
            setError('Failed to load email templates');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEmails = async () => {
        try {
            const response = await emailApi.getAllEmails();
            if (response.success) {
                setEmails(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch emails:', error);
        }
    };

    const handleAddRecipient = () => {
        if (recipientInput.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const emails = recipientInput.split(',').map(email => email.trim()).filter(email => emailRegex.test(email));

            const newRecipients = emails.map(email => ({
                email,
                name: email.split('@')[0]
            })).filter(recipient => !recipients.some(r => r.email === recipient.email));

            setRecipients([...recipients, ...newRecipients]);
            setRecipientInput('');
        }
    };

    const handleRemoveRecipient = (email: string) => {
        setRecipients(recipients.filter(r => r.email !== email));
    };

    const handleSendEmail = async () => {
        if (!subject.trim() || !content.trim() || recipients.length === 0) {
            setError('Please fill in all required fields and add at least one recipient');
            return;
        }

        try {
            setIsLoading(true);

            // Fixed: Use the correct format expected by the API
            const emailData = {
                recipients: recipients, // Send array of {email, name} objects
                subject,
                content,
                htmlContent: htmlContent || content.replace(/\n/g, '<br>'),
                priority,
                scheduledFor: scheduledFor || undefined,
                attachments: attachments // Send File[] array directly
            };

            const response = await emailApi.sendEmail(emailData);

            if (response.success) {
                setSuccessMessage(scheduledFor ? 'Email scheduled successfully!' : 'Email sent successfully!');
                // Reset form
                setRecipients([]);
                setSubject('');
                setContent('');
                setHtmlContent('');
                setScheduledFor('');
                setAttachments([]);
                fetchEmails();
            }
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to send email:', error);
            setError(error.response?.data?.message || 'Failed to send email');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseTemplate = (template: EmailTemplate) => {
        // Apply template to compose form
        setSubject(template.subject);
        setContent(template.textContent);
        setHtmlContent(template.htmlContent);
        // Switch to compose tab to show the applied template
        setActiveTab('compose');
    };

    const handleSaveTemplate = async () => {
        try {
            setIsLoading(true);

            if (editingTemplate) {
                // Fixed: Cast templateForm to match API expected format
                const templateData = {
                    ...templateForm,
                    variables: templateForm.variables as EmailVariable[] // Ensure correct type
                };
                const response = await emailApi.updateTemplate(editingTemplate._id, templateData);
                if (response.success) {
                    setSuccessMessage('Template updated successfully!');
                }
            } else {
                // Fixed: Cast templateForm to match API expected format
                const templateData = {
                    ...templateForm,
                    variables: templateForm.variables as EmailVariable[] // Ensure correct type
                };
                const response = await emailApi.createTemplate(templateData);
                if (response.success) {
                    setSuccessMessage('Template created successfully!');
                }
            }

            setShowTemplateModal(false);
            setEditingTemplate(null);
            setTemplateForm({
                name: '',
                description: '',
                category: 'custom',
                subject: '',
                htmlContent: '',
                textContent: '',
                variables: []
            });
            fetchTemplates();
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to save template:', error);
            setError(error.response?.data?.message || 'Failed to save template');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTemplate = async (templateId: string) => {
        if (!window.confirm('Are you sure you want to delete this template?')) {
            return;
        }

        try {
            const response = await emailApi.deleteTemplate(templateId);
            if (response.success) {
                setSuccessMessage('Template deleted successfully!');
                fetchTemplates();
            }
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to delete template:', error);
            setError(error.response?.data?.message || 'Failed to delete template');
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'sent':
                return 'bg-green-100 text-green-800';
            case 'sending':
                return 'bg-blue-100 text-blue-800';
            case 'scheduled':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
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

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const filteredEmails = emails.filter(email => {
        const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || email.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <AdminLayout>
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Email Marketing</h1>
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

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {[
                            { key: 'compose', label: 'Compose Email', icon: FaPaperPlane },
                            { key: 'templates', label: 'Templates', icon: FaFileAlt },
                            { key: 'campaigns', label: 'Email Campaigns', icon: FaUsers },
                            { key: 'analytics', label: 'Analytics', icon: FaChartBar }
                        ].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key as 'compose' | 'templates' | 'campaigns' | 'analytics')}
                                className={`${activeTab === key
                                    ? 'border-[#FFB915] text-[#FFB915]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                            >
                                <Icon className="mr-2" />
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Compose Email Tab */}
                {activeTab === 'compose' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main compose area */}
                            <div className="lg:col-span-2">
                                <div className="space-y-6">
                                    {/* Recipients */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Recipients
                                        </label>
                                        <div className="flex mb-2">
                                            <input
                                                type="text"
                                                value={recipientInput}
                                                onChange={(e) => setRecipientInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                                                placeholder="Enter email addresses separated by commas"
                                                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                            />
                                            <button
                                                onClick={handleAddRecipient}
                                                className="bg-[#FFB915] text-white px-4 py-2 rounded-r-md hover:bg-[#2C4A6B]"
                                            >
                                                <FaPlus />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {recipients.map((recipient) => (
                                                <span
                                                    key={recipient.email}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                >
                                                    {recipient.email}
                                                    <button
                                                        onClick={() => handleRemoveRecipient(recipient.email)}
                                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                            placeholder="Enter email subject"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Content
                                        </label>
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            rows={10}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                            placeholder="Enter your email content"
                                        />
                                    </div>

                                    {/* HTML Content */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            HTML Content (Optional)
                                        </label>
                                        <textarea
                                            value={htmlContent}
                                            onChange={(e) => setHtmlContent(e.target.value)}
                                            rows={6}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                            placeholder="Enter HTML content for rich formatting"
                                        />
                                    </div>

                                    {/* Options */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Priority
                                            </label>
                                            <select
                                                value={priority}
                                                onChange={(e) => setPriority(e.target.value as 'low' | 'normal' | 'high')}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                            >
                                                <option value="low">Low</option>
                                                <option value="normal">Normal</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Schedule For (Optional)
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={scheduledFor}
                                                onChange={(e) => setScheduledFor(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                            />
                                        </div>
                                    </div>

                                    {/* Attachments */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Attachments
                                        </label>
                                        <input
                                            type="file"
                                            multiple
                                            onChange={(e) => setAttachments(Array.from(e.target.files || []))}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                        />
                                        {attachments.length > 0 && (
                                            <div className="mt-2">
                                                {attachments.map((file, index) => (
                                                    <span key={index} className="inline-block mr-2 mb-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                                                        {file.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Send Button */}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleSendEmail}
                                            disabled={isLoading}
                                            className="bg-[#FFB915] text-white px-6 py-2 rounded-md hover:bg-[#2C4A6B] disabled:opacity-50 flex items-center"
                                        >
                                            <FaPaperPlane className="mr-2" />
                                            {isLoading ? 'Sending...' : scheduledFor ? 'Schedule Email' : 'Send Email'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Templates */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Templates</h3>
                                    <div className="space-y-2">
                                        {templates.slice(0, 5).map((template) => (
                                            <button
                                                key={template._id}
                                                onClick={() => handleUseTemplate(template)}
                                                className="w-full text-left p-3 bg-white rounded-md hover:bg-gray-100 border"
                                            >
                                                <div className="font-medium text-sm">{template.name}</div>
                                                <div className="text-xs text-gray-500">{template.category}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                                    <div className="space-y-2">
                                        <button className="w-full text-left p-3 bg-white rounded-md hover:bg-gray-100 border">
                                            <FaUsers className="inline mr-2" />
                                            Load Subscribers
                                        </button>
                                        <button className="w-full text-left p-3 bg-white rounded-md hover:bg-gray-100 border">
                                            <FaUsers className="inline mr-2" />
                                            Load Patients
                                        </button>
                                        <button
                                            onClick={() => setShowTemplateModal(true)}
                                            className="w-full text-left p-3 bg-white rounded-md hover:bg-gray-100 border"
                                        >
                                            <FaFileAlt className="inline mr-2" />
                                            Create Template
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Templates Tab */}
                {activeTab === 'templates' && (
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex flex-col md:flex-row justify-between items-center">
                                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search templates..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-[#FFB915] focus:border-[#FFB915]"
                                        />
                                    </div>
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="newsletter">Newsletter</option>
                                        <option value="appointment">Appointment</option>
                                        <option value="promotional">Promotional</option>
                                        <option value="notification">Notification</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => setShowTemplateModal(true)}
                                    className="bg-[#FFB915] text-white px-4 py-2 rounded-md hover:bg-[#2C4A6B] flex items-center"
                                >
                                    <FaPlus className="mr-2" />
                                    New Template
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {filteredTemplates.map((template) => (
                                <div key={template._id} className="border border-gray-200 rounded-lg p-4">
                                    {template.thumbnail && (
                                        <img
                                            src={template.thumbnail}
                                            alt={template.name}
                                            className="w-full h-32 object-cover rounded-md mb-4"
                                        />
                                    )}
                                    <h3 className="font-medium text-lg mb-2">{template.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            {template.category}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Used {template.usageCount} times
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <button
                                            onClick={() => handleUseTemplate(template)}
                                            className="text-[#FFB915] hover:text-[#2C4A6B] flex items-center"
                                        >
                                            <FaEye className="mr-1" />
                                            Use
                                        </button>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setEditingTemplate(template);
                                                    setTemplateForm({
                                                        name: template.name,
                                                        description: template.description,
                                                        category: template.category,
                                                        subject: template.subject,
                                                        htmlContent: template.htmlContent,
                                                        textContent: template.textContent,
                                                        variables: template.variables
                                                    });
                                                    setShowTemplateModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTemplate(template._id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Email Campaigns Tab */}
                {activeTab === 'campaigns' && (
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search campaigns..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-[#FFB915] focus:border-[#FFB915]"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                >
                                    <option value="all">All Status</option>
                                    <option value="draft">Draft</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="sending">Sending</option>
                                    <option value="sent">Sent</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                        </div>

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
                                    {filteredEmails.map((email) => (
                                        <tr key={email._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{email.subject}</div>
                                                    <div className="text-sm text-gray-500">by {email.sender.fullName}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{email.totalRecipients}</div>
                                                <div className="text-sm text-gray-500">
                                                    {email.sentCount} sent, {email.failedCount} failed
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(email.status)}`}>
                                                    {email.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {email.deliveredCount}/{email.totalRecipients} delivered
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {email.openRate.toFixed(1)}% open rate
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {formatDate(email.createdAt)}
                                                </div>
                                                {email.scheduledFor && (
                                                    <div className="text-sm text-gray-500">
                                                        Scheduled: {formatDate(email.scheduledFor)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-[#FFB915] hover:text-[#2C4A6B] mr-2">
                                                    <FaEye />
                                                </button>
                                                <button className="text-blue-600 hover:text-blue-800">
                                                    <FaEdit />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Overview Cards */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <FaPaperPlane className="text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total Sent</p>
                                        <p className="text-2xl font-bold text-gray-900">1,234</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <FaUsers className="text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Delivered</p>
                                        <p className="text-2xl font-bold text-gray-900">1,156</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <FaEye className="text-yellow-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Open Rate</p>
                                        <p className="text-2xl font-bold text-gray-900">23.4%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <FaTimes className="text-red-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Failed</p>
                                        <p className="text-2xl font-bold text-gray-900">78</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {emails.slice(0, 5).map((email) => (
                                    <div key={email._id} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{email.subject}</p>
                                            <p className="text-xs text-gray-500">{formatDate(email.createdAt)}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(email.status)}`}>
                                            {email.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Templates */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Templates</h3>
                            <div className="space-y-4">
                                {templates
                                    .sort((a, b) => b.usageCount - a.usageCount)
                                    .slice(0, 5)
                                    .map((template) => (
                                        <div key={template._id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{template.name}</p>
                                                <p className="text-xs text-gray-500">{template.category}</p>
                                            </div>
                                            <span className="text-sm text-gray-500">{template.usageCount} uses</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Template Modal */}
                {showTemplateModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowTemplateModal(false)}></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                                {editingTemplate ? 'Edit Template' : 'Create New Template'}
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Template Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={templateForm.name}
                                                            onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                                            placeholder="Enter template name"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Description
                                                        </label>
                                                        <textarea
                                                            value={templateForm.description}
                                                            onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                                                            rows={3}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                                            placeholder="Enter template description"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Category
                                                        </label>
                                                        <select
                                                            value={templateForm.category}
                                                            onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                                        >
                                                            <option value="custom">Custom</option>
                                                            <option value="newsletter">Newsletter</option>
                                                            <option value="appointment">Appointment</option>
                                                            <option value="promotional">Promotional</option>
                                                            <option value="notification">Notification</option>
                                                            <option value="welcome">Welcome</option>
                                                            <option value="reminder">Reminder</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Subject
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={templateForm.subject}
                                                            onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                                            placeholder="Enter email subject"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Text Content
                                                        </label>
                                                        <textarea
                                                            value={templateForm.textContent}
                                                            onChange={(e) => setTemplateForm({ ...templateForm, textContent: e.target.value })}
                                                            rows={6}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                                            placeholder="Enter plain text content"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            HTML Content
                                                        </label>
                                                        <textarea
                                                            value={templateForm.htmlContent}
                                                            onChange={(e) => setTemplateForm({ ...templateForm, htmlContent: e.target.value })}
                                                            rows={8}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                                            placeholder="Enter HTML content"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6">
                                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                                    <h4 className="text-sm font-medium text-blue-900 mb-2">Template Variables</h4>
                                                    <p className="text-sm text-blue-700 mb-2">
                                                        You can use variables in your template content by using double curly braces, like: {`{{variableName}}`}
                                                    </p>
                                                    <p className="text-xs text-blue-600">
                                                        Common variables: {`{{patientName}}`}, {`{{doctorName}}`}, {`{{appointmentDate}}`}, {`{{appointmentTime}}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        onClick={handleSaveTemplate}
                                        disabled={isLoading}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#FFB915] text-base font-medium text-white hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                    >
                                        {isLoading ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm"
                                        onClick={() => {
                                            setShowTemplateModal(false);
                                            setEditingTemplate(null);
                                            setTemplateForm({
                                                name: '',
                                                description: '',
                                                category: 'custom',
                                                subject: '',
                                                htmlContent: '',
                                                textContent: '',
                                                variables: []
                                            });
                                        }}
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

export default EmailComposer;