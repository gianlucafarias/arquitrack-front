import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, timer, of } from 'rxjs';
import { switchMap, distinctUntilChanged, catchError, tap, filter, map } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { 
  Notification, 
  NotificationsResponse, 
  UnreadCountResponse, 
  NotificationQueryParams 
} from '../models/notification.models';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private apiUrl = 'http://localhost:3000/api/notifications';
  
  // Observables para notificaciones en tiempo real
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  
  public unreadCount$ = this.unreadCountSubject.asObservable();
  public notifications$ = this.notificationsSubject.asObservable();
  
  // Control de polling automático
  private pollingInterval = 30000; // 30 segundos
  private pollingSubscription: any;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    console.log('NotificationsService: Constructor iniciado');
    
    // Verificar estado de autenticación inicial
    if (this.authService.isAuthenticated()) {
      console.log('NotificationsService: Usuario ya autenticado, iniciando polling');
      this.startPolling();
    }

    // Iniciar polling solo cuando el usuario esté autenticado
    this.authService.authStatus$.pipe(
      filter(isAuthenticated => isAuthenticated)
    ).subscribe(() => {
      console.log('NotificationsService: Usuario se autenticó, iniciando polling');
      this.startPolling();
    });

    // Detener polling cuando el usuario cierre sesión
    this.authService.authStatus$.pipe(
      filter(isAuthenticated => !isAuthenticated)
    ).subscribe(() => {
      console.log('NotificationsService: Usuario cerró sesión, deteniendo polling');
      this.stopPolling();
      this.clearNotifications();
    });
  }

  /**
   * Obtiene las notificaciones del usuario
   */
  getNotifications(params?: NotificationQueryParams): Observable<NotificationsResponse> {
    console.log('NotificationsService: getNotifications llamado con params:', params);
    
    let httpParams = new HttpParams();
    
    if (params?.includeRead !== undefined) {
      httpParams = httpParams.set('includeRead', params.includeRead.toString());
    }
    if (params?.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params?.offset !== undefined) {
      httpParams = httpParams.set('offset', params.offset.toString());
    }
    if (params?.type) {
      httpParams = httpParams.set('type', params.type);
    }
    if (params?.priority) {
      httpParams = httpParams.set('priority', params.priority);
    }

    console.log('NotificationsService: Realizando petición HTTP a:', this.apiUrl);
    console.log('NotificationsService: Parámetros HTTP:', httpParams.toString());

    return this.http.get<any>(this.apiUrl, { params: httpParams }).pipe(
      tap(response => {
        console.log('NotificationsService: Respuesta recibida:', response);
      }),
      // Transformar la respuesta al formato esperado por el frontend
      map(response => {
        const notifications = response?.data || [];
        
        // Debug: mostrar información de cada notificación
        console.log('NotificationsService: Analizando notificaciones:');
        notifications.forEach((notif: any, index: number) => {
          console.log(`  [${index}] ID: ${notif.id}, isRead: ${notif.isRead}, type: ${notif.type}, message: ${notif.message?.substring(0, 50)}...`);
        });
        
        const transformedResponse: NotificationsResponse = {
          notifications: notifications,
          total: notifications.length,
          hasMore: false
        };
        console.log('NotificationsService: Respuesta transformada:', transformedResponse);
        return transformedResponse;
      }),
      tap(response => {
        // Actualizar el subject solo si no incluimos leídas (para el menú)
        if (!params?.includeRead) {
          console.log('NotificationsService: Actualizando subject con notificaciones:', response.notifications);
          this.notificationsSubject.next(response.notifications);
        }
      }),
      catchError(error => {
        console.error('NotificationsService: Error al obtener notificaciones:', error);
        console.error('NotificationsService: Status del error:', error.status);
        console.error('NotificationsService: Mensaje del error:', error.message);
        // En caso de error, retornar respuesta vacía válida
        const emptyResponse: NotificationsResponse = {
          notifications: [],
          total: 0,
          hasMore: false
        };
        return of(emptyResponse);
      })
    );
  }

  /**
   * Obtiene el contador de notificaciones no leídas
   */
  getUnreadCount(): Observable<UnreadCountResponse> {
    console.log('NotificationsService: getUnreadCount llamado');
    return this.http.get<any>(`${this.apiUrl}/unread-count`).pipe(
      tap(response => {
        console.log('NotificationsService: Contador de no leídas recibido:', response);
      }),
      // Transformar la respuesta al formato esperado
      map(response => {
        const count = response?.data?.unreadCount || 0;
        const transformedResponse: UnreadCountResponse = { count };
        console.log('NotificationsService: Contador transformado:', transformedResponse);
        return transformedResponse;
      }),
      tap(response => {
        console.log('NotificationsService: Enviando al subject contador:', response.count);
        this.unreadCountSubject.next(response.count);
        console.log('NotificationsService: Valor actual del subject después de actualizar:', this.unreadCountSubject.value);
      }),
      catchError(error => {
        console.error('NotificationsService: Error al obtener contador:', error);
        return of({ count: 0 });
      })
    );
  }

  /**
   * Marca una notificación como leída
   */
  markAsRead(notificationId: string): Observable<any> {
    console.log('NotificationsService: markAsRead llamado para ID:', notificationId);
    return this.http.patch(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      tap(response => {
        console.log('NotificationsService: Respuesta de markAsRead:', response);
        // Actualizar los observables localmente
        this.updateLocalNotificationAsRead(notificationId);
        this.decrementUnreadCount();
      }),
      catchError(error => {
        console.error('NotificationsService: Error al marcar como leída:', error);
        throw error;
      })
    );
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  markAllAsRead(): Observable<any> {
    console.log('NotificationsService: markAllAsRead llamado');
    return this.http.patch(`${this.apiUrl}/mark-all-read`, {}).pipe(
      tap(response => {
        console.log('NotificationsService: Respuesta de markAllAsRead:', response);
        // Actualizar los observables localmente
        this.markAllLocalNotificationsAsRead();
        this.unreadCountSubject.next(0);
      }),
      catchError(error => {
        console.error('NotificationsService: Error al marcar todas como leídas:', error);
        throw error;
      })
    );
  }

  /**
   * Elimina una notificación
   */
  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${notificationId}`).pipe(
      tap(() => {
        // Actualizar los observables localmente
        this.removeLocalNotification(notificationId);
      })
    );
  }

  /**
   * Inicia el polling automático para obtener notificaciones nuevas
   */
  startPolling(): void {
    // Cargar datos iniciales
    this.refreshNotifications();

    // Polling cada 30 segundos
    this.pollingSubscription = interval(this.pollingInterval).pipe(
      switchMap(() => this.getUnreadCount()),
      distinctUntilChanged((prev, curr) => prev.count === curr.count),
      catchError(error => {
        console.error('Error en polling de notificaciones:', error);
        return [];
      })
    ).subscribe(response => {
      // Si hay cambios en el contador, refrescar notificaciones
      if (response.count !== this.unreadCountSubject.value) {
        this.refreshNotifications();
      }
    });
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
   * Refresca las notificaciones y el contador
   */
  refreshNotifications(): void {
    // Obtener contador de no leídas
    this.getUnreadCount().subscribe();
    
    // Obtener notificaciones recientes (solo no leídas para el menú)
    this.getNotifications({ 
      includeRead: false, 
      limit: 10 
    }).subscribe();
  }

  /**
   * Fuerza una actualización inmediata
   */
  forceRefresh(): void {
    this.refreshNotifications();
  }

  /**
   * Obtiene el número actual de notificaciones no leídas
   */
  getCurrentUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  /**
   * Obtiene las notificaciones actuales del cache
   */
  getCurrentNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  // Métodos privados para actualizar el estado local

  private updateLocalNotificationAsRead(notificationId: string): void {
    const notifications = this.notificationsSubject.value;
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId 
        ? { ...notification, isRead: true, readAt: new Date().toISOString() }
        : notification
    );
    this.notificationsSubject.next(updatedNotifications);
  }

  private markAllLocalNotificationsAsRead(): void {
    const notifications = this.notificationsSubject.value;
    const updatedNotifications = notifications.map(notification => ({
      ...notification, 
      isRead: true, 
      readAt: new Date().toISOString()
    }));
    this.notificationsSubject.next(updatedNotifications);
  }

  private removeLocalNotification(notificationId: string): void {
    const notifications = this.notificationsSubject.value;
    const notification = notifications.find(n => n.id === notificationId);
    
    // Si la notificación no estaba leída, decrementar el contador
    if (notification && !notification.isRead) {
      this.decrementUnreadCount();
    }
    
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    this.notificationsSubject.next(updatedNotifications);
  }

  private decrementUnreadCount(): void {
    const currentCount = this.unreadCountSubject.value;
    if (currentCount > 0) {
      this.unreadCountSubject.next(currentCount - 1);
    }
  }

  /**
   * Limpia las notificaciones locales
   */
  private clearNotifications(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
  }

  /**
   * Limpia los recursos cuando se destruye el servicio
   */
  ngOnDestroy(): void {
    this.stopPolling();
  }
} 