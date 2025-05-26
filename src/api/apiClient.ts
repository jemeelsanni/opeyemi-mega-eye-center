// api/apiClient.ts - Complete API client with all methods
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
  timeout: 30000, // Increased timeout for email operations
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
      localStorage.removeItem('userRole');
      
      // Get the current path
      const currentPath = window.location.pathname;
      
      // Redirect to appropriate login page
      if (currentPath.startsWith('/doctor')) {
        if (!window.location.pathname.includes('/doctor/login')) {
          window.location.href = '/doctor/login';
        }
      } else {
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

//======================================================================
// EMAIL SYSTEM INTERFACES
//======================================================================

export interface EmailTemplate {
  _id: string;
  name: string;
  description: string;
  category: 'newsletter' | 'appointment' | 'promotional' | 'notification' | 'welcome' | 'reminder' | 'custom';
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: EmailVariable[];
  thumbnail?: string;
  isActive: boolean;
  usageCount: number;
  createdBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EmailVariable {
  name: string;
  description: string;
  type: 'text' | 'number' | 'date' | 'url' | 'email';
  required: boolean;
  defaultValue?: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  sentAt?: string;
  deliveredAt?: string;
  failureReason?: string;
}

export interface EmailAttachment {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface Email {
  _id: string;
  sender: {
    _id: string;
    fullName: string;
    email: string;
  };
  recipients: EmailRecipient[];
  subject: string;
  content: string;
  htmlContent?: string;
  template: string;
  attachments: EmailAttachment[];
  priority: 'low' | 'normal' | 'high';
  scheduledFor?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  openRate: number;
  clickRate: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EmailAnalytics {
  totalEmails: number;
  totalRecipients: number;
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  avgOpenRate: number;
  avgClickRate: number;
}

//======================================================================
// UPDATED EMAIL SYSTEM API METHODS
//======================================================================

const emailApi = {
  // Email campaigns - Admin routes
  getAllEmails: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    template?: string;
    startDate?: string;
    endDate?: string;
    sender?: string; // Admin can filter by sender
  } = {}) => {
    const response = await apiClient.get('/mailer/admin/emails', { params });
    return response.data;
  },

  getEmailById: async (id: string) => {
    const response = await apiClient.get(`/mailer/admin/emails/${id}`);
    return response.data;
  },

  sendEmail: async (emailData: {
    recipients: string | Array<{email: string; name?: string}>;
    subject: string;
    content: string;
    htmlContent?: string;
    template?: string;
    priority?: 'low' | 'normal' | 'high';
    scheduledFor?: string;
    attachments?: File[];
  }) => {
    const formData = new FormData();
    
    // Handle recipients
    const recipientsData = typeof emailData.recipients === 'string' 
      ? emailData.recipients 
      : JSON.stringify(emailData.recipients);
    formData.append('recipients', recipientsData);
    
    // Add other fields
    formData.append('subject', emailData.subject);
    formData.append('content', emailData.content);
    
    if (emailData.htmlContent) {
      formData.append('htmlContent', emailData.htmlContent);
    }
    
    if (emailData.template) {
      formData.append('template', emailData.template);
    }
    
    if (emailData.priority) {
      formData.append('priority', emailData.priority);
    }
    
    if (emailData.scheduledFor) {
      formData.append('scheduledFor', emailData.scheduledFor);
    }
    
    // Add attachments
    if (emailData.attachments && emailData.attachments.length > 0) {
      emailData.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }

    const response = await apiClient.post('/mailer/admin/emails', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  resendEmail: async (id: string) => {
    const response = await apiClient.post(`/mailer/admin/emails/${id}/resend`);
    return response.data;
  },

  getEmailAnalytics: async (params: {
    startDate?: string;
    endDate?: string;
  } = {}) => {
    const response = await apiClient.get('/mailer/admin/analytics', { params });
    return response.data;
  },

  testEmailConfig: async () => {
    const response = await apiClient.post('/mailer/test');
    return response.data;
  },

  // Email templates - Admin routes
  getAllTemplates: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    isActive?: boolean; // Admin can see inactive templates
  } = {}) => {
    const response = await apiClient.get('/mailer/admin/templates', { params });
    return response.data;
  },

  getTemplateById: async (id: string) => {
    const response = await apiClient.get(`/mailer/admin/templates/${id}`);
    return response.data;
  },

  createTemplate: async (templateData: {
    name: string;
    description: string;
    category: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    variables?: EmailVariable[];
    thumbnail?: File;
  }) => {
    const formData = new FormData();
    
    // Add template data
    Object.keys(templateData).forEach(key => {
      if (key === 'variables') {
        formData.append(key, JSON.stringify(templateData[key] || []));
      } else if (key === 'thumbnail' && templateData[key]) {
        formData.append(key, templateData[key] as File);
      } else if (key !== 'thumbnail') {
        formData.append(key, templateData[key as keyof typeof templateData] as string);
      }
    });

    const response = await apiClient.post('/mailer/admin/templates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateTemplate: async (id: string, templateData: Partial<{
    name: string;
    description: string;
    category: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    variables: EmailVariable[];
    thumbnail: File;
    isActive: boolean; // Admin can activate/deactivate templates
  }>) => {
    const formData = new FormData();
    
    // Add template data
    Object.keys(templateData).forEach(key => {
      if (key === 'variables') {
        formData.append(key, JSON.stringify(templateData[key] || []));
      } else if (key === 'thumbnail' && templateData[key]) {
        formData.append(key, templateData[key] as File);
      } else if (key === 'isActive') {
        formData.append(key, String(templateData[key]));
      } else if (key !== 'thumbnail' && templateData[key as keyof typeof templateData] !== undefined) {
        formData.append(key, templateData[key as keyof typeof templateData] as string);
      }
    });

    const response = await apiClient.put(`/mailer/admin/templates/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteTemplate: async (id: string) => {
    const response = await apiClient.delete(`/mailer/admin/templates/${id}`);
    return response.data;
  },

  sendTemplateEmail: async (templateId: string, data: {
    recipients: Array<{email: string; name?: string}>;
    variables?: Record<string, string>;
    scheduledFor?: string;
  }) => {
    const response = await apiClient.post(`/mailer/admin/emails/template/${templateId}`, data);
    return response.data;
  },

  // Quick recipient loading (unchanged)
  loadSubscribers: async () => {
    const response = await apiClient.get('/newsletter/subscribers');
    return response.data;
  },

  loadPatients: async () => {
    const response = await apiClient.get('/appointments/patients');
    return response.data;
  },

  // User-specific email methods (for regular users, not admin)
  user: {
    getAllEmails: async (params: {
      page?: number;
      limit?: number;
      status?: string;
      template?: string;
      startDate?: string;
      endDate?: string;
    } = {}) => {
      const response = await apiClient.get('/mailer/emails', { params });
      return response.data;
    },

    getEmailAnalytics: async (params: {
      startDate?: string;
      endDate?: string;
    } = {}) => {
      const response = await apiClient.get('/mailer/analytics', { params });
      return response.data;
    },

    getAllTemplates: async (params: {
      page?: number;
      limit?: number;
      category?: string;
      search?: string;
    } = {}) => {
      const response = await apiClient.get('/mailer/templates', { params });
      return response.data;
    },

    getTemplateById: async (id: string) => {
      const response = await apiClient.get(`/mailer/templates/${id}`);
      return response.data;
    }
  }
};

//======================================================================
// APPOINTMENT API METHODS
//======================================================================

// Doctor appointments API
const doctorAppointmentApi = {
  // Get doctor's appointments (with filtering)
  getAppointments: async (status?: string, date?: string) => {
    let url = '/appointments/doctor';
    const params = new URLSearchParams();
    
    if (status && status !== 'all') params.append('status', status);
    if (date) params.append('date', date);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await apiClient.get(url);
    return response.data;
  },
  
  // Get appointment details
  getAppointment: async (id: string) => {
    const response = await apiClient.get(`/appointments/doctor/${id}`);
    return response.data;
  },
  
  // Update appointment status
  updateAppointmentStatus: async (id: string, status: 'confirmed' | 'cancelled') => {
    const response = await apiClient.put(`/appointments/doctor/${id}`, { status });
    return response.data;
  },
  
  // Get today's appointments
  getTodayAppointments: async () => {
    const response = await apiClient.get('/appointments/doctor/today');
    return response.data;
  },
  
  // Get appointment stats
  getAppointmentStats: async () => {
    const response = await apiClient.get('/appointments/doctor/stats');
    return response.data;
  }
};

// Admin appointment API
const adminAppointmentApi = {
  // Get all appointments (with filtering)
  getAllAppointments: async (page = 1, limit = 10, filters: any = {}) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    let url = `/appointments/admin?page=${page}&limit=${limit}`;
    
    // Add filters to URL if provided
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.date) url += `&date=${filters.date}`;
    if (filters.physician) url += `&physician=${encodeURIComponent(filters.physician)}`;
    
    const response = await apiClient.get(url);
    return response.data;
  },
  
  // Get a specific appointment
  getAppointment: async (id: string) => {
    const response = await apiClient.get(`/appointments/admin/${id}`);
    return response.data;
  },
  
  // Update appointment status
  updateAppointmentStatus: async (id: string, status: 'confirmed' | 'cancelled') => {
    const response = await apiClient.put(`/appointments/admin/${id}`, { status });
    return response.data;
  },
  
  // Send custom email to patient
  sendEmailToPatient: async (id: string, subject: string, message: string) => {
    const response = await apiClient.post(`/appointments/admin/${id}/send-email`, { subject, message });
    return response.data;
  }
};

// Patient appointment API
interface AppointmentInputData {
  fullName: string;
  phoneNumber: string;
  email: string;
  isHmoRegistered: string; // 'yes' or 'no'
  hmoName?: string;
  hmoNumber?: string;
  hasPreviousVisit: string; // 'yes' or 'no'
  medicalRecordNumber?: string;
  briefHistory?: string;
  appointmentDate: string;
  appointmentTime: string;
  doctorId: string;
}

const patientAppointmentApi = {
  // Book a new appointment
  bookAppointment: async (appointmentData: AppointmentInputData) => {
    const response = await apiClient.post('/appointments', appointmentData);
    return response.data;
  },
  
  // Get patient's appointments by email
  getAppointmentsByEmail: async (email: string) => {
    const response = await apiClient.get(`/appointments/patient?email=${encodeURIComponent(email)}`);
    return response.data;
  }
};

//======================================================================
// DOCTOR API METHODS
//======================================================================

// Doctor profile interface
interface DoctorProfileData {
  name?: string;
  speciality?: string;
  phoneNumber?: string;
  bio?: string;
}

// Doctor API methods
const doctorApi = {
  // Doctor login
  login: (email: string, password: string) => {
    return apiClient.post('/doctors/login', { email, password });
  },

  // Get doctor profile
  getProfile: () => {
    return apiClient.get('/doctors/profile');
  },

  // Update doctor profile
  updateProfile: (profileData: DoctorProfileData) => {
    return apiClient.put('/doctors/profile', profileData);
  },

  // Change doctor password
  changePassword: (currentPassword: string, newPassword: string) => {
    return apiClient.put('/doctors/profile/password', { currentPassword, newPassword });
  },

  // Get doctor availability
  getAvailability: () => {
    return apiClient.get('/doctors/availability');
  },

  // Update doctor availability
  updateAvailability: (date: string, slots: Array<{ time: string; isAvailable: boolean }>) => {
    return apiClient.post('/doctors/availability', { date, slots });
  },

  getVapidPublicKey: async () => {
    try {
      const response = await apiClient.get('/doctors/vapid-public-key');
      return response.data;
    } catch (error) {
      console.error('Error getting VAPID public key:', error);
      return {
        success: false,
        message: 'Failed to get VAPID public key',
        publicKey: null
      };
    }
  },

  savePushSubscription: async (subscription: PushSubscriptionJSON) => {
    try {
      const response = await apiClient.post('/doctors/push-subscription', { subscription });
      return response.data;
    } catch (error) {
      console.error('Error saving push subscription:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save push subscription'
      };
    }
  },

  deletePushSubscription: async () => {
    try {
      const response = await apiClient.delete('/doctors/push-subscription');
      return response.data;
    } catch (error) {
      console.error('Error deleting push subscription:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete push subscription'
      };
    }
  },

  // Appointments - Using the dedicated appointment API
  appointments: doctorAppointmentApi
};

// Admin doctor management API
const adminDoctorApi = {
  // Get all doctors
  getAllDoctors: () => {
    return apiClient.get('/doctors/admin');
  },

  // Get single doctor
  getDoctor: (id: string) => {
    return apiClient.get(`/doctors/admin/${id}`);
  },

  // Create new doctor
  createDoctor: (doctorData: {
    name: string;
    email: string;
    password: string;
    speciality: string;
    phoneNumber?: string;
    bio?: string;
    isActive?: boolean;
  }) => {
    return apiClient.post('/doctors/admin', doctorData);
  },

  // Update doctor
  updateDoctor: (id: string, doctorData: {
    name?: string;
    email?: string;
    password?: string;
    speciality?: string;
    phoneNumber?: string;
    bio?: string;
    isActive?: boolean;
  }) => {
    return apiClient.put(`/doctors/admin/${id}`, doctorData);
  },

  // Update doctor status (active/inactive)
  updateDoctorStatus: (id: string, isActive: boolean) => {
    return apiClient.put(`/doctors/admin/${id}/status`, { isActive });
  },

  // Delete doctor
  deleteDoctor: (id: string) => {
    return apiClient.delete(`/doctors/admin/${id}`);
  }
};

// Public doctor API
const publicDoctorApi = {
  // Get all active doctors
  getAllDoctors: () => {
    return apiClient.get('/doctors/public');
  },
  
  // Get a single doctor
  getDoctor: (id: string) => {
    return apiClient.get(`/doctors/public/${id}`);
  },
  
  // Get doctor's available dates
  getDoctorAvailableDates: (id: string) => {
    return apiClient.get(`/doctors/${id}/availability`);
  },
  
  // Get doctor's available time slots for a specific date
  getDoctorAvailableTimeSlots: (id: string, date: string) => {
    return apiClient.get(`/doctors/${id}/availability/${date}`);
  }
};

//======================================================================
// BLOG API METHODS
//======================================================================

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
    
    try {
      const response = await apiClient.get(`/blogs/${id}`);
      
      // Check the response structure
      if (response.data) {
        if (response.data.data && typeof response.data.data === 'object') {
          return response.data.data;
        } else if (response.data._id) {
          return response.data;
        } else {
          console.error("Unexpected response structure:", response.data);
          return Promise.reject(new Error('Invalid blog data structure'));
        }
      } else {
        console.error("No data in response");
        return Promise.reject(new Error('No data in response'));
      }
    } catch (error) {
      console.error("Error in getBlog:", error);
      return Promise.reject(error);
    }
  },
  
  // Admin: Get all blogs
  getAdminBlogs: (page = 1, limit = 10) => {
    return apiClient.get(`/admin/blogs?page=${page}&limit=${limit}`);
  },
  
  // Admin: Get single blog
  getAdminBlog: (id: string) => {
    if (!id) {
      return Promise.reject(new Error('Blog ID is required'));
    }
    return apiClient.get(`/admin/blogs/${id}`);
  },
  
  // Create new blog
  createBlog: (blogData: CreateBlogData) => {
    return apiClient.post('/blogs', blogData);
  },
  
  // Update existing blog
  updateBlog: (id: string, blogData: Partial<CreateBlogData>) => {
    return apiClient.put(`/blogs/${id}`, blogData);
  },
  
  // Delete blog
  deleteBlog: (id: string) => {
    return apiClient.delete(`/blogs/${id}`);
  },
  
  // Upload featured image
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('featuredImage', file);
    return apiClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Like/Unlike a blog
  likeBlog: (id: string) => {
    return apiClient.post(`/blogs/${id}/like`);
  },
  
  // Comment on a blog
  addComment: (id: string, commentData: CommentData) => {
    return apiClient.post(`/blogs/${id}/comments`, commentData);
  },
  
  // Reply to a comment
  addReply: (blogId: string, commentId: string, text: string) => {
    return apiClient.post(`/blogs/${blogId}/comments/${commentId}/replies`, { text });
  }
};

//======================================================================
// TESTIMONIAL API METHODS
//======================================================================

export interface Testimonial {
  _id: string;
  rating: number;
  review: string;
  name: string;
  position: string;
  image?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface TestimonialFormData {
  rating: number;
  review: string;
  name: string;
  position: string;
  image?: File | null;
}

const testimonialApi = {
  // Get all approved testimonials
  getAllTestimonials: async () => {
    const response = await apiClient.get('/testimonials');
    return response.data;
  },
  
  // Get recent testimonials (10)
  getRecentTestimonials: async () => {
    const response = await apiClient.get('/testimonials/recent');
    return response.data;
  },
  
  // Submit a new testimonial
  submitTestimonial: async (data: TestimonialFormData) => {
    const formData = new FormData();
    formData.append('rating', data.rating.toString());
    formData.append('review', data.review);
    formData.append('name', data.name);
    formData.append('position', data.position);
    
    if (data.image) {
      formData.append('image', data.image);
    }
    
    const response = await apiClient.post('/testimonials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  },
  
  // Admin: Get all testimonials including unapproved
  getAllAdminTestimonials: async () => {
    const response = await apiClient.get('/testimonials/admin');
    return response.data;
  },
  
  // Admin: Get pending testimonials
  getPendingTestimonials: async () => {
    const response = await apiClient.get('/testimonials/admin/pending');
    return response.data;
  },
  
  // Admin: Approve a testimonial
  approveTestimonial: async (id: string) => {
    const response = await apiClient.put(`/testimonials/admin/${id}/approve`);
    return response.data;
  },
  
  // Admin: Reject a testimonial
  rejectTestimonial: async (id: string) => {
    const response = await apiClient.put(`/testimonials/admin/${id}/reject`);
    return response.data;
  },
  
  // Admin: Delete a testimonial
  deleteTestimonial: async (id: string) => {
    const response = await apiClient.delete(`/testimonials/admin/${id}`);
    return response.data;
  },
  
  // Admin: Update a testimonial
  updateTestimonial: async (id: string, data: Partial<TestimonialFormData>) => {
    const formData = new FormData();
    
    if (data.rating !== undefined) {
      formData.append('rating', data.rating.toString());
    }
    
    if (data.review !== undefined) {
      formData.append('review', data.review);
    }
    
    if (data.name !== undefined) {
      formData.append('name', data.name);
    }
    
    if (data.position !== undefined) {
      formData.append('position', data.position);
    }
    
    if (data.image) {
      formData.append('image', data.image);
    }
    
    const response = await apiClient.put(`/testimonials/admin/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  }
};

//======================================================================
// EVENT API METHODS
//======================================================================

export interface EventFormData {
  title: string;
  description: string;
  shortDescription: string;
  eventDate: string;
  eventTime: string;
  location: string;
  address: string;
  featured?: boolean;
  status?: 'upcoming' | 'ongoing' | 'past';
  registrationLink?: string;
  registrationRequired?: boolean;
  capacity?: number;
  coverImage?: File | null;
  removeCoverImage?: boolean;
  galleryImages?: File[];
  removeGalleryImages?: number[];
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  eventDate: string;
  eventTime: string;
  location: string;
  address: string;
  featured: boolean;
  status: 'upcoming' | 'ongoing' | 'past';
  registrationLink?: string;
  registrationRequired: boolean;
  capacity?: number;
  coverImage?: string;
  gallery: string[];
  galleryWithCaptions?: Array<{
    url: string;
    caption?: string;
  }>;
  galleryCaptions?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

const eventApi = {
  // Get all events or filtered by status
  getAllEvents: async (status?: string, featured?: boolean) => {
    let url = '/events';
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    if (featured) params.append('featured', 'true');
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await apiClient.get(url);
    return response.data;
  },
  
  // Get upcoming events
  getUpcomingEvents: async () => {
    const response = await apiClient.get('/events?status=upcoming');
    return response.data;
  },
  
  // Get past events
  getPastEvents: async () => {
    const response = await apiClient.get('/events?status=past');
    return response.data;
  },
  
  // Get featured events
  getFeaturedEvents: async () => {
    const response = await apiClient.get('/events?featured=true');
    return response.data;
  },
  
  // Get single event
  getEvent: async (id: string) => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },
  
  // Admin API calls
  admin: {
    // Get all events (admin)
    getAllEvents: async () => {
      const response = await apiClient.get('/events/admin');
      return response.data;
    },
    
    // Create event
    createEvent: async (eventData: EventFormData) => {
      const formData = new FormData();
      
      // Add all fields except files
      Object.entries(eventData).forEach(([key, value]) => {
        if (key !== 'coverImage' && key !== 'galleryImages' && value !== undefined) {
          if (typeof value === 'boolean') {
            formData.append(key, value.toString());
          } else if (value !== null) {
            formData.append(key, value as string);
          }
        }
      });
      
      // Add cover image if provided
      if (eventData.coverImage) {
        formData.append('coverImage', eventData.coverImage);
      }
      
      // Add gallery images if provided
      if (eventData.galleryImages && eventData.galleryImages.length > 0) {
        eventData.galleryImages.forEach(image => {
          formData.append('images', image);
        });
      }
      
      const response = await apiClient.post('/events/admin', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    },
    
    // Update event
    updateEvent: async (id: string, eventData: Partial<EventFormData>) => {
      const formData = new FormData();
      
      // Add all fields
      Object.entries(eventData).forEach(([key, value]) => {
        if (key !== 'coverImage' && value !== undefined) {
          if (typeof value === 'boolean') {
            formData.append(key, value.toString());
          } else if (value !== null) {
            formData.append(key, value as string);
          }
        }
      });
      
      // Add cover image if provided
      if (eventData.coverImage) {
        formData.append('coverImage', eventData.coverImage);
      }
      
      // Add removeCoverImage flag if needed
      if (eventData.removeCoverImage) {
        formData.append('removeCoverImage', 'true');
      }
      
      const response = await apiClient.put(`/events/admin/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    },
    
    // Delete event
    deleteEvent: async (id: string) => {
      const response = await apiClient.delete(`/events/admin/${id}`);
      return response.data;
    },
    
    // Update event status
    updateEventStatus: async (id: string, status: 'upcoming' | 'ongoing' | 'past') => {
      const response = await apiClient.put(`/events/admin/${id}/status`, { status });
      return response.data;
    },
    
    // Add images to gallery
    addGalleryImages: async (id: string, images: File[]) => {
      const formData = new FormData();
      
      images.forEach(image => {
        formData.append('images', image);
      });
      
      const response = await apiClient.post(`/events/admin/${id}/gallery`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    },
    
    // Remove image from gallery
    removeGalleryImage: async (id: string, imageIndex: number) => {
      const response = await apiClient.delete(`/events/admin/${id}/gallery/${imageIndex}`);
      return response.data;
    },

    updateGalleryOrder: async (id: string, galleryOrder: string[]) => {
      const response = await apiClient.put(`/events/admin/${id}/gallery/order`, { gallery: galleryOrder });
      return response.data;
    },

    // Add caption to gallery image
    addGalleryCaption: async (id: string, imageIndex: number, caption: string) => {
      const response = await apiClient.put(`/events/admin/${id}/gallery/${imageIndex}/caption`, { caption });
      return response.data;
    },

    // Get gallery images with captions
    getGalleryWithCaptions: async (id: string) => {
      const response = await apiClient.get(`/events/admin/${id}/gallery`);
      return response.data;
    }
  }
};

//======================================================================
// NEWSLETTER/SUBSCRIBER API METHODS
//======================================================================

const subscriberApi = {
  getAllSubscribers: async (params: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  } = {}) => {
    const response = await apiClient.get('/newsletter/subscribers', { params });
    return response.data;
  },

  updateSubscriberStatus: async (id: string, isActive: boolean) => {
    const response = await apiClient.put(`/newsletter/subscribers/${id}`, { isActive });
    return response.data;
  },

  subscribe: async (email: string) => {
    const response = await apiClient.post('/newsletter', { email });
    return response.data;
  },

  unsubscribe: async (email: string) => {
    const response = await apiClient.post('/newsletter/unsubscribe', { email });
    return response.data;
  }
};

//======================================================================
// HELPER METHODS
//======================================================================

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

//======================================================================
// SYSTEM HEALTH API METHODS
//======================================================================

const systemApi = {
  getHealthStatus: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  getEmailHealthStatus: async () => {
    const response = await apiClient.get('/email-health');
    return response.data;
  },

  getDbHealthStatus: async () => {
    const response = await apiClient.get('/db-health');
    return response.data;
  }
};

//======================================================================
// ADMIN API CONSOLIDATION
//======================================================================

// Create an admin API object for convenience
const adminApi = {
  // Email system
  email: emailApi,
  
  // Existing systems
  doctors: adminDoctorApi,
  appointments: adminAppointmentApi,
  subscribers: subscriberApi,
  events: eventApi.admin,
  testimonials: {
    getAll: testimonialApi.getAllAdminTestimonials,
    getPending: testimonialApi.getPendingTestimonials,
    approve: testimonialApi.approveTestimonial,
    reject: testimonialApi.rejectTestimonial,
    delete: testimonialApi.deleteTestimonial,
    update: testimonialApi.updateTestimonial
  },
  
  // System health
  system: systemApi,
};

//======================================================================
// EXPORT ALL API METHODS
//======================================================================

export { 
  // Email system APIs
  emailApi,
  subscriberApi,
  systemApi,
  
  // Main API objects
  blogApi, 
  doctorApi,
  adminApi,
  publicDoctorApi,
  testimonialApi,
  eventApi,
  
  // Appointment APIs
  doctorAppointmentApi,
  adminAppointmentApi,
  patientAppointmentApi,
  
  // Helper methods
  sendContactMessage,
  
  // Types are already exported from Part 1
};

export default apiClient;