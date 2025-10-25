# LP2 Minimarket - Sistema de Gestión

Sistema de gestión integral para minimarket desarrollado como proyecto académico para el curso de Laboratorio de Programación 2.

## 📋 Descripción del Proyecto

Este es un sistema web modular para la gestión completa de un minimarket, que incluye módulos para ventas, inventario, compras, cotizaciones, caja, usuarios y configuración del sistema.

## 🚀 Configuración Inicial

### Requisitos Previos
- Servidor web local (XAMPP, WAMP, o similar)
- Python 3.x (para servidor de desarrollo)
- Navegador web moderno

### Instalación y Ejecución

1. **Clonar el repositorio:**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd LP2-MINIMARKET
   ```

2. **Iniciar servidor de desarrollo:**
   ```bash
   python -m http.server 8000
   ```

3. **Acceder al sistema:**
   - Abrir navegador en: `http://localhost:8000`
   - **Usuario:** `admin`
   - **Contraseña:** `admin`

## 🏗️ Estructura del Proyecto

```
LP2-MINIMARKET/
├── index.html                 # Página de login (entrada principal)
├── dashboard.html            # Dashboard principal
├── public/
│   └── assets/
│       ├── css/             # Estilos CSS
│       ├── images/          # Imágenes del sistema
│       └── js/              # Scripts públicos
├── src/
│   ├── auth/
│   │   └── login.js         # Lógica de autenticación
│   ├── dashboard/
│   │   └── dashboard.js     # Controlador del dashboard
│   ├── modules/             # Módulos del sistema
│   │   ├── sales/           # Módulo de Ventas
│   │   ├── inventory/       # Módulo de Inventario
│   │   ├── purchases/       # Módulo de Compras
│   │   ├── quotes/          # Módulo de Cotizaciones
│   │   ├── cash/            # Módulo de Caja
│   │   ├── users/           # Módulo de Usuarios
│   │   └── settings/        # Módulo de Configuración
│   ├── components/          # Componentes reutilizables
│   ├── services/            # Servicios de API
│   └── utils/               # Utilidades generales
└── README.md
```

## 🎯 Módulos del Sistema

### 1. 🛒 **Módulo de Ventas** (`src/modules/sales/`)
**Responsable:** [Asignar integrante]

**Funcionalidades a implementar:**
- Registro de ventas
- Búsqueda de productos
- Cálculo de totales e impuestos
- Generación de comprobantes
- Historial de ventas

**Archivos principales:**
- `sales.js` - Lógica principal del módulo
- Estructura básica ya creada con funciones placeholder

### 2. 📦 **Módulo de Inventario** (`src/modules/inventory/`)
**Responsable:** [Asignar integrante]

**Funcionalidades a implementar:**
- Gestión de productos
- Control de stock
- Alertas de stock bajo
- Categorización de productos
- Reportes de inventario

**Archivos principales:**
- `inventory.js` - Lógica principal del módulo
- Estructura básica ya creada con funciones placeholder

### 3. 🛍️ **Módulo de Compras** (`src/modules/purchases/`)
**Responsable:** [Asignar integrante]

**Funcionalidades a implementar:**
- Registro de compras a proveedores
- Gestión de órdenes de compra
- Recepción de mercadería
- Control de costos
- Reportes de compras

**Archivos principales:**
- `purchases.js` - Lógica principal del módulo
- Estructura básica ya creada con funciones placeholder

### 4. 📋 **Módulo de Cotizaciones** (`src/modules/quotes/`)
**Responsable:** [Asignar integrante]

**Funcionalidades a implementar:**
- Creación de cotizaciones
- Gestión de clientes
- Conversión de cotizaciones a ventas
- Seguimiento de cotizaciones
- Reportes de cotizaciones

**Archivos principales:**
- `quotes.js` - Lógica principal del módulo
- Estructura básica ya creada con funciones placeholder

### 5. 💰 **Módulo de Caja** (`src/modules/cash/`)
**Responsable:** [Asignar integrante]

**Funcionalidades a implementar:**
- Apertura y cierre de caja
- Registro de transacciones
- Control de efectivo
- Reportes de caja
- Arqueo de caja

**Archivos principales:**
- `cash.js` - Lógica principal del módulo
- Estructura básica ya creada con funciones placeholder

### 6. 👥 **Módulo de Usuarios** (`src/modules/users/`)
**Responsable:** [Asignar integrante]

**Funcionalidades a implementar:**
- Gestión de usuarios del sistema
- Roles y permisos
- Registro de actividad
- Configuración de perfiles
- Seguridad de acceso

