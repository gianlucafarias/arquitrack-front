import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProjectInvitationsService } from '../../../project-invitations.service';
import { ProjectRole, PROJECT_ROLE_LABELS, ProjectInvitationPayload } from '../../../projects.models';

export interface InviteUserDialogData {
  projectId: string;
  projectName: string;
}

@Component({
  selector: 'app-invite-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './invite-user-dialog.component.html',
  styleUrls: ['./invite-user-dialog.component.css']
})
export class InviteUserDialogComponent implements OnInit {
  inviteForm!: FormGroup;
  isLoading = false;

  roleOptions = [
    { key: ProjectRole.VIEWER, value: PROJECT_ROLE_LABELS[ProjectRole.VIEWER] },
    { key: ProjectRole.COLLABORATOR, value: PROJECT_ROLE_LABELS[ProjectRole.COLLABORATOR] },
    { key: ProjectRole.MEMBER, value: PROJECT_ROLE_LABELS[ProjectRole.MEMBER] }
  ];

  roleDescriptions: Record<ProjectRole, string> = {
    [ProjectRole.VIEWER]: 'Puede ver el proyecto y sus documentos, pero no puede realizar cambios.',
    [ProjectRole.COLLABORATOR]: 'Puede ver y comentar en el proyecto, además de subir documentos.',
    [ProjectRole.MEMBER]: 'Acceso completo al proyecto: puede crear, editar y eliminar contenido.'
  };

  constructor(
    private fb: FormBuilder,
    private invitationsService: ProjectInvitationsService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<InviteUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InviteUserDialogData
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.inviteForm = this.fb.group({
      userEmail: ['', [Validators.required, Validators.email]],
      roleInProject: [ProjectRole.VIEWER, [Validators.required]]
    });
  }

  get selectedRoleDescription(): string {
    const selectedRole = this.inviteForm.get('roleInProject')?.value as ProjectRole;
    return selectedRole ? this.roleDescriptions[selectedRole] : '';
  }

  onSubmit(): void {
    if (this.inviteForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const invitationData: ProjectInvitationPayload = {
        projectId: this.data.projectId,
        userEmail: this.inviteForm.get('userEmail')?.value.trim(),
        roleInProject: this.inviteForm.get('roleInProject')?.value
      };

      this.invitationsService.createProjectInvitation(invitationData)
        .subscribe({
          next: (response) => {
            this.snackBar.open('Invitación enviada exitosamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snack']
            });
            this.dialogRef.close(response);
          },
          error: (error) => {
            this.snackBar.open(error.message, 'Cerrar', {
              duration: 5000,
              panelClass: ['error-snack']
            });
            this.isLoading = false;
          }
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 