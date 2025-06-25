Cronograma de 5 Semanas:

Semana 1: Fundamentos y Autenticación (BE + FE)

Días 1-2 (Backend): Configuración y Modelo de Usuario
[X] BE: Inicializar proyecto Node.js (TypeScript, Express), ESLint, Prettier.
[X] BE: Configurar Prisma, PostgreSQL, definir schema.prisma para User (Arquitecto).
[X] BE: Migraciones iniciales. Estructura de carpetas backend.

Días 3-4 (Backend & Frontend): Autenticación
[X] BE: Endpoints de autenticación: /auth/register (con hasheo), /auth/login (generar JWT).
[X] BE: Middleware de autenticación (verificar JWT).
[X] FE: Crear proyecto Angular, instalar librerías UI (e.g., Angular Material).
[X] FE: Estructura básica de carpetas, módulos principales (Auth, Core, Shared).
[X] FE: Módulo de autenticación: componentes para login y registro.
[X] FE: Servicio de autenticación (AuthService) para llamar a los endpoints del BE.
[X] FE: Guardias de ruta (AuthGuard) para proteger rutas.

Día 5 (Frontend): Flujo de Autenticación y Layout Básico
[X] FE: Implementar el flujo completo de login/registro en Angular.
[X] FE: Almacenamiento de token JWT (e.g., localStorage).
[X] FE: Configurar interceptor HTTP para adjuntar el token a las solicitudes.
[X] FE: Crear un layout básico (navbar, sidebar si aplica, área de contenido principal) para cuando el usuario está logueado.

Semana 2: Gestión de Clientes (BE + FE) e Inicio de Proyectos (BE)

Días 1-2 (Backend): CRUD de Clientes
[X] BE: Modelo Client en schema.prisma (campos básicos, relación con User).
[X] BE: Servicios y controladores para CRUD de Client (crear, leer propios, actualizar, eliminar).
[ ] BE: Rutas /api/clients protegidas y con lógica de pertenencia.

Días 3-4 (Frontend): Módulo de Clientes
[X] FE: Crear módulo de Clientes.
[X] FE: Componentes para listar clientes, crear/editar cliente (formulario), ver detalle (opcional MVP).
[X] FE: Servicio ClientService para interactuar con los endpoints /api/clients.
[X] FE: Integrar en el layout principal (e.g., enlace en navbar/sidebar).

Día 5 (Backend): Inicio CRUD de Proyectos/Obras
[X] BE: Modelo Project en schema.prisma (campos básicos, relación con User y Client).
[X] BE: Servicios y controladores iniciales para CRUD de Project (crear, leer propios).
[X] BE: Rutas /api/projects protegidas y con lógica de pertenencia.

Semana 3: Gestión de Proyectos (FE) e Inicio de Tareas (BE)

Días 1-3 (Frontend): Módulo de Proyectos
[X] FE: Crear módulo de Proyectos.
[X] FE: Componentes para listar proyectos, crear/editar proyecto (formulario).
[X] FE: Componente para ver el detalle de un proyecto (donde luego se anidarán tareas, docs, etc.).
[X] FE: Servicio ProjectService para interactuar con los endpoints /api/projects.
[X] FE: Integrar en el layout.

Días 4-5 (Backend): CRUD de Tareas por Obra
[X] BE: Modelo Task en schema.prisma (campos básicos, relación con Project).
[X] BE: Servicios y controladores para CRUD de Task (crear, leer por proyecto, actualizar estado, eliminar).
[X] BE: Rutas anidadas /api/projects/:projectId/tasks protegidas.

Semana 4: Gestión de Tareas (FE) y Funcionalidades Simplificadas (Documentos/Visitas BE+FE)

Días 1-2 (Frontend): Integración de Tareas en Proyectos
[X] FE: Dentro del componente de detalle del proyecto, integrar la gestión de tareas:
Listar tareas del proyecto.
Formulario para crear nueva tarea.
Posibilidad de actualizar estado de la tarea (e.g., con un dropdown o botones).
[X] FE: Servicio TaskService para interactuar con los endpoints de tareas.

Día 3 (Backend): Documentos y Visitas Simplificados
[X] BE: Modelo Document (nombre archivo, path/URL, proyecto asociado) y Visit (fecha, notas, proyecto asociado) en schema.prisma.
[X] BE: Endpoints básicos: subir metadata de documento (sin subida de archivo real por ahora, solo el nombre/path), listar documentos. Registrar visita, listar visitas.
[X] BE: Rutas /api/projects/:projectId/documents y /api/projects/:projectId/visits.

Días 4-5 (Frontend): UI Básica para Documentos y Visitas
[X] FE: En la vista de detalle del proyecto, agregar secciones para Documentos y Visitas.
[X] FE: Componente para listar documentos (mostrando nombre/info). Formulario simple para subir un documento
[X] FE: Componente para listar visitas. Formulario simple para registrar una nueva visita (fecha y notas).
[X] FE: Servicios para DocumentService y VisitService.

Semana 5: Integración Final, Pruebas y Refinamiento (BE + FE)

Días 1-2: Conexión Final e Integración
[X] BE+FE: Asegurar que todos los flujos principales funcionen de principio a fin (Login -> Crear Cliente -> Crear Proyecto -> Añadir Tarea -> Añadir Documento/Visita).
[X] BE+FE: Implementar la subida real de archivos para documentos con Firebase Storage.

Día 3: Pruebas E2E (Manuales) y Depuración
[ ] BE+FE: Realizar pruebas manuales exhaustivas de todos los casos de uso.
[ ] BE+FE: Identificar y corregir bugs en ambos lados.
[ ] BE: Revisar logs y manejo de errores.
[ ] FE: Probar en diferentes navegadores

Día 4: Refinamiento y Documentación API
[ ] FE: Pequeñas mejoras visuales y de usabilidad.
[ ] BE: Finalizar colección de Postman o documentación básica de la API.
[ ] BE+FE: Limpieza de código, comentarios donde sea necesario.

Día 5: Preparación
[ ] BE+FE: Asegurar que el proyecto corre localmente sin problemas.
[ ] BE+FE: Preparar una breve demo de las funcionalidades MVP.
[ ] Considerar un build de producción de Angular y cómo servirlo junto con el backend (e.g., Express sirviendo los estáticos de Angular).