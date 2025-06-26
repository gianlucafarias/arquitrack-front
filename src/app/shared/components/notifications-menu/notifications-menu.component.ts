import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { NotificationsService } from '../../services/notifications.service';
import { Notification } from '../../models/notification.models';
import { NotificationItemComponent } from '../notification-item/notification-item.component';

@Component({
  selector: 'app-notifications-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    RouterModule,
    NotificationItemComponent
  ],
  templateUrl: './notifications-menu.component.html',
  styleUrls: ['./notifications-menu.component.css'],

})
export class NotificationsMenuComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  isLoading = false;
  maxNotifications = 10;

  private subscriptions: Subscription[] = [];

  constructor(private notificationsService: NotificationsService) {}

  ngOnInit(): void {
    this.subscribeToNotifications();
    // Asegurar que tenemos datos actuales al inicializar
    this.forceRefreshOnInit();
  }
  
  private forceRefreshOnInit(): void {
    this.isLoading = true;
    this.notificationsService.forceRefresh();
    // Dar tiempo para que se actualicen los observables
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToNotifications(): void {
    // Suscribirse a las notificaciones
    const notificationsSub = this.notificationsService.notifications$.subscribe(
      notifications => {
        this.notifications = notifications.slice(0, this.maxNotifications);
      }
    );

    // Suscribirse al contador de no leídas
    const unreadCountSub = this.notificationsService.unreadCount$.subscribe(
      count => {
        console.log('NotificationsMenuComponent: Contador recibido del servicio:', count);
        this.unreadCount = count;
        console.log('NotificationsMenuComponent: unreadCount actualizado a:', this.unreadCount);
      }
    );

    this.subscriptions.push(notificationsSub, unreadCountSub);
  }

  refreshNotifications(): void {
    this.isLoading = true;
    this.notificationsService.forceRefresh();
    
    // Dar tiempo para que se actualicen los observables
    setTimeout(() => {
      this.isLoading = false;
    }, 800);
  }

  markAllAsRead(): void {
    if (this.unreadCount === 0) return;

    this.notificationsService.markAllAsRead().subscribe({
      next: () => {
        console.log('Todas las notificaciones marcadas como leídas');
      },
      error: (error) => {
        console.error('Error al marcar todas como leídas:', error);
      }
    });
  }

  onMarkAsRead(notificationId: string): void {
    this.notificationsService.markAsRead(notificationId).subscribe({
      next: () => {
        console.log('Notificación marcada como leída');
      },
      error: (error) => {
        console.error('Error al marcar como leída:', error);
      }
    });
  }

  onDeleteNotification(notificationId: string): void {
    this.notificationsService.deleteNotification(notificationId).subscribe({
      next: () => {
        console.log('Notificación eliminada');
      },
      error: (error) => {
        console.error('Error al eliminar notificación:', error);
      }
    });
  }

  onNotificationClick(notification: Notification): void {
    // La navegación se manejará en el componente NotificationItem
    // Aquí podemos cerrar el menú si es necesario
    console.log('Notificación clickeada:', notification);
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }
} 