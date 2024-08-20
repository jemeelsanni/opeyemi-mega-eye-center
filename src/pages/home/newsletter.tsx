import React from "react";

const Newsletter: React.FC = () => {
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
                  <form className="flex flex-row gap-4">
                    <input
                      className="outline-none border-black border-[1px] rounded-full py-1 px-3 w-96"
                      type="text"
                      placeholder="Email"
                    />
                    <button className="bg-[#FFA500] rounded-full py-1 px-12 font-semibold text-white">
                      Send
                    </button>
                  </form>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-center">
                  We promise to send eye-related stuff and not spam you.
                </p>
              </div>
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
                  <form className="">
                    <input
                      className="outline-none w-full border-black border-[1px] mt-2 rounded-full py-1 px-3"
                      type="text"
                      placeholder="Email"
                    />
                    <button className="bg-[#FFA500] w-full rounded-full mt-3 py-3 px-12 font-semibold text-white">
                      Send
                    </button>
                  </form>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-center">
                  We promise to send eye-related stuff and not spam you.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
