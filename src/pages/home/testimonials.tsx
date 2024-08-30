import React from "react";
import placeholder from "../../assets/imagep.png";
import { FaStar } from "react-icons/fa";

const testimonialsData = [
  {
    rating: 5,
    review:
      "The leading eye care service in Kwara State right now, offering top-notch care and quality.",
    name: "Fatimat Temim",
    position: "Lecturer in Kwara State University",
    image: placeholder, // Corrected
  },
  {
    rating: 4,
    review:
      "Exceptional eye care services, combining professionalism with compassionate care to provide outstanding patient experiences.",
    name: "Rotimi Shefiu",
    position: "Software Engineer",
    image: placeholder, // Corrected
  },
  {
    rating: 5,
    review:
      "Unmatched eye care in Kwara State, known for its expert staff and high-quality treatments that prioritize patient well-being.",
    name: "Sanni Jemeel",
    position: "Software Engineer",
    image: placeholder, // Corrected
  },
];

const Testimonials: React.FC = () => {
  return (
    <div className="bg-zinc-100 mt-12 px-8 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold">Testimonials</h1>
        <p className="text-xl mt-4">
          Over the years, we've treated patients, who can testify on how quality
          our treatment is.
        </p>
      </div>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {testimonialsData.map((testimonial, index) => (
          <div
            key={index}
            className="flex flex-col p-6 bg-white shadow-xl rounded-lg"
          >
            <div className="flex items-center mb-4">
              {Array.from({ length: 5 }, (_, i) => (
                <FaStar
                  key={i}
                  fill={i < testimonial.rating ? "#FFA500" : "gray"}
                />
              ))}
            </div>
            <p className="text-lg italic mb-4">{testimonial.review}</p>
            <div className="flex items-center">
              <img
                className="w-11 h-11 rounded-full mr-4"
                src={testimonial.image} // Corrected
                alt={testimonial.name}
              />
              <div>
                <p className="text-base font-bold">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.position}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
