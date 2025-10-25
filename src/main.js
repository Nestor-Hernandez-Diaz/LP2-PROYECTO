/**
 * Archivo principal del Sistema de Ventas - Minimarket
 * Inicializa la aplicación y configura los componentes principales
 */

class MinimarketApp {
    constructor() {
        this.isInitialized = false;
        this.appState = APP_STATES.LOADING;
        this.init();
    }

    /**
     * Inicializa la aplicación
     */
    async init() {
        try {
            console.log('Iniciando Sistema de Minimarket...');
            
            // Mostrar loader inicial
            Utils.showLoader();
            
            // Verificar compatibilidad del navegador
            this.checkBrowserCompatibility();
            
            // Inicializar servicios
            await this.initializeServices();
            
            // Configurar manejadores de eventos globales
            this.setupGlobalEventHandlers();
            
            // Configurar interceptores de errores
            this.setupErrorHandlers();
            
            // Marcar como inicializada
            this.isInitialized = true;
            this.appState = APP_STATES.READY;
            
            console.log('Sistema de Minimarket iniciado correctamente');
            
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
            this.appState = APP_STATES.ERROR;
            this.showInitializationError(error);
        } finally {
            Utils.hideLoader();
        }
    }

    /**
     * Verifica la compatibilidad del navegador
     */
    checkBrowserCompatibility() {
        const requiredFeatures = [
            'localStorage',
            'fetch',
            'Promise',
            'URLSearchParams'
        ];
        
        const missingFeatures = requiredFeatures.filter(feature => {
            switch (feature) {
                case 'localStorage':
                    return typeof Storage === 'undefined';
                case 'fetch':
                    return typeof fetch === 'undefined';
                case 'Promise':
                    return typeof Promise === 'undefined';
                case 'URLSearchParams':
                    return typeof URLSearchParams === 'undefined';
                default:
                    return false;
            }
        });
        
        if (missingFeatures.length > 0) {
            throw new Error(`Navegador no compatible. Características faltantes: ${missingFeatures.join(', ')}`);
        }
    }

    /**
     * Inicializa los servicios de la aplicación
     */
    async initializeServices() {
        try {
            // Inicializar servicio de API
            if (window.ApiService) {
                await ApiService.initialize();
            }
            
            // Verificar conexión con el servidor
            await this.checkServerConnection();
            
            // Cargar configuración desde el servidor (si está disponible)
            await this.loadServerConfiguration();
            
        } catch (error) {
            console.warn('Algunos servicios no pudieron inicializarse:', error);
            // Continuar con configuración local
        }
    }

    /**
     * Verifica la conexión con el servidor
     */
    async checkServerConnection() {
        try {
            const response = await fetch('/api/health', {
                method: 'GET',
                timeout: 5000
            });
            
            if (response.ok) {
                console.log('Conexión con el servidor establecida');
                return true;
            } else {
                throw new Error(`Error del servidor: ${response.status}`);
            }
        } catch (error) {
            console.warn('No se pudo conectar con el servidor:', error);
            Utils.showNotification('Trabajando en modo offline', 'warning');
            return false;
        }
    }

    /**
     * Carga configuración desde el servidor
     */
    async loadServerConfiguration() {
        try {
            const response = await fetch('/api/config');
            if (response.ok) {
                const serverConfig = await response.json();
                // Fusionar configuración del servidor con la local
                Object.assign(APP_CONFIG, serverConfig);
                console.log('Configuración del servidor cargada');
            }
        } catch (error) {
            console.warn('No se pudo cargar configuración del servidor:', error);
        }
    }

