import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SiteVisit, SiteVisitPayload, SiteVisitSummary, DeleteSiteVisitResponse } from './visits.model';

@Injectable({
  providedIn: 'root'
})
export class VisitsService {

  private apiUrl = 'http://localhost:3000/api/site-visits';

  constructor(private http: HttpClient) { }

  // POST /site-visits - Crea una nueva visita de obra
  createSiteVisit(visitData: SiteVisitPayload): Observable<SiteVisit> {
    return this.http.post<SiteVisit>(this.apiUrl, visitData);
  }

  // GET /site-visits/my-visits - Obtiene todas las visitas del usuario autenticado
  getMySiteVisits(): Observable<SiteVisitSummary[]> {
    return this.http.get<SiteVisitSummary[]>(`${this.apiUrl}/my-visits`);
  }

  // GET /site-visits/project/{projectId} - Obtiene todas las visitas de un proyecto específico
  getSiteVisitsByProject(projectId: string): Observable<SiteVisitSummary[]> {
    return this.http.get<SiteVisitSummary[]>(`${this.apiUrl}/project/${projectId}`);
  }

  // GET /site-visits/{siteVisitId} - Obtiene una visita específica por ID
  getSiteVisitById(siteVisitId: string): Observable<SiteVisit> {
    return this.http.get<SiteVisit>(`${this.apiUrl}/${siteVisitId}`);
  }

  // PUT /site-visits/{siteVisitId} - Actualiza una visita existente
  updateSiteVisit(siteVisitId: string, visitData: Partial<SiteVisitPayload>): Observable<SiteVisit> {
    return this.http.put<SiteVisit>(`${this.apiUrl}/${siteVisitId}`, visitData);
  }

  // DELETE /site-visits/{siteVisitId} - Elimina una visita existente
  deleteSiteVisit(siteVisitId: string): Observable<DeleteSiteVisitResponse> {
    return this.http.delete<DeleteSiteVisitResponse>(`${this.apiUrl}/${siteVisitId}`);
  }
}