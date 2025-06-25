import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';

import { NotificationsService } from '../shared/services/notifications.service';
import { 
  Notification, 
  NotificationQueryParams
} from '../shared/models/notification.models';
import { NotificationItemComponent } from '../shared/components/notification-item/notification-item.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatPaginatorModule,
    NotificationItemComponent
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})

export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  totalNotifications = 0;
  unreadCount = 0;
  isLoading = false;
  
  // Paginación
  currentPage = 0;
  pageSize = 25;
  
  // Parámetros de consulta básicos
  queryParams: NotificationQueryParams = {
    includeRead: true,
    limit: 25,
    offset: 0
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private notificationsService: NotificationsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.subscribeToUnreadCount();
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToUnreadCount(): void {
    const unreadCountSub = this.notificationsService.unreadCount$.subscribe(
      count => {
        this.unreadCount = count;
      }
    );
    this.subscriptions.push(unreadCountSub);
  }

  loadNotifications(): void {
    this.isLoading = true;
    
    this.notificationsService.getNotifications(this.queryParams).subscribe({
      next: (response) => {
        this.notifications = response.notifications || [];
        this.totalNotifications = response.total || 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar notificaciones:', error);
        this.snackBar.open('Error al cargar las notificaciones', 'Cerrar', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  hasActiveFilters(): boolean {
    return false; // Sin filtros ahora
  }

  clearFilters(): void {
    // Método mantenido para compatibilidad del template pero sin funcionalidad
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.queryParams.limit = this.pageSize;
    this.queryParams.offset = this.currentPage * this.pageSize;
    this.loadNotifications();
  }

  refreshNotifications(): void {
    this.notificationsService.forceRefresh();
    this.loadNotifications();
  }

  markAllAsRead(): void {
    if (this.unreadCount === 0) return;

    this.notificationsService.markAllAsRead().subscribe({
      next: () => {
        this.snackBar.open('Todas las notificaciones marcadas como leídas', 'Cerrar', { duration: 3000 });
        this.loadNotifications();
      },
      error: (error) => {
        console.error('Error al marcar todas como leídas:', error);
        this.snackBar.open('Error al marcar las notificaciones como leídas', 'Cerrar', { duration: 5000 });
      }
    });
  }

  onMarkAsRead(notificationId: string): void {
    this.notificationsService.markAsRead(notificationId).subscribe({
      next: () => {
        // Actualizar la notificación localmente
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
        }
        this.snackBar.open('Notificación marcada como leída', 'Cerrar', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error al marcar como leída:', error);
        this.snackBar.open('Error al marcar la notificación como leída', 'Cerrar', { duration: 5000 });
      }
    });
  }

  onDeleteNotification(notificationId: string): void {
    this.notificationsService.deleteNotification(notificationId).subscribe({
      next: () => {
        // Remover la notificación localmente
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.totalNotifications--;
        this.snackBar.open('Notificación eliminada', 'Cerrar', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error al eliminar notificación:', error);
        this.snackBar.open('Error al eliminar la notificación', 'Cerrar', { duration: 5000 });
      }
    });
  }

  onNotificationClick(notification: Notification): void {
    console.log('Notificación clickeada:', notification);
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }


} 