import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ClientsService } from '../clients.service';
import { Client } from '../clients.models';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressBarModule
  ],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css']
})
export class ClientFormComponent implements OnInit {
  clientForm!: FormGroup;
  isEditing = false;
  currentClientId = '';
  isLoading = false;
  submitLoading = false;

  constructor(
    private fb: FormBuilder,
    private clientsService: ClientsService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    // Verificar si estamos en modo edición
    this.route.paramMap.subscribe(params => {
      const clientId = params.get('id');
      
      if (clientId) {
        this.isEditing = true;
        this.currentClientId = clientId;
        this.loadClientData(clientId);
      }
    });
  }

  private initForm(): void {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.email]],
      contactPhone: ['', [Validators.pattern(/^[0-9\+\-\s\(\)]{7,15}$/)]],
      address: ['']
    });
  }

  private loadClientData(clientId: string): void {
    this.isLoading = true;
    
    this.clientsService.getClientById(clientId).subscribe({
      next: (client) => {
        this.clientForm.patchValue({
          name: client.name,
          email: client.email,
          contactPhone: client.contactPhone,
          address: client.address
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos del cliente:', error);
        this.snackBar.open('Error al cargar datos del cliente', 'Cerrar', {
          duration: 5000
        });
        this.isLoading = false;
        this.router.navigate(['/clientes']);
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      return;
    }
    
    this.submitLoading = true;
    
    if (this.isEditing) {
      this.updateClient();
    } else {
      this.createClient();
    }
  }

  private createClient(): void {
    this.clientsService.createClient(this.clientForm.value).subscribe({
      next: (result) => {
        this.snackBar.open('Cliente creado con éxito', 'Cerrar', {
          duration: 3000
        });
        this.submitLoading = false;
        this.router.navigate(['/clientes']);
      },
      error: (error) => {
        console.error('Error al crear el cliente:', error);
        this.snackBar.open('Error al crear el cliente', 'Cerrar', {
          duration: 5000
        });
        this.submitLoading = false;
      }
    });
  }

  private updateClient(): void {
    this.clientsService.updateClient(this.currentClientId, this.clientForm.value).subscribe({
      next: (result) => {
        this.snackBar.open('Cliente actualizado con éxito', 'Cerrar', {
          duration: 3000
        });
        this.submitLoading = false;
        this.router.navigate(['/clientes']);
      },
      error: (error) => {
        console.error('Error al actualizar el cliente:', error);
        this.snackBar.open('Error al actualizar el cliente', 'Cerrar', {
          duration: 5000
        });
        this.submitLoading = false;
      }
    });
  }
} 