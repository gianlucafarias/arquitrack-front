import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes').then(m => m.authRoutes)
    },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [

            // { path: 'dashboard', component: DashboardComponent },
            // { path: 'proyectos', loadChildren: () => import('./proyectos/proyectos.routes').then(m => m.proyectosRoutes) },
            // { path: 'clientes', loadChildren: () => import('./clientes/clientes.routes').then(m => m.clientesRoutes) },
            { path: '', redirectTo: 'proyectos', pathMatch: 'full' }
        ]
    },
];
