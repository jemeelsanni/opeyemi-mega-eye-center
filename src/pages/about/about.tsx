import React, { useState } from "react";
import Navbar from "../../layout/navbar";
import Footer from "../../layout/footer";
import Header from "../../layout/header";
import Doctors from "../home/doctors"; // Importing the existing Doctors component
import { motion } from "framer-motion";
import {
    FaQuoteLeft,
    FaUserTie,
    FaChevronDown,
    FaChevronUp,
    FaRegLightbulb,
    FaEye,
    FaHeart,
    FaHandHoldingMedical,
    FaUsers,
    FaQuestionCircle
} from "react-icons/fa";

// Mock data for board members
const boardMembers = [
    {
        id: 1,
        name: "Dr. Afolabi Oladejo",
        position: "Chairman",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2787&auto=format&fit=crop",
        bio: "Dr. Oladejo has over 25 years of experience in healthcare management and is dedicated to ensuring high standards of eye care."
    },
    {
        id: 2,
        name: "Mrs. Yewande Adeniyi",
        position: "Secretary",
        image: "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?q=80&w=2788&auto=format&fit=crop",
        bio: "Mrs. Adeniyi brings 18 years of administrative experience to the board and oversees effective governance of the eye center."
    },
    {
        id: 3,
        name: "Mr. Chinedu Okafor",
        position: "Treasurer",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2787&auto=format&fit=crop",
        bio: "With a background in finance, Mr. Okafor ensures prudent financial management and sustainable growth for the organization."
    },
    {
        id: 4,
        name: "Dr. Ngozi Ibe",
        position: "Board Member",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2961&auto=format&fit=crop",
        bio: "Dr. Ibe contributes valuable medical expertise to strategic decision-making and helps maintain high clinical standards."
    },
    {
        id: 5,
        name: "Mr. Tunde Bakare",
        position: "Board Member",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2787&auto=format&fit=crop",
        bio: "Mr. Bakare brings extensive experience in business development and helps guide the center's expansion strategies."
    },
];

// Mock data for staff members by department
const departmentStaff = [
    {
        department: "Clinical Staff",
        staff: [
            {
                id: 1,
                name: "Nurse Sarah Obi",
                position: "Head Nurse",
                image: "https://images.unsplash.com/photo-1543486958-d783bfbf7f8e?q=80&w=2025&auto=format&fit=crop",
            },
            {
                id: 2,
                name: "Nurse Emeka Joseph",
                position: "Clinical Nurse",
                image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop",
            },
            {
                id: 3,
                name: "Nurse Fatima Bello",
                position: "Clinical Nurse",
                image: "https://images.unsplash.com/photo-1516841273335-e39b37888115?q=80&w=2076&auto=format&fit=crop",
            },
        ]
    },
    {
        department: "Administrative Staff",
        staff: [
            {
                id: 1,
                name: "Mrs. Oluwaseun Adegoke",
                position: "Administrative Manager",
                image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2787&auto=format&fit=crop",
            },
            {
                id: 2,
                name: "Mr. David Nwachukwu",
                position: "Front Desk Officer",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2940&auto=format&fit=crop",
            },
        ]
    },
    {
        department: "Technical Staff",
        staff: [
            {
                id: 1,
                name: "Mr. Ola Adebayo",
                position: "Head Optician",
                image: "https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=2070&auto=format&fit=crop",
            },
            {
                id: 2,
                name: "Ms. Rebecca Udoh",
                position: "Laboratory Technician",
                image: "https://images.unsplash.com/photo-1557053910-d9eadeed1c58?q=80&w=2787&auto=format&fit=crop",
            },
        ]
    },
];

// FAQ data
const faqs = [
    {
        question: "What services does Opeyemi Mega Eye Center offer?",
        answer: "We offer comprehensive eye care services including general ophthalmology, glaucoma treatment, cataract surgery, refractive error correction, pediatric eye care, and specialized diagnostic services. Our center is equipped with state-of-the-art technology for accurate diagnosis and effective treatment of various eye conditions."
    },
    {
        question: "How do I schedule an appointment?",
        answer: "You can schedule an appointment by calling our front desk, using our online appointment booking system on our website, or visiting our facility in person. We recommend scheduling appointments in advance, though we do accommodate emergency cases."
    },
    {
        question: "What should I bring to my first appointment?",
        answer: "Please bring your identification, insurance information (if applicable), a list of medications you are currently taking, your medical history details, and any previous eye examination records or prescriptions. If you wear glasses or contact lenses, please bring them along."
    },
    {
        question: "Does your center perform eye surgeries?",
        answer: "Yes, our center performs various eye surgeries including cataract surgery, glaucoma surgery, and other procedures. All surgeries are performed by our experienced ophthalmologists in our standard operating theatre equipped with modern surgical technology."
    },
    {
        question: "Do you offer emergency eye care services?",
        answer: "Yes, we provide emergency eye care services for conditions requiring immediate attention. If you experience sudden vision loss, severe eye pain, eye injury, or other urgent eye problems, please come to our center immediately or contact us for guidance."
    },
    {
        question: "How long does a routine eye examination take?",
        answer: "A comprehensive eye examination typically takes 30-60 minutes, depending on the tests required and your specific eye health needs. Some specialized tests may require additional time."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept cash, credit/debit cards, and bank transfers. We also work with various health insurance providers. Please contact our administrative staff for specific details regarding your insurance coverage."
    },
    {
        question: "How often should I have my eyes checked?",
        answer: "For adults with good eye health, we recommend a comprehensive eye examination every 1-2 years. Children, seniors, and individuals with existing eye conditions or risk factors may need more frequent check-ups. Your doctor will recommend a schedule based on your individual needs."
    },
];

