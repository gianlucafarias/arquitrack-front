// Interfaz para el payload al crear/actualizar una visita de obra
export interface SiteVisitPayload {
  date: string; // formato ISO date-time
  notes?: string;
  photoReferences?: string;
  projectId: string; // requerido solo para creación
  photos?: string[]; // URLs de las imágenes subidas a Firebase
}

// Interfaz para el objeto de visita de obra completo (como lo devuelve el backend)
export interface SiteVisit {
  id: string;
  date: string;
  notes?: string;
  photoReferences?: string;
  photos?: string[]; // URLs de las imágenes
  projectId: string;
  recordedById: string;
  project: {
    id: string;
    name: string;
    location?: string;
  };
  recordedBy: {
    id: string;
    name?: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Interfaz para respuesta de eliminación
export interface DeleteSiteVisitResponse {
  message: string;
  siteVisit: {
    id: string;
    date: string;
    notes?: string;
    photoReferences?: string;
  };
}

// Interfaz simplificada para listados
export interface SiteVisitSummary {
  id: string;
  date: string;
  notes?: string;
  photoReferences?: string;
  photos?: string[]; // URLs de las imágenes
  project?: {
    id: string;
    name: string;
    location?: string;
  };
  recordedBy?: {
    id: string;
    name?: string;
    email: string;
  };
}

// Interfaz para la carga útil al crear/actualizar una tarea
export interface ProjectVisit {
    id: string;
    date: Date;
    time?: string;
    notes: string;
    attendees: string;
    createdBy: string;
    taskId?: string;
    images?: string[]; // URLs de las imágenes adjuntas
  }
