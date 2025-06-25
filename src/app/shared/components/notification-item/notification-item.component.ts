import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule, Router } from '@angular/router';

import { 
  Notification, 
  NotificationType,
  NotificationPriority,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_ICONS,
  NOTIFICATION_PRIORITY_COLORS 
} from '../../models/notification.models';

@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    RouterModule
  ],
  template: `
    <div class="notification-item" 
         [class.unread]="!notification.isRead"
         [class.urgent]="notification.priority === NotificationPriority.URGENT"
         [class.high]="notification.priority === NotificationPriority.HIGH">
      
      <!-- Indicador de no leída -->
      <div class="read-indicator" *ngIf="!notification.isRead"></div>
      
      <!-- Icono de la notificación -->
      <div class="notification-icon">
        <mat-icon [color]="getIconColor()">{{ getNotificationIcon() }}</mat-icon>
      </div>
      
      <!-- Contenido principal -->
      <div class="notification-content" (click)="onNotificationClick()">
        <div class="notification-header">
          <h4 class="notification-title">{{ notification.title }}</h4>
          <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
        </div>
        
        <p class="notification-message">{{ notification.message }}</p>
        
        <!-- Información adicional basada en metadatos -->
        <div class="notification-metadata" *ngIf="notification.metadata">
          <span class="metadata-item" *ngIf="notification.metadata.projectName">
            <mat-icon>business_center</mat-icon>
            {{ notification.metadata.projectName }}
          </span>
          <span class="metadata-item" *ngIf="notification.metadata.taskTitle">
            <mat-icon>task</mat-icon>
            {{ notification.metadata.taskTitle }}
          </span>
          <span class="metadata-item" *ngIf="notification.metadata.fileName">
            <mat-icon>description</mat-icon>
            {{ notification.metadata.fileName }}
          </span>
        </div>
        
        <!-- Chip de prioridad para urgentes y altas -->
        <mat-chip 
          *ngIf="notification.priority === NotificationPriority.URGENT || notification.priority === NotificationPriority.HIGH"
          [color]="getPriorityColor()"
          class="priority-chip">
          {{ getPriorityLabel() }}
        </mat-chip>
      </div>
      
      <!-- Menú de acciones -->
      <div class="notification-actions">
        <button mat-icon-button [matMenuTriggerFor]="actionMenu" class="action-button">
          <mat-icon>more_vert</mat-icon>
        </button>
        <mat-menu #actionMenu="matMenu">
          <button mat-menu-item *ngIf="!notification.isRead" (click)="onMarkAsRead()">
            <mat-icon>mark_email_read</mat-icon>
            <span>Marcar como leída</span>
          </button>
          <button mat-menu-item (click)="onDelete()">
            <mat-icon>delete</mat-icon>
            <span>Eliminar</span>
          </button>
          <button mat-menu-item *ngIf="getActionLink()" (click)="onGoToRelatedItem()">
            <mat-icon>open_in_new</mat-icon>
            <span>Ir a elemento</span>
          </button>
        </mat-menu>
      </div>
    </div>
  `,
  styles: [`
    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
      cursor: pointer;
      transition: background-color 0.2s ease;
      position: relative;
    }

    .notification-item:hover {
      background-color: #f5f5f5;
    }

    .notification-item.unread {
      background-color: #f8f9ff;
      border-left: 4px solid #2196f3;
    }

    .notification-item.urgent {
      border-left: 4px solid #f44336;
    }

    .notification-item.high {
      border-left: 4px solid #ff9800;
    }

    .read-indicator {
      position: absolute;
      left: 4px;
      top: 16px;
      width: 8px;
      height: 8px;
      background-color: #2196f3;
      border-radius: 50%;
    }

    .notification-icon {
      flex-shrink: 0;
      margin-top: 4px;
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
      font-size: 14px;
      font-weight: 500;
      color: #333;
      line-height: 1.2;
    }

    .notification-time {
      font-size: 11px;
      color: #666;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .notification-message {
      margin: 0 0 8px 0;
      font-size: 13px;
      color: #555;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .notification-metadata {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
    }

    .metadata-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: #666;
      background-color: #f0f0f0;
      padding: 2px 6px;
      border-radius: 12px;
    }

    .metadata-item mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .priority-chip {
      font-size: 10px;
      height: 20px;
      line-height: 20px;
    }

    .notification-actions {
      flex-shrink: 0;
    }

    .action-button {
      width: 32px;
      height: 32px;
      line-height: 32px;
    }

    .action-button mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
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
  `]
})
export class NotificationItemComponent {
  @Input() notification!: Notification;
  @Input() compact = false;
  
