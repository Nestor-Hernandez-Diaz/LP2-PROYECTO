/**
 * Funciones auxiliares y utilidades del Sistema de Minimarket
 * Este archivo contiene funciones reutilizables en toda la aplicación
 */

// ===== UTILIDADES DE FORMATO =====

/**
 * Formatea un número como moneda
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda (opcional)
 * @returns {string} Cantidad formateada
 */
function formatCurrency(amount, currency = APP_CONFIG.format.currency) {
    const formatter = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    });
    return formatter.format(amount);
}

/**
 * Formatea una fecha
 * @param {Date|string} date - Fecha a formatear
 * @param {string} format - Formato deseado (opcional)
 * @returns {string} Fecha formateada
 */
function formatDate(date, format = APP_CONFIG.format.dateFormat) {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    
    switch (format) {
        case 'DD/MM/YYYY':
            return `${day}/${month}/${year}`;
        case 'HH:mm:ss':
            return `${hours}:${minutes}:${seconds}`;
        case 'DD/MM/YYYY HH:mm:ss':
            return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        default:
            return `${day}/${month}/${year}`;
    }
}

/**
 * Formatea un número con separadores de miles
 * @param {number} number - Número a formatear
 * @returns {string} Número formateado
 */
function formatNumber(number) {
    return new Intl.NumberFormat('es-PE').format(number);
}

// ===== UTILIDADES DE VALIDACIÓN =====

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida un número de teléfono peruano
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} True si es válido
 */
function validatePhone(phone) {
    const phoneRegex = /^(\+51|51)?[9]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Valida un DNI peruano
 * @param {string} dni - DNI a validar
 * @returns {boolean} True si es válido
 */
function validateDNI(dni) {
    const dniRegex = /^\d{8}$/;
    return dniRegex.test(dni);
}

/**
 * Valida un RUC peruano
 * @param {string} ruc - RUC a validar
 * @returns {boolean} True si es válido
 */
function validateRUC(ruc) {
    const rucRegex = /^(10|15|17|20)\d{9}$/;
    return rucRegex.test(ruc);
}

/**
 * Valida una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {object} Objeto con resultado y mensaje
 */
function validatePassword(password) {
    const minLength = APP_CONFIG.validation.minPasswordLength;
    
    if (password.length < minLength) {
        return {
            valid: false,
            message: `La contraseña debe tener al menos ${minLength} caracteres`
        };
    }
    
    if (!/[A-Z]/.test(password)) {
        return {
            valid: false,
            message: 'La contraseña debe contener al menos una letra mayúscula'
        };
    }
    
    if (!/[a-z]/.test(password)) {
        return {
            valid: false,
            message: 'La contraseña debe contener al menos una letra minúscula'
        };
    }
    
    if (!/\d/.test(password)) {
        return {
            valid: false,
            message: 'La contraseña debe contener al menos un número'
        };
    }
    
    return { valid: true, message: 'Contraseña válida' };
}

// ===== UTILIDADES DE ALMACENAMIENTO =====

/**
 * Guarda datos en localStorage
 * @param {string} key - Clave
 * @param {any} data - Datos a guardar
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
    }
}

/**
 * Obtiene datos de localStorage
 * @param {string} key - Clave
 * @returns {any} Datos obtenidos
 */
function getFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error al obtener de localStorage:', error);
        return null;
    }
}

/**
 * Elimina datos de localStorage
 * @param {string} key - Clave
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error al eliminar de localStorage:', error);
    }
}

// ===== UTILIDADES DE DOM =====

/**
 * Muestra un elemento
 * @param {string|HTMLElement} element - Selector o elemento
 */
function showElement(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) {
        el.style.display = 'block';
        el.classList.remove('hidden');
    }
}

/**
 * Oculta un elemento
 * @param {string|HTMLElement} element - Selector o elemento
 */
function hideElement(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) {
        el.style.display = 'none';
        el.classList.add('hidden');
    }
}

/**
 * Alterna la visibilidad de un elemento
 * @param {string|HTMLElement} element - Selector o elemento
 */
function toggleElement(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) {
        if (el.style.display === 'none' || el.classList.contains('hidden')) {
            showElement(el);
        } else {
            hideElement(el);
        }
    }
}

/**
 * Muestra el loader global
 */
function showLoader() {
    showElement('#loader');
}

/**
 * Oculta el loader global
 */
function hideLoader() {
    hideElement('#loader');
}

// ===== UTILIDADES DE NOTIFICACIONES =====

/**
 * Muestra una notificación
 * @param {string} message - Mensaje
 * @param {string} type - Tipo de notificación
 * @param {number} duration - Duración en ms
 */
function showNotification(message, type = 'info', duration = NOTIFICATION_CONFIG.duration) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Agregar estilos si no existen
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 16px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: slideIn 0.3s ease;
            }
            .notification-success { background-color: var(--success-color); }
            .notification-error { background-color: var(--error-color); }
            .notification-warning { background-color: var(--warning-color); }
            .notification-info { background-color: var(--info-color); }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                margin-left: auto;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Manejar cierre
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-cerrar
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    }
}

// ===== UTILIDADES DE MODAL =====

/**
 * Muestra un modal
 * @param {string} content - Contenido HTML del modal
 * @param {object} options - Opciones del modal
 */
function showModal(content, options = {}) {
    const modal = document.querySelector('#modal');
    const modalBody = document.querySelector('#modal-body');
    
    if (modal && modalBody) {
        modalBody.innerHTML = content;
        showElement(modal);
        
        // Manejar cierre
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', hideModal);
        }
        
        // Cerrar al hacer clic fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal();
            }
        });
    }
}

/**
 * Oculta el modal
 */
function hideModal() {
    hideElement('#modal');
}

// ===== UTILIDADES DE URL =====

/**
 * Obtiene parámetros de la URL
 * @returns {object} Objeto con los parámetros
 */
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}

/**
 * Actualiza la URL sin recargar la página
 * @param {string} path - Nueva ruta
 * @param {object} params - Parámetros adicionales
 */
function updateUrl(path, params = {}) {
    const url = new URL(window.location);
    url.hash = path;
    
    // Agregar parámetros
    Object.keys(params).forEach(key => {
        url.searchParams.set(key, params[key]);
    });
    
    window.history.pushState({}, '', url);
}

// ===== UTILIDADES DE DEBOUNCE =====

/**
 * Función debounce para limitar la frecuencia de ejecución
 * @param {function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {function} Función debounced
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== UTILIDADES DE EXPORTACIÓN =====

/**
 * Exporta datos a CSV
 * @param {array} data - Datos a exportar
 * @param {string} filename - Nombre del archivo
 */
function exportToCSV(data, filename = 'export.csv') {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Hacer las funciones disponibles globalmente
window.Utils = {
    // Formato
    formatCurrency,
    formatDate,
    formatNumber,
    
    // Validación
    validateEmail,
    validatePhone,
    validateDNI,
    validateRUC,
    validatePassword,
    
    // Almacenamiento
    saveToStorage,
    getFromStorage,
    removeFromStorage,
    
    // DOM
    showElement,
    hideElement,
    toggleElement,
    showLoader,
    hideLoader,
    
    // Notificaciones
    showNotification,
    
    // Modal
    showModal,
    hideModal,
    
    // URL
    getUrlParams,
    updateUrl,
    
    // Utilidades
    debounce,
    exportToCSV
};