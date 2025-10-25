/**
 * ===== SERVICIO DE AUTENTICACIÓN AVANZADO =====
 * Maneja todas las operaciones relacionadas con autenticación,
 * autorización, sesiones y seguridad del sistema
 */

class AdvancedAuthService {
    constructor() {
        this.apiUrl = window.Config?.API_BASE_URL || 'http://localhost:3000/api';
        this.tokenKey = 'minimarket_auth_token';
        this.refreshTokenKey = 'minimarket_refresh_token';
        this.userKey = 'minimarket_current_user';
        this.sessionKey = 'minimarket_session';
        
        // Configuración de seguridad
        this.security = {
            maxLoginAttempts: 3,
            lockoutDuration: 15 * 60 * 1000, // 15 minutos
            tokenExpiration: 24 * 60 * 60 * 1000, // 24 horas
            refreshTokenExpiration: 7 * 24 * 60 * 60 * 1000, // 7 días
            sessionTimeout: 30 * 60 * 1000, // 30 minutos de inactividad
            passwordMinLength: 6,
            passwordRequireSpecialChar: false
        };
        
        // Estado interno
        this.currentUser = null;
        this.token = null;
        this.refreshToken = null;
        this.sessionTimer = null;
        this.isRefreshing = false;
        
        // Callbacks
        this.onSessionExpired = null;
        this.onUserUpdated = null;
        this.onPermissionChanged = null;
        
        this.init();
    }

    /**
     * Inicializa el servicio
     */
    init() {
        this.loadStoredSession();
        this.setupSessionMonitoring();
        this.setupTokenRefresh();
        this.bindEvents();
    }

    /**
     * Carga la sesión almacenada
     */
    loadStoredSession() {
        try {
            const storedUser = localStorage.getItem(this.userKey);
            const storedToken = localStorage.getItem(this.tokenKey);
            const storedRefreshToken = localStorage.getItem(this.refreshTokenKey);
            const sessionData = localStorage.getItem(this.sessionKey);
            
            if (storedUser && storedToken) {
                this.currentUser = JSON.parse(storedUser);
                this.token = storedToken;
                this.refreshToken = storedRefreshToken;
                
                // Verificar si la sesión no ha expirado
                if (sessionData) {
                    const session = JSON.parse(sessionData);
                    const now = Date.now();
                    
                    if (now > session.expiresAt) {
                        this.clearSession();
                        return;
                    }
                    
                    // Actualizar última actividad
                    this.updateSessionActivity();
                }
            }
        } catch (error) {
            console.error('Error cargando sesión:', error);
            this.clearSession();
        }
    }

    /**
     * Configura el monitoreo de sesión
     */
    setupSessionMonitoring() {
        // Detectar actividad del usuario
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        const updateActivity = window.Utils.debounce(() => {
            if (this.isAuthenticated()) {
                this.updateSessionActivity();
            }
        }, 1000);
        
        activityEvents.forEach(event => {
            document.addEventListener(event, updateActivity, true);
        });
        
        // Verificar sesión periódicamente
        setInterval(() => {
            this.checkSessionValidity();
        }, 60000); // Cada minuto
    }

    /**
     * Configura la renovación automática de tokens
     */
    setupTokenRefresh() {
        // Renovar token 5 minutos antes de que expire
        setInterval(() => {
            if (this.isAuthenticated() && !this.isRefreshing) {
                this.refreshTokenIfNeeded();
            }
        }, 5 * 60 * 1000); // Cada 5 minutos
    }

    /**
     * Vincula eventos del navegador
     */
    bindEvents() {
        // Detectar cuando la ventana pierde/gana foco
        window.addEventListener('focus', () => {
            if (this.isAuthenticated()) {
                this.checkSessionValidity();
            }
        });
        
        // Detectar cierre de ventana
        window.addEventListener('beforeunload', () => {
            this.updateSessionActivity();
        });
        
        // Detectar cambios en localStorage desde otras pestañas
        window.addEventListener('storage', (e) => {
            if (e.key === this.userKey || e.key === this.tokenKey) {
                this.handleStorageChange(e);
            }
        });
    }

