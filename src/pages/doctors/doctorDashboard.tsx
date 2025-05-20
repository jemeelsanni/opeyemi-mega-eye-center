// src/pages/doctor/DoctorDashboard.tsx
import React, { useState, useEffect } from 'react';
import DoctorLayout from '../../layout/doctorLayout';
import { doctorApi } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

interface Appointment {
    appointmentDate: string;  // ISO date string that can be parsed with new Date()
    status: string;           // Values include at least 'confirmed' and 'pending'
    // Other properties are likely present but not used in this code snippet
}

const DoctorDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        upcomingAppointments: 0,
        todayAppointments: 0,
        confirmedAppointments: 0,
        pendingAppointments: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const response = await doctorApi.getAppointments();
            const appointments: Appointment[] = response.data.data;

            // Now TypeScript will know the type of 'app' in these filter functions
            const today = new Date().toISOString().split('T')[0];
            const upcoming = appointments.filter((app: Appointment) =>
                new Date(app.appointmentDate).toISOString().split('T')[0] >= today
            ).length;

            const todayApps = appointments.filter((app: Appointment) =>
                new Date(app.appointmentDate).toISOString().split('T')[0] === today
            ).length;

            const confirmed = appointments.filter((app: Appointment) => app.status === 'confirmed').length;
            const pending = appointments.filter((app: Appointment) => app.status === 'pending').length;

            setStats({
                upcomingAppointments: upcoming,
                todayAppointments: todayApps,
                confirmedAppointments: confirmed,
                pendingAppointments: pending
            });
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <DoctorLayout>
            <div className="container mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Doctor Dashboard</h1>

                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Welcome, Dr. {user?.name || user?.fullName}!</h2>
                    <p className="text-gray-600">
                        Here's an overview of your appointments and schedule.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFB915]"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Today's Appointments</h3>
                            <p className="text-3xl font-bold text-[#FFB915]">{stats.todayAppointments}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Upcoming Appointments</h3>
                            <p className="text-3xl font-bold text-[#FFB915]">{stats.upcomingAppointments}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Confirmed</h3>
                            <p className="text-3xl font-bold text-green-600">{stats.confirmedAppointments}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Pending</h3>
                            <p className="text-3xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
                        </div>
                    </div>
                )}
            </div>
        </DoctorLayout>
    );
};

export default DoctorDashboard;