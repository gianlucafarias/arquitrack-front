## PROYECTO FINAL - ARQUITRACK


Este proyecto propone desarrollar un Sistema de Gestión de Obras web, centralizado y específico para arquitectos, que optimice el seguimiento de obras, la administración de tareas, documentos, clientes y visitas

Gestión de Usuarios (Arquitectos):
Registro de nuevos usuarios (arquitectos).
Inicio y cierre de sesión.
Cada arquitecto solo podrá acceder y gestionar su propia información (obras, clientes, etc.).
Gestión de Clientes:
Crear, leer, actualizar y eliminar información de clientes. (CRUD)
Asociar clientes a los proyectos de obra.
Campos básicos: Nombre, información de contacto (teléfono, email), dirección.
Gestión de Proyectos/Obras:
CRUD de proyectos de obra.
Información por obra:
Nombre del proyecto.
Cliente asociado.
Ubicación.
Fecha de inicio.
Fecha estimada de finalización.
Presupuesto inicial.
Estado actual (En diseño, En licitación, En ejecución, Finalizada, Pausada).
Asignación de un arquitecto responsable (el usuario logueado que la crea).

Gestión de Tareas por Obra:
CRUD de tareas dentro de cada proyecto de obra.
Información por tarea:
Descripción de la tarea.
Fecha de inicio y fecha de finalización estimada.
Usuario responsable (puede ser el arquitecto principal u otro colaborador).
Estado de la tarea (Pendiente, En progreso, Completada).
Visualización del progreso de la obra basado en tareas completadas.

Gestión de Documentos por Obra:
Subir archivos (planos, permisos, contratos, facturas iniciales, etc.) y asociarlos a una obra específica.
Organización básica de documentos por obra (listado de documentos).
Posibilidad de descargar los documentos subidos.

Registro de Visitas a Obra:
Registrar nuevas visitas asociadas a una obra.
Información por visita:
Fecha y hora.
Notas/Comentarios sobre la visita.
Usuario que realiza la visita.
Posibilidad de adjuntar fotografías tomadas durante la visita 

Flujo General Esperado:
Un arquitecto se registra e inicia sesión.
Puede crear y gestionar sus clientes.
Puede crear nuevas obras, asociándolas a un cliente y definiendo sus detalles.
Para cada obra, puede desglosar el trabajo en tareas, asignando fechas y responsables (inicialmente él mismo).
Puede subir documentos importantes relacionados con la obra.
Durante la ejecución de la obra, puede registrar visitas, tomar notas y subir fotos del progreso.
El sistema le permite ver el estado general de sus obras y el progreso de las tareas.


Tecnologías Propuestas:
Frontend: Angular
Backend: Node.js con Express.js
ORM: Prisma
Base de Datos: PostgreSQL
