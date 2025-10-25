/**
 * Configuración Global de la Aplicación
 * Sistema de Minimarket - LP2
 */

class AppConfig {
    constructor() {
        this.init();
    }

    init() {
        // Configuración de la aplicación
        this.app = {
            name: 'Sistema Minimarket LP2',
            version: '1.0.0',
            description: 'Sistema de gestión para minimarket',
            author: 'Equipo LP2',
            environment: this.getEnvironment(),
            debug: this.isDebugMode(),
            baseUrl: this.getBaseUrl(),
            apiUrl: this.getApiUrl(),
            assetsUrl: this.getAssetsUrl()
        };

        // Configuración de la base de datos
        this.database = {
            host: 'localhost',
            port: 3306,
            name: 'minimarket_db',
            charset: 'utf8mb4',
            timezone: 'America/Lima'
        };

        // Configuración de autenticación
        this.auth = {
            sessionTimeout: 30 * 60 * 1000, // 30 minutos
            maxLoginAttempts: 5,
            lockoutDuration: 15 * 60 * 1000, // 15 minutos
            passwordMinLength: 8,
            passwordRequireSpecialChars: true,
            rememberMeDuration: 7 * 24 * 60 * 60 * 1000, // 7 días
            tokenExpiry: 24 * 60 * 60 * 1000 // 24 horas
        };

        // Configuración de la empresa
        this.company = {
            name: 'Minimarket LP2',
            ruc: '20123456789',
            address: 'Av. Principal 123, Lima, Perú',
            phone: '+51 999 888 777',
            email: 'info@minimarket.com',
            website: 'www.minimarket.com',
            logo: '/assets/images/logo.png',
            currency: 'PEN',
            timezone: 'America/Lima',
            locale: 'es-PE'
        };

        // Configuración del POS
        this.pos = {
            invoicePrefix: 'F001-',
            receiptPrefix: 'B001-',
            quotePrefix: 'C001-',
            autoIncrementNumbers: true,
            printAfterSale: true,
            openCashDrawer: true,
            defaultPaymentMethod: 'cash',
            allowPartialPayments: true,
            requireCustomerForInvoice: true,
            maxItemsPerSale: 100,
            printerSettings: {
                paperSize: '80mm',
                copies: 1,
                cutPaper: true,
                openDrawer: true
            }
        };

        // Configuración de inventario
        this.inventory = {
            lowStockThreshold: 10,
            criticalStockThreshold: 5,
            autoReorderEnabled: false,
            trackExpirationDates: true,
            allowNegativeStock: false,
            barcodeFormat: 'CODE128',
            defaultCategory: 'general',
            defaultUnit: 'unidad',
            priceRounding: 2,
            costCalculationMethod: 'average' // average, fifo, lifo
        };

        // Configuración de notificaciones
        this.notifications = {
            enabled: true,
            position: 'top-right',
            duration: 5000,
            maxVisible: 5,
            sound: true,
            desktop: false,
            email: {
                enabled: false,
                smtp: {
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    user: '',
                    password: ''
                }
            },
            types: {
                lowStock: true,
                expiredProducts: true,
                dailySales: false,
                systemErrors: true,
                backups: true
            }
        };

        // Configuración de seguridad
        this.security = {
            enableHttps: false,
            corsEnabled: true,
            allowedOrigins: ['http://localhost', 'http://127.0.0.1'],
            rateLimiting: {
                enabled: true,
                maxRequests: 100,
                windowMs: 15 * 60 * 1000 // 15 minutos
            },
            encryption: {
                algorithm: 'AES-256-CBC',
                keyLength: 32
            },
            backup: {
                autoBackup: true,
                frequency: 'daily', // daily, weekly, monthly
                retention: 30, // días
                location: '/backups/',
                includeImages: true
            }
        };

        // Configuración del sistema
        this.system = {
            maintenance: false,
            maintenanceMessage: 'Sistema en mantenimiento. Vuelva más tarde.',
            maxFileSize: 10 * 1024 * 1024, // 10MB
            allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'xlsx', 'csv'],
            pagination: {
                defaultPageSize: 20,
                maxPageSize: 100,
                showSizeSelector: true
            },
            cache: {
                enabled: true,
                duration: 60 * 60 * 1000, // 1 hora
                maxSize: 100 * 1024 * 1024 // 100MB
            },
            logging: {
                enabled: true,
                level: 'info', // debug, info, warn, error
                maxFileSize: 10 * 1024 * 1024, // 10MB
                maxFiles: 5
            }
        };

        // Configuración de la interfaz
        this.ui = {
            theme: 'light', // light, dark, auto
            language: 'es',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '24h',
            numberFormat: {
                decimal: '.',
                thousands: ',',
                precision: 2
            },
            sidebar: {
                collapsed: false,
                collapsible: true
            },
            animations: {
                enabled: true,
                duration: 300
            },
            shortcuts: {
                enabled: true,
                newSale: 'F1',
                search: 'F3',
                save: 'Ctrl+S',
                print: 'Ctrl+P'
            }
        };

        // Configuración de módulos
        this.modules = {
            dashboard: { enabled: true, order: 1 },
            sales: { enabled: true, order: 2 },
            inventory: { enabled: true, order: 3 },
            purchases: { enabled: true, order: 4 },
            quotes: { enabled: true, order: 5 },
            cash: { enabled: true, order: 6 },
            users: { enabled: true, order: 7 },
            settings: { enabled: true, order: 8 }
        };

