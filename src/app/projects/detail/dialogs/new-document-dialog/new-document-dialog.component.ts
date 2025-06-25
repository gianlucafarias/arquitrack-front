import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { DocumentType, ProjectDocumentPayload } from '../../../documents/project-documents.model';
import { FileUploadService } from '../../../../shared/services/image-upload.service';

@Component({
  selector: 'app-new-document-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './new-document-dialog.component.html',
  styleUrls: ['./new-document-dialog.component.css']
})
export class NewDocumentDialogComponent {
  documentForm: FormGroup;
  selectedFile: File | null = null;
  isUploading = false;
  isFileValid = false;
  validationMessage = '';
  projectId: string;

  documentTypes = [
    { value: DocumentType.BLUEPRINT, label: 'Plano', icon: 'architecture' },
    { value: DocumentType.BUDGET, label: 'Presupuesto', icon: 'attach_money' },
    { value: DocumentType.CONTRACT, label: 'Contrato', icon: 'gavel' },
    { value: DocumentType.SPECIFICATION, label: 'Especificación', icon: 'description' },
    { value: DocumentType.REPORT, label: 'Reporte', icon: 'assessment' },
    { value: DocumentType.IMAGE, label: 'Imagen', icon: 'image' },
    { value: DocumentType.OTHER, label: 'Otro', icon: 'insert_drive_file' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NewDocumentDialogComponent>,
    private fileUploadService: FileUploadService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: string }
  ) {
    this.projectId = data.projectId;
    
    this.documentForm = this.fb.group({
      documentType: [DocumentType.OTHER, Validators.required],
      description: [''],
      version: ['']
    });

    // Validar archivo cuando cambie el tipo de documento
    this.documentForm.get('documentType')?.valueChanges.subscribe(() => {
      if (this.selectedFile) {
        this.validateFile();
      }
    });
  }

  get canSubmit(): boolean {
    return this.documentForm.valid && this.selectedFile !== null && this.isFileValid;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.validateFile();
    }
    // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
    event.target.value = '';
  }

  removeFile(): void {
    this.selectedFile = null;
    this.isFileValid = false;
    this.validationMessage = '';
  }

  validateFile(): void {
    if (!this.selectedFile) {
      this.isFileValid = false;
      this.validationMessage = '';
      return;
    }

    const documentType = this.documentForm.get('documentType')?.value;
    const maxSize = 50 * 1024 * 1024; // 50MB

    // Validar tamaño
    if (this.selectedFile.size > maxSize) {
      this.isFileValid = false;
      this.validationMessage = 'El archivo debe ser menor a 50MB';
      return;
    }

    // Validar tipo de archivo
    if (this.fileUploadService.validateDocumentFile(this.selectedFile, documentType)) {
      this.isFileValid = true;
      this.validationMessage = 'Archivo válido para el tipo seleccionado';
    } else {
      this.isFileValid = false;
      this.validationMessage = 'Tipo de archivo no válido para el tipo de documento seleccionado';
    }
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'picture_as_pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'description';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'table_chart';
    if (mimeType.includes('image')) return 'image';
    return 'insert_drive_file';
  }

  getFileIconColor(mimeType: string): string {
    if (mimeType.includes('pdf')) return '#d32f2f';
    if (mimeType.includes('word') || mimeType.includes('document')) return '#1976d2';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '#388e3c';
    if (mimeType.includes('image')) return '#7b1fa2';
    return '#616161';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (!this.canSubmit) return;

    this.isUploading = true;
    const formValue = this.documentForm.value;
    const documentType = formValue.documentType;

    // Subir archivo a Firebase Storage
    this.fileUploadService.uploadProjectDocument(this.projectId, this.selectedFile!, documentType)
      .subscribe({
        next: (fileUrl: string) => {
          // Crear payload del documento
          const documentPayload: ProjectDocumentPayload = {
            fileName: this.selectedFile!.name,
            fileUrl: fileUrl,
            fileSize: this.selectedFile!.size,
            mimeType: this.selectedFile!.type,
            documentType: documentType,
            description: formValue.description || undefined,
            version: formValue.version || undefined,
            projectId: this.projectId
          };

          console.log('Documento subido a Firebase, payload para backend:', documentPayload);
          this.dialogRef.close(documentPayload);
        },
        error: (error: any) => {
          console.error('Error al subir archivo:', error);
          this.snackBar.open('Error al subir el archivo. Intente de nuevo.', 'Cerrar', { duration: 3000 });
          this.isUploading = false;
        }
      });
  }
} 