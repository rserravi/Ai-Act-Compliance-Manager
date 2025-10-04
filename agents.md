# agents.md — AI Act Compliance Manager

Este documento define **agentes**, **flujos**, **eventos** y **puntos de integración** del producto tras los cambios solicitados.

---

## 0) Stack y criterios de diseño

- **Frontend**: Lit (Web Components) + **DaisyUI** (sobre Tailwind). Arquitectura **View/ViewModel** (cada vista = `*.view.ts` + `*.viewmodel.ts`), servicios en `Service/`, modelos en `Model/`, eventos en `Events/`, estilos en `CSS/`.
- **Backend**: FastAPI (Python).
- **Base de datos**: **PostgreSQL** por defecto; opción de base de datos local (`.db`) para desarrollo/PoC.
- **Internacionalización**: selector de idioma en cabecera (ES/EN inicialmente).
- **Accesibilidad**: WCAG AA, navegación por teclado, alto contraste.

---

## 1) Layout de aplicación (actualizado)

### 1.1 Cabecera (Header)
- **Logo + nombre** del programa.
- **Proyecto seleccionado** (dropdown para cambiar/limpiar selección).
- **Buscador global** (proyectos, incidentes, evidencias).
- **Idioma** (selector).
- **Avatar de usuario** con menú: **Acciones pendientes** y **Logout**.

### 1.2 Panel lateral (Sidebar)
- **Selector de proyecto activo** (idéntico al de cabecera para consistencia).
- Navegación principal (visible siempre):
  - **Dashboard**
  - **Proyectos** (antes “Inventario de sistemas”)
  - **Incidentes**
  - **Ajustes**
- Navegación contextual (se muestra **solo cuando hay proyecto seleccionado**):
  - **Evidencias**
  - **Equipo**
  - **Auditorías**

### 1.3 Footer
- **Estado de la conexión** (online/offline, latencia, último sync).
- **Versión** de la aplicación (semver + hash corto de commit si está disponible).

---

## 2) Nomenclatura y rutas

- **Proyectos** = antes *Sistemas de IA* (renombrado en toda la app, API y UI).
- **Detalle del Proyecto** = antes *Detalle de Sistema*.
- Rutas principales (ejemplos):
  - `/` → Dashboard
  - `/projects` → Lista de Proyectos
  - `/projects/new` → **Wizard Nuevo Proyecto**
  - `/projects/:id` → **Detalle del Proyecto**
  - `/incidents` → Incidentes
  - `/settings` → Ajustes
  - Contextuales por proyecto: `/projects/:id/evidence`, `/projects/:id/team`, `/projects/:id/audits`

---

## 3) Wizard “Nuevo Proyecto”

Flujo en 4 pasos (DaisyUI `steps` + Lit):
1) **Detalles del proyecto**  
   - Nombre, propósito, BU, propietario, despliegues previstos.
2) **Selección de equipo**  
   - Asignar responsables (RACI), owners, revisores; invitar por email.
3) **Evaluación del riesgo**  
   - Usa el **cuestionario declarativo JSON** (`configs/risk-wizard.json`).  
   - Render dinámico (boolean/select/multiselect) y cálculo automático de clasificación.
4) **Resumen**  
   - Muestra los datos recopilados; **Crear proyecto** → POST API + redirección al Detalle.

Persistencia de borradores: LocalStorage e **ID temporal** hasta confirmación en backend.

---

## 4) Detalle del Proyecto

Pestañas sugeridas:
- **Resumen**: metadatos clave, KPIs de cumplimiento, atajos rápidos.
- **Riesgo**: última evaluación + acción **“Volver a evaluar riesgo”** (reabre el wizard con datos previos del proyecto).
- **Documentación**: editor dinámico de **Expediente Técnico (Anexo IV)** basado en `configs/technical-dossier.json` + declaración de conformidad.
- **Workflows**: tareas RACI, aprobaciones y vencimientos.
- **Evidencias**: adjuntos, hashes, origen (Git/Jira/MLflow), sellado temporal.
- **Historial**: timeline de evaluaciones, documentos, incidentes.

Acciones contextuales:
- **Reportar incidente**.
- **Generar paquete de auditoría** (ZIP + índice JSON).

---

## 5) Agentes (lógicos) y responsabilidades

> Los “agentes” son procesos/servicios lógicos (no necesariamente hilos) que reaccionan a eventos y ejecutan tareas.

### 5.1 Agent: **Risk Agent**
- **Escucha**: `RISK_ASSESSMENT_CREATED`, `PROJECT_UPDATED`.
- **Hace**: recalcula KPIs del proyecto; actualiza clasificación y “obligaciones derivadas” (checklist).
- **Salida**: `PROJECT_RISK_UPDATED` (para refrescar Detalle/Dashboard).

### 5.2 Agent: **Incident Agent**
- **Escucha**: `INCIDENT_REPORTED`, `INCIDENT_UPDATED`.
- **Hace**: enruta notificaciones a responsables; actualiza contadores; marca DoC potencialmente “obsoleta” si el incidente afecta a controles clave.
- **Salida**: `INCIDENTS_CHANGED`.

### 5.3 Agent: **Evidence Agent**
- **Escucha**: `EVIDENCE_ADDED`.
- **Hace**: calcula hash, verifica origen, adjunta metadatos, solicita sellado de tiempo (cuando esté disponible).
- **Salida**: `EVIDENCE_INDEXED`.

