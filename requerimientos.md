Requerimientos Funcionales
RF-01 – Solicitud de registro como anfitrión
Descripción:
 El sistema permitirá que un usuario registrado en la aplicación solicite convertirse en anfitrión de un club desde la sección Perfil, mediante la opción “¿Quieres abrir tu propio Club?”
Entradas:
Acción de solicitud desde el perfil
Datos básicos del solicitante (nombre, teléfono, correo)
Salidas:
Solicitud de anfitrión registrada
Estado inicial: Pendiente de evaluación
Actores:
Usuario
Sistema
Prioridad: Alta
RF-02 – Registro de información del club
Descripción:
 El sistema permitirá al usuario que solicita ser anfitrión registrar la información completa del club que desea crear.
Entradas:
Nombre del club
Dirección física
Horario de atención
Ubicación GPS
Fotografías del local
Logotipo del club
Salidas:
Información del club almacenada
Club en estado Pendiente de aprobación
Actores:
Usuario (solicitante a anfitrión)
Prioridad: Alta
RF-03 – Envío de solicitud de creación del club
Descripción:
 El sistema permitirá enviar la solicitud de creación del club al administrador corporativo para su evaluación.
Entradas:
Confirmación de envío de solicitud
Salidas:
Solicitud enviada
Notificación al administrador corporativo
Actores:
Usuario (solicitante)
Sistema
Prioridad: Alta
RF-04 – Evaluación de solicitud de club
Descripción:
 El sistema permitirá al administrador corporativo evaluar la solicitud de creación del club conforme a las normas establecidas.
Entradas:
Información del club
Datos del solicitante
Salidas:
Resultado de la evaluación (aprobado o rechazado)
Actores:
Administrador corporativo
Prioridad: Alta
RF-05 – Aprobación del club
Descripción:
 El sistema permitirá al administrador aprobar la creación del club, habilitándolo para operar dentro de la aplicación.
Entradas:
Acción de aprobación
Salidas:
Club en estado Activo
Cambio de rol del usuario a Anfitrión
Notificación de aprobación
Actores:
Administrador corporativo
Sistema
Prioridad: Alta
RF-06 – Rechazo del club
Descripción:
 El sistema permitirá al administrador rechazar la solicitud de creación del club indicando el motivo del rechazo.
Entradas:
Acción de rechazo
Motivo del rechazo
Salidas:
Club en estado Rechazado
Notificación al solicitante
Actores:
Administrador corporativo
Prioridad: Alta
RF-07 – Corrección y reenvío de solicitud de club
Descripción:
 El sistema permitirá al solicitante corregir la información del club y reenviar la solicitud tras un rechazo.
Entradas:
Información corregida del club
Salidas:
Solicitud reenviada
Estado Pendiente de aprobación
Actores:
Usuario (solicitante)
Prioridad: Media
RF-08 – Visualización del estado de la solicitud
Descripción:
 El sistema permitirá al usuario visualizar en todo momento el estado de su solicitud de creación de club.
Entradas:
Consulta del estado


Salidas:
Estado visible:


Pendiente
Aprobado
Rechazado
Actores:
Usuario


Prioridad: Media
RF-09 – Restricción de gestión de clubes
Descripción:
 El sistema garantizará que cada anfitrión solo pueda gestionar el club que le fue aprobado.
Entradas:
Intento de acceso a club
Salidas:
Acceso permitido o denegado
Actores:
Sistema
Prioridad: Alta
RF-10 – Acceso administrativo global a clubes
Descripción:
 El sistema permitirá al administrador corporativo acceder y gestionar todos los clubes registrados.
Entradas:
Consulta administrativa
Salidas:
Listado completo de clubes
Acceso a información detallada


Actores:
Administrador corporativo
Prioridad: Alta
MÓDULO 2 – Registro de Socios
RF-11 – Acceso como usuario básico (socio potencial)
Descripción:
 El sistema permitirá que cualquier persona descargue la aplicación y acceda a información básica sin necesidad de registrarse como socio.