    /**
     * Maneja cambios en localStorage desde otras pestañas
     */
    handleStorageChange(event) {
        if (event.newValue === null) {
            // Sesión cerrada en otra pestaña
            this.clearSession();
            if (this.onSessionExpired) {
                this.onSessionExpired('session_closed_elsewhere');
            }
        } else if (event.oldValue !== event.newValue) {
            // Sesión actualizada en otra pestaña
            this.loadStoredSession();
            if (this.onUserUpdated) {
                this.onUserUpdated(this.currentUser);
            }
        }
    }

    /**
     * Realiza el login del usuario
     */
    async login(credentials) {
        try {
            // Verificar bloqueo por intentos fallidos
            if (this.isAccountLocked(credentials.username)) {
                const lockInfo = this.getLockInfo(credentials.username);
                const remainingTime = Math.ceil((lockInfo.expiresAt - Date.now()) / 1000 / 60);
                
                return {
                    success: false,
                    error: 'ACCOUNT_LOCKED',
                    message: `Cuenta bloqueada. Intente nuevamente en ${remainingTime} minutos.`,
                    remainingTime
                };
            }
            
            // Validar credenciales
            const validation = this.validateCredentials(credentials);
            if (!validation.valid) {
                return {
                    success: false,
                    error: 'INVALID_CREDENTIALS',
                    message: validation.message
                };
            }
            
            // Realizar petición de login
            const response = await this.makeLoginRequest(credentials);
            
            if (response.success) {
                // Login exitoso
                this.clearLoginAttempts(credentials.username);
                await this.establishSession(response.user, response.token, response.refreshToken);
                
                // Registrar actividad
                this.logSecurityEvent('login_success', {
                    username: credentials.username,
                    timestamp: new Date().toISOString()
                });
                
                return {
                    success: true,
                    user: this.currentUser,
                    token: this.token
                };
            } else {
                // Login fallido
                this.recordFailedAttempt(credentials.username);
                
                this.logSecurityEvent('login_failed', {
                    username: credentials.username,
                    reason: response.error,
                    timestamp: new Date().toISOString()
                });
                
                return {
                    success: false,
                    error: response.error || 'INVALID_CREDENTIALS',
                    message: response.message || 'Usuario o contraseña incorrectos'
                };
            }
            
        } catch (error) {
            console.error('Error en login:', error);
            
            this.logSecurityEvent('login_error', {
                username: credentials.username,
                error: error.message,
                timestamp: new Date().toISOString()
            });
            
            return {
                success: false,
                error: 'NETWORK_ERROR',
                message: 'Error de conexión. Verifique su conexión a internet.'
            };
        }
    }

