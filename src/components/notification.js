/**
 * Notification System
 * Provides toast notifications and alerts for user feedback
 */
class NotificationSystem {
    constructor(options = {}) {
        this.options = {
            position: 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
            duration: 4000,
            maxNotifications: 5,
            showProgress: true,
            pauseOnHover: true,
            closeOnClick: true,
            animation: 'slideIn',
            ...options
        };
        
        this.notifications = [];
        this.container = null;
        this.init();
    }
    
    init() {
        this.createContainer();
        this.setupStyles();
    }
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.className = `notification-container ${this.options.position}`;
        this.container.id = 'notification-container';
        document.body.appendChild(this.container);
    }
    
    setupStyles() {
        if (document.getElementById('notification-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification-container {
                position: fixed;
                z-index: 10000;
                pointer-events: none;
                max-width: 400px;
            }
            
            .notification-container.top-right {
                top: 20px;
                right: 20px;
            }
            
            .notification-container.top-left {
                top: 20px;
                left: 20px;
            }
            
            .notification-container.bottom-right {
                bottom: 20px;
                right: 20px;
            }
            
            .notification-container.bottom-left {
                bottom: 20px;
                left: 20px;
            }
            
            .notification-container.top-center {
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
            }
            
            .notification-container.bottom-center {
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
            }
            
            .notification {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                margin-bottom: 10px;
                padding: 16px;
                pointer-events: auto;
                position: relative;
                overflow: hidden;
                min-width: 300px;
                max-width: 400px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .notification:hover {
                transform: translateX(-5px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
            }
            
            .notification.success {
                border-left: 4px solid #10b981;
            }
            
            .notification.error {
                border-left: 4px solid #ef4444;
            }
            
            .notification.warning {
                border-left: 4px solid #f59e0b;
            }
            
            .notification.info {
                border-left: 4px solid #3b82f6;
            }
            
            .notification-header {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .notification-icon {
                margin-right: 12px;
                font-size: 20px;
            }
            
            .notification.success .notification-icon {
                color: #10b981;
            }
            
            .notification.error .notification-icon {
                color: #ef4444;
            }
            
            .notification.warning .notification-icon {
                color: #f59e0b;
            }
            
            .notification.info .notification-icon {
                color: #3b82f6;
            }
            
            .notification-title {
                font-weight: 600;
                font-size: 14px;
                color: #1f2937;
                flex: 1;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                font-size: 16px;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .notification-close:hover {
                color: #374151;
            }
            
            .notification-message {
                color: #6b7280;
                font-size: 13px;
                line-height: 1.4;
                margin-bottom: 8px;
            }
            
            .notification-actions {
                display: flex;
                gap: 8px;
                margin-top: 12px;
            }
            
            .notification-action {
                background: none;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                color: #374151;
                cursor: pointer;
                font-size: 12px;
                padding: 4px 8px;
                transition: all 0.2s ease;
            }
            
            .notification-action:hover {
                background: #f3f4f6;
            }
            
            .notification-action.primary {
                background: #3b82f6;
                border-color: #3b82f6;
                color: white;
            }
            
            .notification-action.primary:hover {
                background: #2563eb;
            }
            
            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(0, 0, 0, 0.1);
                transition: width linear;
            }
            
            .notification.success .notification-progress {
                background: #10b981;
            }
            
            .notification.error .notification-progress {
                background: #ef4444;
            }
            
            .notification.warning .notification-progress {
                background: #f59e0b;
            }
            
            .notification.info .notification-progress {
                background: #3b82f6;
            }
            
            .notification.slideIn {
                animation: slideInRight 0.3s ease;
            }
            
            .notification.slideOut {
                animation: slideOutRight 0.3s ease;
            }
            
            .notification.fadeIn {
                animation: fadeIn 0.3s ease;
            }
            
            .notification.fadeOut {
                animation: fadeOut 0.3s ease;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @media (max-width: 480px) {
                .notification-container {
                    left: 10px !important;
                    right: 10px !important;
                    max-width: none;
                    transform: none !important;
                }
                
                .notification {
                    min-width: auto;
                    max-width: none;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    show(options) {
        if (typeof options === 'string') {
            options = { message: options };
        }
        
        const notification = {
            id: this.generateId(),
            type: options.type || 'info',
            title: options.title,
            message: options.message || '',
            duration: options.duration !== undefined ? options.duration : this.options.duration,
            actions: options.actions || [],
            onClick: options.onClick,
            onClose: options.onClose,
            persistent: options.persistent || false,
            ...options
        };
        
        // Remove oldest notification if we exceed max
        if (this.notifications.length >= this.options.maxNotifications) {
            this.remove(this.notifications[0].id);
        }
        
        this.notifications.push(notification);
        this.render(notification);
        
        // Auto remove if not persistent
        if (!notification.persistent && notification.duration > 0) {
            setTimeout(() => {
                this.remove(notification.id);
            }, notification.duration);
        }
        
        return notification.id;
    }
    
    success(message, options = {}) {
        return this.show({
            type: 'success',
            title: options.title || 'Éxito',
            message,
            ...options
        });
    }
    
    error(message, options = {}) {
        return this.show({
            type: 'error',
            title: options.title || 'Error',
            message,
            duration: options.duration || 6000,
            ...options
        });
    }
    
    warning(message, options = {}) {
        return this.show({
            type: 'warning',
            title: options.title || 'Advertencia',
            message,
            ...options
        });
    }
    
    info(message, options = {}) {
        return this.show({
            type: 'info',
            title: options.title || 'Información',
            message,
            ...options
        });
    }
    
    render(notification) {
        const element = document.createElement('div');
        element.className = `notification ${notification.type} ${this.options.animation}`;
        element.dataset.id = notification.id;
        
        const icon = this.getIcon(notification.type);
        
        element.innerHTML = `
            <div class="notification-header">
                <i class="notification-icon ${icon}"></i>
                ${notification.title ? `<div class="notification-title">${notification.title}</div>` : ''}
                <button class="notification-close" aria-label="Cerrar">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            ${notification.message ? `<div class="notification-message">${notification.message}</div>` : ''}
            ${notification.actions.length > 0 ? this.renderActions(notification.actions) : ''}
            ${this.options.showProgress && notification.duration > 0 && !notification.persistent ? 
                `<div class="notification-progress" style="width: 100%; transition-duration: ${notification.duration}ms;"></div>` : ''}
        `;
        
        // Event listeners
        const closeBtn = element.querySelector('.notification-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.remove(notification.id);
        });
        
        if (this.options.closeOnClick) {
            element.addEventListener('click', () => {
                if (notification.onClick) {
                    notification.onClick(notification);
                }
                this.remove(notification.id);
            });
        }
        
        // Pause on hover
        if (this.options.pauseOnHover && notification.duration > 0 && !notification.persistent) {
            let timeoutId;
            const progressBar = element.querySelector('.notification-progress');
            
            element.addEventListener('mouseenter', () => {
                if (progressBar) {
                    progressBar.style.animationPlayState = 'paused';
                }
            });
            
            element.addEventListener('mouseleave', () => {
                if (progressBar) {
                    progressBar.style.animationPlayState = 'running';
                }
            });
        }
        
        // Action buttons
        element.querySelectorAll('.notification-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const actionName = btn.dataset.action;
                const action = notification.actions.find(a => a.name === actionName);
                if (action && action.handler) {
                    action.handler(notification);
                }
                if (action && action.closeOnClick !== false) {
                    this.remove(notification.id);
                }
            });
        });
        
        this.container.appendChild(element);
        
        // Start progress animation
        if (this.options.showProgress && notification.duration > 0 && !notification.persistent) {
            const progressBar = element.querySelector('.notification-progress');
            if (progressBar) {
                setTimeout(() => {
                    progressBar.style.width = '0%';
                }, 100);
            }
        }
    }
    
    renderActions(actions) {
        return `
            <div class="notification-actions">
                ${actions.map(action => `
                    <button class="notification-action ${action.type || ''}" data-action="${action.name}">
                        ${action.icon ? `<i class="${action.icon}"></i> ` : ''}${action.label}
                    </button>
                `).join('')}
            </div>
        `;
    }
    
    remove(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (!notification) return;
        
        const element = this.container.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.classList.remove(this.options.animation);
            element.classList.add('slideOut');
            
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 300);
        }
        
        this.notifications = this.notifications.filter(n => n.id !== id);
        
        if (notification.onClose) {
            notification.onClose(notification);
        }
    }
    
    clear() {
        this.notifications.forEach(notification => {
            this.remove(notification.id);
        });
    }
    
    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }
    
    generateId() {
        return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Utility methods for common scenarios
    confirmAction(message, onConfirm, options = {}) {
        return this.show({
            type: 'warning',
            title: options.title || 'Confirmar acción',
            message,
            persistent: true,
            actions: [
                {
                    name: 'cancel',
                    label: 'Cancelar',
                    type: 'secondary'
                },
                {
                    name: 'confirm',
                    label: options.confirmLabel || 'Confirmar',
                    type: 'primary',
                    handler: onConfirm
                }
            ],
            ...options
        });
    }
    
    loading(message, options = {}) {
        return this.show({
            type: 'info',
            title: options.title || 'Cargando...',
            message,
            persistent: true,
            ...options
        });
    }
    
    update(id, updates) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            Object.assign(notification, updates);
            const element = this.container.querySelector(`[data-id="${id}"]`);
            if (element) {
                element.remove();
                this.render(notification);
            }
        }
    }
}

// Global notification instance
const notificationInstance = new NotificationSystem();
window.Notifications = notificationInstance;
window.NotificationSystem = notificationInstance;

// Convenience methods
window.showNotification = (message, type = 'info', options = {}) => {
    return window.Notifications[type](message, options);
};

window.showSuccess = (message, options = {}) => window.Notifications.success(message, options);
window.showError = (message, options = {}) => window.Notifications.error(message, options);
window.showWarning = (message, options = {}) => window.Notifications.warning(message, options);
window.showInfo = (message, options = {}) => window.Notifications.info(message, options);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
}