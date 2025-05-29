// api/apiClient.ts - Complete API client with all methods (corrected)
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Define base URL based on environment
const isProduction = window.location.hostname !== 'localhost';
const baseURL = isProduction
  ? 'https://omec-backend.onrender.com/api'  // Production API
  : 'http://localhost:5003/api';            // Development API

// Create the main API client
const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // Increased timeout for better reliability
});

// Connection status tracking
const connectionStatus = {
  isOnline: navigator.onLine,
  dbConnected: true,
  lastHealthCheck: Date.now(),
  consecutiveFailures: 0
};

// Enhanced retry configuration
const retryConfig = {
  maxRetries: 3,
  retryDelay: 1000, // Base delay in milliseconds
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  networkErrorCodes: ['ECONNABORTED', 'ENOTFOUND', 'ECONNREFUSED', 'ENETUNREACH']
};

// Sleep function for delays
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// Check if error is retryable
const isRetryableError = (error: AxiosError): boolean => {
  // Network errors
  if (!error.response) {
    return retryConfig.networkErrorCodes.includes(error.code || '');
  }

  // HTTP status codes that should be retried
  const status = error.response.status;
  return retryConfig.retryableStatusCodes.includes(status);
};

// Enhanced error handler
const handleApiError = (error: AxiosError, url?: string) => {
  const errorInfo = {
    url,
    status: error.response?.status,
    message: error.message,
    code: error.code,
    timestamp: new Date().toISOString()
  };

  console.error('API Error:', errorInfo);

  // Track consecutive failures
  connectionStatus.consecutiveFailures++;

  // Handle specific error types
  if (error.response?.status === 503) {
    connectionStatus.dbConnected = false;
    throw new Error('Service temporarily unavailable. The database may be reconnecting. Please try again in a moment.');
  }

  if (error.response?.status === 502 || error.response?.status === 504) {
    throw new Error('Server is temporarily unavailable. Please try again in a few moments.');
  }

  if (!error.response && error.code === 'ECONNABORTED') {
    throw new Error('Request timed out. Please check your connection and try again.');
  }

  if (!error.response) {
    connectionStatus.isOnline = false;
    throw new Error('Network error. Please check your internet connection and try again.');
  }

  // Reset consecutive failures on successful response (even if error)
  if (error.response) {
    connectionStatus.consecutiveFailures = Math.max(0, connectionStatus.consecutiveFailures - 1);
  }

  return error;
};

// Retry function with exponential backoff
const retryRequest = async (
  config: AxiosRequestConfig,
  attemptNumber: number = 1
): Promise<AxiosResponse> => {
  try {
    const response = await axios(config);
    
    // Reset failure count on success
    connectionStatus.consecutiveFailures = 0;
    connectionStatus.isOnline = true;
    
    return response;
  } catch (error) {
    const axiosError = error as AxiosError;
    
    console.log(`Request attempt ${attemptNumber} failed:`, axiosError.message);

    // If we haven't exceeded max retries and error is retryable
    if (attemptNumber < retryConfig.maxRetries && isRetryableError(axiosError)) {
      const delay = retryConfig.retryDelay * Math.pow(2, attemptNumber - 1); // Exponential backoff
      console.log(`Retrying request in ${delay}ms...`);
      
      await sleep(delay);
      return retryRequest(config, attemptNumber + 1);
    }

    // Handle and throw the error
    throw handleApiError(axiosError, config.url);
  }
};

// Health check functions
const checkSystemHealth = async (): Promise<{
  system: boolean;
  database: boolean;
  timestamp: number;
}> => {
  try {
    const response = await axios.get(`${baseURL}/health`, { timeout: 10000 });
    const healthData = response.data;
    
    connectionStatus.dbConnected = healthData.database?.connected || false;
    connectionStatus.lastHealthCheck = Date.now();
    
    return {
      system: true,
      database: connectionStatus.dbConnected,
      timestamp: connectionStatus.lastHealthCheck
    };
  } catch (error) {
    console.error('Health check failed:', error);
    connectionStatus.lastHealthCheck = Date.now();
    
    return {
      system: false,
      database: false,
      timestamp: connectionStatus.lastHealthCheck
    };
  }
};

