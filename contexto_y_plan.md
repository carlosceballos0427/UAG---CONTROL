# Contexto del Proyecto y Plan de Acción (Actualizado)

## Contexto Institucional
- **Aplicación:** UAG Control - App Seguimiento
- **Entorno Objetivo:** Servidor Intranet del Municipio de Cali (Departamento Administrativo de Hacienda Urbana).
- **Stack Tecnológico:** Python, Django REST Framework, SQLite (Backend) y Vite/React (Frontend).

## Hitos Alcanzados (Seguridad y Autonomía)
1. **Eliminación de Firebase:** Se erradicaron dependencias externas para garantizar que los datos públicos permanezcan 100% On-Premise sin viajar a nubes comerciales.
2. **Autenticación Nativa Robusta (Tokens DRF):** Toda la arquitectura API fue sellada bajo estrictos parámetros de encriptación (`IsAuthenticated`), imposibilitando el acceso no autorizado a la base de datos de contratos.
3. **Gestión de Personal Privada:** El Frontend ahora integra un módulo administrativo exclusivo para que el CTO controle las contraseñas sin requerir inmersión en la terminal.
4. **Saneamiento Técnico:** Configuración maestra corregida en Visual Studio Code para vincular perfectamente a Pylance con los entornos virtuales locales.

## Hitos del 12 de Mayo, 2026 (Mejoras UX/UI y Funcionales)

### 1. Renombramiento de Estado: FINALIZADO → TERMINADO
- Se cambió el estado "FINALIZADO" por "TERMINADO" en toda la aplicación.
- **Archivos modificados:** DataEntryForm.jsx, ProcessList.jsx, Dashboard.jsx, ProcessDetailModal.jsx, excelIO.js
- La normalización en `excelIO.js` ahora reconoce tanto "TERMINADO" como "FINALIZADO" del Excel y lo mapea a "TERMINADO".

### 2. Nuevo Campo: Link SECOP
- Se agregó un campo `link_secop` (URLField, max 500 chars) al modelo Django `Proceso`.
- **Migración:** `0003_add_link_secop.py` — aplicada exitosamente.
- **Formulario:** Se añadió un input con icono `ExternalLink` (lucide-react) en la sección de Estado del formulario, con placeholder `https://community.secop.gov.co/...`.
- **Listado:** Se muestra como un **badge premium SECOP** con diseño UI/UX avanzado (ver sección 6).
- **Modal de Detalle:** Se muestra el badge "Ver en SECOP" con el mismo diseño en el footer.
- **API:** Se incluyó `link_secop` en storage.js (getStoredData, addEntry, updateEntry).
- **Admin Django:** Campo visible en `list_display` y `search_fields`.

### 3. Filtros en el Listado de Procesos (ProcessList)
- **Buscador de texto:** Input para buscar por N° de proceso, contratista, objeto o supervisor.
- **Filtros por Estado con contadores:** Badges/botones para cada estado (PENDIENTE, EN PROCESO, EN EJECUCIÓN, TERMINADO, LIQUIDADO, SUSPENDIDO, EMPRÉSTITO) mostrando la cantidad de procesos en cada estado.
- **Contador dinámico:** Muestra "X de Y Procesos" según los filtros aplicados.
- Solo se muestran los estados que tienen al menos 1 proceso.

### 4. Tooltips Mejorados en el Dashboard
- **Tarjetas de métricas:** Al pasar el mouse (hover) se muestra un tooltip oscuro con información detallada:
  - "Procesos Totales" → desglose por cada estado
  - "Terminados" → porcentaje del total
  - "Valor Adjudicado" → total pagado y porcentaje ejecutado
- **Gráfico de Pie (Estado):** Tooltip personalizado que muestra nombre, cantidad y porcentaje.
- **Gráfico de Barras (Modalidad):** Tooltip personalizado con cantidad de procesos.
- **Gráfico de Líneas (Ejecución por Mes):** Tooltip personalizado con formato de moneda colombiana.

### 5. Ampliación de Cuentas de Cobro: 24 → 48
- La constante `CUENTAS_COBRO` en DataEntryForm.jsx se amplió de 24 a 48.
- Permite registrar hasta 48 cuotas de cobro por proceso.