Entradas:
Ninguna (modo visitante)
Salidas:
Acceso a información general de la aplicación
Actores:
Usuario básico
Prioridad: Media
RF-12 – Registro inicial de socio mediante formulario del club
Descripción:
 El sistema permitirá que el anfitrión del club registre a un nuevo socio mediante un formulario de registro, cuando el socio aún no cuenta con un perfil en la aplicación.
Entradas:
Nombre y apellido
Número de teléfono
Correo electrónico (opcional)
Redes sociales (opcional)
Día y mes de nacimiento
Referido por (opcional)
Salidas:
Perfil de socio creado
Socio asociado al club
Actores:
Anfitrión
Sistema
Prioridad: Alta
RF-13 – Visualización y confirmación de datos del socio
Descripción:
 El sistema permitirá al anfitrión visualizar, completar y confirmar los datos del socio durante el proceso de registro en el club.
Entradas:
Datos del socio ingresados en el formulario
Salidas:
Datos del socio confirmados o actualizados
Registro validado
Actores:
Anfitrión
Prioridad: Alta
RF-14 – Generación automática de identificación del socio
Descripción:
 El sistema generará automáticamente la identificación única del socio, incluyendo su número de socio y su código QR personal, una vez confirmado el registro del socio.
Entradas:
Registro confirmado del socio
Salidas:
Número único de socio asignado
Código QR personal generado y disponible en la aplicación
Actores:
Sistema
Socio
Prioridad: Alta
RF-15 – Asociación exclusiva del socio a un club
Descripción:
 El sistema garantizará que un socio solo pueda estar asociado a un único club, impidiendo su registro si ya pertenece a otro club.
Entradas:
Identificador del socio
Salidas:
Asociación exitosa al club
O mensaje de rechazo si el socio ya pertenece a otro club
Actores:
Sistema
Prioridad: Alta
RF-16 – Gestión y visualización del perfil del socio
Descripción:
 El sistema permitirá al socio visualizar y gestionar su perfil, incluyendo sus datos personales, su identificación como socio y la información del club al que pertenece.
Entradas:
Consulta o edición del perfil
Salidas:
Datos personales del socio
Número de socio
Código QR personal
Información del club asociado
Datos actualizados cuando corresponda
Actores:
Socio
Prioridad: Media
RF-17 – Restricción de auto-registro del socio
Descripción:
 El sistema impedirá que un usuario se registre como socio de forma autónoma sin la validación del anfitrión del club.
Entradas:
Intento de auto-registro
Salidas:
Registro bloqueado
Mensaje informativo indicando que el registro se realiza presencialmente en el club
Actores:
Sistema
Usuario
Prioridad: Alta
RF-18 – Gestión de socios por club
Descripción:
 El sistema permitirá que el anfitrión visualice y gestione únicamente los socios registrados en su propio club, restringiendo el acceso a socios de otros clubes.
Entradas:
Consulta de socios
Salidas:
Listado de socios del club
Acceso denegado a socios de otros clubes
Actores:
Anfitrión
Sistema
Prioridad: Alta
MÓDULO 3: Gestión de Asistencia y Control por QR
RF-19 – Visualización del código QR personal del socio
Descripción:
 El sistema permitirá que el socio visualice su código QR personal desde la aplicación, el cual será utilizado para su identificación dentro del club.
Entradas:
Acceso del socio a su perfil
Salidas:
Código QR personal visible en pantalla
Actores:
Socio
Prioridad: Alta
RF-20 – Visualización del código QR del club para asistencia
Descripción:
 El sistema permitirá que el anfitrión visualice un código QR del club, el cual será utilizado por los socios para registrar su asistencia.
Entradas:
Acceso del anfitrión al módulo de asistencia
Salidas:
Código QR del club visible para escaneo
Actores:
Anfitrión
Prioridad: Alta
RF-21 – Registro y validación de asistencia del socio
Descripción:
 El sistema permitirá registrar la asistencia del socio cuando este escanee el código QR del club, aplicando validaciones automáticas para garantizar la integridad del registro.
Entradas:
Código QR del club escaneado por el socio
Salidas:
Registro de asistencia con:


