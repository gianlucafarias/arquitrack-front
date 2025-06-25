import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { 
  ProjectInvitation, 
  ProjectInvitationPayload, 
  ProjectMember,
  InvitationResponse
} from './projects.models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectInvitationsService {
  private apiUrl = `${environment.apiUrl}/invitations`;

  constructor(private http: HttpClient) { }

  // POST /invitations/send - Crear invitación a proyecto
  createProjectInvitation(invitationData: ProjectInvitationPayload): Observable<InvitationResponse> {
    return this.http.post<InvitationResponse>(`${this.apiUrl}/send`, invitationData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // GET /invitations/my-pending - Obtener invitaciones pendientes del usuario
  getPendingInvitations(): Observable<ProjectInvitation[]> {
    return this.http.get<ProjectInvitation[]>(`${this.apiUrl}/my-pending`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // POST /invitations/{invitationId}/accept - Aceptar invitación
  acceptProjectInvitation(invitationId: string): Observable<InvitationResponse> {
    return this.http.post<InvitationResponse>(`${this.apiUrl}/${invitationId}/accept`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  // POST /invitations/{invitationId}/reject - Rechazar invitación
  rejectProjectInvitation(invitationId: string): Observable<InvitationResponse> {
    return this.http.post<InvitationResponse>(`${this.apiUrl}/${invitationId}/reject`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  // POST /invitations/{invitationId}/cancel - Cancelar invitación
  cancelProjectInvitation(invitationId: string): Observable<InvitationResponse> {
    return this.http.post<InvitationResponse>(`${this.apiUrl}/${invitationId}/cancel`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  // GET /invitations/projects/{projectId}/members - Obtener miembros del proyecto
  getProjectMembers(projectId: string): Observable<ProjectMember[]> {
    return this.http.get<ProjectMember[]>(`${this.apiUrl}/projects/${projectId}/members`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // GET /invitations/projects/{projectId}/invitations - Obtener todas las invitaciones del proyecto (para arquitecto)
  getProjectInvitations(projectId: string): Observable<ProjectInvitation[]> {
    return this.http.get<ProjectInvitation[]>(`${this.apiUrl}/projects/${projectId}/invitations`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // DELETE /invitations/memberships/{membershipId}/remove - Remover miembro del proyecto
  removeProjectMember(membershipId: string): Observable<InvitationResponse> {
    return this.http.delete<InvitationResponse>(`${this.apiUrl}/memberships/${membershipId}/remove`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Manejador central de errores
  private handleError(error: any) {
    console.error('Error en la operación de invitaciones:', error);
    
    let errorMessage = 'Ha ocurrido un error en el servidor';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      // El servidor devolvió un código de error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Datos de entrada inválidos';
          break;
        case 401:
          errorMessage = 'No está autorizado para realizar esta acción';
          break;
        case 403:
          errorMessage = 'No tiene permisos para realizar esta acción';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 409:
          errorMessage = error.error?.message || 'Conflicto en la operación';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.error?.message || error.message || 'Error desconocido'}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
} 