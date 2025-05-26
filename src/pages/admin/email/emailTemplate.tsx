import React, { useState, useEffect, useCallback } from 'react';
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaEye,
    FaSearch,
    FaTimes,
    FaFileAlt,
    FaCode,
    FaSave,
    FaClone
} from 'react-icons/fa';
import AdminLayout from '../../../layout/adminLayout';
import { emailApi, EmailTemplate, EmailVariable } from '../../../api/apiClient'; // Fixed: Import types from API client

// Fixed: Use API client interfaces for consistency
interface TemplateFormData {
    name: string;
    description: string;
    category: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    variables: EmailVariable[];
}

interface VariableFormData {
    name: string;
    description: string;
    type: 'text' | 'number' | 'date' | 'url' | 'email';
    required: boolean;
    defaultValue: string;
}

interface CategoryOption {
    value: string;
    label: string;
}

interface VariableTypeOption {
    value: 'text' | 'number' | 'date' | 'url' | 'email';
    label: string;
}

interface ApiResponse {
    success: boolean;
    data: EmailTemplate[];
    message?: string;
}

const EmailTemplates: React.FC = () => {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<EmailTemplate[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    // Modal states
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [previewMode, setPreviewMode] = useState<'html' | 'text'>('html');

    // Filter states
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    // Form state
    const [templateForm, setTemplateForm] = useState<TemplateFormData>({
        name: '',
        description: '',
        category: 'custom',
        subject: '',
        htmlContent: '',
        textContent: '',
        variables: []
    });

    // Variable form state
    const [variableForm, setVariableForm] = useState<VariableFormData>({
        name: '',
        description: '',
        type: 'text',
        required: false,
        defaultValue: ''
    });

    // Fixed: Use useCallback to memoize filterTemplates function
    const filterTemplates = useCallback((): void => {
        let filtered = templates;

        if (searchTerm) {
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                template.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(template => template.category === categoryFilter);
        }

        setFilteredTemplates(filtered);
    }, [templates, searchTerm, categoryFilter]);

    useEffect(() => {
        fetchTemplates();
    }, []);

    // Fixed: Include filterTemplates in dependency array
    useEffect(() => {
        filterTemplates();
    }, [filterTemplates]);

    const fetchTemplates = async (): Promise<void> => {
        try {
            setIsLoading(true);
            const response: ApiResponse = await emailApi.getAllTemplates();
            if (response.success) {
                setTemplates(response.data);
            }
        } catch (error: unknown) {
            console.error('Failed to fetch templates:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to load email templates';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTemplate = (): void => {
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
        setShowModal(true);
    };

    const handleEditTemplate = (template: EmailTemplate): void => {
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
        setShowModal(true);
    };

    const handleSaveTemplate = async (): Promise<void> => {
        try {
            setIsLoading(true);

            if (editingTemplate) {
                // Fixed: Cast template form to match API expected format
                const templateData = {
                    ...templateForm,
                    variables: templateForm.variables as EmailVariable[]
                };
                await emailApi.updateTemplate(editingTemplate._id, templateData);
                setSuccessMessage('Template updated successfully!');
            } else {
                // Fixed: Cast template form to match API expected format
                const templateData = {
                    ...templateForm,
                    variables: templateForm.variables as EmailVariable[]
                };
                await emailApi.createTemplate(templateData);
                setSuccessMessage('Template created successfully!');
            }

            setShowModal(false);
            setEditingTemplate(null);
            await fetchTemplates();
        } catch (error: unknown) {
            console.error('Failed to save template:', error);
            let errorMessage = 'Failed to save template';

            if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error as { response?: { data?: { message?: string } } };
                errorMessage = apiError.response?.data?.message || errorMessage;
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTemplate = async (templateId: string): Promise<void> => {
        if (!window.confirm('Are you sure you want to delete this template?')) {
            return;
        }

        try {
            await emailApi.deleteTemplate(templateId);
            setSuccessMessage('Template deleted successfully!');
            await fetchTemplates();
        } catch (error: unknown) {
            console.error('Failed to delete template:', error);
            let errorMessage = 'Failed to delete template';

            if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error as { response?: { data?: { message?: string } } };
                errorMessage = apiError.response?.data?.message || errorMessage;
            }

            setError(errorMessage);
        }
    };

    const handleDuplicateTemplate = (template: EmailTemplate): void => {
        setEditingTemplate(null);
        setTemplateForm({
            name: `${template.name} (Copy)`,
            description: template.description,
            category: template.category,
            subject: template.subject,
            htmlContent: template.htmlContent,
            textContent: template.textContent,
            variables: template.variables
        });
        setShowModal(true);
    };

    const handleAddVariable = (): void => {
        if (variableForm.name.trim()) {
            setTemplateForm({
                ...templateForm,
                variables: [...templateForm.variables, { ...variableForm }]
            });
            setVariableForm({
                name: '',
                description: '',
                type: 'text',
                required: false,
                defaultValue: ''
            });
        }
    };

    const handleRemoveVariable = (index: number): void => {
        setTemplateForm({
            ...templateForm,
            variables: templateForm.variables.filter((_, i) => i !== index)
        });
    };

    const handleInputChange = (field: keyof TemplateFormData, value: string): void => {
        setTemplateForm({
            ...templateForm,
            [field]: value
        });
    };

    const handleVariableInputChange = (field: keyof VariableFormData, value: string | boolean): void => {
        setVariableForm({
            ...variableForm,
            [field]: value
        });
    };

    const categories: CategoryOption[] = [
        { value: 'all', label: 'All Categories' },
        { value: 'newsletter', label: 'Newsletter' },
        { value: 'appointment', label: 'Appointment' },
        { value: 'promotional', label: 'Promotional' },
        { value: 'notification', label: 'Notification' },
        { value: 'welcome', label: 'Welcome' },
        { value: 'reminder', label: 'Reminder' },
        { value: 'custom', label: 'Custom' }
    ];

    const variableTypes: VariableTypeOption[] = [
        { value: 'text', label: 'Text' },
        { value: 'number', label: 'Number' },
        { value: 'date', label: 'Date' },
        { value: 'url', label: 'URL' },
        { value: 'email', label: 'Email' }
    ];

    const isFormValid = (): boolean => {
        return !!(
            templateForm.name.trim() &&
            templateForm.subject.trim() &&
            templateForm.textContent.trim() &&
            templateForm.htmlContent.trim()
        );
    };

    return (
        <AdminLayout>
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Email Templates</h1>
                    <button
                        onClick={handleCreateTemplate}
                        className="bg-[#FFB915] text-white px-4 py-2 rounded-md hover:bg-[#2C4A6B] flex items-center"
                    >
                        <FaPlus className="mr-2" />
                        New Template
                    </button>
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
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search templates..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-[#FFB915] focus:border-[#FFB915] w-full"
                                />
                            </div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                            >
                                {categories.map(category => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        <div className="col-span-full flex justify-center items-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFB915] mx-auto"></div>
                                <p className="mt-2 text-gray-500">Loading templates...</p>
                            </div>
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <FaFileAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm || categoryFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'Get started by creating your first email template.'
                                }
                            </p>
                            {!searchTerm && categoryFilter === 'all' && (
                                <button
                                    onClick={handleCreateTemplate}
                                    className="bg-[#FFB915] text-white px-4 py-2 rounded-md hover:bg-[#2C4A6B] flex items-center mx-auto"
                                >
                                    <FaPlus className="mr-2" />
                                    Create Template
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredTemplates.map((template) => (
                            <div key={template._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                                {template.thumbnail && (
                                    <img
                                        src={template.thumbnail}
                                        alt={template.name}
                                        className="w-full h-32 object-cover rounded-md mb-4"
                                    />
                                )}

                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium text-lg text-gray-900 truncate">{template.name}</h3>
                                    <span className={`px-2 py-1 text-xs rounded-full ${template.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {template.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{template.description}</p>

                                <div className="flex items-center justify-between mb-4">
                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        {template.category}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        Used {template.usageCount} times
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                setPreviewTemplate(template);
                                                setShowPreview(true);
                                            }}
                                            className="text-[#FFB915] hover:text-[#2C4A6B] p-2 rounded"
                                            title="Preview"
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            onClick={() => handleEditTemplate(template)}
                                            className="text-blue-600 hover:text-blue-800 p-2 rounded"
                                            title="Edit"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDuplicateTemplate(template)}
                                            className="text-green-600 hover:text-green-800 p-2 rounded"
                                            title="Duplicate"
                                        >
                                            <FaClone />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTemplate(template._id)}
                                            className="text-red-600 hover:text-red-800 p-2 rounded"
                                            title="Delete"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">
                                        Created by {template.createdBy?.fullName || 'System'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(template.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Create/Edit Template Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                                                {editingTemplate ? 'Edit Template' : 'Create New Template'}
                                            </h3>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {/* Left Column - Basic Info */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Template Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={templateForm.name}
                                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                                            placeholder="Enter template name"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Description
                                                        </label>
                                                        <textarea
                                                            value={templateForm.description}
                                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                                            rows={3}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                                            placeholder="Enter template description"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Category *
                                                        </label>
                                                        <select
                                                            value={templateForm.category}
                                                            onChange={(e) => handleInputChange('category', e.target.value)}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                                            required
                                                        >
                                                            {categories.slice(1).map(category => (
                                                                <option key={category.value} value={category.value}>
                                                                    {category.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Subject Line *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={templateForm.subject}
                                                            onChange={(e) => handleInputChange('subject', e.target.value)}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                                            placeholder="Enter email subject"
                                                            required
                                                        />
                                                    </div>

                                                    {/* Variables Section */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                                            Template Variables
                                                        </label>

                                                        {/* Add Variable Form */}
                                                        <div className="bg-gray-50 p-4 rounded-md mb-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                                <input
                                                                    type="text"
                                                                    value={variableForm.name}
                                                                    onChange={(e) => handleVariableInputChange('name', e.target.value)}
                                                                    placeholder="Variable name (e.g., patientName)"
                                                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={variableForm.description}
                                                                    onChange={(e) => handleVariableInputChange('description', e.target.value)}
                                                                    placeholder="Description"
                                                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <select
                                                                    value={variableForm.type}
                                                                    onChange={(e) => handleVariableInputChange('type', e.target.value as 'text' | 'number' | 'date' | 'url' | 'email')}
                                                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                                >
                                                                    {variableTypes.map(type => (
                                                                        <option key={type.value} value={type.value}>
                                                                            {type.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <label className="flex items-center text-sm">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={variableForm.required}
                                                                        onChange={(e) => handleVariableInputChange('required', e.target.checked)}
                                                                        className="mr-2"
                                                                    />
                                                                    Required
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    onClick={handleAddVariable}
                                                                    className="bg-[#FFB915] text-white px-3 py-2 rounded-md text-sm hover:bg-[#2C4A6B]"
                                                                >
                                                                    Add
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Variables List */}
                                                        {templateForm.variables.length > 0 && (
                                                            <div className="space-y-2">
                                                                {templateForm.variables.map((variable, index) => (
                                                                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md border">
                                                                        <div>
                                                                            <span className="font-medium text-sm">{`{{${variable.name}}}`}</span>
                                                                            <span className="text-gray-500 text-sm ml-2">({variable.type})</span>
                                                                            {variable.required && (
                                                                                <span className="text-red-500 text-xs ml-1">*</span>
                                                                            )}
                                                                            {variable.description && (
                                                                                <p className="text-xs text-gray-600 mt-1">{variable.description}</p>
                                                                            )}
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveVariable(index)}
                                                                            className="text-red-600 hover:text-red-800"
                                                                        >
                                                                            <FaTimes />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right Column - Content */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Text Content *
                                                        </label>
                                                        <textarea
                                                            value={templateForm.textContent}
                                                            onChange={(e) => handleInputChange('textContent', e.target.value)}
                                                            rows={8}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915] font-mono text-sm"
                                                            placeholder="Enter plain text content with variables like {{patientName}}"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            HTML Content *
                                                        </label>
                                                        <textarea
                                                            value={templateForm.htmlContent}
                                                            onChange={(e) => handleInputChange('htmlContent', e.target.value)}
                                                            rows={12}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#FFB915] focus:border-[#FFB915] font-mono text-sm"
                                                            placeholder="Enter HTML content with variables like {{patientName}}"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                                        <h4 className="text-sm font-medium text-blue-900 mb-2">
                                                            <FaCode className="inline mr-1" />
                                                            Variable Usage
                                                        </h4>
                                                        <p className="text-sm text-blue-700 mb-2">
                                                            Use variables in your content with double curly braces: {`{{variableName}}`}
                                                        </p>
                                                        <p className="text-xs text-blue-600">
                                                            Common variables: {`{{patientName}}`}, {`{{doctorName}}`}, {`{{appointmentDate}}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        onClick={handleSaveTemplate}
                                        disabled={isLoading || !isFormValid()}
                                        className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#FFB915] text-base font-medium text-white hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaSave className="mr-2" />
                                        {isLoading ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingTemplate(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Preview Modal */}
                {showPreview && previewTemplate && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPreview(false)}></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Preview: {previewTemplate.name}
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex bg-gray-100 rounded-md p-1">
                                                <button
                                                    onClick={() => setPreviewMode('html')}
                                                    className={`px-3 py-1 text-sm rounded ${previewMode === 'html'
                                                        ? 'bg-white text-gray-900 shadow-sm'
                                                        : 'text-gray-500 hover:text-gray-700'
                                                        }`}
                                                >
                                                    HTML
                                                </button>
                                                <button
                                                    onClick={() => setPreviewMode('text')}
                                                    className={`px-3 py-1 text-sm rounded ${previewMode === 'text'
                                                        ? 'bg-white text-gray-900 shadow-sm'
                                                        : 'text-gray-500 hover:text-gray-700'
                                                        }`}
                                                >
                                                    Text
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => setShowPreview(false)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="border-b border-gray-200 mb-4">
                                        <div className="bg-gray-50 px-4 py-2 rounded-t-md">
                                            <p className="text-sm text-gray-600">
                                                <strong>Subject:</strong> {previewTemplate.subject}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                                        {previewMode === 'html' ? (
                                            <div
                                                className="p-4"
                                                dangerouslySetInnerHTML={{
                                                    __html: previewTemplate.htmlContent.replace(/\{\{(\w+)\}\}/g, '<span class="bg-yellow-200 px-1 rounded">${{$1}}</span>')
                                                }}
                                            />
                                        ) : (
                                            <div className="p-4 whitespace-pre-wrap font-mono text-sm">
                                                {previewTemplate.textContent.replace(/\{\{(\w+)\}\}/g, '{{$1}}')}
                                            </div>
                                        )}
                                    </div>

                                    {previewTemplate.variables.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Available Variables:</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {previewTemplate.variables.map((variable, index) => (
                                                    <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                                                        <span className="font-medium">{`{{${variable.name}}}`}</span>
                                                        {variable.description && (
                                                            <p className="text-gray-600 text-xs mt-1">{variable.description}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPreview(false);
                                            handleEditTemplate(previewTemplate);
                                        }}
                                        className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#FFB915] text-base font-medium text-white hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        <FaEdit className="mr-2" />
                                        Edit Template
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm"
                                        onClick={() => setShowPreview(false)}
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

export default EmailTemplates;