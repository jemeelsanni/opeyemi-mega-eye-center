import React from "react";
import surgical from "../../assets/surgical.jpg";
import clinical from "../../assets/clinical.jpg";
import opticals from "../../assets/opticals.jpg";

const Service = () => {
  return (
    <div>
      <div className="hero-large-screen">
        <div className="mt-48 mx-[100px]">
          <div className="text-center">
            <h1 className=" text-3xl font-semibold">Our Services</h1>
            <h2 className="text-xl mt-4">
              We provide full scope of eye care service
            </h2>
          </div>
          <div className="mt-4 flex flex-cols w-full gap-6 ">
            <div className="w-1/3">
              <div>
                <img src={surgical} className="w-full" alt="" />
              </div>
              <div className="mt-4">
                <h1 className="text-xl font-semibold">Surgical Services</h1>
                <p className="mt-3 font-normal">
                  Entrust your vision to the expertise of our highly skilled
                  Ophthalmologists, ensuring that you are in the safest hands
                  throughout your eye care journey. Our Ophthalmologists are
                  specialists who bring unparalleled proficiency to perfecting
                  your vision through state-of-the-art corrective measures. With
                  a commitment to precision and excellence, they employ advanced
                  diagnostic tools and cutting-edge technologies to assess and
                  address a wide range of eye conditions. Whether you require
                  laser eye surgery, cataract removal, or other specialized
                  interventions, our Ophthalmologists tailor their approach to
                  meet your individual needs, prioritizing both the safety and
                  efficacy of the procedures. Rest assured that your vision is
                  our primary concern, and our Ophthalmologists are dedicated to
                  providing you with the highest level of care, ensuring optimal
                  visual outcomes and enhancing your overall eye health.
                </p>
              </div>
            </div>
            <div className="w-1/3">
              <div>
                <img src={clinical} className="w-full" alt="" />
              </div>
              <div className="mt-4">
                <h1 className="text-xl font-semibold">Clinical Services</h1>
                <p className="mt-3 font-normal">
                  At OMEC, we take pride in our commitment to providing the
                  highest standard of clinical service, and we achieve this by
                  investing in the best-in-class equipment. Our state-of-the-art
                  facilities are equipped with cutting-edge technologies and
                  advanced medical instrumentation, ensuring that you receive
                  top-tier diagnostic and treatment services. From precision
                  imaging to specialized diagnostic tools, our comprehensive
                  range of equipment allows our skilled healthcare professionals
                  to deliver accurate assessments and tailored care for your
                  individual needs. We believe that access to superior
                  technology enhances the quality of healthcare, and at OMEC, we
                  strive to ensure that you receive the clinical service you
                  truly deserve, backed by the most advanced and reliable
                  equipment available in the field. Your well-being is our
                  priority, and our commitment to excellence is reflected in the
                  sophisticated tools we employ to provide you with the best
                  possible medical care.
                </p>
              </div>
            </div>
            <div className="w-1/3">
              <div>
                <img src={opticals} className="w-full" alt="" />
              </div>
              <div className="mt-4">
                <h1 className="text-xl font-semibold">Opticals</h1>
                <p className="mt-3 font-normal">
                  Our dedicated team of Optometrists stands ready to serve you
                  with unwavering commitment, setting the highest standards in
                  eye care excellence. Trained to provide comprehensive and
                  personalized services, our Optometrists prioritize your visual
                  health with meticulous attention to detail. From routine eye
                  examinations to specialized assessments, we ensure that each
                  interaction adheres to the pinnacle of professional standards.
                  Moreover, we are dedicated to offering you only the finest
                  quality products, including precision-crafted eyeglasses,
                  contact lenses, and vision correction solutions. Your vision
                  is our priority, and our Optometrists strive to not only meet
                  but exceed your expectations by delivering care that is both
                  thorough and compassionate. With a focus on your well-being,
                  our commitment to excellence extends to every aspect of our
                  service, providing you with the assurance that your eye care
                  needs are met with the utmost expertise and the highest
                  quality products available.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-8  ">
            <div className="px-4 py-3 bg-[#FFA500] rounded-full text-white text-xl font-semibold">
              Browse all services
            </div>
          </div>
        </div>
      </div>
      <div className="hero-small-screen">
        <div className="mt-6 mx-6">
          <div className="text-center">
            <h1 className=" text-2xl font-semibold">Our Services</h1>
            <p className="text-lg mt-2">
              We provide full scope of eye care service
            </p>
          </div>
          <div className="mt-4 grid grid-cols-1 w-full gap-6 ">
            <div className="w-full">
              <div>
                <img src={surgical} className="w-full" alt="" />
              </div>
              <div className="mt-2">
                <h1 className="text-xl font-semibold">Surgical Services</h1>
                <p className="mt-1 font-normal">
                  Entrust your vision to the expertise of our highly skilled
                  Ophthalmologists, ensuring that you are in the safest hands
                  throughout your eye care journey. Our Ophthalmologists are
                  specialists who bring unparalleled proficiency to perfecting
                  your vision through state-of-the-art corrective measures. With
                  a commitment to precision and excellence, they employ advanced
                  diagnostic tools and cutting-edge technologies to assess and
                  address a wide range of eye conditions. Whether you require
                  laser eye surgery, cataract removal, or other specialized
                  interventions, our Ophthalmologists tailor their approach to
                  meet your individual needs, prioritizing both the safety and
                  efficacy of the procedures. Rest assured that your vision is
                  our primary concern, and our Ophthalmologists are dedicated to
                  providing you with the highest level of care, ensuring optimal
                  visual outcomes and enhancing your overall eye health.
                </p>
              </div>
            </div>
            <div className="w-full">
              <div>
                <img src={clinical} className="w-full" alt="" />
              </div>
              <div className="mt-2">
                <h1 className="text-xl font-semibold">Clinical Services</h1>
                <p className="mt-1 font-normal">
                  At OMEC, we take pride in our commitment to providing the
                  highest standard of clinical service, and we achieve this by
                  investing in the best-in-class equipment. Our state-of-the-art
                  facilities are equipped with cutting-edge technologies and
                  advanced medical instrumentation, ensuring that you receive
                  top-tier diagnostic and treatment services. From precision
                  imaging to specialized diagnostic tools, our comprehensive
                  range of equipment allows our skilled healthcare professionals
                  to deliver accurate assessments and tailored care for your
                  individual needs. We believe that access to superior
                  technology enhances the quality of healthcare, and at OMEC, we
                  strive to ensure that you receive the clinical service you
                  truly deserve, backed by the most advanced and reliable
                  equipment available in the field. Your well-being is our
                  priority, and our commitment to excellence is reflected in the
                  sophisticated tools we employ to provide you with the best
                  possible medical care.
                </p>
              </div>
            </div>
            <div className="w-full">
              <div>
                <img src={opticals} className="w-full" alt="" />
              </div>
              <div className="mt-2">
                <h1 className="text-xl font-semibold">Opticals</h1>
                <p className="mt-1 font-normal">
                  Our dedicated team of Optometrists stands ready to serve you
                  with unwavering commitment, setting the highest standards in
                  eye care excellence. Trained to provide comprehensive and
                  personalized services, our Optometrists prioritize your visual
                  health with meticulous attention to detail. From routine eye
                  examinations to specialized assessments, we ensure that each
                  interaction adheres to the pinnacle of professional standards.
                  Moreover, we are dedicated to offering you only the finest
                  quality products, including precision-crafted eyeglasses,
                  contact lenses, and vision correction solutions. Your vision
                  is our priority, and our Optometrists strive to not only meet
                  but exceed your expectations by delivering care that is both
                  thorough and compassionate. With a focus on your well-being,
                  our commitment to excellence extends to every aspect of our
                  service, providing you with the assurance that your eye care
                  needs are met with the utmost expertise and the highest
                  quality products available.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-8  ">
            <div className="px-4 py-3 bg-[#FFA500] rounded-full text-white text-lg font-semibold">
              Browse all services
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Service;