    /**
     * Realiza la petición de login (simulada o real)
     */
    async makeLoginRequest(credentials) {
        // En desarrollo, usar usuarios demo
        if (window.Config?.ENVIRONMENT === 'development') {
            return this.simulateLogin(credentials);
        }
        
        // En producción, hacer petición real al servidor
        const response = await fetch(`${this.apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: credentials.username,
                password: credentials.password,
                rememberMe: credentials.rememberMe
            })
        });
        
        return await response.json();
    }

    /**
     * Simula login para desarrollo
     */
    async simulateLogin(credentials) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const demoUsers = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                email: 'admin@minimarket.com',
                role: 'admin',
                name: 'Administrador del Sistema',
                avatar: null,
                permissions: ['all'],
                settings: {
                    theme: 'light',
                    language: 'es',
                    notifications: true
                }
            },
            {
                id: 2,
                username: 'vendedor',
                password: 'vendedor123',
                email: 'vendedor@minimarket.com',
                role: 'seller',
                name: 'Juan Pérez',
                avatar: null,
                permissions: ['sales', 'inventory_read', 'customers', 'quotes'],
                settings: {
                    theme: 'light',
                    language: 'es',
                    notifications: true
                }
            },
            {
                id: 3,
                username: 'cajero',
                password: 'cajero123',
                email: 'cajero@minimarket.com',
                role: 'cashier',
                name: 'María García',
                avatar: null,
                permissions: ['cash', 'sales'],
                settings: {
                    theme: 'light',
                    language: 'es',
                    notifications: false
                }
            },
            {
                id: 4,
                username: 'almacen',
                password: 'almacen123',
                email: 'almacen@minimarket.com',
                role: 'warehouse',
                name: 'Carlos López',
                avatar: null,
                permissions: ['inventory', 'purchases', 'suppliers'],
                settings: {
                    theme: 'dark',
                    language: 'es',
                    notifications: true
                }
            }
        ];
        
        const user = demoUsers.find(u => 
            u.username === credentials.username && 
            u.password === credentials.password
        );
        
        if (user) {
            const userCopy = { ...user };
            delete userCopy.password; // No devolver contraseña
            
            return {
                success: true,
                user: userCopy,
                token: this.generateToken(),
                refreshToken: this.generateToken()
            };
        }
        
        return {
            success: false,
            error: 'INVALID_CREDENTIALS',
            message: 'Usuario o contraseña incorrectos'
        };
    }

    /**
     * Establece la sesión del usuario
     */
    async establishSession(user, token, refreshToken) {
        this.currentUser = user;
        this.token = token;
        this.refreshToken = refreshToken;
        
        // Crear datos de sesión
        const sessionData = {
            userId: user.id,
            startedAt: Date.now(),
            lastActivity: Date.now(),
            expiresAt: Date.now() + this.security.sessionTimeout,
            ipAddress: await this.getClientIP(),
            userAgent: navigator.userAgent
        };
        
        // Guardar en localStorage
        localStorage.setItem(this.userKey, JSON.stringify(user));
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
        localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
        
        // Iniciar monitoreo de sesión
        this.startSessionTimer();
        
        // Notificar cambio de usuario
        if (this.onUserUpdated) {
            this.onUserUpdated(user);
        }
    }

    /**
     * Cierra la sesión del usuario
     */
    async logout(reason = 'user_logout') {
        try {
            // Registrar logout
            this.logSecurityEvent('logout', {
                userId: this.currentUser?.id,
                username: this.currentUser?.username,
                reason,
                timestamp: new Date().toISOString()
            });
            
            // Notificar al servidor (si es necesario)
            if (this.token && window.Config?.ENVIRONMENT !== 'development') {
                try {
                    await fetch(`${this.apiUrl}/auth/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                } catch (error) {
                    console.warn('Error notificando logout al servidor:', error);
                }
            }
            
            // Limpiar sesión
            this.clearSession();
            
