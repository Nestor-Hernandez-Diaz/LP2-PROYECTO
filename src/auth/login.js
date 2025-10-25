// Configuración básica de autenticación
const AUTH_CONFIG = {
    // Credenciales por defecto (cambiar en producción)
    defaultCredentials: {
        username: 'admin',
        password: 'admin'
    },
    redirectUrl: 'dashboard.html'
};

// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('error-message');

// Event listener para el formulario
loginForm.addEventListener('submit', handleLogin);

/**
 * Maneja el proceso de login
 * @param {Event} event - Evento del formulario
 */
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // Validación básica
    if (!username || !password) {
        showError('Por favor, complete todos los campos');
        return;
    }
    
    // Autenticación básica (expandir según necesidades del equipo)
    if (authenticateUser(username, password)) {
        // Guardar sesión
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('loginTime', new Date().toISOString());
        
        // Redireccionar al dashboard
        window.location.href = AUTH_CONFIG.redirectUrl;
    } else {
        showError('Usuario o contraseña incorrectos');
    }
}

/**
 * Autentica las credenciales del usuario
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {boolean} - True si las credenciales son válidas
 */
function authenticateUser(username, password) {
    // Lógica básica de autenticación
    // TODO: Conectar con API real cuando el equipo implemente el backend
    return username === AUTH_CONFIG.defaultCredentials.username && 
           password === AUTH_CONFIG.defaultCredentials.password;
}

/**
 * Muestra un mensaje de error
 * @param {string} message - Mensaje de error a mostrar
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // Ocultar el error después de 5 segundos
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Verificar si ya está autenticado
if (sessionStorage.getItem('isAuthenticated') === 'true') {
    window.location.href = AUTH_CONFIG.redirectUrl;
}