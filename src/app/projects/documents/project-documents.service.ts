import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  ProjectDocument, 
  ProjectDocumentPayload, 
  ProjectDocumentSummary, 
  DeleteProjectDocumentResponse,
  ProjectDocumentUpdatePayload,
  DocumentType 
} from './project-documents.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectDocumentsService {

  private apiUrl = 'http://localhost:3000/api/project-documents';

  constructor(private http: HttpClient) { }

  // POST / - Crea un nuevo documento de proyecto
  createProjectDocument(documentData: ProjectDocumentPayload): Observable<ProjectDocument> {
    return this.http.post<ProjectDocument>(this.apiUrl, documentData);
  }

  // GET /my-documents - Obtiene todos los documentos del usuario autenticado
  getMyDocuments(): Observable<ProjectDocumentSummary[]> {
    return this.http.get<ProjectDocumentSummary[]>(`${this.apiUrl}/my-documents`);
  }

  // GET /project/:projectId - Obtiene todos los documentos de un proyecto específico
  getProjectDocuments(projectId: string): Observable<ProjectDocumentSummary[]> {
    return this.http.get<ProjectDocumentSummary[]>(`${this.apiUrl}/project/${projectId}`);
  }

  // GET /project/:projectId/type/:documentType - Obtiene documentos filtrados por tipo
  getProjectDocumentsByType(projectId: string, documentType: DocumentType): Observable<ProjectDocumentSummary[]> {
    return this.http.get<ProjectDocumentSummary[]>(`${this.apiUrl}/project/${projectId}/type/${documentType}`);
  }

  // GET /:documentId - Obtiene un documento específico por su ID
  getProjectDocumentById(documentId: string): Observable<ProjectDocument> {
    return this.http.get<ProjectDocument>(`${this.apiUrl}/${documentId}`);
  }

  // PUT /:documentId - Actualiza los metadatos de un documento existente
  updateProjectDocument(documentId: string, updateData: ProjectDocumentUpdatePayload): Observable<ProjectDocument> {
    return this.http.put<ProjectDocument>(`${this.apiUrl}/${documentId}`, updateData);
  }

  // DELETE /:documentId - Elimina un documento existente
  deleteProjectDocument(documentId: string): Observable<DeleteProjectDocumentResponse> {
    return this.http.delete<DeleteProjectDocumentResponse>(`${this.apiUrl}/${documentId}`);
  }

  // Método utilitario para obtener el icono según el tipo de documento
  getDocumentTypeIcon(documentType: DocumentType): string {
    switch (documentType) {
      case DocumentType.BLUEPRINT:
        return 'architecture';
      case DocumentType.BUDGET:
        return 'attach_money';
      case DocumentType.CONTRACT:
        return 'gavel';
      case DocumentType.SPECIFICATION:
        return 'description';
      case DocumentType.REPORT:
        return 'assessment';
      case DocumentType.IMAGE:
        return 'image';
      case DocumentType.OTHER:
      default:
        return 'insert_drive_file';
    }
  }

  // Método utilitario para obtener la etiqueta en español del tipo de documento
  getDocumentTypeLabel(documentType: DocumentType): string {
    switch (documentType) {
      case DocumentType.BLUEPRINT:
        return 'Plano';
      case DocumentType.BUDGET:
        return 'Presupuesto';
      case DocumentType.CONTRACT:
        return 'Contrato';
      case DocumentType.SPECIFICATION:
        return 'Especificación';
      case DocumentType.REPORT:
        return 'Reporte';
      case DocumentType.IMAGE:
        return 'Imagen';
      case DocumentType.OTHER:
      default:
        return 'Otro';
    }
  }

  // Método utilitario para formatear el tamaño de archivo
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Método utilitario para validar tipos de archivo
  validateFileType(file: File, documentType: DocumentType): boolean {
    const allowedMimeTypes: { [key in DocumentType]: string[] } = {
      [DocumentType.BLUEPRINT]: ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      [DocumentType.BUDGET]: ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      [DocumentType.CONTRACT]: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      [DocumentType.SPECIFICATION]: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      [DocumentType.REPORT]: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      [DocumentType.IMAGE]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      [DocumentType.OTHER]: [] // Permitir cualquier tipo para "OTHER"
    };

    const allowedTypes = allowedMimeTypes[documentType];
    
    // Si es tipo OTHER, permitir cualquier archivo
    if (documentType === DocumentType.OTHER) {
      return true;
    }

    return allowedTypes.includes(file.type);
  }
} 