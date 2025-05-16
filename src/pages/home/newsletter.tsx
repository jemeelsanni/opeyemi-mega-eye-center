import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaPaperPlane } from "react-icons/fa";
import apiClient from "../../api/apiClient";
import axios from "axios";

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "";
  }>({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // Replace the handleSubmit function in your Newsletter component
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
      console.error("Error subscribing to newsletter:", error);

      // Check if it's the "already subscribed" error
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400 &&
          error.response.data.message === 'This email is already subscribed') {
          // Handle as an informational message rather than an error
          setMessage({
            text: "This email is already subscribed to our newsletter.",
            type: "success" // or use a different type like "info" if your UI supports it
          });
        } else {
          // Other API errors
          setMessage({
            text: error.response.data.message || "Failed to subscribe. Please try again.",
            type: "error"
          });
        }
      } else {
        // Network or other errors
        setMessage({
          text: "There was an error sending your request. Please try again.",
          type: "error"
        });
      }
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
    <section className="py-12 bg-[#FFA500]/5">
      <div className="container mx-auto px-4">
        {/* Desktop Newsletter Section */}
        <div className="hidden md:block">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="md:flex items-center">
              <div className="md:w-1/2 p-8 md:p-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                  Join our Newsletter
                </h2>
                <p className="text-gray-600 mb-6">
                  Subscribe to get the latest eye care tips, news, and exclusive offers
                  delivered directly to your inbox.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-transparent"
                      required
                    />
                  </div>

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

                {message.text && (
                  <div className={`mt-4 p-3 rounded-md ${message.type === "success"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                    }`}>
                    {message.text}
                  </div>
                )}
              </div>

              <div className="md:w-1/2 bg-[#FFA500]/10 p-10 hidden md:flex items-center justify-center">
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <FaEnvelope className="text-[#FFA500] text-6xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Stay Informed
                  </h3>
                  <p className="text-gray-600">
                    Get regular updates on eye health, services, and special promotions.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile Newsletter Section */}
        <div className="md:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="text-center mb-6">
              <FaEnvelope className="text-[#FFA500] text-4xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Join our Newsletter
              </h2>
              <p className="text-gray-600">
                Subscribe for eye care tips and exclusive offers.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-transparent"
                  required
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium ${isSubmitting
                    ? "bg-[#FFC266] cursor-not-allowed"
                    : "bg-[#FFA500] hover:bg-[#FF9000]"
                    } transition-colors duration-300`}
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </button>
              </div>

              {message.text && (
                <div className={`mt-4 p-3 rounded-md text-sm ${message.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
                  }`}>
                  {message.text}
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;