### 5.4 Agent: **Sync Agent**
- **Escucha**: `NETWORK_ONLINE`, `NETWORK_OFFLINE`, `USER_LOGIN/LOGOUT`.
- **Hace**: sincroniza borradores locales (wizard/expediente) con backend; marca “Estado de la conexión” en footer; reintentos exponenciales.
- **Salida**: `SYNC_COMPLETED` / `SYNC_FAILED`.

### 5.5 Agent: **Audit Agent**
- **Escucha**: `REQUEST_AUDIT_PACKAGE`.
- **Hace**: compila evidencias/documentos del proyecto; genera ZIP con índice JSON y checksums.
- **Salida**: `AUDIT_PACKAGE_READY { link }`.

### 5.6 Agent: **Notification Agent**
- **Escucha**: eventos de alto impacto (incidentes graves, cambios de riesgo).
- **Hace**: entrega avisos en UI (toasts/banners) y canal opcional (email/webhook).

---

## 6) Eventos de dominio (actualizados)

```ts
type AppEvent =
  | { type: 'PROJECT_CREATED', payload: { projectId: string } }
  | { type: 'PROJECT_UPDATED', payload: { projectId: string } }
  | { type: 'RISK_ASSESSMENT_CREATED', payload: { projectId: string, assessmentId: string } }
  | { type: 'PROJECT_RISK_UPDATED', payload: { projectId: string } }
  | { type: 'INCIDENT_REPORTED', payload: { projectId: string, incidentId: string } }
  | { type: 'INCIDENTS_CHANGED', payload: { projectId?: string } }
  | { type: 'EVIDENCE_ADDED', payload: { projectId: string, evidenceId: string } }
  | { type: 'EVIDENCE_INDEXED', payload: { projectId: string, evidenceId: string } }
  | { type: 'REQUEST_AUDIT_PACKAGE', payload: { projectId: string } }
  | { type: 'AUDIT_PACKAGE_READY', payload: { projectId: string, link: string } }
  | { type: 'NETWORK_ONLINE' }
  | { type: 'NETWORK_OFFLINE' }
```

---

## 7) Modelo de datos (renombrado)

- **Project** (antes `AISystem`): id, name, role (provider/importer/distributor/user), purpose, owner, BU, deployments, **risk**, **docStatus**, tags, `lastAssessment`.
- **RiskAssessment**: id, projectId, createdAt, answers[], classification, justification, version.
- **DocumentRef**: id, projectId, type (expediente/doc/incidente_report), version, status, link, updatedAt.
- **Evidence**, **Incident**, **Task**, **WorkflowRun**, **Approval** (sin cambios conceptuales; relacionar por `projectId`).

**BD**: PostgreSQL con migraciones (FastAPI + SQLAlchemy). Soporte `.db` (SQLite) para desarrollo.

---

## 8) API (nomenclatura actualizada, ejemplo)

- `GET /projects` — listar
- `POST /projects` — crear
- `GET /projects/:id` — detalle
- `POST /projects/:id/risk` — crear evaluación
- `GET /projects/:id/risk` — listar evaluaciones
- `POST /projects/:id/documents` — añadir documento
- `GET /projects/:id/documents` — listar
- `POST /projects/:id/evidence` — añadir evidencia
- `GET /projects/:id/evidence` — listar
- `GET /incidents` — listar
- `POST /incidents` — crear

> **Nota**: mantener compatibilidad temporal con rutas antiguas y redirigir en el cliente.

---

## 9) UI (Lit + DaisyUI)

- Componentes base: `app-shell` (header+sidebar+footer), `project-list`, `project-detail`, `risk-wizard`, `tech-dossier-editor`, `incidents-list`, `evidence-list`, `team-view`, `audits-view`.
- DaisyUI para **steps**, **tabs**, **cards**, **badges** y **alerts**.
- Estado conexión en footer: suscrito al **Sync Agent**.

---

## 10) Internacionalización

- Claves i18n en `i18n/` por namespace (shell, projects, risk, incidents, settings).
- Selector persistente (LocalStorage).

---

## 11) Seguridad & sesiones

- Login con token (Bearer). Logout en menú de avatar.
- Protección de rutas según rol/permisos (RBAC/ABAC).

---

## 12) Métricas de cumplimiento (Dashboard)

- % proyectos con DoC vigente.
- Nº proyectos de **alto riesgo**.
- Incidentes abiertos por severidad.
- Tareas próximas (7/30 días).

---

## 13) Cambios aplicados respecto a wireframes originales

- **Renombrado** Inventario → **Proyectos**; Detalle de Sistema → **Detalle del Proyecto**.
- Menús del **sidebar** condicionados por proyecto activo (**Evidencias/Equipo/Auditorías**).
- **Wizard Nuevo Proyecto** en 4 pasos incluyendo **Evaluación del riesgo**.
- Acción en detalle: **“Volver a evaluar riesgo”**.
- Eliminados los **prompts de Figma** del documento de wireframes.
- **Stack** actualizado a **Lit + DaisyUI** y **PostgreSQL** (con opción `.db`).

---

## 14) Definición de “listo” (DoD) para esta fase

- Navegación y layout en Lit + DaisyUI con header/sidebar/footer.
- Rutas y vistas renombradas a “Proyectos” y “Detalle del Proyecto”.
- Wizard de **Nuevo Proyecto** funcional (pasos declarativos + persistencia local).
- Acción **“Volver a evaluar riesgo”** operativa en Detalle del Proyecto.
- Event bus y agentes lógicos registrados (mínimo Risk/Incident/Sync).
- Estado de conexión en footer.
