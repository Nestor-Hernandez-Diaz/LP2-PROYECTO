/**
 * Formatters Utility
 * Provides consistent formatting functions for various data types
 */
class Formatters {
    constructor() {
        this.locale = 'es-PE';
        this.currency = 'PEN';
        this.timezone = 'America/Lima';
    }
    
    // Currency formatting
    currency(amount, options = {}) {
        const defaultOptions = {
            style: 'currency',
            currency: this.currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        
        try {
            return new Intl.NumberFormat(this.locale, formatOptions).format(amount || 0);
        } catch (error) {
            console.warn('Currency formatting error:', error);
            return `S/ ${(amount || 0).toFixed(2)}`;
        }
    }
    
    // Number formatting
    number(value, options = {}) {
        const defaultOptions = {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        
        try {
            return new Intl.NumberFormat(this.locale, formatOptions).format(value || 0);
        } catch (error) {
            console.warn('Number formatting error:', error);
            return (value || 0).toString();
        }
    }
    
    // Percentage formatting
    percentage(value, options = {}) {
        const defaultOptions = {
            style: 'percent',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        
        try {
            // Convert to decimal if value is greater than 1 (assuming it's already a percentage)
            const decimal = value > 1 ? value / 100 : value;
            return new Intl.NumberFormat(this.locale, formatOptions).format(decimal || 0);
        } catch (error) {
            console.warn('Percentage formatting error:', error);
            return `${(value || 0).toFixed(2)}%`;
        }
    }
    
    // Date formatting
    date(date, options = {}) {
        if (!date) return '';
        
        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        
        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            if (isNaN(dateObj.getTime())) return '';
            
            return new Intl.DateTimeFormat(this.locale, formatOptions).format(dateObj);
        } catch (error) {
            console.warn('Date formatting error:', error);
            return '';
        }
    }
    
    // Time formatting
    time(date, options = {}) {
        if (!date) return '';
        
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        
        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            if (isNaN(dateObj.getTime())) return '';
            
            return new Intl.DateTimeFormat(this.locale, formatOptions).format(dateObj);
        } catch (error) {
            console.warn('Time formatting error:', error);
            return '';
        }
    }
    
    // DateTime formatting
    dateTime(date, options = {}) {
        if (!date) return '';
        
        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        
        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            if (isNaN(dateObj.getTime())) return '';
            
            return new Intl.DateTimeFormat(this.locale, formatOptions).format(dateObj);
        } catch (error) {
            console.warn('DateTime formatting error:', error);
            return '';
        }
    }
    
