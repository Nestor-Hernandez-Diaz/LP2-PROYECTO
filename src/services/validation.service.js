/**
 * Validation Service
 * Provides comprehensive validation for forms and data
 */
class ValidationService {
    constructor() {
        this.rules = new Map();
        this.messages = {
            required: 'Este campo es obligatorio',
            email: 'Ingrese un email válido',
            min: 'El valor mínimo es {min}',
            max: 'El valor máximo es {max}',
            minLength: 'Mínimo {min} caracteres',
            maxLength: 'Máximo {max} caracteres',
            pattern: 'Formato inválido',
            numeric: 'Solo se permiten números',
            alpha: 'Solo se permiten letras',
            alphanumeric: 'Solo se permiten letras y números',
            phone: 'Ingrese un teléfono válido',
            url: 'Ingrese una URL válida',
            date: 'Ingrese una fecha válida',
            time: 'Ingrese una hora válida',
            decimal: 'Ingrese un número decimal válido',
            integer: 'Ingrese un número entero válido',
            positive: 'El valor debe ser positivo',
            negative: 'El valor debe ser negativo',
            range: 'El valor debe estar entre {min} y {max}',
            same: 'Los campos no coinciden',
            different: 'Los campos deben ser diferentes',
            unique: 'Este valor ya existe',
            file: 'Seleccione un archivo válido',
            fileSize: 'El archivo es demasiado grande (máximo {size})',
            fileType: 'Tipo de archivo no permitido',
            custom: 'Valor inválido'
        };
        
        this.setupDefaultRules();
    }
    
    setupDefaultRules() {
        // Basic validation rules
        this.addRule('required', (value) => {
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
            return value !== null && value !== undefined && String(value).trim() !== '';
        });
        
        this.addRule('email', (value) => {
            if (!value) return true; // Optional field
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        });
        
        this.addRule('min', (value, min) => {
            if (!value) return true;
            return Number(value) >= Number(min);
        });
        
        this.addRule('max', (value, max) => {
            if (!value) return true;
            return Number(value) <= Number(max);
        });
        
        this.addRule('minLength', (value, min) => {
            if (!value) return true;
            return String(value).length >= Number(min);
        });
        
        this.addRule('maxLength', (value, max) => {
            if (!value) return true;
            return String(value).length <= Number(max);
        });
        
        this.addRule('pattern', (value, pattern) => {
            if (!value) return true;
            const regex = new RegExp(pattern);
            return regex.test(value);
        });
        
        this.addRule('numeric', (value) => {
            if (!value) return true;
            return /^\d+$/.test(value);
        });
        
        this.addRule('alpha', (value) => {
            if (!value) return true;
            return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
        });
        
        this.addRule('alphanumeric', (value) => {
            if (!value) return true;
            return /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
        });
        
        this.addRule('phone', (value) => {
            if (!value) return true;
            const phoneRegex = /^(\+?51)?[9]\d{8}$/; // Peruvian phone format
            return phoneRegex.test(value.replace(/\s/g, ''));
        });
        
        this.addRule('url', (value) => {
            if (!value) return true;
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        });
        
        this.addRule('date', (value) => {
            if (!value) return true;
            const date = new Date(value);
            return !isNaN(date.getTime());
        });
        
        this.addRule('time', (value) => {
            if (!value) return true;
            return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
        });
        
        this.addRule('decimal', (value) => {
            if (!value) return true;
            return /^\d+(\.\d+)?$/.test(value);
        });
        
        this.addRule('integer', (value) => {
            if (!value) return true;
            return /^\d+$/.test(value) && Number.isInteger(Number(value));
        });
        
        this.addRule('positive', (value) => {
            if (!value) return true;
            return Number(value) > 0;
        });
        
        this.addRule('negative', (value) => {
            if (!value) return true;
            return Number(value) < 0;
        });
        
        this.addRule('range', (value, min, max) => {
            if (!value) return true;
            const num = Number(value);
            return num >= Number(min) && num <= Number(max);
        });
        
        this.addRule('same', (value, otherValue) => {
            return value === otherValue;
        });
        
        this.addRule('different', (value, otherValue) => {
            return value !== otherValue;
        });
        
        this.addRule('fileSize', (file, maxSize) => {
            if (!file) return true;
            return file.size <= this.parseSize(maxSize);
        });
        
        this.addRule('fileType', (file, allowedTypes) => {
            if (!file) return true;
            const types = Array.isArray(allowedTypes) ? allowedTypes : allowedTypes.split(',');
            return types.some(type => {
                if (type.startsWith('.')) {
                    return file.name.toLowerCase().endsWith(type.toLowerCase());
                }
                return file.type.toLowerCase().includes(type.toLowerCase());
            });
        });
    }
    
