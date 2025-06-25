import { CommonModule } from "@angular/common";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, Validators } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { Component, Inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { ProjectTask } from "../../project-detail.component";
import { TaskPayload, TaskStatus } from "../../../../tasks/tasks.models";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";

@Component({
    selector: 'app-new-task-dialog',
    templateUrl: './new-task-dialog.component.html',
    styles: [`
      .task-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .full-width {
        width: 100%;
      }
      .date-container {
        display: flex;
        gap: 16px;
      }
      .date-field {
        flex: 1;
      }
    `],
    standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule,
      MatDialogModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatSelectModule,
      MatIconModule,
      MatSnackBarModule
    ]
  })
  export class NewTaskDialogComponent {
    taskForm: FormGroup;
    taskStatuses = Object.values(TaskStatus);
    constructor(
      private fb: FormBuilder,
      private dialogRef: MatDialogRef<NewTaskDialogComponent>,
      private snackBar: MatSnackBar,
      @Inject(MAT_DIALOG_DATA) public data: { projectId: string }
    ) {
      this.taskForm = this.fb.group({
        title: [null, Validators.required],
        description: [null, Validators.required],
        startDate: [null, Validators.required],
        estimatedEndDate: [null, Validators.required],
        responsibleUserId: [null],
        status: [TaskStatus.Pendiente, Validators.required]
      });
    }
  
    saveTask(): void {
      if (this.taskForm.valid) {       
        const taskPayload: TaskPayload = {
          ...this.taskForm.value,
          projectId: this.data.projectId,
          startDate: this.taskForm.value.startDate ? new Date(this.taskForm.value.startDate).toISOString() : undefined,
          estimatedEndDate: this.taskForm.value.estimatedEndDate ? new Date(this.taskForm.value.estimatedEndDate).toISOString() : undefined,
        };
        this.dialogRef.close(taskPayload);
        this.snackBar.open('Tarea registrada exitosamente', 'Cerrar', { duration: 3000 });
      }
    }
  }