import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, map, tap } from 'rxjs';
import { Project, ProjectPayload, CategorizedProjectsResponse, ProjectMemberDetails } from './projects.models';
import { environment } from '../environments/environment';

// Interfaz para la respuesta de eliminación de un proyecto
export interface DeleteProjectResponse {
  message: string;
  project?: Project;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private apiUrl = `${environment.apiUrl}/projects`; // URL base para la API de proyectos
  private userApiUrl = `${environment.apiUrl}/me`; // URL base para endpoints del usuario

  constructor(private http: HttpClient) { }

  // POST /projects - Crea un nuevo proyecto
  createProject(projectData: ProjectPayload): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, projectData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // GET /me/projects/categorized - Obtiene proyectos categorizados (nuevo endpoint principal)
  getCategorizedProjects(): Observable<CategorizedProjectsResponse> {
    return this.http.get<CategorizedProjectsResponse>(`${this.userApiUrl}/projects/categorized`)
      .pipe(
        catchError((error) => {
          console.warn('Endpoint categorizado no disponible, usando fallback con endpoints existentes');
          // Fallback: usar endpoints existentes para simular la respuesta categorizada
          return this.buildCategorizedFromExistingEndpoints();
        })
      );
  }

  // Método fallback que construye la respuesta categorizada usando endpoints existentes
  private buildCategorizedFromExistingEndpoints(): Observable<CategorizedProjectsResponse> {
    // Intentar con el endpoint /projects que debería existir
    return this.http.get<Project[]>(this.apiUrl).pipe(
      map((projects: Project[]) => {
        // Por ahora, todos los proyectos se consideran "creados por mí" 
        const response: CategorizedProjectsResponse = {
          createdByMe: projects,
          memberOf: []
        };
        return response;
      }),
      catchError((error) => {
        console.error('Error en fallback a /projects:', error);
        return new Observable<CategorizedProjectsResponse>(observer => {
          observer.next({ createdByMe: [], memberOf: [] });
          observer.complete();
        });
      })
    );
  }

  // GET /me/projects/involved - Endpoint alternativo que mantiene compatibilidad
  getInvolvedProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.userApiUrl}/projects/involved`)
      .pipe(
        catchError((error) => {
          console.warn('Endpoint /me/projects/involved no disponible, usando /projects');
          return this.http.get<Project[]>(this.apiUrl);
        })
      );
  }

  // Método principal: Obtiene todos los proyectos combinando ambas categorías
  getProjects(): Observable<Project[]> {
    return this.getCategorizedProjects().pipe(
      map(response => {
        // Combinar proyectos creados y proyectos donde es miembro
        return [...response.createdByMe, ...response.memberOf];
      })
    );
  }

  // Obtiene solo proyectos creados por el usuario (arquitecto propietario)
  getOwnProjects(): Observable<Project[]> {
    return this.getCategorizedProjects().pipe(
      map(response => response.createdByMe),
      catchError((error) => {
        // Fallback al endpoint original si el categorizado no está disponible
        return this.http.get<Project[]>(this.apiUrl);
      })
    );
  }

  // Obtiene solo proyectos donde el usuario es miembro/colaborador
  getMemberProjects(): Observable<ProjectMemberDetails[]> {
    return this.getCategorizedProjects().pipe(
      map(response => response.memberOf),
      catchError(this.handleError)
    );
  }

  // GET /projects/{projectId} - Obtiene un proyecto específico por su ID
  getProjectById(projectId: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${projectId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // PUT /projects/{projectId} - Actualiza un proyecto existente
  updateProject(projectId: string, projectData: Partial<ProjectPayload>): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${projectId}`, projectData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // DELETE /projects/{projectId} - Elimina un proyecto existente
  deleteProject(projectId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}`);
  }

  // Método auxiliar para determinar permisos según el rol en un proyecto
  getProjectPermissions(project: Project | ProjectMemberDetails): {
    canEdit: boolean;
    canDelete: boolean;
    canInviteMembers: boolean;
    canManageTasks: boolean;
    canViewFinances: boolean;
  } {
    // Si es un ProjectMemberDetails, el usuario es miembro
    if ('roleInProject' in project) {
      const memberProject = project as ProjectMemberDetails;
      switch (memberProject.roleInProject) {
        case 'MEMBER':
          return {
            canEdit: true,
            canDelete: false,
            canInviteMembers: true,
            canManageTasks: true,
            canViewFinances: true
          };
        case 'COLLABORATOR':
          return {
            canEdit: true,
            canDelete: false,
            canInviteMembers: false,
            canManageTasks: true,
            canViewFinances: false
          };
        case 'VIEWER':
          return {
            canEdit: false,
            canDelete: false,
            canInviteMembers: false,
            canManageTasks: false,
            canViewFinances: false
          };
        default:
          return {
            canEdit: false,
            canDelete: false,
            canInviteMembers: false,
            canManageTasks: false,
            canViewFinances: false
          };
      }
    } else {
      // Es proyecto propio (creado por el usuario)
      return {
        canEdit: true,
        canDelete: true,
        canInviteMembers: true,
        canManageTasks: true,
        canViewFinances: true
      };
    }
  }

  // Método para verificar si el usuario es propietario de un proyecto
  isProjectOwner(project: Project | ProjectMemberDetails): boolean {
    return !('roleInProject' in project);
  }

  // Manejador central de errores
  private handleError(error: any) {
    console.error('Error en la operación de API:', error);
    
    let errorMessage = 'Ha ocurrido un error en el servidor';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      // El servidor devolvió un código de error
      errorMessage = `Error ${error.status}: ${error.error?.message || error.message || 'Error desconocido'}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Obtiene la imagen principal de un proyecto
   * @param project - El proyecto del cual obtener la imagen
   * @returns URL de la imagen principal o imagen por defecto
   */
  getProjectMainImage(project: Project): string {
    // Si el proyecto tiene fotos, buscar la principal
    if (project.photos && project.photos.length > 0) {
      // Buscar foto marcada como principal por título
      const mainPhoto = project.photos.find(photo => 
        photo.title?.toLowerCase().includes('principal') || 
        photo.title?.toLowerCase().includes('main') ||
        photo.title?.toLowerCase().includes('portada')
      );
      
      if (mainPhoto) {
        return mainPhoto.fileUrl;
      }
      
      // Si no hay principal, usar la primera
      return project.photos[0].fileUrl;
    }

    // Si no hay fotos, usar imagen por defecto
    return 'assets/obra.jpg';
  }

  /**
   * Verifica si el proyecto tiene imágenes reales
   * @param project - El proyecto a verificar
   * @returns true si tiene fotos reales
   */
  hasProjectImages(project: Project): boolean {
    return !!(project.photos && project.photos.length > 0);
  }
} 