const checkDatabaseHealth = async (): Promise<{
  connected: boolean;
  readyState?: number;
  error?: string;
}> => {
  try {
    const response = await axios.get(`${baseURL}/db-health`, { timeout: 10000 });
    const dbHealth = response.data;
    
    connectionStatus.dbConnected = dbHealth.isConnected;
    
    return {
      connected: dbHealth.isConnected,
      readyState: dbHealth.readyState,
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    connectionStatus.dbConnected = false;
    
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

const forceReconnectDatabase = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await axios.post(`${baseURL}/db-reconnect`, {}, { timeout: 30000 });
    const result = response.data;
    
    if (result.success) {
      connectionStatus.dbConnected = true;
      connectionStatus.consecutiveFailures = 0;
    }
    
    return result;
  } catch (error) {
    console.error('Force reconnect failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Reconnection failed'
    };
  }
};

// Request interceptor with retry logic
apiClient.interceptors.request.use(
  async (config: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: Date.now() };

    // Check connection status before making request
    if (connectionStatus.consecutiveFailures > 5) {
      console.warn('Multiple consecutive failures detected. Checking health...');
      try {
        await checkSystemHealth();
      } catch (healthError) {
        console.error('Health check failed:', healthError);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with enhanced error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time for monitoring
    const startTime = (response.config as any).metadata?.startTime; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (startTime) {
      const duration = Date.now() - startTime;
      if (duration > 10000) { // Log slow requests (>10s)
        console.warn(`Slow request detected: ${response.config.url} took ${duration}ms`);
      }
    }

    // Reset failure count on successful response
    connectionStatus.consecutiveFailures = 0;
    connectionStatus.isOnline = true;
    
    return response;
  },
  async (error: AxiosError) => {
    console.error('API Response Error:', error);
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      
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
      return Promise.reject(error);
    }

    // If the original request can be retried, use retry logic
    if (error.config && isRetryableError(error)) {
      try {
        return await retryRequest(error.config);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    // Handle non-retryable errors
    handleApiError(error, error.config?.url);
    return Promise.reject(error);
  }
);

// Enhanced API with health monitoring
const enhancedApiClient = {
  ...apiClient,
  
  // Health monitoring methods
  health: {
    checkSystem: checkSystemHealth,
    checkDatabase: checkDatabaseHealth,
    forceReconnect: forceReconnectDatabase,
    getConnectionStatus: () => ({ ...connectionStatus })
  },

  // Enhanced request methods with automatic health checks
  async get(url: string, config?: AxiosRequestConfig) {
    try {
      return await apiClient.get(url, config);
    } catch (error) {
      // If database error, try to reconnect once
      if (error instanceof Error && error.message.includes('Database connection')) {
        console.log('Database connection issue detected, attempting reconnection...');
        const reconnectResult = await forceReconnectDatabase();
        
        if (reconnectResult.success) {
          console.log('Reconnection successful, retrying request...');
          return await apiClient.get(url, config);
        }
      }
      throw error;
    }
  },

  async post(url: string, data?: any, config?: AxiosRequestConfig) { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      return await apiClient.post(url, data, config);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Database connection')) {
        console.log('Database connection issue detected, attempting reconnection...');
        const reconnectResult = await forceReconnectDatabase();
        
        if (reconnectResult.success) {
          console.log('Reconnection successful, retrying request...');
          return await apiClient.post(url, data, config);
        }
      }
      throw error;
    }
  },

  async put(url: string, data?: any, config?: AxiosRequestConfig) { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      return await apiClient.put(url, data, config);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Database connection')) {
        console.log('Database connection issue detected, attempting reconnection...');
        const reconnectResult = await forceReconnectDatabase();
        
        if (reconnectResult.success) {
          console.log('Reconnection successful, retrying request...');
          return await apiClient.put(url, data, config);
        }
      }
      throw error;
    }
  },

  async delete(url: string, config?: AxiosRequestConfig) {
    try {
      return await apiClient.delete(url, config);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Database connection')) {
        console.log('Database connection issue detected, attempting reconnection...');
        const reconnectResult = await forceReconnectDatabase();
        
        if (reconnectResult.success) {
          console.log('Reconnection successful, retrying request...');
          return await apiClient.delete(url, config);
        }
      }
      throw error;
    }
  }
};

