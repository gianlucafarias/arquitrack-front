import { Routes } from '@angular/router';
import { ProjectListComponent } from './list/project-list.component';
import { ProjectFormComponent } from './form/project-form.component';
import { ProjectDetailComponent } from './detail/project-detail.component';

export const projectsRoutes: Routes = [
  { path: '', component: ProjectListComponent },
  { path: 'nuevo', component: ProjectFormComponent },
  { path: ':id', component: ProjectDetailComponent },
  { path: ':id/editar', component: ProjectFormComponent }
]; 