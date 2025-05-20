// src/pages/home/home.tsx
import React, { useState, useEffect } from "react";
import Header from "../../layout/header";
import Navbar from "../../layout/navbar";
import Hero from "./hero";
import About from "./about";
import Service from "./service";
import VisitGuide from "./visitGuide";
import Doctors from "./doctors";
import Testimonials from "./testimonials";
import Newsletter from "./newsletter";
import Footer from "../../layout/footer";
import { testimonialApi, Testimonial } from "../../api/apiClient"; // Add Testimonial type import

// Import images
import Hero1 from "../../assets/hero1.jpg";
import Hero2 from "../../assets/hero2.jpg";
import Hero3 from "../../assets/hero3.jpg";
import Hero4 from "../../assets/hero4.jpg";
import Hero5 from "../../assets/hero5.jpg";
import Hero6 from "../../assets/hero6.jpg";
import Welcome from "../../assets/welcome.jpg";
import SurgicalImg from "../../assets/surgical.jpg";
import ClinicalImg from "../../assets/clinical.jpg";
import OpticalsImg from "../../assets/opticals.jpg";
import placeholder from "../../assets/imagep.png";

const Home: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]); // Use Testimonial type
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

  // Fetch testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setTestimonialsLoading(true);
        const response = await testimonialApi.getRecentTestimonials();
        if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          setTestimonials(response.data);
        } else {
          // Use fallback data if no testimonials are available
          setTestimonials(fallbackTestimonials);
        }
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        // Use fallback data on error
        setTestimonials(fallbackTestimonials);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Sample data for Hero component
  const heroImages = [
    { image: Hero1, alt: "Eye examination" },
    { image: Hero2, alt: "Eye care treatment" },
    { image: Hero3, alt: "Modern eye equipment" },
    { image: Hero4, alt: "Eye doctor consultation" },
    { image: Hero5, alt: "Eye surgery" },
    { image: Hero6, alt: "Eyeglasses fitting" },
  ];

  // Sample data for Service component
  const services = [
    {
      image: SurgicalImg,
      title: "Surgical Services",
      description: `Entrust your vision to the expertise of our highly skilled Ophthalmologists, 
      ensuring that you are in the safest hands throughout your eye care journey. 
      Our Ophthalmologists are specialists who bring unparalleled proficiency 
      to perfecting your vision through state-of-the-art corrective measures.`,
    },
    {
      image: ClinicalImg,
      title: "Clinical Services",
      description: `At OMEC, we take pride in our commitment to providing the highest standard 
      of clinical service, and we achieve this by investing in the best-in-class equipment. 
      Our state-of-the-art facilities are equipped with cutting-edge technologies and advanced 
      medical instrumentation.`,
    },
    {
      image: OpticalsImg,
      title: "Opticals",
      description: `Our dedicated team of Optometrists stands ready to serve you with unwavering commitment, 
      setting the highest standards in eye care excellence. Trained to provide comprehensive and personalized services, 
      our Optometrists prioritize your visual health with meticulous attention to detail.`,
    },
  ];

  // Fallback testimonials data in case API fails
  // Define with proper Testimonial type
  const fallbackTestimonials: Testimonial[] = [
    {
      _id: "1",
      rating: 5,
      review:
        "The leading eye care service in Kwara State right now, offering top-notch care and quality. The staff are professional and caring, and the facilities are state-of-the-art.",
      name: "Fatimat Temim",
      position: "Lecturer in Kwara State University",
      image: placeholder,
      isApproved: true,
      createdAt: new Date().toISOString()
    },
    {
      _id: "2",
      rating: 4,
      review:
        "Exceptional eye care services, combining professionalism with compassionate care to provide outstanding patient experiences. I highly recommend their services to anyone with eye problems.",
      name: "Rotimi Shefiu",
      position: "Software Engineer",
      image: placeholder,
      isApproved: true,
      createdAt: new Date().toISOString()
    },
    {
      _id: "3",
      rating: 5,
      review:
        "Unmatched eye care in Kwara State, known for its expert staff and high-quality treatments that prioritize patient well-being. The service is second to none and the atmosphere is calming.",
      name: "Sanni Jemeel",
      position: "Software Engineer",
      image: placeholder,
      isApproved: true,
      createdAt: new Date().toISOString()
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Navbar />
      <Hero heroImages={heroImages} />
      <About welcomeImage={Welcome} />
      <Service services={services} />
      <Doctors />
      <VisitGuide />
      <Testimonials isLoading={testimonialsLoading} testimonialsData={testimonials} />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Home;