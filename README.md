# Aura Ops — Gestión de Operaciones
> Módulo de control operacional del **Ecosistema Aura**: Tareas, responsables, solicitudes, aprobaciones, plazos y seguimiento de procesos internos (SOP).

---

## 🧭 Módulos Incluidos

1. **Centro de Control (Dashboard)**
   - KPIs de operaciones en tiempo real: tasa de cumplimiento SLA (%), solicitudes pendientes de firma, tareas fuera de plazo y procesos activos.
   - Panel de urgencias y bandeja rápida de aprobaciones con un clic.
   - Resumen del estado de Procedimientos Estándar de Operación (SOP).

2. **Tareas Operativas (Lista & Kanban)**
   - Doble vista: tabla ejecutiva estructurada y tablero Kanban por estados (`Pendiente`, `En Curso`, `En Revisión`, `Bloqueada`, `Completada`).
   - Priorización: `Baja`, `Media`, `Alta`, `Urgente`.
   - Checklists interactivos de verificación por tarea.
   - Filtros combinados por texto, estado, prioridad y responsable.

3. **Portal de Solicitudes Internas**
   - Registro de requerimientos operacionales: compras de insumos, permisos de trabajo/ingreso, accesos a sistemas TI, presupuestos y modificaciones de procesos.
   - Justificación técnica y presupuesto estimado en USD.

4. **Centro de Aprobaciones**
   - Flujo de revisión ejecutiva y auditoría.
   - Acciones: **Aprobar**, **Rechazar** o **Solicitar Modificaciones** con comentarios y registro de firma.

5. **Plazos & Calendario (Deadlines)**
   - Monitoreo preventivo de fechas límite con categorización de criticidad:
     - 🚨 **Vencidas** (con cálculo de días de atraso y opciones de prórroga rápida o resolución inmediata).
     - ⏰ **Vencen Hoy** (enfoque del turno actual).
     - ⏳ **Próximos 7 días** (horizonte de planificación operativa).

6. **Seguimiento de Procesos Internos (SOPs)**
   - Estandarización de flujos operativos en etapas (Stages).
   - Barras de progreso por fase con conteo de puntos de control.
   - Códigos oficiales de procedimientos (ej. `SOP-OPS-001-v3`, `SOP-QA-002-v5`) y última fecha de auditoría.

7. **Equipo & Responsables**
   - Directorio de miembros con roles (`Líder de Operaciones`, `Supervisor`, `Operador`, `Auditor`, `Gerente`).
   - Monitoreo de carga operativa actual y porcentaje de saturación.
   - Modal para dar de alta nuevos miembros al equipo.

---

## 🎨 Diseño & Estilo
- **Estética**: Sobria, ejecutiva y sutil, utilizando tonos neutrales Slate (`slate-900`, `slate-800`, `slate-100`), bordes pulidos y acentos suaves.
- **Tipografía**: `Inter` con tracking ajustado.
- **Persistencia**: Sincronización automática en `localStorage` con opción de restablecer datos muestra en cualquier momento desde el sidebar.

---

## 🚀 Puesta en Marcha

### Prerrequisitos
- **Node.js** (v18+)
- **NPM**

### Instalación de dependencias
```bash
cd "Aura Ops"
npm install
```

### Iniciar servidor de desarrollo
```bash
npm start
# O alternativamente:
npx ng serve
```
Acceder en el navegador a: `http://localhost:4200/`

### Compilación para Producción
```bash
npm run build
```
Los archivos optimizados se generarán en la carpeta `dist/aura-ops`.
