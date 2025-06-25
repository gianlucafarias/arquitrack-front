import { Client } from '../clients/clients.models';
import { ProjectPhoto } from './photos/project-photos.model';

export enum ProjectStatus {
  IN_DESIGN = "IN_DESIGN",
  IN_TENDER = "IN_TENDER",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ON_HOLD = "ON_HOLD"
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.IN_DESIGN]: 'En diseño',
  [ProjectStatus.IN_TENDER]: 'En licitación',
  [ProjectStatus.IN_PROGRESS]: 'En ejecución',
  [ProjectStatus.COMPLETED]: 'Finalizada',
  [ProjectStatus.ON_HOLD]: 'Pausada'
};

// Enums para el sistema de invitaciones
export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED"
}

export enum ProjectRole {
  MEMBER = "MEMBER",
  COLLABORATOR = "COLLABORATOR",
  VIEWER = "VIEWER"
}

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  [InvitationStatus.PENDING]: 'Pendiente',
  [InvitationStatus.ACCEPTED]: 'Aceptada',
  [InvitationStatus.REJECTED]: 'Rechazada',
  [InvitationStatus.CANCELLED]: 'Cancelada'
};

export const PROJECT_ROLE_LABELS: Record<ProjectRole, string> = {
  [ProjectRole.MEMBER]: 'Miembro',
  [ProjectRole.COLLABORATOR]: 'Colaborador',
  [ProjectRole.VIEWER]: 'Observador'
};

export interface ProjectPayload {
  name: string;
  clientId: string;
  location?: string;
  startDate?: string | Date;
  estimatedEndDate?: string | Date;
  initialBudget?: number;
  status: ProjectStatus; 
}

export interface Project {
  id: string;
  name: string;
  client?: Client;
  clientId: string; 
  location: string | null;
  startDate: string | null;
  estimatedEndDate: string | null;
  initialBudget: number | null;
  status: ProjectStatus;
  architectId: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  completedTaskCount?: number;
  progressPercent?: number;
  currentUserRole?: string;
  photos?: ProjectPhoto[];
}

// Interfaces para el sistema de invitaciones

export interface ProjectInvitationPayload {
  projectId: string;
  userEmail: string;
  roleInProject: ProjectRole;
}

export interface ProjectInvitation {
  id: string;
  roleInProject: ProjectRole;
  invitationStatus: InvitationStatus;
  createdAt: string;
  joinedAt?: string;
  project?: {
    id: string;
    name: string;
    location?: string;
    status?: string;
  };
  user?: {
    id: string;
    name?: string;
    email: string;
    role?: string;
  };
  invitedBy?: {
    id: string;
    name?: string;
    email: string;
    role?: string;
  };
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  roleInProject: ProjectRole;
  invitationStatus: InvitationStatus;
  joinedAt?: string;
  invitedById: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name?: string;
    email: string;
  };
  invitedBy?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface InvitationResponse {
  message: string;
  invitation?: ProjectInvitation;
}

// Nuevas interfaces para el sistema categorizado de proyectos

export interface ProjectMemberDetails extends Project {
  roleInProject: ProjectRole;
  membershipId: string;
  architect?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CategorizedProjectsResponse {
  createdByMe: Project[];
  memberOf: ProjectMemberDetails[];
}

// Nuevas interfaces para control financiero
export enum ExpenseCategory {
  MATERIALS = 'MATERIALS',
  LABOR = 'LABOR', 
  EQUIPMENT = 'EQUIPMENT',
  PERMITS = 'PERMITS',
  OTHER = 'OTHER'
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.MATERIALS]: 'Materiales',
  [ExpenseCategory.LABOR]: 'Mano de obra',
  [ExpenseCategory.EQUIPMENT]: 'Equipos',
  [ExpenseCategory.PERMITS]: 'Permisos',
  [ExpenseCategory.OTHER]: 'Otros'
};

export interface ProjectExpense {
  id: string;
  projectId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  receiptUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectBudgetSummary {
  initialBudget: number;
  totalExpenses: number;
  remainingBudget: number;
  expensesByCategory: {
    [key in ExpenseCategory]: number;
  };
  expenses: ProjectExpense[];
}

// Interfaces para materiales básicos
export enum MaterialStatus {
  NEEDED = 'NEEDED',
  ORDERED = 'ORDERED', 
  RECEIVED = 'RECEIVED',
  USED = 'USED'
}

export const MATERIAL_STATUS_LABELS: Record<MaterialStatus, string> = {
  [MaterialStatus.NEEDED]: 'Necesario',
  [MaterialStatus.ORDERED]: 'Pedido',
  [MaterialStatus.RECEIVED]: 'Recibido',
  [MaterialStatus.USED]: 'Usado'
};

export interface ProjectMaterial {
  id: string;
  projectId: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  actualCost?: number;
  supplier?: string;
  status: MaterialStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
} 