    // Relative time formatting
    relativeTime(date) {
        if (!date) return '';
        
        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            if (isNaN(dateObj.getTime())) return '';
            
            const now = new Date();
            const diffInSeconds = Math.floor((now - dateObj) / 1000);
            
            if (diffInSeconds < 60) {
                return 'Hace un momento';
            } else if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60);
                return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
            } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
            } else if (diffInSeconds < 2592000) {
                const days = Math.floor(diffInSeconds / 86400);
                return `Hace ${days} día${days > 1 ? 's' : ''}`;
            } else if (diffInSeconds < 31536000) {
                const months = Math.floor(diffInSeconds / 2592000);
                return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
            } else {
                const years = Math.floor(diffInSeconds / 31536000);
                return `Hace ${years} año${years > 1 ? 's' : ''}`;
            }
        } catch (error) {
            console.warn('Relative time formatting error:', error);
            return '';
        }
    }
    
    // File size formatting
    fileSize(bytes, decimals = 2) {
        if (!bytes || bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    // Phone number formatting
    phone(phoneNumber, format = 'national') {
        if (!phoneNumber) return '';
        
        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '');
        
        // Peruvian phone number formatting
        if (cleaned.length === 9 && cleaned.startsWith('9')) {
            switch (format) {
                case 'international':
                    return `+51 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
                case 'national':
                default:
                    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
            }
        }
        
        // Landline formatting (7 digits)
        if (cleaned.length === 7) {
            return `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`;
        }
        
        return phoneNumber; // Return original if doesn't match expected format
    }
    
    // Document number formatting (DNI, RUC)
    document(documentNumber, type = 'dni') {
        if (!documentNumber) return '';
        
        const cleaned = documentNumber.replace(/\D/g, '');
        
        switch (type.toLowerCase()) {
            case 'dni':
                if (cleaned.length === 8) {
                    return `${cleaned.substring(0, 2)}.${cleaned.substring(2, 5)}.${cleaned.substring(5)}`;
                }
                break;
            case 'ruc':
                if (cleaned.length === 11) {
                    return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 10)}-${cleaned.substring(10)}`;
                }
                break;
        }
        
        return documentNumber; // Return original if doesn't match expected format
    }
    
    // Text formatting
    capitalize(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
    
    title(text) {
        if (!text) return '';
        return text.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }
    
    truncate(text, length = 50, suffix = '...') {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + suffix;
    }
    
    slug(text) {
        if (!text) return '';
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .trim('-'); // Remove leading/trailing hyphens
    }
    
    // Address formatting
    address(addressObj) {
        if (!addressObj) return '';
        
        const parts = [];
        
        if (addressObj.street) parts.push(addressObj.street);
        if (addressObj.number) parts.push(addressObj.number);
        if (addressObj.district) parts.push(addressObj.district);
        if (addressObj.city) parts.push(addressObj.city);
        if (addressObj.region) parts.push(addressObj.region);
        if (addressObj.postalCode) parts.push(addressObj.postalCode);
        
        return parts.join(', ');
    }
    
    // Credit card formatting
    creditCard(cardNumber, mask = true) {
        if (!cardNumber) return '';
        
        const cleaned = cardNumber.replace(/\D/g, '');
        
        if (mask && cleaned.length >= 4) {
            const lastFour = cleaned.slice(-4);
            const masked = '*'.repeat(cleaned.length - 4) + lastFour;
            return masked.replace(/(.{4})/g, '$1 ').trim();
        }
        
        return cleaned.replace(/(.{4})/g, '$1 ').trim();
    }
    
    // Status formatting
    status(status, type = 'default') {
        if (!status) return '';
        
        const statusMaps = {
            default: {
                active: 'Activo',
                inactive: 'Inactivo',
                pending: 'Pendiente',
                completed: 'Completado',
                cancelled: 'Cancelado'
            },
            payment: {
                paid: 'Pagado',
                pending: 'Pendiente',
                overdue: 'Vencido',
                cancelled: 'Cancelado'
            },
            order: {
                draft: 'Borrador',
                pending: 'Pendiente',
                processing: 'Procesando',
                shipped: 'Enviado',
                delivered: 'Entregado',
                cancelled: 'Cancelado'
            }
        };
        
        const map = statusMaps[type] || statusMaps.default;
        return map[status.toLowerCase()] || this.capitalize(status);
    }
    
    // Array formatting
    list(items, separator = ', ', lastSeparator = ' y ') {
        if (!Array.isArray(items) || items.length === 0) return '';
        
        if (items.length === 1) return items[0];
        if (items.length === 2) return items.join(lastSeparator);
        
        const allButLast = items.slice(0, -1);
        const last = items[items.length - 1];
        
        return allButLast.join(separator) + lastSeparator + last;
    }
    
    // JSON formatting for display
    json(obj, indent = 2) {
        try {
            return JSON.stringify(obj, null, indent);
        } catch (error) {
            console.warn('JSON formatting error:', error);
            return String(obj);
        }
    }
    
    // HTML escaping
    escapeHtml(text) {
        if (!text) return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // URL formatting
    url(url) {
        if (!url) return '';
        
        // Add protocol if missing
        if (!/^https?:\/\//i.test(url)) {
            return 'https://' + url;
        }
        
        return url;
    }
    
    // Color formatting
    color(color) {
        if (!color) return '';
        
        // Convert named colors to hex
        const namedColors = {
            red: '#ff0000',
            green: '#008000',
            blue: '#0000ff',
            yellow: '#ffff00',
            orange: '#ffa500',
            purple: '#800080',
            pink: '#ffc0cb',
            brown: '#a52a2a',
            black: '#000000',
            white: '#ffffff',
            gray: '#808080',
            grey: '#808080'
        };
        
        const lowerColor = color.toLowerCase();
        if (namedColors[lowerColor]) {
            return namedColors[lowerColor];
        }
        
        // Ensure hex colors start with #
        if (/^[0-9a-f]{6}$/i.test(color)) {
            return '#' + color;
        }
        
        return color;
    }
    
    // Configuration methods
    setLocale(locale) {
        this.locale = locale;
    }
    
    setCurrency(currency) {
        this.currency = currency;
    }
    
    setTimezone(timezone) {
        this.timezone = timezone;
    }
}

// Create global instance
const formatters = new Formatters();

// Export individual functions for convenience
const {
    currency,
    number,
    percentage,
    date,
    time,
    dateTime,
    relativeTime,
    fileSize,
    phone,
    document: formatDocument,
    capitalize,
    title,
    truncate,
    slug,
    address,
    creditCard,
    status,
    list,
    json,
    escapeHtml,
    url,
    color
} = formatters;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Formatters,
        formatters,
        currency,
        number,
        percentage,
        date,
        time,
        dateTime,
        relativeTime,
        fileSize,
        phone,
        formatDocument,
        capitalize,
        title,
        truncate,
        slug,
        address,
        creditCard,
        status,
        list,
        json,
        escapeHtml,
        url,
        color
    };
} else {
    window.Formatters = Formatters;
    window.formatters = formatters;
    
    // Make individual functions globally available
    Object.assign(window, {
        formatCurrency: currency,
        formatNumber: number,
        formatPercentage: percentage,
        formatDate: date,
        formatTime: time,
        formatDateTime: dateTime,
        formatRelativeTime: relativeTime,
        formatFileSize: fileSize,
        formatPhone: phone,
        formatDocument,
        capitalize,
        title,
        truncate,
        slug,
        formatAddress: address,
        formatCreditCard: creditCard,
        formatStatus: status,
        formatList: list,
        formatJson: json,
        escapeHtml,
        formatUrl: url,
        formatColor: color
    });
}