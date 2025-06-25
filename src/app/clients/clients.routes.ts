import { Routes } from '@angular/router';
import { ClientListComponent } from './list/client-list.component';
import { ClientFormComponent } from './form/client-form.component';
import { ClientDetailComponent } from './detail/client-detail.component';

export const clientsRoutes: Routes = [
  { path: '', component: ClientListComponent },
  { path: 'nuevo', component: ClientFormComponent },
  { path: ':id', component: ClientDetailComponent },
  { path: ':id/editar', component: ClientFormComponent }
]; 