/**
 * Servicio de API del Sistema de Minimarket
 * Maneja todas las comunicaciones con el servidor backend
 */

class ApiService {
    constructor() {
        this.baseUrl = APP_CONFIG.apiUrl;
        this.isOnline = navigator.onLine;
        this.requestQueue = [];
        this.isInitialized = false;
        
        // Configuración por defecto para requests
        this.defaultConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000 // 30 segundos
        };
    }

    /**
     * Inicializa el servicio de API
     */
    async initialize() {
        try {
            // Configurar interceptores
            this.setupInterceptors();
            
            // Configurar manejo de conexión
            this.setupConnectionHandling();
            
            // Procesar cola de requests offline
            this.processOfflineQueue();
            
            this.isInitialized = true;
            console.log('Servicio de API inicializado');
            
        } catch (error) {
            console.error('Error al inicializar servicio de API:', error);
            throw error;
        }
    }

    /**
     * Configura interceptores de request y response
     */
    setupInterceptors() {
        // Interceptor para agregar token de autenticación
        this.requestInterceptor = (config) => {
            const sessionData = Utils.getFromStorage(APP_CONFIG.session.storageKey);
            if (sessionData && sessionData.token) {
                config.headers.Authorization = `Bearer ${sessionData.token}`;
            }
            return config;
        };
        
        // Interceptor para manejar errores de response
        this.responseInterceptor = (response) => {
            // Manejar respuestas exitosas
            if (response.ok) {
                return response;
            }
            
            // Manejar errores específicos
            switch (response.status) {
                case 401:
                    this.handleUnauthorized();
                    break;
                case 403:
                    Utils.showNotification(MESSAGES.error.unauthorized, 'error');
                    break;
                case 404:
                    Utils.showNotification(MESSAGES.error.notFound, 'error');
                    break;
                case 500:
                    Utils.showNotification('Error interno del servidor', 'error');
                    break;
                default:
                    Utils.showNotification(MESSAGES.error.network, 'error');
            }
            
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        };
    }

    /**
     * Configura manejo de conexión online/offline
     */
    setupConnectionHandling() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processOfflineQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    /**
     * Realiza una petición HTTP
     * @param {string} endpoint - Endpoint de la API
     * @param {object} options - Opciones de la petición
     * @returns {Promise} Respuesta de la API
     */
    async request(endpoint, options = {}) {
        try {
            // Preparar configuración
            const config = {
                ...this.defaultConfig,
                ...options,
                headers: {
                    ...this.defaultConfig.headers,
                    ...options.headers
                }
            };
            
            // Aplicar interceptor de request
            const finalConfig = this.requestInterceptor(config);
            
            // Construir URL completa
            const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
            
            // Si estamos offline, agregar a la cola
            if (!this.isOnline && options.method !== 'GET') {
                return this.queueRequest(url, finalConfig);
            }
            
            // Realizar petición
            const response = await this.fetchWithTimeout(url, finalConfig);
            
            // Aplicar interceptor de response
            const finalResponse = this.responseInterceptor(response);
            
            // Parsear respuesta JSON
            const data = await finalResponse.json();
            
            return {
                success: true,
                data: data,
                status: response.status,
                headers: response.headers
            };
            
        } catch (error) {
            console.error('Error en petición API:', error);
            
            return {
                success: false,
                error: error.message,
                status: error.status || 0
            };
        }
    }

    /**
     * Fetch con timeout
     * @param {string} url - URL de la petición
     * @param {object} config - Configuración de la petición
     * @returns {Promise} Respuesta
     */
    async fetchWithTimeout(url, config) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);
        
        try {
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return response;
            
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Timeout: La petición tardó demasiado');
            }
            throw error;
        }
    }

    /**
     * Agrega una petición a la cola offline
     * @param {string} url - URL de la petición
     * @param {object} config - Configuración de la petición
     * @returns {Promise} Promesa que se resuelve cuando se procese la cola
     */
    queueRequest(url, config) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({
                url,
                config,
                resolve,
                reject,
                timestamp: Date.now()
            });
            
            Utils.showNotification('Petición agregada a la cola offline', 'info');
        });
    }

    /**
     * Procesa la cola de peticiones offline
     */
    async processOfflineQueue() {
        if (!this.isOnline || this.requestQueue.length === 0) {
            return;
        }
        
        Utils.showNotification(`Procesando ${this.requestQueue.length} peticiones pendientes`, 'info');
        
        const queue = [...this.requestQueue];
        this.requestQueue = [];
        
        for (const item of queue) {
            try {
                const response = await this.fetchWithTimeout(item.url, item.config);
                const data = await response.json();
                
                item.resolve({
                    success: true,
                    data: data,
                    status: response.status
                });
                
            } catch (error) {
                item.reject(error);
            }
        }
    }

    /**
     * Maneja errores de autorización
     */
    handleUnauthorized() {
        Utils.showNotification('Sesión expirada. Redirigiendo al login...', 'warning');
        
        // Limpiar datos de sesión
        Utils.removeFromStorage(APP_CONFIG.session.storageKey);
        Utils.removeFromStorage(APP_CONFIG.session.userKey);
        
        // Redirigir al login
        if (window.router) {
            router.logout();
        }
    }

    // ===== MÉTODOS HTTP =====

    /**
     * Petición GET
     * @param {string} endpoint - Endpoint
     * @param {object} params - Parámetros de consulta
     * @returns {Promise} Respuesta
     */
    async get(endpoint, params = {}) {
        const url = new URL(endpoint, this.baseUrl);
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });
        
        return this.request(url.toString(), {
            method: 'GET'
        });
    }

    /**
     * Petición POST
     * @param {string} endpoint - Endpoint
     * @param {object} data - Datos a enviar
     * @returns {Promise} Respuesta
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Petición PUT
     * @param {string} endpoint - Endpoint
     * @param {object} data - Datos a enviar
     * @returns {Promise} Respuesta
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * Petición PATCH
     * @param {string} endpoint - Endpoint
     * @param {object} data - Datos a enviar
     * @returns {Promise} Respuesta
     */
    async patch(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    /**
     * Petición DELETE
     * @param {string} endpoint - Endpoint
     * @returns {Promise} Respuesta
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    // ===== MÉTODOS ESPECÍFICOS DEL NEGOCIO =====

    /**
     * Autenticación de usuario
     * @param {object} credentials - Credenciales de login
     * @returns {Promise} Respuesta de autenticación
     */
    async login(credentials) {
        return this.post('/auth/login', credentials);
    }

    /**
     * Cierre de sesión
     * @returns {Promise} Respuesta
     */
    async logout() {
        return this.post('/auth/logout');
    }

    /**
     * Obtiene información del usuario actual
     * @returns {Promise} Datos del usuario
     */
    async getCurrentUser() {
        return this.get('/auth/me');
    }

    /**
     * Obtiene lista de productos
     * @param {object} filters - Filtros de búsqueda
     * @returns {Promise} Lista de productos
     */
    async getProducts(filters = {}) {
        return this.get('/products', filters);
    }

    /**
     * Crea un nuevo producto
     * @param {object} productData - Datos del producto
     * @returns {Promise} Producto creado
     */
    async createProduct(productData) {
        return this.post('/products', productData);
    }

    /**
     * Actualiza un producto
     * @param {number} id - ID del producto
     * @param {object} productData - Datos actualizados
     * @returns {Promise} Producto actualizado
     */
    async updateProduct(id, productData) {
        return this.put(`/products/${id}`, productData);
    }

    /**
     * Elimina un producto
     * @param {number} id - ID del producto
     * @returns {Promise} Respuesta
     */
    async deleteProduct(id) {
        return this.delete(`/products/${id}`);
    }

    /**
     * Obtiene lista de ventas
     * @param {object} filters - Filtros de búsqueda
     * @returns {Promise} Lista de ventas
     */
    async getSales(filters = {}) {
        return this.get('/sales', filters);
    }

    /**
     * Crea una nueva venta
     * @param {object} saleData - Datos de la venta
     * @returns {Promise} Venta creada
     */
    async createSale(saleData) {
        return this.post('/sales', saleData);
    }

    /**
     * Obtiene reportes de ventas
     * @param {object} params - Parámetros del reporte
     * @returns {Promise} Datos del reporte
     */
    async getSalesReport(params = {}) {
        return this.get('/reports/sales', params);
    }

    /**
     * Registra un error en el servidor
     * @param {object} errorData - Datos del error
     * @returns {Promise} Respuesta
     */
    async logError(errorData) {
        return this.post('/logs/error', errorData);
    }

    /**
     * Sube un archivo
     * @param {File} file - Archivo a subir
     * @param {string} endpoint - Endpoint de subida
     * @returns {Promise} Respuesta
     */
    async uploadFile(file, endpoint = '/upload') {
        const formData = new FormData();
        formData.append('file', file);
        
        return this.request(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
                // No establecer Content-Type para FormData
            }
        });
    }

    /**
     * Descarga un archivo
     * @param {string} endpoint - Endpoint de descarga
     * @param {string} filename - Nombre del archivo
     * @returns {Promise} Respuesta
     */
    async downloadFile(endpoint, filename) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'GET',
                headers: this.defaultConfig.headers
            });
            
            if (!response.ok) {
                throw new Error(`Error al descargar: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(url);
            
            return { success: true };
            
        } catch (error) {
            console.error('Error al descargar archivo:', error);
            return { success: false, error: error.message };
        }
    }
}

// Crear instancia global del servicio
const apiServiceInstance = new ApiService();

// Hacer el servicio disponible globalmente
window.ApiService = apiServiceInstance;