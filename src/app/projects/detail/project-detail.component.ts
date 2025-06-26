import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

// Services
import { TasksService } from '../../tasks/tasks.service';
import { ProjectsService } from '../projects.service';
import { VisitsService } from '../../visits/visits.service';
import { ProjectDocumentsService } from '../documents/project-documents.service';
import { ProjectPhotosService } from '../photos/project-photos.service';
import { AuthService } from '../../auth/auth.service';

// Modelos
import { Project, ProjectStatus, PROJECT_STATUS_LABELS, ProjectRole } from '../projects.models';
import { SafePipe } from '../../shared/pipes/safe.pipe';
import { Task, TaskStatus, TaskPayload } from '../../tasks/tasks.models';
import { SiteVisit, SiteVisitSummary, SiteVisitPayload } from '../../visits/visits.model';
import { ProjectDocumentSummary, ProjectDocumentPayload } from '../documents/project-documents.model';
import { GalleryItem, ProjectPhoto } from '../photos/project-photos.model';

// Componentes
import { NewVisitDialogComponent } from './dialogs/new-visit-dialog/visit-dialog.component';
import { NewTaskDialogComponent } from './dialogs/new-task-dialog/task-dialog.component';
import { NewDocumentDialogComponent } from './dialogs/new-document-dialog/new-document-dialog.component';
import { UploadPhotoDialogComponent } from './dialogs/upload-photo-dialog/upload-photo-dialog.component';
import { ProjectMembersComponent } from './project-members/project-members.component';
import { ProjectBudgetComponent } from './budget/project-budget.component';
import { ProjectTimelineComponent } from './timeline/project-timeline.component';
import { Title } from '@angular/platform-browser';



// Interfaces para archivos
interface ProjectFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadDate: Date;
  uploadedBy: string;
}

