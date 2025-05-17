import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaWhatsapp, FaInstagram, FaTwitter, FaFacebook, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaHeart, FaPaperPlane } from "react-icons/fa";
import apiClient from "../api/apiClient";
import { motion } from "framer-motion";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "";
  }>({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const socialLinks = [
    { icon: <FaWhatsapp />, url: "https://wa.me/23481464166676", label: "WhatsApp" },
    { icon: <FaInstagram />, url: "https://instagram.com/opeyemi_eye_center", label: "Instagram" },
    { icon: <FaTwitter />, url: "https://twitter.com/OpeyemiEye", label: "Twitter" },
    { icon: <FaFacebook />, url: "https://facebook.com/OpeyemiEyeCenter", label: "Facebook" },
  ];

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" },
    { name: "Book Appointment", path: "/contact" },
  ];

  const serviceLinks = [
    { name: "Eye Examination", path: "/services" },
    { name: "Glaucoma Treatment", path: "/services" },
    { name: "Cataract Surgery", path: "/services" },
    { name: "Optical Services", path: "/services" },
    { name: "Pediatric Eye Care", path: "/services" },
  ];



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage({ text: "Please enter an email address", type: "error" });
      return;
    }

    if (!validateEmail(email)) {
      setMessage({ text: "Please enter a valid email address", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.post('/newsletter', { email });

      setMessage({
        text: "Thank you for subscribing to our newsletter!",
        type: "success"
      });
      setEmail("");
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      setMessage({
        text: "There was an error sending your request. Please try again.",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);

      // Clear success message after delay
      if (message.type === "success") {
        setTimeout(() => {
          setMessage({ text: "", type: "" });
        }, 5000);
      }
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="pt-12 pb-6">
        <div className="container mx-auto px-4 md:px-6">
          {/* Footer content grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl font-bold mb-4 text-[#FFA500]">Opeyemi Mega Eye Center</h3>
              <p className="text-gray-300 mb-4">
                A world-class health facility dedicated to providing comprehensive eye care services with cutting-edge equipment and expert professionals.
              </p>
              <div className="flex space-x-3 mt-6">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="bg-gray-800 hover:bg-[#FFA500] h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-300"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Quick links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-xl font-bold mb-4 text-[#FFA500]">Quick Links</h3>
              <ul className="space-y-2">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center"
                    >
                      <span className="mr-2">›</span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold mb-4 text-[#FFA500]">Our Services</h3>
              <ul className="space-y-2">
                {serviceLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center"
                    >
                      <span className="mr-2">›</span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-xl font-bold mb-4 text-[#FFA500]">Contact Information</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <FaMapMarkerAlt className="text-[#FFA500] mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">
                    4B, Saboline Isale, Amilegbe Rd, opposite Temitope Hospital, Ilorin
                  </span>
                </li>
                <li className="flex items-center">
                  <FaPhone className="text-[#FFA500] mr-3 flex-shrink-0" />
                  <a
                    href="tel:+2348164166676"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    +234-814-641-6676
                  </a>
                </li>
                <li className="flex items-center">
                  <FaEnvelope className="text-[#FFA500] mr-3 flex-shrink-0" />
                  <a
                    href="mailto:contact@opeyemieyecenter.com"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    omec.reach@gmail.com
                  </a>
                </li>
                <li className="flex items-center">
                  <FaClock className="text-[#FFA500] mr-3 flex-shrink-0" />
                  <span className="text-gray-300">
                    Mon-Sat: 8am - 6pm<br />
                    Sundays: Surgery & Emergencies
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Newsletter Subscription (Optional) */}
          <div className="border-t border-gray-800 pt-8 pb-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
                <p className="text-gray-400">Subscribe to our newsletter for eye care tips and exclusive updates</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (message.type === "error") {
                      setMessage({ text: "", type: "" });
                    }
                  }}
                  placeholder="Your email address"
                  className="flex-grow px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center py-3 px-6 rounded-lg text-white font-medium ${isSubmitting
                    ? "bg-[#FFC266] cursor-not-allowed"
                    : "bg-[#FFA500] hover:bg-[#FF9000]"
                    } transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:ring-offset-2`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" />
                      Subscribe
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 my-6"></div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>© {currentYear} Opeyemi Mega Eye Center. All Rights Reserved.</p>
            <p className="mt-2 md:mt-0 flex items-center">
              Powered by{" "}
              <a
                href="https://bluesprinttechnology.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FFA500] hover:text-white transition-colors mx-1"
              >
                Techscribe Innovations
              </a>
              <FaHeart className="ml-1 text-red-500" />
            </p>
          </div>
        </div>
      </div>

      {/* Back to Top Button (Optional) */}
      <div className="fixed bottom-6 right-6 z-10">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-[#FFA500] hover:bg-[#FF9000] h-10 w-10 rounded-full flex items-center justify-center shadow-lg transition-colors"
          aria-label="Back to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      </div>
    </footer>
  );
};

export default Footer;