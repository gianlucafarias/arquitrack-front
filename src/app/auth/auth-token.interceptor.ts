import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    // Clonar la solicitud para añadir la nueva cabecera.
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    // Pasar la solicitud clonada al siguiente manejador.
    return next(cloned);
  }

  // Si no hay token, pasar la solicitud original.
  return next(req);
};
