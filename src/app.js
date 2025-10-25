/**
 * Aplicación Principal - Sistema Minimarket LP2
 * Inicialización y configuración global del sistema
 */

class MinimarketApp {
    constructor() {
        this.modules = new Map();
        this.services = new Map();
        this.components = new Map();
        this.isInitialized = false;
        this.currentModule = null;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadModule = this.loadModule.bind(this);
        this.handleRouteChange = this.handleRouteChange.bind(this);
    }

    /**
     * Inicializar la aplicación
     */
    async init() {
        try {
            console.log('🚀 Iniciando Sistema Minimarket LP2...');
            
            // 1. Verificar dependencias
            await this.checkDependencies();
            
            // 2. Validar recursos críticos
        await this.validateResources();
            
            // 3. Inicializar servicios core
            await this.initializeServices();
            
            // 4. Inicializar componentes globales
            await this.initializeComponents();
            
            // 5. Configurar router
            this.setupRouter();
            
            // 6. Configurar eventos globales
            this.setupGlobalEvents();
            
            // 7. Cargar módulo inicial
            await this.loadInitialModule();
            
            // 8. Configurar tema
            this.setupTheme();
            
            // 9. Mostrar aplicación
            this.showApplication();
            
            this.isInitialized = true;
            console.log('✅ Sistema inicializado correctamente');
            
            // Disparar evento de inicialización
            this.dispatchEvent('app:initialized');
            
        } catch (error) {
            console.error('❌ Error inicializando la aplicación:', error);
            this.showError('Error al inicializar la aplicación. Por favor, recargue la página.');
        }
    }

    /**
     * Verificar dependencias necesarias
     */
    async checkDependencies() {
        const dependencies = [
            { name: 'AppConfig', object: window.AppConfig },
            { name: 'Router', object: window.Router },
            { name: 'StorageService', object: window.StorageService },
            { name: 'ValidationService', object: window.ValidationService },
            { name: 'NotificationSystem', object: window.NotificationSystem },
            { name: 'Formatters', object: window.Formatters }
        ];

        const missing = dependencies.filter(dep => !dep.object);
        
        if (missing.length > 0) {
            throw new Error(`Dependencias faltantes: ${missing.map(d => d.name).join(', ')}`);
        }
        
        console.log('✅ Todas las dependencias están disponibles');
    }

    /**
     * Validar recursos críticos del sistema
     */
    async validateResources() {
        console.log('🔍 Validando recursos del sistema...');
        
        // Validación simplificada que verifica elementos DOM en lugar de hacer fetch
        const validationChecks = [
            {
                name: 'CSS Principal',
                check: () => document.querySelector('link[href*="styles.css"]') !== null,
                critical: true
            },
            {
                name: 'CSS Componentes', 
                check: () => document.querySelector('link[href*="components.css"]') !== null,
                critical: false
            },
            {
                name: 'Servicios Core',
                check: () => typeof window.ApiService !== 'undefined' || document.querySelector('script[src*="api.service.js"]') !== null,
                critical: true
            }
        ];

        const results = {
            missing: [],
            warnings: [],
            success: []
        };

        for (const validation of validationChecks) {
            try {
                if (validation.check()) {
                    results.success.push(validation);
                } else {
                    if (validation.critical) {
                        results.missing.push(validation);
                    } else {
                        results.warnings.push(validation);
                    }
                }
            } catch (error) {
                if (validation.critical) {
                    results.missing.push(validation);
                } else {
                    results.warnings.push(validation);
                }
            }
        }

        // Reportar resultados solo si hay problemas críticos
        if (results.missing.length > 0) {
            console.warn('⚠️ Recursos críticos faltantes:', results.missing.map(r => r.name));
        }

        if (results.warnings.length > 0) {
            console.info('ℹ️ Recursos opcionales faltantes:', results.warnings.map(r => r.name));
        }

        console.log(`✅ Validación completada: ${results.success.length} recursos OK, ${results.warnings.length} advertencias, ${results.missing.length} críticos faltantes`);
        
        return results;
    }

    /**
     * Inicializar servicios core
     */
    async initializeServices() {
        console.log('🔧 Inicializando servicios...');
        
        // Servicio de API
        if (window.ApiService) {
            this.services.set('api', window.ApiService);
            await window.ApiService.initialize();
        }
        
        // Servicio de almacenamiento
        if (window.StorageService) {
            this.services.set('storage', window.StorageService);
        }
        
        // Servicio de validación
        if (window.ValidationService) {
            this.services.set('validation', window.ValidationService);
        }
        
        // Sistema de notificaciones
        if (window.NotificationSystem) {
            this.services.set('notifications', window.NotificationSystem);
            window.NotificationSystem.init();
        }
        
        console.log('✅ Servicios inicializados');
    }

