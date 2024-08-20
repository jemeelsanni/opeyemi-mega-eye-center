import React from "react";
import Welcome from "../../assets/welcome.png";

const About: React.FC = () => {
  return (
    <div>
      <div className="hero-large-screen">
        <div className="flex w-full mt-32">
          <div className="w-1/2 mt-10">
            <img src={Welcome} className="w-full" alt="Welcome" />
          </div>
          <div className="w-1/2 px-14 text-lg">
            <h1 className="text-3xl font-semibold">
              Welcome to{" "}
              <span className="text-3xl font-bold text-[#FFA500]">OMEC</span>
            </h1>
            <p className="text-xl">
              We're the best eye care center available and we're ready to help
              you!
            </p>
            <p>
              Opeyemi Mega Eye Centre is a world-class health facility dedicated
              to providing all your eye health needs, not only curative but also
              preventive. We boast of cutting-edge equipment which aids in the
              diagnosis and treatment of medical and surgical eye conditions. We
              are a well-established professional eye hospital based in Ilorin,
              Kwara State, with a 20-bed capacity hospital that has all the
              units of a general eye hospital, including specialist services,
              high-tech investigation equipment, and pharmacy.
              <br />
              We have highly trained and dedicated staff who provide excellent
              care.
              <br />
              Our computerized systems ensure confidentiality and continuity.
              Our hospital is well endowed with a team of experts and
              professionals specializing in delivering quality healthcare
              solutions with professionalism and according to international
              standards, with a thorough understanding of the Nigerian service
              requirements and culture. We aim to set a standard for medical eye
              care, hence we continue updating and upgrading to ensure that you
              get the best.
            </p>
          </div>
        </div>
      </div>

      <div className="hero-small-screen">
        <div className="w-full mt-8">
          <div className="px-6 text-base">
            <h1 className="text-2xl font-semibold">
              Welcome to{" "}
              <span className="text-2xl font-bold text-[#FFA500]">OMEC</span>
            </h1>
            <p className="text-base">
              We're the best eye care center available and we're ready to help
              you!
            </p>
            <p>
              Opeyemi Mega Eye Centre is a world-class health facility dedicated
              to providing all your eye health needs, not only curative but also
              preventive. We boast of cutting-edge equipment which aids in the
              diagnosis and treatment of medical and surgical eye conditions. We
              are a well-established professional eye hospital based in Ilorin,
              Kwara State, with a 20-bed capacity hospital that has all the
              units of a general eye hospital, including specialist services,
              high-tech investigation equipment, and pharmacy.
              <br />
              We have highly trained and dedicated staff who provide excellent
              care.
              <br />
              Our computerized systems ensure confidentiality and continuity.
              Our hospital is well endowed with a team of experts and
              professionals specializing in delivering quality healthcare
              solutions with professionalism and according to international
              standards, with a thorough understanding of the Nigerian service
              requirements and culture. We aim to set a standard for medical eye
              care, hence we continue updating and upgrading to ensure that you
              get the best.
            </p>
          </div>
          <div className="mt-2">
            <img src={Welcome} className="w-full" alt="Welcome" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
