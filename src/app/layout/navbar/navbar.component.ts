import { Component, Output, EventEmitter } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { NotificationsMenuComponent } from '../../shared/components/notifications-menu/notifications-menu.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatToolbarModule, 
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    NotificationsMenuComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Output() sidenavToggle = new EventEmitter<void>();

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  onToggleSidenav(): void {
    this.sidenavToggle.emit();
  }

  viewProfile(): void {
    console.log('Ir al perfil del usuario');
  }

  logout(): void {
    console.log('Cerrar sesión');
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