// Periodic health checks (every 2 minutes when active)
let healthCheckInterval: NodeJS.Timeout | null = null;

const startHealthMonitoring = () => {
  if (healthCheckInterval) return;
  
  healthCheckInterval = setInterval(async () => {
    // Only check if we've had recent failures or it's been a while
    const timeSinceLastCheck = Date.now() - connectionStatus.lastHealthCheck;
    
    if (connectionStatus.consecutiveFailures > 0 || timeSinceLastCheck > 300000) { // 5 minutes
      try {
        await checkSystemHealth();
      } catch (error) {
        console.error('Background health check failed:', error);
      }
    }
  }, 120000); // 2 minutes
};

const stopHealthMonitoring = () => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
};

// Monitor page visibility to pause/resume health checks
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopHealthMonitoring();
  } else {
    startHealthMonitoring();
    // Check health immediately when page becomes visible
    checkSystemHealth().catch(console.error);
  }
});

// Monitor online/offline status
window.addEventListener('online', () => {
  connectionStatus.isOnline = true;
  checkSystemHealth().catch(console.error);
});

window.addEventListener('offline', () => {
  connectionStatus.isOnline = false;
});

// Start monitoring
startHealthMonitoring();

//======================================================================
// INTERFACES AND TYPES
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

interface DoctorProfileData {
  name?: string;
  speciality?: string;
  phoneNumber?: string;
  bio?: string;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

//======================================================================
// EMAIL SYSTEM API METHODS
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
    sender?: string;
  } = {}) => {
    const response = await enhancedApiClient.get('/mailer/admin/emails', { params });
    return response.data;
  },

  getEmailById: async (id: string) => {
    const response = await enhancedApiClient.get(`/mailer/admin/emails/${id}`);
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
    
    const recipientsData = typeof emailData.recipients === 'string' 
      ? emailData.recipients 
      : JSON.stringify(emailData.recipients);
    formData.append('recipients', recipientsData);
    
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
    
    if (emailData.attachments && emailData.attachments.length > 0) {
      emailData.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }

    const response = await enhancedApiClient.post('/mailer/admin/emails', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  resendEmail: async (id: string) => {
    const response = await enhancedApiClient.post(`/mailer/admin/emails/${id}/resend`);
    return response.data;
  },

  getEmailAnalytics: async (params: {
    startDate?: string;
    endDate?: string;
  } = {}) => {
    const response = await enhancedApiClient.get('/mailer/admin/analytics', { params });
    return response.data;
  },

  testEmailConfig: async () => {
    const response = await enhancedApiClient.post('/mailer/test');
    return response.data;
  },

  // Email templates
  getAllTemplates: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    isActive?: boolean;
  } = {}) => {
    const response = await enhancedApiClient.get('/mailer/admin/templates', { params });
    return response.data;
  },

  getTemplateById: async (id: string) => {
    const response = await enhancedApiClient.get(`/mailer/admin/templates/${id}`);
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
    
    Object.keys(templateData).forEach(key => {
      if (key === 'variables') {
        formData.append(key, JSON.stringify(templateData[key] || []));
      } else if (key === 'thumbnail' && templateData[key]) {
        formData.append(key, templateData[key] as File);
      } else if (key !== 'thumbnail') {
        formData.append(key, templateData[key as keyof typeof templateData] as string);
      }
    });

    const response = await enhancedApiClient.post('/mailer/admin/templates', formData, {
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
    isActive: boolean;
  }>) => {
    const formData = new FormData();
    
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

    const response = await enhancedApiClient.put(`/mailer/admin/templates/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteTemplate: async (id: string) => {
    const response = await enhancedApiClient.delete(`/mailer/admin/templates/${id}`);
    return response.data;
  },

  sendTemplateEmail: async (templateId: string, data: {
    recipients: Array<{email: string; name?: string}>;
    variables?: Record<string, string>;
    scheduledFor?: string;
  }) => {
    const response = await enhancedApiClient.post(`/mailer/admin/emails/template/${templateId}`, data);
    return response.data;
  },

  loadSubscribers: async () => {
    const response = await enhancedApiClient.get('/newsletter/subscribers');
    return response.data;
  },

  loadPatients: async () => {
    const response = await enhancedApiClient.get('/appointments/patients');
    return response.data;
  },

  // User-specific email methods
  user: {
    getAllEmails: async (params: {
      page?: number;
      limit?: number;
      status?: string;
      template?: string;
      startDate?: string;
      endDate?: string;
    } = {}) => {
      const response = await enhancedApiClient.get('/mailer/emails', { params });
      return response.data;
    },

    getEmailAnalytics: async (params: {
      startDate?: string;
      endDate?: string;
    } = {}) => {
      const response = await enhancedApiClient.get('/mailer/analytics', { params });
      return response.data;
    },

    getAllTemplates: async (params: {
      page?: number;
      limit?: number;
      category?: string;
      search?: string;
    } = {}) => {
      const response = await enhancedApiClient.get('/mailer/templates', { params });
      return response.data;
    },

    getTemplateById: async (id: string) => {
      const response = await enhancedApiClient.get(`/mailer/templates/${id}`);
      return response.data;
    }
  }
};

//======================================================================
// APPOINTMENT API METHODS
//======================================================================

const doctorAppointmentApi = {
  getAppointments: async (status?: string, date?: string) => {
    let url = '/appointments/doctor';
    const params = new URLSearchParams();
    
    if (status && status !== 'all') params.append('status', status);
    if (date) params.append('date', date);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await enhancedApiClient.get(url);
    return response.data;
  },
  
  getAppointment: async (id: string) => {
    const response = await enhancedApiClient.get(`/appointments/doctor/${id}`);
    return response.data;
  },
  
  updateAppointmentStatus: async (id: string, status: 'confirmed' | 'cancelled') => {
    const response = await enhancedApiClient.put(`/appointments/doctor/${id}`, { status });
    return response.data;
  },
  
  getTodayAppointments: async () => {
    const response = await enhancedApiClient.get('/appointments/doctor/today');
    return response.data;
  },
  
  getAppointmentStats: async () => {
    const response = await enhancedApiClient.get('/appointments/doctor/stats');
    return response.data;
  }
};

const adminAppointmentApi = {
  getAllAppointments: async (page = 1, limit = 10, filters: any = {}) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    let url = `/appointments/admin?page=${page}&limit=${limit}`;
    
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.date) url += `&date=${filters.date}`;
    if (filters.physician) url += `&physician=${encodeURIComponent(filters.physician)}`;
    
    const response = await enhancedApiClient.get(url);
    return response.data;
  },
  
  getAppointment: async (id: string) => {
    const response = await enhancedApiClient.get(`/appointments/admin/${id}`);
    return response.data;
  },
  
  updateAppointmentStatus: async (id: string, status: 'confirmed' | 'cancelled') => {
    const response = await enhancedApiClient.put(`/appointments/admin/${id}`, { status });
    return response.data;
  },
  
  sendEmailToPatient: async (id: string, subject: string, message: string) => {
    const response = await enhancedApiClient.post(`/appointments/admin/${id}/send-email`, { subject, message });
    return response.data;
  }
};

const patientAppointmentApi = {
  bookAppointment: async (appointmentData: AppointmentInputData) => {
    const response = await enhancedApiClient.post('/appointments', appointmentData);
    return response.data;
  },
  
  getAppointmentsByEmail: async (email: string) => {
    const response = await enhancedApiClient.get(`/appointments/patient?email=${encodeURIComponent(email)}`);
    return response.data;
  }
};

// api/apiClient.ts - Part 2 (continued from part 1)

//======================================================================
// DOCTOR API METHODS (continued)
//======================================================================

const doctorApi = {
  login: (email: string, password: string) => {
    return enhancedApiClient.post('/doctors/login', { email, password });
  },

  getProfile: () => {
    return enhancedApiClient.get('/doctors/profile');
  },

  updateProfile: (profileData: DoctorProfileData) => {
    return enhancedApiClient.put('/doctors/profile', profileData);
  },

  changePassword: (currentPassword: string, newPassword: string) => {
    return enhancedApiClient.put('/doctors/profile/password', { currentPassword, newPassword });
  },

  getAvailability: () => {
    return enhancedApiClient.get('/doctors/availability');
  },

  updateAvailability: (date: string, slots: Array<{ time: string; isAvailable: boolean }>) => {
    return enhancedApiClient.post('/doctors/availability', { date, slots });
  },

  getVapidPublicKey: async () => {
    try {
      const response = await enhancedApiClient.get('/doctors/vapid-public-key');
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
      const response = await enhancedApiClient.post('/doctors/push-subscription', { subscription });
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
      const response = await enhancedApiClient.delete('/doctors/push-subscription');
      return response.data;
    } catch (error) {
      console.error('Error deleting push subscription:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete push subscription'
      };
    }
  },

  appointments: doctorAppointmentApi
};

const adminDoctorApi = {
  getAllDoctors: () => {
    return enhancedApiClient.get('/doctors/admin');
  },

  getDoctor: (id: string) => {
    return enhancedApiClient.get(`/doctors/admin/${id}`);
  },

  createDoctor: (doctorData: {
    name: string;
    email: string;
    password: string;
    speciality: string;
    phoneNumber?: string;
    bio?: string;
    isActive?: boolean;
  }) => {
    return enhancedApiClient.post('/doctors/admin', doctorData);
  },

  updateDoctor: (id: string, doctorData: {
    name?: string;
    email?: string;
    password?: string;
    speciality?: string;
    phoneNumber?: string;
    bio?: string;
    isActive?: boolean;
  }) => {
    return enhancedApiClient.put(`/doctors/admin/${id}`, doctorData);
  },

  updateDoctorStatus: (id: string, isActive: boolean) => {
    return enhancedApiClient.put(`/doctors/admin/${id}/status`, { isActive });
  },

  deleteDoctor: (id: string) => {
    return enhancedApiClient.delete(`/doctors/admin/${id}`);
  }
};

const publicDoctorApi = {
  getAllDoctors: () => {
    return enhancedApiClient.get('/doctors/public');
  },
  
  getDoctor: (id: string) => {
    return enhancedApiClient.get(`/doctors/public/${id}`);
  },
  
  getDoctorAvailableDates: (id: string) => {
    return enhancedApiClient.get(`/doctors/${id}/availability`);
  },
  
  getDoctorAvailableTimeSlots: (id: string, date: string) => {
    return enhancedApiClient.get(`/doctors/${id}/availability/${date}`);
  }
};

//======================================================================
// BLOG API METHODS
//======================================================================

interface BlogApi {
  subscribeToNewsletter(email: string): Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  getAllBlogs: (page?: number, limit?: number, search?: string, tag?: string) => Promise<PaginatedResponse<BlogItem>>;
  getBlog: (id: string) => Promise<BlogItem>;
  getAdminBlogs: (page?: number, limit?: number) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  getAdminBlog: (id: string) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  createBlog: (blogData: CreateBlogData) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  updateBlog: (id: string, blogData: Partial<CreateBlogData>) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  deleteBlog: (id: string) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  uploadImage: (file: File) => Promise<{ url: string }>;
  likeBlog: (id: string) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  addComment: (id: string, commentData: CommentData) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  addReply: (blogId: string, commentId: string, text: string) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const blogApi: BlogApi = {
  subscribeToNewsletter: async (email: string) => {
    const response = await enhancedApiClient.post('/newsletter', { email });
    return response.data;
  },

  getAllBlogs: async (page = 1, limit = 10, search = '', tag = '') => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    if (search) queryParams.append('search', search);
    if (tag) queryParams.append('tag', tag);
    
    try {
      const response = await enhancedApiClient.get(`/blogs?${queryParams.toString()}`);
      
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
  
  getBlog: async (id: string): Promise<BlogItem> => {
    if (!id) {
      console.error("Blog ID is required");
      return Promise.reject(new Error('Blog ID is required'));
    }
    
    try {
      const response = await enhancedApiClient.get(`/blogs/${id}`);
      
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
  
  getAdminBlogs: async (page = 1, limit = 10) => {
    const response = await enhancedApiClient.get(`/admin/blogs?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  getAdminBlog: async (id: string) => {
    if (!id) {
      return Promise.reject(new Error('Blog ID is required'));
    }
    const response = await enhancedApiClient.get(`/admin/blogs/${id}`);
    return response.data;
  },
  
  createBlog: async (blogData: CreateBlogData) => {
    const response = await enhancedApiClient.post('/blogs', blogData);
    return response.data;
  },
  
  updateBlog: async (id: string, blogData: Partial<CreateBlogData>) => {
    const response = await enhancedApiClient.put(`/blogs/${id}`, blogData);
    return response.data;
  },
  
  deleteBlog: async (id: string) => {
    const response = await enhancedApiClient.delete(`/blogs/${id}`);
    return response.data;
  },
  
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('featuredImage', file);
    const response = await enhancedApiClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  likeBlog: async (id: string) => {
    const response = await enhancedApiClient.post(`/blogs/${id}/like`);
    return response.data;
  },
  
  addComment: async (id: string, commentData: CommentData) => {
    const response = await enhancedApiClient.post(`/blogs/${id}/comments`, commentData);
    return response.data;
  },
  
  addReply: async (blogId: string, commentId: string, text: string) => {
    const response = await enhancedApiClient.post(`/blogs/${blogId}/comments/${commentId}/replies`, { text });
    return response.data;
  }
};

//======================================================================
// TESTIMONIAL API METHODS
//======================================================================

const testimonialApi = {
  getAllTestimonials: async () => {
    const response = await enhancedApiClient.get('/testimonials');
    return response.data;
  },
  
  getRecentTestimonials: async () => {
    const response = await enhancedApiClient.get('/testimonials/recent');
    return response.data;
  },
  
  submitTestimonial: async (data: TestimonialFormData) => {
    const formData = new FormData();
    formData.append('rating', data.rating.toString());
    formData.append('review', data.review);
    formData.append('name', data.name);
    formData.append('position', data.position);
    
    if (data.image) {
      formData.append('image', data.image);
    }
    
    const response = await enhancedApiClient.post('/testimonials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  },
  
  getAllAdminTestimonials: async () => {
    const response = await enhancedApiClient.get('/testimonials/admin');
    return response.data;
  },
  
  getPendingTestimonials: async () => {
    const response = await enhancedApiClient.get('/testimonials/admin/pending');
    return response.data;
  },
  
  approveTestimonial: async (id: string) => {
    const response = await enhancedApiClient.put(`/testimonials/admin/${id}/approve`);
    return response.data;
  },
  
  rejectTestimonial: async (id: string) => {
    const response = await enhancedApiClient.put(`/testimonials/admin/${id}/reject`);
    return response.data;
  },
  
  deleteTestimonial: async (id: string) => {
    const response = await enhancedApiClient.delete(`/testimonials/admin/${id}`);
    return response.data;
  },
  
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
    
    const response = await enhancedApiClient.put(`/testimonials/admin/${id}`, formData, {
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

const eventApi = {
  getAllEvents: async (status?: string, featured?: boolean) => {
    let url = '/events';
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    if (featured) params.append('featured', 'true');
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await enhancedApiClient.get(url);
    return response.data;
  },
  
  getUpcomingEvents: async () => {
    const response = await enhancedApiClient.get('/events?status=upcoming');
    return response.data;
  },
  
  getPastEvents: async () => {
    const response = await enhancedApiClient.get('/events?status=past');
    return response.data;
  },
  
  getFeaturedEvents: async () => {
    const response = await enhancedApiClient.get('/events?featured=true');
    return response.data;
  },
  
  getEvent: async (id: string) => {
    const response = await enhancedApiClient.get(`/events/${id}`);
    return response.data;
  },
  
  admin: {
    getAllEvents: async () => {
      const response = await enhancedApiClient.get('/events/admin');
      return response.data;
    },
    
    createEvent: async (eventData: EventFormData) => {
      const formData = new FormData();
      
      Object.entries(eventData).forEach(([key, value]) => {
        if (key !== 'coverImage' && key !== 'galleryImages' && value !== undefined) {
          if (typeof value === 'boolean') {
            formData.append(key, value.toString());
          } else if (value !== null) {
            formData.append(key, value as string);
          }
        }
      });
      
      if (eventData.coverImage) {
        formData.append('coverImage', eventData.coverImage);
      }
      
      if (eventData.galleryImages && eventData.galleryImages.length > 0) {
        eventData.galleryImages.forEach(image => {
          formData.append('images', image);
        });
      }
      
      const response = await enhancedApiClient.post('/events/admin', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    },
    
    updateEvent: async (id: string, eventData: Partial<EventFormData>) => {
      const formData = new FormData();
      
      Object.entries(eventData).forEach(([key, value]) => {
        if (key !== 'coverImage' && value !== undefined) {
          if (typeof value === 'boolean') {
            formData.append(key, value.toString());
          } else if (value !== null) {
            formData.append(key, value as string);
          }
        }
      });
      
      if (eventData.coverImage) {
        formData.append('coverImage', eventData.coverImage);
      }
      
      if (eventData.removeCoverImage) {
        formData.append('removeCoverImage', 'true');
      }
      
      const response = await enhancedApiClient.put(`/events/admin/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    },
    
    deleteEvent: async (id: string) => {
      const response = await enhancedApiClient.delete(`/events/admin/${id}`);
      return response.data;
    },
    
    updateEventStatus: async (id: string, status: 'upcoming' | 'ongoing' | 'past') => {
      const response = await enhancedApiClient.put(`/events/admin/${id}/status`, { status });
      return response.data;
    },
    
    addGalleryImages: async (id: string, images: File[]) => {
      const formData = new FormData();
      
      images.forEach(image => {
        formData.append('images', image);
      });
      
      const response = await enhancedApiClient.post(`/events/admin/${id}/gallery`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    },
    
    removeGalleryImage: async (id: string, imageIndex: number) => {
      const response = await enhancedApiClient.delete(`/events/admin/${id}/gallery/${imageIndex}`);
      return response.data;
    },

    updateGalleryOrder: async (id: string, galleryOrder: string[]) => {
      const response = await enhancedApiClient.put(`/events/admin/${id}/gallery/order`, { gallery: galleryOrder });
      return response.data;
    },

    addGalleryCaption: async (id: string, imageIndex: number, caption: string) => {
      const response = await enhancedApiClient.put(`/events/admin/${id}/gallery/${imageIndex}/caption`, { caption });
      return response.data;
    },

    getGalleryWithCaptions: async (id: string) => {
      const response = await enhancedApiClient.get(`/events/admin/${id}/gallery`);
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
    const response = await enhancedApiClient.get('/newsletter/subscribers', { params });
    return response.data;
  },

  updateSubscriberStatus: async (id: string, isActive: boolean) => {
    const response = await enhancedApiClient.put(`/newsletter/subscribers/${id}`, { isActive });
    return response.data;
  },

  subscribe: async (email: string) => {
    const response = await enhancedApiClient.post('/newsletter', { email });
    return response.data;
  },

  unsubscribe: async (email: string) => {
    const response = await enhancedApiClient.post('/newsletter/unsubscribe', { email });
    return response.data;
  }
};

//======================================================================
// HELPER METHODS
//======================================================================

const sendContactMessage = (contactData: ContactFormData) => {
  return enhancedApiClient.post('/contact', contactData);
};

//======================================================================
// SYSTEM HEALTH API METHODS
//======================================================================

const systemApi = {
  getHealthStatus: async () => {
    const response = await enhancedApiClient.get('/health');
    return response.data;
  },

  getEmailHealthStatus: async () => {
    const response = await enhancedApiClient.get('/email-health');
    return response.data;
  },

  getDbHealthStatus: async () => {
    const response = await enhancedApiClient.get('/db-health');
    return response.data;
  }
};

//======================================================================
// ADMIN API CONSOLIDATION
//======================================================================

const adminApi = {
  email: emailApi,
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
  system: systemApi,
};

//======================================================================
// EXPORT ALL API METHODS
//======================================================================

export { 
  // Enhanced API client (main export)
  enhancedApiClient,
  
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
};

// Export the enhanced client as default
export default apiClient;