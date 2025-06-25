import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable, from, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DocumentType } from '../../projects/documents/project-documents.model';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private storage: Storage) { }

  /**
   * Sube múltiples imágenes a Firebase Storage
   */
  uploadVisitImages(projectId: string, files: File[]): Observable<string[]> {
    if (!files || files.length === 0) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    const timestamp = Date.now();
    const uploadTasks = files.map((file, index) => {
      // Validar el archivo antes de subir
      if (!this.validateImageFile(file)) {
        throw new Error(`Archivo inválido: ${file.name}`);
      }

      const fileName = `${timestamp}_${index}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `visits/${projectId}/${fileName}`;
      const fileRef = ref(this.storage, filePath);
      
      return from(uploadBytes(fileRef, file)).pipe(
        switchMap(() => getDownloadURL(fileRef))
      );
    });

    return forkJoin(uploadTasks);
  }

  /**
   * Sube una sola imagen
   */
  uploadSingleImage(path: string, file: File): Observable<string> {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${path}/${fileName}`;
    const fileRef = ref(this.storage, filePath);
    
    return from(uploadBytes(fileRef, file)).pipe(
      switchMap(() => getDownloadURL(fileRef))
    );
  }

  /**
   * Elimina una imagen de Firebase Storage
   */
  deleteImage(url: string): Observable<void> {
    const fileRef = ref(this.storage, url);
    return from(deleteObject(fileRef));
  }

  /**
   * Valida que el archivo sea una imagen válida
   */
  validateImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  /**
   * Genera una vista previa de la imagen seleccionada
   */
  generateImagePreview(file: File): Observable<string> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        observer.next(e.target.result);
        observer.complete();
      };
      reader.onerror = (error) => {
        observer.error(error);
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Sube documentos de proyecto a Firebase Storage
   */
  uploadProjectDocument(projectId: string, file: File, documentType: DocumentType): Observable<string> {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `documents/${projectId}/${documentType.toLowerCase()}/${fileName}`;
    const fileRef = ref(this.storage, filePath);
    
    return from(uploadBytes(fileRef, file)).pipe(
      switchMap(() => getDownloadURL(fileRef))
    );
  }

  /**
   * Valida que el archivo sea válido para el tipo de documento
   */
  validateDocumentFile(file: File, documentType: DocumentType): boolean {
    const maxSize = 50 * 1024 * 1024; // 50MB máximo para documentos
    
    // Validar tamaño
    if (file.size > maxSize) {
      return false;
    }

    // Validar tipo según DocumentType
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
    
    // Si es tipo OTHER, solo validar tamaño
    if (documentType === DocumentType.OTHER) {
      return true;
    }

    return allowedTypes.includes(file.type);
  }
} 