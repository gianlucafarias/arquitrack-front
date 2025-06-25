import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';

import { ProjectInvitationsService } from '../../project-invitations.service';
import { 
  ProjectMember, 
  ProjectInvitation, 
  ProjectRole, 
  InvitationStatus,
  PROJECT_ROLE_LABELS,
  INVITATION_STATUS_LABELS 
} from '../../projects.models';
import { InviteUserDialogComponent, InviteUserDialogData } from '../dialogs/invite-user-dialog/invite-user-dialog.component';

@Component({
  selector: 'app-project-members',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule
  ],
  templateUrl: './project-members.component.html',
  styleUrls: ['./project-members.component.css']
})
export class ProjectMembersComponent implements OnInit, OnChanges {
  @Input() projectId!: string;
  @Input() projectName!: string;
  @Input() canManageMembers = false;
  @Input() currentUserId?: string;

  members: ProjectMember[] = [];
  invitations: ProjectInvitation[] = [];
  isLoadingMembers = false;
  isLoadingInvitations = false;

  memberColumns = ['user', 'role', 'status', 'joinedAt', 'actions'];
  invitationColumns = ['email', 'invitationRole', 'invitationStatus', 'createdAt', 'invitationActions'];

  InvitationStatus = InvitationStatus;

  constructor(
    private invitationsService: ProjectInvitationsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadMembers();
    if (this.canManageMembers) {
      this.loadInvitations();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && !changes['projectId'].firstChange) {
      this.loadMembers();
      if (this.canManageMembers) {
        this.loadInvitations();
      }
    }
  }

  loadMembers(): void {
    if (!this.projectId) return;

    this.isLoadingMembers = true;
    this.invitationsService.getProjectMembers(this.projectId).subscribe({
      next: (members) => {
        this.members = members;
        this.isLoadingMembers = false;
      },
      error: (error) => {
        this.snackBar.open(error.message, 'Cerrar', { duration: 5000 });
        this.isLoadingMembers = false;
      }
    });
  }

  loadInvitations(): void {
    if (!this.projectId) return;

    this.isLoadingInvitations = true;
    this.invitationsService.getProjectInvitations(this.projectId).subscribe({
      next: (invitations) => {
        this.invitations = invitations;
        this.isLoadingInvitations = false;
      },
      error: (error) => {
        this.snackBar.open(error.message, 'Cerrar', { duration: 5000 });
        this.isLoadingInvitations = false;
      }
    });
  }

  openInviteDialog(): void {
    const dialogRef = this.dialog.open(InviteUserDialogComponent, {
      data: {
        projectId: this.projectId,
        projectName: this.projectName
      } as InviteUserDialogData,
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadInvitations();
      }
    });
  }

  cancelInvitation(invitation: ProjectInvitation): void {
    this.invitationsService.cancelProjectInvitation(invitation.id).subscribe({
      next: () => {
        this.snackBar.open('Invitación cancelada', 'Cerrar', { duration: 3000 });
        this.loadInvitations();
      },
      error: (error) => {
        this.snackBar.open(error.message, 'Cerrar', { duration: 5000 });
      }
    });
  }

  removeMember(member: ProjectMember): void {
    if (confirm(`¿Está seguro de que desea remover a ${member.user.name || member.user.email} del proyecto?`)) {
      this.invitationsService.removeProjectMember(member.id).subscribe({
        next: () => {
          this.snackBar.open('Miembro removido del proyecto', 'Cerrar', { duration: 3000 });
          this.loadMembers();
        },
        error: (error) => {
          this.snackBar.open(error.message, 'Cerrar', { duration: 5000 });
        }
      });
    }
  }

  getRoleLabel(role: ProjectRole): string {
    return PROJECT_ROLE_LABELS[role];
  }

  getStatusLabel(status: InvitationStatus): string {
    return INVITATION_STATUS_LABELS[status];
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

  getStatusColor(status: InvitationStatus): string {
    switch (status) {
      case InvitationStatus.ACCEPTED:
        return 'primary';
      case InvitationStatus.PENDING:
        return 'accent';
      case InvitationStatus.REJECTED:
        return 'warn';
      case InvitationStatus.CANCELLED:
        return 'basic';
      default:
        return 'basic';
    }
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return 'Sin definir';
    return new Date(date).toLocaleDateString('es-ES');
  }
} 