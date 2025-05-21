import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Appointment from "../appointment/appointment";
import { FaClock, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaPhoneAlt } from "react-icons/fa";

interface HeroProps {
  heroImages: {
    image: string;
    alt: string;
  }[];
}

const Hero: React.FC<HeroProps> = ({ heroImages }) => {
  const [openModal, setOpenModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-rotate carousel images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
    );
  };

  // Opening hours data
  const openingHours = [
    { day: "Monday - Friday", hours: "8:00 AM - 6:00 PM" },
    { day: "Saturday", hours: "9:00 AM - 5:00 PM" },
    { day: "Sunday", hours: "Emergencies & Surgery" }
  ];

  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Background design elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFB915]/10 rounded-full -translate-x-1/4 -translate-y-1/2 z-0"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2C4A6B]/10 rounded-full translate-x-1/4 translate-y-1/2 z-0"></div>

      {/* Desktop Hero */}
      <div className="hidden md:block relative">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 text-center lg:text-left z-10"
            >
              <div className="inline-block px-4 py-1 bg-[#FFB915]/10 text-[#FFB915] rounded-full mb-4 font-medium">
                Opeyemi Mega Eye Center
              </div>

              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                We Provide a Wide Scope of
                <span className="text-[#2C4A6B]"> Eye Care </span>
                Services
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-xl">
                Opeyemi Mega Eye Centre is a world-class health facility dedicated to curing and preventing eye defects. If you're looking for an eye clinic near you, you might have just stumbled upon one!
              </p>

              <div className="flex flex-col md:flex-row gap-4 md:items-center mb-10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOpenModal(true)}
                  className="bg-[#FFB915] hover:bg-[#2C4A6B] text-white font-medium py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-lg flex items-center justify-center"
                >
                  <FaCalendarAlt className="mr-2" />
                  Book Appointment
                </motion.button>

                <a href="tel:+2348146416676" className="flex items-center justify-center md:justify-start text-[#2C4A6B] font-medium hover:text-[#FFB915] transition-colors">
                  <FaPhoneAlt className="mr-2" />
                  <span>+234 814 641 6676</span>
                </a>
              </div>

              {/* Opening Hours Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 max-w-md"
              >
                <div className="flex items-center mb-4 text-[#2C4A6B]">
                  <FaClock className="mr-2 text-[#FFB915]" />
                  <h3 className="font-bold text-lg">Opening Hours</h3>
                </div>
                <div className="space-y-3">
                  {openingHours.map((item, index) => (
                    <div
                      key={index}
                      className={`flex justify-between ${index < openingHours.length - 1 ? "pb-3 border-b border-gray-100" : ""}`}
                    >
                      <span className="font-medium text-gray-700">{item.day}</span>
                      <span className={`font-medium ${item.day === "Sunday" ? "text-red-500" : "text-[#2C4A6B]"}`}>
                        {item.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Image Carousel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:w-1/2 relative z-10"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-xl border-4 border-white h-[500px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={heroImages[currentImageIndex].image}
                      alt={heroImages[currentImageIndex].alt}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Image counter */}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {currentImageIndex + 1} / {heroImages.length}
                </div>

                {/* Carousel Controls */}
                <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between">
                  <button
                    onClick={prevImage}
                    className="bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-md transition-all hover:scale-110"
                    aria-label="Previous image"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    onClick={nextImage}
                    className="bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-md transition-all hover:scale-110"
                    aria-label="Next image"
                  >
                    <FaChevronRight />
                  </button>
                </div>

                {/* Carousel Indicators */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${index === currentImageIndex
                        ? "bg-white scale-110"
                        : "bg-white/50 hover:bg-white/70"
                        }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Accent decoration */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#FFB915]/20 rounded-full z-[-1]"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#2C4A6B]/20 rounded-full z-[-1]"></div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Hero */}
      <div className="md:hidden relative z-10">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <div className="inline-block px-4 py-1 bg-[#FFB915]/10 text-[#FFB915] rounded-full mb-4 font-medium">
              Opeyemi Mega Eye Center
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              We Provide a Wide Scope of
              <span className="text-[#2C4A6B]"> Eye Care </span>
              Services
            </h1>

            <p className="text-lg text-gray-600 mb-6">
              Opeyemi Mega Eye Centre is a world-class health facility dedicated to curing and preventing eye defects.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpenModal(true)}
              className="bg-[#FFB915] hover:bg-[#2C4A6B] text-white font-medium py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-base w-full flex items-center justify-center mb-4"
            >
              <FaCalendarAlt className="mr-2" />
              Book Appointment Today
            </motion.button>

            <a href="tel:+2347012345678" className="flex items-center justify-center text-[#2C4A6B] font-medium mb-8">
              <FaPhoneAlt className="mr-2" />
              <span>+234 701 234 5678</span>
            </a>

            {/* Mobile Opening Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-4 rounded-xl shadow-md border border-gray-100 mb-8"
            >
              <div className="flex items-center justify-center mb-3 text-[#2C4A6B]">
                <FaClock className="mr-2 text-[#FFB915]" />
                <h3 className="font-bold text-lg">Opening Hours</h3>
              </div>
              <div className="space-y-2">
                {openingHours.map((item, index) => (
                  <div
                    key={index}
                    className={`flex justify-between ${index < openingHours.length - 1 ? "pb-2 border-b border-gray-100" : ""}`}
                  >
                    <span className="font-medium text-gray-700">{item.day}</span>
                    <span className={`font-medium ${item.day === "Sunday" ? "text-red-500" : "text-[#2C4A6B]"}`}>
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Mobile Image Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative rounded-xl overflow-hidden shadow-lg border-2 border-white"
          >
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  src={heroImages[currentImageIndex].image}
                  alt={heroImages[currentImageIndex].alt}
                  className="w-full aspect-[4/3] object-cover"
                />
              </AnimatePresence>

              {/* Image counter */}
              <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium">
                {currentImageIndex + 1} / {heroImages.length}
              </div>

              {/* Mobile Carousel Indicators */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? "bg-white scale-125" : "bg-white/50"
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Mobile Carousel Controls */}
              <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 flex justify-between">
                <button
                  onClick={prevImage}
                  className="bg-white/70 hover:bg-white text-gray-800 rounded-full p-2 text-sm shadow-md"
                  aria-label="Previous image"
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={nextImage}
                  className="bg-white/70 hover:bg-white text-gray-800 rounded-full p-2 text-sm shadow-md"
                  aria-label="Next image"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Appointment Modal */}
      <Appointment open={openModal} onClose={() => setOpenModal(false)} />
    </section>
  );
};

export default Hero;