            return { success: true };
            
        } catch (error) {
            console.error('Error en logout:', error);
            this.clearSession(); // Limpiar de todas formas
            return { success: false, error: error.message };
        }
    }

    /**
     * Limpia la sesión actual
     */
    clearSession() {
        // Limpiar estado interno
        this.currentUser = null;
        this.token = null;
        this.refreshToken = null;
        
        // Limpiar localStorage
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.sessionKey);
        
        // Detener timers
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    /**
     * Verifica si el usuario está autenticado
     */
    isAuthenticated() {
        return !!(this.currentUser && this.token);
    }

    /**
     * Obtiene el usuario actual
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Verifica si el usuario tiene un permiso específico
     */
    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        const permissions = this.currentUser.permissions || [];
        return permissions.includes('all') || permissions.includes(permission);
    }

    /**
     * Verifica si el usuario tiene un rol específico
     */
    hasRole(role) {
        return this.currentUser?.role === role;
    }

    /**
     * Actualiza la actividad de la sesión
     */
    updateSessionActivity() {
        if (!this.isAuthenticated()) return;
        
        try {
            const sessionData = JSON.parse(localStorage.getItem(this.sessionKey) || '{}');
            sessionData.lastActivity = Date.now();
            sessionData.expiresAt = Date.now() + this.security.sessionTimeout;
            
            localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
            
            // Reiniciar timer de sesión
            this.startSessionTimer();
            
        } catch (error) {
            console.error('Error actualizando actividad de sesión:', error);
        }
    }

    /**
     * Inicia el timer de expiración de sesión
     */
    startSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
        
        this.sessionTimer = setTimeout(() => {
            this.handleSessionExpired('inactivity');
        }, this.security.sessionTimeout);
    }

    /**
     * Verifica la validez de la sesión
     */
    checkSessionValidity() {
        if (!this.isAuthenticated()) return;
        
        try {
            const sessionData = JSON.parse(localStorage.getItem(this.sessionKey) || '{}');
            const now = Date.now();
            
            if (now > sessionData.expiresAt) {
                this.handleSessionExpired('timeout');
            }
        } catch (error) {
            console.error('Error verificando validez de sesión:', error);
            this.handleSessionExpired('error');
        }
    }

    /**
     * Maneja la expiración de sesión
     */
    handleSessionExpired(reason) {
        this.clearSession();
        
        if (this.onSessionExpired) {
            this.onSessionExpired(reason);
        } else {
            // Comportamiento por defecto
            window.Utils.showNotification('Su sesión ha expirado. Por favor, inicie sesión nuevamente.', 'warning');
            setTimeout(() => {
                window.Router.navigate('/auth');
            }, 2000);
        }
    }

    /**
     * Renueva el token si es necesario
     */
    async refreshTokenIfNeeded() {
        if (!this.refreshToken || this.isRefreshing) return;
        
        try {
            this.isRefreshing = true;
            
            const response = await fetch(`${this.apiUrl}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken: this.refreshToken
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.token = data.token;
                localStorage.setItem(this.tokenKey, this.token);
                
                this.logSecurityEvent('token_refreshed', {
                    userId: this.currentUser?.id,
                    timestamp: new Date().toISOString()
                });
            } else {
                // Refresh token inválido
                this.handleSessionExpired('invalid_refresh_token');
            }
            
        } catch (error) {
            console.error('Error renovando token:', error);
        } finally {
            this.isRefreshing = false;
        }
    }

    /**
     * Valida las credenciales antes del login
     */
    validateCredentials(credentials) {
        if (!credentials.username || !credentials.password) {
            return {
                valid: false,
                message: 'Usuario y contraseña son requeridos'
            };
        }
        
        if (credentials.username.length < 3) {
            return {
                valid: false,
                message: 'El usuario debe tener al menos 3 caracteres'
            };
        }
        
        if (credentials.password.length < this.security.passwordMinLength) {
            return {
                valid: false,
                message: `La contraseña debe tener al menos ${this.security.passwordMinLength} caracteres`
            };
        }
        
        return { valid: true };
    }

    /**
     * Verifica si una cuenta está bloqueada
     */
    isAccountLocked(username) {
        const lockInfo = this.getLockInfo(username);
        return lockInfo && Date.now() < lockInfo.expiresAt;
    }

    /**
     * Obtiene información de bloqueo de cuenta
     */
    getLockInfo(username) {
        try {
            const locks = JSON.parse(localStorage.getItem('account_locks') || '{}');
            return locks[username];
        } catch {
            return null;
        }
    }

    /**
     * Registra un intento fallido de login
     */
    recordFailedAttempt(username) {
        try {
            const attempts = JSON.parse(localStorage.getItem('login_attempts') || '{}');
            
            if (!attempts[username]) {
                attempts[username] = { count: 0, firstAttempt: Date.now() };
            }
            
            attempts[username].count++;
            attempts[username].lastAttempt = Date.now();
            
            localStorage.setItem('login_attempts', JSON.stringify(attempts));
            
            // Bloquear si se exceden los intentos
            if (attempts[username].count >= this.security.maxLoginAttempts) {
                this.lockAccount(username);
            }
            
        } catch (error) {
            console.error('Error registrando intento fallido:', error);
        }
    }

    /**
     * Bloquea una cuenta
     */
    lockAccount(username) {
        try {
            const locks = JSON.parse(localStorage.getItem('account_locks') || '{}');
            locks[username] = {
                lockedAt: Date.now(),
                expiresAt: Date.now() + this.security.lockoutDuration
            };
            
            localStorage.setItem('account_locks', JSON.stringify(locks));
            
            this.logSecurityEvent('account_locked', {
                username,
                reason: 'max_attempts_exceeded',
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error bloqueando cuenta:', error);
        }
    }

    /**
     * Limpia los intentos de login fallidos
     */
    clearLoginAttempts(username) {
        try {
            const attempts = JSON.parse(localStorage.getItem('login_attempts') || '{}');
            delete attempts[username];
            localStorage.setItem('login_attempts', JSON.stringify(attempts));
            
            const locks = JSON.parse(localStorage.getItem('account_locks') || '{}');
            delete locks[username];
            localStorage.setItem('account_locks', JSON.stringify(locks));
            
        } catch (error) {
            console.error('Error limpiando intentos de login:', error);
        }
    }

    /**
     * Registra eventos de seguridad
     */
    logSecurityEvent(event, data) {
        try {
            const events = JSON.parse(localStorage.getItem('security_events') || '[]');
            
            events.unshift({
                id: Date.now() + Math.random(),
                event,
                data,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            });
            
            // Mantener solo los últimos 500 eventos
            if (events.length > 500) {
                events.splice(500);
            }
            
            localStorage.setItem('security_events', JSON.stringify(events));
            
        } catch (error) {
            console.error('Error registrando evento de seguridad:', error);
        }
    }

    /**
     * Obtiene la IP del cliente (simulada)
     */
    async getClientIP() {
        try {
            // En desarrollo, retornar IP local
            if (window.Config?.ENVIRONMENT === 'development') {
                return '127.0.0.1';
            }
            
            // En producción, obtener IP real
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    }

    /**
     * Genera un token simulado
     */
    generateToken() {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            iss: 'minimarket-system',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor((Date.now() + this.security.tokenExpiration) / 1000)
        }));
        const signature = btoa(Math.random().toString(36));
        
        return `${header}.${payload}.${signature}`;
    }

    /**
     * Actualiza la configuración de seguridad
     */
    updateSecurityConfig(newConfig) {
        this.security = { ...this.security, ...newConfig };
    }

    /**
     * Obtiene estadísticas de seguridad
     */
    getSecurityStats() {
        try {
            const events = JSON.parse(localStorage.getItem('security_events') || '[]');
            const attempts = JSON.parse(localStorage.getItem('login_attempts') || '{}');
            const locks = JSON.parse(localStorage.getItem('account_locks') || '{}');
            
            return {
                totalEvents: events.length,
                recentLogins: events.filter(e => e.event === 'login_success' && 
                    Date.now() - new Date(e.timestamp).getTime() < 24 * 60 * 60 * 1000).length,
                failedAttempts: Object.keys(attempts).length,
                lockedAccounts: Object.keys(locks).filter(username => 
                    this.isAccountLocked(username)).length,
                lastActivity: this.currentUser ? new Date().toISOString() : null
            };
        } catch {
            return {
                totalEvents: 0,
                recentLogins: 0,
                failedAttempts: 0,
                lockedAccounts: 0,
                lastActivity: null
            };
        }
    }
}

// Crear instancia global
window.AdvancedAuthService = new AdvancedAuthService();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedAuthService;
}