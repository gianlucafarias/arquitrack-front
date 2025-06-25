// Posibles estados de una tarea
export enum TaskStatus {
  Pendiente = 'Pendiente',
  EnProgreso = 'En progreso',
  Completada = 'Completada'
}

// Interfaz para la carga útil al crear/actualizar una tarea
export interface TaskPayload {
  title: string;
  description: string;
  projectId: string; // ID del proyecto al que pertenece
  startDate?: string | Date;
  estimatedEndDate?: string | Date;
  responsibleUserId?: string;
  status: TaskStatus;
}

// Interfaz para el objeto Tarea (como lo devuelve el backend)
export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedToId: string;
  assignedTo: [
    {
      id: string;
      name: string;
      email: string;
      createdAt: string;
      updatedAt: string;
    }
  ];
  createdById: string;
  createdBy: [
    {
      id: string;
      name: string;
      email: string;
      createdAt: string;
      updatedAt: string;
    }
  ];
  startDate: string | null;
  estimatedEndDate: string | null;
  responsibleUserId: string | null;
  priority: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
} 