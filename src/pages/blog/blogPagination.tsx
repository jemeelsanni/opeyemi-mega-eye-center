// Add this to your BlogDetail.tsx file

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { blogApi } from "../../api/apiClient";

interface Blog {
    _id: string;
    title: string;
}

interface PaginationProps {
    currentBlogId: string;
}

const BlogPagination: React.FC<PaginationProps> = ({ currentBlogId }) => {
    const [prevBlog, setPrevBlog] = useState<{ _id: string; title: string } | null>(null);
    const [nextBlog, setNextBlog] = useState<{ _id: string; title: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdjacentBlogs = async () => {
            try {
                // Fetch all blogs to find the current one's position
                interface ApiResponse {
                    data?: {
                        data?: Blog[];
                    } | Blog[];
                }

                const response = await blogApi.getAllBlogs(1, 100) as ApiResponse;

                // Determine if we have a valid response with blogs
                let allBlogs: Blog[] = [];

                if (Array.isArray(response)) {
                    allBlogs = response;
                } else if (response && response.data) {
                    if (Array.isArray(response.data)) {
                        allBlogs = response.data;
                    } else if (response.data.data && Array.isArray(response.data.data)) {
                        allBlogs = response.data.data;
                    }
                }

                if (allBlogs.length > 0) {
                    // Find the index of the current blog
                    const currentIndex = allBlogs.findIndex(blog => blog._id === currentBlogId);

                    if (currentIndex > 0) {
                        // There is a previous blog
                        const prev = allBlogs[currentIndex - 1];
                        setPrevBlog({
                            _id: prev._id,
                            title: prev.title
                        });
                    } else {
                        setPrevBlog(null);
                    }

                    if (currentIndex < allBlogs.length - 1 && currentIndex !== -1) {
                        // There is a next blog
                        const next = allBlogs[currentIndex + 1];
                        setNextBlog({
                            _id: next._id,
                            title: next.title
                        });
                    } else {
                        setNextBlog(null);
                    }
                }
            } catch (error) {
                console.error("Error fetching adjacent blogs:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (currentBlogId) {
            fetchAdjacentBlogs();
        }
    }, [currentBlogId]);

    if (isLoading || (!prevBlog && !nextBlog)) {
        return null; // Don't show anything while loading or if there are no adjacent blogs
    }

    return (
        <div className="my-8 border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
                {prevBlog ? (
                    <Link
                        to={`/blogDetail/${prevBlog._id}`}
                        className="flex items-center text-gray-600 hover:text-[#FFB915] transition-colors mb-4 md:mb-0"
                    >
                        <FaArrowLeft className="mr-2" />
                        <div>
                            <span className="block text-sm text-gray-500">Previous Article</span>
                            <span className="font-medium">{prevBlog.title.length > 40 ? `${prevBlog.title.substring(0, 40)}...` : prevBlog.title}</span>
                        </div>
                    </Link>
                ) : (
                    <div></div> // Empty div to maintain layout when there's no previous blog
                )}

                <button
                    onClick={() => navigate('/blog')}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                    All Posts
                </button>

                {nextBlog ? (
                    <Link
                        to={`/blogDetail/${nextBlog._id}`}
                        className="flex items-center text-gray-600 hover:text-[#FFB915] transition-colors mt-4 md:mt-0 md:text-right"
                    >
                        <div>
                            <span className="block text-sm text-gray-500">Next Article</span>
                            <span className="font-medium">{nextBlog.title.length > 40 ? `${nextBlog.title.substring(0, 40)}...` : nextBlog.title}</span>
                        </div>
                        <FaArrowRight className="ml-2" />
                    </Link>
                ) : (
                    <div></div> // Empty div to maintain layout when there's no next blog
                )}
            </div>
        </div>
    );
};

export default BlogPagination;