Fecha
Hora
Club
O mensaje de rechazo cuando:
El socio no pertenece al club
La asistencia ya fue registrada en el mismo día
Actores:
Socio
Sistema
Prioridad: Alta
RF-22 – Gestión y visualización del historial de asistencias
Descripción:
 El sistema mantendrá y permitirá la visualización del historial de asistencias del socio, tanto para el socio como para el anfitrión del club.
Entradas:
Registros de asistencia
Salidas:
Historial de visitas actualizado
Lista de asistencias por fecha
Actores:
Socio
Anfitrión
Prioridad: Media
RF-23 – Visualización de asistencias por el anfitrión
Descripción:
 El sistema permitirá al anfitrión visualizar las asistencias registradas de los socios de su club.
Entradas:
Consulta de asistencias
Salidas:
Listado de asistencias por socio y fecha
Actores:
Anfitrión
Prioridad: Alta
RF-24 – Cálculo de visitas y métricas de participación
Descripción:
 El sistema calculará automáticamente el total de visitas del socio y generará métricas básicas de participación en función de su asistencia.
Entradas:
Historial de asistencias
Salidas:
Total de visitas por socio
Nivel de participación (bajo, medio, alto)
Actores:
Sistema
Prioridad: Media
RF-25 – Acceso administrativo a registros de asistencia
Descripción:
 El sistema permitirá al administrador corporativo acceder a los registros de asistencia de todos los clubes.
Entradas:
Consulta administrativa
Salidas:
Visualización global de asistencias
Actores:
Administrador corporativo
Prioridad: Alta
RF-26 – Auditoría de registros de asistencia
Descripción:
 El sistema almacenará los registros de asistencia para fines de auditoría y control interno.
Entradas:
Registro de asistencia
Salidas:
Datos de asistencia almacenados
Actores:
Sistema
Administrador corporativo
Prioridad: Alta
MÓDULO 4: Perfiles y Roles de Usuario
RF-27 – Acceso como usuario básico (visitante)
Descripción:
 El sistema permitirá que cualquier persona utilice la aplicación en modo visitante, sin necesidad de registro ni inicio de sesión.
Entradas:
Acceso a la aplicación
Salidas:
Visualización de información general:
Quiénes somos
Información básica de nutrición
Ubicación de clubes
Horarios
Actores:
Usuario básico
Prioridad: Media
RF-36 – Identificación y visualización automática del rol
Descripción:
 El sistema identificará automáticamente el rol del usuario al iniciar sesión y mostrará claramente la interfaz y funcionalidades correspondientes.
Entradas:
Credenciales de acceso
Salidas:
Interfaz personalizada según rol
Rol visible en el perfil del usuario
Actores:
Sistema
Prioridad: Alta
RF-28 – Funcionalidades del perfil de socio
Descripción:
 El sistema permitirá que el socio acceda a las funcionalidades correspondientes a su rol.
Entradas:
Inicio de sesión como socio
Salidas:
Acceso a:


Historial de visitas
Código QR personal
Beneficios y cumpleaños
Promociones del club
Eventos corporativos
Actores:
Socio
Prioridad: Alta
RF-29 – Funcionalidades del perfil de anfitrión
Descripción:
 El sistema permitirá que el anfitrión gestione las operaciones de su club desde la aplicación.
Entradas:
Inicio de sesión como anfitrión
Salidas:
Acceso a:
Registro y gestión de socios
Visualización de asistencias
Validación de asistencia mediante QR
Edición de información del club
Actores:
Anfitrión
Prioridad: Alta
RF-30 – Funcionalidades del perfil de administrador corporativo
Descripción:
 El sistema permitirá al administrador corporativo acceder a las funcionalidades globales del sistema.
Entradas:
Inicio de sesión como administrador
Salidas:
Acceso a:


Aprobación y gestión de clubes
Visualización global de clubes y socios
Estadísticas generales
Mensajería global y segmentada
Actores:
Administrador corporativo
Prioridad: Alta
RF-31 – Control de acceso y visibilidad según rol
Descripción:
 El sistema restringirá el acceso a funcionalidades y datos que no correspondan al rol del usuario.
Entradas:
Intento de acceso a funcionalidad o dato
Salidas:
Acceso autorizado o denegado
Visualización limitada según permisos
Actores:
Sistema
Prioridad: Alta
RF-32 – Cambio automático de rol tras aprobación
Descripción:
 El sistema actualizará automáticamente el rol del usuario cuando su club sea aprobado por el administrador corporativo.
Entradas:
Aprobación del club
Salidas:
Rol actualizado a Anfitrión activo
Acceso habilitado a las funcionalidades del club
Actores:
Sistema
Prioridad: Media
RF-33 – Gestión de sesión por rol
Descripción:
 El sistema gestionará las sesiones activas del usuario, garantizando la correcta separación de funcionalidades según el rol.
Entradas:
Inicio y cierre de sesión
Salidas:
Sesión iniciada o cerrada correctamente
Actores:
Usuario
Sistema
Prioridad: Alta
MÓDULO 5: Administración Corporativa
RF-34 – Acceso al panel administrativo corporativo
Descripción:
 El sistema permitirá al administrador corporativo acceder a un panel administrativo web con control total de la aplicación.
Entradas:
Credenciales de administrador
Salidas:
Acceso al panel administrativo
Actores:
Administrador corporativo
Prioridad: Alta
RF-35 – Gestión global de clubes
Descripción:
 El sistema permitirá al administrador corporativo visualizar y gestionar todos los clubes registrados en la aplicación.
Entradas:
Consulta administrativa de clubes
Acción administrativa sobre el club
Salidas:
Listado de clubes con estado (pendiente, activo, rechazado, desactivado)
Cambio de estado del club
Registro de la acción
Actores:
Administrador corporativo


Prioridad: Alta
RF-36 – Visualización global de socios
Descripción:
 El sistema permitirá al administrador corporativo visualizar todos los socios registrados en la aplicación.
Entradas:
Consulta de socios
Salidas:
Listado global de socios
Información básica de cada socio
Actores:
Administrador corporativo
Prioridad: Alta
RF-37 – Visualización de actividad y estadísticas generales
Descripción:
 El sistema permitirá al administrador corporativo visualizar la actividad general y estadísticas del sistema.
Entradas:
Consulta administrativa
Salidas:
Información de:


Registros
Asistencias
Clubes activos
Clubes más activos
Nuevos socios por período
Asistencia acumulada
Actores:
Administrador corporativo
Prioridad: Alta
RF-38 – Generación de reportes administrativos
Descripción:
 El sistema permitirá al administrador corporativo generar reportes administrativos del sistema.
Entradas:
Parámetros de reporte (fecha, club, ciudad)
Salidas:
Reportes visuales o descargables
Actores:
Administrador corporativo
Prioridad: Media
RF-39 – Gestión de mensajería corporativa
Descripción:
 El sistema permitirá al administrador corporativo crear, enviar y consultar mensajes informativos dirigidos a los socios.
Entradas:
Contenido del mensaje
Tipo de envío:
Global
Segmentado (ciudad, club, nivel de participación)
Salidas:
Notificaciones enviadas
Historial de mensajes con fecha y alcance
Actores:
Administrador corporativo
Prioridad: Alta
RF-40 – Gestión de eventos corporativos
Descripción:
 El sistema permitirá al administrador corporativo crear y gestionar eventos corporativos visibles para los socios.
Entradas:
Información del evento (nombre, fecha, descripción)
Salidas:
Evento publicado en la aplicación
Actores:
Administrador corporativo
Prioridad: Media
RF-41 – Auditoría de acciones administrativas
Descripción:
 El sistema registrará todas las acciones realizadas por el administrador corporativo para fines de auditoría y control interno.
Entradas:
Acción administrativa
Salidas:
Registro de auditoría almacenado
Actores:
Sistema
Administrador corporativo
Prioridad: Alta
 MÓDULO 6: Gestión de Permisos y Operaciones
RF-42 – Aprobación obligatoria de clubes
Descripción:
 El sistema garantizará que ningún club pueda operar ni ser visible en la aplicación sin la aprobación explícita del administrador corporativo.
Entradas:
Registro de club
Salidas:
Club en estado pendiente hasta aprobación
Actores:
Sistema
Administrador corporativo
Prioridad: Alta
RF-43 – Restricción de gestión y funciones según rol
Descripción:
 El sistema garantizará que cada usuario solo pueda acceder y gestionar las funcionalidades correspondientes a su rol y club asignado.
Entradas:
Intento de acceso o gestión
Salidas:
Acceso permitido o denegado
Actores:
Sistema
Anfitrión
Socio
Prioridad: Alta
RF-44 – Control de acceso y uso permitido del sistema
Descripción:
 El sistema aplicará controles para impedir accesos no autorizados y usos no permitidos de la aplicación, conforme a las normas corporativas.
Entradas:
Solicitud de acceso o uso de funcionalidad
Salidas:
Función habilitada o bloqueada
Mensaje informativo cuando corresponda
Actores:
Sistema
Prioridad: Alta
RF-45 – Desactivación administrativa de clubes
Descripción:
 El sistema permitirá al administrador corporativo desactivar clubes que incumplan normas o políticas corporativas.
Entradas:
Acción de desactivación
Salidas:
Club desactivado
Notificación al anfitrión
Actores:
Administrador corporativo
Prioridad: Alta
RF-46 – Restricción de edición de información crítica
Descripción:
 El sistema limitará la edición de información crítica del club una vez aprobado, salvo autorización administrativa.
Entradas:
Solicitud de edición
Salidas:
Edición permitida o bloqueada
Actores:
Sistema
Administrador corporativo
Prioridad: Media
RF-47 – Cumplimiento del rol informativo de la aplicación
Descripción:
 El sistema garantizará que la aplicación funcione como herramienta informativa y de control interno, y no como plataforma de ventas o negocio no autorizado.
Entradas:
Uso de funcionalidades
Salidas:
Uso conforme a políticas corporativas
Actores:
Sistema
Prioridad: Alta
RF-48 – Notificación de acciones de control
Descripción:
 El sistema notificará a los usuarios afectados cuando se apliquen acciones de control o cumplimiento.
Entradas:
Acción de control
Salidas:
Notificación enviada
Actores:
Sistema
Prioridad: Media
MÓDULO 7: Gamificación y Fidelización de Socios
RF-49 – Sistema de recompensas por asistencia
Descripción:
 El sistema implementará un sistema de recompensas basado en la asistencia del socio, otorgando puntos y estrellas por cada visita registrada.
Entradas:
Registro de asistencia
Salidas:
Puntos acumulados
Estrellas asignadas visibles en el perfil
Actores:
Sistema
Socio
Prioridad: Alta
RF-73 – Logros por constancia y rachas de asistencia
Descripción:
 El sistema identificará la constancia del socio mediante rachas de asistencia y otorgará trofeos virtuales por cumplimiento de objetivos.
Entradas:
Historial de asistencias
Salidas:
Racha activa o reiniciada
Trofeos visibles en el perfil
Actores:
Sistema
Socio
Prioridad: Media
RF-75 – Premios y cupones internos del club
Descripción:
 El sistema permitirá que el club otorgue premios o cupones internos a socios destacados por su participación.
Entradas:
Configuración del premio
Salidas:
Premio o cupón asignado al socio
Actores:
Anfitrión
Sistema
Prioridad: Media
RF-76 – Calendario inteligente del socio
Descripción:
 El sistema mostrará al socio un calendario personalizado que integre su asistencia y actividades del club.
Entradas:
Datos de asistencia
Eventos programados
Salidas:
Calendario con:
Días de asistencia
Eventos próximos
Retos semanales
Actores:
Socio
Prioridad: Media
RF-77 – Notificaciones automáticas de fidelización
Descripción:
 El sistema enviará notificaciones automáticas a los socios para fomentar la fidelización y participación.
Entradas:
Eventos automáticos:
Inactividad
Cumpleaños
Logros alcanzados
Eventos próximos


Salidas:
Notificaciones personalizadas enviadas
Actores:
Sistema
Prioridad: Alta
RF-80 – Promociones internas del club
Descripción:
 El sistema permitirá que los clubes publiquen promociones internas visibles únicamente para sus socios.
