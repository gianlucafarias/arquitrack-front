import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

import { Project, ProjectStatus, PROJECT_STATUS_LABELS } from '../../../projects/projects.models';
import { ProjectsService } from '../../../projects/projects.service';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.css']
})
export class ProjectCardComponent {
  @Input() project!: Project;
  @Input() showImage: boolean = true;
  @Input() showActions: boolean = true;
  @Input() showProgress: boolean = false;
  @Input() showEditButton: boolean = true;
  @Input() compactMode: boolean = false;
  
  @Output() projectClick = new EventEmitter<Project>();
  @Output() editClick = new EventEmitter<Project>();
  @Output() deleteClick = new EventEmitter<Project>();

  constructor(private projectsService: ProjectsService) {}

  onProjectClick(): void {
    this.projectClick.emit(this.project);
  }

  onEditClick(event: Event): void {
    event.stopPropagation();
    this.editClick.emit(this.project);
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.deleteClick.emit(this.project);
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

  getStatusLabel(status: ProjectStatus): string {
    return PROJECT_STATUS_LABELS[status];
  }

  getProjectMainImage(): string {
    return this.projectsService.getProjectMainImage(this.project);
  }

  hasProjectImages(): boolean {
    return this.projectsService.hasProjectImages(this.project);
  }

  getProgressColor(progress: number | undefined): string {
    if (progress === undefined) return 'primary';
    if (progress < 30) return 'warn';
    if (progress < 70) return 'accent';
    return 'primary';
  }
}

