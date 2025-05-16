import React, { useState } from "react";
import { motion } from "framer-motion";
import Appointment from "../appointment/appointment";

interface HeroProps {
  heroImages: {
    image: string;
    alt: string;
  }[];
}

const Hero: React.FC<HeroProps> = ({ heroImages }) => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <section className="bg-gray-50 py-16 md:py-0">
      {/* Desktop Hero */}
      <div className="hidden md:block relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between py-20">
            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0 lg:pr-12"
            >
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                We Provide a Wide Scope of Eye Care Services
              </h1>

              <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0">
                Opeyemi Mega Eye Centre is a world-class health facility dedicated to curing and preventing eye defects. If you're looking for an eye clinic near you, you might have just stumbled upon one!
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpenModal(true)}
                className="bg-[#FFA500] hover:bg-[#FF9000] text-white font-medium py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-lg"
              >
                Book Appointment Today
              </motion.button>
            </motion.div>

            {/* Hero Image Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:w-1/2"
            >
              <div className="grid grid-cols-2 grid-rows-3 gap-4">
                {heroImages.slice(0, 6).map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 + (index * 0.1) }}
                    className={`overflow-hidden rounded-lg shadow-md ${index === 0 || index === 1 ? "col-span-1 row-span-2" : "col-span-1 row-span-1"
                      }`}
                  >
                    <img
                      src={img.image}
                      alt={img.alt}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Hero */}
      <div className="md:hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              We Provide a Wide Scope of Eye Care Services
            </h1>

            <p className="text-lg text-gray-600 mb-6">
              Opeyemi Mega Eye Centre is a world-class health facility dedicated to curing and preventing eye defects.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpenModal(true)}
              className="bg-[#FFA500] hover:bg-[#FF9000] text-white font-medium py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-base w-full"
            >
              Book Appointment Today
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="grid grid-cols-3 gap-2">
              {heroImages.slice(0, 6).map((img, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 + (index * 0.1) }}
                  className="overflow-hidden rounded-md shadow-sm"
                >
                  <img
                    src={img.image}
                    alt={img.alt}
                    className="w-full h-full object-cover aspect-square"
                  />
                </motion.div>
              ))}
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