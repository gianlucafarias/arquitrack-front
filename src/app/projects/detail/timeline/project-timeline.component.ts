import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { ProjectMilestonesService } from '../../milestones/project-milestones.service';
import { 
  ProjectMilestone,
  MilestoneTimelineItem,
  MilestoneStatus,
  MILESTONE_STATUS_LABELS,
  CreateMilestoneRequest
} from '../../milestones/project-milestones.models';

@Component({
  selector: 'app-project-timeline',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './project-timeline.component.html',
  styleUrls: ['./project-timeline.component.css']
})
export class ProjectTimelineComponent implements OnInit {
  @Input() projectId!: string;

  timelineItems: MilestoneTimelineItem[] = [];
  milestones: ProjectMilestone[] = [];
  isLoading = true;
  showAddMilestoneForm = false;

  milestoneForm: FormGroup;
  milestoneStatuses = Object.values(MilestoneStatus);
  milestoneStatusLabels = MILESTONE_STATUS_LABELS;

  constructor(
    private milestonesService: ProjectMilestonesService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.milestoneForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      targetDate: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTimelineData();
  }

  loadTimelineData(): void {
    this.isLoading = true;
    
    this.milestonesService.getMilestonesTimeline(this.projectId).subscribe({
      next: (timeline) => {
        this.timelineItems = timeline;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar timeline:', error);
        this.snackBar.open('Error al cargar cronograma', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      }
    });

    // También cargar hitos completos
    this.milestonesService.getProjectMilestones(this.projectId).subscribe({
      next: (milestones) => {
        this.milestones = milestones;
      }
    });
  }

  toggleAddMilestoneForm(): void {
    this.showAddMilestoneForm = !this.showAddMilestoneForm;
    if (!this.showAddMilestoneForm) {
      this.milestoneForm.reset();
    }
  }

  onSubmitMilestone(): void {
    if (this.milestoneForm.valid) {
      const formData = this.milestoneForm.value;
      
      const milestoneData: CreateMilestoneRequest = {
        name: formData.name,
        description: formData.description,
        targetDate: formData.targetDate.toISOString()
      };

      this.milestonesService.createMilestone(this.projectId, milestoneData).subscribe({
        next: (newMilestone) => {
          this.snackBar.open('Hito creado exitosamente', 'Cerrar', { duration: 3000 });
          this.loadTimelineData();
          this.toggleAddMilestoneForm();
        },
        error: (error) => {
          console.error('Error al crear hito:', error);
          this.snackBar.open('Error al crear hito', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  completeMilestone(milestone: ProjectMilestone): void {
    this.milestonesService.updateMilestone(this.projectId, milestone.id, {
      status: MilestoneStatus.COMPLETED,
      completedDate: new Date().toISOString()
    }).subscribe({
      next: () => {
        this.snackBar.open('Hito marcado como completado', 'Cerrar', { duration: 3000 });
        this.loadTimelineData();
      },
      error: (error) => {
        console.error('Error al actualizar hito:', error);
        this.snackBar.open('Error al actualizar hito', 'Cerrar', { duration: 3000 });
      }
    });
  }

  deleteMilestone(milestone: ProjectMilestone): void {
    if (confirm(`¿Estás seguro de eliminar el hito "${milestone.name}"?`)) {
      this.milestonesService.deleteMilestone(this.projectId, milestone.id).subscribe({
        next: () => {
          this.snackBar.open('Hito eliminado', 'Cerrar', { duration: 3000 });
          this.loadTimelineData();
        },
        error: (error) => {
          console.error('Error al eliminar hito:', error);
          this.snackBar.open('Error al eliminar hito', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  getStatusIcon(status: MilestoneStatus): string {
    switch (status) {
      case MilestoneStatus.COMPLETED: return 'check_circle';
      case MilestoneStatus.IN_PROGRESS: return 'schedule';
      case MilestoneStatus.DELAYED: return 'warning';
      default: return 'radio_button_unchecked';
    }
  }

  getStatusColor(status: MilestoneStatus): string {
    switch (status) {
      case MilestoneStatus.COMPLETED: return 'primary';
      case MilestoneStatus.IN_PROGRESS: return 'accent';
      case MilestoneStatus.DELAYED: return 'warn';
      default: return 'basic';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-AR');
  }

  getDaysText(days: number): string {
    if (days < 0) {
      return `${Math.abs(days)} días atrasado`;
    } else if (days === 0) {
      return 'Hoy';
    } else {
      return `${days} días restantes`;
    }
  }

  completeMilestoneById(milestoneId: string): void {
    const milestone = this.milestones.find(m => m.id === milestoneId);
    if (milestone) {
      this.completeMilestone(milestone);
    }
  }

  deleteMilestoneById(milestoneId: string): void {
    const milestone = this.milestones.find(m => m.id === milestoneId);
    if (milestone) {
      this.deleteMilestone(milestone);
    }
  }
} 