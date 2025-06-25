import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';

// No necesitamos los servicios si vamos a hardcodear, pero sí los modelos y enums
import { Project, ProjectStatus, PROJECT_STATUS_LABELS, ProjectMemberDetails, ProjectRole, PROJECT_ROLE_LABELS, CategorizedProjectsResponse } from '../projects/projects.models'; 
// import { Client } from '../clients/clients.models'; // No la usaremos directamente en el summary hardcodeado
import { Task } from '../tasks/tasks.models'; // No la usaremos directamente en el summary hardcodeado

import { Observable, of, catchError } from 'rxjs'; // Importar 'of' para crear observables de datos hardcodeados
import { delay } from 'rxjs/operators'; // Opcional: para simular latencia

// Import del componente de invitaciones pendientes
import { PendingInvitationsComponent } from '../shared/components/pending-invitations/pending-invitations.component';
import { RecentNotificationsComponent } from '../shared/components/recent-notifications/recent-notifications.component';
import { ProjectCardComponent } from '../shared/components/project-card/project-card.component';
import { ProjectsService } from '../projects/projects.service';
import { Title } from '@angular/platform-browser';

interface DashboardSummary {
  totalClients: number;
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  ownProjects: Project[];
  memberProjects: ProjectMemberDetails[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    PendingInvitationsComponent,
    ProjectCardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  summaryData: DashboardSummary | null = null; 
  isLoading = true;
  error: string | null = null;
  
  // Hacer enums accesibles desde la plantilla
  ProjectStatus = ProjectStatus;
  ProjectRole = ProjectRole;

  constructor(
    private projectsService: ProjectsService,
    private cdr: ChangeDetectorRef,
    private titleService: Title
  ) {
    this.titleService.setTitle('Panel de control');
  }

  // Método para obtener el texto legible del estado
  getStatusLabel(status: ProjectStatus): string {
    return PROJECT_STATUS_LABELS[status];
  }

  // Método para obtener el texto legible del rol
  getRoleLabel(role: ProjectRole): string {
    return PROJECT_ROLE_LABELS[role];
  }

  ngOnInit(): void {
    console.log('DashboardComponent: ngOnInit - START');
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;
    
    this.projectsService.getCategorizedProjects().subscribe({
      next: (categorizedProjects: CategorizedProjectsResponse) => {
        console.log('Proyectos categorizados cargados:', categorizedProjects);
        this.summaryData = this.buildSummaryFromCategorizedData(categorizedProjects);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar proyectos:', error);
        // Como último recurso, usar datos de fallback local
        this.summaryData = this.buildSummaryFromCategorizedData(this.getFallbackData());
        this.error = 'Usando datos de ejemplo (backend en desarrollo)';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildSummaryFromCategorizedData(data: CategorizedProjectsResponse): DashboardSummary {
    const allProjects = [...data.createdByMe, ...data.memberOf];
    const activeStatuses = [ProjectStatus.IN_PROGRESS, ProjectStatus.IN_DESIGN, ProjectStatus.IN_TENDER];
    
    return {
      totalClients: this.calculateUniqueClients(data.createdByMe), // Solo contamos clientes de proyectos propios
      totalProjects: allProjects.length,
      activeProjects: allProjects.filter(p => activeStatuses.includes(p.status)).length,
      totalTasks: allProjects.reduce((sum, p) => sum + (p.taskCount || 0), 0),
      completedTasks: allProjects.reduce((sum, p) => sum + (p.completedTaskCount || 0), 0),
      ownProjects: data.createdByMe.filter(p => activeStatuses.includes(p.status)),
      memberProjects: data.memberOf.filter(p => activeStatuses.includes(p.status))
    };
  }

  private calculateUniqueClients(projects: Project[]): number {
    const uniqueClientIds = new Set(projects.map(p => p.clientId));
    return uniqueClientIds.size;
  }

  private getFallbackData(): CategorizedProjectsResponse {
    const fallbackOwnProjects: Project[] = [
      {
        id: 'project1',
        name: 'Residencia Moderna en Las Cumbres',
        clientId: 'client1',
        client: { 
          id: 'client1', 
          name: 'Familia Pérez', 
          contactPhone: '555-1234', 
          email: 'perez@email.com', 
          address: 'Calle Sol 123', 
          architectId: 'arch1', 
          createdAt: new Date().toISOString(), 
          updatedAt: new Date().toISOString() 
        },
        location: 'Las Cumbres, Ciudad Capital',
        startDate: new Date(2023, 5, 15).toISOString(),
        estimatedEndDate: new Date(2024, 8, 30).toISOString(),
        initialBudget: 150000,
        status: ProjectStatus.IN_PROGRESS,
        architectId: 'arch123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        taskCount: 25,
        completedTaskCount: 10,
        progressPercent: 40
      }
    ];

    return {
      createdByMe: fallbackOwnProjects,
      memberOf: []
    };
  }

  // Método para refrescar los datos
  refreshData(): void {
    this.loadDashboardData();
  }

  // Método para obtener el color del chip según el rol
  getRoleChipColor(role: ProjectRole): string {
    switch (role) {
      case ProjectRole.MEMBER:
        return 'primary';
      case ProjectRole.COLLABORATOR:
        return 'accent';
      case ProjectRole.VIEWER:
        return 'basic';
      default:
        return 'basic';
    }
  }
}
