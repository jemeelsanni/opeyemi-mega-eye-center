// pages/admin/blogs/blogviewer.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AdminLayout from "../../../layout/adminLayout";
import apiClient from "../../../api/apiClient";
import { FaCalendarAlt, FaClock, FaArrowLeft, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import BlogContentPreview from "../../../components/common/blogContentPreview"; // Adjust the path as needed


interface Blog {
    _id: string;
    title: string;
    readDuration: string;
    createdAt: string;
    updatedAt: string;
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
}

const AdminBlogViewer: React.FC = () => {
    const { blogId } = useParams<{ blogId: string }>();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const navigate = useNavigate();

    // Fetch blog data when component mounts or blogId changes
    useEffect(() => {
        fetchBlog();
    }, [blogId]);

    const fetchBlog = async () => {
        if (!blogId) {
            setError("Blog ID is missing");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log(`Fetching blog with ID: ${blogId}`);

            // Try to fetch the blog using admin endpoint
            const response = await apiClient.get(`/admin/blogs/${blogId}`);

            if (response.data && response.data.data) {
                console.log("Blog data received:", response.data.data);
                setBlog(response.data.data);
            } else {
                console.error("Invalid response format:", response);
                setError("Blog not found or invalid response format");
            }
        } catch (error: unknown) {
            console.error("Error fetching blog:", error);

            if (error && typeof error === 'object' && 'response' in error && error.response &&
                typeof error.response === 'object' && 'data' in error.response && 'status' in error.response) {
                console.error("Error response data:", error.response.data);
                console.error("Error response status:", error.response.status);

                if (error.response.status === 404) {
                    setError("The blog post you're looking for could not be found");
                } else if (error.response.status === 403) {
                    setError("You don't have permission to view this blog post");
                } else {
                    const responseData = error.response.data as { message?: string };
                    const message = responseData.message || "An error occurred";
                    setError(`Server error: ${message}`);
                }
            } else if (error && typeof error === 'object' && 'request' in error) {
                setError("Server did not respond. Please check your connection and try again.");
            } else {
                const errorMessage = error instanceof Error ? error.message : "Failed to load blog post";
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoBack = () => {
        navigate('/admin/blogs');
    };

    const confirmDelete = () => {
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!blog) return;

        try {
            await apiClient.delete(`/blogs/${blog._id}`);
            setShowDeleteModal(false);
            navigate('/admin/blogs');
        } catch (error: unknown) {
            console.error("Error deleting blog:", error);
            if (error && typeof error === 'object' && 'response' in error) {
                const errorResponse = error.response as { data?: { message?: string } };
                setError(`Failed to delete blog: ${errorResponse.data?.message || 'Unknown error'}`);
            } else if (error instanceof Error) {
                setError(`Failed to delete blog: ${error.message}`);
            } else {
                setError('Failed to delete blog: Unknown error occurred');
            }
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFB915]"></div>
                    <p className="ml-4 text-gray-600">Loading blog post...</p>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-6">
                        <button
                            onClick={handleGoBack}
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Blog List
                        </button>
                    </div>

                    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!blog) {
        return null;
    }

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6 flex justify-between items-center">
                    <button
                        onClick={handleGoBack}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Blog List
                    </button>

                    <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">ID: {blog._id}</span>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Admin actions bar */}
                    <div className="bg-gray-100 p-4 flex flex-wrap justify-between items-center gap-2">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Admin Controls</h2>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Link
                                to={`/admin/edit-blog/${blog._id}`}
                                className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md transition-colors"
                            >
                                <FaEdit className="mr-2" />
                                Edit
                            </Link>

                            <Link
                                to={`/blogDetail/${blog._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md transition-colors"
                            >
                                <FaEye className="mr-2" />
                                View Public
                            </Link>

                            <button
                                onClick={confirmDelete}
                                className="inline-flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md transition-colors"
                            >
                                <FaTrash className="mr-2" />
                                Delete
                            </button>
                        </div>
                    </div>

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

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                            {blog.title}
                        </h1>

                        <div className="flex flex-wrap items-center text-gray-500 mb-6 gap-4">
                            <div className="flex items-center">
                                <FaCalendarAlt className="mr-2 text-[#FFB915]" />
                                <span>
                                    Created: {formatDate(blog.createdAt)}
                                </span>
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

                    {/* Stats */}
                    <div className="p-6 md:p-10 border-t border-gray-100 flex justify-between items-center">
                        <div className="text-gray-600">
                            {blog.viewCount} {blog.viewCount === 1 ? 'view' : 'views'}
                        </div>
                        <div className="text-gray-600">
                            {blog.likes?.length || 0} {blog.likes?.length === 1 ? 'like' : 'likes'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            aria-hidden="true"
                            onClick={() => setShowDeleteModal(false)}
                        ></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <FaTrash className="h-5 w-5 text-red-600" />
                                    </div>

                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            Delete Blog
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to delete this blog? This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>

                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB915] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminBlogViewer;