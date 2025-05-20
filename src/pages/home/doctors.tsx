import React, { useState, useEffect } from "react";
import apiClient from "../../api/apiClient";
import { motion } from "framer-motion";
import { FaEnvelope, FaPhone, FaCalendarAlt, FaSpinner, FaUserMd } from "react-icons/fa";
import defaultDoctorImage from "../../assets/CEO.jpg"; // Create a default image

interface Doctor {
  _id: string;
  name: string;
  speciality: string;
  bio?: string;
  phoneNumber?: string;
  email?: string;
  image?: string;
  isActive: boolean;
}

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/doctors/public');

        if (response.data.success) {
          setDoctors(response.data.data);
        } else {
          setError("Failed to load doctors information");
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("An error occurred while fetching doctor information");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleDoctorClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    target.src = defaultDoctorImage;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1 bg-[#FFB915]/10 text-[#FFB915] rounded-full mb-4 font-medium">
              Our Medical Team
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Meet Our Expert Doctors
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We have doctors on board with quality years of experience to help
              you with your eye health needs. Our team is dedicated to providing
              exceptional eye care services.
            </p>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-[#FFB915] text-4xl" />
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
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {doctors.length > 0 ? doctors.map((doctor) => (
              <motion.div
                key={doctor._id}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all group"
              >
                <div className="h-[300px] overflow-hidden">
                  {doctor.image ? (
                    <img
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src={doctor.image}
                      alt={doctor.name}
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <FaUserMd className="text-gray-400 text-6xl" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
                  <p className="text-[#FFB915] font-medium">{doctor.speciality}</p>

                  <p className="text-gray-600 mt-3 line-clamp-3">
                    {doctor.bio || "Experienced eye care specialist dedicated to providing exceptional patient care."}
                  </p>

                  <div className="mt-6 flex justify-between items-center">
                    <button
                      onClick={() => handleDoctorClick(doctor)}
                      className="px-4 py-2 bg-[#FFB915] text-white rounded-full hover:bg-[#2C4A6B] transition-colors flex items-center text-sm"
                    >
                      <FaCalendarAlt className="mr-2" />
                      Book Appointment
                    </button>

                    <button
                      onClick={() => handleDoctorClick(doctor)}
                      className="text-[#2C4A6B] hover:text-[#FFB915] font-medium text-sm transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full text-center p-8">
                <p className="text-gray-600">No doctors are currently available. Please check back later.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Doctor Details Modal */}
      {showModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl overflow-hidden shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="relative">
              <div className="h-48 md:h-64 bg-gradient-to-r from-[#2C4A6B] to-[#FFB915] flex items-end">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={closeModal}
                    className="bg-white/80 hover:bg-white p-2 rounded-full w-10 text-gray-800 transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="mx-auto -mt-20 w-40 h-40 rounded-full border-4 border-white overflow-hidden bg-white">
                {selectedDoctor.image ? (
                  <img
                    src={selectedDoctor.image}
                    alt={selectedDoctor.name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <FaUserMd className="text-gray-400 text-6xl" />
                  </div>
                )}
              </div>

              <div className="p-6 text-center pt-4">
                <h3 className="text-2xl font-bold text-gray-800">{selectedDoctor.name}</h3>
                <p className="text-[#FFB915] font-medium mb-4">{selectedDoctor.speciality}</p>

                <div className="flex justify-center space-x-3 mb-6">
                  {selectedDoctor.email && (
                    <a
                      href={`mailto:${selectedDoctor.email}`}
                      className="p-2 bg-[#FFB915]/10 text-[#FFB915] rounded-full hover:bg-[#FFB915]/20 transition-colors"
                      title="Send Email"
                    >
                      <FaEnvelope />
                    </a>
                  )}
                  {selectedDoctor.phoneNumber && (
                    <a
                      href={`tel:${selectedDoctor.phoneNumber}`}
                      className="p-2 bg-[#FFB915]/10 text-[#FFB915] rounded-full hover:bg-[#FFB915]/20 transition-colors"
                      title="Call Doctor"
                    >
                      <FaPhone />
                    </a>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                  <h4 className="font-medium mb-2 text-gray-800">About</h4>
                  <p className="text-gray-600">
                    {selectedDoctor.bio || "Experienced eye care specialist dedicated to providing exceptional patient care and committed to helping patients maintain optimal eye health."}
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors mr-3"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    closeModal();
                    // Replace with your actual booking logic or navigation to appointment page
                    // e.g., history.push('/appointment') or open appointment modal
                    console.log("Book with", selectedDoctor.name);
                  }}
                  className="px-6 py-2 bg-[#FFB915] text-white rounded-full hover:bg-[#2C4A6B] transition-colors"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default Doctors;