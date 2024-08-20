import { FaWhatsapp, FaInstagram, FaTwitter } from "react-icons/fa";

const footer = () => {
  return (
    <div>
      <section className="bg-[#FFA500] flex items-center justify-center p-16">
        <div>
          <div>
            <p className="text-xl font-semibold text-white text-center">
              Opeyemi Mega Eye Center.
            </p>
          </div>
          <div className="flex flex-row gap-6 justify-center mt-6">
            <FaWhatsapp className=" h-6 w-6 fill-white" />
            <FaInstagram className=" h-6 w-6 fill-white" />
            <FaTwitter className=" h-6 w-6 fill-white" />
          </div>
          <div className="mt-6">
            <p className=" text-center text-white">
              {" "}
              &copy; 2024. Powered by{" "}
              <span className=" font-semibold">Bluesprint Inc</span>. All Rights
              Reserved
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default footer;
