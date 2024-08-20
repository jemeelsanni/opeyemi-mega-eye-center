import React, { useState } from "react";
import { Link } from "react-router-dom";
import ham from "../assets/Ham.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="hero-large-screen">
        <div className="bg-white flex flex-cols px-24 py-6  items-center justify-between">
          <Link to="/" className=" text-3xl font-bold">
            OMEC
          </Link>
          <div className="flex flex-cols gap-16 text-xl font-medium">
            <div>
              <Link to="/">Home</Link>
            </div>
            <div>
              <Link to="/services">Services & Facilities</Link>
            </div>
            <div>
              <Link to="/clientBlog">Blog</Link>
            </div>
          </div>
          <div className="bg-[#FFA500] text-lg rounded-full px-5 py-3 text-white font-medium ">
            <Link className="text-white" to="/contact">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
      <div className="hero-small-screen">
        <div className="bg-white flex flex-cols px-6 py-4  items-center justify-between">
          <Link to="/" className=" text-3xl font-bold">
            OMEC
          </Link>
          <div>
            <img
              onClick={() => setOpen(!open)}
              className="w-[18px] h-[18px]"
              src={ham}
              alt=""
            />
          </div>
        </div>
      </div>
      {open && (
        <>
          <div className="fixed top-0 left-0 z-[9999] w-[80%] h-full bg-[#FFF6E9] products-title pt-[80px] px-[48px]">
            <div onClick={() => setOpen(false)} className="">
              X
            </div>
            <div className="flex flex-col gap-5 my-[32px]">
              <Link to="/">Home</Link>
              <Link to="/services">Services & Facilities</Link>
              <Link to="/clientBlog">Blog</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
            <div>
              <Link to="/" className=" text-3xl font-bold">
                OMEC
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;