    addRule(name, validator) {
        this.rules.set(name, validator);
    }
    
    setMessage(rule, message) {
        this.messages[rule] = message;
    }
    
    setMessages(messages) {
        Object.assign(this.messages, messages);
    }
    
    validate(value, rules, data = {}) {
        const errors = [];
        
        if (typeof rules === 'string') {
            rules = this.parseRules(rules);
        }
        
        for (const rule of rules) {
            const { name, params } = rule;
            const validator = this.rules.get(name);
            
            if (!validator) {
                console.warn(`Validation rule '${name}' not found`);
                continue;
            }
            
            let isValid;
            if (name === 'same' || name === 'different') {
                const otherField = params[0];
                const otherValue = data[otherField];
                isValid = validator(value, otherValue);
            } else {
                isValid = validator(value, ...params);
            }
            
            if (!isValid) {
                errors.push(this.formatMessage(name, params));
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    validateForm(formElement, rules = {}) {
        const formData = new FormData(formElement);
        const data = Object.fromEntries(formData.entries());
        const errors = {};
        let isValid = true;
        
        // Clear previous errors
        this.clearFormErrors(formElement);
        
        // Validate each field
        Object.keys(rules).forEach(fieldName => {
            const fieldRules = rules[fieldName];
            const fieldValue = data[fieldName] || '';
            const result = this.validate(fieldValue, fieldRules, data);
            
            if (!result.isValid) {
                errors[fieldName] = result.errors;
                isValid = false;
                this.showFieldError(formElement, fieldName, result.errors[0]);
            }
        });
        
        // Validate file inputs separately
        const fileInputs = formElement.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            const fieldName = input.name;
            if (rules[fieldName] && input.files.length > 0) {
                const file = input.files[0];
                const result = this.validate(file, rules[fieldName], data);
                
                if (!result.isValid) {
                    errors[fieldName] = result.errors;
                    isValid = false;
                    this.showFieldError(formElement, fieldName, result.errors[0]);
                }
            }
        });
        
        return {
            isValid,
            errors,
            data
        };
    }
    
    validateField(fieldElement, rules, formData = {}) {
        const value = fieldElement.type === 'file' ? 
            (fieldElement.files.length > 0 ? fieldElement.files[0] : null) : 
            fieldElement.value;
        
        const result = this.validate(value, rules, formData);
        
        this.clearFieldError(fieldElement);
        
        if (!result.isValid) {
            this.showFieldError(fieldElement.form, fieldElement.name, result.errors[0]);
        }
        
        return result;
    }
    
    parseRules(rulesString) {
        return rulesString.split('|').map(rule => {
            const [name, ...paramsParts] = rule.split(':');
            const params = paramsParts.length > 0 ? 
                paramsParts.join(':').split(',').map(p => p.trim()) : [];
            return { name: name.trim(), params };
        });
    }
    
    formatMessage(ruleName, params = []) {
        let message = this.messages[ruleName] || this.messages.custom;
        
        // Replace placeholders
        params.forEach((param, index) => {
            const placeholder = index === 0 ? '{min}' : index === 1 ? '{max}' : `{${index}}`;
            message = message.replace(placeholder, param);
        });
        
        return message;
    }
    
    showFieldError(formElement, fieldName, message) {
        const field = formElement.querySelector(`[name="${fieldName}"]`);
        if (!field) return;
        
        // Add error class to field
        field.classList.add('error');
        
        // Find or create error message element
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    clearFieldError(fieldElement) {
        fieldElement.classList.remove('error');
        const errorElement = fieldElement.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
    
    clearFormErrors(formElement) {
        // Remove error classes
        formElement.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
        
        // Hide error messages
        formElement.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });
    }
    
    // Real-time validation setup
    setupRealTimeValidation(formElement, rules) {
        Object.keys(rules).forEach(fieldName => {
            const field = formElement.querySelector(`[name="${fieldName}"]`);
            if (!field) return;
            
            const validateField = () => {
                const formData = new FormData(formElement);
                const data = Object.fromEntries(formData.entries());
                this.validateField(field, rules[fieldName], data);
            };
            
            // Validate on blur
            field.addEventListener('blur', validateField);
            
            // Validate on input for certain field types
            if (['text', 'email', 'password', 'number'].includes(field.type)) {
                let timeout;
                field.addEventListener('input', () => {
                    clearTimeout(timeout);
                    timeout = setTimeout(validateField, 500); // Debounce
                });
            }
            
            // Validate on change for select and file inputs
            if (['select-one', 'file'].includes(field.type)) {
                field.addEventListener('change', validateField);
            }
        });
    }
    
    // Utility methods
    parseSize(sizeString) {
        const units = {
            'B': 1,
            'KB': 1024,
            'MB': 1024 * 1024,
            'GB': 1024 * 1024 * 1024
        };
        
        const match = sizeString.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/i);
        if (!match) return 0;
        
        const [, size, unit] = match;
        return parseFloat(size) * (units[unit.toUpperCase()] || 1);
    }
    
