import React, { useState, useEffect, useCallback } from "react";
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight, FaUserCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface Testimonial {
  rating: number;
  review: string;
  name: string;
  position: string;
  image: string;
}

interface TestimonialsProps {
  testimonialsData: Testimonial[];
}

const Testimonials: React.FC<TestimonialsProps> = ({ testimonialsData }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Auto slide functionality
  useEffect(() => {
    if (!isAutoplay) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentTestimonial((prev) =>
        prev === testimonialsData.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoplay, testimonialsData.length]);

  // Handle next/prev navigation
  const handleNext = useCallback(() => {
    setIsAutoplay(false);
    setDirection(1);
    setCurrentTestimonial((prev) =>
      prev === testimonialsData.length - 1 ? 0 : prev + 1
    );
  }, [testimonialsData.length]);

  const handlePrev = useCallback(() => {
    setIsAutoplay(false);
    setDirection(-1);
    setCurrentTestimonial((prev) =>
      prev === 0 ? testimonialsData.length - 1 : prev - 1
    );
  }, [testimonialsData.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) {
      // Swipe left
      handleNext();
    }

    if (touchStart - touchEnd < -100) {
      // Swipe right
      handlePrev();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
          >
            What Our Patients Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Over the years, we've treated patients who can testify to the quality of our treatment and care
          </motion.p>
        </div>

        {/* Testimonials Carousel - Desktop */}
        <div
          className="hidden md:block relative max-w-5xl mx-auto"
          role="region"
          aria-label="Testimonials carousel"
        >
          {/* Testimonial Slide */}
          <div
            className="bg-white rounded-xl shadow-lg overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="md:flex">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentTestimonial}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="md:flex w-full"
                >
                  {/* Testimonial Content */}
                  <div className="md:w-2/3 p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex mb-6">
                      {Array.from({ length: 5 }, (_, i) => (
                        <FaStar
                          key={i}
                          className={`${i < testimonialsData[currentTestimonial].rating
                              ? "text-[#FFA500]"
                              : "text-gray-300"
                            } w-6 h-6 mr-1`}
                        />
                      ))}
                    </div>

                    <div className="relative">
                      <FaQuoteLeft className="absolute -left-2 -top-2 text-[#FFA500]/20 text-4xl" />
                      <p className="text-gray-600 text-lg italic mb-8 relative z-10">
                        {testimonialsData[currentTestimonial].review}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-gray-800">
                        {testimonialsData[currentTestimonial].name}
                      </h4>
                      <p className="text-gray-600">
                        {testimonialsData[currentTestimonial].position}
                      </p>
                    </div>
                  </div>

                  {/* Testimonial Image */}
                  <div className="md:w-1/3 bg-[#FFA500]/10">
                    <div className="h-full flex items-center justify-center p-8">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                        {testimonialsData[currentTestimonial].image ? (
                          <img
                            src={testimonialsData[currentTestimonial].image}
                            alt={testimonialsData[currentTestimonial].name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaUserCircle className="w-full h-full text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePrev}
              className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:ring-offset-2"
              aria-label="Previous testimonial"
            >
              <FaChevronLeft className="text-[#FFA500]" />
            </button>

            <div className="flex justify-center space-x-2">
              {testimonialsData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoplay(false);
                    setDirection(index > currentTestimonial ? 1 : -1);
                    setCurrentTestimonial(index);
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${index === currentTestimonial
                      ? "bg-[#FFA500] w-8"
                      : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                  aria-current={index === currentTestimonial ? "true" : "false"}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:ring-offset-2"
              aria-label="Next testimonial"
            >
              <FaChevronRight className="text-[#FFA500]" />
            </button>
          </div>
        </div>

        {/* Testimonials Cards - Mobile */}
        <div className="md:hidden">
          <div className="space-y-6">
            {testimonialsData.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-center mb-4">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FaStar
                      key={i}
                      className={`${i < testimonial.rating
                          ? "text-[#FFA500]"
                          : "text-gray-300"
                        } w-4 h-4 mr-1`}
                    />
                  ))}
                </div>

                <p className="text-gray-600 italic mb-4 text-sm">
                  "{testimonial.review}"
                </p>

                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md mr-4">
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="w-full h-full text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {testimonial.position}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Add Testimonial Button (Optional) */}
          <div className="mt-8 text-center">
            <a
              href="/contact"
              className="inline-flex items-center text-[#FFA500] font-medium hover:text-[#FF9000] transition-colors"
            >
              Share your experience
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;