import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { LoginCredentials, LoginResponse, RegisterPayload, RegisterResponse, GoogleAuthPayload, GoogleAuthResponse } from './auth.models';
import { Router } from '@angular/router';
import { Auth, GoogleAuthProvider, signInWithPopup, User, signInWithCustomToken } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private readonly TOKEN_KEY = 'authToken';
  private platformId = inject(PLATFORM_ID);
  private authStatusSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  private isLoggingOut = false; // Bandera para evitar mensajes durante logout manual
  
  // Observable público para el estado de autenticación
  public authStatus$ = this.authStatusSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: Auth
  ) {}

  /**
   * Autentica con Firebase usando el token del backend
   */
  private async authenticateWithFirebase(token: string): Promise<void> {
    try {
      // Enviar token al backend para obtener un custom token de Firebase
      const firebaseTokenResponse = await this.http.post<{firebaseToken: string}>(`${this.apiUrl}/firebase-token`, {
        token: token
      }).toPromise();
      
      if (firebaseTokenResponse?.firebaseToken) {
        // Autenticar con Firebase usando el custom token
        await signInWithCustomToken(this.auth, firebaseTokenResponse.firebaseToken);
      }
    } catch (error) {
      console.warn('Error al autenticar con Firebase:', error);
      // No bloquear el login si Firebase falla
    }
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(async (response: LoginResponse) => {
        if (isPlatformBrowser(this.platformId) && response && response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          this.authStatusSubject.next(true);
          
          await this.authenticateWithFirebase(response.token);
        }
      })
    );
  }

  // Método para autenticación con Google
  async signInWithGoogle(): Promise<void> {
    try {
      console.log('Iniciando autenticación con Google...');
      
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(this.auth, provider);
      
      
      // Obtener el token de ID de Firebase
      const idToken = await result.user.getIdToken();

      // Enviar el token al backend
      const payload: GoogleAuthPayload = { idToken: idToken };
      
      this.http.post<GoogleAuthResponse>(`${this.apiUrl}/google`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).subscribe({
        next: (response: GoogleAuthResponse) => {
          if (isPlatformBrowser(this.platformId) && response && response.token) {
            localStorage.setItem(this.TOKEN_KEY, response.token);
            this.authStatusSubject.next(true);
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          console.error('Error en autenticación con Google (backend):', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.error);
          throw error;
        }
      });
    } catch (error: any) {
      console.error('Error al iniciar sesión con Google:', error);
      
      // Manejo específico de errores comunes
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Ventana cerrada por el usuario');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup bloqueado por el navegador');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('Dominio no autorizado en Firebase Console');
      } else if (error.code === 'auth/invalid-api-key') {
        throw new Error('API Key de Firebase inválida');
      } else {
        throw new Error(error.message || 'Error desconocido en autenticación con Google');
      }
    }
  }

  register(userInfo: RegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userInfo);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggingOut = true; // Marcar que estamos haciendo logout manual
      localStorage.removeItem(this.TOKEN_KEY);
      this.authStatusSubject.next(false);
      
      // Cerrar sesión en Firebase también
      this.auth.signOut().catch(error => {
        console.warn('Error al cerrar sesión en Firebase:', error);
      });
      
      this.router.navigate(['/auth/login']).then(() => {
        // Resetear la bandera después de navegar
        setTimeout(() => {
          this.isLoggingOut = false;
        }, 1000);
      });
    }
  }

  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (!token) return false;
      
      // Verificar si el token ha expirado
      return !this.isTokenExpired(token);
    }
    return false;
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }
  
  // Método para verificar si un token ha expirado
  isTokenExpired(token: string): boolean {
    try {
      // Decodificar la parte de payload del token (segunda parte)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      // El campo exp del payload contiene la fecha de expiración en segundos
      if (!payload.exp) return false;
      
      // Convertir a milisegundos para comparar con Date.now()
      const expirationTime = payload.exp * 1000;
      return Date.now() >= expirationTime;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return true; // Si hay error, asumimos que el token es inválido
    }
  }
  
  // Método para manejar la expiración del token (llamado desde interceptor)
  handleTokenExpiration(): void {
    if (!this.isLoggingOut) {
      console.warn('El token ha expirado o es inválido. Cerrando sesión...');
      this.logout();
    }
  }

  // Método para verificar si se está realizando logout manual
  isManualLogout(): boolean {
    return this.isLoggingOut;
  }

  // Método para obtener información del usuario actual desde el token
  getCurrentUser(): { id: string; email: string; name: string } | null {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) {
      return null;
    }

    try {
      // Decodificar la parte de payload del token (segunda parte)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      // Devolver la información del usuario desde el payload
      return {
        id: payload.sub || payload.userId,
        email: payload.email,
        name: payload.name
      };
    } catch (error) {
      console.error('Error al decodificar token para obtener usuario:', error);
      return null;
    }
  }
}
