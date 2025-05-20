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
    FaHistory,
    FaSpinner,
    FaCheckCircle
} from "react-icons/fa";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import apiClient from "../../api/apiClient";

interface AppointmentProps {
    open: boolean;
    onClose: () => void;
}

interface Doctor {
    _id: string;  // Changed from id to _id to match MongoDB
    name: string;
    speciality: string;
    image?: string;
}

interface TimeSlot {
    time: string;
    isAvailable: boolean;  // Changed from available to isAvailable to match backend
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
    appointmentTime: string;
    doctorId: string;  // This should be MongoDB _id now
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
    appointmentTime?: string;
    doctorId?: string;
}

// Modal steps
enum BookingStep {
    DoctorSelection = 1,
    DateSelection = 2,
    TimeSelection = 3,
    PatientInfo = 4,
    Confirmation = 5
}

const AppointmentModal: React.FC<AppointmentProps> = ({ open, onClose }) => {
    // Current step in the booking process
    const [currentStep, setCurrentStep] = useState<BookingStep>(BookingStep.DoctorSelection);
    const [doctors, setDoctors] = useState<Doctor[]>([]);


    // Form data
    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        phoneNumber: "",
        email: "",
        isHmoRegistered: "no",
        hasPreviousVisit: "no",
        briefHistory: "",
        appointmentDate: "",
        appointmentTime: "",
        doctorId: "",
    });

    // Form validation errors
    const [errors, setErrors] = useState<FormErrors>({});
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sample doctors data (replace with API call)
    useEffect(() => {
        if (open) {
            const fetchDoctors = async () => {
                try {
                    // Use the public doctor endpoint
                    const response = await apiClient.get('/doctors/public');
                    setDoctors(response.data.data.map((doctor: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                        _id: doctor._id,
                        name: doctor.name,
                        speciality: doctor.speciality,
                        image: doctor.image || ''
                    })));
                } catch (error) {
                    console.error('Error fetching doctors:', error);
                    setMessage({
                        text: "Failed to load doctors. Please try again later.",
                        type: "error"
                    });
                }
            };

            fetchDoctors();
        }
    }, [open]);

    // State for selected doctor
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    // State for available dates
    const [availableDates, setAvailableDates] = useState<Date[]>([]);

    // State for available time slots
    const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);

    // Set min date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    // Format date for display
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Generate available dates for selected doctor
    useEffect(() => {
        if (selectedDoctor && currentStep === BookingStep.DateSelection) {
            const fetchAvailableDates = async () => {
                try {
                    const response = await apiClient.get(`/doctors/${selectedDoctor?._id}/availability`);

                    // The response contains date objects with a date property
                    const availabilityDates = response.data.data;
                    setAvailableDates(availabilityDates.map((item: { date: string }) => new Date(item.date)));
                } catch (error) {
                    console.error('Error fetching available dates:', error);
                    // Fallback to generating dates
                    setAvailableDates(generateDates());
                }
            };

            const generateDates = (): Date[] => {
                const dates: Date[] = [];
                const startDate = new Date();
                startDate.setDate(startDate.getDate() + 1); // Start from tomorrow

                // Generate dates for the next 30 days
                for (let i = 0; i < 30; i++) {
                    const date = new Date(startDate);
                    date.setDate(startDate.getDate() + i);

                    // Skip Sundays (0 is Sunday in getDay())
                    if (date.getDay() !== 0) {
                        dates.push(date);
                    }
                }

                return dates;
            };

            fetchAvailableDates();
        }
    }, [selectedDoctor, currentStep]);


    // Generate available time slots for selected date
    useEffect(() => {
        if (formData.appointmentDate && selectedDoctor && currentStep === BookingStep.TimeSelection) {
            // In the useEffect for available time slots
            const fetchTimeSlots = async () => {
                try {
                    const response = await apiClient.get(
                        `/doctors/${selectedDoctor?._id}/availability/${formData.appointmentDate}`
                    );

                    // Map the slots to match the TimeSlot interface
                    const slots = response.data.data.slots.map((slot: { time: string; isAvailable: boolean }) => ({
                        time: slot.time,
                        isAvailable: slot.isAvailable
                    }));

                    setAvailableTimeSlots(slots);
                } catch (error) {
                    console.error('Error fetching time slots:', error);
                    // Fallback to generating time slots
                    setAvailableTimeSlots(generateTimeSlots());
                }
            };

            // Generate time slots helper function for fallback
            const generateTimeSlots = (): TimeSlot[] => {
                const slots: TimeSlot[] = [];
                const startHour = 8; // 8 AM
                const endHour = 17; // 5 PM

                // Generate hourly slots
                for (let hour = startHour; hour <= endHour; hour++) {
                    // Morning slots
                    if (hour < 12) {
                        slots.push({
                            time: `${hour}:00 AM`,
                            isAvailable: Math.random() > 0.3 // Randomly make some slots unavailable
                        });

                        if (hour !== 12) { // Skip 12:30 PM
                            slots.push({
                                time: `${hour}:30 AM`,
                                isAvailable: Math.random() > 0.3
                            });
                        }
                    }
                    // Afternoon slots
                    else {
                        const pmHour = hour === 12 ? 12 : hour - 12;
                        slots.push({
                            time: `${pmHour}:00 PM`,
                            isAvailable: Math.random() > 0.3
                        });

                        if (hour !== 17) { // Skip 5:30 PM
                            slots.push({
                                time: `${pmHour}:30 PM`,
                                isAvailable: Math.random() > 0.3
                            });
                        }
                    }
                }

                return slots;
            };

            fetchTimeSlots();
        }
    }, [formData.appointmentDate, selectedDoctor, currentStep]);


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

    // Reset form when modal is opened
    useEffect(() => {
        if (open) {
            setCurrentStep(BookingStep.DoctorSelection);
            setFormData({
                fullName: "",
                phoneNumber: "",
                email: "",
                isHmoRegistered: "no",
                hasPreviousVisit: "no",
                briefHistory: "",
                appointmentDate: "",
                appointmentTime: "",
                doctorId: "",
            });
            setErrors({});
            setMessage(null);
            setSelectedDoctor(null);
        }
    }, [open]);

    const validateCurrentStep = (): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        switch (currentStep) {
            case BookingStep.DoctorSelection:
                if (!formData.doctorId) {
                    newErrors.doctorId = "Please select a doctor";
                    isValid = false;
                }
                break;

            case BookingStep.DateSelection:
                if (!formData.appointmentDate) {
                    newErrors.appointmentDate = "Please select an appointment date";
                    isValid = false;
                }
                break;

            case BookingStep.TimeSelection:
                if (!formData.appointmentTime) {
                    newErrors.appointmentTime = "Please select an appointment time";
                    isValid = false;
                }
                break;

            case BookingStep.PatientInfo:
                // Validate name
                if (!formData.fullName.trim()) {
                    newErrors.fullName = "Full name is required";
                    isValid = false;
                }

                // Validate phone
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
                break;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleNextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep(prevStep => prevStep + 1);
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(prevStep => prevStep - 1);
    };

    const handleSelectDoctor = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setFormData({ ...formData, doctorId: doctor._id });  // Use _id instead of id
        setErrors({ ...errors, doctorId: undefined });
    };

    const handleSelectDate = (date: string) => {
        // Check if it's a Sunday
        const selectedDate = new Date(date);
        const dayOfWeek = selectedDate.getDay();

        if (dayOfWeek === 0) {
            setMessage({
                text: "Appointments cannot be booked on Sundays",
                type: "error"
            });
            return;
        }

        setFormData({ ...formData, appointmentDate: date });
        setErrors({ ...errors, appointmentDate: undefined });
        setMessage(null);
    };

    const handleSelectTime = (time: string) => {
        setFormData({ ...formData, appointmentTime: time });
        setErrors({ ...errors, appointmentTime: undefined });
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateCurrentStep()) return;

        setIsSubmitting(true);
        setMessage(null);

        try {
            // Create appointment with string values for isHmoRegistered and hasPreviousVisit
            const appointmentData = {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                // Send as strings "yes" or "no" instead of boolean values
                isHmoRegistered: formData.isHmoRegistered, // Already "yes" or "no"
                hmoName: formData.isHmoRegistered === 'yes' ? formData.hmoName : undefined,
                hmoNumber: formData.isHmoRegistered === 'yes' ? formData.hmoNumber : undefined,
                hasPreviousVisit: formData.hasPreviousVisit, // Already "yes" or "no"
                medicalRecordNumber: formData.hasPreviousVisit === 'yes' ? formData.medicalRecordNumber : undefined,
                briefHistory: formData.briefHistory || 'None provided',
                appointmentDate: formData.appointmentDate,
                appointmentTime: formData.appointmentTime,
                doctorId: formData.doctorId
            };

            console.log('Sending appointment data:', appointmentData);

            const response = await apiClient.post('/appointments', appointmentData);

            console.log('Appointment created successfully:', response.data);

            setMessage({
                text: "Appointment request sent successfully!",
                type: "success"
            });

            setCurrentStep(BookingStep.Confirmation);
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to book appointment:', error);

            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                console.error('Error response headers:', error.response.headers);

                // Display the specific validation error messages from the server
                if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
                    const errorMessages = error.response.data.errors.map((err: any) => err.msg).join(', '); // eslint-disable-line @typescript-eslint/no-explicit-any
                    setMessage({
                        text: errorMessages || 'Validation failed. Please check your input.',
                        type: "error"
                    });
                } else {
                    setMessage({
                        text: error.response.data?.message || error.response.data?.error || 'Failed to book appointment. Please try again.',
                        type: "error"
                    });
                }
            } else if (error.request) {
                setMessage({
                    text: 'No response received from the server. Please check your connection and try again.',
                    type: "error"
                });
            } else {
                setMessage({
                    text: error.message || 'Failed to book appointment. Please try again.',
                    type: "error"
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepIndicator = () => {
        return (
            <div className="flex justify-center items-center mb-6">
                {Array.from({ length: 4 }, (_, i) => i + 1).map((step) => (
                    <div key={step} className="flex items-center">
                        <div
                            className={`rounded-full flex items-center justify-center h-8 w-8 md:h-10 md:w-10 ${step < currentStep
                                ? "bg-green-500 text-white"
                                : step === currentStep
                                    ? "bg-[#FFB915] text-white"
                                    : "bg-gray-200 text-gray-500"
                                }`}
                        >
                            {step < currentStep ? (
                                <FaCheckCircle />
                            ) : (
                                step
                            )}
                        </div>
                        {step < 4 && (
                            <div
                                className={`h-1 w-10 md:w-16 ${step < currentStep ? "bg-green-500" : "bg-gray-200"
                                    }`}
                            ></div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case BookingStep.DoctorSelection:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Select a Doctor</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {doctors.map((doctor) => (
                                <div
                                    key={doctor._id}
                                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-md ${formData.doctorId === doctor._id
                                        ? "border-[#FFB915] bg-[#FFB915]/10"
                                        : "border-gray-200 hover:border-[#FFB915]"
                                        }`}
                                    onClick={() => handleSelectDoctor(doctor)}
                                >
                                    <div className="flex items-center">
                                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center mr-4">
                                            {doctor.image ? (
                                                <img
                                                    src={doctor.image}
                                                    alt={doctor.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.onerror = null;
                                                        target.src = 'https://via.placeholder.com/64?text=Dr';
                                                    }}
                                                />
                                            ) : (
                                                <FaUserMd className="text-gray-400 text-3xl" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-lg">{doctor.name}</h4>
                                            <p className="text-gray-600">{doctor.speciality}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {errors.doctorId && (
                            <p className="text-red-500 text-sm">{errors.doctorId}</p>
                        )}
                    </div>
                );

            case BookingStep.DateSelection:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-800">Select a Date</h3>
                            {selectedDoctor && (
                                <div className="text-sm text-gray-600 flex items-center">
                                    <span>Doctor:</span>
                                    <span className="font-medium ml-1 text-[#FFB915]">{selectedDoctor.name}</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center">
                                        <FaCalendarAlt className="mr-2 text-[#FFB915]" />
                                        Choose an available date:
                                    </div>
                                </label>
                                <input
                                    type="date"
                                    name="appointmentDate"
                                    min={minDate}
                                    value={formData.appointmentDate}
                                    onChange={handleChange}
                                    className={`w-full p-3 rounded-lg border ${errors.appointmentDate
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-300 focus:border-[#FFB915]"
                                        } focus:outline-none focus:ring-2 focus:ring-[#FFB915] transition-colors`}
                                />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {availableDates.slice(0, 8).map((date, index) => {
                                    const dateString = date.toISOString().split('T')[0];
                                    const isSelected = formData.appointmentDate === dateString;

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => handleSelectDate(dateString)}
                                            className={`p-3 rounded-lg border text-center cursor-pointer transition-colors
                        ${isSelected
                                                    ? "bg-[#FFB915] text-white border-[#FFB915]"
                                                    : "bg-white hover:bg-[#FFB915]/10 border-gray-200"
                                                }`}
                                        >
                                            <div className="text-xs font-medium">
                                                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                            </div>
                                            <div className="font-bold">
                                                {date.getDate()}
                                            </div>
                                            <div className="text-xs">
                                                {date.toLocaleDateString('en-US', { month: 'short' })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {errors.appointmentDate && (
                            <p className="text-red-500 text-sm">{errors.appointmentDate}</p>
                        )}
                    </div>
                );

            case BookingStep.TimeSelection:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-800">Select a Time</h3>
                            {selectedDoctor && formData.appointmentDate && (
                                <div className="text-sm text-gray-600 flex flex-col items-end">
                                    <div className="font-medium text-[#FFB915]">{selectedDoctor.name}</div>
                                    <div>{formatDate(formData.appointmentDate)}</div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-medium mb-4">Available Time Slots:</h4>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {availableTimeSlots.map((slot, index) => (
                                    <div
                                        key={index}
                                        onClick={() => slot.isAvailable && handleSelectTime(slot.time)}
                                        className={`p-3 rounded-lg border text-center transition-colors
        ${!slot.isAvailable
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : formData.appointmentTime === slot.time
                                                    ? "bg-[#FFB915] text-white border-[#FFB915] cursor-pointer"
                                                    : "hover:bg-[#FFB915]/10 cursor-pointer"
                                            }`}
                                    >
                                        {slot.time}
                                    </div>
                                ))}
                            </div>

                            {availableTimeSlots.filter(slot => slot.isAvailable).length === 0 && (
                                <div className="text-center p-4 text-gray-500 italic">
                                    No available time slots for this date. Please select another date.
                                </div>
                            )}
                        </div>

                        {errors.appointmentTime && (
                            <p className="text-red-500 text-sm">{errors.appointmentTime}</p>
                        )}
                    </div>
                );

            case BookingStep.PatientInfo:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Patient Information</h3>

                        {/* Appointment Summary */}
                        <div className="bg-[#FFB915]/10 p-4 rounded-lg mb-4">
                            <h4 className="font-medium mb-2">Appointment Summary:</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="font-medium">Doctor:</span>
                                    <span className="ml-1">{selectedDoctor?.name}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Date:</span>
                                    <span className="ml-1">{formatDate(formData.appointmentDate)}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Time:</span>
                                    <span className="ml-1">{formData.appointmentTime}</span>
                                </div>
                            </div>
                        </div>

                        {/* Full Name Field */}
                        <div>
                            <label
                                htmlFor="fullName"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                <div className="flex items-center">
                                    <FaUser className="mr-2 text-[#FFB915]" />
                                    Full Name <span className="text-red-500">*</span>
                                </div>
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-lg ${errors.fullName
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300 focus:border-[#FFB915]"
                                    } focus:outline-none focus:ring-2 focus:ring-[#FFB915] transition-colors`}
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
                                    <FaPhone className="mr-2 text-[#FFB915]" />
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
                                    } focus:outline-none focus:ring-2 focus:ring-[#FFB915] transition-colors`}
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
                                    <FaEnvelope className="mr-2 text-[#FFB915]" />
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
                                    : "border-gray-300 focus:border-[#FFB915]"
                                    } focus:outline-none focus:ring-2 focus:ring-[#FFB915] transition-colors`}
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
                                    <FaHospital className="mr-2 text-[#FFB915]" />
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
                                        className="h-4 w-4 text-[#FFB915] focus:ring-[#FFB915] border-gray-300"
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
                                        className="h-4 w-4 text-[#FFB915] focus:ring-[#FFB915] border-gray-300"
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
                                                : "border-gray-300 focus:border-[#FFB915]"
                                                } focus:outline-none focus:ring-2 focus:ring-[#FFB915] transition-colors`}
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
                                                : "border-gray-300 focus:border-[#FFB915]"
                                                } focus:outline-none focus:ring-2 focus:ring-[#FFB915] transition-colors`}
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
                                    <FaIdCard className="mr-2 text-[#FFB915]" />
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
                                        className="h-4 w-4 text-[#FFB915] focus:ring-[#FFB915] border-gray-300"
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
                                        className="h-4 w-4 text-[#FFB915] focus:ring-[#FFB915] border-gray-300"
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
                                                : "border-gray-300 focus:border-[#FFB915]"
                                                } focus:outline-none focus:ring-2 focus:ring-[#FFB915] transition-colors`}
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
                                    <FaHistory className="mr-2 text-[#FFB915]" />
                                    Brief History of the Eye
                                </div>
                            </label>
                            <textarea
                                id="briefHistory"
                                name="briefHistory"
                                value={formData.briefHistory}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB915] focus:border-[#FFB915] transition-colors"
                                placeholder="Please describe any eye issues or symptoms (optional)"
                                rows={3}
                            />
                        </div>
                    </div>
                );

            case BookingStep.Confirmation:
                return (
                    <div className="text-center py-6">
                        <div className="mb-6 flex justify-center">
                            {selectedDoctor?.image ? (
                                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-green-100">
                                    <img
                                        src={selectedDoctor.image}
                                        alt={selectedDoctor.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = 'https://via.placeholder.com/96?text=Dr';
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                                    <FaCheckCircle className="text-green-500 text-5xl" />
                                </div>
                            )}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                            Appointment Confirmed!
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Your appointment has been successfully scheduled with {selectedDoctor?.name} on {formatDate(formData.appointmentDate)} at {formData.appointmentTime}.
                        </p>
                        <p className="text-gray-600 mb-6">
                            We've sent a confirmation email to <span className="font-medium">{formData.email}</span> with all the details.
                        </p>
                        <div className="bg-[#FFB915]/10 p-4 rounded-lg text-left max-w-md mx-auto mb-6">
                            <h4 className="font-medium mb-2">Appointment Details:</h4>
                            <div className="grid grid-cols-1 gap-2 text-sm">
                                <div className="flex justify-between py-1 border-b border-gray-200">
                                    <span className="font-medium">Doctor:</span>
                                    <span>{selectedDoctor?.name}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-200">
                                    <span className="font-medium">Date:</span>
                                    <span>{formatDate(formData.appointmentDate)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-200">
                                    <span className="font-medium">Time:</span>
                                    <span>{formData.appointmentTime}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="font-medium">Reference:</span>
                                    <span className="text-[#FFB915] font-medium">OEC-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">
                            If you need to reschedule or cancel, please contact us at least 24 hours in advance.
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-[#FFB915] hover:bg-[#2C4A6B] text-white font-medium rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    const renderNavButtons = () => {
        // Don't show navigation buttons on confirmation screen
        if (currentStep === BookingStep.Confirmation) {
            return null;
        }

        return (
            <div className="flex justify-between mt-8">
                {currentStep > BookingStep.DoctorSelection ? (
                    <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Back
                    </button>
                ) : (
                    <div></div> // Empty div to maintain flex layout
                )}

                {currentStep < BookingStep.PatientInfo ? (
                    <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-2 bg-[#FFB915] hover:bg-[#2C4A6B] text-white font-medium rounded-lg transition-colors"
                    >
                        Continue
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${isSubmitting ? "bg-[#FFC266] cursor-not-allowed" : "bg-[#FFB915] hover:bg-[#2C4A6B]"
                            }`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center">
                                <FaSpinner className="animate-spin mr-2" />
                                Submitting...
                            </span>
                        ) : (
                            "Book Appointment"
                        )}
                    </button>
                )}
            </div>
        );
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
                        className="bg-white rounded-lg p-6 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Book Appointment</h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915]"
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

                        {/* Step Indicator */}
                        {currentStep !== BookingStep.Confirmation && renderStepIndicator()}

                        {/* Step Content */}
                        {renderStepContent()}

                        {/* Navigation Buttons */}
                        {renderNavButtons()}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AppointmentModal;