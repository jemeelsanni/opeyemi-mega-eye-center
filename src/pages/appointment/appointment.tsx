import React, { useState } from "react";
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData); // Handle form submission logic
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 ${
        open ? "block" : "hidden"
      }`}
    >
      <div className="bg-white rounded p-4 shadow-md w-full max-w-md relative">
        <div className=" text-lg font-semibold">Book Appointment</div>
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
              htmlFor="treatmentType"
              className="block text-base text-left font-medium text-gray-700"
            >
              Eye Treatment Type
            </label>
            <select
              id="treatmentType"
              name="treatmentType"
              value={formData.treatmentType}
              onChange={handleChange}
              className="outline-none border-[#FFA500] border-[1px] bg-gray p-2 w-full"
              required
            >
              <option value="" disabled>
                Select treatment type
              </option>
              <option value="Cataract Surgery">Cataract Surgery</option>
              <option value="LASIK">LASIK</option>
              <option value="Glaucoma Treatment">Glaucoma Treatment</option>
              {/* Add more options as needed */}
            </select>
          </div>

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
              <option value="Dr. Smith">Dr. Smith</option>
              <option value="Dr. Johnson">Dr. Johnson</option>
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
      </div>
    </div>
  );
};

export default Appointment;
