/**
 * ===== MÓDULO DE AUTENTICACIÓN =====
 * Maneja toda la lógica de login, validación y autenticación de usuarios
 */

class AuthModule {
    constructor() {
        this.form = null;
        this.inputs = {};
        this.isLoading = false;
        this.rememberMe = false;
        this.maxAttempts = 3;
        this.currentAttempts = 0;
        this.lockoutTime = 15 * 60 * 1000; // 15 minutos
    }

    /**
     * Inicializa el módulo de autenticación
     */
    init() {
        this.setupDOM();
        this.setupEventListeners();
        this.setupValidation();
        this.checkStoredCredentials();
        this.checkLockout();
        this.setupDemoUsers();
    }

    /**
     * Configura las referencias del DOM
     */
    setupDOM() {
        this.form = document.getElementById('loginForm');
        this.inputs = {
            username: document.getElementById('username'),
            password: document.getElementById('password'),
            rememberMe: document.getElementById('rememberMe')
        };
        
        this.elements = {
            loginBtn: document.getElementById('loginBtn'),
            forgotPasswordLink: document.getElementById('forgotPasswordLink'),
            passwordToggle: document.getElementById('passwordToggle'),
            passwordIcon: document.getElementById('passwordIcon'),
            recoveryModal: document.getElementById('recoveryModal'),
            recoveryForm: document.getElementById('recoveryForm'),
            recoveryEmail: document.getElementById('recoveryEmail'),
            sendRecoveryBtn: document.getElementById('sendRecoveryBtn'),
            cancelRecoveryBtn: document.getElementById('cancelRecoveryBtn')
        };
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Envío del formulario
        this.form.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Toggle de contraseña
        this.elements.passwordToggle.addEventListener('click', () => this.togglePassword());
        
        // Recordar credenciales
        this.inputs.rememberMe.addEventListener('change', (e) => {
            this.rememberMe = e.target.checked;
        });
        
        // Enlace de recuperación
        this.elements.forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRecoveryModal();
        });
        
        // Modal de recuperación
        this.elements.sendRecoveryBtn.addEventListener('click', () => this.handlePasswordRecovery());
        this.elements.cancelRecoveryBtn.addEventListener('click', () => this.hideRecoveryModal());
        
        // Validación en tiempo real
        Object.values(this.inputs).forEach(input => {
            if (input && input.type !== 'checkbox') {
                input.addEventListener('input', () => this.validateField(input));
                input.addEventListener('blur', () => this.validateField(input));
            }
        });
        
        // Tecla Enter en campos
        this.inputs.username.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.inputs.password.focus();
        });
        
        this.inputs.password.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin(e);
        });
    }

    /**
     * Configura las reglas de validación
     */
    setupValidation() {
        this.validationRules = {
            username: {
                required: true,
                minLength: 3,
                pattern: /^[a-zA-Z0-9._-]+$/,
                message: 'Usuario debe tener al menos 3 caracteres y solo contener letras, números, puntos, guiones y guiones bajos'
            },
            password: {
                required: true,
                minLength: 6,
                message: 'La contraseña debe tener al menos 6 caracteres'
            }
        };
    }

    /**
     * Verifica credenciales almacenadas
     */
    checkStoredCredentials() {
        const storedUsername = localStorage.getItem('rememberedUsername');
        const storedPassword = localStorage.getItem('rememberedPassword');
        
        if (storedUsername && storedPassword) {
            this.inputs.username.value = storedUsername;
            this.inputs.password.value = atob(storedPassword); // Decodificar base64
            this.inputs.rememberMe.checked = true;
            this.rememberMe = true;
        }
    }

    /**
     * Verifica si hay bloqueo por intentos fallidos
     */
    checkLockout() {
        const lockoutEnd = localStorage.getItem('loginLockoutEnd');
        if (lockoutEnd && Date.now() < parseInt(lockoutEnd)) {
            const remainingTime = Math.ceil((parseInt(lockoutEnd) - Date.now()) / 1000 / 60);
            this.showError(`Cuenta bloqueada. Intente nuevamente en ${remainingTime} minutos.`);
            this.disableForm(true);
            
            // Timer para desbloquear
            setTimeout(() => {
                localStorage.removeItem('loginLockoutEnd');
                localStorage.removeItem('loginAttempts');
                this.disableForm(false);
                this.hideError();
            }, parseInt(lockoutEnd) - Date.now());
        } else {
            this.currentAttempts = parseInt(localStorage.getItem('loginAttempts') || '0');
        }
    }

    /**
     * Configura los usuarios demo
     */
    setupDemoUsers() {
        const demoUsers = document.querySelectorAll('.demo-user');
        demoUsers.forEach(user => {
            user.addEventListener('click', () => {
                const username = user.dataset.username;
                const password = user.dataset.password;
                
                this.inputs.username.value = username;
                this.inputs.password.value = password;
                
                // Animación visual
                user.style.background = '#e0f2fe';
                setTimeout(() => {
                    user.style.background = '';
                }, 300);
            });
        });
    }

    /**
     * Maneja el proceso de login
     */
    async handleLogin(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        // Validar formulario
        if (!this.validateForm()) {
            return;
        }
        
        this.setLoading(true);
        
        try {
            const credentials = {
                username: this.inputs.username.value.trim(),
                password: this.inputs.password.value,
                rememberMe: this.rememberMe
            };
            
            // Simular delay de red
            await this.delay(1000);
            
            // Llamar al servicio de autenticación
            const response = await window.AuthService.login(credentials);
            
            if (response.success) {
                this.handleLoginSuccess(response.user, credentials);
            } else {
                this.handleLoginError(response.message || 'Credenciales inválidas');
            }
            
        } catch (error) {
            console.error('Error en login:', error);
            this.handleLoginError('Error de conexión. Verifique su conexión a internet.');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Maneja el éxito del login
     */
    handleLoginSuccess(user, credentials) {
        // Limpiar intentos fallidos
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('loginLockoutEnd');
        this.currentAttempts = 0;
        
        // Guardar credenciales si se solicita
        if (this.rememberMe) {
            localStorage.setItem('rememberedUsername', credentials.username);
            localStorage.setItem('rememberedPassword', btoa(credentials.password)); // Codificar base64
        } else {
            localStorage.removeItem('rememberedUsername');
            localStorage.removeItem('rememberedPassword');
        }
        
        // Mostrar mensaje de éxito
        window.Utils.showNotification('¡Bienvenido al sistema!', 'success');
        
        // Redirigir al dashboard
        setTimeout(() => {
            window.Router.navigate('/dashboard');
        }, 500);
    }

    /**
     * Maneja errores de login
     */
    handleLoginError(message) {
        this.currentAttempts++;
        localStorage.setItem('loginAttempts', this.currentAttempts.toString());
        
        if (this.currentAttempts >= this.maxAttempts) {
            // Bloquear cuenta
            const lockoutEnd = Date.now() + this.lockoutTime;
            localStorage.setItem('loginLockoutEnd', lockoutEnd.toString());
            
            this.showError(`Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.`);
            this.disableForm(true);
            
            // Timer para desbloquear
            setTimeout(() => {
                localStorage.removeItem('loginLockoutEnd');
                localStorage.removeItem('loginAttempts');
                this.disableForm(false);
                this.hideError();
            }, this.lockoutTime);
        } else {
            const remainingAttempts = this.maxAttempts - this.currentAttempts;
            this.showError(`${message}. Intentos restantes: ${remainingAttempts}`);
        }
        
        // Limpiar contraseña
        this.inputs.password.value = '';
        this.inputs.password.focus();
    }

    /**
     * Valida todo el formulario
     */
    validateForm() {
        let isValid = true;
        
        Object.keys(this.validationRules).forEach(fieldName => {
            if (!this.validateField(this.inputs[fieldName])) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    /**
     * Valida un campo específico
     */
    validateField(input) {
        if (!input) return true;
        
        const fieldName = input.name || input.id;
        const rule = this.validationRules[fieldName];
        
        if (!rule) return true;
        
        const value = input.value.trim();
        let isValid = true;
        let message = '';
        
        // Validar requerido
        if (rule.required && !value) {
            isValid = false;
            message = 'Este campo es requerido';
        }
        
        // Validar longitud mínima
        else if (rule.minLength && value.length < rule.minLength) {
            isValid = false;
            message = `Debe tener al menos ${rule.minLength} caracteres`;
        }
        
        // Validar patrón
        else if (rule.pattern && !rule.pattern.test(value)) {
            isValid = false;
            message = rule.message || 'Formato inválido';
        }
        
        this.showFieldError(input, isValid ? '' : message);
        return isValid;
    }

    /**
     * Muestra error en un campo específico
     */
    showFieldError(input, message) {
        const errorElement = input.parentNode.querySelector('.form-error');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.toggle('show', !!message);
        }
        
        input.classList.toggle('error', !!message);
    }

    /**
     * Muestra error general
     */
    showError(message) {
        window.Utils.showNotification(message, 'error');
    }

    /**
     * Oculta error general
     */
    hideError() {
        // Los errores se ocultan automáticamente con las notificaciones
    }

    /**
     * Alterna la visibilidad de la contraseña
     */
    togglePassword() {
        const isPassword = this.inputs.password.type === 'password';
        this.inputs.password.type = isPassword ? 'text' : 'password';
        this.elements.passwordIcon.textContent = isPassword ? '🙈' : '👁️';
    }

    /**
     * Establece el estado de carga
     */
    setLoading(loading) {
        this.isLoading = loading;
        this.elements.loginBtn.classList.toggle('loading', loading);
        this.form.classList.toggle('loading', loading);
        
        if (loading) {
            this.elements.loginBtn.disabled = true;
        } else {
            this.elements.loginBtn.disabled = false;
        }
    }

    /**
     * Deshabilita/habilita el formulario
     */
    disableForm(disabled) {
        Object.values(this.inputs).forEach(input => {
            if (input) input.disabled = disabled;
        });
        this.elements.loginBtn.disabled = disabled;
    }

    /**
     * Muestra el modal de recuperación
     */
    showRecoveryModal() {
        window.Utils.showModal('recoveryModal');
        this.elements.recoveryEmail.focus();
    }

    /**
     * Oculta el modal de recuperación
     */
    hideRecoveryModal() {
        window.Utils.hideModal('recoveryModal');
        this.elements.recoveryForm.reset();
    }

    /**
     * Maneja la recuperación de contraseña
     */
    async handlePasswordRecovery() {
        const email = this.elements.recoveryEmail.value.trim();
        
        if (!email) {
            window.Utils.showNotification('Ingrese su email', 'error');
            return;
        }
        
        if (!window.Utils.validateEmail(email)) {
            window.Utils.showNotification('Email inválido', 'error');
            return;
        }
        
        try {
            this.elements.sendRecoveryBtn.disabled = true;
            this.elements.sendRecoveryBtn.textContent = 'Enviando...';
            
            // Simular envío
            await this.delay(2000);
            
            window.Utils.showNotification('Se ha enviado un enlace de recuperación a su email', 'success');
            this.hideRecoveryModal();
            
        } catch (error) {
            window.Utils.showNotification('Error al enviar email de recuperación', 'error');
        } finally {
            this.elements.sendRecoveryBtn.disabled = false;
            this.elements.sendRecoveryBtn.textContent = 'Enviar';
        }
    }

    /**
     * Función auxiliar para delays
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Limpia el formulario
     */
    reset() {
        this.form.reset();
        this.hideError();
        
        // Limpiar errores de campos
        Object.values(this.inputs).forEach(input => {
            if (input) this.showFieldError(input, '');
        });
    }

    /**
     * Destruye el módulo
     */
    destroy() {
        // Remover event listeners si es necesario
        // (En este caso, se limpiarán automáticamente al cambiar de página)
    }
}

// ===== SERVICIO DE AUTENTICACIÓN =====
class AuthService {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.refreshToken = null;
        
        // Usuarios demo para pruebas
        this.demoUsers = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                email: 'admin@minimarket.com',
                role: 'admin',
                name: 'Administrador',
                permissions: ['all']
            },
            {
                id: 2,
                username: 'vendedor',
                password: 'vendedor123',
                email: 'vendedor@minimarket.com',
                role: 'seller',
                name: 'Vendedor',
                permissions: ['sales', 'inventory_read', 'customers']
            },
            {
                id: 3,
                username: 'cajero',
                password: 'cajero123',
                email: 'cajero@minimarket.com',
                role: 'cashier',
                name: 'Cajero',
                permissions: ['cash', 'sales']
            }
        ];
        
        this.loadStoredSession();
    }

    /**
     * Carga sesión almacenada
     */
    loadStoredSession() {
        const storedUser = localStorage.getItem('currentUser');
        const storedToken = localStorage.getItem('authToken');
        
        if (storedUser && storedToken) {
            this.currentUser = JSON.parse(storedUser);
            this.token = storedToken;
        }
    }

    /**
     * Realiza el login
     */
    async login(credentials) {
        try {
            // Buscar usuario en demo
            const user = this.demoUsers.find(u => 
                u.username === credentials.username && 
                u.password === credentials.password
            );
            
            if (!user) {
                return {
                    success: false,
                    message: 'Usuario o contraseña incorrectos'
                };
            }
            
            // Generar token simulado
            this.token = this.generateToken();
            this.refreshToken = this.generateToken();
            this.currentUser = { ...user };
            delete this.currentUser.password; // No almacenar contraseña
            
            // Guardar en localStorage
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            localStorage.setItem('authToken', this.token);
            localStorage.setItem('refreshToken', this.refreshToken);
            
            // Registrar login
            this.logActivity('login', 'Usuario inició sesión');
            
            return {
                success: true,
                user: this.currentUser,
                token: this.token
            };
            
        } catch (error) {
            console.error('Error en AuthService.login:', error);
            return {
                success: false,
                message: 'Error interno del servidor'
            };
        }
    }

    /**
     * Cierra sesión
     */
    async logout() {
        try {
            // Registrar logout
            this.logActivity('logout', 'Usuario cerró sesión');
            
            // Limpiar datos
            this.currentUser = null;
            this.token = null;
            this.refreshToken = null;
            
            // Limpiar localStorage
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            
            return { success: true };
            
        } catch (error) {
            console.error('Error en AuthService.logout:', error);
            return { success: false };
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
     * Verifica permisos
     */
    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        const permissions = this.currentUser.permissions || [];
        return permissions.includes('all') || permissions.includes(permission);
    }

    /**
     * Genera token simulado
     */
    generateToken() {
        return btoa(Date.now() + Math.random().toString(36));
    }

    /**
     * Registra actividad del usuario
     */
    logActivity(action, description) {
        const activity = {
            userId: this.currentUser?.id,
            username: this.currentUser?.username,
            action,
            description,
            timestamp: new Date().toISOString(),
            ip: 'localhost' // En producción obtener IP real
        };
        
        // Guardar en localStorage (en producción enviar al servidor)
        const activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
        activities.unshift(activity);
        
        // Mantener solo los últimos 100 registros
        if (activities.length > 100) {
            activities.splice(100);
        }
        
        localStorage.setItem('userActivities', JSON.stringify(activities));
    }
}

// ===== INICIALIZACIÓN =====
// Crear instancia global del servicio de autenticación
window.AuthService = new AuthService();

// Exportar clase para uso del sistema de módulos
window.AuthModule = AuthModule;