export interface ProjectTask {
  id: string;
  description: string;
  status: 'Pendiente' | 'En progreso' | 'Completada';
  dueDate: Date | null;
  assignedTo: string | null;
  createdAt: Date;
}

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTabsModule,
    MatListModule,
    MatExpansionModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTooltipModule,
    SafePipe,
    ProjectMembersComponent,
    ProjectBudgetComponent,
    ProjectTimelineComponent
  ],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  isLoading = true;
  isLoadingVisits = false;
  projectId = '';
  tasks: Task[] = [];
  visits: SiteVisitSummary[] = [];
  files: ProjectFile[] = [];
  documents: ProjectDocumentSummary[] = [];
  galleryItems: GalleryItem[] = [];
  projectPhotos: ProjectPhoto[] = [];
  
  selectedImage: string | null = null;
  
  selectedTabIndex = 0;
  
  isImageLoading = true;
  
  // Columnas para la tabla de tareas
  taskColumns: string[] = ['description', 'status', 'dueDate', 'assignedTo'];
  
  currentUserId: string | null = null;
  
  showAllPhotosInGallery = false;
  
  constructor(
    private projectsService: ProjectsService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private tasksService: TasksService,
    private visitsService: VisitsService,
    private documentsService: ProjectDocumentsService,
    private photosService: ProjectPhotosService,
    private authService: AuthService,
    private titleService: Title
  ) {
  }

  ngOnInit(): void {
    // Obtener el usuario actual
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id || null;

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.projectId = id;
        this.loadProjectDetails(id);
        this.loadTasks(id);
        this.loadVisits(id);
        this.loadProjectDocuments(id);
        this.loadProjectGallery(id);
      } else {
        this.isLoading = false;
        this.snackBar.open('Proyecto no encontrado.', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/projects']);
      }
    });

    // Escuchar cambios en los query parameters para manejar la navegación de tabs
    this.route.queryParams.subscribe(params => {
      const tabParam = params['tab'];
      if (tabParam !== undefined) {
        const tabIndex = parseInt(tabParam, 10);
        if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex <= 3) {
          this.selectedTabIndex = tabIndex;
        }
      }
    });
  }
  
  getStatusLabel(status: ProjectStatus): string {
    return PROJECT_STATUS_LABELS[status];
  }
  
  getStatusClass(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.IN_DESIGN:
        return 'status-design';
      case ProjectStatus.IN_TENDER:
        return 'status-tender';
      case ProjectStatus.IN_PROGRESS:
        return 'status-progress';
      case ProjectStatus.COMPLETED:
        return 'status-completed';
      case ProjectStatus.ON_HOLD:
        return 'status-hold';
      default:
        return '';
    }
  }
  
  getTaskStatusClass(status: string): string {
    switch (status) {
      case 'Pendiente':
        return 'status-pending';
      case 'En progreso':
        return 'status-progress';
      case 'Completada':
        return 'status-completed';
      default:
        return '';
    }
  }
  
  getProgressColor(progress: number | undefined): string {
    if (progress === undefined) return 'primary';
    if (progress < 30) return 'warn';
    if (progress < 70) return 'accent';
    return 'primary';
  }
  
  formatDate(date: string | null): string {
    if (!date) return 'Sin definir';
    return new Date(date).toLocaleDateString('es-ES');
  }
  
  formatCurrency(amount: number | null): string {
    if (amount === null) return 'Sin definir';
    return amount.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'ARS'
    });
  }

  getPhotos(): string[] {
    // Combinar fotos de proyecto y fotos de visitas
    const allPhotos: string[] = [];
    
    // Agregar fotos de proyecto
    this.projectPhotos.forEach(photo => {
      allPhotos.push(photo.fileUrl);
    });
    
    // Agregar fotos de visitas
    this.visits.forEach(visit => {
      if (visit.photos && visit.photos.length > 0) {
        allPhotos.push(...visit.photos);
      }
    });
    
    
    return allPhotos;
  }
  
  getFileIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'doc':
      case 'docx':
        return 'description';
      case 'xls':
      case 'xlsx':
        return 'table_chart';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'image';
      case 'dwg':
      case 'dxf':
        return 'architecture';
      default:
        return 'insert_drive_file';
    }
  }
  
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1073741824).toFixed(1) + ' GB';
  }
  
  private loadProjectDetails(id: string): void {
    this.isLoading = true;
    this.isImageLoading = true;
    
    // Timeout de seguridad para el skeleton loader (máximo 5 segundos)
    setTimeout(() => {
      if (this.isImageLoading) {
        console.log('Timeout del skeleton loader - forzando carga de imagen');
        this.isImageLoading = false;
      }
    }, 5000);
    
    this.projectsService.getProjectById(id).subscribe({
      next: (project) => {
        this.project = project;
        
        // asignar rol si el backend no lo provee
        if (!this.project.currentUserRole && this.currentUserId) {
          if (this.project.architectId === this.currentUserId) {
            // Es el arquitecto propietario
            this.project.currentUserRole = 'OWNER';
          } else {
            //  VIEWER por defecto
            this.project.currentUserRole = ProjectRole.VIEWER;
          }
        }
        
        this.titleService.setTitle(`Proyecto - ${this.project?.name}`);
        this.isLoading = false;
        console.log('Proyecto cargado:', project);
        console.log('Rol del usuario actual:', this.project.currentUserRole);
        console.log('URL de imagen principal:', this.getMainProjectImage());
      },
      error: (error) => {
        console.error('Error al cargar el proyecto', error);
        this.isLoading = false;
        this.isImageLoading = false; // También detener la carga de imagen en caso de error
        this.snackBar.open('Error al cargar el proyecto', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }
  
  deleteProject(): void {
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.')) {
      this.projectsService.deleteProject(this.projectId).subscribe({
        next: () => {
          this.snackBar.open('Proyecto eliminado con éxito', 'Cerrar', {
            duration: 3000
          });
          this.router.navigate(['/proyectos']);
        },
        error: (error) => {
          console.error('Error al eliminar el proyecto', error);
          this.snackBar.open('Error al eliminar el proyecto', 'Cerrar', {
            duration: 3000
          });
        }
      });
    }
  }
  
  private loadProjectDocuments(projectId: string): void {
    // Cargar documentos reales del proyecto desde el backend
    this.documentsService.getProjectDocuments(projectId).subscribe({
      next: (documents: ProjectDocumentSummary[]) => {
        this.documents = documents;
        console.log('Documentos del proyecto cargados:', this.documents);
      },
      error: (error: any) => {
        console.error('Error al cargar documentos:', error);
        this.snackBar.open('Error al cargar los documentos del proyecto.', 'Cerrar', { duration: 3000 });
      }
    });
  }
  
  openNewVisitDialog(): void {
    const dialogRef = this.dialog.open(NewVisitDialogComponent, {
      width: '600px',
      data: { tasks: this.tasks, projectId: this.projectId }
    });
    
    dialogRef.afterClosed().subscribe((result: SiteVisitPayload | undefined) => {
      if (result) {
        console.log('Creando visita con payload:', result);
        this.visitsService.createSiteVisit(result).subscribe({
          next: (newVisit: SiteVisit) => {
            console.log('Visita creada exitosamente:', newVisit);
            this.loadVisits(this.projectId); // Recargar visitas
            this.snackBar.open('Visita registrada con éxito', 'Cerrar', {
              duration: 3000
            });
          },
          error: (error: any) => {
            console.error('Error al crear la visita:', error);
            this.snackBar.open('Error al registrar la visita. Intente de nuevo.', 'Cerrar', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  openNewTaskDialog(): void {
    if (!this.projectId) {
      this.snackBar.open('Error: ID del proyecto no disponible.', 'Cerrar', { duration: 3000 });
      return;
    }
    const dialogRef = this.dialog.open(NewTaskDialogComponent, {
      width: '600px',
      data: { projectId: this.projectId }
    });

    dialogRef.afterClosed().subscribe((result: TaskPayload | undefined) => {
      if (result) {
        console.log('Diálogo de nueva tarea cerrado, resultado:', result);
        this.tasksService.createTask(this.projectId, result).subscribe({
          next: (newTask) => {
            this.loadTasks(this.projectId);
            this.snackBar.open('Tarea creada con éxito!', 'Cerrar', { 
              duration: 3000,
              panelClass: ['success-snackbar'] 
            });
          },
          error: (error) => {
            console.error('Error al crear la tarea:', error);
            this.snackBar.open('Error al crear la tarea. Intente de nuevo.', 'Cerrar', { 
              duration: 3000,
              panelClass: ['error-snackbar'] 
            });
          }
        });
      } else {
        console.log('Diálogo de nueva tarea cerrado sin resultado.');
      }
    });
  }
  
  // Obtener descripción de la tarea por su ID
  getTaskDescription(taskId?: string): string {
    if (!taskId) return 'Sin tarea asociada';
    const task = this.tasks.find(t => t.id === taskId);
    return task ? task.description : 'Tarea no encontrada';
  }
  
  // Abrir visor de imágenes
  openImageViewer(imageUrl: string): void {
    this.selectedImage = imageUrl;
    // Agregar evento para cerrar al hacer clic fuera
    setTimeout(() => {
      document.addEventListener('click', this.closeImageViewer.bind(this), { once: true });
    }, 100);
  }
  
  // Cerrar visor de imágenes
  closeImageViewer(): void {
    this.selectedImage = null;
  }

  /**
   * Método que se ejecuta cuando la imagen principal termina de cargar
   */
  onMainImageLoad(): void {
    console.log('Imagen principal cargada exitosamente');
    this.isImageLoading = false;
  }

  /**
   * Método que se ejecuta si hay error al cargar la imagen principal
   */
  onMainImageError(): void {
    console.warn('Error al cargar la imagen principal del proyecto');
    this.isImageLoading = false;
  }

  /**
   * Obtiene la imagen principal del proyecto
   * @returns URL de la imagen principal o imagen por defecto
   */
  getMainProjectImage(): string {
    if (!this.project) return 'assets/obra.jpg';
    return this.projectsService.getProjectMainImage(this.project);
  }

  /**
   * Verifica si hay imágenes reales del proyecto
   * @returns true si hay fotos reales, false si solo hay imagen por defecto
   */
  hasRealProjectImages(): boolean {
    if (!this.project) return false;
    return this.projectsService.hasProjectImages(this.project);
  }

  loadTasks(projectId: string): void {
    if (!projectId) return;
    this.tasksService.getTasksByProject(projectId).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        // isLoadingTasks = false;
        console.log('Tareas cargadas:', this.tasks);
      },
      error: (error) => {
        console.error('Error fetching tasks:', error);
        // isLoadingTasks = false;
        this.snackBar.open('Error al cargar las tareas del proyecto.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  loadVisits(projectId: string): void {
    if (!projectId) return;
    this.isLoadingVisits = true;
    this.visitsService.getSiteVisitsByProject(projectId).subscribe({
      next: (visits: SiteVisitSummary[]) => {
        this.visits = visits;
        this.isLoadingVisits = false;
        console.log('Visitas cargadas:', this.visits);
        
        this.visits.forEach((visit, index) => {
          console.log(`Visita ${index + 1}:`, {
            id: visit.id,
            date: visit.date,
            hasPhotos: !!visit.photos,
            photoCount: visit.photos?.length || 0,
            photos: visit.photos
          });
        });
      },
      error: (error: any) => {
        console.error('Error fetching visits:', error);
        this.isLoadingVisits = false;
        this.snackBar.open('Error al cargar las visitas del proyecto.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // Métodos para gestión de documentos
  getDocumentTypeIcon(documentType: any): string {
    return this.documentsService.getDocumentTypeIcon(documentType);
  }

  getDocumentTypeLabel(documentType: any): string {
    return this.documentsService.getDocumentTypeLabel(documentType);
  }

  formatDocumentSize(bytes: number): string {
    return this.documentsService.formatFileSize(bytes);
  }

  // Método para verificar si el usuario actual puede gestionar miembros (es el arquitecto)
  canManageMembers(): boolean {
    return this.project?.architectId === this.currentUserId;
  }

  // Métodos de validación de permisos basados en roles
  
  /**
   * Verifica si el usuario puede editar el proyecto
   */
  canEditProject(): boolean {
    if (!this.project || !this.currentUserId) return false;
    
    // El arquitecto propietario siempre puede editar
    if (this.project.architectId === this.currentUserId) return true;
    
    // Solo los miembros pueden editar
    return this.project.currentUserRole === ProjectRole.MEMBER;
  }

  /**
   * Verifica si el usuario puede eliminar el proyecto
   */
  canDeleteProject(): boolean {
    if (!this.project || !this.currentUserId) return false;
    
    // Solo el arquitecto propietario puede eliminar
    return this.project.architectId === this.currentUserId;
  }

  /**
   * Verifica si el usuario puede crear/eliminar tareas
   */
  canManageTasks(): boolean {
    if (!this.project || !this.currentUserId) return false;
    
    // El arquitecto propietario siempre puede
    if (this.project.architectId === this.currentUserId) return true;
    
    // Miembros y colaboradores pueden gestionar tareas
    return this.project.currentUserRole === ProjectRole.MEMBER || 
           this.project.currentUserRole === ProjectRole.COLLABORATOR;
  }

  /**
   * Verifica si el usuario puede registrar visitas
   */
  canCreateVisits(): boolean {
    if (!this.project || !this.currentUserId) return false;
    
    // El arquitecto propietario siempre puede
    if (this.project.architectId === this.currentUserId) return true;
    
    // Miembros y colaboradores pueden registrar visitas
    return this.project.currentUserRole === ProjectRole.MEMBER || 
           this.project.currentUserRole === ProjectRole.COLLABORATOR;
  }

  /**
   * Verifica si el usuario puede subir documentos/archivos
   */
  canUploadDocuments(): boolean {
    if (!this.project || !this.currentUserId) return false;
    
    // El arquitecto propietario siempre puede
    if (this.project.architectId === this.currentUserId) return true;
    
    // Solo los miembros pueden subir documentos
    return this.project.currentUserRole === ProjectRole.MEMBER;
  }

  /**
   * Verifica si el usuario puede eliminar documentos/archivos
   */
  canDeleteDocuments(): boolean {
    if (!this.project || !this.currentUserId) return false;
    
    // El arquitecto propietario siempre puede
    if (this.project.architectId === this.currentUserId) return true;
    
    // Solo los miembros pueden eliminar documentos
    return this.project.currentUserRole === ProjectRole.MEMBER;
  }

  /**
   * Verifica si el usuario puede subir fotos
   */
  canUploadPhotos(): boolean {
    if (!this.project || !this.currentUserId) return false;
    
    // El arquitecto propietario siempre puede
    if (this.project.architectId === this.currentUserId) return true;
    
    // Miembros y colaboradores pueden subir fotos
    return this.project.currentUserRole === ProjectRole.MEMBER || 
           this.project.currentUserRole === ProjectRole.COLLABORATOR;
  }

  /**
   * Verifica si el usuario puede ver el presupuesto
   */
  canViewBudget(): boolean {
    if (!this.project || !this.currentUserId) return false;
    
    // El arquitecto propietario siempre puede
    if (this.project.architectId === this.currentUserId) return true;
    
    // Solo los miembros pueden ver el presupuesto
    return this.project.currentUserRole === ProjectRole.MEMBER;
  }

  /**
   * Verifica si el usuario puede gestionar el cronograma/hitos
   */
  canManageTimeline(): boolean {
    if (!this.project || !this.currentUserId) return false;
    
    // El arquitecto propietario siempre puede
    if (this.project.architectId === this.currentUserId) return true;
    
    // Solo los miembros pueden gestionar el cronograma
    return this.project.currentUserRole === ProjectRole.MEMBER;
  }



  openNewDocumentDialog(): void {
    const dialogRef = this.dialog.open(NewDocumentDialogComponent, {
      width: '600px',
      data: { projectId: this.projectId }
    });

    dialogRef.afterClosed().subscribe((result: ProjectDocumentPayload | undefined) => {
      if (result) {
        console.log('Creando documento con payload:', result);
        this.documentsService.createProjectDocument(result).subscribe({
          next: (newDocument) => {
            console.log('Documento creado exitosamente:', newDocument);
            this.loadProjectDocuments(this.projectId); // Recargar documentos
            this.snackBar.open('Documento subido exitosamente', 'Cerrar', {
              duration: 3000
            });
          },
          error: (error: any) => {
            console.error('Error al crear el documento:', error);
            this.snackBar.open('Error al subir el documento. Intente de nuevo.', 'Cerrar', {
              duration: 3000
            });
          }
        });
      }
    });
  }



  deleteDocument(document: any): void {
    if (confirm(`¿Estás seguro de que quieres eliminar el documento "${document.fileName}"?`)) {
      this.documentsService.deleteProjectDocument(document.id).subscribe({
        next: (response) => {
          this.snackBar.open('Documento eliminado exitosamente', 'Cerrar', { duration: 3000 });
          this.loadProjectDocuments(this.projectId); // Recargar documentos
        },
        error: (error: any) => {
          console.error('Error al eliminar documento:', error);
          this.snackBar.open('Error al eliminar el documento', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  // Métodos para la galería de fotos
  getDisplayedPhotos(): string[] {
    const allPhotos = this.getPhotos();
    if (this.showAllPhotosInGallery || allPhotos.length <= 6) {
      return allPhotos;
    }
    // Mostrar solo las primeras 5 fotos si hay más de 6
    return allPhotos.slice(0, 5);
  }

  hasMorePhotos(): boolean {
    return !this.showAllPhotosInGallery && this.getPhotos().length > 6;
  }

  getRemainingPhotosCount(): number {
    const totalPhotos = this.getPhotos().length;
    return totalPhotos - 5;
  }

  showAllPhotos(): void {
    this.showAllPhotosInGallery = true;
  }

  trackByPhoto(index: number, photo: string): string {
    return photo;
  }

  openPhotoUploadDialog(): void {
    const dialogRef = this.dialog.open(UploadPhotoDialogComponent, {
      width: '600px',
      data: { 
        projectId: this.projectId,
        projectName: this.project?.name || 'Proyecto'
      }
    });

    dialogRef.afterClosed().subscribe((newPhoto: ProjectPhoto | undefined) => {
      if (newPhoto) {
        this.snackBar.open('Foto subida exitosamente', 'Cerrar', { 
          duration: 3000 
        });
        // Recargar fotos
        this.loadProjectGallery(this.projectId);
      }
    });
  }

  // Cargar galería completa del proyecto
  loadProjectGallery(projectId: string): void {
    if (!projectId) return;
    
    // Cargar fotos específicas del proyecto
    this.photosService.getProjectPhotos(projectId).subscribe({
      next: (photos) => {
        this.projectPhotos = photos;
        console.log('Fotos del proyecto cargadas:', this.projectPhotos);
      },
      error: (error) => {
        console.error('Error al cargar fotos del proyecto:', error);
        // No mostrar error al usuario ya que puede que simplemente no haya fotos
      }
    });

    // También cargar la galería completa (fotos + fotos de visitas)
    this.photosService.getProjectGallery(projectId).subscribe({
      next: (galleryItems) => {
        this.galleryItems = galleryItems;
        console.log('Galería completa cargada:', this.galleryItems);
      },
      error: (error) => {
        console.error('Error al cargar galería completa:', error);
        // No mostrar error al usuario ya que puede que simplemente no haya fotos
      }
    });
  }
}