### 6. Badge SECOP Premium (Diseño UI/UX)
- **Componente visual:** Badge tipo "pill" con icono SVG de escudo con check (shield-check).
- **Diseño:** Gradiente azul→morado (`#0ea5e9 → #2563eb → #7c3aed`), texto blanco, sombra glow.
- **Animaciones:**
  - **Hover shimmer:** Efecto de brillo que recorre el badge de izquierda a derecha.
  - **Hover glow:** La sombra se intensifica (`box-shadow: 0 4px 16px rgba(37,99,235,0.45)`).
  - **Pulse del icono:** Animación `secopPulse` escala el escudo al 120% y regresa.
  - **Elevación:** `translateY(-1px)` para efecto de flotación.
- **CSS:** Estilos definidos en `App.css` bajo la sección `/* SECOP BADGE */`.
- **Variantes:**
  - **En tabla (ProcessList):** Badge compacto con texto "SECOP" (13px icono, 9px texto).
  - **En modal (ProcessDetailModal):** Badge más grande con texto "Ver en SECOP" (16px icono, 11px texto, padding 6px 12px).
- **Cuando no hay link:** Se muestra un guión `—` en gris claro.

### 7. Rediseño de Tabla ProcessList (UI/UX)
- **Layout:** `table-fixed` con `w-full` — la tabla ocupa el 100% del ancho sin scroll horizontal.
- **Distribución de columnas (porcentual):**
  - N° Proceso: 15% | Objeto/Contratista: 27% | Valor Total: 10% | Pagado: 10% | Saldo: 10% | Estado: 11% | SECOP: 7% | Acciones: 10%
- **Textos largos:** Todos usan `truncate` con tooltip nativo al hover para ver el contenido completo.
- **N° Proceso:** Fuente monoespaciada (`font-mono`), color azul, `truncate` (nunca se parte en dos líneas).
- **Objeto/Contratista:** Objeto en línea 1 (truncado), contratista en línea 2 (gris claro, truncado).
- **Valores monetarios:** Font-mono, `truncate`, colores semánticos (gris=total, verde=pagado, ámbar=saldo pendiente).
- **Estado:** Badge con colores por estado, `font-bold`, `whitespace-nowrap`.
- **Hover de fila:** `hover:bg-blue-50/30` con transición suave.
- **Header:** Gradiente sutil `from-slate-50 to-gray-50`.

## Estados del Sistema (Actuales)
Los estados válidos para un proceso son:
- `PENDIENTE` (por defecto)
- `EN PROCESO`
- `EN EJECUCIÓN`
- `TERMINADO` (antes "FINALIZADO")
- `LIQUIDADO`
- `SUSPENDIDO`
- `EMPRÉSTITO` (tratamiento especial como ingresos)

## Archivos Clave Modificados (Sesión Mayo 12, 2026)
| Archivo | Cambios |
|---------|---------|
| `backend/api/models.py` | +campo `link_secop` (URLField) |
| `backend/api/admin.py` | +link_secop en list_display y search_fields |
| `backend/api/serializers.py` | Sin cambios (usa `fields='__all__'`) |
| `backend/api/migrations/0003_add_link_secop.py` | Migración aplicada |
| `src/components/DataEntryForm.jsx` | +input SECOP, TERMINADO, 48 cuotas, import ExternalLink |
| `src/components/ProcessList.jsx` | Rediseño completo: filtros, badge SECOP, table-fixed |
| `src/components/Dashboard.jsx` | TERMINADO, tooltips personalizados en gráficos y cards |
| `src/components/ProcessDetailModal.jsx` | TERMINADO, badge SECOP en footer |
| `src/utils/excelIO.js` | normalizeEstado: FINALIZADO→TERMINADO |
| `src/utils/storage.js` | +mapping link_secop en get/add/update |
| `src/styles/App.css` | +sección SECOP BADGE (estilos, animaciones) |

## Hoja de Ruta Prioritaria
1. **Auditoría de Seguridad y Pruebas (Tests):** Correr suite de tests unitarias.
2. **Enlace Remoto y VPN Gubernamental.**
3. **Instalación Oficial (Handoff al CTO).**