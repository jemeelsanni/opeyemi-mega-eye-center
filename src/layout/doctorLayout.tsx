// src/layout/doctorLayout.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaTachometerAlt,
    FaCalendarAlt,
    FaUserMd,
    FaBars,
    FaTimes,
    FaSignOutAlt,
    FaAngleDown,
    FaCog
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

interface DoctorLayoutProps {
    children: React.ReactNode;
}

const DoctorLayout: React.FC<DoctorLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const userMenu = document.getElementById('user-menu');
            if (userMenu && !userMenu.contains(event.target as Node) && userMenuOpen) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [userMenuOpen]);

    // Auto-close sidebar on route change for mobile
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Check if the current route is active
    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    // Menu items
    const menuItems = [
        {
            name: 'Dashboard',
            path: '/doctor',
            icon: <FaTachometerAlt className="h-5 w-5" />,
        },
        {
            name: 'Appointments',
            path: '/doctor/appointments',
            icon: <FaCalendarAlt className="h-5 w-5" />,
        },
        {
            name: 'Availability',
            path: '/doctor/availability',
            icon: <FaCalendarAlt className="h-5 w-5" />,
        },
        {
            name: 'Profile',
            path: '/doctor/profile',
            icon: <FaUserMd className="h-5 w-5" />,
        },
        {
            name: 'Settings',
            path: '/doctor/settings',
            icon: <FaCog className="h-5 w-5" />,
        }
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#1a1a2e] text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 transition-transform duration-300 ease-in-out lg:static lg:inset-0 overflow-y-auto`}
            >
                <div className="flex items-center justify-between h-16 px-6 border-b border-[#16213e]">
                    <Link to="/doctor" className="flex items-center space-x-2">
                        <span className="text-[#FFB915] text-xl font-bold">Doctor Portal</span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 rounded-md lg:hidden hover:bg-[#16213e]"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex flex-col h-[calc(100%-4rem)] py-4">
                    <div className="flex-1 px-2 space-y-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center px-4 py-3 text-sm rounded-md ${isActive(item.path) ? 'bg-[#16213e] text-[#FFB915]' : 'hover:bg-[#16213e]'
                                    }`}
                            >
                                <span className="mr-3">{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </div>

                    {/* User Profile (Mobile View) */}
                    <div className="px-4 py-4 border-t border-[#16213e] mt-auto lg:hidden">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-9 h-9 rounded-full bg-[#FFB915]/20 flex items-center justify-center">
                                    <FaUserMd className="h-5 w-5 text-[#FFB915]" />
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white">{user?.name || user?.fullName}</p>
                                <p className="text-xs text-gray-400">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Logout button */}
                    <div className="px-4 mt-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-sm text-white rounded-md hover:bg-[#16213e]"
                        >
                            <FaSignOutAlt className="mr-3" />
                            <span>Logout</span>
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top Navbar */}
                <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shadow-sm">
                    {/* Hamburger menu button (mobile only) */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-md lg:hidden"
                    >
                        <FaBars className="w-5 h-5 text-gray-500" />
                    </button>

                    {/* Page title (mobile only) */}
                    <div className="flex-1 px-4 lg:hidden">
                        <h1 className="text-lg font-semibold text-gray-700 truncate">
                            {location.pathname === '/doctor'
                                ? 'Dashboard'
                                : location.pathname.split('/').pop()?.replace(/-/g, ' ')?.replace(/^\w/, c => c.toUpperCase())}
                        </h1>
                    </div>

                    {/* User profile dropdown */}
                    <div className="relative" id="user-menu">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center space-x-2 focus:outline-none"
                        >
                            <div className="w-8 h-8 rounded-full bg-[#FFB915]/20 flex items-center justify-center">
                                <FaUserMd className="h-5 w-5 text-[#FFB915]" />
                            </div>
                            <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name || user?.fullName}</span>
                            <FaAngleDown className="w-4 h-4 text-gray-500" />
                        </button>

                        {/* User menu dropdown */}
                        {userMenuOpen && (
                            <div className="absolute right-0 z-10 w-48 mt-2 bg-white rounded-lg shadow-lg origin-top-right">
                                <div className="p-3 border-b border-gray-100">
                                    <p className="text-xs font-medium text-gray-500">Signed in as</p>
                                    <p className="text-sm font-medium text-gray-700 truncate">{user?.email}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                            Doctor
                                        </span>
                                    </p>
                                </div>
                                <div className="p-2">
                                    <Link
                                        to="/doctor/profile"
                                        className="flex items-center w-full px-3 py-2 text-sm text-left text-gray-700 rounded-md hover:bg-gray-100"
                                    >
                                        <FaUserMd className="w-4 h-4 mr-2 text-gray-500" />
                                        My Profile
                                    </Link>
                                    <Link
                                        to="/doctor/settings"
                                        className="flex items-center w-full px-3 py-2 text-sm text-left text-gray-700 rounded-md hover:bg-gray-100"
                                    >
                                        <FaCog className="w-4 h-4 mr-2 text-gray-500" />
                                        Settings
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-3 py-2 text-sm text-left text-gray-700 rounded-md hover:bg-gray-100"
                                    >
                                        <FaSignOutAlt className="w-4 h-4 mr-2 text-gray-500" />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DoctorLayout;