
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes } from "react-icons/fa";
import Logo from "../assets/omeclogo.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scrolling
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  // Close mobile menu when navigating
  useEffect(() => {
    setOpen(false);
  }, [location]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (open && !target.closest(".mobile-menu-container") && !target.closest(".menu-toggle")) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Services & Facilities", path: "/services" },
    { name: "Blog", path: "/blog" },
    { name: "Contact Us", path: "/contact" },
    { name: "Testimonials", path: "/testimonials" },
    { name: "Events", path: "/events" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-white shadow-md py-3" : "bg-white py-4"
        }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={Logo} alt="" className="h-12 w-12" />
          </Link>

          <div className="flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative font-medium transition-colors ${isActive(link.path)
                  ? "text-[#FFB915]"
                  : "text-gray-700 hover:text-[#FFB915]"
                  }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-[-6px] left-0 right-0 h-1 bg-[#FFB915] rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div>
            {/* <Link
            to="/contact"
            className="bg-[#FFB915] hover:bg-[#2C4A6B] text-white py-2 px-6 rounded-full transition-colors font-medium shadow-sm hover:shadow-md"
          >
            Contact Us
          </Link> */}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={Logo} alt="" className="h-12 w-12" />
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className="menu-toggle p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFB915]"
            aria-label="Toggle menu"
          >
            <FaBars className={`h-6 w-6 text-gray-700 ${open ? 'hidden' : 'block'}`} />
            <FaTimes className={`h-6 w-6 text-gray-700 ${open ? 'block' : 'hidden'}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 md:hidden z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-4/5 max-w-xs bg-white shadow-lg z-50 mobile-menu-container md:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="text-2xl font-bold text-[#FFB915]">
                  <img src={Logo} alt="" className="h-12 w-12" />
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFB915]"
                  aria-label="Close menu"
                >
                  <FaTimes className="h-6 w-6 text-gray-700" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto py-4">
                <ul className="space-y-2 px-4">
                  {navLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className={`block py-3 px-4 rounded-md font-medium ${isActive(link.path)
                          ? "bg-[#FFB915]/10 text-[#FFB915]"
                          : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 border-t">
                <Link to="/testimonials">Testimonials</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;