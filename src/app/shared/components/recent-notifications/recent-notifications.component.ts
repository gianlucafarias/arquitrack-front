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
  template: `
    <mat-card *ngIf="shouldShowCard()" class="notifications-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>notifications</mat-icon>
          Notificaciones Recientes
          <mat-icon 
            [matBadge]="unreadCount" 
            matBadgeColor="warn" 
            matBadgeSize="small"
            *ngIf="unreadCount > 0">
            notification_important
          </mat-icon>
        </mat-card-title>
        <div class="header-actions">
          <button 
            mat-icon-button 
            routerLink="/notificaciones" 
            matTooltip="Ver todas las notificaciones"
            class="view-all-btn">
            <mat-icon>open_in_new</mat-icon>
          </button>
        </div>
      </mat-card-header>

      <mat-card-content>
        <div *ngIf="isLoading" class="loading-container">
          <mat-spinner diameter="30"></mat-spinner>
          <p>Cargando notificaciones...</p>
        </div>

        <div *ngIf="!isLoading" class="notifications-list">
          <div *ngIf="recentNotifications.length === 0" class="empty-state">
            <mat-icon>notifications_none</mat-icon>
            <p>No tienes notificaciones recientes</p>
          </div>

          <div 
            *ngFor="let notification of recentNotifications; let last = last" 
            class="notification-item"
            [class.unread]="!notification.isRead"
            [class.urgent]="notification.priority === NotificationPriority.URGENT"
            [class.high]="notification.priority === NotificationPriority.HIGH"
            [class.last]="last"
            (click)="onNotificationClick(notification)">
            
            <div class="notification-icon">
              <mat-icon [color]="getIconColor(notification)">
                {{ getNotificationIcon(notification.type) }}
              </mat-icon>
            </div>
            
            <div class="notification-content">
              <div class="notification-header">
                <h4 class="notification-title">{{ notification.title }}</h4>
                <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
              </div>
              
              <p class="notification-message">{{ notification.message }}</p>
              
              <!-- Metadatos importantes -->
              <div class="notification-metadata" *ngIf="notification.metadata?.projectName">
                <mat-icon>business_center</mat-icon>
                <span>{{ notification.metadata.projectName }}</span>
              </div>

              <!-- Indicador de prioridad alta -->
              <div class="priority-indicator" *ngIf="notification.priority === NotificationPriority.URGENT">
                <mat-icon>priority_high</mat-icon>
                <span>Urgente</span>
              </div>
            </div>

            <div class="notification-actions" *ngIf="!notification.isRead">
              <button 
                mat-icon-button 
                (click)="markAsRead(notification, $event)"
                matTooltip="Marcar como leída"
                class="mark-read-btn">
                <mat-icon>check</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer con acción -->
        <div class="card-footer" *ngIf="!isLoading && recentNotifications.length > 0">
          <button 
            mat-button 
            color="primary" 
            routerLink="/notificaciones"
            class="view-all-button">
            <mat-icon>list</mat-icon>
            Ver todas las notificaciones ({{ totalNotifications }})
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .notifications-card {
      margin-bottom: 24px;
      border-left: 4px solid #ff9800;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-actions {
      display: flex;
      align-items: center;
    }

    .view-all-btn {
      width: 32px;
      height: 32px;
    }

    .loading-container {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      justify-content: center;
    }

    .loading-container p {
      margin: 0;
      color: #666;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px;
      gap: 12px;
      color: #666;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #ccc;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .notification-item:hover {
      background-color: #fafafa;
      border-radius: 4px;
      margin: 0 -8px;
      padding-left: 8px;
      padding-right: 8px;
    }

    .notification-item.last {
      border-bottom: none;
    }

    .notification-item.unread {
      background-color: #f8f9ff;
      border-left: 3px solid #2196f3;
      margin-left: -8px;
      padding-left: 8px;
    }

    .notification-item.urgent {
      border-left: 3px solid #f44336;
      margin-left: -8px;
      padding-left: 8px;
    }

    .notification-item.high {
      border-left: 3px solid #ff9800;
      margin-left: -8px;
      padding-left: 8px;
    }

    .notification-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 4px;
      gap: 8px;
    }

    .notification-title {
      margin: 0;
      font-size: 13px;
      font-weight: 500;
      color: #333;
      line-height: 1.2;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .notification-time {
      font-size: 10px;
      color: #666;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .notification-message {
      margin: 0 0 6px 0;
      font-size: 12px;
      color: #555;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .notification-metadata {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      color: #666;
      background-color: #f0f0f0;
      padding: 2px 6px;
      border-radius: 8px;
      width: fit-content;
      margin-bottom: 4px;
    }

    .notification-metadata mat-icon {
      font-size: 12px;
      width: 12px;
      height: 12px;
    }

    .priority-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      color: #f44336;
      font-weight: 500;
    }

    .priority-indicator mat-icon {
      font-size: 12px;
      width: 12px;
      height: 12px;
    }

    .notification-actions {
      flex-shrink: 0;
    }

    .mark-read-btn {
      width: 28px;
      height: 28px;
      line-height: 28px;
    }

    .mark-read-btn mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .card-footer {
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
      margin-top: 8px;
    }

    .view-all-button {
      width: 100%;
      justify-content: center;
      font-size: 13px;
    }

    /* Estados especiales */
    .notification-item.unread .notification-title {
      font-weight: 600;
    }

    .notification-item.urgent .notification-title {
      color: #f44336;
    }

    .notification-item.high .notification-title {
      color: #ff9800;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .notification-item {
        margin: 0 -12px;
        padding-left: 12px;
        padding-right: 12px;
      }

      .notification-item:hover {
        margin: 0 -12px;
        padding-left: 12px;
        padding-right: 12px;
      }

      .notification-item.unread,
      .notification-item.urgent,
      .notification-item.high {
        margin-left: -12px;
        padding-left: 12px;
      }
    }
  `]
})
export class RecentNotificationsComponent implements OnInit, OnDestroy {
  recentNotifications: Notification[] = [];
  unreadCount = 0;
  totalNotifications = 0;
  isLoading = false;
  maxNotifications = 5; // Mostrar máximo 5 notificaciones en el dashboard

  private subscriptions: Subscription[] = [];

  // Expose enums for template
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
        // La actualización se manejará automáticamente por el observable
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