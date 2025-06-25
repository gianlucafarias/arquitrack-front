import { CommonModule } from "@angular/common";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, Validators } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { Component, Inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { Task } from "../../../../tasks/tasks.models";
import { SiteVisitPayload } from "../../../../visits/visits.model";
import { FileUploadService } from "../../../../shared/services/image-upload.service";

@Component({
    selector: 'app-new-visit-dialog',
    templateUrl: './visit-dialog.component.html',
    styleUrls: ['./visit-dialog.component.css'],
    standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule,
      MatDialogModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatSelectModule,
      MatIconModule,
      MatCheckboxModule,
      MatProgressSpinnerModule,
      MatSnackBarModule
    ]
  })
  export class NewVisitDialogComponent {
    visitForm: FormGroup;
    projectId: string;
    selectedImages: {file: File, preview: string}[] = [];
    isUploading = false;

    constructor(
      private fb: FormBuilder,
      private dialogRef: MatDialogRef<NewVisitDialogComponent>,
      private fileUploadService: FileUploadService,
      private snackBar: MatSnackBar,
      @Inject(MAT_DIALOG_DATA) public data: {tasks: Task[], projectId: string}
    ) {
      this.projectId = data.projectId;
      this.visitForm = this.fb.group({
        date: [new Date(), Validators.required],
        notes: [''],
        photoReferences: ['']
      });
    }

    onFileSelected(event: any): void {
      const files = event.target.files;
      if (files) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          // Validar el archivo
          if (!this.fileUploadService.validateImageFile(file)) {
            this.snackBar.open(
              `Archivo ${file.name} no válido. Debe ser una imagen menor a 5MB.`, 
              'Cerrar', 
              { duration: 3000 }
            );
            continue;
          }

          // Generar vista previa
          this.fileUploadService.generateImagePreview(file).subscribe({
            next: (preview: string) => {
              this.selectedImages.push({
                file: file,
                preview: preview
              });
            },
            error: (error: any) => {
              console.error('Error al generar vista previa:', error);
              this.snackBar.open('Error al procesar la imagen', 'Cerrar', { duration: 3000 });
            }
          });
        }
      }
      // Limpiar el input para permitir seleccionar los mismos archivos de nuevo
      event.target.value = '';
    }

    removeImage(index: number): void {
      this.selectedImages.splice(index, 1);
    }

    saveVisit(): void {
      if (this.visitForm.valid) {
        this.isUploading = true;
        const formValue = this.visitForm.value;

        if (this.selectedImages.length > 0) {
          // Generar un ID temporal para la visita (se reemplazará por el real del backend)
          const tempVisitId = `temp_${Date.now()}`;
          const files = this.selectedImages.map(img => img.file);

          // Subir imágenes primero
          console.log('Subiendo imágenes a Firebase Storage...', files);
          this.fileUploadService.uploadVisitImages(this.projectId, files).subscribe({
            next: (imageUrls: string[]) => {
              console.log('Imágenes subidas exitosamente:', imageUrls);
              this.createVisitWithImages(formValue, imageUrls);
            },
            error: (error: any) => {
              console.error('Error al subir imágenes:', error);
              this.snackBar.open('Error al subir las imágenes. Intente de nuevo.', 'Cerrar', { duration: 3000 });
              this.isUploading = false;
            }
          });
        } else {
          // Sin imágenes, crear visita directamente
          this.createVisitWithImages(formValue, []);
        }
      }
    }

    private createVisitWithImages(formValue: any, imageUrls: string[]): void {
      const visitPayload: SiteVisitPayload = {
        date: formValue.date.toISOString(),
        notes: formValue.notes || undefined,
        photoReferences: formValue.photoReferences || undefined,
        projectId: this.projectId,
        photos: imageUrls.length > 0 ? imageUrls : undefined
      };
      this.dialogRef.close(visitPayload);
      this.isUploading = false;
      this.snackBar.open('Visita registrada exitosamente', 'Cerrar', { duration: 3000 });
    }
  }