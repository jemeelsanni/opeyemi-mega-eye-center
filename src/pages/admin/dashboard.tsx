import React, { useState, useEffect } from 'react';
import { FaNewspaper, FaCalendarAlt, FaUsers, FaEnvelope, FaBell, FaEye, FaChartLine } from 'react-icons/fa';
import AdminLayout from '../../layout/adminLayout';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

interface DashboardStats {
    totalBlogs: number;
    publishedBlogs: number;
    totalUsers: number;
    totalAppointments: number;
    totalContacts: number;
    totalSubscribers: number;
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.get('/admin/stats');
                setStats(response.data.data);
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
                setError('Failed to load dashboard statistics. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Recent activity - would come from backend in real app
    const recentActivity = [
        { id: 1, action: 'New appointment', time: '2 minutes ago', user: 'John Doe' },
        { id: 2, action: 'New blog post published', time: '1 hour ago', user: 'Admin' },
        { id: 3, action: 'New contact message', time: '3 hours ago', user: 'Sarah Smith' },
        { id: 4, action: 'Newsletter sent', time: 'Yesterday', user: 'Admin' }
    ];

    return (
        <AdminLayout>
            <div className="container mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Welcome, {user?.fullName}!</h2>
                    <p className="text-gray-600">
                        Here's what's happening with your eye center today.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFB915]"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                        {error}
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                                <div className="rounded-full bg-blue-100 p-3 mr-4">
                                    <FaNewspaper className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Blogs</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats?.totalBlogs || 0}</p>
                                    <p className="text-xs text-gray-500">
                                        {stats?.publishedBlogs || 0} Published
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                                <div className="rounded-full bg-green-100 p-3 mr-4">
                                    <FaCalendarAlt className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Appointments</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats?.totalAppointments || 0}</p>
                                    <p className="text-xs text-gray-500">
                                        This month
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                                <div className="rounded-full bg-purple-100 p-3 mr-4">
                                    <FaEnvelope className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Contact Messages</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats?.totalContacts || 0}</p>
                                    <p className="text-xs text-gray-500">
                                        New messages
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                                <div className="rounded-full bg-yellow-100 p-3 mr-4">
                                    <FaBell className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Newsletter Subscribers</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats?.totalSubscribers || 0}</p>
                                    <p className="text-xs text-gray-500">
                                        Active subscribers
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                                <div className="rounded-full bg-red-100 p-3 mr-4">
                                    <FaUsers className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Users</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats?.totalUsers || 0}</p>
                                    <p className="text-xs text-gray-500">
                                        Staff and administrators
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                                <div className="rounded-full bg-indigo-100 p-3 mr-4">
                                    <FaEye className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Blog Views</p>
                                    <p className="text-2xl font-bold text-gray-800">2,856</p>
                                    <p className="text-xs text-green-500">
                                        <span className="flex items-center">
                                            <FaChartLine className="mr-1" /> 12% increase
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-800">Recent Activity</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-800">{activity.action}</span>
                                            <span className="text-xs text-gray-500">{activity.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-500">by {activity.user}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="px-6 py-3 bg-gray-50 text-right">
                                <button className="text-sm text-[#FFB915] font-medium hover:text-[#008787]">
                                    View All Activity
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default Dashboard;