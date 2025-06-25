import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { ProjectsService } from '../projects.service';
import { ClientsService } from '../../clients/clients.service';
import { ProjectPhotosService } from '../photos/project-photos.service';
import { Project, ProjectStatus, PROJECT_STATUS_LABELS } from '../projects.models';
import { Client } from '../../clients/clients.models';
import { ProjectPhoto, CreateProjectPhotoRequest } from '../photos/project-photos.model';

// Interfaz para el mapeo de estados
interface StatusOption {
  key: ProjectStatus;
  value: string;
}

// Interfaz para las imágenes del formulario
interface ProjectImage {
  id?: string;
  file?: File;
  url?: string;
  fileName: string;
  description: string;
  isMain: boolean;
  uploading?: boolean;
  uploaded?: boolean;
}

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatDividerModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.css']
})
export class ProjectFormComponent implements OnInit {
  projectForm!: FormGroup;
  isEditing = false;
  currentProjectId = '';
  isLoading = false;
  submitLoading = false;
  clients: Client[] = [];
  clientsLoading = false;
  projectStatusOptions: StatusOption[] = [];
  
  // Variables para imágenes
  projectImages: ProjectImage[] = [];
  mainImageUrl: string | null = null;
  dragOver = false;
  
  constructor(
    private fb: FormBuilder,
    private projectsService: ProjectsService,
    private clientsService: ClientsService,
    private photosService: ProjectPhotosService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initStatusOptions();
    this.initForm();
    this.loadClients();
    
    // Verificar si estamos en modo edición
    this.route.paramMap.subscribe(params => {
      const projectId = params.get('id');
      
      if (projectId) {
        this.isEditing = true;
        this.currentProjectId = projectId;
        this.loadProjectData(projectId);
      }
    });
  }

  // Inicializar las opciones de estado
  private initStatusOptions(): void {
    // Simplificar ya que ahora los valores del enum son strings
    this.projectStatusOptions = [
      { key: ProjectStatus.IN_DESIGN, value: PROJECT_STATUS_LABELS[ProjectStatus.IN_DESIGN] },
      { key: ProjectStatus.IN_TENDER, value: PROJECT_STATUS_LABELS[ProjectStatus.IN_TENDER] },
      { key: ProjectStatus.IN_PROGRESS, value: PROJECT_STATUS_LABELS[ProjectStatus.IN_PROGRESS] },
      { key: ProjectStatus.COMPLETED, value: PROJECT_STATUS_LABELS[ProjectStatus.COMPLETED] },
      { key: ProjectStatus.ON_HOLD, value: PROJECT_STATUS_LABELS[ProjectStatus.ON_HOLD] }
    ];
  }

