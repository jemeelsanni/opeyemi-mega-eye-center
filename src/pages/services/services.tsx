import React from "react";
import Navbar from "../../layout/navbar";
import Footer from "../../layout/footer";
import Header from "../../layout/header";
import { motion } from "framer-motion";
import { FaClinicMedical, FaSearchPlus, FaHospital, FaArrowRight } from "react-icons/fa";

// Service icons moved from images to react-icons
// Eye service = FaClinicMedical
// Eye checked = FaSearchPlus
// Hospital = FaHospital

interface ServiceCategory {
  icon: React.ReactNode;
  title: string;
  items: string[];
}

const Services: React.FC = () => {
  const serviceCategories: ServiceCategory[] = [
    {
      icon: <FaClinicMedical className="text-[#FFA500] h-16 w-16" />,
      title: "Clinicals",
      items: [
        "General ophthalmology clinic",
        "Glaucoma clinic",
        "Refraction service",
        "Glass dispensing",
        "Eye surgeries",
        "Preventive eye care",
        "School eye care",
        "Outreach service",
      ],
    },
    {
      icon: <FaSearchPlus className="text-[#FFA500] h-16 w-16" />,
      title: "Investigations",
      items: [
        "Central Visual Field",
        "Autorefraction",
        "Biometry",
        "Pachymetry",
        "Ocular Coherence Tomography + Angiography",
        "A-scan",
        "B-scan",
        "Fundus Photography + Angiography",
        "Intraocular pressure",
      ],
    },
    {
      icon: <FaHospital className="text-[#FFA500] h-16 w-16" />,
      title: "Our Facilities",
      items: [
        "20 bedded space",
        "A standard operation theatre",
        "Three (3) operating microscopes and tables",
        "Standard sterilizing facilities",
        "A pharmaceutical dispensary unit",
        "Two standard investigation rooms",
        "Three consulting rooms",
        "A standard nursing station",
        "OCT",
        "CVF",
        "A-scan",
        "Refractometer / keratometer",
        "Laser Machine",
        "Pressure Check Machine",
      ],
    },
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Navbar />

      {/* Hero Banner */}
      <div
        className="relative bg-cover bg-center h-56 md:h-64 lg:h-80"
        style={{
          backgroundImage:
            "url(https://i.ibb.co/DYWWBXH/national-cancer-institute-L8t-WZT4-Cc-VQ-unsplash.jpg)",
        }}
      >
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center px-4">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-4xl md:text-5xl font-bold text-[#FFA500] mb-4"
            >
              Services & Facilities
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-white text-lg md:text-xl max-w-2xl mx-auto"
            >
              Comprehensive eye care solutions with state-of-the-art technology
            </motion.p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow py-12 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Services offered by Opeyemi Mega Eye Center
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Opeyemi Mega Eye Clinic has the best equipment to give you the
              clinical service you deserve. Our comprehensive range of services ensures
              that your eye health is in the best hands.
            </p>
          </div>

          {/* Services Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {serviceCategories.map((category, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-6 h-full flex flex-col">
                  <div className="flex flex-col items-center mb-6">
                    <div className="mb-4">{category.icon}</div>
                    <h3 className="text-2xl font-bold text-gray-800 text-center">
                      {category.title}
                    </h3>
                  </div>

                  <div className="flex-grow">
                    <ul className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <FaArrowRight className="text-[#FFA500] mt-1 mr-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-[#FFA500] to-[#FF9000] rounded-lg shadow-lg p-8 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to schedule an appointment?
            </h3>
            <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
              Our expert team is ready to provide you with the best eye care services.
              Book your appointment today and take the first step towards better vision.
            </p>
            <button
              onClick={() => window.location.href = "/contact"}
              className="bg-white text-[#FFA500] font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors duration-300 shadow-md"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Services;