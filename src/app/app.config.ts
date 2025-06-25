import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { authTokenInterceptor } from './auth/auth-token.interceptor';
import { errorInterceptor } from './auth/error.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';

// Importar los proveedores de servicios
import { CLIENTS_PROVIDERS } from './clients/clients.provider';
import { PROJECTS_PROVIDERS } from './projects/projects.provider';

// Firebase Config
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { firebaseConfig } from './environments/environment';
import { provideStorage, getStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideClientHydration(), 
    provideAnimationsAsync(),
    provideAnimations(),
    provideHttpClient(withInterceptors([
      authTokenInterceptor,
      errorInterceptor
    ])),
    // proveedores de clientes y proyectos
    ...CLIENTS_PROVIDERS,
    ...PROJECTS_PROVIDERS,
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage())
  ]
};
