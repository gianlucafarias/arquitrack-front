import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LoginCredentials, LoginResponse } from '../auth.models';
import { Auth } from '@angular/fire/auth';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
    MatIconModule 
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  googleIcon: string = 'assets/google-icon.svg';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private auth: Auth,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password_provided: ['', Validators.required]
    });
    
  }



  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const formValue = this.loginForm.value;
      const credentials: LoginCredentials = {
        email: formValue.email,
        password_provided: formValue.password_provided
      };

      this.authService.login(credentials).subscribe({
        next: (response: LoginResponse) => {
          console.log('Login successful', response.message, response.user);
          this.router.navigate(['/']);
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          
          let errorMessage = '';
          
          // Manejo específico de errores según el código de estado
          if (err.status === 401) {
            errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
          } else if (err.status === 404) {
            errorMessage = 'Usuario no encontrado. Verifica tu email o regístrate.';
          } else if (err.status === 400) {
            errorMessage = err.error?.message || 'Datos de entrada inválidos.';
          } else if (err.status === 0) {
            errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
          } else {
            errorMessage = err.error?.message || 'Error en el login. Inténtalo de nuevo.';
          }
          
          // Mostrar error en snackbar
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
          
          console.error('Login error', err);
        }
      });
    }
  }

  async onGoogleSignIn(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      await this.authService.signInWithGoogle();
      this.isLoading = false;
    } catch (error: any) {
      this.isLoading = false;
      
      let errorMessage = '';
      
      // Manejo específico de errores de Google
      if (error.message.includes('Ventana cerrada por el usuario')) {
        errorMessage = 'Proceso cancelado. Inténtalo de nuevo si deseas iniciar sesión.';
      } else if (error.message.includes('Popup bloqueado')) {
        errorMessage = 'El navegador bloqueó la ventana emergente. Permite ventanas emergentes e inténtalo de nuevo.';
      } else if (error.message.includes('Dominio no autorizado')) {
        errorMessage = 'Error de configuración. Contacta al administrador.';
      } else {
        errorMessage = error.message || 'Error al iniciar sesión con Google. Inténtalo de nuevo.';
      }
      
      // Mostrar error en snackbar
      this.snackBar.open(errorMessage, 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      
      console.error('Error en componente:', error);
    }
  }
}
