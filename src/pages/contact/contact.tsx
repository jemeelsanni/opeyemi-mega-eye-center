import React, { useState } from "react";
import emailjs from "emailjs-com";
import Navbar from "../../layout/navbar";
import Footer from "../../layout/footer";
import Header from "../../layout/header";

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phoneNumber: "",
    message: "",
  });

  const [feedback, setFeedback] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure all fields are filled
    if (
      !formData.email ||
      !formData.fullName ||
      !formData.phoneNumber ||
      !formData.message
    ) {
      setFeedback("Please fill in all the fields.");
      return;
    }

    const serviceId = "service_6h8ln3l"; // Replace with your EmailJS service ID
    const templateId = "template_3c1jkds"; // Replace with your EmailJS template ID
    const userId = "govBXkLy6kYw-vShr"; // Replace with your EmailJS user ID

    try {
      const response = await emailjs.send(
        serviceId,
        templateId,
        formData,
        userId
      );

      console.log("SUCCESS!", response.status, response.text);
      setFeedback("Enquiry sent successfully!");
      setFormData({ email: "", fullName: "", phoneNumber: "", message: "" });
    } catch (error) {
      console.error("FAILED...", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unknown error occurred. Please try again.";

      setFeedback(`Failed to send enquiry: ${errorMessage}`);
    }

  };

  return (
    <div>
      <Header />
      <Navbar />
      <div
        className="w-full bg-center bg-cover h-[12rem]"
        style={{
          backgroundImage:
            "url(https://i.ibb.co/4KnKgf8/kaleb-tapp-J59w-WPn09-BE-unsplash.jpg)",
        }}
      >
        <div className="flex items-center justify-center w-full h-full bg-gray-900 bg-opacity-50">
          <div className="text-center">
            <h1 className="text-5xl font-semibold text-[#FFA500]">
              Contact Us
            </h1>
          </div>
        </div>
      </div>

      <div className="hero-large-screen mx-[408px] my-16">
        <div className="text-center">
          <h1 className="text-3xl py-2 font-medium text-center mt-0 mb-2">
            Get in touch
          </h1>
          <p className="text-lg pb-5">
            Got a question about us? Have some suggestions or just want to say
            Hi? Just contact us. We are here to assist you.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col text-lg gap-8">
          <div className="flex flex-col">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="outline-none border-[#FFA500] border-[1px] bg-gray p-2"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              className="outline-none border-[#FFA500] border-[1px] bg-gray p-2"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              id="phoneNumber"
              className="outline-none border-[#FFA500] border-[1px] bg-gray p-2"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="message">How can we help you?</label>
            <textarea
              id="message"
              className="outline-none border-[#FFA500] h-48 border-[1px] bg-gray p-2"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="bg-[#FFA500] p-4 text-lg">
            Submit Enquiry
          </button>
        </form>
        {feedback && (
          <div className="mt-4 text-center">
            <p>{feedback}</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
