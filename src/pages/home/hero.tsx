import React, { useState } from "react";
import Hero1 from "../../assets/hero1.jpg";
import Hero2 from "../../assets/hero2.jpg";
import Hero3 from "../../assets/hero3.jpg";
import Hero4 from "../../assets/hero4.jpg";
import Hero5 from "../../assets/hero5.jpg";
import Hero6 from "../../assets/hero6.jpg";
import Appointment from "../appointment/appointment";

const Hero: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div>
      {/* Content visible only on laptop screens and above */}
      <div className="hero-large-screen">
        <div className="h-100 pt-32 bg-[#F5F5F5] ">
          <div className="h-full">
            <div className="flex gap-2 w-full ">
              <div className="w-1/4 h-[360px] mt-28">
                <img src={Hero1} className="w-full h-full" alt="Hero 1" />
              </div>
              <div className="w-1/2 px-[62px] text-center">
                <h1 className="text-6xl font-medium">
                  We Provide a Wide Scope of Eye Care Services.
                </h1>
                <br />
                <p className="text-3xl font-normal">
                  Opeyemi Mega Eye Centre is a world class health facility
                  dedicated to curing and preventing eye defects. If you're
                  looking for an eye clinic near you, you might have just
                  stumbled upon one!
                </p>
                <div className="flex flex-col justify-center items-center">
                  <button
                    onClick={() => setOpenModal(true)}
                    className="bg-[#FFA500] w-[321px] mx-auto rounded-full p-3 text-white text-lg font-medium mt-10 cursor-pointer"
                  >
                    Book Appointment Today
                  </button>
                  <Appointment
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                  />
                </div>
              </div>
              <div className="w-1/4 h-[360px] mt-28">
                <img src={Hero2} className="w-full h-full" alt="Hero 2" />
              </div>
            </div>
            <div className="flex gap-2 mt-2 w-full">
              <div className="w-1/4 h-[360px]">
                <img src={Hero3} className="w-full h-full" alt="Hero 3" />
              </div>
              <div className="w-1/4 h-[360px]">
                <img src={Hero4} className="w-full h-full" alt="Hero 4" />
              </div>
              <div className="w-1/4 h-[360px]">
                <img src={Hero5} className="w-full h-full" alt="Hero 5" />
              </div>
              <div className="w-1/4 h-[360px]">
                <img src={Hero6} className="w-full h-full" alt="Hero 6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content visible only on screens smaller than laptop */}
      <div className="hero-small-screen">
        <div className="h-100 bg-[#F5F5F5]   ">
          <div className="h-full">
            <div className=" py-6">
              <div className="w-full flex flex-col items-center px-[62px] text-center">
                <h1 className="text-3xl font-medium">
                  We Provide a Wide Scope of Eye Care Services.
                </h1>
                <br />
                <p className="text-lg font-normal">
                  Opeyemi Mega Eye Centre is a world class health facility
                  dedicated to curing and preventing eye defects. If you're
                  looking for an eye clinic near you, you might have just
                  stumbled upon one!
                </p>
                <div className="flex flex-col justify-center items-center">
                  <button
                    onClick={() => setOpenModal(true)}
                    className="bg-[#FFA500] w-[321px] mx-auto rounded-full p-3 text-white text-sm font-medium mt-5 cursor-pointer"
                  >
                    Book Appointment Today
                  </button>
                  <Appointment
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full ">
              <div>
                <img className="" src={Hero1} alt="Hero 1" />
              </div>
              <div>
                <img className="" src={Hero2} alt="Hero 2" />
              </div>
              <div>
                <img className="" src={Hero3} alt="Hero 3" />
              </div>
              <div>
                <img className="" src={Hero4} alt="Hero 4" />
              </div>
              <div>
                <img className="" src={Hero5} alt="Hero 5" />
              </div>
              <div>
                <img className="" src={Hero6} alt="Hero 6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
