// pages/blog/BlogList.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../layout/header";
import Navbar from "../../layout/navbar";
import Footer from "../../layout/footer";
import {
  FaCalendarAlt,
  FaClock,
  FaArrowRight,
  FaArrowLeft,
  FaSearch,
  FaThumbsUp,
  FaComment,
  FaEye,
  FaTag,
  FaEnvelope
} from "react-icons/fa";
import { motion } from "framer-motion";
import { blogApi } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";

interface Comment {
  _id: string;
  text: string;  // Changed from 'content' to match API response
  user: {
    _id: string;
    fullName: string;
  };
  createdAt: string;
}

interface Blog {
  _id: string;
  title: string;
  description: string;
  readDuration: string;
  createdAt: string;
  viewCount: number;
  likes: string[];
  comments: Comment[];
  tags: string[];
  author: {
    _id: string;
    fullName: string;
  };
  featuredImage?: string;
}

const BlogList: React.FC = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [featuredBlog, setFeaturedBlog] = useState<Blog | null>(null);
  const [latestBlogs, setLatestBlogs] = useState<Blog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [blogsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [email, setEmail] = useState("");
  const [likedBlogs, setLikedBlogs] = useState<{ [key: string]: boolean }>({});
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    message: string;
    type: "success" | "error" | "";
  }>({ message: "", type: "" });

  // Fetch blogs and initialize liked status
  useEffect(() => {
    fetchBlogs();
    fetchLatestBlogs();

    // Initialize liked blogs from local storage if available
    const savedLikes = localStorage.getItem('likedBlogs');
    if (savedLikes) {
      setLikedBlogs(JSON.parse(savedLikes));
    }
  }, [currentPage, selectedTag]);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      setError("");

      console.log(`Fetching blogs - page ${currentPage}, limit ${blogsPerPage}`);
      const response = await blogApi.getAllBlogs(currentPage, blogsPerPage, searchTerm, selectedTag);
      console.log("API Response:", response);

      // Handle the response properly - the API now returns a PaginatedResponse<BlogItem>
      if (response) {
        setBlogs(response.data);
        setTotalPages(response.totalPages);

        // Set featured blog if available
        if (currentPage === 1 && response.data.length > 0) {
          setFeaturedBlog(response.data[0]);
        } else if (currentPage !== 1) {
          // Don't clear the featured blog when paginating
        } else {
          setFeaturedBlog(null);
        }
      } else {
        setBlogs([]);
        setTotalPages(1);
        setFeaturedBlog(null);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Failed to load blog posts. Please try again later.");
      setBlogs([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };


  const fetchLatestBlogs = async () => {
    try {
      const response = await blogApi.getAllBlogs(1, 5);
      if (response && Array.isArray(response)) {
        setLatestBlogs(response);
      } else {
        setLatestBlogs([]);
      }
    } catch (err) {
      console.error("Error fetching latest blogs:", err);
      setLatestBlogs([]);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogs();
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag === selectedTag ? "" : tag);
    setCurrentPage(1);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setSubscriptionStatus({
        message: "Please enter a valid email address",
        type: "error"
      });
      return;
    }

    try {
      await blogApi.subscribeToNewsletter(email);

      setSubscriptionStatus({
        message: "Thank you for subscribing to our newsletter!",
        type: "success"
      });
      setEmail("");
    } catch (err) {
      console.error("Error subscribing to newsletter:", err);
      setSubscriptionStatus({
        message: "Failed to subscribe. Please try again.",
        type: "error"
      });
    }

    // Clear success message after delay
    if (subscriptionStatus.type === "success") {
      setTimeout(() => {
        setSubscriptionStatus({ message: "", type: "" });
      }, 5000);
    }
  };

  const handleLike = async (blogId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event bubbling

    if (!user) {
      alert("Please log in to like this blog");
      return;
    }

    try {
      // Optimistic UI update
      const isCurrentlyLiked = likedBlogs[blogId] || false;

      // Update local state immediately for instant feedback
      setLikedBlogs(prev => ({
        ...prev,
        [blogId]: !isCurrentlyLiked
      }));

      // Update local storage
      localStorage.setItem('likedBlogs', JSON.stringify({
        ...likedBlogs,
        [blogId]: !isCurrentlyLiked
      }));

      // Update blogs state
      setBlogs(prev =>
        prev.map(blog => {
          if (blog._id === blogId) {
            const liked = isCurrentlyLiked;
            return {
              ...blog,
              likes: liked
                ? blog.likes.filter(id => id !== user._id)
                : [...blog.likes, user._id]
            };
          }
          return blog;
        })
      );

      // Also update featured blog if it's the same
      if (featuredBlog && featuredBlog._id === blogId) {
        const liked = isCurrentlyLiked;
        setFeaturedBlog({
          ...featuredBlog,
          likes: liked
            ? featuredBlog.likes.filter(id => id !== user._id)
            : [...featuredBlog.likes, user._id]
        });
      }

      // Make API call to update server
      await blogApi.likeBlog(blogId);

    } catch (err) {
      console.error("Error liking blog:", err);
      // Revert on error
      setLikedBlogs(prev => ({
        ...prev,
        [blogId]: !prev[blogId]
      }));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const isLikedByUser = (blog: Blog): boolean => {
    if (!user) return false;
    return likedBlogs[blog._id] || false;
  };

  // Get unique tags from all blogs
  const getAllTags = () => {
    const tagSet = new Set<string>();
    blogs.forEach(blog => {
      if (blog.tags && Array.isArray(blog.tags)) {
        blog.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Navbar />

      {/* Hero Banner with Featured Blog */}
      {featuredBlog && (
        <div className="relative bg-cover bg-center py-16"
          style={{
            backgroundImage: featuredBlog.featuredImage
              ? `url(${featuredBlog.featuredImage})`
              : "url(https://i.ibb.co/DYWWBXH/national-cancer-institute-L8t-WZT4-Cc-VQ-unsplash.jpg)",
            backgroundColor: '#1a1a2e'
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  OMEC Blog
                </h2>
                <p className="text-xl text-white max-w-2xl mx-auto">
                  Stay updated with our latest eye care tips, news, and special offers.                </p>
              </motion.div>

            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-10 md:py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Blog Posts Column */}
          <div className="w-full lg:w-2/3">
            {/* Search Bar */}
            <div className="mb-8">
              <form onSubmit={handleSearch} className="flex">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-[#FFB915] focus:border-[#FFB915]"
                    placeholder="Search blog posts..."
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#FFB915] hover:bg-[#2C4A6B] text-white font-medium py-3 px-6 rounded-r-lg transition-colors"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Active Tag Filter */}
            {selectedTag && (
              <div className="mb-4 flex items-center">
                <span className="mr-2 text-gray-600">Filtering by:</span>
                <div className="bg-[#FFB915] text-white px-3 py-1 rounded-full text-sm flex items-center">
                  {selectedTag}
                  <button
                    onClick={() => setSelectedTag("")}
                    className="ml-2 text-white hover:text-gray-200"
                    aria-label="Clear tag filter"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFB915]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
                {error}
              </div>
            ) : blogs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-xl text-gray-700 mb-2">No blog posts found</p>
                <p className="text-gray-500">
                  {searchTerm
                    ? `No results matching "${searchTerm}"`
                    : selectedTag
                      ? `No blogs with tag "${selectedTag}"`
                      : "Check back soon for new content!"}
                </p>
                {(searchTerm || selectedTag) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedTag("");
                      fetchBlogs();
                    }}
                    className="mt-4 text-[#FFB915] hover:text-[#008787] font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-8">
                  {blogs.map((blog, index) => (
                    <motion.article
                      key={blog._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      <Link to={`/blogDetail/${blog._id}`} className="block p-6">
                        <div className="md:flex">
                          {blog.featuredImage && (
                            <div className="md:w-1/3 mb-4 md:mb-0 md:mr-6">
                              <img
                                src={blog.featuredImage}
                                alt={blog.title}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            </div>
                          )}
                          <div className={blog.featuredImage ? "md:w-2/3" : "w-full"}>
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">
                              {blog.title}
                            </h2>

                            <div className="flex flex-wrap items-center text-gray-500 mb-3 gap-4">
                              <div className="flex items-center">
                                <FaCalendarAlt className="mr-2 text-[#FFB915]" />
                                <span>{formatDate(blog.createdAt)}</span>
                              </div>

                              <div className="flex items-center">
                                <FaClock className="mr-2 text-[#FFB915]" />
                                <span>{blog.readDuration}</span>
                              </div>

                              <div className="flex items-center text-gray-500">
                                <FaEye className="mr-2 text-[#FFB915]" />
                                <span>{blog.viewCount} views</span>
                              </div>

                              <div
                                className="hidden items-center text-gray-500 cursor-pointer"
                                onClick={(e) => handleLike(blog._id, e)}
                              >
                                <FaThumbsUp
                                  className={`mr-2 ${isLikedByUser(blog) ? "text-[#FFB915]" : "text-gray-400"}`}
                                />
                                <span>{blog.likes.length} likes</span>
                              </div>

                              <div className="hidden items-center text-gray-500">
                                <FaComment className="mr-2 text-[#FFB915]" />
                                <span>{blog.comments?.length || 0} comments</span>
                              </div>
                            </div>

                            <p className="text-gray-600 mb-4 line-clamp-3">
                              {blog.description}
                            </p>

                            <div className="flex flex-wrap justify-between items-center">
                              <span className="inline-flex items-center text-[#FFB915] hover:text-[#008787] font-medium transition-colors">
                                Read More <FaArrowRight className="ml-2" />
                              </span>
                              <div className="flex items-center">
                                {blog.author && (
                                  <span className="text-sm text-gray-500 mr-3">
                                    By {blog.author.fullName || "Admin"}
                                  </span>
                                )}

                                {/* Display up to 2 tags inline */}
                                <div className="flex space-x-2">
                                  {blog.tags && blog.tags.slice(0, 2).map((tag, i) => (
                                    <span
                                      key={i}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleTagSelect(tag);
                                      }}
                                      className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${selectedTag === tag
                                        ? "bg-[#FFB915] text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        } cursor-pointer`}
                                    >
                                      <FaTag className="mr-1 text-xs" />
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>

                {/* Ultra Minimal Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="inline-flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(curr => Math.max(curr - 1, 1))}
                        disabled={currentPage === 1}
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-full border ${currentPage === 1
                          ? "border-gray-200 text-gray-300 cursor-not-allowed"
                          : "border-gray-300 text-gray-700 hover:border-[#FFB915] hover:text-[#FFB915]"
                          } transition-colors`}
                        aria-label="Previous page"
                      >
                        <FaArrowLeft className="h-4 w-4" />
                      </button>

                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {Math.max(totalPages, 1)}
                      </span>

                      <button
                        onClick={() => setCurrentPage(curr => Math.min(curr + 1, Math.max(totalPages, 1)))}
                        disabled={currentPage >= totalPages || blogs.length < blogsPerPage}
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-full border ${currentPage >= totalPages || blogs.length < blogsPerPage
                          ? "border-gray-200 text-gray-300 cursor-not-allowed"
                          : "border-gray-300 text-gray-700 hover:border-[#FFB915] hover:text-[#FFB915]"
                          } transition-colors`}
                        aria-label="Next page"
                      >
                        <FaArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-1/3 space-y-8">
            {/* Newsletter Signup */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-gray-600 mb-4">
                Stay updated with our latest eye care tips, news, and special offers.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB915] focus:border-[#FFB915]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#FFB915] hover:bg-[#2C4A6B] text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Subscribe
                </button>
              </form>

              {subscriptionStatus.message && (
                <div className={`mt-3 p-2 rounded-md text-sm ${subscriptionStatus.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}>
                  {subscriptionStatus.message}
                </div>
              )}
            </div>

            {/* Latest Posts */}
            <div className="bg-white rounded-lg shadow-md p-6 hidden">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
                Latest Posts
              </h3>
              <div className="space-y-4 mt-4">
                {latestBlogs.slice(0, 5).map((blog) => (
                  <Link key={blog._id} to={`/blogDetail/${blog._id}`} className="block group">
                    <div className="flex items-start py-2">
                      {blog.featuredImage && (
                        <img
                          src={blog.featuredImage}
                          alt={blog.title}
                          className="w-16 h-16 object-cover rounded mr-3"
                        />
                      )}
                      <div>
                        <h4 className="font-medium text-gray-800 group-hover:text-[#FFB915] transition-colors line-clamp-2">
                          {blog.title}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <FaCalendarAlt className="mr-1 text-[#FFB915]" size={10} />
                          <span>{formatDate(blog.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2 mt-4">
                {getAllTags().map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => handleTagSelect(tag)}
                    className={`px-3 py-1 ${selectedTag === tag
                      ? "bg-[#FFB915] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } rounded-full text-sm transition-colors flex items-center`}
                  >
                    <FaTag className="mr-1 text-xs" />
                    {tag}
                  </button>
                ))}

                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag("")}
                    className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-full text-sm transition-colors"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogList;