# 📊 Análisis del Sistema y Propuestas de Mejora — Herbalife Clubes

**Fecha del análisis:** 2026-04-20
**Alcance:** `Pasantias_Backend`, `PanelAdminPasantia`, `flutter_app_saludable`
**Objetivo:** Diagnosticar el estado actual del sistema y evaluar la viabilidad de tres modificaciones solicitadas por el cliente.

---

## 1. 🩺 Estado actual del sistema (resumen ejecutivo)

| Componente | Stack | Madurez | Observación rápida |
|---|---|---|---|
| **Backend** (`Pasantias_Backend`) | Spring Boot 4.0.1 · Java 17 · PostgreSQL · JWT | Sólido, en producción en Render | Arquitectura limpia (Controller → Service → Repository), 22 controladores, 20 services, mapeo manual con `Mapper` static helpers (no MapStruct generado a pesar de la dependencia). |
| **Panel Web** (`PanelAdminPasantia`) | React 19 · Vite 7 · Tailwind 3.4 · Axios · SweetAlert2 | Funcional, UI consistente | 14 páginas, módulos por entidad (`*List` + `*Form`), `ArbolReferidosModal` ya implementado en modo lista jerárquica. |
| **App Móvil** (`flutter_app_saludable`) | Flutter · Provider · Dio · SQLite | Completa, multi-rol | Pantallas separadas por rol (`guest`, `member`, `host`, `common`), incluye flujo de socio/anfitrión, escáner QR, pedidos. |

### Flujos críticos verificados
- **Registro** → asigna `USUARIO_BASICO` por defecto (seguro: el `rolId` enviado por el cliente se ignora).
- **Solicitud de club** → estado `PENDIENTE`. Al aprobar, el backend cambia rol del solicitante a `ANFITRION` *automáticamente* (`ClubServiceImpl.aprobarClub`, líneas 95-121).
- **Desactivar club** → ⚠️ ver sección 2.
- **Árbol de referidos** → backend ya entrega DTO recursivo (`ArbolReferidosDTO`); frontend lo renderiza con indentación lineal.

### Estado del repositorio
- Working directory limpio en lo que respecta a `ProyectoNutricion/`.
- Cambios sin commitear pertenecen a otra ruta (`Downloads/Tarea3Movil-master/`) — no afectan a este proyecto.

---

## 2. 🎯 Modificaciones solicitadas — viabilidad y plan

### 2.1 Desactivar/Activar club sin perder al anfitrión + asignar anfitrión desde el panel

> **Te entendí perfectamente.** Quieres dos cosas:
> 1. Que al desactivar/activar un club **NO se cambie el rol del anfitrión** (que siga siendo `ANFITRION`).
> 2. Que el panel admin pueda **asignar/reemplazar al anfitrión** de un club existente.

#### 🔍 Hallazgo importante (verificado en código)

Revisando `ClubServiceImpl.desactivarClub()` (líneas 156-162) y `UsuarioServiceImpl.desactivarUsuario()` (líneas 45-51):

```java
// ClubServiceImpl.desactivarClub — SOLO cambia estado del club
club.setEstado("INACTIVO");
clubRepository.save(club);
// NO toca el rol del anfitrión
```

**El backend actual NO degrada al anfitrión cuando se desactiva su club.** El rol `ANFITRION` se mantiene en la BD. Lo que sí ocurre:

- Como el club queda `INACTIVO`, el anfitrión **pierde acceso operacional** a su club (no puede gestionar socios, productos, eventos), porque las consultas filtran por estado.
- Esto puede dar la *sensación* de que se "volvió usuario normal", pero técnicamente sigue siendo `ANFITRION` sin club activo.

> **Recomendación:** confirmar con el cliente si lo que ve es:
> (a) un comportamiento que NO está en el código (entonces no hay nada que arreglar, solo aclarar UX), o
> (b) que efectivamente quiere que al desactivar el club el anfitrión conserve la capacidad de gestionarlo en algún flujo (por ejemplo: ver historial, reactivar él mismo).

#### ✅ Viabilidad

**Totalmente factible.** Cambios necesarios:

##### Backend
1. **Nuevo endpoint** en `ClubController`:
   ```
   PATCH /api/clubes/{id}/anfitrion?nuevoAnfitrionId={userId}
   ```
2. **Nuevo método** en `ClubService` / `ClubServiceImpl`:
   ```java
   ClubDTO reasignarAnfitrion(Integer clubId, Integer nuevoAnfitrionId);
   ```
   Lógica:
   - Validar que el club existe.
   - Validar que el nuevo usuario existe y está `ACTIVO`.
   - **Opcional (a definir con cliente):** degradar al anfitrión saliente a `USUARIO_BASICO` si no es anfitrión de ningún otro club.
   - Asignar el nuevo `anfitrion_id` al club.
   - Cambiar el rol del nuevo usuario a `ANFITRION`.
   - Enviar notificación a ambos usuarios (servicio `NotificacionService` ya existe).
3. **(Opcional) Reforzar `desactivarClub`:** agregar comentario o validación explícita de que el rol NO se toca, para evitar futuras regresiones.

##### Panel React
1. En `ClubList.jsx`, agregar acción **"Cambiar anfitrión"** (icono `UserCog` de lucide-react).
2. Nuevo componente `AsignarAnfitrionModal.jsx`:
   - Campo de búsqueda de usuarios (con autocomplete) usando `GET /api/usuarios`.
   - Filtrar candidatos: `estado=ACTIVO` y rol distinto de `ADMIN_HUB`.
   - Confirmación con `SweetAlert2`.
3. En `ClubService.js`, agregar:
   ```js
   export const reasignarAnfitrion = (clubId, nuevoAnfitrionId) =>
     api.patch(`/clubes/${clubId}/anfitrion`, null, { params: { nuevoAnfitrionId } });
   ```

##### App Flutter
- **No requiere cambios** salvo invalidar la sesión local del anfitrión saliente si está logueado (refrescar token / forzar re-login). Se puede manejar con la siguiente petición autenticada que detecte el cambio de rol.

#### Riesgos
- **Anfitrión con club único:** decidir política — ¿se degrada automáticamente o queda como `ANFITRION` huérfano?
- **Membresías y eventos asociados:** no se afectan; siguen vinculados al `club_id`, no al `anfitrion_id`.

---

### 2.2 Mejora visual de los "Árboles de Relaciones" (look genealógico)

#### 🔍 Estado actual
`PanelAdminPasantia/src/components/Membresia/ArbolReferidosModal.jsx` ya tiene:
- Vista jerárquica colapsable con indentación + `border-left` (estilo lista anidada).
- Vista lista plana (BFS) con filtro por número de líneas.
- Backend (`MembresiaServiceImpl.getArbolReferidos`) entrega `ArbolReferidosDTO` recursivo — **listo para alimentar cualquier visualización**.

El problema del cliente es válido: visualmente sigue pareciendo una lista, no un árbol.

#### ✅ Recomendación principal: **`react-d3-tree`**

| Librería | Pros | Contras | Veredicto |
|---|---|---|---|
| **`react-d3-tree`** ⭐ | Renderiza SVG con nodos, conectores tipo árbol genealógico, zoom/pan, nodos custom (puedes meter avatares, badges), orientación vertical/horizontal, soporta árboles grandes | Curva de aprendizaje media, hay que estilizar | **Mejor opción para look genealógico real** |
| `react-organizational-chart` | Muy fácil, se ve como organigrama clásico, mucho HTML/CSS | Menos flexible con muchos nodos, no tiene zoom nativo | Buena opción si la red es pequeña (<30 nodos) |
| `reactflow` / `@xyflow/react` | Súper potente, drag, zoom, mini-mapa | Overkill para visualizar (es para editar), pesa más | No recomendada |
| Mantener actual + mejorar CSS | Cero dependencias | No resuelve la queja del cliente | Solo como fallback |

#### 🎨 Diseño UX recomendado (basado en `react-d3-tree`)

1. **Nodo personalizado** (`renderCustomNodeElement`):
   ```
   ┌─────────────────────────┐
   │  [Avatar] Juan Pérez    │
   │  N° SOC-A1B2  · ⭐ 145  │
   │  [Badge ACTIVA]         │
   └────────────┬────────────┘
                │
        ┌───────┴───────┐
       Hijo1          Hijo2
   ```
2. **Estética**:
   - Nodo: tarjeta blanca redondeada `rounded-xl`, sombra suave `shadow-md`, borde `2px` color por nivel (usar la paleta `NIVEL_COLOR` que ya existe).
   - Conectores: líneas curvas tipo Bézier (default de `react-d3-tree`).
   - Color del nodo raíz: `herbalife-green` para destacar.
   - Hover: aumentar sombra + leve `scale(1.02)`.
3. **Controles UX**:
   - Toggle horizontal/vertical.
   - Zoom con scroll del mouse.
   - Mini-mapa o botón "Centrar / Ajustar".
   - Click en nodo abre detalle del socio (modal lateral).
   - Mantener pestaña "Vista Lista" actual como segunda opción (ya está bien hecha).
4. **Performance**:
   - Si la red tiene >100 nodos, colapsar por defecto a partir del nivel 3.
   - Lazy-render: `react-d3-tree` ya soporta `initialDepth`.
5. **Accesibilidad**:
   - Tooltip al hover con info completa.
   - Focusable con teclado (atajo: ⬅️➡️⬆️⬇️ para navegar entre nodos).

#### 📦 Implementación (alto nivel)

```
npm install react-d3-tree
```

Crear `ArbolReferidosVisual.jsx` (nuevo) que reemplace solo el `<NodoReferido>` actual cuando `tab === "arbol"`, dejando intacta la `VistaLista`. Función auxiliar para transformar el DTO actual:

```js
// El DTO ya es compatible con react-d3-tree, solo renombrar referidos -> children
function adaptarParaD3(nodo) {
  return {
    name: nodo.nombreCompleto,
    attributes: {
      socio: nodo.numeroSocio,
      puntos: nodo.puntosAcumulados,
      estado: nodo.estado,
    },
    children: (nodo.referidos || []).map(adaptarParaD3),
  };
}
```

#### Tiempo estimado
- Setup + nodo custom + estilos: **1 día desarrollo**.
- Pulido UX (zoom, controles, animaciones): **0.5 día**.
- Pruebas con redes reales: **0.5 día**.

---

## 3. 🔧 Análisis general — puntos mejorables del sistema

Detectados durante el recorrido. Ordenados por impacto.

### 🔴 Críticos / Seguridad

1. **`@CrossOrigin("*")` en todos los controladores**
   - Permite cualquier origen. Aceptable en desarrollo, **riesgoso en producción**.
   - **Fix:** centralizar CORS en `CorsConfig.java` (ya existe) y eliminar `@CrossOrigin("*")` de los controladores. Permitir solo orígenes conocidos (panel, app móvil dev).

2. **Endpoint `POST /api/clubes` sin validación de rol explícita**
   - `ClubController.createClub` recibe `anfitrionId` por query param sin validar que quien hace la petición sea ADMIN.
   - **Fix:** anotar con `@PreAuthorize("hasRole('ADMIN_HUB')")` o equivalente. El endpoint público para usuarios es `/solicitud`.

3. **`getClubByAnfitrion` devuelve "el primero" si hay varios**
   - `ClubServiceImpl` línea 189: comentario admite que es subóptimo.
   - **Fix:** o bien forzar relación 1:1 anfitrión-club a nivel de modelo, o devolver lista, o priorizar `ACTIVO`.

### 🟠 Importantes

4. **Mappers manuales pese a tener MapStruct como dependencia**
   - El proyecto declara MapStruct 1.6.0.Beta1 pero los mappers son `static` con código manual repetitivo.
   - **Fix:** migrar a interfaces `@Mapper` de MapStruct → menos boilerplate, menos bugs por olvidar campos al agregar columnas.

5. **Falta paginación en endpoints de listado**
   - `getAllClubes`, `listarUsuarios`, `getMembresiasByClub` devuelven listas completas.
   - Con crecimiento será un cuello de botella + carga pesada en el panel.
   - **Fix:** usar `Pageable` de Spring Data → respuesta `Page<DTO>` con `content`, `totalPages`, `totalElements`. Implementar paginación en tablas del panel React.

6. **Filtros de fecha y búsqueda fuerte solo en algunos módulos**
   - `ClubList` filtra por estado pero no por hub, fecha de creación, ni búsqueda por nombre.
   - **Fix:** agregar query params `?nombre=&hubId=&desde=&hasta=` y campo de búsqueda en el panel.

7. **Manejo de errores poco granular en frontend React**
   - La mayoría de catches muestran `"Error genérico"`. El usuario no sabe por qué falló.
   - **Fix:** interceptor global de Axios en `api/api.js` que mapee status codes a mensajes específicos (ya hay un buen ejemplo en `ArbolReferidosModal.jsx` líneas 263-271 — replicarlo).

8. **App Flutter no parece tener manejo offline declarado para todos los flujos**
   - Existen `local_*_repository.dart` para usuarios, productos y pedidos, pero no para clubs/eventos.
   - **Fix:** evaluar qué pantallas necesitan funcionar offline (probablemente: ver club propio, lista de productos, pedido en curso).

### 🟡 Mejoras de calidad

9. **Tests unitarios y de integración mínimos**
   - El backend tiene estructura para tests (`src/test/java`) pero hay poca cobertura visible.
   - **Fix:** priorizar tests para lógica de negocio: `aprobarClub`, `cambiarEstado de membresía`, `construirArbolRecursivo` (riesgo de stack overflow con ciclos).

10. **`construirArbolRecursivo` no tiene protección contra ciclos**
    - Si por bug alguien crea un referido cíclico (A refiere a B y B refiere a A), recursión infinita → StackOverflowError.
    - **Fix:** llevar `Set<Integer> visitados` y abortar si se repite.

11. **DataInitializer crea roles si no existen, pero no garantiza migrations**
    - Para BD con muchos cambios de schema, conviene Flyway o Liquibase.
    - **Fix:** introducir Flyway con scripts versionados — facilita despliegues y rollback.

12. **Notificaciones acopladas al servicio**
    - `notificacionService.enviarNotificacion(...)` se llama síncronamente dentro de `aprobarClub`. Si falla la notificación, falla la aprobación.
    - **Fix:** `@Async` o eventos de aplicación (`ApplicationEventPublisher`) → desacopla y mejora resiliencia.

13. **Tokens JWT sin refresh token visible**
    - Si el TTL es corto, mala UX; si es largo, riesgo de seguridad.
    - **Fix:** patrón access + refresh token. Beneficia tanto al panel como a la app móvil.

14. **Falta logging estructurado y observabilidad**
    - Sin indicios de logs JSON, métricas, ni trazas distribuidas.
    - **Fix mínimo:** añadir `logback-spring.xml` con formato JSON para que Render/CloudWatch parsee. Considerar Micrometer + Prometheus si crece.

### 🟢 UX / UI

15. **Panel admin: faltan estados de carga consistentes**
    - Algunos componentes muestran spinner full-screen, otros nada. Inconsistente.
    - **Fix:** componente `<LoadingState />` reusable + skeletons para tablas.

16. **App Flutter: revisar consistencia de tema**
    - Sin auditar a fondo, pero es típico que pantallas de distintas etapas del proyecto diverjan en tipografía/colores.
    - **Fix:** consolidar en `core/theme.dart` (si no existe ya) y eliminar estilos inline.

17. **Sin internacionalización (i18n)**
    - Textos en español hardcoded. Si en algún momento se requiere otro idioma será doloroso.
    - **Fix:** `react-i18next` (panel) y `intl` + ARB files (Flutter). No es urgente.

---

## 4. 📋 Resumen de viabilidad de las solicitudes

| Solicitud | ¿Viable? | Esfuerzo | Riesgo |
|---|---|---|---|
| Desactivar/activar club sin tocar rol anfitrión | ✅ Ya funciona así en código — verificar percepción del cliente | Nulo (solo aclarar) | Bajo |
| Asignar/reemplazar anfitrión desde panel | ✅ Sí, con endpoint nuevo + UI | ~2 días | Bajo |
| Árbol genealógico visual con `react-d3-tree` | ✅ Sí, backend ya entrega los datos | ~2 días | Bajo |
| Mejoras críticas de seguridad (CORS, @PreAuthorize) | ✅ Recomendado antes de producción seria | ~1 día | Medio si se omite |

---

## 5. 🚀 Próximos pasos sugeridos

1. **Validar con el cliente** la sección 2.1 — confirmar si lo que percibe corresponde a una bug real o a una decisión de diseño que se debe revisar.
2. Aprobar el plan de implementación de **reasignar anfitrión** (endpoint + UI).
3. Aprobar el plan de **árbol visual con `react-d3-tree`** y maqueta del nodo personalizado.
4. Programar al menos los puntos críticos de la sección 3 (CORS, autorización en createClub) antes de cualquier despliegue público.

---

*Documento generado a partir de la inspección del código en `Pasantias_Backend`, `PanelAdminPasantia` y `flutter_app_saludable`. Todas las rutas y líneas referenciadas son verificables en el repositorio.*