    /**
     * Inicializar componentes globales
     */
    async initializeComponents() {
        console.log('🧩 Inicializando componentes...');
        
        // Modal Manager
        if (window.ModalManager) {
            this.components.set('modal', window.ModalManager);
        }
        
        // Data Table
        if (window.DataTable) {
            this.components.set('table', window.DataTable);
        }
        
        console.log('✅ Componentes inicializados');
    }

    /**
     * Configurar router
     */
    setupRouter() {
        if (!window.Router) {
            console.warn('⚠️ Router no disponible');
            return;
        }
        
        // Configurar rutas
        const routes = [
            { path: '/', module: 'dashboard' },
            { path: '/dashboard', module: 'dashboard' },
            { path: '/sales', module: 'sales' },
            { path: '/inventory', module: 'inventory' },
            { path: '/purchases', module: 'purchases' },
            { path: '/quotes', module: 'quotes' },
            { path: '/cash', module: 'cash' },
            { path: '/users', module: 'users' },
            { path: '/settings', module: 'settings' }
        ];
        
        routes.forEach(route => {
            window.Router.addRoute(route.path, () => this.loadModule(route.module));
        });
        
        // Escuchar cambios de ruta
        window.addEventListener('popstate', this.handleRouteChange);
        
        console.log('✅ Router configurado');
    }

