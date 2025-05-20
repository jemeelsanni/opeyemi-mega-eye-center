import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import EditDoctor from './editDoctor';
import AdminLayout from '../../../layout/adminLayout';

interface Doctor {
    _id: string;
    name: string;
    email: string;
    speciality: string;
    phoneNumber?: string;
    bio?: string;
    image?: string;
    isActive: boolean;
    createdAt: string;
}

const EditDoctorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.get(`/doctors/admin/${id}`);
                setDoctor(response.data.data);
            } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
                console.error('Failed to fetch doctor:', err);
                setError(err.response?.data?.message || 'Failed to load doctor. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDoctor();
    }, [id]);

    const handleSuccess = () => {
        // Navigate back to doctor management page on success
        navigate('/admin/doctors');
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFB915]"></div>
                </div>
            </AdminLayout>
        );
    }

    if (error || !doctor) {
        return (
            <AdminLayout>
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                    {error || 'Doctor not found'}
                </div>
                <button
                    onClick={() => navigate('/admin/doctors')}
                    className="text-[#FFB915] hover:text-[#2C4A6B]"
                >
                    Back to Doctor Management
                </button>
            </AdminLayout>
        );
    }

    return (
        <EditDoctor
            doctor={doctor}
            onSuccess={handleSuccess}
            onClose={() => navigate('/admin/doctors')}
        />
    );
};

export default EditDoctorPage;