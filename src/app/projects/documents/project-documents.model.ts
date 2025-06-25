// Enum para tipos de documentos
export enum DocumentType {
  BLUEPRINT = 'BLUEPRINT',
  BUDGET = 'BUDGET',
  CONTRACT = 'CONTRACT',
  SPECIFICATION = 'SPECIFICATION',
  REPORT = 'REPORT',
  IMAGE = 'IMAGE',
  OTHER = 'OTHER'
}

// Interfaz para el payload al crear/actualizar un documento
export interface ProjectDocumentPayload {
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  documentType: DocumentType;
  description?: string;
  version?: string;
  projectId: string;
}

// Interfaz para el objeto de documento completo (como lo devuelve el backend)
export interface ProjectDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  documentType: DocumentType;
  description?: string;
  version?: string;
  projectId: string;
  uploadedById: string;
  project: {
    id: string;
    name: string;
    location?: string;
  };
  uploadedBy: {
    id: string;
    name?: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Interfaz simplificada para listados
export interface ProjectDocumentSummary {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  documentType: DocumentType;
  description?: string;
  version?: string;
  createdAt: string;
  project?: {
    id: string;
    name: string;
    location?: string;
  };
  uploadedBy?: {
    id: string;
    name?: string;
    email: string;
  };
}

// Interfaz para respuesta de eliminación
export interface DeleteProjectDocumentResponse {
  message: string;
  document: {
    id: string;
    fileName: string;
    documentType: DocumentType;
  };
}

// Interfaz para actualización de metadatos de documento
export interface ProjectDocumentUpdatePayload {
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  documentType?: DocumentType;
  description?: string;
  version?: string;
} 