    /**
     * Configurar eventos globales
     */
    setupGlobalEvents() {
        // Atajos de teclado globales
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.dispatchEvent('app:save');
                        break;
                    case 'p':
                        e.preventDefault();
                        this.dispatchEvent('app:print');
                        break;
                    case 'f':
                        e.preventDefault();
                        this.dispatchEvent('app:search');
                        break;
                }
            }
            
            // Teclas de función
            switch (e.key) {
                case 'F1':
                    e.preventDefault();
                    this.loadModule('sales');
                    break;
                case 'F2':
                    e.preventDefault();
                    this.loadModule('inventory');
                    break;
                case 'F3':
                    e.preventDefault();
                    this.dispatchEvent('app:search');
                    break;
                case 'Escape':
                    this.dispatchEvent('app:escape');
                    break;
            }
        });

        // Manejo de errores globales
        window.addEventListener('error', (e) => {
            console.error('Error global:', e.error);
            this.handleGlobalError(e.error);
        });

        // Manejo de promesas rechazadas
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promesa rechazada:', e.reason);
            this.handleGlobalError(e.reason);
        });

        // Detectar cambios de conectividad
        window.addEventListener('online', () => {
            this.showNotification('Conexión restaurada', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('Sin conexión a internet', 'warning');
        });

        // Detectar cambios de visibilidad
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.dispatchEvent('app:hidden');
            } else {
                this.dispatchEvent('app:visible');
            }
        });

        console.log('✅ Eventos globales configurados');
    }

    /**
     * Cargar módulo inicial
     */
    async loadInitialModule() {
        const hash = window.location.hash.slice(1) || '/';
        const path = hash === '/' ? '/dashboard' : hash;
        
        if (window.Router) {
            window.Router.navigate(path);
        } else {
            // Fallback si no hay router
            await this.loadModule('dashboard');
        }
    }

    /**
     * Configurar tema
     */
    setupTheme() {
        const theme = window.AppConfig?.get('ui.theme', 'light');
        document.documentElement.setAttribute('data-theme', theme);
        
        // Escuchar cambios de tema del sistema
        if (theme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addListener((e) => {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            });
        }
        
        console.log(`✅ Tema configurado: ${theme}`);
    }

    /**
     * Mostrar aplicación
     */
    showApplication() {
        // Ocultar loader
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.style.display = 'none';
        }
        
        // Mostrar aplicación
        const app = document.getElementById('app');
        if (app) {
            app.style.display = 'block';
            app.classList.add('app-loaded');
        }
        
        // Animación de entrada
        setTimeout(() => {
            document.body.classList.add('app-ready');
        }, 100);
    }

    /**
     * Cargar módulo
     */
    async loadModule(moduleName) {
        try {
            console.log(`📦 Cargando módulo: ${moduleName}`);
            
            // Verificar si el módulo está habilitado
            if (!window.AppConfig?.get(`modules.${moduleName}.enabled`, true)) {
                throw new Error(`Módulo ${moduleName} no está habilitado`);
            }
            
            // Descargar módulo actual si existe
            if (this.currentModule) {
                await this.unloadModule(this.currentModule);
            }
            
            // Cargar nuevo módulo
            const moduleClass = window[this.getModuleClassName(moduleName)];
            if (!moduleClass) {
                throw new Error(`Clase del módulo ${moduleName} no encontrada`);
            }
            
            const moduleInstance = new moduleClass();
            this.modules.set(moduleName, moduleInstance);
            
            // Inicializar módulo
            if (typeof moduleInstance.init === 'function') {
                await moduleInstance.init();
            }
            
            this.currentModule = moduleName;
            
            // Actualizar navegación
            this.updateNavigation(moduleName);
            
            // Actualizar título
            this.updateTitle(moduleName);
            
            console.log(`✅ Módulo ${moduleName} cargado`);
            this.dispatchEvent('module:loaded', { module: moduleName });
            
        } catch (error) {
            console.error(`❌ Error cargando módulo ${moduleName}:`, error);
            this.showError(`Error al cargar el módulo ${moduleName}`);
        }
    }

    /**
     * Descargar módulo
     */
    async unloadModule(moduleName) {
        const moduleInstance = this.modules.get(moduleName);
        if (moduleInstance && typeof moduleInstance.destroy === 'function') {
            await moduleInstance.destroy();
        }
        this.modules.delete(moduleName);
        console.log(`🗑️ Módulo ${moduleName} descargado`);
    }

    /**
     * Obtener nombre de clase del módulo
     */
    getModuleClassName(moduleName) {
        return moduleName.charAt(0).toUpperCase() + moduleName.slice(1) + 'Module';
    }

    /**
     * Actualizar navegación
     */
    updateNavigation(moduleName) {
        // Remover clase activa de todos los enlaces
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Agregar clase activa al enlace actual
        const activeLink = document.querySelector(`[data-module="${moduleName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Actualizar título
     */
    updateTitle(moduleName) {
        const titles = {
            dashboard: 'Dashboard',
            sales: 'Ventas',
            inventory: 'Inventario',
            purchases: 'Compras',
            quotes: 'Cotizaciones',
            cash: 'Caja',
            users: 'Usuarios',
            settings: 'Configuración'
        };
        
        const title = titles[moduleName] || moduleName;
        document.title = `${title} - ${window.AppConfig?.get('app.name', 'Sistema Minimarket')}`;
    }

    /**
     * Manejar cambio de ruta
     */
    handleRouteChange() {
        if (window.Router) {
            window.Router.handleRoute();
        }
    }

    /**
     * Manejar errores globales
     */
    handleGlobalError(error) {
        if (window.AppConfig?.get('app.debug')) {
            console.error('Error global:', error);
        }
        
        // Mostrar notificación de error
        this.showNotification('Ha ocurrido un error inesperado', 'error');
        
        // Enviar error a servicio de logging si está disponible
        if (this.services.has('logging')) {
            this.services.get('logging').logError(error);
        }
    }

    /**
     * Mostrar notificación
     */
    showNotification(message, type = 'info') {
        if (this.services.has('notifications')) {
            this.services.get('notifications').show(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Mostrar error
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Disparar evento personalizado
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Obtener servicio
     */
    getService(name) {
        return this.services.get(name);
    }

    /**
     * Obtener componente
     */
    getComponent(name) {
        return this.components.get(name);
    }

    /**
     * Obtener módulo actual
     */
    getCurrentModule() {
        return this.modules.get(this.currentModule);
    }

    /**
     * Verificar si la aplicación está inicializada
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Reiniciar aplicación
     */
    async restart() {
        console.log('🔄 Reiniciando aplicación...');
        
        // Limpiar módulos
        for (const [name] of this.modules) {
            await this.unloadModule(name);
        }
        
        // Reinicializar
        this.isInitialized = false;
        await this.init();
    }

    /**
     * Destruir aplicación
     */
    async destroy() {
        console.log('🗑️ Destruyendo aplicación...');
        
        // Limpiar módulos
        for (const [name] of this.modules) {
            await this.unloadModule(name);
        }
        
        // Limpiar eventos
        window.removeEventListener('popstate', this.handleRouteChange);
        
        this.isInitialized = false;
    }
}

// Crear instancia global
const App = new MinimarketApp();

// Hacer disponible globalmente
window.App = App;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', App.init);
} else {
    App.init();
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}