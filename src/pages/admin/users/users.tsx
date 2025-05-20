import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaEnvelope, FaUserShield, FaToggleOn, FaToggleOff, FaUserPlus, FaEdit, FaSearch, FaCalendarAlt, FaKey } from 'react-icons/fa';
import AdminLayout from '../../../layout/adminLayout';
import apiClient from '../../../api/apiClient';
import { useAuth } from '../../../context/AuthContext';

interface User {
    _id: string;
    fullName: string;
    email: string;
    role: 'user' | 'admin' | 'superadmin';
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
}

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: 'user',
        isActive: true,
        password: '',
        confirmPassword: ''
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, [currentPage, roleFilter, statusFilter]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError('');

            const role = roleFilter !== 'all' ? `&role=${roleFilter}` : '';
            const isActive = statusFilter !== 'all' ? `&isActive=${statusFilter === 'active'}` : '';

            const response = await apiClient.get(`/admin/users?page=${currentPage}&limit=${itemsPerPage}${role}${isActive}`);

            setUsers(response.data.data);
            setFilteredUsers(response.data.data);
            setTotalPages(response.data.pages);
        } catch (err: unknown) {
            console.error('Failed to fetch users:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const error = err as { response?: { data?: { message?: string } } };
                setError(error.response?.data?.message || 'Failed to load users. Please try again.');
            } else {
                setError('Failed to load users. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user =>
                user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchTerm, users]);

    const toggleUserStatus = async (id: string, newStatus: boolean) => {
        try {
            setIsProcessing(true);

            await apiClient.put(`/admin/users/${id}`, { isActive: newStatus });

            // Update local state
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user._id === id ? { ...user, isActive: newStatus } : user
                )
            );

            setFilteredUsers(prevUsers =>
                prevUsers.map(user =>
                    user._id === id ? { ...user, isActive: newStatus } : user
                )
            );

            setIsProcessing(false);
            setSuccessMessage(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err: unknown) {
            console.error('Failed to update user status:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const error = err as { response?: { data?: { message?: string } } };
                setError(error.response?.data?.message || 'Failed to update user status. Please try again.');
            } else {
                setError('Failed to update user status. Please try again.');
            }
            setIsProcessing(false);
        }
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setFormData({
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            password: '',
            confirmPassword: ''
        });
        setFormErrors({});
        setShowEditModal(true);
    };

    const handleAddUser = () => {
        setFormData({
            fullName: '',
            email: '',
            role: 'user',
            isActive: true,
            password: '',
            confirmPassword: ''
        });
        setFormErrors({});
        setShowAddModal(true);
    };

    const handleResetPassword = (user: User) => {
        setSelectedUser(user);
        setFormData(prev => ({
            ...prev,
            password: '',
            confirmPassword: ''
        }));
        setFormErrors({});
        setShowResetModal(true);
    };

    const validateForm = (isEditing: boolean) => {
        const errors: Record<string, string> = {};

        if (!formData.fullName.trim()) {
            errors.fullName = 'Full name is required';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }

        if (!isEditing && !formData.password) {
            errors.password = 'Password is required';
        }

        if (formData.password && formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validatePasswordForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.password) {
            errors.password = 'New password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error when field is edited
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm(true)) {
            return;
        }

        if (!selectedUser) return;

        setIsProcessing(true);

        try {
            const userData = {
                fullName: formData.fullName,
                email: formData.email,
                role: formData.role,
                isActive: formData.isActive,
                ...(formData.password ? { password: formData.password } : {})
            };

            await apiClient.put(`/admin/users/${selectedUser._id}`, userData);

            // Update local state
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user._id === selectedUser._id ? {
                        ...user,
                        fullName: userData.fullName,
                        email: userData.email,
                        role: userData.role as 'user' | 'admin' | 'superadmin',
                        isActive: userData.isActive
                    } : user
                )
            );

            setFilteredUsers(prevUsers =>
                prevUsers.map(user =>
                    user._id === selectedUser._id ? {
                        ...user,
                        fullName: userData.fullName,
                        email: userData.email,
                        role: userData.role as 'user' | 'admin' | 'superadmin',
                        isActive: userData.isActive
                    } : user
                )
            );

            setShowEditModal(false);
            setIsProcessing(false);
            setSuccessMessage('User updated successfully');

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err: unknown) {
            console.error('Failed to update user:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const error = err as { response?: { data?: { message?: string } } };
                setError(error.response?.data?.message || 'Failed to update user. Please try again.');
            } else {
                setError('Failed to update user. Please try again.');
            }
            setIsProcessing(false);
        }
    };

    const handleSubmitAdd = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm(false)) {
            return;
        }

        setIsProcessing(true);

        try {
            const userData = {
                fullName: formData.fullName,
                email: formData.email,
                role: formData.role,
                isActive: formData.isActive,
                password: formData.password
            };

            const response = await apiClient.post('/auth/register', userData);

            // Update local state - add the new user
            const newUser = response.data.user;
            setUsers(prevUsers => [...prevUsers, newUser]);
            setFilteredUsers(prevUsers => [...prevUsers, newUser]);

            setShowAddModal(false);
            setIsProcessing(false);
            setSuccessMessage('User created successfully');

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err: Error | unknown) {
            console.error('Failed to add user:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const error = err as { response?: { data?: { message?: string } } };
                setError(error.response?.data?.message || 'Failed to add user. Please try again.');
            } else {
                setError('Failed to add user. Please try again.');
            }
            setIsProcessing(false);
        }
    };

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePasswordForm()) {
            return;
        }

        if (!selectedUser) return;

        setIsProcessing(true);

        try {
            await apiClient.put(`/admin/users/${selectedUser._id}/reset-password`, {
                password: formData.password
            });

            setShowResetModal(false);
            setIsProcessing(false);
            setSuccessMessage('Password reset successfully');

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err: unknown) {
            console.error('Failed to reset password:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const error = err as { response?: { data?: { message?: string } } };
                setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
            } else {
                setError('Failed to reset password. Please try again.');
            }
            setIsProcessing(false);
        }
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'superadmin':
                return 'bg-purple-100 text-purple-800 border border-purple-200';
            case 'admin':
                return 'bg-blue-100 text-blue-800 border border-blue-200';
            case 'user':
                return 'bg-gray-100 text-gray-800 border border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Never';

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
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">User Management</h1>

                    <button
                        onClick={handleAddUser}
                        className="inline-flex items-center px-4 py-2 bg-[#FFB915] hover:bg-[#2C4A6B] text-white font-medium rounded-lg transition-colors"
                    >
                        <FaUserPlus className="mr-2" />
                        Add User
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

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="search" className="sr-only">Search</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="search"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-[#FFB915] focus:border-[#FFB915]"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <select
                                id="role"
                                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-[#FFB915] focus:border-[#FFB915]"
                                value={roleFilter}
                                onChange={(e) => {
                                    setRoleFilter(e.target.value);
                                    setCurrentPage(1); // Reset to first page on filter change
                                }}
                            >
                                <option value="all">All Roles</option>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="superadmin">Super Admin</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                id="status"
                                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-[#FFB915] focus:border-[#FFB915]"
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1); // Reset to first page on filter change
                                }}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFB915]"></div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-lg text-gray-600 mb-4">No users found.</p>
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
                                            User
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Last Login
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#FFB915]/10 flex items-center justify-center">
                                                        <FaUserCircle className="h-6 w-6 text-[#FFB915]" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                                        <div className="text-sm text-gray-500 flex items-center">
                                                            <FaEnvelope className="mr-1 text-xs" /> {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeClass(user.role)}`}>
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${user.isActive
                                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                                    : 'bg-red-100 text-red-800 border border-red-200'}`}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <FaCalendarAlt className="mr-2 text-gray-400" />
                                                    {formatDate(user.lastLogin)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    {/* Don't allow editing self or higher role unless superadmin */}
                                                    {(user._id !== currentUser?._id) && (
                                                        <>
                                                            <button
                                                                onClick={() => handleResetPassword(user)}
                                                                className="text-orange-600 hover:text-orange-900"
                                                                title="Reset Password"
                                                            >
                                                                <FaKey />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditUser(user)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                                title="Edit User"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <button
                                                                onClick={() => toggleUserStatus(user._id, !user.isActive)}
                                                                className={`${user.isActive
                                                                    ? 'text-red-600 hover:text-red-900'
                                                                    : 'text-green-600 hover:text-green-900'}`}
                                                                title={user.isActive ? 'Deactivate' : 'Activate'}
                                                                disabled={isProcessing}
                                                            >
                                                                {user.isActive ? <FaToggleOn /> : <FaToggleOff />}
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
                                                {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
                                            </span>{' '}
                                            of <span className="font-medium">{filteredUsers.length}</span> results
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

                {/* Edit User Modal */}
                {showEditModal && selectedUser && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowEditModal(false)}></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-[#FFB915]/10 sm:mx-0 sm:h-10 sm:w-10">
                                            <FaUserShield className="h-6 w-6 text-[#FFB915]" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                Edit User
                                            </h3>

                                            <form onSubmit={handleSubmitEdit} className="mt-4">
                                                <div className="mb-4">
                                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Full Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="fullName"
                                                        name="fullName"
                                                        value={formData.fullName}
                                                        onChange={handleChange}
                                                        className={`w-full border ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 focus:ring-[#FFB915] focus:border-[#FFB915]`}
                                                        placeholder="Enter full name"
                                                        required
                                                    />
                                                    {formErrors.fullName && <p className="mt-1 text-xs text-red-500">{formErrors.fullName}</p>}
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        className={`w-full border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 focus:ring-[#FFB915] focus:border-[#FFB915]`}
                                                        placeholder="Enter email address"
                                                        required
                                                    />
                                                    {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Role
                                                    </label>
                                                    <select
                                                        id="role"
                                                        name="role"
                                                        value={formData.role}
                                                        onChange={handleChange}
                                                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                        <option value="superadmin">Super Admin</option>
                                                    </select>
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="isActive" className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id="isActive"
                                                            name="isActive"
                                                            checked={formData.isActive}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                                            className="h-4 w-4 text-[#FFB915] focus:ring-[#FFB915] border-gray-300 rounded"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">Active</span>
                                                    </label>
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Password (leave blank to keep current)
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="password"
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        className={`w-full border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 focus:ring-[#FFB915] focus:border-[#FFB915]`}
                                                        placeholder="Enter new password"
                                                    />
                                                    {formErrors.password && <p className="mt-1 text-xs text-red-500">{formErrors.password}</p>}
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Confirm Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="confirmPassword"
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        className={`w-full border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 focus:ring-[#FFB915] focus:border-[#FFB915]`}
                                                        placeholder="Confirm new password"
                                                    />
                                                    {formErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{formErrors.confirmPassword}</p>}
                                                </div>

                                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                                    <button
                                                        type="submit"
                                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#FFB915] text-base font-medium text-white hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:ml-3 sm:w-auto sm:text-sm"
                                                        disabled={isProcessing}
                                                    >
                                                        {isProcessing ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            'Save Changes'
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:mt-0 sm:w-auto sm:text-sm"
                                                        onClick={() => setShowEditModal(false)}
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

                {/* Add User Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowAddModal(false)}></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-[#FFB915]/10 sm:mx-0 sm:h-10 sm:w-10">
                                            <FaUserPlus className="h-6 w-6 text-[#FFB915]" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                Add New User
                                            </h3>

                                            <form onSubmit={handleSubmitAdd} className="mt-4">
                                                <div className="mb-4">
                                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Full Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="fullName"
                                                        name="fullName"
                                                        value={formData.fullName}
                                                        onChange={handleChange}
                                                        className={`w-full border ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 focus:ring-[#FFB915] focus:border-[#FFB915]`}
                                                        placeholder="Enter full name"
                                                        required
                                                    />
                                                    {formErrors.fullName && <p className="mt-1 text-xs text-red-500">{formErrors.fullName}</p>}
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        className={`w-full border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 focus:ring-[#FFB915] focus:border-[#FFB915]`}
                                                        placeholder="Enter email address"
                                                        required
                                                    />
                                                    {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Role
                                                    </label>
                                                    <select
                                                        id="role"
                                                        name="role"
                                                        value={formData.role}
                                                        onChange={handleChange}
                                                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                        <option value="superadmin">Super Admin</option>
                                                    </select>
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="isActive" className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id="isActive"
                                                            name="isActive"
                                                            checked={formData.isActive}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                                            className="h-4 w-4 text-[#FFB915] focus:ring-[#FFB915] border-gray-300 rounded"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">Active</span>
                                                    </label>
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="password"
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        className={`w-full border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 focus:ring-[#FFB915] focus:border-[#FFB915]`}
                                                        placeholder="Enter password"
                                                        required
                                                    />
                                                    {formErrors.password && <p className="mt-1 text-xs text-red-500">{formErrors.password}</p>}
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Confirm Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="confirmPassword"
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        className={`w-full border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 focus:ring-[#FFB915] focus:border-[#FFB915]`}
                                                        placeholder="Confirm password"
                                                        required
                                                    />
                                                    {formErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{formErrors.confirmPassword}</p>}
                                                </div>

                                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                                    <button
                                                        type="submit"
                                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#FFB915] text-base font-medium text-white hover:bg-[#2C4A6B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:ml-3 sm:w-auto sm:text-sm"
                                                        disabled={isProcessing}
                                                    >
                                                        {isProcessing ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Creating...
                                                            </>
                                                        ) : (
                                                            'Create User'
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:mt-0 sm:w-auto sm:text-sm"
                                                        onClick={() => setShowAddModal(false)}
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

                {/* Reset Password Modal */}
                {showResetModal && selectedUser && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowResetModal(false)}></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <FaKey className="h-6 w-6 text-orange-600" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                Reset Password for {selectedUser.fullName}
                                            </h3>

                                            <form onSubmit={handleResetSubmit} className="mt-4">
                                                <div className="mb-4">
                                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                                        New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="password"
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        className={`w-full border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 focus:ring-[#FFB915] focus:border-[#FFB915]`}
                                                        placeholder="Enter new password"
                                                        required
                                                    />
                                                    {formErrors.password && <p className="mt-1 text-xs text-red-500">{formErrors.password}</p>}
                                                </div>

                                                <div className="mb-4">
                                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Confirm New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="confirmPassword"
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        className={`w-full border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 focus:ring-[#FFB915] focus:border-[#FFB915]`}
                                                        placeholder="Confirm new password"
                                                        required
                                                    />
                                                    {formErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{formErrors.confirmPassword}</p>}
                                                </div>

                                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                                    <button
                                                        type="submit"
                                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm"
                                                        disabled={isProcessing}
                                                    >
                                                        {isProcessing ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Resetting...
                                                            </>
                                                        ) : (
                                                            'Reset Password'
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:mt-0 sm:w-auto sm:text-sm"
                                                        onClick={() => setShowResetModal(false)}
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

export default AdminUsers;