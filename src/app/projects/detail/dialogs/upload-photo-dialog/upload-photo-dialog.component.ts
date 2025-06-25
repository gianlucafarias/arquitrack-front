import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProjectPhotosService } from '../../../photos/project-photos.service';
import { CreateProjectPhotoRequest } from '../../../photos/project-photos.model';

export interface UploadPhotoDialogData {
  projectId: string;
  projectName: string;
}

@Component({
  selector: 'app-upload-photo-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './upload-photo-dialog.component.html',
  styleUrls: ['./upload-photo-dialog.component.css']
})
export class UploadPhotoDialogComponent implements OnInit {
  photoForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isUploading = false;
  uploadProgress = 0;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UploadPhotoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UploadPhotoDialogData,
    private photosService: ProjectPhotosService,
    private snackBar: MatSnackBar
  ) {
    this.photoForm = this.fb.group({
      title: [''],
      description: [''],
      location: ['']
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar el archivo
      const validation = this.photosService.validateImageFile(file);
      if (!validation.valid) {
        this.snackBar.open(validation.error!, 'Cerrar', { duration: 5000 });
        return;
      }

      this.selectedFile = file;
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    // Limpiar el input file
    const fileInput = document.getElementById('photo-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getFileSize(): string {
    if (this.selectedFile) {
      return this.photosService.formatFileSize(this.selectedFile.size);
    }
    return '';
  }

  onSubmit(): void {
    if (!this.selectedFile) {
      this.snackBar.open('Por favor selecciona una imagen', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    // Simular progreso de subida
    const progressInterval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 90) {
        clearInterval(progressInterval);
      }
    }, 200);

    // Primero subir el archivo con el projectId para organizarlo en la carpeta correcta
    this.photosService.uploadPhotoFile(this.selectedFile, this.data.projectId).subscribe({
      next: (uploadResponse) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;

        // Crear el registro de la foto
        const photoData: CreateProjectPhotoRequest = {
          fileName: uploadResponse.fileName,
          fileUrl: uploadResponse.fileUrl,
          fileSize: uploadResponse.fileSize,
          mimeType: uploadResponse.mimeType,
          projectId: this.data.projectId,
          title: this.photoForm.value.title || undefined,
          description: this.photoForm.value.description || undefined,
          location: this.photoForm.value.location || undefined
        };

        this.photosService.createProjectPhoto(photoData).subscribe({
          next: (photo) => {
            this.isUploading = false;
            this.dialogRef.close(photo);
          },
          error: (error) => {
            console.error('Error al crear registro de foto:', error);
            this.isUploading = false;
            this.snackBar.open('Error al registrar la foto', 'Cerrar', { duration: 5000 });
          }
        });
      },
      error: (error) => {
        console.error('Error al subir archivo:', error);
        clearInterval(progressInterval);
        this.isUploading = false;
        this.uploadProgress = 0;
        this.snackBar.open('Error al subir la imagen', 'Cerrar', { duration: 5000 });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 