**Archivos principales:**
- `users.js` - Lógica principal del módulo
- Estructura básica ya creada con funciones placeholder

### 7. ⚙️ **Módulo de Configuración** (`src/modules/settings/`)
**Responsable:** [Asignar integrante]

**Funcionalidades a implementar:**
- Configuración general del sistema
- Parámetros de empresa
- Configuración de impuestos
- Backup y restauración
- Configuración de reportes

**Archivos principales:**
- `settings.js` - Lógica principal del módulo
- Estructura básica ya creada con funciones placeholder

## 🛠️ Guía de Desarrollo

### Para Desarrolladores de Módulos

1. **Estructura de cada módulo:**
   ```javascript
   // Configuración del módulo
   const MODULE_CONFIG = {
       moduleName: 'Nombre del Módulo',
       apiEndpoint: '/api/endpoint',
       permissions: ['permission1', 'permission2']
   };

   // Estado del módulo
   let moduleState = {
       // Variables de estado
   };

   // Función de inicialización
   function initModule() {
       // Lógica de inicialización
       renderModuleView();
   }

   // Función de renderizado
   function renderModuleView() {
       // HTML del módulo
       const content = `<div>...</div>`;
       
       // Actualizar contenido en dashboard
       if (window.DashboardAPI) {
           window.DashboardAPI.updateModuleContent(content);
       }
   }
   ```

2. **Integración con el Dashboard:**
   - Cada módulo se carga automáticamente al hacer clic en el sidebar
   - Usar `window.DashboardAPI.updateModuleContent(html)` para actualizar contenido
   - El sistema de navegación ya está configurado

3. **Convenciones de código:**
   - Usar español para comentarios y nombres de variables
   - Seguir la estructura de funciones ya establecida
   - Mantener consistencia con los estilos CSS existentes

### Flujo de Trabajo Recomendado

1. **Asignar módulos** a cada integrante del equipo
2. **Desarrollar localmente** cada módulo de forma independiente
3. **Probar integración** con el dashboard principal
4. **Realizar commits** frecuentes con mensajes descriptivos
5. **Coordinar merges** para evitar conflictos

## 🎨 Configuración Actual

### Sistema de Autenticación
- **Usuario por defecto:** `admin`
- **Contraseña por defecto:** `admin`
- Autenticación básica con sessionStorage
- Redirección automática al dashboard

### Dashboard Principal
- **Sidebar izquierdo** con navegación entre módulos
- **Header superior** con título del módulo actual
- **Área de usuario** en la esquina superior derecha
- **Carga dinámica** de contenido de módulos

### Estilos y UI
- **Framework CSS:** Estilos personalizados
- **Iconos:** Font Awesome (CDN)
- **Responsive:** Adaptable a diferentes pantallas
- **Tema:** Moderno con colores corporativos

### Estructura de Archivos
- **Modularidad:** Cada módulo en su propia carpeta
- **Separación:** HTML, CSS y JS organizados
- **Reutilización:** Componentes y servicios compartidos

## 📝 Notas para el Desarrollo

### Funciones Disponibles en cada Módulo
Cada archivo de módulo ya incluye:
- ✅ Estructura básica de configuración
- ✅ Funciones de inicialización
- ✅ Funciones de renderizado
- ✅ Funciones CRUD básicas (crear, leer, actualizar, eliminar)
- ✅ Comentarios TODO indicando qué implementar

### API del Dashboard
```javascript
// Funciones disponibles para los módulos
window.DashboardAPI = {
    updateModuleContent(html),    // Actualizar contenido principal
    getCurrentModule(),           // Obtener módulo actual
    showNotification(message),    // Mostrar notificaciones
    // ... más funciones según necesidad
};
```

## 🚀 Próximos Pasos

1. **Asignar responsables** para cada módulo
2. **Definir APIs** y estructura de datos
3. **Implementar funcionalidades** de cada módulo
4. **Integrar con base de datos** (si es necesario)
5. **Realizar pruebas** de integración
6. **Documentar APIs** desarrolladas

## 🤝 Contribución

1. Hacer fork del proyecto
2. Crear rama para tu módulo: `git checkout -b feature/nombre-modulo`
3. Realizar commits: `git commit -m 'Implementar funcionalidad X'`
4. Push a la rama: `git push origin feature/nombre-modulo`
5. Crear Pull Request

## 📞 Contacto

**Proyecto:** LP2 Minimarket  
**Curso:** Laboratorio de Programación 2  
**Institución:** [Nombre de la institución]

---

**¡Listo para comenzar el desarrollo! 🚀**