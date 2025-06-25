import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NotificationsComponent } from './notifications/notifications.component';

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
            { path: 'dashboard', component: DashboardComponent, data: { title: 'Panel de control' } },
            { path: 'proyectos', loadChildren: () => import('./projects/projects.routes').then(m => m.projectsRoutes) },
            { path: 'clientes', loadChildren: () => import('./clients/clients.routes').then(m => m.clientsRoutes) },
            { path: 'notificaciones', component: NotificationsComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
];
