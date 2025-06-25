import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';

import { ClientsService } from '../clients.service';
import { Client } from '../clients.models';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatSnackBarModule,
    MatPaginatorModule
  ],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  isLoading = true;
  searchText = '';
  filteredClients: Client[] = [];
  
  displayedColumns: string[] = ['name', 'email', 'contactPhone', 'address', 'actions'];
  
  constructor(
    private clientsService: ClientsService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.loadClients();
  }
  
  loadClients(): void {
    this.isLoading = true;
    this.clientsService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.filteredClients = [...this.clients];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.snackBar.open('Error al cargar los clientes', 'Cerrar', {
          duration: 5000,
        });
        this.isLoading = false;
      }
    });
  }
  
  applyFilter(): void {
    if (!this.searchText.trim()) {
      this.filteredClients = [...this.clients];
      return;
    }
    
    const searchTextLower = this.searchText.trim().toLowerCase();
    this.filteredClients = this.clients.filter(client => 
      client.name.toLowerCase().includes(searchTextLower) ||
      (client.email && client.email.toLowerCase().includes(searchTextLower)) ||
      (client.contactPhone && client.contactPhone.toLowerCase().includes(searchTextLower)) ||
      (client.address && client.address.toLowerCase().includes(searchTextLower))
    );
  }
  
  deleteClient(client: Client): void {
    if (confirm(`¿Está seguro que desea eliminar al cliente ${client.name}?`)) {
      this.clientsService.deleteClient(client.id).subscribe({
        next: (response) => {
          this.snackBar.open('Cliente eliminado con éxito', 'Cerrar', {
            duration: 3000,
          });
          this.loadClients(); 
        },
        error: (error) => {
          console.error('Error al eliminar cliente:', error);
          this.snackBar.open('Error al eliminar el cliente', 'Cerrar', {
            duration: 5000,
          });
        }
      });
    }
  }
} 