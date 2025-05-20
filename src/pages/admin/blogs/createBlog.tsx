import React, { useState, useEffect, useCallback } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import { blogApi } from "../../../api/apiClient";
import Footer from "../../../layout/footer";
import { FaTimes, FaSave, FaArrowLeft, FaClock, FaImage } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import AdminLayout from "../../../layout/adminLayout";


// Define toolbar options
const modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image", "video"],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
    ["clean"],
  ],
};

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "link",
  "image",
  "video",
  "align",
  "color",
  "background",
];

interface BlogResponse {
  _id: string;
  title: string;
  description: string;
  content: string;
  readDuration?: string;
  tags?: string[];
  featuredImage?: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  readDuration?: string;
  content?: string;
}

const CreateBlog: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [readDuration, setReadDuration] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [quillHeight, setQuillHeight] = useState("350px");
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  // Handle window resize for responsive editor height
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setQuillHeight("250px");
      } else {
        setQuillHeight("350px");
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle unsaved changes
  useEffect(() => {
    if (title || description || content || readDuration) {
      setIsSaved(false);
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSaved) {
        const message = "You have unsaved changes. Are you sure you want to leave?";
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [title, description, content, readDuration, isSaved]);

  // Fetch blog data when editing
  useEffect(() => {
    if (isEditing) {
      const fetchBlog = async () => {
        setLoading(true);
        try {
          const response = await blogApi.getBlog(id!);
          const blog = response as unknown as BlogResponse;
          setTitle(blog.title);
          setDescription(blog.description);
          setContent(blog.content);
          setReadDuration(blog.readDuration || "");
          setTags(blog.tags || []);
          setFeaturedImage(blog.featuredImage || undefined);
          setIsSaved(true);
        } catch (error) {
          console.error("Error fetching blog:", error);
          setSuccessMessage("Error loading blog post.");
          setTimeout(() => navigate("/admin/blogs"), 2000);
        } finally {
          setLoading(false);
        }
      };
      fetchBlog();
    }
  }, [id, isEditing, navigate]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (description.length > 300) {
      newErrors.description = "Description should be less than 300 characters";
      isValid = false;
    }

    if (!readDuration.trim()) {
      newErrors.readDuration = "Read duration is required";
      isValid = false;
    }

    if (!content.trim()) {
      newErrors.content = "Content is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Estimate read time based on content
  const estimateReadTime = useCallback(() => {
    if (!content) return "";

    const text = content.replace(/<[^>]*>/g, '');
    const wordsPerMinute = 225;
    const wordCount = text.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);

    return `${readTime} min read`;
  }, [content]);

  // Auto-calculate read time when content changes
  useEffect(() => {
    if (content && !readDuration) {
      const estimatedTime = estimateReadTime();
      if (estimatedTime) {
        setReadDuration(estimatedTime);
      }
    }
  }, [content, readDuration, estimateReadTime]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingImage(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      try {
        const formData = new FormData();
        formData.append('image', file);

        interface UploadResponse {
          url: string;
        }

        const response: UploadResponse = await blogApi.uploadImage(file);
        setImageUploadProgress(100);

        setFeaturedImage(response.url);
      } catch (error) {
        console.error('Error uploading image:', error);
        setSuccessMessage('Failed to upload image');
      } finally {
        setUploadingImage(false);
        setImageUploadProgress(0);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    setLoading(true);
    const blogData = {
      title,
      description,
      content,
      readDuration,
      tags,
      featuredImage,
      author: user?._id
    };

    try {
      if (isEditing) {
        await blogApi.updateBlog(id!, blogData);
        setSuccessMessage("Blog updated successfully!");
      } else {
        await blogApi.createBlog(blogData);
        setSuccessMessage("Blog created successfully!");
      }

      setIsSaved(true);
      setTimeout(() => {
        navigate("/admin/blogs");
      }, 1500);
    } catch (error: Error | unknown) {
      let errorMessage = `Error ${isEditing ? "updating" : "creating"} blog.`;
      if (error && typeof error === 'object' && 'response' in error &&
        error.response && typeof error.response === 'object' &&
        'data' in error.response && error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data) {
        errorMessage = error.response.data.message as string;
      }
      setSuccessMessage(errorMessage);
      console.error("Error saving blog:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isSaved && !window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
      return;
    }
    navigate("/admin/blogs");
  };

  const clearFieldError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: undefined
      });
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 flex flex-col">


        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <button
                  onClick={handleCancel}
                  className="mr-4 text-gray-600 hover:text-gray-800 transition-colors flex items-center"
                >
                  <FaArrowLeft className="mr-2" />
                  Back
                </button>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
                </h1>
              </div>

              <div>
                {!isSaved && (
                  <span className="text-amber-600 text-sm mr-3">
                    Unsaved changes
                  </span>
                )}
              </div>
            </div>

            {successMessage && (
              <div className={`mb-6 p-4 rounded shadow-sm ${successMessage.includes("Error") ? "bg-red-100 border-l-4 border-red-500 text-red-700" : "bg-green-100 border-l-4 border-green-500 text-green-700"}`}>
                {successMessage}
              </div>
            )}

            {loading && !isEditing ? (
              <div className="flex justify-center py-12">
                <svg className="animate-spin h-12 w-12 text-[#FFB915]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 md:p-8">
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        clearFieldError('title');
                      }}
                      placeholder="Enter an engaging title"
                      className={`w-full p-3 border rounded-lg ${errors.title
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-[#FFB915]"
                        } focus:outline-none focus:ring-2 focus:ring-[#FFB915] transition-colors`}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description <span className="text-red-500">*</span>
                      <span className="text-gray-500 text-xs ml-2">
                        (This appears in blog previews)
                      </span>
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        clearFieldError('description');
                      }}
                      placeholder="Write a brief description of your blog post"
                      rows={3}
                      className={`w-full p-3 border rounded-lg ${errors.description
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-[#FFB915]"
                        } focus:outline-none focus:ring-2 focus:ring-[#FFB915] transition-colors`}
                    />
                    <div className="flex justify-between mt-1">
                      {errors.description ? (
                        <p className="text-sm text-red-600">{errors.description}</p>
                      ) : (
                        <p className="text-xs text-gray-500">
                          {300 - description.length} characters remaining
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="readDuration"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        <div className="flex items-center">
                          <FaClock className="mr-2 text-[#FFB915]" />
                          Read Duration <span className="text-red-500">*</span>
                        </div>
                      </label>
                      <div className="flex items-center">
                        <input
                          id="readDuration"
                          type="text"
                          value={readDuration}
                          onChange={(e) => {
                            setReadDuration(e.target.value);
                            clearFieldError('readDuration');
                          }}
                          placeholder="e.g., 5 min read"
                          className={`w-full p-3 border rounded-lg ${errors.readDuration
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 focus:border-[#FFB915]"
                            } focus:outline-none focus:ring-2 focus:ring-[#FFB915] transition-colors`}
                        />
                        <button
                          type="button"
                          onClick={() => setReadDuration(estimateReadTime())}
                          className="ml-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                        >
                          Auto-calculate
                        </button>
                      </div>
                      {errors.readDuration && (
                        <p className="mt-1 text-sm text-red-600">{errors.readDuration}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={tags.join(',')}
                        onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()))}
                        placeholder="technology, programming, web"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FFB915] focus:outline-none focus:ring-2 focus:ring-[#FFB915] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center">
                        <FaImage className="mr-2 text-[#FFB915]" />
                        Featured Image
                      </div>
                    </label>
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-[#FFB915] file:text-white
                hover:file:bg-[#008787]"
                    />
                    {uploadingImage && (
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-[#FFB915] h-2.5 rounded-full"
                          style={{ width: `${imageUploadProgress}%` }}
                        ></div>
                        <p className="text-xs text-gray-500 mt-1">
                          Uploading: {imageUploadProgress}%
                        </p>
                      </div>
                    )}
                    {(imagePreview || featuredImage) && (
                      <div className="mt-2">
                        <img
                          src={imagePreview || featuredImage || ''}
                          alt="Preview"
                          className="h-40 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="content"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Content <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`${errors.content
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                        } border rounded-lg overflow-hidden`}
                    >
                      <ReactQuill
                        id="content"
                        value={content}
                        onChange={(value) => {
                          setContent(value);
                          clearFieldError('content');
                        }}
                        modules={modules}
                        formats={formats}
                        placeholder="Write your blog content here..."
                        style={{ height: quillHeight }}
                      />
                    </div>
                    {errors.content && (
                      <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Use the toolbar above to format your content, add links, images, and more.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center"
                    >
                      <FaTimes className="mr-2" />
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-6 py-3 rounded-lg text-white flex items-center justify-center ${loading
                        ? "bg-[#FFC266] cursor-not-allowed"
                        : "bg-[#FFB915] hover:bg-[#2C4A6B] hover:shadow-md"
                        } transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FFB915] focus:ring-offset-2`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {isEditing ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2" />
                          {isEditing ? "Update Blog" : "Create Blog"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </AdminLayout>

  );
};

export default CreateBlog;