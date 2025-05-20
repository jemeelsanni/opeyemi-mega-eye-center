// src/pages/doctors/doctorDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import DoctorLayout from '../../layout/doctorLayout';
import { FaUserMd } from 'react-icons/fa';

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

const DoctorDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                setIsLoading(true);
                setError('');

                // Use the public endpoint to get doctor details
                const response = await apiClient.get(`/doctors/public/${id}`);
                setDoctor(response.data.data);
            } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
                console.error('Failed to fetch doctor details:', err);
                setError(err.response?.data?.message || 'Failed to load doctor. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchDoctor();
        }
    }, [id]);

    // Format date function


    return (
        <DoctorLayout>
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Doctor Details</h1>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFB915]"></div>
                    </div>
                ) : doctor ? (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6">
                                <div className="flex-shrink-0 h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 mb-4 sm:mb-0 sm:mr-6">
                                    {doctor.image ? (
                                        <img
                                            src={doctor.image}
                                            alt={doctor.name}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null;
                                                target.src = 'https://via.placeholder.com/200?text=No+Image';
                                            }}
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-[#FFB915]/10">
                                            <FaUserMd className="text-[#FFB915] text-3xl" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
                                    <p className="text-[#FFB915] font-medium">{doctor.speciality}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                    <p className="mt-1 text-sm text-gray-900">{doctor.email}</p>
                                </div>

                                {doctor.phoneNumber && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                                        <p className="mt-1 text-sm text-gray-900">{doctor.phoneNumber}</p>
                                    </div>
                                )}

                                {doctor.bio && (
                                    <div className="sm:col-span-2">
                                        <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                                        <p className="mt-1 text-sm text-gray-900">{doctor.bio}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-gray-600">Doctor not found.</p>
                    </div>
                )}
            </div>
        </DoctorLayout>
    );
};

export default DoctorDetailsPage;