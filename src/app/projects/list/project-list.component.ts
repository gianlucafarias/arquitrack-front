import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ProjectsService } from '../projects.service';
import { Project, ProjectStatus, PROJECT_STATUS_LABELS } from '../projects.models';
import { ProjectCardComponent } from '../../shared/components/project-card/project-card.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatChipsModule,
    MatProgressBarModule,
    ProjectCardComponent
  ],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  isLoading = true;
  searchText = '';
  filteredProjects: Project[] = [];
  
  // Columnas a mostrar en la tabla
  displayedColumns: string[] = ['name', 'client', 'status', 'progress', 'actions'];
  
  // Estado del proyecto para colores
  projectStatus = ProjectStatus;
  
  constructor(
    private projectsService: ProjectsService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.loadProjects();
  }
  
  loadProjects(): void {
    this.isLoading = true;
    this.projectsService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.filteredProjects = [...this.projects];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar proyectos:', error);
        this.snackBar.open('Error al cargar los proyectos', 'Cerrar', {
          duration: 5000,
        });
        this.isLoading = false;
      }
    });
  }
  
  applyFilter(): void {
    if (!this.searchText.trim()) {
      this.filteredProjects = [...this.projects];
      return;
    }
    
    const searchTextLower = this.searchText.trim().toLowerCase();
    this.filteredProjects = this.projects.filter(project => 
      project.name.toLowerCase().includes(searchTextLower) ||
      (project.client?.name.toLowerCase().includes(searchTextLower)) ||
      (project.location && project.location.toLowerCase().includes(searchTextLower))
    );
  }
  
  getStatusClass(status: ProjectStatus): string {
    switch(status) {
      case ProjectStatus.IN_DESIGN:
        return 'status-design';
      case ProjectStatus.IN_PROGRESS:
        return 'status-execution';
      case ProjectStatus.IN_TENDER:
        return 'status-bidding';
      case ProjectStatus.COMPLETED:
        return 'status-finished';
      case ProjectStatus.ON_HOLD:
        return 'status-paused';
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
  
  deleteProject(project: Project): void {
    if (confirm(`¿Está seguro que desea eliminar el proyecto ${project.name}?`)) {
      this.projectsService.deleteProject(project.id).subscribe({
        next: (response) => {
          this.snackBar.open('Proyecto eliminado con éxito', 'Cerrar', {
            duration: 3000,
          });
          this.loadProjects(); // Recargar la lista
        },
        error: (error) => {
          console.error('Error al eliminar proyecto:', error);
          this.snackBar.open('Error al eliminar el proyecto', 'Cerrar', {
            duration: 5000,
          });
        }
      });
    }
  }
  
  // Método para obtener el texto legible del estado
  getStatusLabel(status: ProjectStatus): string {
    return PROJECT_STATUS_LABELS[status];
  }

  getProjectMainImage(project: Project): string {
    return this.projectsService.getProjectMainImage(project);
  }

  hasProjectImages(project: Project): boolean {
    return this.projectsService.hasProjectImages(project);
  }
} 