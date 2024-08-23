import React from "react";
import Navbar from "../../layout/navbar";
import Footer from "../../layout/footer";
import Header from "../../layout/header";
import Eye from "../../assets/eyeservice.png";
import EyeChecked from "../../assets/eyechecked.png";
import Hospital from "../../assets/hospital.png";

const Services: React.FC = () => {
  return (
    <div>
      <Header />
      <Navbar />
      {/* Header Section */}
      <div
        className="w-full bg-center bg-cover h-[12rem]"
        style={{
          backgroundImage:
            "url(https://i.ibb.co/DYWWBXH/national-cancer-institute-L8t-WZT4-Cc-VQ-unsplash.jpg)",
        }}
      >
        <div className="flex items-center justify-center w-full h-full bg-gray-900 bg-opacity-50">
          <div className="text-center">
            <h1 className="text-5xl font-semibold text-[#FFA500]">
              Services And Facilities
            </h1>
          </div>
        </div>
      </div>

      <section className="hero-large-screen">
        <h1 className="text-3xl py-2 font-medium text-center leading-tight mt-16 mb-2">
          Services offered by Opeyemi Mega Eye Center.
        </h1>
        <p className="text-center text-lg pb-5">
          Opeyemi Mega Eye Clinic has the best equipment to give you the
          clinical service you deserve
        </p>
        <section className="m-4 md:m-8 text-lg">
          {/* Individual Services */}
          <div
            style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}
            className="container mx-auto grid justify-center gap-4 bg-grey-200 grid-cols-3"
          >
            <div
              style={{ border: "1px solid #f0f0f0" }}
              className="flex flex-col bg-grey-200 items-center p-4"
            >
              <img className="h-[64px] w-[64px]" src={Eye} alt="Eye Service" />
              <h3 className="my-3 text-3xl font-semibold">Clinicals</h3>
              <div className="space-y-1 leading-tight">
                <li>General ophthalmology clinic</li>
                <li>Glaucoma clinic</li>
                <li>Refraction service</li>
                <li>Glass dispensing</li>
                <li>Eye surgeries</li>
                <li>Preventive eye care</li>
                <li>School eye care</li>
                <li>Outreach service</li>
              </div>
            </div>
            {/* Investigations */}
            <div
              style={{ border: "1px solid #f0f0f0" }}
              className="flex flex-col items-center p-4"
            >
              <img
                className="h-[64px] w-[64px]"
                src={EyeChecked}
                alt="Eye Checked"
              />
              <h3 className="my-3 text-3xl font-semibold">Investigations</h3>
              <div className="space-y-1 leading-tight">
                <li>Central Visual Field</li>
                <li>Autorefraction</li>
                <li>Biometry</li>
                <li>Pachymetry</li>
                <li>Ocular Cohorence Tomography + Angiography</li>
                <li>A-scan</li>
                <li>B-scan</li>
                <li>Fundus Photography + Angiography</li>
                <li>Intraocular pressure</li>
              </div>
            </div>
            {/* Facilities */}
            <div
              style={{ border: "1px solid #f0f0f0" }}
              className="flex flex-col items-center p-4"
            >
              <img
                className="h-[64px] w-[64px]"
                src={Hospital}
                alt="Hospital Facility"
              />
              <h3 className="my-3 text-3xl font-semibold">Our Facilities</h3>
              <div className="space-y-1 leading-tight">
                <li>20 bedded space</li>
                <li>A standard operation theatre</li>
                <li>Three (3) operating microscopes and tables</li>
                <li>Standard sterilizing facilities</li>
                <li>A pharmaceutical dispensary unit</li>
                <li>Two standard investigation rooms</li>
                <li>Three consulting rooms</li>
                <li>A standard nursing station</li>
                <li>OCT</li>
                <li>CVF</li>
                <li>A-scan</li>
                <li>Refractometer / keratometer</li>
                <li>Laser Machine</li>
                <li>Pressure Check Machine</li>
              </div>
            </div>
          </div>
        </section>
      </section>

      <section className="hero-small-screen">
        <h1 className="text-2xl py-2 font-medium text-center leading-tight mt-16 mb-2">
          Services offered by Opeyemi Mega Eye Center.
        </h1>
        <p className="text-center text-lg pb-5">
          Opeyemi Mega Eye Clinic has the best equipment to give you the
          clinical service you deserve
        </p>
        <section className="m-4 md:m-8 text-lg">
          {/* Individual Services */}
          <div
            style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}
            className="container mx-auto grid justify-center gap-4 bg-grey-200 grid-cols-1"
          >
            <div
              style={{ border: "1px solid #f0f0f0" }}
              className="flex flex-col items-center p-4"
            >
              <img className="h-[64px] w-[64px]" src={Eye} alt="Eye Service" />
              <h3 className="my-3 text-3xl font-semibold">Clinicals</h3>
              <div className="space-y-1 leading-tight">
                <li>General ophthalmology clinic</li>
                <li>Glaucoma clinic</li>
                <li>Refraction service</li>
                <li>Glass dispensing</li>
                <li>Eye surgeries</li>
                <li>Preventive eye care</li>
                <li>School eye care</li>
                <li>Outreach service</li>
              </div>
            </div>
            {/* Investigations */}
            <div
              style={{ border: "1px solid #f0f0f0" }}
              className="flex flex-col items-center p-4"
            >
              <img
                className="h-[64px] w-[64px]"
                src={EyeChecked}
                alt="Eye Checked"
              />
              <h3 className="my-3 text-3xl font-semibold">Investigations</h3>
              <div className="space-y-1 leading-tight">
                <li>Central Visual Field</li>
                <li>Autorefraction</li>
                <li>Biometry</li>
                <li>Pachymetry</li>
                <li>Ocular Cohorence Tomography + Angiography</li>
                <li>A-scan</li>
                <li>B-scan</li>
                <li>Fundus Photography + Angiography</li>
                <li>Intraocular pressure</li>
              </div>
            </div>
            {/* Facilities */}
            <div
              style={{ border: "1px solid #f0f0f0" }}
              className="flex flex-col items-center p-4"
            >
              <img
                className="h-[64px] w-[64px]"
                src={Hospital}
                alt="Hospital Facility"
              />
              <h3 className="my-3 text-3xl font-semibold">Our Facilities</h3>
              <div className="space-y-1 leading-tight">
                <li>20 bedded space</li>
                <li>A standard operation theatre</li>
                <li>Three (3) operating microscopes and tables</li>
                <li>Standard sterilizing facilities</li>
                <li>A pharmaceutical dispensary unit</li>
                <li>Two standard investigation rooms</li>
                <li>Three consulting rooms</li>
                <li>A standard nursing station</li>
                <li>OCT</li>
                <li>CVF</li>
                <li>A-scan</li>
                <li>Refractometer / keratometer</li>
                <li>Laser Machine</li>
                <li>Pressure Check Machine</li>
              </div>
            </div>
          </div>
        </section>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
