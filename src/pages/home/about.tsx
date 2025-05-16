import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";

interface AboutProps {
  welcomeImage: string;
}

const About: React.FC<AboutProps> = ({ welcomeImage }) => {
  const benefits = [
    "World-class eye care facility",
    "Cutting-edge diagnostic equipment",
    "Experienced medical professionals",
    "Comprehensive eye health services",
    "Preventive and curative treatments",
    "Patient-centered approach",
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-1/2 pr-12"
          >
            <img
              src={welcomeImage}
              alt="Opeyemi Mega Eye Center Facility"
              className="rounded-lg shadow-xl w-full h-auto object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-1/2"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Welcome to <span className="text-[#FFA500]">OMEC</span>
            </h2>

            <p className="text-gray-700 mb-6">
              Opeyemi Mega Eye Centre is a world-class health facility dedicated to providing all your eye health needs, not only curative but also preventive. We boast of cutting-edge equipment which aids in the diagnosis and treatment of medical and surgical eye conditions.
            </p>

            <p className="text-gray-700 mb-6">
              We are a well-established professional eye hospital based in Ilorin, Kwara State, with a 20-bed capacity hospital that has all the units of a general eye hospital, including specialist services, high-tech investigation equipment, and pharmacy.
            </p>

            <motion.ul
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-3 mb-6"
            >
              {benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="flex items-start"
                >
                  <FaCheckCircle className="text-[#FFA500] mt-1 mr-2 flex-shrink-0" />
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </motion.ul>

            <p className="text-gray-700">
              Our hospital is well endowed with a team of experts and professionals specializing in delivering quality healthcare solutions with professionalism and according to international standards, with a thorough understanding of the Nigerian service requirements and culture. We aim to set a standard for medical eye care, hence we continue updating and upgrading to ensure that you get the best.
            </p>
          </motion.div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold mb-4">
              Welcome to <span className="text-[#FFA500]">OMEC</span>
            </h2>

            <p className="text-gray-700 mb-6">
              Opeyemi Mega Eye Centre is a world-class health facility dedicated to providing all your eye health needs, not only curative but also preventive.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <img
              src={welcomeImage}
              alt="Opeyemi Mega Eye Center Facility"
              className="rounded-lg shadow-lg w-full h-auto object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-gray-700 mb-6">
              We boast of cutting-edge equipment which aids in the diagnosis and treatment of medical and surgical eye conditions. We are a well-established professional eye hospital based in Ilorin, Kwara State, with a 20-bed capacity hospital.
            </p>

            <motion.ul
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3 mb-6"
            >
              {benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="flex items-start"
                >
                  <FaCheckCircle className="text-[#FFA500] mt-1 mr-2 flex-shrink-0" />
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </motion.ul>

            <p className="text-gray-700">
              Our hospital is well endowed with a team of experts and professionals delivering quality healthcare solutions with professionalism and according to international standards.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;