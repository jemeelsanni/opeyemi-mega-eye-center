import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaNewspaper,
  FaCalendarAlt,
  FaEnvelope,
  FaUsers,
  FaBell,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaAngleDown,
  FaAngleRight,
  FaCog,
  FaUserMd,
  FaStar
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [blogSubmenu, setBlogSubmenu] = useState(false);
  const [doctorSubmenu, setDoctorSubmenu] = useState(false);

  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const userMenu = document.getElementById('user-menu');
      const notificationsMenu = document.getElementById('notifications-menu');

      if (userMenu && !userMenu.contains(event.target as Node) && userMenuOpen) {
        setUserMenuOpen(false);
      }

      if (notificationsMenu && !notificationsMenu.contains(event.target as Node) && notificationsOpen) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen, notificationsOpen]);

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
    if (path === '#') return false;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Is blog section active
  const isBlogSectionActive = () => {
    return location.pathname.includes('/blog') || location.pathname.includes('/createBlog') ||
      location.pathname.includes('/admin/blogs') || location.pathname.includes('/admin/createBlog');
  };

  // Is doctor section active
  const isDoctorSectionActive = () => {
    return location.pathname.includes('/admin/doctors');
  };

  // Menu items with role-based visibility
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: <FaTachometerAlt className="h-5 w-5" />,
      roles: ['admin', 'superadmin']
    },
    {
      name: 'Blog Management',
      path: '#',
      icon: <FaNewspaper className="h-5 w-5" />,
      roles: ['admin', 'superadmin'],
      hasSubmenu: true,
      submenuItems: [
        { name: 'All Blogs', path: '/admin/blogs' },
        { name: 'Create Blog', path: '/admin/createBlog' }
      ]
    },
    {
      name: 'Doctors',
      path: '/admin/doctors',
      icon: <FaUserMd className="h-5 w-5" />,
      roles: ['superadmin'],
      hasSubmenu: true,
    },
    {
      name: 'Appointments',
      path: '/admin/appointments',
      icon: <FaCalendarAlt className="h-5 w-5" />,
      roles: ['superadmin', 'admin']
    },
    {
      name: 'Contact Messages',
      path: '/admin/contacts',
      icon: <FaEnvelope className="h-5 w-5" />,
      roles: ['superadmin']
    },
    {
      name: 'Testimonials',
      path: '/admin/testimonials',
      icon: <FaStar className="h-5 w-5" />,
      roles: ['superadmin']
    },
    {
      name: 'Events',
      path: '/admin/events',
      icon: <FaCalendarAlt className="h-5 w-5" />,
      roles: ['superadmin']
    },
    {
      name: 'Newsletter Subscribers',
      path: '/admin/newsletters',
      icon: <FaNewspaper className="h-5 w-5" />,
      roles: ['superadmin']
    },
    {
      name: 'User Management',
      path: '/admin/users',
      icon: <FaUsers className="h-5 w-5" />,
      roles: ['superadmin']
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: <FaCog className="h-5 w-5" />,
      roles: ['superadmin']
    }
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(user?.role || '')
  );

  // Mock notifications - would come from backend in real app
  const notifications = [
    { id: 1, text: 'New appointment request from John Doe', time: '2 min ago', type: 'appointment' },
    { id: 2, text: 'New contact message from Sarah Smith', time: '1 hour ago', type: 'message' },
    { id: 3, text: 'New newsletter subscriber: email@example.com', time: 'Yesterday', type: 'newsletter' },
    { id: 4, text: 'Blog post "Eye Care Tips" has 10 new views', time: '2 days ago', type: 'blog' }
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
          <Link to="/admin" className="flex items-center space-x-2">
            <span className="text-[#FFB915] text-xl font-bold">Eye Center Admin</span>
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
            {filteredMenuItems.map((item) => (
              <div key={item.name}>
                {item.hasSubmenu ? (
                  <div>
                    <button
                      onClick={() => {
                        if (item.name === 'Blog Management') {
                          setBlogSubmenu(!blogSubmenu);
                        } else if (item.name === 'Doctor Management') {
                          setDoctorSubmenu(!doctorSubmenu);
                        }
                      }}
                      className={`flex items-center justify-between w-full px-4 py-3 text-sm rounded-md ${(item.name === 'Blog Management' && isBlogSectionActive()) ||
                        (item.name === 'Doctor Management' && isDoctorSectionActive())
                        ? 'bg-[#16213e] text-[#FFB915]'
                        : 'hover:bg-[#16213e]'
                        }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      {item.name === 'Blog Management' ? (
                        blogSubmenu ? <FaAngleDown className="h-4 w-4" /> : <FaAngleRight className="h-4 w-4" />
                      ) : item.name === 'Doctor Management' ? (
                        doctorSubmenu ? <FaAngleDown className="h-4 w-4" /> : <FaAngleRight className="h-4 w-4" />
                      ) : null}
                    </button>

                    {/* Submenu */}
                    {((item.name === 'Blog Management' && blogSubmenu) || (item.name === 'Doctor Management' && doctorSubmenu)) && (
                      <div className="pl-10 mt-1 space-y-1">
                        {item.submenuItems!.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.path}
                            className={`block px-4 py-2 text-sm rounded-md ${isActive(subItem.path) ? 'bg-[#16213e] text-[#FFB915]' : 'hover:bg-[#16213e]'
                              }`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-sm rounded-md ${isActive(item.path) ? 'bg-[#16213e] text-[#FFB915]' : 'hover:bg-[#16213e]'
                      }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* User Profile (Mobile View) */}
          <div className="px-4 py-4 border-t border-[#16213e] mt-auto lg:hidden">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaUserCircle className="h-9 w-9 text-[#FFB915]" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.fullName}</p>
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
              {location.pathname === '/admin'
                ? 'Dashboard'
                : location.pathname.split('/').pop()?.replace(/-/g, ' ')?.replace(/^\w/, c => c.toUpperCase())}
            </h1>
          </div>

          {/* Right section with notifications and user profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications dropdown */}
            <div className="relative" id="notifications-menu">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none relative"
              >
                <FaBell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full transform -translate-y-1/2 translate-x-1/2">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications dropdown menu */}
              {notificationsOpen && (
                <div className="absolute right-0 z-10 w-80 mt-2 bg-white rounded-lg shadow-lg origin-top-right">
                  <div className="p-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                  </div>
                  <div className="overflow-y-auto max-h-60">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div key={notification.id} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                          <p className="text-sm text-gray-700">{notification.text}</p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-500">{notification.time}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${notification.type === 'appointment' ? 'bg-blue-100 text-blue-800' :
                              notification.type === 'message' ? 'bg-purple-100 text-purple-800' :
                                notification.type === 'newsletter' ? 'bg-green-100 text-green-800' :
                                  'bg-yellow-100 text-yellow-800'
                              }`}>
                              {notification.type}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500">
                        <p className="text-sm">No new notifications</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-2 text-center border-t border-gray-100">
                      <button className="text-sm text-[#FFB915] hover:text-[#008787]">
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User profile dropdown */}
            <div className="relative" id="user-menu">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <FaUserCircle className="w-8 h-8 text-gray-500" />
                <span className="hidden md:block text-sm font-medium text-gray-700">{user?.fullName}</span>
                <FaAngleDown className="w-4 h-4 text-gray-500" />
              </button>

              {/* User menu dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 z-10 w-48 mt-2 bg-white rounded-lg shadow-lg origin-top-right">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium text-gray-700 truncate">{user?.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className={`px-1.5 py-0.5 rounded-full ${user?.role === 'superadmin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                        {user?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/admin/profile"
                      className="flex items-center w-full px-3 py-2 text-sm text-left text-gray-700 rounded-md hover:bg-gray-100"
                    >
                      <FaUserCircle className="w-4 h-4 mr-2 text-gray-500" />
                      My Profile
                    </Link>
                    <Link
                      to="/admin/settings"
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

export default AdminLayout;