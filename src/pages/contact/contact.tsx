import React, { useState } from "react";
import Navbar from "../../layout/navbar";
import Footer from "../../layout/footer";
import Header from "../../layout/header";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaClock,
  FaPaperPlane,
  FaUserAlt
} from "react-icons/fa";
import { motion } from "framer-motion";
import apiClient from "../../api/apiClient";

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  message: string;
  [key: string]: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  message?: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    fullName: "",
    phoneNumber: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error" | "";
  }>({ message: "", type: "" });

  // Google Maps URL for the address
  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=Opeyemi+Mega+Eye+Center,+4B+Saboline+Isale+Amilegbe+Rd+opposite+Temitope+Hospital+Ilorin+Nigeria";

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="text-[#FFB915] text-3xl" />,
      title: "Visit Us",
      details: "4B, Saboline Isale, Amilegbe Rd, opposite Temitope Hospital, Ilorin.",
      link: googleMapsUrl,
    },
    {
      icon: <FaPhone className="text-[#FFB915] text-3xl" />,
      title: "Call Us",
      details: "+234-814-641-6676",
      link: "tel:+23481464166676",
    },
    {
      icon: <FaEnvelope className="text-[#FFB915] text-3xl" />,
      title: "Email Us",
      details: "omec.reach@gmail.com",
      link: "mailto:omec.reach@gmail.com",
    },
  ];

  const socialLinks = [
    { icon: <FaWhatsapp size={22} />, url: "https://wa.me/23481464166676", color: "bg-green-500", name: "WhatsApp" },
    { icon: <FaFacebook size={22} />, url: "https://facebook.com/OpeyemiEyeCenter", color: "bg-blue-600", name: "Facebook" },
    { icon: <FaInstagram size={22} />, url: "https://instagram.com/opeyemi_eye_center", color: "bg-pink-600", name: "Instagram" },
    { icon: <FaTwitter size={22} />, url: "https://twitter.com/OpeyemiEye", color: "bg-sky-500", name: "Twitter" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;

    // Clear error when field is edited
    if (errors[id as keyof FormErrors]) {
      setErrors({
        ...errors,
        [id]: undefined,
      });
    }

    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Validate phone number
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!/^[+\d\s()-]{7,20}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
      isValid = false;
    }

    // Validate message
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message should be at least 10 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setFeedback({ message: "", type: "" });

    try {
      await apiClient.post('/contact', {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        message: formData.message,
      });

      setFeedback({
        message: "Your message has been sent successfully! We'll get back to you soon.",
        type: "success"
      });

      // Reset form
      setFormData({
        email: "",
        fullName: "",
        phoneNumber: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setFeedback({
        message: "Failed to send message. Please try again.",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Navbar />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#2C4A6B] to-[#FFB915] py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-4xl md:text-6xl font-bold mb-4"
            >
              Contact Us
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-xl md:text-2xl opacity-90"
            >
              We're here to help with all your eye care needs.
            </motion.p>
          </div>
        </div>
      </section>

      <main className="flex-grow py-12 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto">
          {/* Contact Info Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-all duration-300 flex flex-col items-center"
              >
                <div className="flex justify-center mb-4 bg-[#FFB915]/10 p-4 rounded-full">
                  {info.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{info.title}</h3>
                {info.link ? (
                  <a
                    href={info.link}
                    target={info.link.startsWith("http") ? "_blank" : undefined}
                    rel={info.link.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-gray-600 hover:text-[#FFB915] transition-colors mt-1 text-center"
                  >
                    {info.details}
                  </a>
                ) : (
                  <p className="text-gray-600">{info.details}</p>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Main Contact Section */}
          <motion.div
            className="bg-white rounded-lg shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="md:flex">
              {/* Info Section */}
              <div className="md:w-2/5 bg-gradient-to-br from-[#2C4A6B] to-[#1A365D] p-8 md:p-10 flex flex-col justify-between text-white">
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-[#FFB915]">Get in touch</h2>
                  <p className="text-white/90 mb-8">
                    Have questions about our services? Need to schedule an appointment?
                    Our team is ready to assist you. Feel free to reach out using the contact form or any of the methods below.
                  </p>

                  <div className="space-y-6 mb-10">
                    {contactInfo.map((info, index) => (
                      <div key={index} className="flex items-start">
                        <div className="bg-white/10 p-3 rounded-full mr-4">
                          {React.cloneElement(info.icon as React.ReactElement, { className: "text-[#FFB915] text-xl" })}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{info.title}</h4>
                          {info.link ? (
                            <a
                              href={info.link}
                              target={info.link.startsWith("http") ? "_blank" : undefined}
                              rel={info.link.startsWith("http") ? "noopener noreferrer" : undefined}
                              className="text-white/80 hover:text-[#FFB915] transition-colors"
                            >
                              {info.details}
                            </a>
                          ) : (
                            <p className="text-white/80">{info.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4 text-white">Connect With Us</h3>
                  <div className="flex space-x-4">
                    {socialLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/10 hover:bg-white/20 text-white h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300"
                        aria-label={`Visit our ${link.name}`}
                        title={link.name}
                      >
                        {link.icon}
                      </a>
                    ))}
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-6">
                    <div className="flex items-start">
                      <FaClock className="text-[#FFB915] mt-1 mr-3" />
                      <div>
                        <h4 className="font-medium text-white">Business Hours</h4>
                        <p className="text-white/80">Monday - Saturday: 8:00 AM - 6:00 PM</p>
                        <p className="text-white/80">Sunday: Surgeries & Emergencies Only</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="md:w-3/5 p-8 md:p-10">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Send us a message</h2>

                {feedback.message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 mb-6 rounded-md ${feedback.type === 'success'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                  >
                    {feedback.message}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name Field */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUserAlt className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`w-full pl-10 p-3 border rounded-lg ${errors.fullName
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 focus:border-[#FFB915]"
                          } focus:outline-none focus:ring-2 focus:ring-[#FFB915] transition-colors`}
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 p-3 border rounded-lg ${errors.email
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 focus:border-[#FFB915]"
                          } focus:outline-none focus:ring-2 focus:ring-[#FFB915] transition-colors`}
                        placeholder="your.email@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone Number Field */}
                  <div>
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhone className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className={`w-full pl-10 p-3 border rounded-lg ${errors.phoneNumber
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 focus:border-[#FFB915]"
                          } focus:outline-none focus:ring-2 focus:ring-[#FFB915] transition-colors`}
                        placeholder="+234 81 641 6676"
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      How can we help you? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className={`w-full p-3 border rounded-lg ${errors.message
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-[#FFB915]"
                        } focus:outline-none focus:ring-2 focus:ring-[#FFB915] transition-colors`}
                      placeholder="Please write your message here..."
                    ></textarea>
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                    className={`w-full py-3 px-6 rounded-lg text-white text-lg font-medium flex items-center justify-center ${isSubmitting
                      ? "bg-[#FFC266] cursor-not-allowed"
                      : "bg-[#FFB915] hover:bg-[#2C4A6B] hover:shadow-md"
                      } transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FFB915] focus:ring-offset-2`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="mr-2" /> Submit Enquiry
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Google Maps Embed */}
          <motion.div
            className="mt-12 bg-white rounded-lg shadow-lg p-6 overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Find Us on the Map</h2>
            <div className="h-96 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3946.043775901437!2d4.560795775871491!3d8.495124791546488!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x10364d7de1955555%3A0x7efb879f69db7833!2sOPEYEMI%20MEGA%20EYE%20CENTER!5e0!3m2!1sen!2sng!4v1747810971754!5m2!1sen!2sng"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Opeyemi Mega Eye Center Location"
                className="rounded-lg"
              ></iframe>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;