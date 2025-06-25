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
  template: `
    <button 
      mat-icon-button 
      class="notifications-button"
      [matMenuTriggerFor]="notificationsMenu"
      [matBadge]="unreadCount"
      [matBadgeHidden]="unreadCount === 0"
      matBadgeColor="warn"
      matBadgeSize="medium"
      aria-label="Notificaciones">
      <mat-icon>notifications</mat-icon>
      <span *ngIf="unreadCount > 0" class="notification-dot"></span>
    </button>

    <mat-menu #notificationsMenu="matMenu" class="notifications-menu" panelClass="notifications-menu" xPosition="before" yPosition="below" [overlapTrigger]="false">
      <div class="notifications-menu-content" (click)="$event.stopPropagation()">
        <!-- Header del menú con gradiente -->
        <div class="notifications-header">
          <div class="header-title">
            <mat-icon class="header-icon">notifications_active</mat-icon>
            <div class="title-text">
              <h3>Notificaciones</h3>
              <span class="subtitle" *ngIf="unreadCount > 0">{{ unreadCount }} sin leer</span>
              <span class="subtitle" *ngIf="unreadCount === 0">Todo al día</span>
            </div>
          </div>
          <div class="header-actions">
            <button 
              mat-icon-button 
              (click)="refreshNotifications()" 
              matTooltip="Refrescar"
              class="refresh-button">
              <mat-icon>refresh</mat-icon>
            </button>
          </div>
        </div>

        <!-- Acciones rápidas -->
        <div class="quick-actions" *ngIf="unreadCount > 0">
          <button 
            mat-stroked-button 
            color="primary" 
            (click)="markAllAsRead()"
            class="mark-all-button">
            <mat-icon>done_all</mat-icon>
            Marcar todas como leídas
          </button>
        </div>

        <!-- Estado de carga -->
        <div *ngIf="isLoading" class="loading-container">
          <mat-spinner diameter="40" color="primary"></mat-spinner>
          <p>Cargando notificaciones...</p>
        </div>

        <!-- Lista de notificaciones -->
        <div *ngIf="!isLoading" class="notifications-list">
          <div *ngIf="notifications.length === 0" class="empty-state">
            <div class="empty-icon">
              <mat-icon>notifications_none</mat-icon>
            </div>
            <h4>¡Todo limpio!</h4>
            <p>No tienes notificaciones pendientes</p>
          </div>

          <div class="notifications-items">
            <app-notification-item
              *ngFor="let notification of notifications; trackBy: trackByNotificationId; let i = index"
              [notification]="notification"
              [compact]="true"
              (markAsRead)="onMarkAsRead($event)"
              (delete)="onDeleteNotification($event)"
              (click)="onNotificationClick($event)"
              [style.animation-delay]="i * 50 + 'ms'">
            </app-notification-item>
          </div>

          <!-- Mensaje de límite alcanzado -->
          <div *ngIf="notifications.length >= maxNotifications" class="limit-message">
            <mat-icon>info_outline</mat-icon>
            <span>Mostrando las {{ maxNotifications }} más recientes</span>
          </div>
        </div>

        <!-- Footer del menú -->
        <div class="notifications-footer">
          <a mat-flat-button color="primary" routerLink="/notificaciones" class="view-all-button">
            <mat-icon>open_in_new</mat-icon>
            Ver todas las notificaciones
          </a>
        </div>
      </div>
    </mat-menu>
  `,
  styleUrls: [],
  styles: [`
    .notifications-button {
      position: relative;
    }

    .notification-dot {
      position: absolute !important;
      top: 8px !important;
      right: 8px !important;
      width: 10px !important;
      height: 10px !important;
      background: #ff4444 !important;
      border-radius: 50% !important;
      border: 2px solid white !important;
      box-shadow: 0 0 6px rgba(255, 68, 68, 0.8) !important;
      z-index: 1000 !important;
      pointer-events: none !important;
      display: block !important;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 4px rgba(255, 68, 68, 0.5);
      }
      50% {
        box-shadow: 0 0 8px rgba(255, 68, 68, 0.8);
      }
      100% {
        box-shadow: 0 0 4px rgba(255, 68, 68, 0.5);
      }
    }



    .notifications-menu {
      max-width: none !important;
    }

    .notifications-menu-content {
      width: 680px;
      max-height: 500px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      border: 1px solid #e1e5e9;
      animation: menuSlideIn 0.3s ease-out;
    }

    @keyframes menuSlideIn {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .notifications-header {
      padding: 20px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 4px 4px 0 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #fff;
    }

    .title-text h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #fff;
    }

    .subtitle {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 2px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .refresh-button {
      width: 36px;
      height: 36px;
      color: white;
      transition: all 0.3s ease;
    }

    .refresh-button:hover {
      background-color: rgba(255, 255, 255, 0.2);
      transform: rotate(180deg);
    }

    .quick-actions {
      padding: 12px 16px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }

    .mark-all-button {
      width: 100%;
      font-size: 13px;
      padding: 8px 16px;
      height: 36px;
      border-radius: 6px;
      transition: all 0.3s ease;
    }

    .mark-all-button:hover {
      background-color: #e3f2fd;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 16px;
      gap: 20px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      margin: 16px;
      border-radius: 8px;
    }

    .loading-container p {
      margin: 0;
      font-size: 14px;
      color: #666;
      font-weight: 500;
      animation: fadeInOut 2s infinite;
    }

    @keyframes fadeInOut {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }

    .notifications-list {
      flex: 1;
      overflow-y: auto;
      max-height: 500px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 16px;
      gap: 16px;
      color: #666;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 8px;
      margin: 16px;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
    }

    .empty-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }

    .empty-state mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .empty-state h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
      text-align: center;
      color: #666;
    }

    .notifications-items {
      padding: 4px 0;
    }

    .limit-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: linear-gradient(135deg, #e3f2fd 0%, #f0f7ff 100%);
      border-top: 1px solid #bbdefb;
      font-size: 12px;
      color: #1565c0;
      font-weight: 500;
      margin: 0 8px 8px 8px;
      border-radius: 6px;
    }

    .limit-message mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #1976d2;
    }

    .notifications-footer {
      padding: 16px;
      border-top: 1px solid #e9ecef;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 0 0 4px 4px;
    }

    .view-all-button {
      width: 100%;
      justify-content: center;
      font-size: 13px;
      font-weight: 500;
      height: 40px;
      border-radius: 6px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transition: all 0.3s ease;
    }

    .view-all-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    }

    /* Estilos para el scroll de la lista */
    .notifications-list::-webkit-scrollbar {
      width: 6px;
    }

    .notifications-list::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .notifications-list::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .notifications-list::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }

    /* Animación para nuevas notificaciones */
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    app-notification-item {
      animation: slideIn 0.3s ease-out;
    }
  `]
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
    this.refreshNotifications();
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
    
    // Simular delay mínimo para mostrar el spinner
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
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