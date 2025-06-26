import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProjectMember, ProjectRole, PROJECT_ROLE_LABELS } from '../../../projects.models';
import { ProjectInvitationsService } from '../../../project-invitations.service';

export interface UserInfoDialogData {
  member: ProjectMember;
  projectId: string;
  isOwner: boolean;
  currentUserId: string;
  canManageMembers: boolean;
}

@Component({
  selector: 'app-user-info-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './user-info-dialog.component.html',
  styleUrls: ['./user-info-dialog.component.css']
})
export class UserInfoDialogComponent {
  ProjectRole = ProjectRole;

  constructor(
    public dialogRef: MatDialogRef<UserInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserInfoDialogData,
    private invitationsService: ProjectInvitationsService,
    private snackBar: MatSnackBar
  ) {}

  getRoleLabel(role: ProjectRole | 'OWNER'): string {
    if (role === 'OWNER') return 'Propietario';
    return PROJECT_ROLE_LABELS[role as ProjectRole];
  }

  getRoleColor(role: ProjectRole | 'OWNER'): string {
    if (role === 'OWNER') return 'warn';
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

  getUserPermissions(): Array<{action: string, allowed: boolean}> {
    const role = this.data.isOwner ? 'OWNER' : this.data.member.roleInProject;
    
    return [
      { action: 'Ver proyecto', allowed: true },
      { action: 'Editar proyecto', allowed: role === 'OWNER' || role === ProjectRole.MEMBER },
      { action: 'Eliminar proyecto', allowed: role === 'OWNER' },
      { action: 'Gestionar tareas', allowed: role === 'OWNER' || role === ProjectRole.MEMBER || role === ProjectRole.COLLABORATOR },
      { action: 'Registrar visitas', allowed: role === 'OWNER' || role === ProjectRole.MEMBER || role === ProjectRole.COLLABORATOR },
      { action: 'Subir documentos', allowed: role === 'OWNER' || role === ProjectRole.MEMBER },
      { action: 'Eliminar documentos', allowed: role === 'OWNER' || role === ProjectRole.MEMBER },
      { action: 'Subir fotos', allowed: role === 'OWNER' || role === ProjectRole.MEMBER || role === ProjectRole.COLLABORATOR },
      { action: 'Ver presupuesto', allowed: role === 'OWNER' || role === ProjectRole.MEMBER },
      { action: 'Gestionar cronograma', allowed: role === 'OWNER' || role === ProjectRole.MEMBER },
      { action: 'Gestionar miembros', allowed: role === 'OWNER' }
    ];
  }

  canLeaveProject(): boolean {
    // El propietario no puede salir del proyecto
    if (this.data.isOwner) return false;
    // Solo el propio usuario puede salir del proyecto
    return this.data.member.userId === this.data.currentUserId;
  }

  leaveProject(): void {
    if (!this.canLeaveProject()) return;

    const confirmation = confirm('¿Está seguro de que desea salir de este proyecto? Esta acción no se puede deshacer.');
    
    if (confirmation) {
      this.invitationsService.removeProjectMember(this.data.member.id).subscribe({
        next: () => {
          this.snackBar.open('Has salido del proyecto exitosamente', 'Cerrar', { duration: 3000 });
          this.dialogRef.close('left_project');
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Error al salir del proyecto', 'Cerrar', { duration: 5000 });
        }
      });
    }
  }

  removeMember(): void {
    if (!this.data.canManageMembers || this.data.isOwner) return;

    const userName = this.data.member.user.name || this.data.member.user.email;
    const confirmation = confirm(`¿Está seguro de que desea remover a ${userName} del proyecto?`);
    
    if (confirmation) {
      this.invitationsService.removeProjectMember(this.data.member.id).subscribe({
        next: () => {
          this.snackBar.open('Miembro removido del proyecto', 'Cerrar', { duration: 3000 });
          this.dialogRef.close('member_removed');
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Error al remover miembro', 'Cerrar', { duration: 5000 });
        }
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }
} 