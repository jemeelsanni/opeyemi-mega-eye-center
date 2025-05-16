import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaCalendarAlt,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUserMd,
  FaHospital,
  FaIdCard,
  FaHistory
} from "react-icons/fa";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import apiClient from "../../api/apiClient";

interface AppointmentProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  isHmoRegistered: string;
  hmoName?: string;
  hmoNumber?: string;
  hasPreviousVisit: string;
  medicalRecordNumber?: string;
  briefHistory: string;
  appointmentDate: string;
  preferredPhysician: string;
}

interface FormErrors {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  isHmoRegistered?: string;
  hmoName?: string;
  hmoNumber?: string;
  hasPreviousVisit?: string;
  medicalRecordNumber?: string;
  appointmentDate?: string;
}

const Appointment: React.FC<AppointmentProps> = ({ open, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phoneNumber: "",
    email: "",
    isHmoRegistered: "no",
    hasPreviousVisit: "no",
    briefHistory: "",
    appointmentDate: "",
    preferredPhysician: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set min date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Doctors list
  const doctors = [
    { value: "", label: "If any doctor would be fine, kindly leave blank." },
    { value: "Dr. Taoheed", label: "Dr. Taoheed" },
    { value: "Dr. Abdulkadr", label: "Dr. Abdulkadr" },
    { value: "Dr. Franklin", label: "Dr. Franklin" },
  ];

  // Close modal with ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      window.addEventListener("keydown", handleEsc);
      // Prevent background scrolling
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [open, onClose]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    }

    // Validate phone number
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (formData.phoneNumber.length < 10) {
      newErrors.phoneNumber = "Please enter a valid phone number";
      isValid = false;
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    // Validate HMO fields if registered
    if (formData.isHmoRegistered === "yes") {
      if (!formData.hmoName?.trim()) {
        newErrors.hmoName = "HMO name is required";
        isValid = false;
      }

      if (!formData.hmoNumber?.trim()) {
        newErrors.hmoNumber = "HMO number is required";
        isValid = false;
      }
    }

    // Validate medical record number if previous visit
    if (formData.hasPreviousVisit === "yes") {
      if (!formData.medicalRecordNumber?.trim()) {
        newErrors.medicalRecordNumber = "Medical record number is required";
        isValid = false;
      }
    }

    // Validate appointment date
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = "Appointment date is required";
      isValid = false;
    } else {
      const selectedDate = new Date(formData.appointmentDate);
      const dayOfWeek = selectedDate.getDay();

      if (dayOfWeek === 0) {
        newErrors.appointmentDate = "Appointments cannot be booked on Sundays";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Clear error when field is edited
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }

    // Check if Sunday is selected
    if (name === "appointmentDate") {
      const selectedDate = new Date(value);
      const dayOfWeek = selectedDate.getDay();

      if (dayOfWeek === 0) {
        setMessage({
          text: "Appointments cannot be booked on Sundays",
          type: "info"
        });
        return;
      } else {
        setMessage(null);
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  // Handle phone input change
  const handlePhoneChange = (value: string) => {
    if (errors.phoneNumber) {
      setErrors({
        ...errors,
        phoneNumber: undefined,
      });
    }
    setFormData({ ...formData, phoneNumber: value });
  };

  // Handle radio input change
  const handleRadioChange = (name: string, value: string) => {
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }

    // Reset conditional fields when changing radio options
    if (name === "isHmoRegistered" && value === "no") {
      setFormData({ ...formData, [name]: value, hmoName: "", hmoNumber: "" });
    } else if (name === "hasPreviousVisit" && value === "no") {
      setFormData({ ...formData, [name]: value, medicalRecordNumber: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Replace the handleSubmit function in your Appointment component
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      await apiClient.post('/appointments', {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        isHmoRegistered: formData.isHmoRegistered,
        hmoName: formData.hmoName || undefined,
        hmoNumber: formData.hmoNumber || undefined,
        hasPreviousVisit: formData.hasPreviousVisit,
        medicalRecordNumber: formData.medicalRecordNumber || undefined,
        briefHistory: formData.briefHistory || 'None provided',
        appointmentDate: formData.appointmentDate,
        preferredPhysician: formData.preferredPhysician || 'No preference',
      });

      setMessage({
        text: "Appointment request sent successfully!",
        type: "success"
      });

      // Reset form
      setFormData({
        fullName: "",
        phoneNumber: "",
        email: "",
        isHmoRegistered: "no",
        hasPreviousVisit: "no",
        briefHistory: "",
        appointmentDate: "",
        preferredPhysician: "",
      });

      // Close modal after delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting appointment:", error);
      setMessage({
        text: "Failed to send appointment request. Please try again.",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-lg p-6 shadow-xl w-full max-w-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Book Appointment</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFA500]"
                aria-label="Close"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div
                className={`p-3 mb-4 rounded-md ${message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : message.type === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                  }`}
                role="alert"
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <div className="flex items-center">
                    <FaUser className="mr-2 text-[#FFA500]" />
                    Full Name <span className="text-red-500">*</span>
                  </div>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${errors.fullName
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 focus:border-[#FFA500]"
                    } focus:outline-none focus:ring-2 focus:ring-[#FFA500] transition-colors`}
                  placeholder="Enter your full name"
                  required
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <div className="flex items-center">
                    <FaPhone className="mr-2 text-[#FFA500]" />
                    Phone Number <span className="text-red-500">*</span>
                  </div>
                </label>
                <PhoneInput
                  country={'ng'}
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  inputProps={{
                    name: 'phoneNumber',
                    id: 'phoneNumber',
                    required: true,
                  }}
                  containerClass={`${errors.phoneNumber ? "phone-input-error" : ""
                    }`}
                  inputClass={`w-full p-3 rounded-lg !border ${errors.phoneNumber
                    ? "!border-red-500 bg-red-50"
                    : "!border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-[#FFA500] transition-colors`}
                  buttonClass={`${errors.phoneNumber ? "!border-red-500" : ""
                    }`}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <div className="flex items-center">
                    <FaEnvelope className="mr-2 text-[#FFA500]" />
                    Email Address <span className="text-red-500">*</span>
                  </div>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${errors.email
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 focus:border-[#FFA500]"
                    } focus:outline-none focus:ring-2 focus:ring-[#FFA500] transition-colors`}
                  placeholder="your.email@example.com"
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* HMO Registration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <FaHospital className="mr-2 text-[#FFA500]" />
                    Are you registered with an HMO? <span className="text-red-500">*</span>
                  </div>
                </label>
                <div className="flex space-x-6 mt-1">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="hmoYes"
                      name="isHmoRegistered"
                      value="yes"
                      checked={formData.isHmoRegistered === "yes"}
                      onChange={() => handleRadioChange("isHmoRegistered", "yes")}
                      className="h-4 w-4 text-[#FFA500] focus:ring-[#FFA500] border-gray-300"
                    />
                    <label htmlFor="hmoYes" className="ml-2 text-sm text-gray-700">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="hmoNo"
                      name="isHmoRegistered"
                      value="no"
                      checked={formData.isHmoRegistered === "no"}
                      onChange={() => handleRadioChange("isHmoRegistered", "no")}
                      className="h-4 w-4 text-[#FFA500] focus:ring-[#FFA500] border-gray-300"
                    />
                    <label htmlFor="hmoNo" className="ml-2 text-sm text-gray-700">
                      No
                    </label>
                  </div>
                </div>
                {errors.isHmoRegistered && (
                  <p className="mt-1 text-sm text-red-600">{errors.isHmoRegistered}</p>
                )}
              </div>

              {/* Conditional HMO Fields */}
              <AnimatePresence>
                {formData.isHmoRegistered === "yes" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* HMO Name */}
                    <div>
                      <label
                        htmlFor="hmoName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        HMO Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="hmoName"
                        name="hmoName"
                        value={formData.hmoName || ""}
                        onChange={handleChange}
                        className={`w-full p-3 rounded-lg border ${errors.hmoName
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 focus:border-[#FFA500]"
                          } focus:outline-none focus:ring-2 focus:ring-[#FFA500] transition-colors`}
                        placeholder="Enter your HMO name"
                        required
                      />
                      {errors.hmoName && (
                        <p className="mt-1 text-sm text-red-600">{errors.hmoName}</p>
                      )}
                    </div>

                    {/* HMO Number */}
                    <div>
                      <label
                        htmlFor="hmoNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        HMO Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="hmoNumber"
                        name="hmoNumber"
                        value={formData.hmoNumber || ""}
                        onChange={handleChange}
                        className={`w-full p-3 rounded-lg border ${errors.hmoNumber
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 focus:border-[#FFA500]"
                          } focus:outline-none focus:ring-2 focus:ring-[#FFA500] transition-colors`}
                        placeholder="Enter your HMO number"
                        required
                      />
                      {errors.hmoNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.hmoNumber}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Previous Visit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <FaIdCard className="mr-2 text-[#FFA500]" />
                    Have you visited our eye clinic before? <span className="text-red-500">*</span>
                  </div>
                </label>
                <div className="flex space-x-6 mt-1">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="visitYes"
                      name="hasPreviousVisit"
                      value="yes"
                      checked={formData.hasPreviousVisit === "yes"}
                      onChange={() => handleRadioChange("hasPreviousVisit", "yes")}
                      className="h-4 w-4 text-[#FFA500] focus:ring-[#FFA500] border-gray-300"
                    />
                    <label htmlFor="visitYes" className="ml-2 text-sm text-gray-700">
                      Yes, I have
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="visitNo"
                      name="hasPreviousVisit"
                      value="no"
                      checked={formData.hasPreviousVisit === "no"}
                      onChange={() => handleRadioChange("hasPreviousVisit", "no")}
                      className="h-4 w-4 text-[#FFA500] focus:ring-[#FFA500] border-gray-300"
                    />
                    <label htmlFor="visitNo" className="ml-2 text-sm text-gray-700">
                      No, I haven't
                    </label>
                  </div>
                </div>
                {errors.hasPreviousVisit && (
                  <p className="mt-1 text-sm text-red-600">{errors.hasPreviousVisit}</p>
                )}
              </div>

              {/* Conditional Medical Record Number */}
              <AnimatePresence>
                {formData.hasPreviousVisit === "yes" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div>
                      <label
                        htmlFor="medicalRecordNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Medical Record Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="medicalRecordNumber"
                        name="medicalRecordNumber"
                        value={formData.medicalRecordNumber || ""}
                        onChange={handleChange}
                        className={`w-full p-3 rounded-lg border ${errors.medicalRecordNumber
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 focus:border-[#FFA500]"
                          } focus:outline-none focus:ring-2 focus:ring-[#FFA500] transition-colors`}
                        placeholder="Enter your medical record number"
                        required
                      />
                      {errors.medicalRecordNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.medicalRecordNumber}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Brief History */}
              <div>
                <label
                  htmlFor="briefHistory"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <div className="flex items-center">
                    <FaHistory className="mr-2 text-[#FFA500]" />
                    Brief History of the Eye
                  </div>
                </label>
                <textarea
                  id="briefHistory"
                  name="briefHistory"
                  value={formData.briefHistory}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-[#FFA500] transition-colors"
                  placeholder="Please describe any eye issues or symptoms (optional)"
                  rows={3}
                />
              </div>

              {/* Appointment Date */}
              <div>
                <label
                  htmlFor="appointmentDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-[#FFA500]" />
                    Preferred Appointment Date <span className="text-red-500">*</span>
                  </div>
                </label>
                <input
                  type="date"
                  id="appointmentDate"
                  name="appointmentDate"
                  min={minDate}
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg border ${errors.appointmentDate
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 focus:border-[#FFA500]"
                    } focus:outline-none focus:ring-2 focus:ring-[#FFA500] transition-colors`}
                  required
                />
                {errors.appointmentDate ? (
                  <p className="mt-1 text-sm text-red-600">{errors.appointmentDate}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Note: We are closed on Sundays except for emergencies.
                  </p>
                )}
              </div>

              {/* Preferred Physician */}
              <div>
                <label
                  htmlFor="preferredPhysician"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <div className="flex items-center">
                    <FaUserMd className="mr-2 text-[#FFA500]" />
                    Preferred Physician
                  </div>
                </label>
                <select
                  id="preferredPhysician"
                  name="preferredPhysician"
                  value={formData.preferredPhysician}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-[#FFA500] transition-colors"
                >
                  {doctors.map((doctor) => (
                    <option key={doctor.value} value={doctor.value}>
                      {doctor.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-2 py-4 px-4 rounded-lg text-white text-lg font-medium 
                  ${isSubmitting
                    ? "bg-[#FFC266] cursor-not-allowed"
                    : "bg-[#FFA500] hover:bg-[#FF9000] hover:shadow-lg"
                  } transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFA500]`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  "Book Appointment"
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Appointment;