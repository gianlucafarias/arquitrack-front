// Interfaz para las credenciales de Login (lo que se envía al backend)
export interface LoginCredentials {
  email: string;
  password_provided: string;
}

// Interfaz para la respuesta del Login (lo que el backend devuelve)
export interface LoginResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

// Interfaz para los datos de Registro (lo que se envía al backend)
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

// Interfaz para la respuesta del Registro
export interface RegisterResponse {
  message: string;
}

// Interfaz para la autenticación con Google (lo que se envía al backend)
export interface GoogleAuthPayload {
  idToken: string;
}

// Interfaz para la respuesta de autenticación con Google
export interface GoogleAuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
} 