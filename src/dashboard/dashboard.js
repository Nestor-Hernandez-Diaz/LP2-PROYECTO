// Configuración del dashboard
const DASHBOARD_CONFIG = {
    modules: {
        dashboard: { title: 'Dashboard', file: null },
        sales: { title: 'Ventas', file: 'src/modules/sales/sales.js' },
        inventory: { title: 'Inventario', file: 'src/modules/inventory/inventory.js' },
        purchases: { title: 'Compras', file: 'src/modules/purchases/purchases.js' },
        quotes: { title: 'Cotizaciones', file: 'src/modules/quotes/quotes.js' },
        cash: { title: 'Caja', file: 'src/modules/cash/cash.js' },
        users: { title: 'Usuarios', file: 'src/modules/users/users.js' },
        settings: { title: 'Configuración', file: 'src/modules/settings/settings.js' }
    }
};

// Elementos del DOM
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
const logoutBtn = document.getElementById('logout-btn');
const usernameDisplay = document.getElementById('username-display');
const currentModuleTitle = document.getElementById('current-module-title');
const moduleContent = document.getElementById('module-content');
const navLinks = document.querySelectorAll('.nav-link');

// Estado actual
let currentModule = 'dashboard';

// Inicialización
document.addEventListener('DOMContentLoaded', initDashboard);

/**
 * Inicializa el dashboard
 */
function initDashboard() {
    // Verificar autenticación
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Configurar usuario
    setupUser();
    
    // Configurar eventos
    setupEventListeners();
    
    // Cargar módulo inicial
    loadModule('dashboard');
}

/**
 * Verifica si el usuario está autenticado
 */
function isAuthenticated() {
    return sessionStorage.getItem('isAuthenticated') === 'true';
}

/**
 * Configura la información del usuario
 */
function setupUser() {
    const username = sessionStorage.getItem('username') || 'Usuario';
    usernameDisplay.textContent = username;
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
    // Toggle del menú móvil
    menuToggle.addEventListener('click', toggleSidebar);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navegación
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Cerrar sidebar en móvil al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });
}

/**
 * Alterna la visibilidad del sidebar en móvil
 */
function toggleSidebar() {
    sidebar.classList.toggle('active');
}

/**
 * Maneja el logout
 */
function handleLogout() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
}

/**
 * Maneja la navegación entre módulos
 */
function handleNavigation(event) {
    event.preventDefault();
    
    const moduleId = event.currentTarget.getAttribute('data-module');
    loadModule(moduleId);
    
    // Cerrar sidebar en móvil
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
    }
}

/**
 * Carga un módulo específico
 */
function loadModule(moduleId) {
    if (!DASHBOARD_CONFIG.modules[moduleId]) {
        console.error(`Módulo ${moduleId} no encontrado`);
        return;
    }
    
    const module = DASHBOARD_CONFIG.modules[moduleId];
    
    // Actualizar estado
    currentModule = moduleId;
    
    // Actualizar título
    currentModuleTitle.textContent = module.title;
    
    // Actualizar navegación activa
    updateActiveNavigation(moduleId);
    
    // Cargar contenido del módulo
    loadModuleContent(moduleId, module);
}

/**
 * Actualiza la navegación activa
 */
function updateActiveNavigation(moduleId) {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-module') === moduleId) {
            link.classList.add('active');
        }
    });
}

/**
 * Carga el contenido del módulo
 */
function loadModuleContent(moduleId, module) {
    // Limpiar contenido anterior
    moduleContent.innerHTML = '';
    
    if (moduleId === 'dashboard') {
        // Contenido especial para dashboard
        moduleContent.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h3>Panel de Control Principal</h3>
                <p>Aquí se mostrarán las estadísticas y resumen general del sistema.</p>
                <p style="margin-top: 20px; color: #7f8c8d;">
                    <strong>Nota para el equipo:</strong> Este espacio está listo para implementar 
                    widgets, gráficos y métricas del negocio.
                </p>
            </div>
        `;
    } else {
        // Contenido placeholder para otros módulos
        moduleContent.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h3>Módulo: ${module.title}</h3>
                <p>Este módulo está listo para ser desarrollado por el equipo.</p>
                <p style="margin-top: 20px; color: #7f8c8d;">
                    <strong>Archivo del módulo:</strong> ${module.file || 'No definido'}
                </p>
                <div style="margin-top: 30px; padding: 20px; background: #e8f4f8; border-radius: 6px;">
                    <strong>Instrucciones para el desarrollador:</strong><br>
                    1. Implementar la lógica en: <code>${module.file}</code><br>
                    2. Crear las vistas HTML necesarias<br>
                    3. Conectar con la API del backend<br>
                    4. Agregar validaciones y manejo de errores
                </div>
            </div>
        `;
    }
    
    // TODO: Aquí se puede agregar lógica para cargar dinámicamente 
    // los archivos JavaScript de cada módulo cuando estén implementados
    if (module.file && moduleId !== 'dashboard') {
        loadModuleScript(module.file);
    }
}

/**
 * Carga dinámicamente el script de un módulo
 */
function loadModuleScript(scriptPath) {
    // Verificar si el script ya está cargado
    const existingScript = document.querySelector(`script[src="${scriptPath}"]`);
    if (existingScript) {
        return;
    }
    
    // Crear y cargar el script
    const script = document.createElement('script');
    script.src = scriptPath;
    script.onload = () => {
        console.log(`Módulo cargado: ${scriptPath}`);
        // Aquí se puede llamar a una función de inicialización del módulo
    };
    script.onerror = () => {
        console.log(`Módulo no encontrado: ${scriptPath} (normal en desarrollo)`);
    };
    
    document.head.appendChild(script);
}

// Exponer funciones globales para uso de módulos
window.DashboardAPI = {
    getCurrentModule: () => currentModule,
    loadModule: loadModule,
    updateModuleContent: (content) => {
        moduleContent.innerHTML = content;
    }
};