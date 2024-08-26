import React, { useState } from "react";
import emailjs from "emailjs-com";

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter a valid email address.");
      return;
    }

    // EmailJS configuration
    const serviceId = "YOUR_SERVICE_ID";
    const templateId = "YOUR_TEMPLATE_ID";
    const userId = "YOUR_USER_ID";

    const templateParams = {
      email,
    };

    emailjs.send(serviceId, templateId, templateParams, userId).then(
      (response) => {
        console.log("SUCCESS!", response.status, response.text);
        setMessage("Thank you for subscribing to our newsletter!");
        setEmail("");
      },
      (error) => {
        console.error("FAILED...", error);
        setMessage(
          "There was an error sending your request. Please try again."
        );
      }
    );
  };

  return (
    <div>
      <div className="hero-large-screen">
        <div className="my-12">
          <section className="flex justify-center">
            <div>
              <div className="flex flex-row items-center gap-24">
                <div className="flex flex-col gap-0.5">
                  <p className="text-base font-medium">Join our</p>
                  <p className="text-2xl font-semibold">Newsletter</p>
                </div>
                <div>
                  <form className="flex flex-row gap-4" onSubmit={handleSubmit}>
                    <input
                      className="outline-none border-black border-[1px] rounded-full py-1 px-3 w-96"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="bg-[#FFA500] rounded-full py-1 px-12 font-semibold text-white"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
              {message && (
                <div className="mt-4 text-center">
                  <p>{message}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      <div className="hero-small-screen">
        <div className="my-12 mx-6">
          <section className="flex justify-center">
            <div>
              <div className="items-center gap-24">
                <div className="flex flex-col gap-0.5">
                  <p className="text-base font-medium">
                    Join our{" "}
                    <span className="text-xl font-semibold">Newsletter</span>
                  </p>
                </div>
                <div>
                  <form className="" onSubmit={handleSubmit}>
                    <input
                      className="outline-none w-full border-black border-[1px] mt-2 rounded-full py-1 px-3"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="bg-[#FFA500] w-full rounded-full mt-3 py-3 px-12 font-semibold text-white"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
              {message && (
                <div className="mt-4 text-center">
                  <p>{message}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
