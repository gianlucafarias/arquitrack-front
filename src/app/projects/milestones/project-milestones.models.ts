import { Task } from '../../tasks/tasks.models';
import { SiteVisit } from '../../visits/visits.model';

export enum MilestoneStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS', 
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED'
}

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  [MilestoneStatus.PENDING]: 'Pendiente',
  [MilestoneStatus.IN_PROGRESS]: 'En progreso',
  [MilestoneStatus.COMPLETED]: 'Completado',
  [MilestoneStatus.DELAYED]: 'Retrasado'
};

export interface ProjectMilestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  targetDate: string;
  completedDate?: string;
  status: MilestoneStatus;
  
  // Vinculación con módulos existentes
  relatedTaskIds: string[]; // IDs de tareas relacionadas
  relatedVisitIds: string[]; // IDs de visitas relacionadas
  
  // Datos calculados
  tasksCount?: number;
  completedTasksCount?: number;
  progressPercent?: number;
  
  createdAt: string;
  updatedAt: string;
}

// Para mostrar hitos con datos completos
export interface ProjectMilestoneWithDetails extends ProjectMilestone {
  relatedTasks: Task[];
  relatedVisits: SiteVisit[];
}

// Para el timeline view
export interface MilestoneTimelineItem {
  id: string;
  name: string;
  targetDate: string;
  status: MilestoneStatus;
  progressPercent: number;
  isOverdue: boolean;
  daysUntilDeadline: number;
}

// Para crear/actualizar hitos
export interface CreateMilestoneRequest {
  name: string;
  description?: string;
  targetDate: string;
  relatedTaskIds?: string[];
}

export interface UpdateMilestoneRequest {
  name?: string;
  description?: string;
  targetDate?: string;
  status?: MilestoneStatus;
  completedDate?: string;
  relatedTaskIds?: string[];
  relatedVisitIds?: string[];
} 