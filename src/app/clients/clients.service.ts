import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Client, ClientPayload, DeleteClientResponse } from './clients.models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  private apiUrl = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) { }

  // POST /clients - Crea un nuevo cliente
  createClient(clientData: ClientPayload): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, clientData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // GET /clients - Obtiene todos los clientes del arquitecto autenticado
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  // GET /clients/{clientId} - Obtiene un cliente específico por su ID
  getClientById(clientId: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${clientId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // PUT /clients/{clientId} - Actualiza un cliente existente
  updateClient(clientId: string, clientData: Partial<ClientPayload>): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${clientId}`, clientData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // DELETE /clients/{clientId} - Elimina un cliente existente
  deleteClient(clientId: string): Observable<DeleteClientResponse> {
    return this.http.delete<DeleteClientResponse>(`${this.apiUrl}/${clientId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    console.error('Error en la operación de API:', error);
    
    let errorMessage = 'Ha ocurrido un error en el servidor';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      errorMessage = `Error ${error.status}: ${error.error?.message || error.message || 'Error desconocido'}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
