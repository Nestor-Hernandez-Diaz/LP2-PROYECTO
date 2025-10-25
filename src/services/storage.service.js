/**
 * Storage Service
 * Handles localStorage and sessionStorage operations with encryption and validation
 */
class StorageService {
    constructor(options = {}) {
        this.options = {
            prefix: 'minimarket_',
            encrypt: false,
            compression: false,
            expiration: true,
            ...options
        };
        
        this.isAvailable = this.checkAvailability();
    }
    
    checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('Storage not available:', e);
            return false;
        }
    }
    
    // Local Storage methods
    setLocal(key, value, expiration = null) {
        return this.setItem(localStorage, key, value, expiration);
    }
    
    getLocal(key, defaultValue = null) {
        return this.getItem(localStorage, key, defaultValue);
    }
    
    removeLocal(key) {
        return this.removeItem(localStorage, key);
    }
    
    clearLocal() {
        return this.clearStorage(localStorage);
    }
    
    // Session Storage methods
    setSession(key, value, expiration = null) {
        return this.setItem(sessionStorage, key, value, expiration);
    }
    
    getSession(key, defaultValue = null) {
        return this.getItem(sessionStorage, key, defaultValue);
    }
    
    removeSession(key) {
        return this.removeItem(sessionStorage, key);
    }
    
    clearSession() {
        return this.clearStorage(sessionStorage);
    }
    
    // Generic storage methods
    setItem(storage, key, value, expiration = null) {
        if (!this.isAvailable) {
            console.warn('Storage not available');
            return false;
        }
        
        try {
            const prefixedKey = this.options.prefix + key;
            const data = {
                value: value,
                timestamp: Date.now(),
                expiration: expiration ? Date.now() + expiration : null
            };
            
            let serializedData = JSON.stringify(data);
            
            if (this.options.compress) {
                serializedData = this.compress(serializedData);
            }
            
            if (this.options.encrypt) {
                serializedData = this.encrypt(serializedData);
            }
            
            storage.setItem(prefixedKey, serializedData);
            return true;
        } catch (e) {
            console.error('Error setting storage item:', e);
            return false;
        }
    }
    
    getItem(storage, key, defaultValue = null) {
        if (!this.isAvailable) {
            return defaultValue;
        }
        
        try {
            const prefixedKey = this.options.prefix + key;
            let serializedData = storage.getItem(prefixedKey);
            
            if (!serializedData) {
                return defaultValue;
            }
            
            if (this.options.encrypt) {
                serializedData = this.decrypt(serializedData);
            }
            
            if (this.options.compress) {
                serializedData = this.decompress(serializedData);
            }
            
            const data = JSON.parse(serializedData);
            
            // Check expiration
            if (this.options.expiration && data.expiration && Date.now() > data.expiration) {
                this.removeItem(storage, key);
                return defaultValue;
            }
            
            return data.value;
        } catch (e) {
            console.error('Error getting storage item:', e);
            return defaultValue;
        }
    }
    
    removeItem(storage, key) {
        if (!this.isAvailable) {
            return false;
        }
        
        try {
            const prefixedKey = this.options.prefix + key;
            storage.removeItem(prefixedKey);
            return true;
        } catch (e) {
            console.error('Error removing storage item:', e);
            return false;
        }
    }
    
    clearStorage(storage) {
        if (!this.isAvailable) {
            return false;
        }
        
        try {
            const keys = Object.keys(storage);
            keys.forEach(key => {
                if (key.startsWith(this.options.prefix)) {
                    storage.removeItem(key);
                }
            });
            return true;
        } catch (e) {
            console.error('Error clearing storage:', e);
            return false;
        }
    }
    
    // Utility methods
    getAllKeys(storage) {
        if (!this.isAvailable) {
            return [];
        }
        
        const keys = Object.keys(storage);
        return keys
            .filter(key => key.startsWith(this.options.prefix))
            .map(key => key.replace(this.options.prefix, ''));
    }
    
    getSize(storage) {
        if (!this.isAvailable) {
            return 0;
        }
        
        let size = 0;
        const keys = Object.keys(storage);
        keys.forEach(key => {
            if (key.startsWith(this.options.prefix)) {
                size += storage.getItem(key).length;
            }
        });
        return size;
    }
    
    exportData(storage) {
        if (!this.isAvailable) {
            return {};
        }
        
        const data = {};
        const keys = this.getAllKeys(storage);
        
        keys.forEach(key => {
            data[key] = this.getItem(storage, key);
        });
        
        return data;
    }
    
    importData(storage, data) {
        if (!this.isAvailable) {
            return false;
        }
        
        try {
            Object.keys(data).forEach(key => {
                this.setItem(storage, key, data[key]);
            });
            return true;
        } catch (e) {
            console.error('Error importing data:', e);
            return false;
        }
    }
    
    // Encryption methods (basic implementation)
    encrypt(data) {
        // Simple base64 encoding (not secure, just obfuscation)
        return btoa(encodeURIComponent(data));
    }
    
    decrypt(data) {
        try {
            return decodeURIComponent(atob(data));
        } catch (e) {
            console.error('Error decrypting data:', e);
            return data;
        }
    }
    
    // Compression methods (basic implementation)
    compress(data) {
        // Simple compression using JSON minification
        return JSON.stringify(JSON.parse(data));
    }
    
    decompress(data) {
        return data;
    }
    
    // Cache-like methods with TTL
    cache(key, value, ttl = 3600000) { // Default 1 hour
        return this.setLocal(key, value, ttl);
    }
    
    getCache(key, defaultValue = null) {
        return this.getLocal(key, defaultValue);
    }
    
    // User preferences
    setUserPreference(key, value) {
        const preferences = this.getLocal('user_preferences', {});
        preferences[key] = value;
        return this.setLocal('user_preferences', preferences);
    }
    
    getUserPreference(key, defaultValue = null) {
        const preferences = this.getLocal('user_preferences', {});
        return preferences[key] !== undefined ? preferences[key] : defaultValue;
    }
    
    // Application state
    saveAppState(state) {
        return this.setSession('app_state', state);
    }
    
    getAppState(defaultState = {}) {
        return this.getSession('app_state', defaultState);
    }
    
    // Form data persistence
    saveFormData(formId, data) {
        return this.setSession(`form_${formId}`, data);
    }
    
    getFormData(formId, defaultData = {}) {
        return this.getSession(`form_${formId}`, defaultData);
    }
    
    clearFormData(formId) {
        return this.removeSession(`form_${formId}`);
    }
    
    // Shopping cart persistence
    saveCart(cartData) {
        return this.setLocal('shopping_cart', cartData);
    }
    
    getCart(defaultCart = { items: [], total: 0 }) {
        return this.getLocal('shopping_cart', defaultCart);
    }
    
    clearCart() {
        return this.removeLocal('shopping_cart');
    }
    
    // Recent items
    addRecentItem(type, item, maxItems = 10) {
        const key = `recent_${type}`;
        const recent = this.getLocal(key, []);
        
        // Remove if already exists
        const filtered = recent.filter(r => r.id !== item.id);
        
        // Add to beginning
        filtered.unshift(item);
        
        // Limit to maxItems
        const limited = filtered.slice(0, maxItems);
        
        return this.setLocal(key, limited);
    }
    
    getRecentItems(type, maxItems = 10) {
        const key = `recent_${type}`;
        return this.getLocal(key, []).slice(0, maxItems);
    }
    
    // Search history
    addSearchTerm(term, maxTerms = 20) {
        if (!term || term.trim().length < 2) return;
        
        const searches = this.getLocal('search_history', []);
        const filtered = searches.filter(s => s.toLowerCase() !== term.toLowerCase());
        
        filtered.unshift(term.trim());
        const limited = filtered.slice(0, maxTerms);
        
        return this.setLocal('search_history', limited);
    }
    
    getSearchHistory(maxTerms = 20) {
        return this.getLocal('search_history', []).slice(0, maxTerms);
    }
    
    clearSearchHistory() {
        return this.removeLocal('search_history');
    }
    
    // Settings management
    saveSetting(key, value) {
        const settings = this.getLocal('app_settings', {});
        settings[key] = value;
        return this.setLocal('app_settings', settings);
    }
    
    getSetting(key, defaultValue = null) {
        const settings = this.getLocal('app_settings', {});
        return settings[key] !== undefined ? settings[key] : defaultValue;
    }
    
    getSettings() {
        return this.getLocal('app_settings', {});
    }
    
    resetSettings() {
        return this.removeLocal('app_settings');
    }
    
    // Backup and restore
    createBackup() {
        return {
            localStorage: this.exportData(localStorage),
            sessionStorage: this.exportData(sessionStorage),
            timestamp: Date.now(),
            version: '1.0'
        };
    }
    
    restoreBackup(backup) {
        try {
            if (backup.localStorage) {
                this.importData(localStorage, backup.localStorage);
            }
            if (backup.sessionStorage) {
                this.importData(sessionStorage, backup.sessionStorage);
            }
            return true;
        } catch (e) {
            console.error('Error restoring backup:', e);
            return false;
        }
    }
    
    // Cleanup expired items
    cleanup() {
        if (!this.isAvailable || !this.options.expiration) {
            return;
        }
        
        [localStorage, sessionStorage].forEach(storage => {
            const keys = this.getAllKeys(storage);
            keys.forEach(key => {
                // This will automatically remove expired items
                this.getItem(storage, key);
            });
        });
    }
}

// Create global instance
const Storage = new StorageService();

// Auto cleanup on page load
document.addEventListener('DOMContentLoaded', () => {
    Storage.cleanup();
});

// Cleanup before page unload
window.addEventListener('beforeunload', () => {
    Storage.cleanup();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageService;
} else {
    window.StorageService = StorageService;
    window.Storage = Storage;
}