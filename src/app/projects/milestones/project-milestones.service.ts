import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { 
  ProjectMilestone, 
  ProjectMilestoneWithDetails,
  MilestoneTimelineItem,
  CreateMilestoneRequest,
  UpdateMilestoneRequest,
  MilestoneStatus
} from './project-milestones.models';

@Injectable({
  providedIn: 'root'
})
export class ProjectMilestonesService {
  private apiUrl = 'http://localhost:3000/api/projects';

  constructor(private http: HttpClient) {}

  // Obtener hitos del proyecto
  getProjectMilestones(projectId: string): Observable<ProjectMilestone[]> {
    return this.http.get<ProjectMilestone[]>(`${this.apiUrl}/${projectId}/milestones`);
  }

  // Obtener hitos con detalles completos
  getProjectMilestonesWithDetails(projectId: string): Observable<ProjectMilestoneWithDetails[]> {
    return this.http.get<ProjectMilestoneWithDetails[]>(`${this.apiUrl}/${projectId}/milestones/with-details`);
  }

  // Obtener datos para timeline
  getMilestonesTimeline(projectId: string): Observable<MilestoneTimelineItem[]> {
    return this.getProjectMilestones(projectId).pipe(
      map(milestones => {
        return milestones.map(milestone => {
          const targetDate = new Date(milestone.targetDate);
          const today = new Date();
          const daysUntilDeadline = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            id: milestone.id,
            name: milestone.name,
            targetDate: milestone.targetDate,
            status: milestone.status,
            progressPercent: milestone.progressPercent || 0,
            isOverdue: daysUntilDeadline < 0 && milestone.status !== MilestoneStatus.COMPLETED,
            daysUntilDeadline
          };
        }).sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
      })
    );
  }

  // Crear hito
  createMilestone(projectId: string, milestone: CreateMilestoneRequest): Observable<ProjectMilestone> {
    const payload = {
      name: milestone.name,
      description: milestone.description,
      targetDate: milestone.targetDate,
      relatedTaskIds: milestone.relatedTaskIds || []
    };
    
    return this.http.post<ProjectMilestone>(`${this.apiUrl}/${projectId}/milestones`, payload);
  }

  // Actualizar hito
  updateMilestone(projectId: string, milestoneId: string, updates: UpdateMilestoneRequest): Observable<ProjectMilestone> {
    const payload = {
      name: updates.name,
      description: updates.description,
      targetDate: updates.targetDate,
      status: updates.status,
      completedDate: updates.completedDate,
      relatedTaskIds: updates.relatedTaskIds,
      relatedVisitIds: updates.relatedVisitIds
    };
    
    return this.http.put<ProjectMilestone>(`${this.apiUrl}/${projectId}/milestones/${milestoneId}`, payload);
  }

  // Eliminar hito
  deleteMilestone(projectId: string, milestoneId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/milestones/${milestoneId}`);
  }

  // Vincular tareas a un hito
  linkTasksToMilestone(projectId: string, milestoneId: string, taskIds: string[]): Observable<ProjectMilestone> {
    return this.http.post<ProjectMilestone>(`${this.apiUrl}/${projectId}/milestones/${milestoneId}/link-tasks`, { taskIds });
  }

  // Vincular visitas a un hito
  linkVisitsToMilestone(projectId: string, milestoneId: string, visitIds: string[]): Observable<ProjectMilestone> {
    return this.http.post<ProjectMilestone>(`${this.apiUrl}/${projectId}/milestones/${milestoneId}/link-visits`, { visitIds });
  }

  // Calcular progreso de un hito basado en sus tareas
  calculateMilestoneProgress(milestone: ProjectMilestoneWithDetails): number {
    if (milestone.relatedTasks.length === 0) return milestone.progressPercent || 0;
    
    const completedTasks = milestone.relatedTasks.filter(task => 
      task.status.toString().toLowerCase().includes('completad')
    ).length;
    return Math.round((completedTasks / milestone.relatedTasks.length) * 100);
  }
} 