Entradas:
Contenido de la promoción
Salidas:
Promoción visible para socios del club
Actores:
Anfitrión
Prioridad: Media
RF-81 – Clasificación y visualización del nivel del socio
Descripción:
 El sistema clasificará al socio según su nivel de participación y permitirá visualizar sus niveles y logros.
Entradas:
Asistencias acumuladas
Salidas:
Nivel asignado:
Socio nuevo
Socio constante
Socio VIP
Panel de logros visible
Actores:
Sistema
Socio
Prioridad: Alta
RF-83 – Configuración básica de gamificación por club
Descripción:
 El sistema permitirá que el club configure parámetros básicos de gamificación definidos por el administrador corporativo.
Entradas:
Parámetros permitidos
Salidas:
Gamificación aplicada al club
Actores:
Anfitrión
Administrador corporativo
Prioridad: Baja
MÓDULO 8: Estadísticas y Reportes
RF-85 – Visualización de estadísticas corporativas del sistema
Descripción:
 El sistema permitirá al administrador corporativo visualizar estadísticas generales y analíticas del sistema.
Entradas:
Solicitud de estadísticas
Salidas:
Indicadores corporativos:
Total de clubes
Clubes activos
Total de socios
Nuevos socios por período
Asistencias acumuladas
Ranking de clubes más activos
Rachas y constancia de socios
Actores:
Administrador corporativo
Prioridad: Alta
RF-90 – Visualización de estadísticas del club
Descripción:
 El sistema permitirá que el anfitrión visualice estadísticas específicas de su club.
Entradas:
Consulta de estadísticas del club
Salidas:
Indicadores del club:
Total de socios
Socios activos
Asistencia promedio
Tendencias de asistencia
Actores:
Anfitrión
Prioridad: Alta
RF-91 – Visualización de estadísticas personales del socio
Descripción:
 El sistema permitirá que el socio visualice estadísticas personales de su participación en el club.
Entradas:
Consulta de estadísticas personales
Salidas:
Total de visitas
Rachas activas
Nivel de socio
Actores:
Socio
Prioridad: Media
RF-92 – Generación y gestión de reportes administrativos
Descripción:
 El sistema permitirá al administrador corporativo generar, filtrar, exportar y consultar reportes administrativos basados en las estadísticas del sistema.
Entradas:
Parámetros de reporte:
Fecha
Club
Ciudad
Nivel de socio
Salidas:
Reporte generado
Archivo descargable (PDF, Excel)
Historial de reportes almacenados
Actores:
Administrador corporativo
Sistema
Prioridad: Alta
RF-95 – Visualización gráfica y comparativa de estadísticas
Descripción:
 El sistema mostrará estadísticas mediante gráficos visuales y permitirá la comparación entre distintos períodos.
Entradas:
Datos estadísticos
Selección de períodos
Salidas:
Gráficos de barras, líneas o circulares
Comparativos visuales de resultados
Actores:
Administrador corporativo
Anfitrión
Prioridad: Media
RF-98 – Control de acceso a estadísticas y reportes
Descripción:
 El sistema restringirá el acceso a estadísticas y reportes según el rol del usuario.
Entradas:
Solicitud de acceso
Salidas:
Acceso autorizado o denegado
Actores:
Sistema
Prioridad: Alta
MÓDULO 9: GPS, Mapas y Ubicación de Clubes
RF-99 – Registro de ubicación GPS del club
Descripción:
 El sistema permitirá registrar la ubicación GPS exacta del club durante su proceso de registro.
Entradas:
Coordenadas GPS (latitud y longitud)
Salidas:
Ubicación del club almacenada
Actores:
Anfitrión
Prioridad: Alta
RF-100 – Visualización y búsqueda de clubes en el mapa
Descripción:
 El sistema mostrará un mapa interactivo con los clubes oficiales activos y permitirá su búsqueda y filtrado por ubicación.
Entradas:
Acceso al mapa
Ubicación del usuario
Selección de ciudad (opcional)
Salidas:
Mapa con clubes activos
Listado de clubes cercanos ordenados por distancia
Actores:
Usuario básico
Socio
Sistema
Prioridad: Alta
RF-102 – Visualización de información del club desde el mapa
Descripción:
 El sistema permitirá visualizar la información básica del club al seleccionarlo desde el mapa.
