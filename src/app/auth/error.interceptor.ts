import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const isAuthRoute = req.url.includes('/api/auth/login') || 
                           req.url.includes('/api/auth/register') || 
                           req.url.includes('/api/auth/google');
        
        if (!isAuthRoute) {
          snackBar.open('Su sesión ha expirado. Por favor, inicie sesión nuevamente', 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
          authService.handleTokenExpiration();
        }
      }
      
      return throwError(() => error);
    })
  );
}; 