const AboutUs: React.FC = () => {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState("all");
    const [hoveredMember, setHoveredMember] = useState<number | null>(null);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
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

    const fadeInUp = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6
            }
        }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const pulseAnimation = {
        scale: [1, 1.05, 1],
        transition: { duration: 2, repeat: Infinity }
    };

    const toggleFaq = (index: number) => {
        if (activeFaq === index) {
            setActiveFaq(null);
        } else {
            setActiveFaq(index);
        }
    };

    const filteredStaff = activeTab === "all"
        ? departmentStaff.flatMap(dept => dept.staff)
        : departmentStaff.find(dept => dept.department === activeTab)?.staff || [];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <Navbar />

            {/* Hero Banner */}
            <div
                className="relative bg-cover bg-center h-56 md:h-64 lg:h-80"
                style={{
                    backgroundImage:
                        "url(https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?q=80&w=2070&auto=format&fit=crop)",
                }}
            >
                <motion.div
                    className="absolute inset-0 bg-black/70 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    <div className="text-center px-4">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="text-4xl md:text-5xl font-bold text-[#FFB915] mb-4"
                        >
                            About Us
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.7 }}
                            className="text-white text-lg md:text-xl max-w-2xl mx-auto"
                        >
                            Excellence in eye care for over 15 years
                        </motion.p>
                    </div>
                </motion.div>
            </div>

            {/* Main Content */}
            <main className="flex-grow py-12 px-4 md:px-6 lg:px-8">
                <div className="container mx-auto">

                    {/* Mission & Vision Section */}
                    <section className="mb-20">
                        <motion.div
                            className="text-center mb-12"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeInUp}
                        >
                            <span className="inline-block px-4 py-1 bg-[#FFB915]/10 text-[#FFB915] rounded-full mb-4 font-medium">
                                Our Purpose
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                                Mission & Vision
                            </h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                The guiding principles that drive our commitment to excellence in eye care
                            </p>
                        </motion.div>

                        <motion.div
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                        >
                            {/* Mission */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                            >
                                <div className="flex items-center mb-6">
                                    <div className="bg-[#FFB915]/10 p-4 rounded-full mr-4">
                                        <FaEye className="text-[#FFB915] text-2xl" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">Our Mission</h3>
                                </div>
                                <p className="text-gray-600 flex-grow">
                                    To provide accessible, comprehensive, and high-quality eye care services to all patients,
                                    regardless of their background or circumstances. We are committed to employing the latest
                                    medical technologies and techniques to diagnose, treat, and prevent eye diseases,
                                    while fostering a compassionate and supportive environment for our patients and staff.
                                </p>
                            </motion.div>

                            {/* Vision */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                            >
                                <div className="flex items-center mb-6">
                                    <div className="bg-[#FFB915]/10 p-4 rounded-full mr-4">
                                        <FaRegLightbulb className="text-[#FFB915] text-2xl" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">Our Vision</h3>
                                </div>
                                <p className="text-gray-600 flex-grow">
                                    To be the leading eye care provider in West Africa, recognized for clinical excellence,
                                    innovation, and patient-centered care. We aspire to continually advance the field of
                                    ophthalmology through research, education, and community engagement, ultimately
                                    contributing to a world where preventable vision loss is eliminated and eye health is prioritized.
                                </p>
                            </motion.div>
                        </motion.div>
                    </section>

                    {/* Who We Are Section */}
                    <section className="mb-20">
                        <motion.div
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={containerVariants}
                        >
                            <motion.div
                                variants={itemVariants}
                                className="order-2 lg:order-1"
                            >
                                <span className="inline-block px-4 py-1 bg-[#FFB915]/10 text-[#FFB915] rounded-full mb-4 font-medium">
                                    Who We Are
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                                    A Legacy of Excellence in Eye Care
                                </h2>
                                <div className="space-y-4 text-gray-600">
                                    <p>
                                        Established in 2008, Opeyemi Mega Eye Center has grown to become a leading provider of comprehensive eye care services in Lagos and beyond. Our state-of-the-art facility is equipped with advanced diagnostic and treatment technology, allowing us to deliver exceptional care to all our patients.
                                    </p>
                                    <p>
                                        We take pride in our team of highly qualified ophthalmologists, optometrists, and support staff who are committed to maintaining the highest standards of patient care. Our approach combines medical expertise with compassion, ensuring that each patient receives personalized attention and effective treatment.
                                    </p>
                                </div>

                                <motion.blockquote
                                    className="mt-8 pl-6 border-l-4 border-[#FFB915] italic text-gray-700"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                    viewport={{ once: true }}
                                >
                                    <FaQuoteLeft className="text-[#FFB915] mb-2" />
                                    <p>
                                        "Our commitment goes beyond treatment – we strive to educate our patients about eye health and preventive care, empowering them to make informed decisions about their vision."
                                    </p>
                                    <footer className="mt-2 font-medium">- Dr. Opeyemi Adebayo, Medical Director</footer>
                                </motion.blockquote>
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                className="order-1 lg:order-2"
                            >
                                <motion.div
                                    className="relative"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <img
                                        src="https://images.unsplash.com/photo-1581093806997-124204d9fa9d?q=80&w=2670&auto=format&fit=crop"
                                        alt="Opeyemi Mega Eye Center staff"
                                        className="rounded-lg shadow-xl w-full h-auto"
                                    />
                                    <motion.div
                                        className="absolute -bottom-6 -right-6 bg-[#FFB915] rounded-lg py-4 px-6 shadow-lg hidden md:block"
                                        animate={pulseAnimation}
                                    >
                                        <p className="text-white font-bold text-xl">15+ Years</p>
                                        <p className="text-white/90">of Excellence</p>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </section>

                    {/* Core Values Section */}
                    <section className="mb-20 bg-gradient-to-r from-[#2C4A6B] to-[#1A365D] py-16 px-4 rounded-2xl">
                        <motion.div
                            className="text-center mb-12"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeInUp}
                        >
                            <span className="inline-block px-4 py-1 bg-white/10 text-white rounded-full mb-4 font-medium">
                                What Drives Us
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Our Core Values
                            </h2>
                            <p className="text-lg text-white/90 max-w-3xl mx-auto">
                                The principles that guide our actions, decisions, and interactions every day
                            </p>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
                        >
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -10 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <div className="bg-[#FFB915] p-3 rounded-full inline-block mb-4">
                                    <FaHeart className="text-white text-xl" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Compassion</h3>
                                <p className="text-white/80">
                                    We approach each patient with genuine care, understanding, and empathy, recognizing their unique needs and concerns.
                                </p>
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -10 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <div className="bg-[#FFB915] p-3 rounded-full inline-block mb-4">
                                    <FaHandHoldingMedical className="text-white text-xl" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Excellence</h3>
                                <p className="text-white/80">
                                    We are committed to delivering the highest standard of care through continuous learning, innovation, and quality improvement.
                                </p>
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -10 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <div className="bg-[#FFB915] p-3 rounded-full inline-block mb-4">
                                    <FaUserTie className="text-white text-xl" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Integrity</h3>
                                <p className="text-white/80">
                                    We conduct ourselves with honesty, transparency, and ethical behavior in all our interactions and decisions.
                                </p>
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -10 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <div className="bg-[#FFB915] p-3 rounded-full inline-block mb-4">
                                    <FaUsers className="text-white text-xl" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Teamwork</h3>
                                <p className="text-white/80">
                                    We collaborate across disciplines, valuing diverse perspectives and contributions to achieve optimal outcomes for our patients.
                                </p>
                            </motion.div>
                        </motion.div>
                    </section>

                    {/* Doctors Section - using the existing component */}
                    <section className="mb-20">
                        <Doctors />
                    </section>

                    {/* Board Members Section */}
                    <section className="mb-20">
                        <motion.div
                            className="text-center mb-12"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeInUp}
                        >
                            <span className="inline-block px-4 py-1 bg-[#FFB915]/10 text-[#FFB915] rounded-full mb-4 font-medium">
                                Leadership
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                                Our Board Members
                            </h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                Meet the visionary leaders guiding the strategic direction of Opeyemi Mega Eye Center
                            </p>
                        </motion.div>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {boardMembers.map((member, index) => (
                                <motion.div
                                    key={member.id}
                                    variants={itemVariants}
                                    whileHover={{ y: -10, transition: { duration: 0.3 } }}
                                    onHoverStart={() => setHoveredMember(index)}
                                    onHoverEnd={() => setHoveredMember(null)}
                                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                                >
                                    <div className="h-64 overflow-hidden">
                                        <motion.img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                            whileHover={{ scale: 1.1 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                                        <p className="text-[#FFB915] font-medium mb-3">{member.position}</p>
                                        <motion.p
                                            className="text-gray-600"
                                            initial={{ height: "auto" }}
                                            animate={{ height: hoveredMember === index ? "auto" : "3.6rem" }}
                                            transition={{ duration: 0.3 }}
                                            style={{ overflow: "hidden" }}
                                        >
                                            {member.bio}
                                        </motion.p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </section>

                    {/* Department Staff Gallery */}
                    <section className="mb-20">
                        <motion.div
                            className="text-center mb-12"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeInUp}
                        >
                            <span className="inline-block px-4 py-1 bg-[#FFB915]/10 text-[#FFB915] rounded-full mb-4 font-medium">
                                Our Team
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                                Department Staff Gallery
                            </h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                Meet the dedicated professionals who make our comprehensive eye care possible
                            </p>
                        </motion.div>

                        {/* Department tabs */}
                        <div className="flex flex-wrap justify-center gap-3 mb-10">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab("all")}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === "all"
                                    ? "bg-[#FFB915] text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                All Staff
                            </motion.button>
                            {departmentStaff.map((dept) => (
                                <motion.button
                                    key={dept.department}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveTab(dept.department)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === dept.department
                                        ? "bg-[#FFB915] text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                >
                                    {dept.department}
                                </motion.button>
                            ))}
                        </div>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                        >
                            {filteredStaff.map((staff) => (
                                <motion.div
                                    key={staff.id}
                                    variants={itemVariants}
                                    whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.3 } }}
                                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all"
                                >
                                    <div className="h-60 overflow-hidden">
                                        <motion.img
                                            src={staff.image}
                                            alt={staff.name}
                                            className="w-full h-full object-cover"
                                            whileHover={{ scale: 1.1 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                    <div className="p-4 text-center">
                                        <h3 className="text-lg font-bold text-gray-800">{staff.name}</h3>
                                        <p className="text-[#FFB915]">{staff.position}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </section>

                    {/* FAQs Section */}
                    <section className="mb-20">
                        <motion.div
                            className="text-center mb-12"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeInUp}
                        >
                            <span className="inline-block px-4 py-1 bg-[#FFB915]/10 text-[#FFB915] rounded-full mb-4 font-medium">
                                Common Questions
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                Find answers to questions commonly asked by our patients
                            </p>
                        </motion.div>

                        <motion.div
                            className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6"
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                        >
                            {faqs.map((faq, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    viewport={{ once: true }}
                                    className="mb-4 border-b border-gray-200 pb-4 last:border-b-0"
                                >
                                    <motion.button
                                        onClick={() => toggleFaq(index)}
                                        className="flex justify-between items-center w-full text-left font-medium text-gray-800 hover:text-[#FFB915] transition-colors py-3"
                                        whileHover={{ x: 5 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                        <div className="flex items-center">
                                            <FaQuestionCircle className="text-[#FFB915] mr-3 flex-shrink-0" />
                                            <span>{faq.question}</span>
                                        </div>
                                        {activeFaq === index ? (
                                            <FaChevronUp className="text-[#FFB915] flex-shrink-0 ml-2" />
                                        ) : (
                                            <FaChevronDown className="text-gray-400 flex-shrink-0 ml-2" />
                                        )}
                                    </motion.button>
                                    {activeFaq === index && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="text-gray-600 py-3 pl-10"
                                        >
                                            <p>{faq.answer}</p>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    </section>

                    {/* CTA Section */}
                    <motion.section
                        className="bg-gradient-to-r from-[#FFB915] to-[#008787] rounded-xl shadow-lg p-8 text-center mb-10"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        <motion.h3
                            className="text-2xl md:text-3xl font-bold text-white mb-4"
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            viewport={{ once: true }}
                        >
                            Ready to experience exceptional eye care?
                        </motion.h3>
                        <motion.p
                            className="text-white/90 text-lg mb-6 max-w-2xl mx-auto"
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            viewport={{ once: true }}
                        >
                            Our team of expert eye care professionals is ready to provide you with personalized care.
                            Schedule your appointment today and take the first step towards better vision health.
                        </motion.p>
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            viewport={{ once: true }}
                            onClick={() => window.location.href = "/contact"}
                            className="bg-white text-[#FFB915] font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors duration-300 shadow-md"
                        >
                            Book Appointment
                        </motion.button>
                    </motion.section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AboutUs;