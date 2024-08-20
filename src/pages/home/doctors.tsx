import React from "react";
import CEO from "../../assets/CEO.jpg";

const doctors = () => {
  return (
    <div>
      <div className="mt-32 mx-[100px] hero-large-screen">
        <div className="text-center">
          <h1 className=" text-3xl font-semibold">Our Medical Doctors</h1>
          <h2 className="text-xl mt-4">
            We have doctors on board with quality years of experience to help
            you <br />
            with your eye problem.
          </h2>
        </div>
        <div className=" grid grid-cols-3 gap-10">
          <div>
            <div className=" h-[455px]">
              <img className="w-full h-full" src={CEO} alt="" />
            </div>
            <div>
              <p className=" text-lg font-medium">Abdullahi Taoheed Ayodeji</p>
              <p>Founder and Senior Doctor</p>
            </div>
          </div>
          <div>
            <div className=" h-[455px]">
              <img className="w-full h-full" src={CEO} alt="" />
            </div>
            <div>
              <p className=" text-lg font-medium">Abdullahi Taoheed Ayodeji</p>
              <p>Founder and Senior Doctor</p>
            </div>
          </div>
          <div>
            <div className=" h-[455px]">
              <img className="w-full h-full" src={CEO} alt="" />
            </div>
            <div>
              <p className=" text-lg font-medium">Abdullahi Taoheed Ayodeji</p>
              <p>Founder and Senior Doctor</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12 mx-6 hero-small-screen">
        <div className="text-center">
          <h1 className=" text-3xl font-semibold">Our Medical Doctors</h1>
          <p className="text-lg mt-2">
            We have doctors on board with quality years of experience to help
            you <br />
            with your eye problem.
          </p>
        </div>
        <div className=" grid grid-cols-1 gap-10">
          <div>
            <div className=" h-[455px]">
              <img className="w-full h-full" src={CEO} alt="" />
            </div>
            <div>
              <p className=" text-lg font-medium">Abdullahi Taoheed Ayodeji</p>
              <p>Founder and Senior Doctor</p>
            </div>
          </div>
          <div>
            <div className=" h-[455px]">
              <img className="w-full h-full" src={CEO} alt="" />
            </div>
            <div>
              <p className=" text-lg font-medium">Abdullahi Taoheed Ayodeji</p>
              <p>Founder and Senior Doctor</p>
            </div>
          </div>
          <div>
            <div className=" h-[455px]">
              <img className="w-full h-full" src={CEO} alt="" />
            </div>
            <div>
              <p className=" text-lg font-medium">Abdullahi Taoheed Ayodeji</p>
              <p>Founder and Senior Doctor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default doctors;
