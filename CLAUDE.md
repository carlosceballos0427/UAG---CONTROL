# UAG Control — Seguimiento de Contratos

Aplicación web para la gestión y seguimiento financiero de contratos de la **Unidad
Administrativa de Gestión (UAG)** de la Alcaldía de Cali (trabajo de Carlos): control
de ejecución financiera, adiciones, pagos y estados de procesos contractuales.

**Leer `contexto_y_plan.md`** antes de hacer cambios grandes: ahí está el plan del proyecto.

## Stack

- **Frontend** (raíz del repo): React 18 + Vite + Tailwind CSS
  - Firebase (auth/datos), Recharts (gráficos), xlsx (importar/exportar Excel),
    framer-motion, lucide-react
- **Backend** (`backend/`): Django 6 + Django REST Framework + django-cors-headers
  - Apps: `api/`, `core/`; base de datos SQLite (`backend/db.sqlite3`)
- `INICIAR_APP.bat` y `backend/backup_db.bat` son scripts de Windows (no usarlos en WSL).
- `_respaldo-windows/` es un respaldo — no tocar.

## Comandos (en WSL/Ubuntu)

```bash
# Frontend (desde la raíz)
npm run dev        # Vite, puerto 5173
npm run build      # build de producción
npm run lint       # ESLint

# Backend (desde backend/; crear venv si no existe: python3 -m venv .venv && pip install -r requirements.txt)
python manage.py runserver   # API en puerto 8000
python manage.py migrate     # migraciones
```

El preview de Claude usa `.claude/launch.json` (frontend y backend como configuraciones separadas).

## Reglas de estilo de código (OBLIGATORIAS)

Todo el código debe quedar documentado en español:

- **Cada función/componente** → docstring (Python) o comentario de encabezado (JSX) con qué hace, parámetros/props y retorno.
- **Cada bucle** (`.map()`, `for`) → comentario de una línea: qué recorre y para qué.
- **Cada línea/expresión compleja** (querysets, cálculos financieros, transformaciones de Excel, hooks) → comentario explicativo.
- **Bloques de HTML/CSS/JSX** → comentario de sección describiendo su propósito.

## Contexto adicional

- Datos financieros de contratos públicos: cuidado extremo con cálculos de montos,
  redondeos y fórmulas — comentar toda fórmula financiera.
- Idioma del proyecto: español (respuestas, comentarios y documentación en español).
