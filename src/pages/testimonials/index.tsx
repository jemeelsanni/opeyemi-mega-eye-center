// src/pages/testimonials/index.tsx
import React, { useState, useEffect } from "react";
import { FaStar, FaUserCircle, FaSpinner, FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import { testimonialApi, Testimonial } from "../../api/apiClient";
import TestimonialModal from "../home/testimonialModal";
import Header from "../../layout/header";
import Navbar from "../../layout/navbar";
import Footer from "../../layout/footer";

const TestimonialsPage: React.FC = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);

    // Fetch all testimonials
    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                setLoading(true);
                const response = await testimonialApi.getAllTestimonials();
                setTestimonials(response.data);
                setFilteredTestimonials(response.data);
            } catch (err) {
                console.error("Error fetching testimonials:", err);
                setError("An error occurred while fetching testimonials");
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    // Filter testimonials based on search term
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredTestimonials(testimonials);
        } else {
            const filtered = testimonials.filter(
                (testimonial) =>
                    testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    testimonial.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    testimonial.review.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredTestimonials(filtered);
        }
    }, [searchTerm, testimonials]);

    // Format date for display
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "long",
            day: "numeric",
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <Navbar />
            <section className="bg-gradient-to-r from-[#2C4A6B] to-[#FFB915] py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center text-white">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            className="text-4xl md:text-6xl font-bold mb-4"
                        >
                            Patient Testimonials
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className="text-xl md:text-2xl opacity-90"
                        >
                            Read what our patients say about their experiences with our eye care services
                        </motion.p>
                    </div>
                </div>
            </section>

            <main className="flex-grow pb-16 pt-8">
                <div className="container mx-auto px-4">
                    {/* Page Header */}
                    <div className="text-center mb-12">
                        {/* Add Testimonial Button */}
                        <button
                            onClick={() => setShowModal(true)}
                            className="mt-8 px-6 py-3 bg-[#FFB915] text-white rounded-lg hover:bg-[#2C4A6B] transition-colors flex items-center mx-auto"
                        >
                            <FaPlus className="mr-2" /> Share Your Experience
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-md mx-auto mb-12">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search testimonials..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-[#FFB915] focus:border-[#FFB915]"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                    className="h-5 w-5 text-gray-400"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Testimonials Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <FaSpinner className="animate-spin h-12 w-12 text-[#FFB915]" />
                        </div>
                    ) : error ? (
                        <div className="text-center p-8 bg-red-50 rounded-lg text-red-600">
                            <p>{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : filteredTestimonials.length === 0 ? (
                        <div className="text-center p-8">
                            {searchTerm ? (
                                <p className="text-gray-600">No testimonials match your search criteria.</p>
                            ) : (
                                <p className="text-gray-600">No testimonials available yet. Be the first to share your experience!</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredTestimonials.map((testimonial, index) => (
                                <motion.div
                                    key={testimonial._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col"
                                >
                                    <div className="bg-[#FFB915]/10 p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center">
                                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                                                    {testimonial.image ? (
                                                        <img
                                                            src={testimonial.image}
                                                            alt={testimonial.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.onerror = null;
                                                                target.src = 'https://via.placeholder.com/64?text=User';
                                                            }}
                                                        />
                                                    ) : (
                                                        <FaUserCircle className="w-full h-full text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <h3 className="text-lg font-bold text-gray-800">
                                                        {testimonial.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">{testimonial.position}</p>
                                                </div>
                                            </div>
                                            <div className="flex">
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <FaStar
                                                        key={i}
                                                        className={`${i < testimonial.rating
                                                            ? "text-[#FFB915]"
                                                            : "text-gray-300"
                                                            } w-4 h-4`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 flex-grow">
                                        <div className="relative">
                                            <svg
                                                className="absolute top-0 left-0 transform -translate-x-3 -translate-y-3 h-8 w-8 text-gray-200"
                                                fill="currentColor"
                                                viewBox="0 0 32 32"
                                                aria-hidden="true"
                                            >
                                                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                                            </svg>
                                            <p className="relative mt-4 text-gray-600 italic">
                                                {testimonial.review}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="px-6 pb-4 text-right text-xs text-gray-500">
                                        Posted on {formatDate(testimonial.createdAt)}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            {/* Testimonial Submission Modal */}
            <TestimonialModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </div>
    );
};

export default TestimonialsPage;