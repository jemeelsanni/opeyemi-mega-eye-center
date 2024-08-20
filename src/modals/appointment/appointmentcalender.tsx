import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface AppointmentcalenderProps {
  goToNext: (data: { date: string; treatment: string; time: string }) => void;
}

const Appointmentcalender: React.FC<AppointmentcalenderProps> = ({
  goToNext,
}) => {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("Morning");

  useEffect(() => {
    // Mock fetching available dates
    const mockAvailableDates = ["2024-06-10", "2024-06-12", "2024-06-14"];
    setAvailableDates(mockAvailableDates);
  }, []);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const handleNext = () => {
    if (selectedDate && selectedTreatment) {
      goToNext({
        date: selectedDate,
        treatment: selectedTreatment,
        time: selectedTime,
      });
    } else {
      alert("Please select a treatment type and a date.");
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-xl font-semibold text-[#FFA500]">Book appointment</h2>
      <div className="mt-4">
        <label>Select treatment type</label>
        <select
          value={selectedTreatment}
          onChange={(e) => setSelectedTreatment(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        >
          <option value="">Choose treatment type</option>
          <option value="Eye Checkup">Eye Checkup</option>
          <option value="Consultation">Consultation</option>
          <option value="Surgery">Surgery</option>
        </select>

        <label>Select day for appointment</label>
        <div className="w-full p-2 border rounded mb-2">
          <Calendar
            onClickDay={handleDateChange}
            tileDisabled={({ date }) =>
              !availableDates.includes(date.toISOString().split("T")[0])
            }
          />
        </div>

        <label>What time are you available?</label>
        <div className="w-full p-2 border rounded mb-2">
          <label className="mr-2">
            <input
              type="radio"
              value="Morning"
              checked={selectedTime === "Morning"}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
            Morning (8AM - 12PM)
          </label>
          <label className="ml-4">
            <input
              type="radio"
              value="Afternoon"
              checked={selectedTime === "Afternoon"}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
            Afternoon (12PM - 8PM)
          </label>
        </div>

        <div className="flex w-full mt-4">
          <button
            type="button"
            onClick={handleNext}
            className="bg-[#FFA500] w-full text-white p-2 rounded-full"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Appointmentcalender;
