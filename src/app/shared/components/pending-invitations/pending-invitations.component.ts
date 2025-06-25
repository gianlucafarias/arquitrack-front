import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ProjectInvitationsService } from '../../../projects/project-invitations.service';
import { 
  ProjectInvitation, 
  ProjectRole, 
  PROJECT_ROLE_LABELS 
} from '../../../projects/projects.models';

@Component({
  selector: 'app-pending-invitations',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  template: `
    <mat-card *ngIf="pendingInvitations.length > 0" class="invitations-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>mail</mat-icon>
          Invitaciones pendientes
         
        </mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <div *ngIf="isLoading" class="loading-container">
          <mat-spinner diameter="30"></mat-spinner>
          <p>Cargando invitaciones...</p>
        </div>

        <div *ngIf="!isLoading" class="invitations-list">
          <div 
            *ngFor="let invitation of pendingInvitations" 
            class="invitation-item">
            
            <div class="invitation-info">
              <div class="project-info">
                <mat-icon>folder</mat-icon>
                <div>
                  <div class="project-name">{{ invitation.project?.name || 'Proyecto sin nombre' }}</div>
                                 <div class="project-location" *ngIf="invitation.project?.location">
                 {{ invitation.project?.location }}
               </div>
                </div>
              </div>
              
              <div class="role-info">
                <span>Rol:</span>
                <mat-chip [color]="getRoleColor(invitation.roleInProject)">
                  {{ getRoleLabel(invitation.roleInProject) }}
                </mat-chip>
              </div>
              
                             <div class="invitation-meta">
                 <span class="invited-by">
                   Invitado por: {{ invitation.invitedBy?.name || invitation.invitedBy?.email }}
                 </span>
                 <span class="invitation-date">
                   {{ formatDate(invitation.createdAt) }}
                 </span>
               </div>
            </div>

            <div class="invitation-actions">
              <button 
                mat-raised-button 
                color="primary" 
                (click)="acceptInvitation(invitation)"
                [disabled]="processingInvitations.has(invitation.id)"
                matTooltip="Aceptar invitación">
                <mat-spinner 
                  *ngIf="processingInvitations.has(invitation.id)" 
                  diameter="16">
                </mat-spinner>
                <mat-icon *ngIf="!processingInvitations.has(invitation.id)">check</mat-icon>
                Aceptar
              </button>
              
              <button 
                mat-button 
                color="warn" 
                (click)="rejectInvitation(invitation)"
                [disabled]="processingInvitations.has(invitation.id)"
                matTooltip="Rechazar invitación">
                <mat-icon>close</mat-icon>
                Rechazar
              </button>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .invitations-card {
      margin-bottom: 24px;
      border-left: 4px solid #2196f3;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }

    .loading-container {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      justify-content: center;
    }

    .invitations-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .invitation-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #fafafa;
      gap: 16px;
    }

    .invitation-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .project-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .project-name {
      font-weight: 500;
      font-size: 16px;
    }

    .project-location {
      font-size: 14px;
      color: #666;
    }

    .role-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .invitation-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      color: #666;
    }

    .invitation-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 120px;
    }

    .invitation-actions button {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    mat-chip {
      font-size: 12px;
    }

    @media (max-width: 768px) {
      .invitation-item {
        flex-direction: column;
        align-items: stretch;
      }

      .invitation-actions {
        flex-direction: row;
        min-width: auto;
      }
    }
  `]
})
export class PendingInvitationsComponent implements OnInit {
  pendingInvitations: ProjectInvitation[] = [];
  isLoading = false;
  processingInvitations = new Set<string>();

  constructor(
    private invitationsService: ProjectInvitationsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPendingInvitations();
  }

  loadPendingInvitations(): void {
    this.isLoading = true;
    this.invitationsService.getPendingInvitations().subscribe({
      next: (invitations) => {
        this.pendingInvitations = invitations;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open(error.message, 'Cerrar', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  acceptInvitation(invitation: ProjectInvitation): void {
    this.processingInvitations.add(invitation.id);
    
    this.invitationsService.acceptProjectInvitation(invitation.id).subscribe({
      next: () => {
        this.snackBar.open(
          `Has aceptado la invitación al proyecto "${invitation.project?.name}"`, 
          'Cerrar', 
          { duration: 5000, panelClass: ['success-snack'] }
        );
        this.processingInvitations.delete(invitation.id);
        this.loadPendingInvitations(); // Recargar la lista
      },
      error: (error) => {
        this.snackBar.open(error.message, 'Cerrar', { 
          duration: 5000, 
          panelClass: ['error-snack'] 
        });
        this.processingInvitations.delete(invitation.id);
      }
    });
  }

  rejectInvitation(invitation: ProjectInvitation): void {
    if (confirm(`¿Está seguro de que desea rechazar la invitación al proyecto "${invitation.project?.name}"?`)) {
      this.processingInvitations.add(invitation.id);
      
      this.invitationsService.rejectProjectInvitation(invitation.id).subscribe({
        next: () => {
          this.snackBar.open(
            `Has rechazado la invitación al proyecto "${invitation.project?.name}"`, 
            'Cerrar', 
            { duration: 3000 }
          );
          this.processingInvitations.delete(invitation.id);
          this.loadPendingInvitations(); // Recargar la lista
        },
        error: (error) => {
          this.snackBar.open(error.message, 'Cerrar', { 
            duration: 5000, 
            panelClass: ['error-snack'] 
          });
          this.processingInvitations.delete(invitation.id);
        }
      });
    }
  }

  getRoleLabel(role: ProjectRole): string {
    return PROJECT_ROLE_LABELS[role];
  }

  getRoleColor(role: ProjectRole): string {
    switch (role) {
      case ProjectRole.MEMBER:
        return 'primary';
      case ProjectRole.COLLABORATOR:
        return 'accent';
      case ProjectRole.VIEWER:
        return 'basic';
      default:
        return 'basic';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
} 