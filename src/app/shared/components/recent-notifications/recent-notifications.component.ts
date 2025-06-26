import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { NotificationsService } from '../../services/notifications.service';
import { 
  Notification, 
  NotificationType,
  NotificationPriority,
  NOTIFICATION_TYPE_ICONS 
} from '../../models/notification.models';

@Component({
  selector: 'app-recent-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './recent-notifications.component.html',
  styleUrls: ['./recent-notifications.component.css'],
})
export class RecentNotificationsComponent implements OnInit, OnDestroy {
  recentNotifications: Notification[] = [];
  unreadCount = 0;
  totalNotifications = 0;
  isLoading = false;
  maxNotifications = 5; // Mostrar máximo 5 notificaciones en el dashboard

  private subscriptions: Subscription[] = [];

  NotificationPriority = NotificationPriority;

  constructor(private notificationsService: NotificationsService) {}

  ngOnInit(): void {
    this.subscribeToNotifications();
    this.loadRecentNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToNotifications(): void {
    // Suscribirse a las notificaciones más recientes
    const notificationsSub = this.notificationsService.notifications$.subscribe(
      notifications => {
        this.recentNotifications = (notifications || []).slice(0, this.maxNotifications);
      }
    );

    // Suscribirse al contador de no leídas
    const unreadCountSub = this.notificationsService.unreadCount$.subscribe(
      count => {
        this.unreadCount = count;
      }
    );

    this.subscriptions.push(notificationsSub, unreadCountSub);
  }

  private loadRecentNotifications(): void {
    this.isLoading = true;
    
    // Cargar notificaciones recientes
    this.notificationsService.getNotifications({ 
      includeRead: true, 
      limit: this.maxNotifications 
    }).subscribe({
      next: (response) => {
        this.totalNotifications = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar notificaciones recientes:', error);
        this.isLoading = false;
      }
    });
  }

  shouldShowCard(): boolean {
    // Mostrar la tarjeta si hay notificaciones o si está cargando
    return this.isLoading || this.recentNotifications.length > 0 || this.unreadCount > 0;
  }

  onNotificationClick(notification: Notification): void {
    // Marcar como leída si no lo está
    if (!notification.isRead) {
      this.markAsRead(notification);
    }
    
    // Navegar según el tipo de notificación (implementar navegación)
    console.log('Notificación clickeada:', notification);
  }

  markAsRead(notification: Notification, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.notificationsService.markAsRead(notification.id).subscribe({
      next: () => {
        console.log('Notificación marcada como leída');
      },
      error: (error) => {
        console.error('Error al marcar como leída:', error);
      }
    });
  }

  getNotificationIcon(type: NotificationType): string {
    return NOTIFICATION_TYPE_ICONS[type] || 'info';
  }

  getIconColor(notification: Notification): string {
    if (notification.priority === NotificationPriority.URGENT) {
      return 'warn';
    }
    if (notification.priority === NotificationPriority.HIGH) {
      return 'accent';
    }
    return 'primary';
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Ahora';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) { // 24 horas
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h`;
    } else if (diffInMinutes < 10080) { // 7 días
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  }
} 