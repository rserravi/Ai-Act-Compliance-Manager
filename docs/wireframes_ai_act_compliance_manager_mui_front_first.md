# Wireframes — AI Act Compliance Manager (MUI, Front‑First)

> **Stack base:** React + Vite + TypeScript + MUI 6
> **Principios:** Front‑first (mocked), accesible (WCAG AA), responsive (xs–xl), dark/light.
> **Design tokens (sugeridos):**
> - Tipografía: `Inter` (UI), `Source Code Pro` (monoespaciado)
> - Espaciado: 8px grid
> - Esquinas: 12px
> - Elevación: 1/3/6
> - Paleta: Primary #0052CC, Secondary #7E57C2, Success #2E7D32, Warning #ED6C02, Error #D32F2F

---

## 0. IA Sitemap (Módulos)
- Dashboard
- Inventario de Sistemas (lista + detalle)
- Evaluación de Riesgo (wizard)
- Documentación (Expediente/DoC/Incidentes) — dentro del detalle de sistema
- Incidentes (global)
- Calendario & Workflows
- Organización & Roles
- Auditoría & Evidencias
- Ajustes (Integraciones, Preferencias)

---

## 1. Shell de Aplicación
**Layout:** AppBar superior fija + Drawer lateral colapsable + contenido con contenedores.

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ AppBar: Logo | AI Act Compliance Manager        [Buscar…]   LANG    [Usuario] │
├───────────────┬───────────────────────────────────────────────────────_───────┤
│ Drawer        │ Breadcrumbs / Título                                          │
│  • Dashboard  │ Tabs contextuales (según vista)                               │
│  • Inventario │ Cards / Tablas / Formularios                                  │
│  • Riesgo     │                                                               │
│  • Incidentes │ Footer con estado de conexión / versión                       │
│  • Calendario │                                                               │
│  • Org & Roles│                                                               │
│  • Auditoría  │                                                               │
│  • Ajustes    │                                                               │
└───────────────┴─────────────────────────────────────────────────────_─────────┘
```

**MUI:** `AppBar`, `Toolbar`, `Drawer`, `List`, `ListItemButton`, `Container`, `Breadcrumbs`, `Tabs`.

---

## 2. Dashboard (Home)
**Objetivo:** Visión ejecutiva del cumplimiento.

**Hero KPIs (Grid 3/4 columnas):**
- % sistemas con DoC vigente (Chip + Trend)
- Nº sistemas Alto Riesgo
- Incidentes abiertos (por severidad)
- Tareas próximas (hoy/semana)

**Widgets:**
- **Semáforo de cumplimiento** por unidad de negocio (Stacked bars)
- **Timeline** de eventos recientes (reentrenos, cierres de incidentes)
- **Tabla** “Acciones pendientes” (aprobaciones, documentación obsoleta)

```
[ KPI DoC ]  [ Alto Riesgo ]  [ Incidentes ]  [ Tareas ]

[ Semáforo cumplimiento (BU)  ──────────────── ]

[ Timeline de eventos ─────────────────────────]

[ Acciones pendientes (tabla) ─────────────────]
```

**MUI:** `Card`, `CardHeader`, `CardContent`, `DataGrid`, `LinearProgress`, `Chip`.

---

## 3. Inventario de Sistemas — Lista
**Objetivo:** Explorar y filtrar sistemas.

**Header:** Título + botón "Nuevo sistema" + filtros (BU, rol, riesgo, estado DoC, etiqueta).

**Tabla (DataGrid):**
- Nombre
- Rol (Proveedor/Importador/…)
- Riesgo (Chip color)
- Estado DoC (vigente/obsoleta/en borrador)
- Última evaluación
- Acciones: Ver, Evaluar Riesgo, Documentar, Archivar

**Empty state:** Ilustración + CTA “Crear sistema”.

```
[ + Nuevo sistema ] [ Rol v ] [ Riesgo v ] [ Estado DoC v ] [ Buscar… ]
┌───────────────────────────────────────────────────────────────────────┐
│ Nombre          Rol      Riesgo   DoC       Últ. Eval  …  [⋯]        │
│ Motor RRHH      Usuario  Alto     Vigente   2025‑09‑01      Ver       │
│ Chat Soporte    ProveedorLimitado N/A       2025‑08‑12      Ver       │
└───────────────────────────────────────────────────────────────────────┘
```

**MUI:** `DataGrid`, `Toolbar`, `TextField`, `Select`, `Menu`, `IconButton`.

---

## 4. Detalle de Sistema (Tabs)
**Tabs:** Resumen | Riesgo | Documentación | Workflows | Evidencias | Historial

### 4.1 Resumen
- Tarjeta con metadatos (rol, propietario, BU, propósito, despliegues, versiones)
- Chips de estado (Riesgo, DoC, Incidentes abiertos)
- Panel lateral: acciones rápidas (Evaluar riesgo, Generar expediente, Reportar incidente)

```
[Resúmen] [Riesgo] [Documentación] [Workflows] [Evidencias] [Historial]

