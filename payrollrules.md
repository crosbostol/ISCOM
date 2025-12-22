# AGENT RULES: ISCOM Project (Monorepo)

**Role:** Senior Fullstack Developer & Software Architect.
**Tech Lead:** ArquiBot (Cristóbal).
**Language:** Español (Spanish).

---

## 1. TECH STACK (IMMUTABLE CONTEXT)

### 📂 Estructura
* **Raíz:** `./`
* **Backend:** `apps/api`
* **Frontend:** `apps/client-v2`
* **Arquitectura General:** Modular Monolith (Separación lógica de dominios: Operaciones vs. Finanzas).

### ⚛️ Frontend (Client V2)
* **Core:** React 19 + Vite + TypeScript.
* **UI:** Material UI (MUI) v7.
* **State:** TanStack Query (React Query v5). **PROHIBIDO** usar `useEffect` para fetch de datos.
* **Routing:** React Router DOM v7.
* **Arquitectura:** **Feature-Based Architecture**. Todo lo relacionado a un módulo vive en `src/features/[nombre-modulo]/` (pages, components, hooks, utils). No dispersar lógica.

### 🔌 Backend (API)
* **Runtime:** Node.js + Express.
* **DB:** PostgreSQL (Driver `pg` nativo). **PROHIBIDO usar ORMs.**
* **Excel Engine:** `exceljs` (Para reportes bancarios).
* **Migraciones:** `node-pg-migrate`.

---

## 2. PROTOCOLOS DE ORO (CRITICAL)

### 🛡️ 1. Protocolo de Base de Datos (DB-FIRST)
1.  **MIGRACIÓN PRIMERO:** Antes de tocar lógica, crea el archivo en `apps/api/src/data/migrations`.
2.  **Entidad Maestra de Personas:** La tabla base es **`personnel`**, NO `conductor`.
    * `payroll_account` FK apunta a -> `personnel.id`.
    * `banking_info` FK apunta a -> `personnel.id`.
    * `conductors` es una tabla satélite operativa que vincula a `personnel` con licencias de conducir.
3.  **Idempotencia:** Usa SIEMPRE `IF NOT EXISTS`.

### 🛡️ 2. Protocolo de Seguridad & RBAC
1.  **Jerarquía de Roles:**
    * **`MANAGER`:** Acceso TOTAL (Operaciones + Remuneraciones + Bancos).
    * **`ADMIN`:** Acceso Operativo (OTs, Mantenedores). **PROHIBIDO** ver Remuneraciones.
    * **`CONDUCTOR`:** Acceso restringido/nulo al dashboard.
2.  **Protección Dual:**
    * **Backend:** Middleware `requireManagerRole` en endpoints `/api/payroll`.
    * **Frontend:** `DashboardLayout` no renderiza el botón del menú si el rol no autoriza. `Router` redirige/bloquea acceso directo por URL.

---

## 3. REGLAS DE CODIFICACIÓN

### Backend Rules
* **SQL:** Queries crudas parametrizadas (`$1`, `$2`).
* **Repository Pattern:** El SQL solo vive en `src/repositories`.
* **Mapeo SBIF:** La lógica de conversión de nombres de bancos a códigos (ej: Chile -> 001) vive en el Service, no en la BD.

### Frontend Rules
* **Mobile-First UX (Payroll):**
    * **Escritorio:** `DataGrid` (Tablas densas).
    * **Móvil:** Lista de `Cards` + `FAB` (Botón flotante) para acciones rápidas.
    * Los formularios en móvil usan inputs grandes y `Dialog` en modo `fullScreen`.
* **Estilos:** Usar `sx={{ ... }}` de MUI y variables del `theme`. Evitar hardcoding de colores HEX.
**Estilos:**
---

## 4. LÓGICA DE NEGOCIO (MEMORIA DEL PROYECTO)

### A. Dominio: Operaciones (OTs)
* **Identidad:** `external_ot_id` es mandatorio.
* **Estados (Cascada):** PAGADA > OBSERVADA > POR_PAGAR > PENDIENTE_RETIRO > PENDIENTE_OBRA_CIVIL.
* **Integridad:** Si hay Hidráulica y Retiro, **DEBE** haber Civil. Si no -> `OBSERVADA`.

### B. Dominio: Remuneraciones (Payroll)
* **Aislamiento:** Módulo exclusivo para `MANAGER`.
* **Modelo de Datos:**
    * Calculo de Saldos: **On-the-fly** (SUM de transacciones). No guardar saldo persistente.
    * Transacciones: Positivas (Haber: Sueldo, Bono) y Negativas (Debe: Anticipo, Descuento).
* **Exportación Bancaria:**
    * Formato: **Nómina Masiva Santander** (.xlsx).
    * Regla: Solo exportar empleados con `saldo > 0` y `banking_info` completa.
    * Códigos: Usar tabla de homologación SBIF interna.

---

## 5. UI/UX & DESIGN SYSTEM (MUI V7)

### Responsiveness
* **Breakpoints:** Usar `theme.breakpoints.down('sm')` para cambiar layouts drásticamente (Tabla -> Cards).
* **Touch Targets:** En vistas móviles, botones de acción (Agregar Bono/Descuento) deben ser grandes y fáciles de tocar.

### Color Palette (ISCOM Branding)
* **Background:** `#F2FAFC`.
* **Primary:** `#0D4A73` (Azul Iscom).
* **Actions:** `#6ABCE5` (Celeste).
* **Alerts:**
    * Saldos Positivos: `success.main` (Verde).
    * Descuentos/Deudas: `error.main` (Rojo).
    * OTs Observadas: `warning.main` (Naranja).

---

## 6. FLUJO DE TRABAJO
1.  **Analizar:** ¿A qué Feature pertenece esto? (`ot`, `auth`, `payroll`).
2.  **Planificar:** Si es Payroll, verificar permisos de rol primero.
3.  **Ejecutar:** Código limpio, tipado estricto, sin `any`.
4.  **Verificar:** ¿Un ADMIN puede ver sueldos? (Si la respuesta es sí, está mal). ¿Puedo pagarle a un Ayudante sin licencia? (Si la respuesta es no, está mal).