    /**
     * Configura manejadores de eventos globales
     */
    setupGlobalEventHandlers() {
        // Manejar errores de red
        window.addEventListener('online', () => {
            Utils.showNotification('Conexión restaurada', 'success');
        });
        
        window.addEventListener('offline', () => {
            Utils.showNotification('Sin conexión a internet', 'warning');
        });
        
        // Manejar cierre de ventana/pestaña
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = MESSAGES.confirm.unsavedChanges;
                return MESSAGES.confirm.unsavedChanges;
            }
        });
        
        // Manejar teclas de acceso rápido
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Manejar clics en enlaces externos
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="http"]');
            if (link && !link.target) {
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
        });
        
        // Auto-guardar sesión
        setInterval(() => {
            this.updateSessionTimestamp();
        }, 60000); // Cada minuto
    }

    /**
     * Configura manejadores de errores
     */
    setupErrorHandlers() {
        // Errores JavaScript no capturados
        window.addEventListener('error', (e) => {
            console.error('Error no capturado:', e.error);
            this.logError('JavaScript Error', e.error);
        });
        
        // Promesas rechazadas no manejadas
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promesa rechazada no manejada:', e.reason);
            this.logError('Unhandled Promise Rejection', e.reason);
        });
        
        // Errores de recursos
        window.addEventListener('error', (e) => {
            if (e.target !== window) {
                console.error('Error al cargar recurso:', e.target.src || e.target.href);
                this.logError('Resource Load Error', {
                    type: e.target.tagName,
                    source: e.target.src || e.target.href
                });
            }
        }, true);
    }

    /**
     * Maneja atajos de teclado
     * @param {KeyboardEvent} e - Evento de teclado
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K: Búsqueda rápida
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.openQuickSearch();
        }
        
        // Escape: Cerrar modales
        if (e.key === 'Escape') {
            Utils.hideModal();
        }
        
        // F1: Ayuda
        if (e.key === 'F1') {
            e.preventDefault();
            this.showHelp();
        }
    }

    /**
     * Abre búsqueda rápida
     */
    openQuickSearch() {
        const searchModal = `
            <div class="quick-search">
                <h3>Búsqueda Rápida</h3>
                <input type="text" id="quick-search-input" placeholder="Buscar productos, clientes, etc..." class="form-input">
                <div id="quick-search-results" class="search-results"></div>
            </div>
        `;
        
        Utils.showModal(searchModal);
        
        const searchInput = document.querySelector('#quick-search-input');
        if (searchInput) {
            searchInput.focus();
            
            // Implementar búsqueda con debounce
            const debouncedSearch = Utils.debounce(async (query) => {
                if (query.length >= 2) {
                    await this.performQuickSearch(query);
                }
            }, 300);
            
            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }
    }

    /**
     * Realiza búsqueda rápida
     * @param {string} query - Término de búsqueda
     */
    async performQuickSearch(query) {
        const resultsContainer = document.querySelector('#quick-search-results');
        if (!resultsContainer) return;
        
        try {
            resultsContainer.innerHTML = '<p>Buscando...</p>';
            
            // Aquí se implementaría la búsqueda real
            // Por ahora, mostrar mensaje placeholder
            setTimeout(() => {
                resultsContainer.innerHTML = `
                    <p>Resultados para: "${query}"</p>
                    <p><em>Función de búsqueda en desarrollo</em></p>
                `;
            }, 500);
            
        } catch (error) {
            console.error('Error en búsqueda rápida:', error);
            resultsContainer.innerHTML = '<p>Error al realizar la búsqueda</p>';
        }
    }

    /**
     * Muestra ayuda del sistema
     */
    showHelp() {
        const helpContent = `
            <div class="help-content">
                <h3>Ayuda del Sistema</h3>
                <h4>Atajos de Teclado:</h4>
                <ul>
                    <li><strong>Ctrl + K:</strong> Búsqueda rápida</li>
                    <li><strong>Escape:</strong> Cerrar modales</li>
                    <li><strong>F1:</strong> Mostrar esta ayuda</li>
                </ul>
                <h4>Navegación:</h4>
                <ul>
                    <li>Usa el menú superior para navegar entre módulos</li>
                    <li>El sistema guarda automáticamente tu sesión</li>
                    <li>Puedes trabajar offline con funcionalidad limitada</li>
                </ul>
                <h4>Soporte:</h4>
                <p>Para soporte técnico, contacta al administrador del sistema.</p>
            </div>
        `;
        
        Utils.showModal(helpContent);
    }

    /**
     * Verifica si hay cambios sin guardar
     * @returns {boolean} True si hay cambios sin guardar
     */
    hasUnsavedChanges() {
        // Implementar lógica para detectar cambios sin guardar
        // Por ahora, retornar false
        return false;
    }

    /**
     * Actualiza timestamp de la sesión
     */
    updateSessionTimestamp() {
        if (router && router.isAuthenticated) {
            const sessionData = Utils.getFromStorage(APP_CONFIG.session.storageKey);
            if (sessionData) {
                sessionData.timestamp = new Date().toISOString();
                Utils.saveToStorage(APP_CONFIG.session.storageKey, sessionData);
            }
        }
    }

    /**
     * Registra errores para análisis
     * @param {string} type - Tipo de error
     * @param {any} error - Información del error
     */
    logError(type, error) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            type: type,
            error: error.toString(),
            stack: error.stack || 'No stack trace available',
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: router?.currentUser?.id || 'anonymous'
        };
        
        // Guardar en localStorage para análisis posterior
        const errors = Utils.getFromStorage('error_logs') || [];
        errors.push(errorLog);
        
        // Mantener solo los últimos 50 errores
        if (errors.length > 50) {
            errors.splice(0, errors.length - 50);
        }
        
        Utils.saveToStorage('error_logs', errors);
        
        // En producción, enviar al servidor
        if (window.ApiService) {
            ApiService.logError(errorLog).catch(console.error);
        }
    }

    /**
     * Muestra error de inicialización
     * @param {Error} error - Error ocurrido
     */
    showInitializationError(error) {
        const mainContent = document.querySelector('#main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Error de Inicialización</h2>
                    </div>
                    <p>No se pudo inicializar la aplicación correctamente.</p>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    /**
     * Obtiene el estado actual de la aplicación
     * @returns {string} Estado actual
     */
    getAppState() {
        return this.appState;
    }

    /**
     * Verifica si la aplicación está inicializada
     * @returns {boolean} True si está inicializada
     */
    isReady() {
        return this.isInitialized && this.appState === APP_STATES.READY;
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.minimarketApp = new MinimarketApp();
});

// Hacer la aplicación disponible globalmente
window.MinimarketApp = MinimarketApp;