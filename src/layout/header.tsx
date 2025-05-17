import React from "react";
import { FaClock, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const Header: React.FC = () => {
  return (
    <div className="bg-gray-900 text-white">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="container mx-auto py-2 px-4 md:px-6">
          <div className="flex justify-between items-center">
            {/* Working Hours */}
            <div className="flex items-center text-sm">
              <FaClock className="text-[#FFA500] mr-2" />
              <div>
                <p className="font-medium">Working Hours:</p>
                <p className="text-gray-300">
                  Mon-Sat: 8am - 6pm • Sundays: Surgery & Emergencies
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex items-center space-x-6">
              {/* Phone */}
              <div className="flex items-center text-sm">
                <FaPhone className="text-[#FFA500] mr-2 rotate-12" />
                <div>
                  <p className="font-medium">Phone:</p>
                  <a
                    href="tel:+23481464166676"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    +234-814-641-6676
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center text-sm">
                <FaMapMarkerAlt className="text-[#FFA500] mr-2" />
                <div>
                  <p className="font-medium">Location:</p>
                  <p className="text-gray-300">
                    4B, Saboline Isale, Amilegbe Rd, opposite Temitope Hospital, Ilorin
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header - Simplified version */}
      <div className="md:hidden">
        <div className="container mx-auto py-2 px-4">
          <div className="flex items-center justify-between">
            {/* Location only for mobile */}
            <div className="flex items-center text-xs">
              <FaMapMarkerAlt className="text-[#FFA500] mr-1 flex-shrink-0" />
              <p className="text-gray-300 line-clamp-2">
                4B, Saboline Isale, Amilegbe Rd, opposite Temitope Hospital, Ilorin
              </p>
            </div>

            {/* Phone for mobile - compact */}
            <a
              href="tel:+2348146416676"
              className="flex items-center bg-[#FFA500] rounded-full px-3 py-1 ml-2 text-white"
            >
              <FaPhone className="mr-1 rotate-12 text-xs" />
              <span className="text-xs font-medium">Call</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;