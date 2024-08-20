import React from "react";
import Hero from "./hero";
import Header from "../../layout/header";
import Navbar from "../../layout/navbar";
import About from "./about";
import Service from "./service";
import Doctors from "./doctors";
import Testimonials from "./testimonials";
import Newsletter from "./newsletter";
import Footer from "../../layout/footer";

const Home: React.FC = () => {
  return (
    <div>
      <Header />
      <Navbar />
      <Hero />
      <About />
      <Service />
      <Doctors />
      <Testimonials />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Home;
