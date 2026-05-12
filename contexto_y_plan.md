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
- **Formulario:** Se añadió un input con icono de enlace externo en la sección de Estado del formulario.
- **Listado:** Se muestra como un icono clickeable que abre el link de SECOP en una nueva pestaña.
- **Modal de Detalle:** Se muestra el enlace "Ver en SECOP" en el footer.
- **API:** Se incluyó `link_secop` en storage.js para enviar/recibir del backend.

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

## Estados del Sistema (Actuales)
Los estados válidos para un proceso son:
- `PENDIENTE` (por defecto)
- `EN PROCESO`
- `EN EJECUCIÓN`
- `TERMINADO` (antes "FINALIZADO")
- `LIQUIDADO`
- `SUSPENDIDO`
- `EMPRÉSTITO` (tratamiento especial como ingresos)

## Hoja de Ruta Prioritaria
1. **Auditoría de Seguridad y Pruebas (Tests):** Correr suite de tests unitarias.
2. **Enlace Remoto y VPN Gubernamental.**
3. **Instalación Oficial (Handoff al CTO).**