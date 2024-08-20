import React from "react";
import Navbar from "../../layout/navbar";
import Footer from "../../layout/footer";
import Header from "../../layout/header";

const Contact: React.FC = () => {
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
            <h1 className="text-5xl font-semibold text-[#FFA500] ">
              Contact Us
            </h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="hero-large-screen">
        <div className="mx-[408px] my-16">
          <div className="text-center">
            <h1 className="text-3xl py-2 font-medium text-center mt-0 mb-2">
              Get in touch
            </h1>
            <p className="text-lg pb-5">
              Got a question about us? Have some suggestions or just want to say
              Hi? Just contact us. We are here to assist you.
            </p>
          </div>
          <form className="flex flex-col text-lg gap-8" action="">
            <div className="flex flex-col">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="outline-none border-[#FFA500] border-[1px] bg-gray p-2"
                type="email"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                className="outline-none border-[#FFA500] border-[1px] bg-gray p-2"
                type="text"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                className="outline-none border-[#FFA500] border-[1px] bg-gray p-2"
                type="tel"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="message">How can we help you?</label>
              <textarea
                id="message"
                className="outline-none border-[#FFA500] h-48 border-[1px] bg-gray p-2"
              />
            </div>
            <button type="submit" className="bg-[#FFA500] p-4 text-lg">
              Submit Enquiry
            </button>
          </form>
        </div>
      </div>

      <div className="hero-small-screen">
        <div className="mx-6 my-6">
          <div className="text-center">
            <h1 className="text-3xl py-2 font-medium text-center mt-0 mb-2">
              Get in touch
            </h1>
            <p className="text-lg pb-5">
              Got a question about us? Have some suggestions or just want to say
              Hi? Just contact us. We are here to assist you.
            </p>
          </div>
          <form className="flex flex-col text-lg gap-8" action="">
            <div className="flex flex-col">
              <label htmlFor="emailSmall">Email</label>
              <input
                id="emailSmall"
                className="outline-none border-[#FFA500] border-[1px] bg-gray p-2"
                type="email"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="fullNameSmall">Full Name</label>
              <input
                id="fullNameSmall"
                className="outline-none border-[#FFA500] border-[1px] bg-gray p-2"
                type="text"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="phoneNumberSmall">Phone Number</label>
              <input
                id="phoneNumberSmall"
                className="outline-none border-[#FFA500] border-[1px] bg-gray p-2"
                type="tel"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="messageSmall">How can we help you?</label>
              <textarea
                id="messageSmall"
                className="outline-none border-[#FFA500] h-48 border-[1px] bg-gray p-2"
              />
            </div>
            <button type="submit" className="bg-[#FFA500] p-4 text-lg">
              Submit Enquiry
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
