/**
 * Modal Component
 * Reusable modal functionality for the application
 */
class Modal {
    constructor(modalId, options = {}) {
        this.modalId = modalId;
        this.modal = document.getElementById(modalId);
        this.options = {
            closeOnBackdrop: true,
            closeOnEscape: true,
            showCloseButton: true,
            animation: 'fadeIn',
            ...options
        };
        
        this.isOpen = false;
        this.onOpenCallbacks = [];
        this.onCloseCallbacks = [];
        
        this.init();
    }
    
    init() {
        if (!this.modal) {
            console.warn(`Modal with ID "${this.modalId}" not found`);
            return;
        }
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Close button
        if (this.options.showCloseButton) {
            const closeBtn = this.modal.querySelector('.modal-close, .btn-cancel');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }
        }
        
        // Backdrop click
        if (this.options.closeOnBackdrop) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }
        
        // Escape key
        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
        }
    }
    
    open() {
        if (!this.modal) return;
        
        this.modal.style.display = 'flex';
        this.modal.classList.add('active');
        
        if (this.options.animation) {
            this.modal.classList.add(this.options.animation);
        }
        
        // Focus first input
        const firstInput = this.modal.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
        
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
        
        // Trigger callbacks
        this.onOpenCallbacks.forEach(callback => callback());
        
        return this;
    }
    
    close() {
        if (!this.modal) return;
        
        this.modal.classList.remove('active');
        
        setTimeout(() => {
            this.modal.style.display = 'none';
            if (this.options.animation) {
                this.modal.classList.remove(this.options.animation);
            }
        }, 200);
        
        this.isOpen = false;
        document.body.style.overflow = '';
        
        // Trigger callbacks
        this.onCloseCallbacks.forEach(callback => callback());
        
        return this;
    }
    
    toggle() {
        return this.isOpen ? this.close() : this.open();
    }
    
    setContent(content) {
        const modalBody = this.modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = content;
        }
        return this;
    }
    
    setTitle(title) {
        const modalTitle = this.modal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = title;
        }
        return this;
    }
    
    onOpen(callback) {
        this.onOpenCallbacks.push(callback);
        return this;
    }
    
    onClose(callback) {
        this.onCloseCallbacks.push(callback);
        return this;
    }
    
    destroy() {
        if (this.modal) {
            this.modal.remove();
        }
        this.onOpenCallbacks = [];
        this.onCloseCallbacks = [];
    }
}

// Modal Manager for handling multiple modals
class ModalManager {
    constructor() {
        this.modals = new Map();
    }
    
    register(modalId, options = {}) {
        const modal = new Modal(modalId, options);
        this.modals.set(modalId, modal);
        return modal;
    }
    
    get(modalId) {
        return this.modals.get(modalId);
    }
    
    open(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.open();
        }
        return modal;
    }
    
    close(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.close();
        }
        return modal;
    }
    
    closeAll() {
        this.modals.forEach(modal => modal.close());
    }
    
    destroy(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.destroy();
            this.modals.delete(modalId);
        }
    }
    
    destroyAll() {
        this.modals.forEach((modal, id) => {
            modal.destroy();
        });
        this.modals.clear();
    }
}

// Global modal manager instance
window.ModalManager = new ModalManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Modal, ModalManager };
}