import React from 'react';
import { FaUserMd, FaEnvelope, FaPhone, FaTimes } from 'react-icons/fa';

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

interface DoctorDetailsProps {
    doctor: Doctor;
    onClose: () => void;
}

const DoctorDetails: React.FC<DoctorDetailsProps> = ({ doctor, onClose }) => {
    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div
                    className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center bg-gray-50 px-4 py-3">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Doctor Details</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-20 w-20 rounded-full overflow-hidden bg-[#FFB915]/10 sm:mx-0 sm:h-20 sm:w-20 mb-4 sm:mb-0">
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
                                    <FaUserMd className="h-10 w-10 text-[#FFB915]" />
                                )}
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-bold text-gray-900">
                                    {doctor.name}
                                </h3>
                                <p className="text-sm text-[#FFB915]">{doctor.speciality}</p>

                                <div className="mt-2 border-t border-gray-200 pt-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                            <p className="text-sm text-gray-900 mt-1 flex items-center">
                                                <FaEnvelope className="mr-1 text-gray-400" /> {doctor.email}
                                            </p>
                                        </div>

                                        {doctor.phoneNumber && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                                                <p className="text-sm text-gray-900 mt-1 flex items-center">
                                                    <FaPhone className="mr-1 text-gray-400" /> {doctor.phoneNumber}
                                                </p>
                                            </div>
                                        )}

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                            <p className="text-sm mt-1">
                                                <span
                                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${doctor.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {doctor.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </p>
                                        </div>

                                        {doctor.bio && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500">Bio</h4>
                                                <p className="text-sm text-gray-900 mt-1">{doctor.bio}</p>
                                            </div>
                                        )}

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Added On</h4>
                                            <p className="text-sm text-gray-900 mt-1">{formatDate(doctor.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDetails;