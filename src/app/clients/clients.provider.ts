import { Provider } from '@angular/core';
import { ClientsService } from './clients.service';

export const CLIENTS_PROVIDERS: Provider[] = [
  {
    provide: ClientsService,
    useClass: ClientsService
  }
]; 