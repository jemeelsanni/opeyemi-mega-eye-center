// pages/blog/BlogDetail.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { blogApi } from "../../api/apiClient";
import Header from "../../layout/header";
import Navbar from "../../layout/navbar";
import Footer from "../../layout/footer";
import {
  FaCalendarAlt,
  FaClock,
  FaArrowLeft,
  FaShare,
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaEnvelope,
  FaExclamationTriangle,
  FaThumbsUp,
  FaComment,
  FaEye,
  FaPaperPlane,
  FaUser
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import BlogContentPreview from "../../components/common/blogContentPreview";

interface Comment {
  _id?: string;
  user: {
    _id: string;
    fullName: string;
  };
  text: string;
  createdAt: string;
  replies: {
    _id?: string;
    user?: {
      _id: string;
      fullName: string;
    };
    text: string;
    createdAt: string;
  }[];
}

interface Blog {
  _id: string;
  title: string;
  readDuration: string;
  createdAt: string;
  updatedAt?: string;  // Make updatedAt optional since it might be missing
  content: string;
  description: string;
  featuredImage?: string;
  tags: string[];
  author: {
    _id: string;
    fullName: string;
  };
  viewCount: number;
  likes: string[];
  comments: Comment[];
}

const BlogDetail: React.FC = () => {
  const { user } = useAuth();
  const { blogId } = useParams<{ blogId: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showShareButtons, setShowShareButtons] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState("");
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();

  // Fetch blog data
  useEffect(() => {
    const fetchBlog = async () => {
      if (!blogId) {
        setError("Blog ID is missing from the URL");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log(`Attempting to fetch blog with ID: ${blogId}`);
        const response = await blogApi.getBlog(blogId);

        if (response) {
          console.log("Blog data received:", response);
          const blogData = {
            ...response,
            updatedAt: response.updatedAt || response.createdAt, // fallback to createdAt if updatedAt is missing
            comments: response.comments.map(comment => ({
              ...comment,
              user: comment.user || { _id: '', fullName: 'Unknown User' },
              replies: comment.replies?.map(reply => ({
                ...reply,
                user: reply.user || { _id: '', fullName: 'Unknown User' }
              })) || []
            }))
          };
          setBlog(blogData as Blog);
          setLikeCount(blogData.likes.length);

          // Check if user has liked this blog
          if (user && blogData.likes.includes(user._id)) {
            setIsLiked(true);
          }
        } else {
          console.error("Invalid response format:", response);
          setNotFound(true);
          setError("Blog not found or invalid response format");
        }
      } catch (error: unknown) {
        console.error("Error fetching blog:", error);
        handleFetchError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlog();
  }, [blogId, user]);

  const handleFetchError = (error: unknown) => {
    // Type guard for axios error response
    interface ErrorResponse {
      response?: {
        data: {
          message?: string;
        };
        status: number;
      };
      request?: unknown;
    }

    // Check for specific error types
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as ErrorResponse;

      if (axiosError.response?.status === 404) {
        setNotFound(true);
        setError("The blog post you're looking for could not be found");
      } else if (axiosError.response?.status === 403) {
        setError("You don't have permission to view this blog post");
      } else {
        setError(`Server error: ${axiosError.response?.data.message || "Unknown error"}`);
      }
    } else if (error && typeof error === 'object' && 'request' in error) {
      setError("Server did not respond. Please check your connection and try again.");
    } else {
      const errorMessage = error instanceof Error ? error.message : "Failed to load blog post";
      setError(errorMessage);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLike = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    try {
      // Optimistic UI update
      setIsLiked(!isLiked);
      setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);

      // Send API request
      await blogApi.likeBlog(blogId!);
    } catch (error) {
      console.error("Error liking/unliking blog:", error);

      // Revert on error
      setIsLiked(!isLiked);
      setLikeCount(prevCount => isLiked ? prevCount + 1 : prevCount - 1);

      setError("Failed to update like status. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    if (!comment.trim()) return;

    try {
      // Optimistic UI update
      const newComment: Comment = {
        user: {
          _id: user._id,
          fullName: user.fullName || 'User',
        },
        text: comment,
        createdAt: new Date().toISOString(),
        replies: []
      };

      setBlog(prevBlog => {
        if (!prevBlog) return prevBlog;
        return {
          ...prevBlog,
          comments: [...prevBlog.comments, newComment]
        };
      });

      setComment("");

      // Send API request
      await blogApi.addComment(blogId!, { text: comment });
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleReply = async (commentId: string) => {
    if (!user) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    const replyContent = replyText[commentId];
    if (!replyContent || !replyContent.trim()) return;

    try {
      // Optimistic UI update
      const newReply = {
        user: {
          _id: user._id,
          fullName: user.fullName || 'User',
        },
        text: replyContent,
        createdAt: new Date().toISOString()
      };

      setBlog(prevBlog => {
        if (!prevBlog) return prevBlog;

        return {
          ...prevBlog,
          comments: prevBlog.comments.map(comment => {
            if (comment._id === commentId) {
              return {
                ...comment,
                replies: [...comment.replies, newReply]
              };
            }
            return comment;
          })
        };
      });

      // Reset form
      setReplyText({ ...replyText, [commentId]: '' });
      setReplyingTo(null);

      // Send API request (you'll need this endpoint)
      // await blogApi.addReply(blogId!, commentId, replyContent);
    } catch (error) {
      console.error("Error adding reply:", error);
      setError("Failed to add reply. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const shareUrl = window.location.href;
  const shareTitle = blog?.title || "Blog post";

  const shareLinks = [
    {
      name: "Facebook",
      icon: <FaFacebook />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: "bg-blue-600",
    },
    {
      name: "Twitter",
      icon: <FaTwitter />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      color: "bg-sky-500",
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp />,
      url: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} - ${shareUrl}`)}`,
      color: "bg-green-600",
    },
    {
      name: "Email",
      icon: <FaEnvelope />,
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`Check out this blog post: ${shareUrl}`)}`,
      color: "bg-gray-600",
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <Navbar />
        <div className="flex justify-center items-center py-16 flex-grow">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFB915]"></div>
          <p className="ml-4 text-gray-600">Loading blog post...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || notFound) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 md:px-6 md:py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-6">
              <FaExclamationTriangle className="text-5xl text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {notFound ? '404 - Blog Not Found' : 'Error Loading Blog'}
            </h2>
            <p className="text-gray-600 mb-6">
              {notFound
                ? "The blog post you're looking for could not be found. It may have been removed or the URL might be incorrect."
                : error || "We encountered an issue while trying to load this blog post. Please try again later."}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleGoBack}
                className="bg-[#FFB915] hover:bg-[#2C4A6B] text-white font-medium py-2 px-6 rounded-md transition-colors inline-flex items-center justify-center"
              >
                <FaArrowLeft className="mr-2" />
                Go Back
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md transition-colors inline-flex items-center justify-center"
              >
                Back to Home
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <div className="mb-6">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Blog
            </button>
          </div>

          {showLoginPrompt && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md">
              Please log in to interact with this blog post.
            </div>
          )}

          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Blog header */}
            <div className="p-6 md:p-10 border-b border-gray-100">
              {blog.featuredImage && (
                <div className="mb-6">
                  <img
                    src={blog.featuredImage}
                    alt={blog.title}
                    className="w-full h-auto rounded-lg object-cover"
                  />
                </div>
              )}

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold text-gray-800 mb-6"
              >
                {blog.title}
              </motion.h1>

              <div className="flex flex-wrap items-center text-gray-500 mb-6 gap-4">
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2 text-[#FFB915]" />
                  <span>{formatDate(blog.createdAt)}</span>
                </div>

                <div className="flex items-center">
                  <FaClock className="mr-2 text-[#FFB915]" />
                  <span>{blog.readDuration}</span>
                </div>

                {blog.author && (
                  <div className="flex items-center">
                    <span className="text-gray-600">By {blog.author.fullName}</span>
                  </div>
                )}
              </div>

              {blog.description && (
                <p className="text-lg text-gray-600 border-l-4 border-[#FFB915] pl-4 italic">
                  {blog.description}
                </p>
              )}
            </div>

            {/* Blog content */}
            <div className="p-6 md:p-10">
              <BlogContentPreview
                content={blog.content}
                className="prose-headings:text-gray-800 prose-headings:font-bold prose-a:text-[#FFB915] prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg"
              />
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="p-6 md:p-10 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interaction Section */}
            <div className="p-6 md:p-10 border-t border-gray-100">
              <div className="flex flex-wrap gap-4 justify-between items-center">
                <div className="flex gap-6">
                  {/* Like Button */}
                  <button
                    onClick={handleLike}
                    className="hidden items-center gap-2 text-gray-600 hover:text-[#FFB915] transition-colors"
                  >
                    <FaThumbsUp className={isLiked ? "text-[#FFB915]" : ""} />
                    <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
                  </button>

                  {/* Comments Counter */}
                  <div className="hidden items-center gap-2 text-gray-600">
                    <FaComment />
                    <span>{blog.comments.length} {blog.comments.length === 1 ? 'comment' : 'comments'}</span>
                  </div>

                  {/* Views Counter */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaEye />
                    <span>{blog.viewCount} {blog.viewCount === 1 ? 'view' : 'views'}</span>
                  </div>
                </div>

                {/* Share Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowShareButtons(!showShareButtons)}
                    className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors"
                  >
                    <FaShare className="mr-2" />
                    Share
                  </button>

                  {showShareButtons && (
                    <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-10">
                      <div className="p-2">
                        {shareLinks.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-2 hover:bg-gray-100 rounded transition-colors"
                          >
                            <span className={`${link.color} text-white p-2 rounded mr-3`}>
                              {link.icon}
                            </span>
                            <span>{link.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="p-6 md:p-10 border-t border-gray-100 hidden">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Comments ({blog.comments.length})</h3>

              {/* Comment Form */}
              <form onSubmit={handleAddComment} className="mb-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <FaUser className="text-gray-500" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB915] focus:border-[#FFB915] transition-colors"
                      rows={3}
                    ></textarea>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={!comment.trim()}
                        className={`inline-flex items-center py-2 px-4 rounded-md ${comment.trim()
                          ? "bg-[#FFB915] hover:bg-[#2C4A6B] text-white"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          } transition-colors`}
                      >
                        <FaPaperPlane className="mr-2" />
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              {blog.comments.length > 0 ? (
                <div className="space-y-6 hidden">
                  {blog.comments.map((comment, index) => (
                    <div key={comment._id || index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <FaUser className="text-gray-500" />
                          </div>
                        </div>
                        <div className="flex-grow">
                          <div className="flex flex-wrap justify-between">
                            <h4 className="font-medium text-gray-800">{comment.user.fullName}</h4>
                            <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-gray-600 mt-2">{comment.text}</p>

                          {/* Reply Button */}
                          <button
                            onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id || null)}
                            className="text-sm text-gray-500 hover:text-[#FFB915] mt-2 transition-colors"
                          >
                            Reply
                          </button>

                          {/* Reply Form */}
                          {replyingTo === comment._id && (
                            <div className="mt-3">
                              <textarea
                                value={replyText[comment._id || ''] || ''}
                                onChange={(e) => setReplyText({ ...replyText, [comment._id || '']: e.target.value })}
                                placeholder="Write a reply..."
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB915] focus:border-[#FFB915] text-sm"
                                rows={2}
                              ></textarea>
                              <div className="mt-2 flex justify-end space-x-2">
                                <button
                                  type="button"
                                  onClick={() => setReplyingTo(null)}
                                  className="py-1 px-3 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReply(comment._id || '')}
                                  disabled={!replyText[comment._id || '']?.trim()}
                                  className={`py-1 px-3 text-xs rounded-md ${replyText[comment._id || '']?.trim()
                                    ? "bg-[#FFB915] hover:bg-[#2C4A6B] text-white"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    } transition-colors`}
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 pl-6 border-l-2 border-gray-100 space-y-4">
                              {comment.replies.map((reply, rIndex) => (
                                <div key={reply._id || rIndex}>
                                  <div className="flex gap-3">
                                    <div className="flex-shrink-0">
                                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <FaUser className="text-gray-500 text-sm" />
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex flex-wrap justify-between">
                                        <h5 className="font-medium text-gray-800 text-sm">{reply.user?.fullName || 'Unknown User'}</h5>
                                        <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                                      </div>
                                      <p className="text-gray-600 text-sm mt-1">{reply.text}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg hidden">
                  <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetail;