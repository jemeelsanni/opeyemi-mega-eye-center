import React, { useState } from "react";
import emailjs from "emailjs-com"; // Import EmailJS
import x from "../../assets/x.png";

interface AppointmentProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  treatmentType: string;
  doctorName: string;
  name: string;
  email: string;
  date: string;
}

const Appointment: React.FC<AppointmentProps> = ({ open, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    treatmentType: "",
    doctorName: "",
    name: "",
    email: "",
    date: "",
  });

  const [message, setMessage] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "date") {
      const selectedDate = new Date(value);
      const dayOfWeek = selectedDate.getDay();

      if (dayOfWeek === 0) {
        setMessage("Appointments cannot be booked on Sundays.");
        return;
      } else {
        setMessage("");
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedDate = new Date(formData.date);
    if (selectedDate.getDay() === 0) {
      setMessage("Appointments cannot be booked on Sundays.");
      return;
    }

    const emailData = {
      treatmentType: formData.treatmentType,
      doctorName: formData.doctorName,
      name: formData.name,
      email: formData.email,
      date: formData.date,
    };

    // EmailJS configuration
    const serviceId = "service_dzdtozf"; // Replace with your actual EmailJS Service ID
    const templateId = "template_wds5rdb"; // Replace with your actual EmailJS Template ID
    const userId = "K1Hvv02kAzhxgjbWl"; // Replace with your actual EmailJS User ID or Public Key

    emailjs.send(serviceId, templateId, emailData, userId).then(
      (response) => {
        console.log("SUCCESS!", response.status, response.text);
        setMessage("Appointment request sent successfully!");
        setFormData({
          treatmentType: "",
          doctorName: "",
          name: "",
          email: "",
          date: "",
        });
      },
      (error) => {
        console.error("FAILED...", error);
        setMessage("Failed to send appointment request. Please try again.");
      }
    );

    onClose();
  };

  return (
    <div
      className={`fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 ${open ? "block" : "hidden"
        }`}
    >
      <div className="bg-white rounded p-4 shadow-md w-full max-w-md relative">
        <div className="text-lg font-semibold">Book Appointment</div>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-0 right-2 text-gray-500"
        >
          <img className="h-8 w-8" src={x} alt="Close" />
        </button>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label
              htmlFor="doctorName"
              className="block text-base text-left font-medium text-gray-700"
            >
              Doctor Name
            </label>
            <select
              id="doctorName"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              className="outline-none border-[#FFA500] border-[1px] bg-gray p-2 w-full"
              required
            >
              <option value="" disabled>
                Select doctor
              </option>
              <option value="Dr. Abdullahi">Dr. Taoheed</option>
              <option value="Dr. Johnson">Dr. Abdulkadr</option>
              <option value="Dr. Franklin">Dr. Franklin</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-base text-left font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="outline-none border-[#FFA500] border-[1px] bg-gray p-2 w-full"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-base text-left font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="outline-none border-[#FFA500] border-[1px] bg-gray p-2 w-full"
              required
            />
          </div>

          <div>
            <label
              htmlFor="date"
              className="block text-base text-left font-medium text-gray-700"
            >
              Appointment Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="outline-none border-[#FFA500] border-[1px] bg-gray p-2 w-full"
              required
            />
          </div>

          <button type="submit" className="bg-[#FFA500] p-4 text-lg w-full">
            Submit
          </button>
        </form>
        {message && (
          <div className="mt-4 text-center">
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointment;
