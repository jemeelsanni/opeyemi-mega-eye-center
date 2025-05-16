import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home/home";
import Services from "./pages/services/services";
import Contact from "./pages/contact/contact";
import CreateBlog from "./pages/admin/blogs/createBlog";
import BlogList from "./pages/blog/blogList";
import BlogDetail from "./pages/blog/blogDetail";
// import NotFound from "./pages/NotFound";

// Auth Pages
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";

// Admin Dashboard
import Dashboard from "./pages/admin/dashboard";
import AdminBlogList from "./pages/admin/blogs/blogList";
import AdminAppointments from "./pages/admin/appointments/appointments";
import AdminContacts from "./pages/admin/contacts/contacts";
import AdminNewsletters from "./pages/admin/newsletters/newsletters";
import AdminUsers from "./pages/admin/users/users";
import AdminBlogViewer from './pages/admin/blogs/blogviewer';
// import Unauthorized from "./pages/Unauthorized";

// Protected Routes
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from './context/AuthContext';
import EditBlog from "./pages/admin/blogs/editBlog";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blogDetail/:blogId" element={<BlogDetail />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}

          {/* Admin Routes with Role Protection */}
          <Route element={<ProtectedRoute roles={['admin', 'superadmin']} />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/blogs" element={<AdminBlogList />} />
            <Route path="/admin/createBlog" element={<CreateBlog />} />
            <Route path="/admin/edit-blog/:id" element={<EditBlog />} />
            {/* Updated route for admin blog viewing - critical for fixing 404 issues */}
            <Route path="/admin/blog/:blogId" element={<AdminBlogViewer />} />
          </Route>

          {/* Super Admin Only Routes */}
          <Route element={<ProtectedRoute roles={['superadmin']} />}>
            <Route path="/admin/appointments" element={<AdminAppointments />} />
            <Route path="/admin/contacts" element={<AdminContacts />} />
            <Route path="/admin/newsletters" element={<AdminNewsletters />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;