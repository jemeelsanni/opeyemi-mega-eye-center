import React, { useState, ChangeEvent } from "react";

interface AppointmentformProps {
  goToPrev: () => void;
  goToNext: (data: { name: string; phone: string; email: string }) => void;
}

const Appointmentform: React.FC<AppointmentformProps> = ({
  goToPrev,
  goToNext,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    goToNext(formData);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-xl font-semibold">Book appointment</h2>
      <p className="mt-2">
        You're requesting a booking for a random eye check-up.
      </p>
      <form className="mt-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          name="email"
          placeholder="E-mail Address"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-2"
        />
        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={goToPrev}
            className="bg-gray-500 w-full text-white p-2 rounded-full"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[#FFA500] w-full text-white p-2 rounded-full"
          >
            Book Appointment
          </button>
        </div>
      </form>
    </div>
  );
};

export default Appointmentform;
