import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { environment } from '../../environments/environment';
import { 
  ProjectPhoto, 
  CreateProjectPhotoRequest, 
  UpdateProjectPhotoRequest, 
  GalleryItem 
} from './project-photos.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectPhotosService {
  private apiUrl = `${environment.apiUrl}/project-photos`;

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {}

  /**
   * Crea una nueva foto de proyecto
   */
  createProjectPhoto(photoData: CreateProjectPhotoRequest): Observable<ProjectPhoto> {
    return this.http.post<ProjectPhoto>(this.apiUrl, photoData);
  }

  /**
   * Obtiene todas las fotos de un proyecto específico
   */
  getProjectPhotos(projectId: string): Observable<ProjectPhoto[]> {
    return this.http.get<ProjectPhoto[]>(`${this.apiUrl}/project/${projectId}`);
  }

  /**
   * Obtiene la galería completa del proyecto (fotos + fotos de visitas)
   */
  getProjectGallery(projectId: string): Observable<GalleryItem[]> {
    return this.http.get<GalleryItem[]>(`${this.apiUrl}/gallery/${projectId}`);
  }

  /**
   * Obtiene todas las fotos subidas por el usuario autenticado
   */
  getMyPhotos(): Observable<ProjectPhoto[]> {
    return this.http.get<ProjectPhoto[]>(`${this.apiUrl}/my-photos`);
  }

  /**
   * Obtiene una foto específica por su ID
   */
  getProjectPhotoById(photoId: string): Observable<ProjectPhoto> {
    return this.http.get<ProjectPhoto>(`${this.apiUrl}/${photoId}`);
  }

  /**
   * Actualiza una foto existente
   */
  updateProjectPhoto(photoId: string, photoData: UpdateProjectPhotoRequest): Observable<ProjectPhoto> {
    return this.http.put<ProjectPhoto>(`${this.apiUrl}/${photoId}`, photoData);
  }

  /**
   * Elimina una foto de proyecto
   */
  deleteProjectPhoto(photoId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${photoId}`);
  }

  /**
   * Sube un archivo a Firebase Storage y retorna la URL
   */
  uploadPhotoFile(file: File, projectId: string): Observable<{ fileUrl: string; fileName: string; fileSize: number; mimeType: string }> {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `project-photos/${projectId}/${fileName}`;
    const fileRef = ref(this.storage, filePath);
    
    return from(uploadBytes(fileRef, file)).pipe(
      switchMap(() => getDownloadURL(fileRef)),
      switchMap((downloadURL: string) => {
        return new Observable<{ fileUrl: string; fileName: string; fileSize: number; mimeType: string }>(observer => {
          observer.next({
            fileUrl: downloadURL,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type
          });
          observer.complete();
        });
      })
    );
  }

  /**
   * Valida si un archivo es una imagen válida
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSizeInMB = 10;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de archivo no válido. Solo se permiten: JPEG, JPG, PNG, GIF, WEBP'
      };
    }

    if (file.size > maxSizeInBytes) {
      return {
        valid: false,
        error: `El archivo es demasiado grande. Tamaño máximo: ${maxSizeInMB}MB`
      };
    }

    return { valid: true };
  }

  /**
   * Formatea el tamaño del archivo para mostrar de forma legible
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Obtiene el icono apropiado según el tipo MIME
   */
  getImageIcon(mimeType?: string): string {
    if (!mimeType) return 'image';
    
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'photo';
    if (mimeType.includes('png')) return 'image';
    if (mimeType.includes('gif')) return 'gif';
    if (mimeType.includes('webp')) return 'image';
    
    return 'image';
  }

  /**
   * Elimina una foto específica de Firebase Storage
   */
  deletePhotoFromStorage(fileUrl: string): Observable<void> {
    try {
      const fileRef = ref(this.storage, fileUrl);
      return from(deleteObject(fileRef));
    } catch (error) {
      console.error('Error al eliminar archivo de Storage:', error);
      return new Observable(observer => {
        observer.error(error);
      });
    }
  }

  /**
   * Elimina todas las fotos de un proyecto específico de Firebase Storage
   * (Útil cuando se elimina un proyecto completo)
   */
  deleteProjectPhotosFromStorage(projectId: string): Observable<void> {
    try {
      const projectFolderRef = ref(this.storage, `project-photos/${projectId}`);
      // Nota: Para eliminar carpetas completas, necesitarías listar todos los archivos
      // y eliminarlos uno por uno. Por ahora, esto sirve como referencia de la estructura.
      console.log(`Preparado para eliminar fotos del proyecto: ${projectId}`);
      return new Observable(observer => {
        observer.next();
        observer.complete();
      });
    } catch (error) {
      console.error('Error al eliminar carpeta del proyecto:', error);
      return new Observable(observer => {
        observer.error(error);
      });
    }
  }
} 