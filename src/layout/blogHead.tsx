import { Link, useLocation } from "react-router-dom";
import { FaPen, FaList, FaHome } from "react-icons/fa";

const BlogHead = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and title */}
          <div className="flex items-center mb-4 md:mb-0">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-[#FFB915]">OMEC</span>
            </Link>
            <span className="ml-4 pl-4 border-l border-gray-300 text-xl font-medium text-gray-700">
              Blog Management
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            <Link
              to="/"
              className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
            >
              <FaHome className="mr-2" />
              <span>Back to Site</span>
            </Link>

            <Link
              to="/create-blog"
              className={`px-4 py-2 rounded-md flex items-center transition-colors ${isActive('/create-blog')
                ? "bg-[#FFB915]/10 text-[#FFB915]"
                : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <FaPen className="mr-2" />
              <span>Create</span>
            </Link>

            <Link
              to="/"
              className={`px-4 py-2 rounded-md flex items-center transition-colors ${isActive('/')
                ? "bg-[#FFB915]/10 text-[#FFB915]"
                : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <FaList className="mr-2" />
              <span>Blog List</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default BlogHead;