[ Metadatos ]   [ Acciones rápidas ]
[ KPIs sistema ]
[ Últimos cambios / commits asociados ]
```

### 4.2 Riesgo (dentro del sistema)
- **Wizard** de autoevaluación con 5–7 pasos (Contexto, Derecho fundamental, Biométrico, Daño potencial, Anexo III, Transparencia, Resultado)
- Panel de **Justificación** autogenerada y editable.

**Footer wizard:** Atrás | Siguiente | Guardar borrador |
**Resultado:** Badge de clasificación + enlace a obligaciones derivadas (checklist dinámico).

### 4.3 Documentación
Sub‑tabs: Expediente Técnico | Declaración de Conformidad | Incidentes (relacionados)
- **Expediente:** editor estructurado (secciones Anexo IV) con estado por sección (Completo/Pendiente/Obsoleto), adjuntos y evidencias.
- **DoC:** formulario corto + firma (mock) + histórico de firmas.
- **Incidentes:** lista filtrada por este sistema.

### 4.4 Workflows
- Kanban de tareas de cumplimiento (Por hacer / En revisión / Aprobado)
- SLA y fechas objetivo; reasignación rápida.

### 4.5 Evidencias
- Tabla de evidencias con filtros (tipo, fecha, sistema) + previsualización.
- Sellado de tiempo (mock). Hash y origen (Git/Jira/MLflow).

### 4.6 Historial
- Línea temporal: evaluaciones de riesgo, cambios en expediente, DoC emitidas, incidentes reportados.

**MUI:** `Stepper`, `FormControl`, `RadioGroup`, `Markdown editor (custom)`, `Tabs`, `Chip`, `Timeline`.

---

## 5. Evaluación de Riesgo — Wizard standalone
**Uso:** acceso directo desde menú para crear una evaluación sin entrar en un sistema.

**Pasos:**
1) Contexto & propósito
2) Derechos fundamentales involucrados
3) Biométrico / vigilancia / manipulación
4) Daño potencial y vulnerables
5) Anexo III (sector/función)
6) Transparencia requerida
7) Resultado & obligaciones

```
┌ Wizard ───────────────────────────────────────────┐
│ Paso 2/7: Derechos fundamentales                  │
│  ☐ Empleo  ☐ Sanidad  ☐ Educación  ☐ Justicia     │
│  ☐ Crédito ☐ Servicios esenciales                 │
│  Campos extra si se marca alguna opción…           │
│                                                    │
│  [ Atrás ]      [ Guardar borrador ]   [ Siguiente ]│
└───────────────────────────────────────────────────┘
```

**Salida:** tarjeta de resultado con clasificación y enlaces a plantillas.

---

## 6. Incidentes (Global)
**Lista con filtros:** severidad, estado, sistema, fecha.

**Tabla:** ID, Sistema, Severidad (Chip), Estado, Fecha, Responsable, Acciones.

**Detalle:** Formulario basado en plantilla de reporte (Art. 73) con timeline de actualizaciones.

**CTA:** "Nuevo incidente" (modal con campos mínimos y luego editar detalle).

---

## 7. Calendario & Workflows
- Vista calendario mensual/semanal con tareas de cumplimiento y hitos (renovaciones DoC, revisiones periódicas, auditorías).
- Kanban por equipo y por sistema.

**MUI:** `Calendar` (lib externa), `Tabs`, `Chip`, `Dialog`.

---

## 8. Organización & Roles
**Secciones:**
- Unidades de negocio / Países
- Roles y permisos (RBAC/ABAC)
- Matriz **RACI** por sistema (tabla editable)

```
[ Añadir rol ]  [ Asignar RACI ]
┌──────────────────────────────────────────────┐
│ Sistema     Responsible  Accountable  …      │
│ Motor RRHH  Ana Gómez    CTO               … │
└──────────────────────────────────────────────┘
```

---

## 9. Auditoría & Evidencias
- Buscador de evidencias (texto, hash, origen)
- Vista de detalle con metadatos, hash, sellado, vínculo a origen
- Exportación de paquete de auditoría (ZIP con índice JSON)

---

## 10. Ajustes
- Integraciones (Jira, GitHub/GitLab, MLflow, DVC, SIEM)
- Preferencias (tema, idioma, formatos de exportación)
- Gestión de plantillas (crear/editar versiones)

---

## 11. Estados vacíos y errores (UX)
- **Empty states** con ilustración y CTA.
- **Skeletons** en cargas.
- **Errores** con retry y enlace a soporte.

---

## 12. Responsive (breakpoints MUI)
- **xs/sm:** Drawer modal, tablas en tarjetas apiladas, acciones en menú kebab.
- **md:** Tabla densa; dos columnas.
- **lg/xl:** Tres/cuatro columnas, gráficos lado a lado.

---

## 13. Accesibilidad
- Contraste AA, foco visible, navegación por teclado.
- Etiquetas ARIA en wizard y tablas.
- Preferencias de reducción de movimiento.

---

## 14. Prompts para Figma (copiar/pegar)

**A) Dashboard (card‑based, MUI look):**
```
Diseña un dashboard de cumplimiento AI Act con 4 KPIs en cards, un gráfico de barras apiladas por unidad de negocio (semáforo verde/ámbar/rojo) y un timeline de eventos. Estilo Material 3/MUI, grid 12 columnas, espaciado 8px, esquinas 12px, sombras suaves, modo claro/oscuro.
```

**B) Lista de Inventario:**
```
Diseña una tabla de sistemas de IA con barra de filtros arriba (Rol, Riesgo, Estado DoC, Buscar), chips de estado con colores y acciones por fila. Empty state elegante con ilustración y CTA.
```

**C) Detalle de Sistema — Tabs:**
```
Vista con tabs (Resumen, Riesgo, Documentación, Workflows, Evidencias, Historial). Panel lateral con Acciones rápidas. En Documentación, índice lateral de secciones y estados (Completo/Pendiente/Obsoleto).
```

**D) Wizard de Evaluación de Riesgo:**
```
Wizard de 7 pasos con Stepper superior, botones primarios/secundarios, tarjetas de elección y panel de Justificación editable a la derecha. Resultado final con badge y enlaces a obligaciones.
```

**E) Incidentes (Global):**
```
Lista con filtros por severidad/estado y detalle basado en plantilla Art. 73. Incluir timeline de actualizaciones y adjuntos.
```

**F) Calendario & Kanban:**
```
Calendario mensual/semanal con eventos de cumplimiento y tablero Kanban con columnas Por hacer/En revisión/Aprobado. Tarjetas con chips de SLA.
```

---

## 15. Componentes MUI reutilizables (design system)
- `StatusChip` (success/warning/error/neutral)
- `SectionState` (Completo/Pendiente/Obsoleto)
- `JustifyPanel` (markdown editor simple)
- `EvidenceCard` (hash + origen + fecha)
- `RiskBadge` (inaceptable/alto/limitado/mínimo)

---

## 16. Datos mock (fixtures)
- **Sistemas:** 12 registros variados por rol y riesgo
- **Evaluaciones:** resultados y fechas
- **Incidentes:** abierto/cerrado por severidad
- **Tareas:** próximas 7/30 días

---

## 17. Próximos pasos
1) Pasar estos wireframes a Figma con los prompts anteriores.
2) Generar componentes MUI en el frontend starter.
3) Conectar con mocks (JSON) y estados de carga/skeleton.
4) Añadir rutas (`react-router`) por módulo.

