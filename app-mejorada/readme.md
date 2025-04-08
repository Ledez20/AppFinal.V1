# Sistema de Gestión de Producción

Una aplicación web moderna para gestionar operaciones de producción, personal, notas y nóminas.

## Características principales

- **Dashboard**: Panel principal con resumen de actividades diarias, estadísticas y gráficos
- **Notas y Programación**: Gestión de notas y actividades programadas
- **Gestión de Personal**: Administración del equipo de trabajo
- **Operaciones**: Registro y seguimiento de operaciones de elaboración, clasificación y descarga
- **Nóminas**: Gestión de horas trabajadas y generación de informes
- **Reportes**: Generación de informes y análisis de datos
- **Respaldo y restauración**: Sistema de respaldo automático de datos

## Estructura del proyecto

```
app-mejorada/
├── index.html           # Página principal
├── css/
│   └── styles.css       # Estilos CSS
├── js/
│   ├── app.js           # Lógica principal y dashboard
│   ├── database.js      # Gestión de datos (localStorage)
│   ├── notas.js         # Funcionalidad de notas
│   ├── personal.js      # Gestión de personal
│   ├── operaciones.js   # Gestión de operaciones
│   ├── nominas.js       # Registro de nóminas
│   ├── reportes.js      # Generación de reportes
│   └── ui.js            # Interfaz de usuario
└── readme.md            # Documentación
```

## Mejoras respecto a la versión anterior

- **Arquitectura modular**: Código organizado en módulos independientes
- **Base de datos mejorada**: Sistema de almacenamiento estructurado usando localStorage
- **Interfaz moderna**: Diseño actualizado con Bootstrap 5 y FontAwesome
- **Visualización de datos**: Gráficos y estadísticas para mejor análisis
- **UX mejorada**: Navegación intuitiva, notificaciones y sistema de confirmaciones
- **Responsive**: Optimizado para dispositivos móviles y de escritorio
- **Sistema de respaldos**: Exportación e importación de datos

## Tecnologías utilizadas

- HTML5, CSS3 y JavaScript (ES6+)
- Bootstrap 5 para el diseño y componentes UI
- Chart.js para visualización de datos
- FontAwesome para iconos
- LocalStorage para persistencia de datos

## Requisitos

Solo se necesita un navegador web moderno. La aplicación funciona completamente en el cliente sin necesidad de servidor.

## Uso

1. Abra el archivo `index.html` en su navegador
2. El sistema cargará los datos existentes o creará datos de ejemplo si es la primera vez
3. Navegue por las diferentes secciones usando el menú lateral
4. Se recomienda crear respaldos periódicos de sus datos

## Desarrollo futuro

- Sincronización con servicios en la nube
- Modo oscuro
- Versión progresiva (PWA) para instalación
- Sistema de usuarios y permisos 