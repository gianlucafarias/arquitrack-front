import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { ClientsService } from '../clients.service';
import { Client } from '../clients.models';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.css']
})
export class ClientDetailComponent implements OnInit {
  client: Client | null = null;
  isLoading = true;
  clientId = '';
  
  constructor(
    private clientsService: ClientsService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.clientId = id;
        this.loadClientDetails(id);
      } else {
        this.router.navigate(['/clientes']);
      }
    });
  }
  
  loadClientDetails(clientId: string): void {
    this.isLoading = true;
    
    this.clientsService.getClientById(clientId).subscribe({
      next: (client) => {
        this.client = client;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar los detalles del cliente:', error);
        this.snackBar.open('Error al cargar los detalles del cliente', 'Cerrar', {
          duration: 5000
        });
        this.isLoading = false;
        this.router.navigate(['/clientes']);
      }
    });
  }
  
  deleteClient(): void {
    if (confirm(`¿Está seguro que desea eliminar al cliente ${this.client?.name}?`)) {
      this.clientsService.deleteClient(this.clientId).subscribe({
        next: () => {
          this.snackBar.open('Cliente eliminado con éxito', 'Cerrar', {
            duration: 3000
          });
          this.router.navigate(['/clientes']);
        },
        error: (error) => {
          console.error('Error al eliminar el cliente:', error);
          this.snackBar.open('Error al eliminar el cliente', 'Cerrar', {
            duration: 5000
          });
        }
      });
    }
  }
} 