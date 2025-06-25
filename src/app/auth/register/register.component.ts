import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RegisterPayload, RegisterResponse } from '../auth.models';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  googleIcon: string = 'assets/google-icon.svg';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      const payload: RegisterPayload = {
        name: `${formValue.nombre} ${formValue.apellido}`,
        email: formValue.email,
        password: formValue.password
      };

      this.authService.register(payload).subscribe({
        next: (response: RegisterResponse) => {
          console.log('Registration successful', response.message);
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || err.message || 'Error en el registro. Por favor, inténtalo de nuevo.';
          console.error('Registration error', err);
        }
      });
    }
  }

  async onGoogleSignIn(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      await this.authService.signInWithGoogle();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al iniciar sesión con Google. Inténtalo de nuevo.';
      this.isLoading = false;
      console.error('Error en componente:', error);
    }
  }
}
