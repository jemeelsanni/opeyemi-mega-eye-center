import React from "react";

interface AppointmentfinalProps {
  done: () => void;
  formData: {
    date: string;
    treatment: string;
    time: string;
    name: string;
    phone: string;
    email: string;
  };
}

const Appointmentfinal: React.FC<AppointmentfinalProps> = ({
  done,
  formData,
}) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-xl font-semibold text-[#FFA500]">
        Confirm Appointment
      </h2>
      <p className="mt-2">
        <strong>{formData.name},</strong> You requested a booking for{" "}
        <strong>{formData.treatment}</strong> on{" "}
        <strong>{formData.date}</strong> in the <strong>{formData.time}</strong>
      </p>
      <p className="mt-4">
        A SMS containing your booking details has been sent to the phone number{" "}
        <strong>({formData.phone})</strong> and mail{" "}
        <strong>({formData.email})</strong> provided
      </p>

      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={done}
          className="bg-[#FFA500] text-white p-2 rounded-full w-full"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default Appointmentfinal;
