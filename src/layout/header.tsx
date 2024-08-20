import React from "react";
import Call from "../assets/call.png";
import Location from "../assets/location.png";

const Header: React.FC = () => {
  return (
    <div>
      <div className="hero-large-screen">
        <div className="bg-[#ffa500] opacity-[50%] px-24 py-4 flex flex-cols items-center justify-between">
          <div className="flex flex-cols items-center gap-4 text-lg">
            <div>
              <p className="font-semibold">Working Hours:</p>
            </div>
            <div>
              <p>Mon-Sat: 8am - 6pm</p>
              <p>Sundays: Surgery & Emergencies</p>
            </div>
          </div>
          <div className="flex flex-cols items-center gap-2 text-lg">
            <div className="flex flex-cols gap-1 items-center">
              <img src={Call} className=" w-5 h-5" alt="" />
              <p className="font-semibold">Phone:</p>
            </div>
            <div>
              <p>+234-81-641-6676</p>
            </div>
          </div>
          <div className="flex flex-cols items-center gap-2 text-lg">
            <div className="flex flex-cols gap-1 items-center">
              <img src={Location} className=" w-5 h-5" alt="" />
              <p className="font-semibold">Location:</p>
            </div>
            <div>
              <p>09, Ayelodun Rd, Amilegbe, Ilorin, Kwara State</p>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-small-screen">
        <div className="bg-[#ffa500] opacity-[50%] px-6 py-2  items-center justify-between">
          <div className="flex flex-cols items-center gap-4 text-base">
            <div>
              <p className=" font-medium">Working Hours:</p>
            </div>
            <div>
              <p>Mon-Sat: 8am - 6pm</p>
              <p>Sundays: Surgery & Emergencies</p>
            </div>
          </div>

          <div className="flex flex-cols items-center gap-2 text-base">
            <div className="flex flex-cols gap-1 items-center">
              <img src={Call} className=" w-4 h-4" alt="" />
              <p className="font-medium">Phone:</p>
            </div>
            <div>
              <p>+234-81-641-6676</p>
            </div>
          </div>

          <div className="flex flex-cols items-center mt-[-18px] gap-2 text-base">
            <div className="flex flex-cols gap-1 items-center">
              <img src={Location} className=" w-4 h-4" alt="" />
              <p className="font-medium">Location:</p>
            </div>
            <div>
              <p>09, Ayelodun Rd, Amilegbe, Ilorin.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
