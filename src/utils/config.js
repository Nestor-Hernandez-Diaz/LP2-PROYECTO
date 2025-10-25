/**
 * Configuración global del Sistema de Ventas - Minimarket
 * Este archivo contiene todas las constantes y configuraciones globales
 */

// Configuración de la aplicación
const APP_CONFIG = {
    name: 'Sistema de Ventas - Minimarket',
    version: '1.0.0',
    author: 'Equipo de Desarrollo',
    description: 'Sistema integral de gestión para minimarket',
    
    // URLs base
    baseUrl: window.location.origin,
    apiUrl: '/api',
    
    // Configuración de sesión
    session: {
        timeout: 30 * 60 * 1000, // 30 minutos en milisegundos
        storageKey: 'minimarket_session',
        userKey: 'minimarket_user'
    },
    
    // Configuración de paginación
    pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [5, 10, 25, 50, 100]
    },
    
    // Configuración de formato
    format: {
        currency: 'PEN',
        currencySymbol: 'S/.',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm:ss',
        datetimeFormat: 'DD/MM/YYYY HH:mm:ss'
    },
    
    // Configuración de validación
    validation: {
        minPasswordLength: 6,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
        allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    }
};

// Rutas de la aplicación
const ROUTES = {
    // Ruta por defecto
    default: 'auth',
    
    // Rutas principales
    auth: {
        path: 'auth',
        title: 'Autenticación',
        module: 'auth',
        file: 'login.html',
        requiresAuth: false
    },
    dashboard: {
        path: 'dashboard',
        title: 'Dashboard',
        module: 'dashboard',
        file: 'dashboard.html',
        requiresAuth: true
    },
    inventory: {
        path: 'inventory',
        title: 'Inventario',
        module: 'inventory',
        file: 'inventory.html',
        requiresAuth: true
    },
    quotes: {
        path: 'quotes',
        title: 'Cotizaciones',
        module: 'quotes',
        file: 'quotes.html',
        requiresAuth: true
    },
    purchases: {
        path: 'purchases',
        title: 'Compras',
        module: 'purchases',
        file: 'purchases.html',
        requiresAuth: true
    },
    cash: {
        path: 'cash',
        title: 'Caja',
        module: 'cash',
        file: 'cash.html',
        requiresAuth: true
    },
    sales: {
        path: 'sales',
        title: 'Ventas',
        module: 'sales',
        file: 'sales.html',
        requiresAuth: true
    },
    users: {
        path: 'users',
        title: 'Usuarios',
        module: 'users',
        file: 'users.html',
        requiresAuth: true
    },
    settings: {
        path: 'settings',
        title: 'Parámetros',
        module: 'settings',
        file: 'settings.html',
        requiresAuth: true
    }
};

// Estados de la aplicación
const APP_STATES = {
    LOADING: 'loading',
    READY: 'ready',
    ERROR: 'error',
    AUTHENTICATED: 'authenticated',
    UNAUTHENTICATED: 'unauthenticated'
};

// Tipos de usuario
const USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    CASHIER: 'cashier',
    INVENTORY: 'inventory'
};

// Permisos por módulo
const PERMISSIONS = {
    dashboard: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CASHIER, USER_ROLES.INVENTORY],
    inventory: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.INVENTORY],
    quotes: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CASHIER],
    purchases: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
    cash: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CASHIER],
    sales: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CASHIER],
    users: [USER_ROLES.ADMIN],
    settings: [USER_ROLES.ADMIN, USER_ROLES.MANAGER]
};

// Mensajes del sistema
const MESSAGES = {
    // Mensajes de éxito
    success: {
        login: 'Inicio de sesión exitoso',
        logout: 'Sesión cerrada correctamente',
        save: 'Datos guardados correctamente',
        update: 'Datos actualizados correctamente',
        delete: 'Elemento eliminado correctamente',
        create: 'Elemento creado correctamente'
    },
    
    // Mensajes de error
    error: {
        login: 'Error en el inicio de sesión',
        logout: 'Error al cerrar sesión',
        save: 'Error al guardar los datos',
        update: 'Error al actualizar los datos',
        delete: 'Error al eliminar el elemento',
        create: 'Error al crear el elemento',
        network: 'Error de conexión de red',
        unauthorized: 'No tienes permisos para realizar esta acción',
        notFound: 'Elemento no encontrado',
        validation: 'Error de validación en los datos'
    },
    
    // Mensajes de confirmación
    confirm: {
        delete: '¿Estás seguro de que deseas eliminar este elemento?',
        logout: '¿Estás seguro de que deseas cerrar sesión?',
        unsavedChanges: 'Tienes cambios sin guardar. ¿Deseas continuar?'
    },
    
    // Mensajes informativos
    info: {
        loading: 'Cargando...',
        noData: 'No hay datos disponibles',
        selectItem: 'Selecciona un elemento',
        fillRequired: 'Completa todos los campos requeridos'
    }
};

// Configuración de notificaciones
const NOTIFICATION_CONFIG = {
    duration: 5000, // 5 segundos
    position: 'top-right',
    types: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    }
};

// Configuración de tablas
const TABLE_CONFIG = {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    sortable: true,
    filterable: true,
    exportable: true
};

// Configuración de formularios
const FORM_CONFIG = {
    autoSave: false,
    autoSaveInterval: 30000, // 30 segundos
    validateOnChange: true,
    validateOnBlur: true
};

// Exportar configuraciones para uso global
window.APP_CONFIG = APP_CONFIG;
window.ROUTES = ROUTES;
window.APP_STATES = APP_STATES;
window.USER_ROLES = USER_ROLES;
window.PERMISSIONS = PERMISSIONS;
window.MESSAGES = MESSAGES;
window.NOTIFICATION_CONFIG = NOTIFICATION_CONFIG;
window.TABLE_CONFIG = TABLE_CONFIG;
window.FORM_CONFIG = FORM_CONFIG;