  private initForm(): void {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      clientId: ['', Validators.required],
      location: [''],
      startDate: [null],
      estimatedEndDate: [null],
      initialBudget: [null, [Validators.min(0)]],
      status: [ProjectStatus.IN_DESIGN, Validators.required],
      progress: [0, [Validators.min(0), Validators.max(100)]],
    });
  }
  
  private loadClients(): void {
    this.clientsLoading = true;
    
    this.clientsService.getClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.clientsLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.snackBar.open('Error al cargar la lista de clientes', 'Cerrar', {
          duration: 5000
        });
        this.clientsLoading = false;
      }
    });
  }

  private loadProjectData(projectId: string): void {
    this.isLoading = true;
    
    this.projectsService.getProjectById(projectId).subscribe({
      next: (project) => {
        // Llenar el formulario con los datos del proyecto
        this.projectForm.patchValue({
          name: project.name,
          clientId: project.clientId,
          location: project.location,
          startDate: project.startDate ? new Date(project.startDate) : null,
          estimatedEndDate: project.estimatedEndDate ? new Date(project.estimatedEndDate) : null,
          initialBudget: project.initialBudget,
          status: project.status,
          progressPercent: project.progressPercent || 0
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos del proyecto:', error);
        this.snackBar.open('Error al cargar datos del proyecto', 'Cerrar', {
          duration: 5000
        });
        this.isLoading = false;
        // Redirigir a la lista en caso de error
        this.router.navigate(['/proyectos']);
      }
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      return;
    }
    
    this.submitLoading = true;
    
    // Formatear fechas si existen
    const formData = {...this.projectForm.value};
    
    if (formData.startDate) {
      formData.startDate = formData.startDate.toISOString();
    }
    
    if (formData.estimatedEndDate) {
      formData.estimatedEndDate = formData.estimatedEndDate.toISOString();
    }
    
    if (this.isEditing) {
      this.updateProject(formData);
    } else {
      this.createProject(formData);
    }
  }



  private updateProject(projectData: any): void {
    this.projectsService.updateProject(this.currentProjectId, projectData).subscribe({
      next: (result) => {
        this.snackBar.open('Proyecto actualizado con éxito', 'Cerrar', {
          duration: 3000
        });
        this.submitLoading = false;
        this.router.navigate(['/proyectos']);
      },
      error: (error) => {
        console.error('Error al actualizar el proyecto:', error);
        this.snackBar.open('Error al actualizar el proyecto', 'Cerrar', {
          duration: 5000
        });
        this.submitLoading = false;
      }
    });
  }

  // Métodos para manejo de imágenes
  onMainImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleImageSelection(file, true);
    }
  }

  onImagesSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    files.forEach(file => this.handleImageSelection(file, false));
  }

  private handleImageSelection(file: File, isMain: boolean): void {
    // Validar archivo
    const validation = this.photosService.validateImageFile(file);
    if (!validation.valid) {
      this.snackBar.open(validation.error!, 'Cerrar', { duration: 5000 });
      return;
    }

    // Si es imagen principal, reemplazar la existente
    if (isMain) {
      this.projectImages = this.projectImages.filter(img => !img.isMain);
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const newImage: ProjectImage = {
        file,
        url: e.target.result,
        fileName: file.name,
        description: '',
        isMain,
        uploading: false,
        uploaded: false
      };

      this.projectImages.push(newImage);
      
      if (isMain) {
        this.mainImageUrl = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }

  removeImage(index: number): void {
    const image = this.projectImages[index];
    if (image.isMain) {
      this.mainImageUrl = null;
    }
    this.projectImages.splice(index, 1);
  }

  setAsMainImage(index: number): void {
    // Quitar flag de main de todas las imágenes
    this.projectImages.forEach(img => img.isMain = false);
    
    // Establecer la seleccionada como principal
    this.projectImages[index].isMain = true;
    this.mainImageUrl = this.projectImages[index].url || null;
  }

  getImagePreviewUrl(image: ProjectImage): string {
    return image.url || '';
  }

  getFileSize(image: ProjectImage): string {
    if (image.file) {
      return this.photosService.formatFileSize(image.file.size);
    }
    return '';
  }

  updateImageDescription(index: number, description: string): void {
    this.projectImages[index].description = description;
  }

  getMainImageIndex(): number {
    return this.projectImages.findIndex(img => img.isMain);
  }

  getAdditionalImages(): ProjectImage[] {
    return this.projectImages.filter(img => !img.isMain);
  }

  hasAdditionalImages(): boolean {
    return this.getAdditionalImages().length > 0;
  }

  updateImageDescriptionByImage(image: ProjectImage, description: string): void {
    const index = this.projectImages.indexOf(image);
    if (index !== -1) {
      this.projectImages[index].description = description;
    }
  }

  setAsMainImageByImage(image: ProjectImage): void {
    const index = this.projectImages.indexOf(image);
    if (index !== -1) {
      this.setAsMainImage(index);
    }
  }

  removeImageByImage(image: ProjectImage): void {
    const index = this.projectImages.indexOf(image);
    if (index !== -1) {
      this.removeImage(index);
    }
  }

  // Eventos de drag and drop
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    
    const files = Array.from(event.dataTransfer?.files || []) as File[];
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        this.handleImageSelection(file, this.projectImages.filter(img => img.isMain).length === 0);
      }
    });
  }

  private async uploadProjectImages(projectId: string): Promise<void> {
    const uploadPromises = this.projectImages.map(async (image) => {
      if (image.file && !image.uploaded) {
        image.uploading = true;
        
        try {
          // Subir archivo con el projectId para organizarlo en la carpeta correcta
          const uploadResponse = await this.photosService.uploadPhotoFile(image.file, projectId).toPromise();
          
          // Crear registro de foto
          const photoData: CreateProjectPhotoRequest = {
            fileName: uploadResponse!.fileName,
            fileUrl: uploadResponse!.fileUrl,
            fileSize: uploadResponse!.fileSize,
            mimeType: uploadResponse!.mimeType,
            projectId: projectId,
            title: image.isMain ? 'Imagen Principal' : undefined,
            description: image.description || undefined
          };

          const photo = await this.photosService.createProjectPhoto(photoData).toPromise();
          image.uploaded = true;
          image.uploading = false;
          image.id = photo!.id;
          
        } catch (error) {
          console.error('Error al subir imagen:', error);
          image.uploading = false;
          throw error;
        }
      }
    });

    await Promise.all(uploadPromises);
  }

  // Sobrescribir createProject para incluir imágenes
  private createProject(projectData: any): void {
    this.projectsService.createProject(projectData).subscribe({
      next: async (result) => {
        try {
          // Subir imágenes si las hay
          if (this.projectImages.length > 0) {
            await this.uploadProjectImages(result.id);
          }
          
          this.snackBar.open('Proyecto creado con éxito', 'Cerrar', {
            duration: 3000
          });
          this.submitLoading = false;
          this.router.navigate(['/proyectos']);
        } catch (error) {
          console.error('Error al subir imágenes:', error);
          this.snackBar.open('Proyecto creado, pero error al subir algunas imágenes', 'Cerrar', {
            duration: 5000
          });
          this.submitLoading = false;
          this.router.navigate(['/proyectos']);
        }
      },
      error: (error) => {
        console.error('Error al crear el proyecto:', error);
        this.snackBar.open('Error al crear el proyecto', 'Cerrar', {
          duration: 5000
        });
        this.submitLoading = false;
      }
    });
  }
} 