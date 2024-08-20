import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home/home";
import Services from "./pages/services/services";
import Contact from "./pages/contact/contact";
import CreateBlog from "./pages/blog/createBlog";
import BlogList from "./pages/blog/blogList";
import BlogDetail from "./pages/blog/blogDetail";
import ClientBlog from "./pages/blog/clientBlog";

const App: React.FC = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="contact" element={<Contact />} />
          <Route path="createBlog" element={<CreateBlog />} />
          <Route path="blogList" element={<BlogList />} />
          <Route path="clientBlog" element={<ClientBlog />} />
          <Route path="blogDetail/:blogId" element={<BlogDetail />} />
          <Route path="/edit-blog/:id" element={<CreateBlog />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
