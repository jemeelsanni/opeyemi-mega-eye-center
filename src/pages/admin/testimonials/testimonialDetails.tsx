// src/pages/admin/testimonials/testimonialDetails.tsx
import React from 'react';
import { FaStar, FaTimes, FaUserCircle, FaCheck } from 'react-icons/fa';
import { Testimonial } from '../../../api/apiClient';

interface TestimonialDetailsProps {
    testimonial: Testimonial;
    onClose: () => void;
    onApprove: (testimonial: Testimonial) => void;
    onReject: (testimonial: Testimonial) => void;
}

const TestimonialDetails: React.FC<TestimonialDetailsProps> = ({
    testimonial,
    onClose,
    onApprove,
    onReject
}) => {
    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Testimonial Details</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6">
                            <div className="flex-shrink-0 h-24 w-24 rounded-full overflow-hidden bg-gray-100 mb-4 sm:mb-0 sm:mr-6">
                                {testimonial.image ? (
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = 'https://via.placeholder.com/100?text=User';
                                        }}
                                    />
                                ) : (
                                    <FaUserCircle className="h-full w-full text-gray-400" />
                                )}
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-xl font-bold text-gray-800">{testimonial.name}</h3>
                                <p className="text-gray-600">{testimonial.position}</p>
                                <div className="flex mt-2 justify-center sm:justify-start">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <FaStar
                                            key={i}
                                            className={`${i < testimonial.rating ? 'text-[#FFB915]' : 'text-gray-300'} w-5 h-5`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-500">Review</h4>
                                <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-800 whitespace-pre-wrap">{testimonial.review}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                    <p className="mt-1">
                                        <span
                                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${testimonial.isApproved
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                        >
                                            {testimonial.isApproved ? 'Approved' : 'Pending Approval'}
                                        </span>
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Submitted On</h4>
                                    <p className="mt-1 text-sm text-gray-900">{formatDate(testimonial.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-between">
                        {!testimonial.isApproved ? (
                            <button
                                onClick={() => onApprove(testimonial)}
                                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm"
                            >
                                <FaCheck className="mr-2" /> Approve
                            </button>
                        ) : (
                            <button
                                onClick={() => onReject(testimonial)}
                                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm"
                            >
                                <FaTimes className="mr-2" /> Reject
                            </button>
                        )}

                        <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
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

export default TestimonialDetails;