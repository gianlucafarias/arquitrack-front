import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, BehaviorSubject, interval } from 'rxjs';
import { switchMap, distinctUntilChanged, tap, filter } from 'rxjs/operators';
import { 
  ProjectInvitation, 
  ProjectInvitationPayload, 
  ProjectMember,
  InvitationResponse
} from './projects.models';
import { environment } from '../environments/environment';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectInvitationsService {
  private apiUrl = `${environment.apiUrl}/invitations`;

  // Observables para invitaciones en tiempo real
  private pendingInvitationsSubject = new BehaviorSubject<ProjectInvitation[]>([]);
  public pendingInvitations$ = this.pendingInvitationsSubject.asObservable();

  // Control de polling automático
  private pollingInterval = 15000; // 15 segundos (más frecuente que notificaciones)
  private pollingSubscription: any;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    console.log('ProjectInvitationsService: Constructor iniciado');
    
    // Verificar estado de autenticación inicial
    if (this.authService.isAuthenticated()) {
      console.log('ProjectInvitationsService: Usuario ya autenticado, iniciando polling');
      this.startPolling();
    }

    // Iniciar polling solo cuando el usuario esté autenticado
    this.authService.authStatus$.pipe(
      filter(isAuthenticated => isAuthenticated)
    ).subscribe(() => {
      console.log('ProjectInvitationsService: Usuario se autenticó, iniciando polling');
      this.startPolling();
    });

    // Detener polling cuando el usuario cierre sesión
    this.authService.authStatus$.pipe(
      filter(isAuthenticated => !isAuthenticated)
    ).subscribe(() => {
      console.log('ProjectInvitationsService: Usuario cerró sesión, deteniendo polling');
      this.stopPolling();
      this.clearInvitations();
    });
  }

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
        tap(invitations => {
          console.log('ProjectInvitationsService: Invitaciones pendientes obtenidas:', invitations);
          this.pendingInvitationsSubject.next(invitations);
        }),
        catchError(this.handleError)
      );
  }

  // POST /invitations/{invitationId}/accept - Aceptar invitación
  acceptProjectInvitation(invitationId: string): Observable<InvitationResponse> {
    return this.http.post<InvitationResponse>(`${this.apiUrl}/${invitationId}/accept`, {})
      .pipe(
        tap(() => {
          // Actualizar la lista local removiendo la invitación aceptada
          this.removeLocalInvitation(invitationId);
        }),
        catchError(this.handleError)
      );
  }

  // POST /invitations/{invitationId}/reject - Rechazar invitación
  rejectProjectInvitation(invitationId: string): Observable<InvitationResponse> {
    return this.http.post<InvitationResponse>(`${this.apiUrl}/${invitationId}/reject`, {})
      .pipe(
        tap(() => {
          // Actualizar la lista local removiendo la invitación rechazada
          this.removeLocalInvitation(invitationId);
        }),
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

  /**
   * Inicia el polling automático para obtener invitaciones nuevas
   */
  startPolling(): void {
    // Cargar datos iniciales
    this.refreshInvitations();

    // Polling cada 15 segundos
    this.pollingSubscription = interval(this.pollingInterval).pipe(
      switchMap(() => this.getPendingInvitations()),
      distinctUntilChanged((prev, curr) => {
        // Comparar por longitud y IDs para detectar cambios
        if (prev.length !== curr.length) return false;
        const prevIds = prev.map(i => i.id).sort();
        const currIds = curr.map(i => i.id).sort();
        return JSON.stringify(prevIds) === JSON.stringify(currIds);
      }),
      catchError(error => {
        console.error('Error en polling de invitaciones:', error);
        return [];
      })
    ).subscribe();
  }

  /**
   * Detiene el polling automático
   */
  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  /**
   * Refresca las invitaciones pendientes
   */
  refreshInvitations(): void {
    this.getPendingInvitations().subscribe();
  }

  /**
   * Fuerza una actualización inmediata
   */
  forceRefresh(): void {
    this.refreshInvitations();
  }

  /**
   * Obtiene las invitaciones actuales del cache
   */
  getCurrentPendingInvitations(): ProjectInvitation[] {
    return this.pendingInvitationsSubject.value;
  }

  // Métodos privados

  private removeLocalInvitation(invitationId: string): void {
    const currentInvitations = this.pendingInvitationsSubject.value;
    const updatedInvitations = currentInvitations.filter(inv => inv.id !== invitationId);
    this.pendingInvitationsSubject.next(updatedInvitations);
  }

  private clearInvitations(): void {
    this.pendingInvitationsSubject.next([]);
  }

  private handleError(error: any): Observable<never> {
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