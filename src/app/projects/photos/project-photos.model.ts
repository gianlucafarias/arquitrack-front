// Modelo para las fotos de proyecto
export interface ProjectPhoto {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  title?: string;
  description?: string;
  location?: string;
  projectId: string;
  uploadedById: string;
  uploadedBy?: {
    id: string;
    name?: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Payload para crear una nueva foto
export interface CreateProjectPhotoRequest {
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  title?: string;
  description?: string;
  location?: string;
  projectId: string;
}

// Payload para actualizar una foto
export interface UpdateProjectPhotoRequest {
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  title?: string;
  description?: string;
  location?: string;
}

// Elemento de galería que combina fotos de proyecto y visitas
export interface GalleryItem {
  id: string;
  type: 'project' | 'site_visit';
  url: string;
  title?: string;
  description?: string;
  location?: string;
  uploadedBy?: string;
  createdAt: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

// Respuesta de la API para operaciones exitosas
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
} 