  @Output() markAsRead = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() click = new EventEmitter<Notification>();

  // Expose enums for template
  NotificationPriority = NotificationPriority;

  constructor(private router: Router) {}

  onNotificationClick(): void {
    if (!this.notification.isRead) {
      this.onMarkAsRead();
    }
    this.click.emit(this.notification);
    
    // Navegar al elemento
    const linkInfo = this.getActionLink();
    if (linkInfo) {
      if (linkInfo.queryParams) {
        this.router.navigate([linkInfo.url], { queryParams: linkInfo.queryParams });
      } else {
        this.router.navigate([linkInfo.url]);
      }
    }
  }

  onMarkAsRead(): void {
    this.markAsRead.emit(this.notification.id);
  }

  onDelete(): void {
    this.delete.emit(this.notification.id);
  }

  onGoToRelatedItem(): void {
    const linkInfo = this.getActionLink();
    if (linkInfo) {
      if (linkInfo.queryParams) {
        this.router.navigate([linkInfo.url], { queryParams: linkInfo.queryParams });
      } else {
        this.router.navigate([linkInfo.url]);
      }
    }
  }

  getNotificationIcon(): string {
    return NOTIFICATION_TYPE_ICONS[this.notification.type] || 'info';
  }

  getIconColor(): string {
    if (this.notification.priority === NotificationPriority.URGENT) {
      return 'warn';
    }
    if (this.notification.priority === NotificationPriority.HIGH) {
      return 'accent';
    }
    return 'primary';
  }

  getPriorityColor(): string {
    return NOTIFICATION_PRIORITY_COLORS[this.notification.priority];
  }

  getPriorityLabel(): string {
    switch (this.notification.priority) {
      case NotificationPriority.URGENT:
        return 'Urgente';
      case NotificationPriority.HIGH:
        return 'Alta';
      default:
        return '';
    }
  }

  getActionLink(): {url: string, queryParams?: any} | null {
    if (!this.notification.projectId) return null;

    const projectUrl = `/proyectos/${this.notification.projectId}`;

    switch (this.notification.type) {
      case NotificationType.PROJECT_INVITATION_RECEIVED:
        return { url: '/dashboard' }; // Ver invitaciones pendientes
      case NotificationType.TASK_ASSIGNED:
      case NotificationType.TASK_STATUS_CHANGED:
      case NotificationType.TASK_OVERDUE:
      case NotificationType.TASK_CREATED:
        return { url: projectUrl, queryParams: { tab: 1 } }; // Tab de Tareas
      case NotificationType.SITE_VISIT_REGISTERED:
        return { url: projectUrl, queryParams: { tab: 0 } }; // Tab de Información General (contiene visitas)
      case NotificationType.DOCUMENT_UPLOADED:
        return { url: projectUrl, queryParams: { tab: 2 } }; // Tab de Archivos
      case NotificationType.PROJECT_STATUS_CHANGED:
      case NotificationType.PROJECT_PROGRESS_UPDATED:
        return { url: projectUrl }; // Tab por defecto (Información General)
      default:
        return null;
    }
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Ahora';
    } else if (diffInMinutes < 60) {
      return `hace ${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) { // 24 horas
      const hours = Math.floor(diffInMinutes / 60);
      return `hace ${hours}h`;
    } else if (diffInMinutes < 10080) { // 7 días
      const days = Math.floor(diffInMinutes / 1440);
      return `hace ${days}d`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  }
} 