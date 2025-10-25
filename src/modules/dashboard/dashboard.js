/**
 * ===== MÓDULO DEL DASHBOARD =====
 * Maneja la pantalla principal del sistema con estadísticas,
 * gráficos, actividad reciente y accesos rápidos
 */

class DashboardModule {
    constructor() {
        this.data = {
            stats: {},
            salesChart: null,
            topProducts: [],
            recentActivity: [],
            systemAlerts: []
        };
        
        this.refreshInterval = null;
        this.chartInstance = null;
    }

    /**
     * Inicializa el módulo del dashboard
     */
    init() {
        this.setupDOM();
        this.setupEventListeners();
        this.loadInitialData();
        this.startAutoRefresh();
        this.updateDateTime();
    }

    /**
     * Configura las referencias del DOM
     */
    setupDOM() {
        this.elements = {
            // Estadísticas
            todaySales: document.getElementById('todaySales'),
            todayOrders: document.getElementById('todayOrders'),
            totalProducts: document.getElementById('totalProducts'),
            totalCustomers: document.getElementById('totalCustomers'),
            
            // Cambios en estadísticas
            salesChange: document.getElementById('salesChange'),
            ordersChange: document.getElementById('ordersChange'),
            productsChange: document.getElementById('productsChange'),
            customersChange: document.getElementById('customersChange'),
            
            // Fecha y hora
            currentDate: document.getElementById('currentDate'),
            currentTime: document.getElementById('currentTime'),
            
            // Gráficos y listas
            salesChart: document.getElementById('salesChart'),
            salesPeriod: document.getElementById('salesPeriod'),
            topProductsList: document.getElementById('topProductsList'),
            activityList: document.getElementById('activityList'),
            alertsList: document.getElementById('alertsList'),
            alertCount: document.getElementById('alertCount'),
            
            // Botones y acciones
            newSaleBtn: document.getElementById('newSaleBtn'),
            quickSearchBtn: document.getElementById('quickSearchBtn'),
            refreshActivityBtn: document.getElementById('refreshActivityBtn'),
            
            // Modal de búsqueda
            quickSearchModal: document.getElementById('quickSearchModal'),
            quickSearchInput: document.getElementById('quickSearchInput'),
            searchResults: document.getElementById('searchResults'),
            closeQuickSearchBtn: document.getElementById('closeQuickSearchBtn'),
            
            // Filtros de búsqueda
            searchProducts: document.getElementById('searchProducts'),
            searchCustomers: document.getElementById('searchCustomers'),
            searchSales: document.getElementById('searchSales'),
            
            // Estado del sistema
            lastBackup: document.getElementById('lastBackup'),
            
            // Loader
            dashboardLoader: document.getElementById('dashboardLoader')
        };
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Botones principales
        this.elements.newSaleBtn?.addEventListener('click', () => this.navigateToSales());
        this.elements.quickSearchBtn?.addEventListener('click', () => this.showQuickSearch());
        this.elements.refreshActivityBtn?.addEventListener('click', () => this.refreshActivity());
        
        // Período de ventas
        this.elements.salesPeriod?.addEventListener('change', (e) => {
            this.updateSalesChart(e.target.value);
        });
        
        // Modal de búsqueda
        this.elements.closeQuickSearchBtn?.addEventListener('click', () => this.hideQuickSearch());
        this.elements.quickSearchInput?.addEventListener('input', (e) => {
            this.performQuickSearch(e.target.value);
        });
        
        // Filtros de búsqueda
        [this.elements.searchProducts, this.elements.searchCustomers, this.elements.searchSales]
            .forEach(checkbox => {
                checkbox?.addEventListener('change', () => {
                    this.performQuickSearch(this.elements.quickSearchInput.value);
                });
            });
        
        // Teclas de acceso rápido
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Cerrar modal con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.elements.quickSearchModal.classList.contains('hidden')) {
                this.hideQuickSearch();
            }
        });
        
        // Actualizar fecha/hora cada segundo
        setInterval(() => this.updateDateTime(), 1000);
    }

    /**
     * Carga los datos iniciales del dashboard
     */
    async loadInitialData() {
        this.showLoader();
        
        try {
            // Cargar datos en paralelo
            await Promise.all([
                this.loadStats(),
                this.loadSalesChart(),
                this.loadTopProducts(),
                this.loadRecentActivity(),
                this.loadSystemAlerts()
            ]);
            
            this.updateUI();
            
        } catch (error) {
            console.error('Error cargando datos del dashboard:', error);
            window.Utils.showNotification('Error cargando datos del dashboard', 'error');
        } finally {
            this.hideLoader();
        }
    }

    /**
     * Carga las estadísticas principales
     */
    async loadStats() {
        try {
            // Simular carga de datos (en producción sería una llamada a la API)
            await this.delay(500);
            
            this.data.stats = {
                todaySales: 2450.75,
                todayOrders: 28,
                totalProducts: 1250,
                totalCustomers: 342,
                changes: {
                    sales: { value: 12.5, type: 'positive' },
                    orders: { value: 8.2, type: 'positive' },
                    products: { value: 0, type: 'neutral' },
                    customers: { value: 5.1, type: 'positive' }
                }
            };
            
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    }

    /**
     * Carga los datos del gráfico de ventas
     */
    async loadSalesChart(period = 7) {
        try {
            await this.delay(300);
            
            // Generar datos simulados
            const days = period;
            const labels = [];
            const data = [];
            
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString('es-ES', { 
                    month: 'short', 
                    day: 'numeric' 
                }));
                
                // Generar ventas aleatorias
                data.push(Math.floor(Math.random() * 3000) + 1000);
            }
            
            this.data.salesChart = { labels, data };
            
        } catch (error) {
            console.error('Error cargando gráfico de ventas:', error);
        }
    }

    /**
     * Carga los productos más vendidos
     */
    async loadTopProducts() {
        try {
            await this.delay(400);
            
            this.data.topProducts = [
                {
                    id: 1,
                    name: 'Coca Cola 500ml',
                    category: 'Bebidas',
                    sales: 45,
                    amount: 135.00
                },
                {
                    id: 2,
                    name: 'Pan Integral',
                    category: 'Panadería',
                    sales: 38,
                    amount: 76.00
                },
                {
                    id: 3,
                    name: 'Leche Gloria 1L',
                    category: 'Lácteos',
                    sales: 32,
                    amount: 128.00
                },
                {
                    id: 4,
                    name: 'Arroz Superior 1kg',
                    category: 'Abarrotes',
                    sales: 28,
                    amount: 84.00
                },
                {
                    id: 5,
                    name: 'Aceite Primor 1L',
                    category: 'Abarrotes',
                    sales: 25,
                    amount: 125.00
                }
            ];
            
        } catch (error) {
            console.error('Error cargando productos más vendidos:', error);
        }
    }

    /**
     * Carga la actividad reciente
     */
    async loadRecentActivity() {
        try {
            await this.delay(350);
            
            this.data.recentActivity = [
                {
                    id: 1,
                    type: 'sale',
                    icon: '🛒',
                    text: 'Nueva venta por S/ 45.50',
                    time: '2 minutos',
                    user: 'Juan Pérez'
                },
                {
                    id: 2,
                    type: 'inventory',
                    icon: '📦',
                    text: 'Stock actualizado: Coca Cola 500ml',
                    time: '5 minutos',
                    user: 'Sistema'
                },
                {
                    id: 3,
                    type: 'user',
                    icon: '👤',
                    text: 'Nuevo cliente registrado: María García',
                    time: '12 minutos',
                    user: 'Ana López'
                },
                {
                    id: 4,
                    type: 'sale',
                    icon: '🛒',
                    text: 'Venta completada por S/ 128.75',
                    time: '18 minutos',
                    user: 'Carlos Ruiz'
                },
                {
                    id: 5,
                    type: 'inventory',
                    icon: '⚠️',
                    text: 'Stock bajo: Pan Integral (5 unidades)',
                    time: '25 minutos',
                    user: 'Sistema'
                }
            ];
            
        } catch (error) {
            console.error('Error cargando actividad reciente:', error);
        }
    }

    /**
     * Carga las alertas del sistema
     */
    async loadSystemAlerts() {
        try {
            await this.delay(200);
            
            this.data.systemAlerts = [
                {
                    id: 1,
                    type: 'warning',
                    icon: '⚠️',
                    title: 'Stock Bajo',
                    description: '5 productos con stock menor a 10 unidades'
                },
                {
                    id: 2,
                    type: 'info',
                    icon: 'ℹ️',
                    title: 'Actualización Disponible',
                    description: 'Nueva versión del sistema disponible'
                },
                {
                    id: 3,
                    type: 'error',
                    icon: '❌',
                    title: 'Error de Conexión',
                    description: 'Problemas intermitentes con el servidor de respaldos'
                }
            ];
            
        } catch (error) {
            console.error('Error cargando alertas del sistema:', error);
        }
    }

    /**
     * Actualiza la interfaz con los datos cargados
     */
    updateUI() {
        this.updateStats();
        this.updateSalesChart();
        this.updateTopProducts();
        this.updateRecentActivity();
        this.updateSystemAlerts();
        this.updateSystemStatus();
    }

    /**
     * Actualiza las estadísticas en la UI
     */
    updateStats() {
        const { stats } = this.data;
        
        if (this.elements.todaySales) {
            this.elements.todaySales.textContent = window.Utils.formatCurrency(stats.todaySales);
        }
        
        if (this.elements.todayOrders) {
            this.elements.todayOrders.textContent = stats.todayOrders.toString();
        }
        
        if (this.elements.totalProducts) {
            this.elements.totalProducts.textContent = stats.totalProducts.toLocaleString();
        }
        
        if (this.elements.totalCustomers) {
            this.elements.totalCustomers.textContent = stats.totalCustomers.toString();
        }
        
        // Actualizar cambios
        this.updateStatChange(this.elements.salesChange, stats.changes.sales);
        this.updateStatChange(this.elements.ordersChange, stats.changes.orders);
        this.updateStatChange(this.elements.productsChange, stats.changes.products);
        this.updateStatChange(this.elements.customersChange, stats.changes.customers);
    }

    /**
     * Actualiza un indicador de cambio de estadística
     */
    updateStatChange(element, change) {
        if (!element) return;
        
        const icon = element.querySelector('.change-icon');
        const text = element.querySelector('.change-text');
        
        // Limpiar clases anteriores
        element.classList.remove('positive', 'negative', 'neutral');
        element.classList.add(change.type);
        
        // Actualizar icono
        if (icon) {
            switch (change.type) {
                case 'positive':
                    icon.textContent = '↗';
                    break;
                case 'negative':
                    icon.textContent = '↘';
                    break;
                default:
                    icon.textContent = '→';
            }
        }
        
        // Actualizar texto
        if (text) {
            if (change.value === 0) {
                text.textContent = 'Sin cambios';
            } else {
                const sign = change.type === 'positive' ? '+' : change.type === 'negative' ? '-' : '';
                text.textContent = `${sign}${Math.abs(change.value)}%`;
            }
        }
    }

    /**
     * Actualiza el gráfico de ventas
     */
    updateSalesChart(period = 7) {
        if (!this.elements.salesChart) return;
        
        // Destruir gráfico anterior si existe
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }
        
        // Cargar nuevos datos si es necesario
        if (period !== 7) {
            this.loadSalesChart(period).then(() => {
                this.renderSalesChart();
            });
        } else {
            this.renderSalesChart();
        }
    }

    /**
     * Renderiza el gráfico de ventas
     */
    renderSalesChart() {
        if (!this.elements.salesChart || !this.data.salesChart) return;
        
        const ctx = this.elements.salesChart.getContext('2d');
        
        // Crear gradiente
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0.02)');
        
        // Configuración del gráfico (usando Chart.js si está disponible)
        if (typeof Chart !== 'undefined') {
            this.chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.data.salesChart.labels,
                    datasets: [{
                        label: 'Ventas (S/)',
                        data: this.data.salesChart.data,
                        borderColor: 'rgb(37, 99, 235)',
                        backgroundColor: gradient,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: 'rgb(37, 99, 235)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return 'S/ ' + value.toLocaleString();
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });
        } else {
            // Fallback: gráfico simple con canvas
            this.renderSimpleChart(ctx);
        }
    }

    /**
     * Renderiza un gráfico simple sin librerías externas
     */
    renderSimpleChart(ctx) {
        const { labels, data } = this.data.salesChart;
        const canvas = ctx.canvas;
        const width = canvas.width;
        const height = canvas.height;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);
        
        // Configuración
        const padding = 40;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);
        
        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);
        const valueRange = maxValue - minValue;
        
        // Dibujar líneas de la grilla
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // Dibujar línea de datos
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        data.forEach((value, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Dibujar puntos
        ctx.fillStyle = '#2563eb';
        data.forEach((value, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    /**
     * Actualiza la lista de productos más vendidos
     */
    updateTopProducts() {
        if (!this.elements.topProductsList) return;
        
        const html = this.data.topProducts.map((product, index) => `
            <div class="product-item">
                <div class="product-info">
                    <div class="product-rank">${index + 1}</div>
                    <div class="product-details">
                        <h4>${product.name}</h4>
                        <p>${product.category}</p>
                    </div>
                </div>
                <div class="product-sales">
                    <div class="sales-count">${product.sales} ventas</div>
                    <div class="sales-amount">${window.Utils.formatCurrency(product.amount)}</div>
                </div>
            </div>
        `).join('');
        
        this.elements.topProductsList.innerHTML = html;
    }

    /**
     * Actualiza la lista de actividad reciente
     */
    updateRecentActivity() {
        if (!this.elements.activityList) return;
        
        const html = this.data.recentActivity.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    ${activity.icon}
                </div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">Hace ${activity.time}</div>
                </div>
            </div>
        `).join('');
        
        this.elements.activityList.innerHTML = html;
    }

    /**
     * Actualiza las alertas del sistema
     */
    updateSystemAlerts() {
        if (!this.elements.alertsList || !this.elements.alertCount) return;
        
        // Actualizar contador
        this.elements.alertCount.textContent = this.data.systemAlerts.length;
        
        // Actualizar lista
        const html = this.data.systemAlerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">${alert.icon}</div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description}</div>
                </div>
            </div>
        `).join('');
        
        this.elements.alertsList.innerHTML = html;
    }

    /**
     * Actualiza el estado del sistema
     */
    updateSystemStatus() {
        if (this.elements.lastBackup) {
            // Simular última fecha de respaldo
            const lastBackupDate = new Date();
            lastBackupDate.setHours(lastBackupDate.getHours() - 2);
            
            this.elements.lastBackup.textContent = 
                `Último respaldo: ${lastBackupDate.toLocaleString('es-ES')}`;
        }
    }

    /**
     * Actualiza fecha y hora
     */
    updateDateTime() {
        const now = new Date();
        
        if (this.elements.currentDate) {
            this.elements.currentDate.textContent = now.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        if (this.elements.currentTime) {
            this.elements.currentTime.textContent = now.toLocaleTimeString('es-ES');
        }
    }

    /**
     * Inicia la actualización automática
     */
    startAutoRefresh() {
        // Actualizar cada 5 minutos
        this.refreshInterval = setInterval(() => {
            this.refreshData();
        }, 5 * 60 * 1000);
    }

    /**
     * Actualiza los datos automáticamente
     */
    async refreshData() {
        try {
            await this.loadStats();
            await this.loadRecentActivity();
            await this.loadSystemAlerts();
            
            this.updateStats();
            this.updateRecentActivity();
            this.updateSystemAlerts();
            
        } catch (error) {
            console.error('Error en actualización automática:', error);
        }
    }

    /**
     * Actualiza manualmente la actividad
     */
    async refreshActivity() {
        const btn = this.elements.refreshActivityBtn;
        if (!btn) return;
        
        // Animación de rotación
        btn.style.transform = 'rotate(360deg)';
        btn.style.transition = 'transform 0.5s ease';
        
        try {
            await this.loadRecentActivity();
            this.updateRecentActivity();
            
            window.Utils.showNotification('Actividad actualizada', 'success');
            
        } catch (error) {
            window.Utils.showNotification('Error actualizando actividad', 'error');
        } finally {
            setTimeout(() => {
                btn.style.transform = '';
            }, 500);
        }
    }

    /**
     * Navega a la página de ventas
     */
    navigateToSales() {
        window.Router.navigate('/sales');
    }

    /**
     * Muestra el modal de búsqueda rápida
     */
    showQuickSearch() {
        if (this.elements.quickSearchModal) {
            window.Utils.showModal('quickSearchModal');
            this.elements.quickSearchInput.focus();
        }
    }

    /**
     * Oculta el modal de búsqueda rápida
     */
    hideQuickSearch() {
        if (this.elements.quickSearchModal) {
            window.Utils.hideModal('quickSearchModal');
            this.elements.quickSearchInput.value = '';
            this.elements.searchResults.innerHTML = '';
        }
    }

    /**
     * Realiza búsqueda rápida
     */
    async performQuickSearch(query) {
        if (!query.trim()) {
            this.elements.searchResults.innerHTML = '';
            return;
        }
        
        // Obtener filtros activos
        const filters = {
            products: this.elements.searchProducts.checked,
            customers: this.elements.searchCustomers.checked,
            sales: this.elements.searchSales.checked
        };
        
        try {
            // Simular búsqueda
            await this.delay(300);
            
            const results = this.mockSearch(query, filters);
            this.displaySearchResults(results);
            
        } catch (error) {
            console.error('Error en búsqueda rápida:', error);
        }
    }

    /**
     * Simula búsqueda (en producción sería una llamada a la API)
     */
    mockSearch(query, filters) {
        const results = [];
        
        if (filters.products) {
            results.push(
                { type: 'product', icon: '📦', title: 'Coca Cola 500ml', subtitle: 'Bebidas - Stock: 45' },
                { type: 'product', icon: '📦', title: 'Pan Integral', subtitle: 'Panadería - Stock: 12' }
            );
        }
        
        if (filters.customers) {
            results.push(
                { type: 'customer', icon: '👤', title: 'Juan Pérez', subtitle: 'Cliente frecuente' },
                { type: 'customer', icon: '👤', title: 'María García', subtitle: 'Nuevo cliente' }
            );
        }
        
        if (filters.sales) {
            results.push(
                { type: 'sale', icon: '🛒', title: 'Venta #001234', subtitle: 'S/ 45.50 - Hoy 14:30' }
            );
        }
        
        return results.filter(result => 
            result.title.toLowerCase().includes(query.toLowerCase())
        );
    }

    /**
     * Muestra los resultados de búsqueda
     */
    displaySearchResults(results) {
        if (results.length === 0) {
            this.elements.searchResults.innerHTML = `
                <div class="search-result-item">
                    <div class="search-result-content">
                        <div class="search-result-title">No se encontraron resultados</div>
                        <div class="search-result-subtitle">Intente con otros términos de búsqueda</div>
                    </div>
                </div>
            `;
            return;
        }
        
        const html = results.map(result => `
            <div class="search-result-item" onclick="window.DashboardModule.selectSearchResult('${result.type}', '${result.title}')">
                <div class="search-result-icon">${result.icon}</div>
                <div class="search-result-content">
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-subtitle">${result.subtitle}</div>
                </div>
            </div>
        `).join('');
        
        this.elements.searchResults.innerHTML = html;
    }

    /**
     * Selecciona un resultado de búsqueda
     */
    selectSearchResult(type, title) {
        this.hideQuickSearch();
        
        // Navegar según el tipo
        switch (type) {
            case 'product':
                window.Router.navigate('/inventory');
                break;
            case 'customer':
                window.Router.navigate('/customers');
                break;
            case 'sale':
                window.Router.navigate('/sales');
                break;
        }
        
        window.Utils.showNotification(`Navegando a ${title}`, 'info');
    }

    /**
     * Maneja atajos de teclado
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K para búsqueda rápida
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.showQuickSearch();
        }
        
        // F5 para actualizar
        if (e.key === 'F5') {
            e.preventDefault();
            this.refreshData();
        }
    }

    /**
     * Muestra el loader
     */
    showLoader() {
        if (this.elements.dashboardLoader) {
            this.elements.dashboardLoader.classList.remove('hidden');
        }
    }

    /**
     * Oculta el loader
     */
    hideLoader() {
        if (this.elements.dashboardLoader) {
            this.elements.dashboardLoader.classList.add('hidden');
        }
    }

    /**
     * Función auxiliar para delays
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Destruye el módulo
     */
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }
    }
}

// Exportar clase para uso del sistema de módulos
window.DashboardModule = DashboardModule;