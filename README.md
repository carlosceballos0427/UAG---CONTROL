# UAG Control — Seguimiento de Contratos

Aplicación web para la gestión y seguimiento financiero de contratos, diseñada para la **Unidad Administrativa de Gestión (UAG)**. Permite el control detallado de la ejecución financiera, adiciones, pagos y estados de procesos contractuales.

## 🚀 Características Principales

- **Gestión de Procesos:** Creación, edición y seguimiento de contratos.
- **Importación/Exportación Excel:** Carga masiva de datos y exportación de reportes detallados.
- **Control Financiero:**
  - Cálculo automático de saldos.
  - Gestión de Adiciones presupuestales.
  - Registro detallado de Pagos (Cuentas de Cobro).
- **Interfaz Moderna:** Diseño limpio, intuitivo y responsivo.
- **Gestión de Dependencias:** Administración configurable de organismos/dependencias.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Iconos:** [Lucide React](https://lucide.dev/)
- **Backend:** Python + Django REST Framework
- **Base de Datos:** SQLite
- **Manejo de Datos:** Persistencia local, Backend (API) y manipulación de Excel (XLSX).

## 📦 Instalación y Uso (Modo Red Local)

1. **Clonar el repositorio:**
    ```bash
    git clone https://github.com/carlosceballos0427/UAG---CONTROL.git
    cd UAG---CONTROL
    ```

2. **Preparar el entorno:**
    - Instalar dependencias del Frontend corriendo `npm install` en la raíz.
    - Configurar el entorno virtual en la carpeta `backend` e instalar dependencias con `pip install django djangorestframework django-cors-headers`.
    - Ejecutar las migraciones de Django: `python manage.py migrate`.

3. **Iniciar la aplicación (El "Botón Mágico"):**
    Para facilitar el trabajo diario en el equipo principal (servidor), ejecuta:
    👉 **Doble clic en `INICIAR_APP.bat`**
    Esto iniciará automáticamente tanto el Backend (Puerto 8000) como el Frontend (Puerto 5173 expuesto a la red local) y abrirá el navegador.

4. **Acceso desde otros equipos:**
    Crea un acceso directo en los otros ordenadores apuntando a la IP del equipo principal.
    *Ejemplo de URL para el acceso directo:* `http://192.168.1.50:5173`

## 📋 Funcionalidades Detalladas

### Edición de Contratos
Permite editar campos clave del contrato, incluyendo:
- Información Básica (No., Mes, Número de Proceso).
- Detalles del Contrato (Contratista, Objeto, **Supervisor**, **Apoyo**).
- Ejecución Financiera (Presupuesto, Valor Adjudicado, CDP).

### Importación de Excel
El sistema soporta la carga de archivos Excel (`.xlsx`) estandarizados.
- Detecta automáticamente **Adiciones** y **Pagos** en columnas específicas.
- Parsea el historial de pagos detallado ("Cuenta de Cobro N° X").

### Sistema de Autenticación
- Control de acceso de usuarios mediante Backend (Django REST).
- Roles de usuario (Administrador, Radicador).
- UI de Login moderna con visibilidad de contraseña (Botón de ojo) y mensajes de alerta profesionales.

## 🤝 Contribución

1.  Hacer Fork del proyecto.
2.  Crear una rama (`git checkout -b feature/nueva-funcionalidad`).
3.  Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`).
4.  Push a la rama (`git push origin feature/nueva-funcionalidad`).
5.  Abrir un Pull Request.

---
Desarrollado para el seguimiento eficiente de la contratación estatal.
