import { Provider } from '@angular/core';
import { ProjectsService } from './projects.service';

export const PROJECTS_PROVIDERS: Provider[] = [
  {
    provide: ProjectsService,
    useClass: ProjectsService
  }
]; 