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
- **Manejo de Datos:** LocalStorage (Persistencia local) + XLSX (Excel)

## 📦 Instalación y Uso

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/carlosceballos0427/UAG---CONTROL.git
    cd UAG---CONTROL
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Iniciar servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173`.

4.  **Construir para producción:**
    ```bash
    npm run build
    ```

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

## 🤝 Contribución

1.  Hacer Fork del proyecto.
2.  Crear una rama (`git checkout -b feature/nueva-funcionalidad`).
3.  Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`).
4.  Push a la rama (`git push origin feature/nueva-funcionalidad`).
5.  Abrir un Pull Request.

---
Desarrollado para el seguimiento eficiente de la contratación estatal.
