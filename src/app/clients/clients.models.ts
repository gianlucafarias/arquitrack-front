// Interfaz para la carga útil al crear/actualizar un cliente
export interface ClientPayload {
  name: string;
  contactPhone?: string;
  email?: string;
  address?: string;
}

export interface Client {
  id: string;
  name: string;
  contactPhone: string | null;
  email: string | null;
  address: string | null;
  architectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeleteClientResponse {
  message: string;
  client?: Client;
} 