Entradas:
Selección de club en el mapa
Salidas:
Información del club:
Nombre
Dirección
Horarios
Estado
Actores:
Usuario
Prioridad: Alta
RF-103 – Navegación hacia el club
Descripción:
 El sistema permitirá generar rutas de navegación hacia el club seleccionado mediante servicios de mapas.
Entradas:
Ubicación del usuario
Ubicación del club
Salidas:
Ruta de navegación sugerida
Actores:
Usuario
Sistema
Prioridad: Media
RF-105 – Control de visibilidad de clubes en el mapa
Descripción:
 El sistema garantizará que solo los clubes activos y aprobados sean visibles en el mapa y que los cambios de estado se reflejen automáticamente.
Entradas:
Estado del club
Salidas:
Club visible u oculto
Mapa actualizado
Actores:
Sistema


Prioridad: Alta
RF-106 – Solicitud de actualización de ubicación del club
Descripción:
 El sistema permitirá al anfitrión solicitar la actualización de la ubicación GPS de su club, sujeta a revisión administrativa.
Entradas:
Nueva ubicación GPS
Salidas:
Solicitud registrada
Ubicación actualizada tras aprobación
Actores:
Anfitrión
Administrador corporativo
Prioridad: Media
RF-107 – Detección de ubicación del usuario
Descripción:
 El sistema podrá detectar la ubicación actual del usuario, previa autorización, para mejorar la experiencia de búsqueda de clubes.
Entradas:
Permiso de ubicación del usuario
Salidas:
Ubicación actual detectada
Actores:
Sistema
Usuario
Prioridad: Media
MÓDULO 10: Soporte y Comunicación
RF-113 – Acceso y envío de solicitudes de soporte
Descripción:
 El sistema permitirá a los usuarios acceder al módulo de soporte y enviar solicitudes de ayuda o consultas al administrador general.
Entradas:
Selección de opción “Soporte
Tipo de consulta
Mensaje descriptivo
Salidas:
Solicitud de soporte registrada
Actores:
Usuario básico
Socio
Anfitrión
Sistema
Prioridad: Alta
RF-115 – Clasificación y registro de interacciones de soporte
Descripción:
 El sistema clasificará las solicitudes de soporte y registrará todas las interacciones para facilitar su atención y mejora continua.
Entradas:
Tipo de solicitud (técnica, administrativa, informativa)
Interacción de soporte
Salidas:
Solicitud categorizada
Registro de interacción almacenado
Actores:
Sistema
Prioridad: Media
RF-116 – Gestión de solicitudes de soporte
Descripción:
 El sistema permitirá al administrador corporativo visualizar, atender y responder las solicitudes de soporte recibidas.
Entradas:
Consulta de solicitudes
Respuesta del administrador
Salidas:
Listado de solicitudes con estado
Respuesta enviada al usuario
Actores:
Administrador corporativo
Prioridad: Alta
RF-118 – Seguimiento e historial de solicitudes de soporte
Descripción:
 El sistema permitirá a los usuarios realizar el seguimiento del estado de sus solicitudes de soporte y consultar su historial.
Entradas:
Consulta de estado o historial
Salidas:
Estado visible (pendiente, en proceso, resuelto)
Historial de solicitudes disponible
Actores:
Usuario
Administrador corporativo
Prioridad: Media
RF-120 – Comunicación y notificaciones informativas
Descripción:
 El sistema permitirá la comunicación directa entre el usuario y el administrador general, así como el envío de notificaciones informativas relacionadas con soporte o cambios importantes.
Entradas:
Mensajes enviados
Mensaje informativo
Salidas:
Mensajes recibidos
Notificaciones enviadas
Actores:
Usuario
Administrador corporativo
Sistema
Prioridad: Media
RF-122 – Landing informativo para clubes grandes
Descripción:
 El sistema permitirá mostrar un landing informativo personalizado para clubes de gran tamaño o relevancia.
Entradas:
Información del club
Salidas:
Landing visible en la aplicación
Actores:
Administrador corporativo
Prioridad: Baja
