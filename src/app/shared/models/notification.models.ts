export enum NotificationType {
  PROJECT_INVITATION_RECEIVED = 'PROJECT_INVITATION_RECEIVED',
  PROJECT_INVITATION_ACCEPTED = 'PROJECT_INVITATION_ACCEPTED',
  PROJECT_INVITATION_REJECTED = 'PROJECT_INVITATION_REJECTED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  TASK_OVERDUE = 'TASK_OVERDUE',
  SITE_VISIT_REGISTERED = 'SITE_VISIT_REGISTERED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  PROJECT_STATUS_CHANGED = 'PROJECT_STATUS_CHANGED',
  PROJECT_PROGRESS_UPDATED = 'PROJECT_PROGRESS_UPDATED',
  TASK_CREATED = 'TASK_CREATED'
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface NotificationUser {
  id: string;
  name?: string;
  email: string;
}

export interface NotificationProject {
  id: string;
  name: string;
}

export interface NotificationTask {
  id: string;
  title: string;
}

export interface NotificationSiteVisit {
  id: string;
  visitDate: string;
}

export interface NotificationDocument {
  id: string;
  fileName: string;
  documentType?: string;
}

export interface NotificationMembership {
  id: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relaciones
  recipient: NotificationUser;
  recipientId: string;
  sender?: NotificationUser;
  senderId?: string;
  
  // Referencias opcionales a entidades
  project?: NotificationProject;
  projectId?: string;
  task?: NotificationTask;
  taskId?: string;
  siteVisit?: NotificationSiteVisit;
  siteVisitId?: string;
  document?: NotificationDocument;
  documentId?: string;
  membership?: NotificationMembership;
  membershipId?: string;
  
  metadata?: any; 
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  hasMore: boolean;
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationQueryParams {
  includeRead?: boolean;
  limit?: number;
  offset?: number;
  type?: NotificationType;
  priority?: NotificationPriority;
}

// Labels para mostrar en la UI
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.PROJECT_INVITATION_RECEIVED]: 'Invitación a proyecto',
  [NotificationType.PROJECT_INVITATION_ACCEPTED]: 'Invitación aceptada',
  [NotificationType.PROJECT_INVITATION_REJECTED]: 'Invitación rechazada',
  [NotificationType.TASK_ASSIGNED]: 'Tarea asignada',
  [NotificationType.TASK_STATUS_CHANGED]: 'Estado de tarea cambiado',
  [NotificationType.TASK_OVERDUE]: 'Tarea vencida',
  [NotificationType.SITE_VISIT_REGISTERED]: 'Visita registrada',
  [NotificationType.DOCUMENT_UPLOADED]: 'Documento subido',
  [NotificationType.PROJECT_STATUS_CHANGED]: 'Estado del proyecto cambiado',
  [NotificationType.PROJECT_PROGRESS_UPDATED]: 'Progreso actualizado',
  [NotificationType.TASK_CREATED]: 'Nueva tarea creada'
};

export const NOTIFICATION_PRIORITY_LABELS: Record<NotificationPriority, string> = {
  [NotificationPriority.LOW]: 'Baja',
  [NotificationPriority.MEDIUM]: 'Media',
  [NotificationPriority.HIGH]: 'Alta',
  [NotificationPriority.URGENT]: 'Urgente'
};

// Iconos para cada tipo de notificación
export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  [NotificationType.PROJECT_INVITATION_RECEIVED]: 'mail',
  [NotificationType.PROJECT_INVITATION_ACCEPTED]: 'check_circle',
  [NotificationType.PROJECT_INVITATION_REJECTED]: 'cancel',
  [NotificationType.TASK_ASSIGNED]: 'assignment_ind',
  [NotificationType.TASK_STATUS_CHANGED]: 'task_alt',
  [NotificationType.TASK_OVERDUE]: 'schedule',
  [NotificationType.SITE_VISIT_REGISTERED]: 'location_on',
  [NotificationType.DOCUMENT_UPLOADED]: 'description',
  [NotificationType.PROJECT_STATUS_CHANGED]: 'update',
  [NotificationType.PROJECT_PROGRESS_UPDATED]: 'trending_up',
  [NotificationType.TASK_CREATED]: 'add_task'
};

// Colores para cada prioridad
export const NOTIFICATION_PRIORITY_COLORS: Record<NotificationPriority, string> = {
  [NotificationPriority.LOW]: 'primary',
  [NotificationPriority.MEDIUM]: 'accent',
  [NotificationPriority.HIGH]: 'warn',
  [NotificationPriority.URGENT]: 'warn'
}; 