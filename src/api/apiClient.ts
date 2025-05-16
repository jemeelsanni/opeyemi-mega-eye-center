// api/apiClient.ts
import axios from 'axios';

// Define base URL based on environment
const isProduction = window.location.hostname !== 'localhost';
const baseURL = isProduction
  ? 'https://omec-backend.onrender.com/api'  // Production API
  : 'http://localhost:5003/api';            // Development API

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Set a reasonable timeout
});

// Add a request interceptor to include the auth token in requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle 401 Unauthorized errors by redirecting to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Avoid redirecting during API calls on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Blog specific API methods for frontend use
export interface Comment {
  user: { _id: string; fullName: string; };
  _id: string;
  text: string;
  author: {
    _id: string;
    fullName: string;
  };
  replies: Array<{
    user: { _id: string; fullName: string; };
    _id: string;
    text: string;
    author: {
      _id: string;
      fullName: string;
    };
    createdAt: string;
  }>;
  createdAt: string;
}

export interface BlogItem {
  _id: string;
  title: string;
  content: string;
  description: string;
  readDuration: string;
  createdAt: string;
  updatedAt?: string;
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

interface CreateBlogData {
  title: string;
  content: string;
  description: string;
  readDuration: string;
  tags?: string[];
  featuredImage?: string;
  author?: string;
}

interface CommentData {
  text: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  map: (callback: (value: T, index: number, array: T[]) => T) => T[];
}

interface BlogApi {
  subscribeToNewsletter(email: string): unknown;
  getAllBlogs: (page?: number, limit?: number, search?: string, tag?: string) => Promise<PaginatedResponse<BlogItem>>;
  getBlog: (id: string) => Promise<BlogItem>;
  getAdminBlogs: (page?: number, limit?: number) => Promise<unknown>;
  getAdminBlog: (id: string) => Promise<unknown>;
  createBlog: (blogData: CreateBlogData) => Promise<unknown>;
  updateBlog: (id: string, blogData: Partial<CreateBlogData>) => Promise<unknown>;
  deleteBlog: (id: string) => Promise<unknown>;
  uploadImage: (file: File) => Promise<{ url: string }>;
  likeBlog: (id: string) => Promise<unknown>;
  addComment: (id: string, commentData: CommentData) => Promise<unknown>;
  addReply: (blogId: string, commentId: string, text: string) => Promise<unknown>;
}

const blogApi: BlogApi = {
  // Subscribe to newsletter
  subscribeToNewsletter: (email: string) => {
    return apiClient.post('/newsletter', { email });
  },

  // Get all blogs (public)
  getAllBlogs: async (page = 1, limit = 10, search = '', tag = '') => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    if (search) queryParams.append('search', search);
    if (tag) queryParams.append('tag', tag);
    
    try {
      const response = await apiClient.get(`/blogs?${queryParams.toString()}`);
      
      // Check response structure and return data in a consistent format
      if (response.data && Array.isArray(response.data)) {
        return {
          data: response.data,
          total: response.data.length,
          page,
          totalPages: Math.ceil(response.data.length / limit),
          map: Array.prototype.map.bind(response.data)
        };
      } 
      else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return {
          data: response.data.data,
          total: response.data.total || response.data.data.length,
          page: response.data.page || page,
          totalPages: response.data.totalPages || response.data.pages || Math.ceil(response.data.data.length / limit),
          map: Array.prototype.map.bind(response.data.data)
        };
      }
      else {
        console.warn("Unexpected API response format:", response.data);
        return {
          data: [],
          total: 0,
          page: 1,
          totalPages: 1,
          map: Array.prototype.map.bind([])
        };
      }
    } catch (error) {
      console.error("Error in getAllBlogs:", error);
      throw error;
    }
  },
  
  // Get single blog (public)
  getBlog: async (id: string): Promise<BlogItem> => {
    if (!id) {
      console.error("Blog ID is required");
      return Promise.reject(new Error('Blog ID is required'));
    }
    
    console.group("getBlog API Call");
    console.log(`Fetching blog with ID: ${id}`);
    
    try {
      const response = await apiClient.get(`/blogs/${id}`);
      
      console.log("getBlog response status:", response.status);
      console.log("getBlog response type:", typeof response.data);
      
      // Check the response structure
      if (response.data) {
        if (response.data.data && typeof response.data.data === 'object') {
          // Response has nested data property
          console.log("Response has nested data property");
          console.log("Blog data keys:", Object.keys(response.data.data));
          console.groupEnd();
          return response.data.data;
        } else if (response.data._id) {
          // Direct blog object
          console.log("Response has direct blog object");
          console.log("Blog data keys:", Object.keys(response.data));
          console.groupEnd();
          return response.data;
        } else {
          console.error("Unexpected response structure:", response.data);
          console.groupEnd();
          return Promise.reject(new Error('Invalid blog data structure'));
        }
      } else {
        console.error("No data in response");
        console.groupEnd();
        return Promise.reject(new Error('No data in response'));
      }
    } catch (error) {
      console.error("Error in getBlog:", error);
      console.groupEnd();
      return Promise.reject(error);
    }
  },
  
  // Admin: Get all blogs
  getAdminBlogs: (page = 1, limit = 10) => {
    return apiClient.get(`/admin/blogs?page=${page}&limit=${limit}`);
  },
  
  // Admin: Get single blog
  getAdminBlog: (id) => {
    if (!id) {
      return Promise.reject(new Error('Blog ID is required'));
    }
    console.log(`Fetching admin blog with ID: ${id}`);
    return apiClient.get(`/admin/blogs/${id}`);
  },
  
  // Create new blog
  createBlog: (blogData) => {
    return apiClient.post('/blogs', blogData);
  },
  
  // Update existing blog
  updateBlog: (id, blogData) => {
    return apiClient.put(`/blogs/${id}`, blogData);
  },
  
  // Delete blog
  deleteBlog: (id) => {
    return apiClient.delete(`/blogs/${id}`);
  },
  
  // Upload featured image
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('featuredImage', file);
    return apiClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Like/Unlike a blog
  likeBlog: (id) => {
    return apiClient.post(`/blogs/${id}/like`);
  },
  
  // Comment on a blog
  addComment: (id, text) => {
    return apiClient.post(`/blogs/${id}/comments`, { text });
  },
  
  // Reply to a comment
  addReply: (blogId, commentId, text) => {
    return apiClient.post(`/blogs/${blogId}/comments/${commentId}/replies`, { text });
  }
};

// Newsletter subscription
const subscribeToNewsletter = (email: string) => {
  return apiClient.post('/newsletter', { email });
};

// Appointment interface
interface AppointmentData {
  name: string;
  email: string;
  phone: string;
  date: string;
  service: string;
  message?: string;
}

// Service appointments
const bookAppointment = (appointmentData: AppointmentData) => {
  return apiClient.post('/appointments', appointmentData);
};

// Contact form interface
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Contact form
const sendContactMessage = (contactData: ContactFormData) => {
  return apiClient.post('/contact', contactData);
};

export { 
  blogApi, 
  subscribeToNewsletter, 
  bookAppointment, 
  sendContactMessage 
};

export default apiClient;