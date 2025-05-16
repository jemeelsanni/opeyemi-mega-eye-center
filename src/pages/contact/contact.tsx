import React, { useState } from "react";
import Navbar from "../../layout/navbar";
import Footer from "../../layout/footer";
import Header from "../../layout/header";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaWhatsapp, FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
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

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="text-[#FFA500] text-2xl" />,
      title: "Visit Us",
      details: "4B, Saboline Isale, Amilegbe Rd, opposite Temitope Hospital, Ilorin.",
    },
    {
      icon: <FaPhone className="text-[#FFA500] text-2xl" />,
      title: "Call Us",
      details: "+234-81-641-6676",
      link: "tel:+2348164166676",
    },
    {
      icon: <FaEnvelope className="text-[#FFA500] text-2xl" />,
      title: "Email Us",
      details: "contact@opeyemieyecenter.com",
      link: "mailto:contact@opeyemieyecenter.com",
    },
  ];

  const socialLinks = [
    { icon: <FaWhatsapp size={20} />, url: "https://wa.me/2348164166676", color: "bg-green-500" },
    { icon: <FaFacebook size={20} />, url: "https://facebook.com/OpeyemiEyeCenter", color: "bg-blue-600" },
    { icon: <FaInstagram size={20} />, url: "https://instagram.com/opeyemi_eye_center", color: "bg-pink-600" },
    { icon: <FaTwitter size={20} />, url: "https://twitter.com/OpeyemiEye", color: "bg-sky-500" },
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

  // Replace the handleSubmit function in your Contact component
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Navbar />

      {/* Hero Banner */}
      <div
        className="relative bg-cover bg-center h-56 md:h-64 lg:h-72"
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
              Contact Us
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-white text-lg md:text-xl max-w-2xl mx-auto"
            >
              We're here to help with all your eye care needs
            </motion.p>
          </div>
        </div>
      </div>

      <main className="flex-grow py-12 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto">
          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-center mb-4">{info.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{info.title}</h3>
                {info.link ? (
                  <a
                    href={info.link}
                    className="text-gray-600 hover:text-[#FFA500] transition-colors"
                  >
                    {info.details}
                  </a>
                ) : (
                  <p className="text-gray-600">{info.details}</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Main Contact Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="md:flex">
              {/* Map or Image Section */}
              <div className="md:w-1/2 bg-[#FFA500]/10 p-6 md:p-10 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Get in touch</h2>
                <p className="text-gray-600 mb-6">
                  Have questions about our services? Need to schedule an appointment?
                  Our team is ready to assist you. Feel free to reach out using the contact form.
                </p>

                <div className="mb-6">
                  <div className="flex items-center">
                    <div className="flex space-x-3">
                      {socialLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${link.color} text-white h-10 w-10 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity`}
                          aria-label={`Visit our social media`}
                        >
                          {link.icon}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Business Hours</h3>
                  <ul className="text-gray-600 space-y-1">
                    <li className="flex justify-between">
                      <span>Monday - Saturday:</span>
                      <span>8:00 AM - 6:00 PM</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Sunday:</span>
                      <span>Surgeries & Emergencies Only</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Contact Form */}
              <div className="md:w-1/2 p-6 md:p-10">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Send us a message</h2>

                {feedback.message && (
                  <div className={`p-4 mb-6 rounded-md ${feedback.type === 'success'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                    {feedback.message}
                  </div>
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
                    <input
                      type="text"
                      id="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-lg ${errors.fullName
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-[#FFA500]"
                        } focus:outline-none focus:ring-2 focus:ring-[#FFA500] transition-colors`}
                      placeholder="John Doe"
                    />
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
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-lg ${errors.email
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-[#FFA500]"
                        } focus:outline-none focus:ring-2 focus:ring-[#FFA500] transition-colors`}
                      placeholder="your.email@example.com"
                    />
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
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-lg ${errors.phoneNumber
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-[#FFA500]"
                        } focus:outline-none focus:ring-2 focus:ring-[#FFA500] transition-colors`}
                      placeholder="+234 81 641 6676"
                    />
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
                        : "border-gray-300 focus:border-[#FFA500]"
                        } focus:outline-none focus:ring-2 focus:ring-[#FFA500] transition-colors`}
                      placeholder="Please write your message here..."
                    ></textarea>
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-6 rounded-lg text-white text-lg font-medium ${isSubmitting
                      ? "bg-[#FFC266] cursor-not-allowed"
                      : "bg-[#FFA500] hover:bg-[#FF9000] hover:shadow-md"
                      } transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:ring-offset-2`}
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
                      "Submit Enquiry"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;