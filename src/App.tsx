import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home/home";
import Services from "./pages/services/services";
import Contact from "./pages/contact/contact";
import CreateBlog from "./pages/admin/blogs/createBlog";
import BlogList from "./pages/blog/blogList";
import BlogDetail from "./pages/blog/blogDetail";
import TestimonialsPage from './pages/testimonials';
// import NotFound from "./pages/NotFound";

// Auth Pages
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import DoctorLogin from "./pages/doctors/doctorLogin";

// Admin Dashboard
import Dashboard from "./pages/admin/dashboard";
import AdminBlogList from "./pages/admin/blogs/blogList";
import AdminAppointments from "./pages/admin/appointments/appointments";
import AdminContacts from "./pages/admin/contacts/contacts";
import AdminNewsletters from "./pages/admin/newsletters/newsletters";
import AdminUsers from "./pages/admin/users/users";
import AdminBlogViewer from './pages/admin/blogs/blogviewer';
import DoctorManagement from './pages/admin/doctors/doctorManagement';
import AddDoctor from './pages/admin/doctors/addDoctor';
import EditDoctorPage from './pages/admin/doctors/editDoctorPage';
import TestimonialManagement from './pages/admin/testimonials/testimonialManagement';
// import AdminDoctorDetailsPage from "./pages/admin/doctors/doctorDetailsPage"; // For admin viewing doctor details

// import Unauthorized from "./pages/Unauthorized";

// Doctor Dashboard
import DoctorDashboard from './pages/doctors/doctorDashboard';
import DoctorProfile from './pages/doctors/doctorProfile';
import DoctorAvailability from './pages/doctors/doctorAvailability';
import DoctorAppointments from './pages/doctors/doctorAppointments';
import DoctorSettings from './pages/doctors/doctorSettings';




// Protected Routes
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from './context/AuthContext';
import EditBlog from "./pages/admin/blogs/editBlog";
import DoctorDetailsPage from "./pages/doctors/doctorDetailsPage";
import EventsPage from "./pages/events";
import EventDetails from "./pages/events/eventDetails";
import EventManagement from "./pages/admin/events/eventManagement";
import About from "./pages/about/about";

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
          <Route path="/about" element={<About />} />
          <Route path="/blogDetail/:blogId" element={<BlogDetail />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetails />} />


          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctor/login" element={<DoctorLogin />} />
          {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}

          {/* Admin Routes with Role Protection */}
          <Route element={<ProtectedRoute roles={['admin', 'superadmin']} />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/blogs" element={<AdminBlogList />} />
            <Route path="/admin/createBlog" element={<CreateBlog />} />
            <Route path="/admin/edit-blog/:id" element={<EditBlog />} />
            <Route path="/admin/events" element={<EventManagement />} />


            {/* Updated route for admin blog viewing - critical for fixing 404 issues */}
            <Route path="/admin/blog/:blogId" element={<AdminBlogViewer />} />
          </Route>

          {/* Super Admin Only Routes */}
          <Route element={<ProtectedRoute roles={['superadmin']} />}>
            <Route path="/admin/appointments" element={<AdminAppointments />} />
            <Route path="/admin/contacts" element={<AdminContacts />} />
            <Route path="/admin/newsletters" element={<AdminNewsletters />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            {/* Doctor Management Routes */}
            <Route path="/admin/doctors" element={<DoctorManagement />} />
            <Route path="/admin/doctors/add" element={<AddDoctor />} />
            <Route path="/admin/doctors/:id" element={<EditDoctorPage />} />
            <Route path="/admin/testimonials" element={<TestimonialManagement />} />

          </Route>

          {/* Doctor Routes */}
          <Route element={<ProtectedRoute roles={['doctor']} />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/profile" element={<DoctorProfile />} />
            <Route path="/doctor/availability" element={<DoctorAvailability />} />
            <Route path="/doctor/appointments" element={<DoctorAppointments />} />
            <Route path="/doctor/details/:id" element={<DoctorDetailsPage />} />
            <Route path="/doctor/settings" element={<DoctorSettings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;