    // Common validation patterns
    patterns = {
        dni: /^\d{8}$/,
        ruc: /^\d{11}$/,
        creditCard: /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/,
        postalCode: /^\d{5}$/,
        strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        username: /^[a-zA-Z0-9_]{3,20}$/,
        slug: /^[a-z0-9-]+$/,
        hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        ipAddress: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    };
    
    // Predefined rule sets
    rulesets = {
        user: {
            name: 'required|alpha|minLength:2|maxLength:50',
            email: 'required|email',
            password: 'required|minLength:8',
            confirmPassword: 'required|same:password'
        },
        product: {
            name: 'required|minLength:2|maxLength:100',
            price: 'required|decimal|positive',
            stock: 'required|integer|min:0',
            category: 'required'
        },
        client: {
            name: 'required|alpha|minLength:2|maxLength:100',
            email: 'email',
            phone: 'phone',
            dni: 'pattern:^\\d{8}$',
            address: 'maxLength:200'
        },
        sale: {
            clientId: 'required',
            products: 'required',
            total: 'required|decimal|positive',
            paymentMethod: 'required'
        }
    };
    
    getRuleset(name) {
        return this.rulesets[name] || {};
    }
    
    // Async validation support
    async validateAsync(value, asyncValidator) {
        try {
            const result = await asyncValidator(value);
            return {
                isValid: result,
                errors: result ? [] : ['Validation failed']
            };
        } catch (error) {
            return {
                isValid: false,
                errors: [error.message || 'Validation error']
            };
        }
    }
    
    // Custom validators for business logic
    createUniqueValidator(checkFunction, message = 'Este valor ya existe') {
        return async (value) => {
            if (!value) return true;
            try {
                const exists = await checkFunction(value);
                return !exists;
            } catch {
                return false;
            }
        };
    }
}

// Create global instance
const Validator = new ValidationService();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValidationService;
} else {
    window.ValidationService = ValidationService;
    window.Validator = Validator;
}