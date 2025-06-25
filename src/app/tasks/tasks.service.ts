import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskPayload } from './tasks.models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private projectApiUrl = `${environment.apiUrl}/projects`; 

  constructor(private http: HttpClient) { }

  // POST /projects/{projectId}/tasks - Crea una nueva tarea para un proyecto
  createTask(projectId: string, taskData: TaskPayload): Observable<Task> {
    return this.http.post<Task>(`${this.projectApiUrl}/${projectId}/tasks`, taskData);
  }

  // GET /projects/{projectId}/tasks - Obtiene todas las tareas de un proyecto
  getTasksByProject(projectId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.projectApiUrl}/${projectId}/tasks`);
  }

  // GET /projects/{projectId}/tasks/{taskId} - Obtiene una tarea específica
  getTaskById(projectId: string, taskId: string): Observable<Task> {
    return this.http.get<Task>(`${this.projectApiUrl}/${projectId}/tasks/${taskId}`);
  }

  // PUT /projects/{projectId}/tasks/{taskId} - Actualiza una tarea existente
  updateTask(projectId: string, taskId: string, taskData: Partial<TaskPayload>): Observable<Task> {
    return this.http.put<Task>(`${this.projectApiUrl}/${projectId}/tasks/${taskId}`, taskData);
  }

  // DELETE /projects/{projectId}/tasks/{taskId} - Elimina una tarea existente
  deleteTask(projectId: string, taskId: string): Observable<any> {
    return this.http.delete<any>(`${this.projectApiUrl}/${projectId}/tasks/${taskId}`);
  }
}
