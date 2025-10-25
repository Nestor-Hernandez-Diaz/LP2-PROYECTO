/**
 * Router Simple para Sistema Minimarket LP2
 * Maneja la navegación entre módulos
 */

class SimpleRouter {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.defaultRoute = '/dashboard';
    }

    /**
     * Agregar una ruta
     */
    addRoute(path, handler) {
        this.routes.set(path, handler);
    }

    /**
     * Navegar a una ruta
     */
    navigate(path) {
        window.location.hash = path;
        this.handleRoute();
    }

    /**
     * Manejar cambio de ruta
     */
    handleRoute() {
        const hash = window.location.hash.slice(1) || this.defaultRoute;
        const handler = this.routes.get(hash);
        
        if (handler) {
            this.currentRoute = hash;
            handler();
        } else {
            // Ruta no encontrada, ir al dashboard
            this.navigate(this.defaultRoute);
        }
    }

    /**
     * Obtener ruta actual
     */
    getCurrentRoute() {
        return this.currentRoute;
    }
}

// Crear instancia global
const Router = new SimpleRouter();

// Hacer disponible globalmente
window.Router = Router;

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Router;
}