        // Configuración de reportes
        this.reports = {
            defaultFormat: 'pdf',
            autoGenerate: {
                daily: false,
                weekly: false,
                monthly: true
            },
            emailReports: false,
            charts: {
                defaultType: 'bar',
                colors: ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6'],
                animations: true
            }
        };

        // URLs de la API
        this.apiEndpoints = {
            auth: '/api/auth',
            users: '/api/users',
            products: '/api/products',
            categories: '/api/categories',
            sales: '/api/sales',
            purchases: '/api/purchases',
            quotes: '/api/quotes',
            cash: '/api/cash',
            reports: '/api/reports',
            settings: '/api/settings',
            backup: '/api/backup'
        };

        // Configuración de desarrollo
        this.development = {
            mockData: true,
            showDebugInfo: this.isDebugMode(),
            logApiCalls: this.isDebugMode(),
            skipAuth: false,
            autoLogin: false
        };
    }

    // Métodos de utilidad
    getEnvironment() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'development';
        }
        return 'production';
    }

    isDebugMode() {
        return this.getEnvironment() === 'development' || 
               localStorage.getItem('debug') === 'true' ||
               window.location.search.includes('debug=true');
    }

    getBaseUrl() {
        const protocol = window.location.protocol;
        const host = window.location.host;
        const path = window.location.pathname.split('/').slice(0, -1).join('/');
        return `${protocol}//${host}${path}`;
    }

    getApiUrl() {
        return this.getBaseUrl() + '/api';
    }

    getAssetsUrl() {
        return this.getBaseUrl() + '/assets';
    }

    // Métodos para obtener configuraciones
    get(key, defaultValue = null) {
        const keys = key.split('.');
        let value = this;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }
        
        return value;
    }

    set(key, value) {
        const keys = key.split('.');
        const lastKey = keys.pop();
        let target = this;
        
        for (const k of keys) {
            if (!(k in target)) {
                target[k] = {};
            }
            target = target[k];
        }
        
        target[lastKey] = value;
        this.save();
    }

    // Guardar configuración en localStorage
    save() {
        try {
            const config = {
                ui: this.ui,
                pos: this.pos,
                inventory: this.inventory,
                notifications: this.notifications,
                company: this.company
            };
            localStorage.setItem('app_config', JSON.stringify(config));
        } catch (error) {
            console.error('Error saving configuration:', error);
        }
    }

    // Cargar configuración desde localStorage
    load() {
        try {
            const saved = localStorage.getItem('app_config');
            if (saved) {
                const config = JSON.parse(saved);
                Object.assign(this.ui, config.ui || {});
                Object.assign(this.pos, config.pos || {});
                Object.assign(this.inventory, config.inventory || {});
                Object.assign(this.notifications, config.notifications || {});
                Object.assign(this.company, config.company || {});
            }
        } catch (error) {
            console.error('Error loading configuration:', error);
        }
    }

    // Resetear configuración
    reset() {
        localStorage.removeItem('app_config');
        this.init();
    }

    // Exportar configuración
    export() {
        return {
            app: this.app,
            company: this.company,
            pos: this.pos,
            inventory: this.inventory,
            notifications: this.notifications,
            security: this.security,
            system: this.system,
            ui: this.ui,
            modules: this.modules,
            reports: this.reports
        };
    }

    // Importar configuración
    import(config) {
        try {
            Object.assign(this, config);
            this.save();
            return true;
        } catch (error) {
            console.error('Error importing configuration:', error);
            return false;
        }
    }

    // Validar configuración
    validate() {
        const errors = [];

        // Validar configuración de empresa
        if (!this.company.name) errors.push('Nombre de empresa requerido');
        if (!this.company.ruc || this.company.ruc.length !== 11) errors.push('RUC inválido');

        // Validar configuración de POS
        if (!this.pos.invoicePrefix) errors.push('Prefijo de factura requerido');
        if (!this.pos.receiptPrefix) errors.push('Prefijo de boleta requerido');

        // Validar configuración de inventario
        if (this.inventory.lowStockThreshold < 0) errors.push('Umbral de stock bajo inválido');
        if (this.inventory.criticalStockThreshold < 0) errors.push('Umbral de stock crítico inválido');

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    // Obtener información del sistema
    getSystemInfo() {
        return {
            appName: this.app.name,
            version: this.app.version,
            environment: this.app.environment,
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            localStorage: this.isLocalStorageAvailable(),
            sessionStorage: this.isSessionStorageAvailable()
        };
    }

    isLocalStorageAvailable() {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    isSessionStorageAvailable() {
        try {
            const test = '__test__';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
}

// Crear instancia global
const AppConfiguration = new AppConfig();

// Cargar configuración guardada
AppConfiguration.load();

// Hacer disponible globalmente
window.AppConfig = AppConfiguration;

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfiguration;
}

// Configuración de desarrollo - datos de prueba
if (AppConfiguration.development.mockData) {
    console.log('🔧 Modo desarrollo activado');
    console.log('📊 Datos de prueba habilitados');
    
    if (AppConfiguration.development.showDebugInfo) {
        console.log('⚙️ Configuración de la aplicación:', AppConfiguration.export());
        console.log('💻 Información del sistema:', AppConfiguration.getSystemInfo());
    }
}