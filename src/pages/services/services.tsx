import React from "react";
import Navbar from "../../layout/navbar";
import Footer from "../../layout/footer";
import Header from "../../layout/header";
import { motion } from "framer-motion";
import { FaClinicMedical, FaSearchPlus, FaHospital, FaArrowRight, FaPlusCircle } from "react-icons/fa";

// Service icons moved from images to react-icons
// Eye service = FaClinicMedical
// Eye checked = FaSearchPlus
// Hospital = FaHospital

interface ServiceCategory {
  icon: React.ReactNode;
  title: string;
  items: string[];
  images: string[];
  description: string;
}

const Services: React.FC = () => {
  const serviceCategories: ServiceCategory[] = [
    {
      icon: <FaClinicMedical className="text-[#FFB915] h-16 w-16" />,
      title: "Clinicals",
      description: "We offer a comprehensive range of clinical services to diagnose, treat, and manage various eye conditions with precision and care.",
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
      images: [
        "https://images.unsplash.com/photo-1570612861542-284f4c12e75f?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1780&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1584555613497-9ecf312e64fa?q=80&w=2075&auto=format&fit=crop"
      ],
    },
    {
      icon: <FaSearchPlus className="text-[#FFB915] h-16 w-16" />,
      title: "Investigations",
      description: "Our state-of-the-art diagnostic equipment allows for accurate and detailed investigations of your eye health.",
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
      images: [
        "https://images.unsplash.com/photo-1551601651-09492b5468b6?q=80&w=1923&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1610821684476-40ebbc8d36bd?q=80&w=1932&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1598885932984-5b4ad05b8986?q=80&w=2070&auto=format&fit=crop"
      ],
    },
    {
      icon: <FaHospital className="text-[#FFB915] h-16 w-16" />,
      title: "Our Facilities",
      description: "Our hospital is equipped with modern facilities and advanced technology to provide the highest standard of eye care.",
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
      images: [
        "https://images.unsplash.com/photo-1504439468489-c8920d796a29?q=80&w=2071&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1516727003284-a96541e51e9c?q=80&w=2080&auto=format&fit=crop"
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

  const [selectedCategory, setSelectedCategory] = React.useState<number | null>(null);

  const openGallery = (index: number) => {
    setSelectedCategory(index);
  };

  const closeGallery = () => {
    setSelectedCategory(null);
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
              className="text-4xl md:text-5xl font-bold text-[#FFB915] mb-4"
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
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
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
                    <p className="text-gray-600 text-center mt-2">
                      {category.description}
                    </p>
                  </div>

                  {/* Equipment Images */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {category.images.map((image, imgIndex) => (
                      <div
                        key={imgIndex}
                        className="relative aspect-square rounded-md overflow-hidden cursor-pointer group"
                        onClick={() => openGallery(index)}
                      >
                        <img
                          src={image}
                          alt={`${category.title} equipment ${imgIndex + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                          <FaPlusCircle className="text-white text-xl" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex-grow">
                    <ul className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <FaArrowRight className="text-[#FFB915] mt-1 mr-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Equipment Spotlight Section */}
          <div className="mt-16">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
              State-of-the-Art Equipment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop"
                  alt="Optical Coherence Tomography"
                  className="w-full h-48 object-cover rounded-md mb-3"
                />
                <h4 className="font-bold text-lg">Optical Coherence Tomography (OCT)</h4>
                <p className="text-gray-600">Advanced imaging technology that captures detailed cross-sectional images of the retina.</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?q=80&w=2070&auto=format&fit=crop"
                  alt="Digital Eye Exam"
                  className="w-full h-48 object-cover rounded-md mb-3"
                />
                <h4 className="font-bold text-lg">Digital Refractometer</h4>
                <p className="text-gray-600">Precise measurements of your eye's refractive error for accurate prescription glasses.</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1780&auto=format&fit=crop"
                  alt="Slit Lamp"
                  className="w-full h-48 object-cover rounded-md mb-3"
                />
                <h4 className="font-bold text-lg">Slit Lamp Biomicroscope</h4>
                <p className="text-gray-600">High-intensity light source that allows detailed examination of the eye's structures.</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop"
                  alt="Laser Surgery Equipment"
                  className="w-full h-48 object-cover rounded-md mb-3"
                />
                <h4 className="font-bold text-lg">Laser Surgery Equipment</h4>
                <p className="text-gray-600">Advanced laser technology for precise and minimally invasive eye surgeries.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-[#FFB915] to-[#008787] rounded-lg shadow-lg p-8 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to schedule an appointment?
            </h3>
            <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
              Our expert team is ready to provide you with the best eye care services.
              Book your appointment today and take the first step towards better vision.
            </p>
            <button
              onClick={() => window.location.href = "/contact"}
              className="bg-white text-[#FFB915] font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors duration-300 shadow-md"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </main>

      {/* Image Gallery Modal */}
      {selectedCategory !== null && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={closeGallery}>
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">{serviceCategories[selectedCategory].title} Equipment</h3>
              <button onClick={closeGallery} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {serviceCategories[selectedCategory].images.map((image, imgIndex) => (
                  <div key={imgIndex} className="bg-gray-100 p-2 rounded-lg">
                    <img
                      src={image}
                      alt={`${serviceCategories[selectedCategory].title} equipment ${imgIndex + 1}`}
                      className="w-full h-64 object-cover rounded-md mb-3"
                    />
                    <p className="text-gray-700 font-medium">
                      {serviceCategories[selectedCategory].title} Equipment {imgIndex + 1}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Advanced technology used in our {serviceCategories[selectedCategory].title.toLowerCase()} department.
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-lg text-blue-800 mb-2">Why Our Equipment Makes a Difference</h4>
                <p className="text-blue-700">
                  At Opeyemi Mega Eye Center, we invest in the latest medical technology to provide accurate diagnoses and effective treatments.
                  Our state-of-the-art equipment allows our specialists to detect eye conditions at the earliest stages and provide
                  precise treatments for better outcomes.
                </p>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={closeGallery}
                className="px-4 py-2 bg-[#FFB915] text-white rounded hover:bg-[#e0a413] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Services;