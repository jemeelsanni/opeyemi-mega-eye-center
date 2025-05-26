// src/types/notification.ts

/**
 * Push subscription data structure
 */
export interface PushSubscriptionData {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Push notification payload
 */
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: NotificationData;
  requireInteraction?: boolean;
  silent?: boolean;
  tag?: string;
  renotify?: boolean;
  vibrate?: number[];
  actions?: NotificationAction[];
}

/**
 * Notification data that can be passed with the notification
 */
export interface NotificationData {
  url?: string;
  appointmentId?: string;
  type?: NotificationType;
  timestamp?: number;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Types of notifications that can be sent
 */
export type NotificationType = 
  | 'new_appointment'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'appointment_reminder'
  | 'status_update'
  | 'admin_update'
  | 'test';

/**
 * Notification action buttons
 */
export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

/**
 * Notification permission states
 */
export type NotificationPermissionState = 'default' | 'granted' | 'denied';

/**
 * Browser support information
 */
export interface BrowserSupportInfo {
  notifications: boolean;
  serviceWorker: boolean;
  pushManager: boolean;
  overall: boolean;
}

/**
 * Notification context state
 */
export interface NotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isEnabled: boolean;
  isProcessing: boolean;
  error: string | null;
}

/**
 * Notification context actions
 */
export interface NotificationActions {
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<boolean>;
  checkSubscriptionStatus: () => Promise<void>;
  clearError: () => void;
  requestTestNotification?: () => Promise<boolean>;
}

/**
 * Complete notification context type
 */
export interface NotificationContextType extends NotificationState, NotificationActions {}

/**
 * Service worker message types
 */
export interface ServiceWorkerMessage {
  type: 'SKIP_WAITING' | 'SW_MESSAGE_RESPONSE' | 'NOTIFICATION_CLICK' | 'NOTIFICATION_CLOSE';
  payload?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Notification configuration options
 */
export interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  tag?: string;
  renotify?: boolean;
  vibrate?: number[];
  data?: NotificationData;
}

/**
 * Appointment notification specific data
 */
export interface AppointmentNotificationData extends NotificationData {
  appointmentId: string;
  patientName?: string;
  doctorName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

/**
 * New appointment notification payload
 */
export interface NewAppointmentNotification extends PushNotificationPayload {
  type: 'new_appointment';
  data: AppointmentNotificationData & {
    type: 'new_appointment';
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
  };
}

/**
 * Status update notification payload
 */
export interface StatusUpdateNotification extends PushNotificationPayload {
  type: 'status_update' | 'admin_update';
  data: AppointmentNotificationData & {
    type: 'status_update' | 'admin_update';
    status: 'confirmed' | 'cancelled';
    updatedBy: 'doctor' | 'admin';
  };
}

/**
 * Reminder notification payload
 */
export interface ReminderNotification extends PushNotificationPayload {
  type: 'appointment_reminder';
  data: AppointmentNotificationData & {
    type: 'appointment_reminder';
    reminderType: '24h' | '1h' | '15m';
  };
}

/**
 * API response types for notification endpoints
 */
export interface VapidKeyResponse {
  success: boolean;
  publicKey?: string;
  message?: string;
}

export interface SubscriptionResponse {
  success: boolean;
  message?: string;
}

/**
 * Notification preferences (for future use)
 */
export interface NotificationPreferences {
  newAppointments: boolean;
  statusUpdates: boolean;
  reminders: boolean;
  reminderTiming: '24h' | '1h' | '15m' | 'all';
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
}

/**
 * Notification statistics (for analytics)
 */
export interface NotificationStats {
  sent: number;
  delivered: number;
  clicked: number;
  dismissed: number;
  failed: number;
}

/**
 * Error types for notification operations
 */
export type NotificationErrorType = 
  | 'permission_denied'
  | 'not_supported'
  | 'service_worker_error'
  | 'subscription_failed'
  | 'network_error'
  | 'server_error'
  | 'unknown_error';

/**
 * Notification error with type and context
 */
export interface NotificationError {
  type: NotificationErrorType;
  message: string;
  details?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  timestamp: Date;
}

/**
 * Debug information for troubleshooting
 */
export interface NotificationDebugInfo {
  supported: boolean;
  permission: NotificationPermission;
  serviceWorkerRegistered: boolean;
  hasActiveSubscription: boolean;
  browserInfo: BrowserSupportInfo;
  userAgent: string;
  timestamp: Date;
}

/**
 * Utility type for notification handler functions
 */
export type NotificationHandler = (notification: PushNotificationPayload) => void | Promise<void>;

/**
 * Notification event types
 */
export interface NotificationEvents {
  onNotificationReceived?: NotificationHandler;
  onNotificationClicked?: NotificationHandler;
  onNotificationClosed?: NotificationHandler;
  onPermissionChanged?: (permission: NotificationPermission) => void;
  onSubscriptionChanged?: (isSubscribed: boolean) => void;
}

/**
 * Service worker registration options
 */
export interface ServiceWorkerOptions {
  scope?: string;
  updateViaCache?: 'all' | 'imports' | 'none';
  scriptURL?: string;
}

/**
 * Push manager subscription options
 */
export interface PushSubscriptionOptions {
  userVisibleOnly: boolean;
  applicationServerKey: string | Uint8Array;
}

// Runtime constants for notification types (if needed for runtime checks)
export const NOTIFICATION_TYPES = {
  NEW_APPOINTMENT: 'new_appointment',
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  STATUS_UPDATE: 'status_update',
  ADMIN_UPDATE: 'admin_update',
  TEST: 'test'
} as const;

export const NOTIFICATION_PERMISSION_STATES = {
  DEFAULT: 'default',
  GRANTED: 'granted',
  DENIED: 'denied'
} as const;

export const NOTIFICATION_ERROR_TYPES = {
  PERMISSION_DENIED: 'permission_denied',
  NOT_SUPPORTED: 'not_supported',
  SERVICE_WORKER_ERROR: 'service_worker_error',
  SUBSCRIPTION_FAILED: 'subscription_failed',
  NETWORK_ERROR: 'network_error',
  SERVER_ERROR: 'server_error',
  UNKNOWN_ERROR: 'unknown_error'
} as const;