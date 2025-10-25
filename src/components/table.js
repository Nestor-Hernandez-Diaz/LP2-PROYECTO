/**
 * Table Component
 * Reusable table with sorting, pagination, and filtering
 */
class DataTable {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.options = {
            data: [],
            columns: [],
            pageSize: 10,
            sortable: true,
            filterable: true,
            pageable: true,
            selectable: false,
            searchable: true,
            exportable: false,
            className: 'data-table',
            emptyMessage: 'No hay datos disponibles',
            loadingMessage: 'Cargando...',
            ...options
        };
        
        this.currentPage = 1;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.filters = {};
        this.searchTerm = '';
        this.selectedRows = new Set();
        this.isLoading = false;
        
        this.onRowClick = null;
        this.onRowSelect = null;
        this.onSort = null;
        this.onFilter = null;
        this.onPageChange = null;
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            console.warn(`Container with ID "${this.containerId}" not found`);
            return;
        }
        
        this.render();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="table-container">
                ${this.options.searchable ? this.renderSearchBar() : ''}
                ${this.options.filterable ? this.renderFilters() : ''}
                <div class="table-wrapper">
                    ${this.renderTable()}
                </div>
                ${this.options.pageable ? this.renderPagination() : ''}
            </div>
        `;
        
        this.setupEventListeners();
    }
    
    renderSearchBar() {
        return `
            <div class="table-search">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Buscar..." class="search-input">
                </div>
                ${this.options.exportable ? '<button class="btn btn-outline export-btn"><i class="fas fa-download"></i> Exportar</button>' : ''}
            </div>
        `;
    }
    
    renderFilters() {
        return `
            <div class="table-filters">
                ${this.options.columns
                    .filter(col => col.filterable)
                    .map(col => `
                        <div class="filter-group">
                            <label>${col.title}</label>
                            ${this.renderFilterInput(col)}
                        </div>
                    `).join('')}
            </div>
        `;
    }
    
    renderFilterInput(column) {
        switch (column.filterType) {
            case 'select':
                return `
                    <select class="filter-select" data-column="${column.key}">
                        <option value="">Todos</option>
                        ${column.filterOptions?.map(opt => 
                            `<option value="${opt.value}">${opt.label}</option>`
                        ).join('') || ''}
                    </select>
                `;
            case 'date':
                return `<input type="date" class="filter-input" data-column="${column.key}">`;
            case 'number':
                return `<input type="number" class="filter-input" data-column="${column.key}" placeholder="Filtrar por ${column.title}">`;
            default:
                return `<input type="text" class="filter-input" data-column="${column.key}" placeholder="Filtrar por ${column.title}">`;
        }
    }
    
    renderTable() {
        const filteredData = this.getFilteredData();
        const paginatedData = this.options.pageable ? 
            this.getPaginatedData(filteredData) : filteredData;
        
        return `
            <table class="${this.options.className}">
                <thead>
                    <tr>
                        ${this.options.selectable ? '<th class="select-column"><input type="checkbox" class="select-all"></th>' : ''}
                        ${this.options.columns.map(col => `
                            <th class="${col.sortable !== false && this.options.sortable ? 'sortable' : ''} ${this.sortColumn === col.key ? 'sorted ' + this.sortDirection : ''}" 
                                data-column="${col.key}">
                                ${col.title}
                                ${col.sortable !== false && this.options.sortable ? '<i class="fas fa-sort"></i>' : ''}
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${this.isLoading ? this.renderLoadingRow() : 
                      paginatedData.length === 0 ? this.renderEmptyRow() : 
                      paginatedData.map((row, index) => this.renderRow(row, index)).join('')}
                </tbody>
            </table>
        `;
    }
    
    renderRow(row, index) {
        const isSelected = this.selectedRows.has(row.id || index);
        return `
            <tr class="${isSelected ? 'selected' : ''}" data-id="${row.id || index}">
                ${this.options.selectable ? `<td class="select-column"><input type="checkbox" class="row-select" ${isSelected ? 'checked' : ''}></td>` : ''}
                ${this.options.columns.map(col => `
                    <td class="${col.className || ''}" data-column="${col.key}">
                        ${this.renderCell(row, col)}
                    </td>
                `).join('')}
            </tr>
        `;
    }
    
    renderCell(row, column) {
        const value = this.getNestedValue(row, column.key);
        
        if (column.render) {
            return column.render(value, row);
        }
        
        switch (column.type) {
            case 'currency':
                return this.formatCurrency(value);
            case 'date':
                return this.formatDate(value);
            case 'datetime':
                return this.formatDateTime(value);
            case 'badge':
                return `<span class="badge badge-${column.badgeClass ? column.badgeClass(value) : 'primary'}">${value}</span>`;
            case 'actions':
                return column.actions?.map(action => 
                    `<button class="btn btn-sm btn-${action.type || 'primary'} action-btn" 
                             data-action="${action.name}" 
                             data-id="${row.id}" 
                             title="${action.title || action.name}">
                        <i class="${action.icon}"></i>
                    </button>`
                ).join(' ') || '';
            default:
                return value || '';
        }
    }
    
    renderLoadingRow() {
        const colSpan = this.options.columns.length + (this.options.selectable ? 1 : 0);
        return `
            <tr class="loading-row">
                <td colspan="${colSpan}" class="text-center">
                    <div class="loader"></div>
                    ${this.options.loadingMessage}
                </td>
            </tr>
        `;
    }
    
    renderEmptyRow() {
        const colSpan = this.options.columns.length + (this.options.selectable ? 1 : 0);
        return `
            <tr class="empty-row">
                <td colspan="${colSpan}" class="text-center">
                    <i class="fas fa-inbox"></i>
                    ${this.options.emptyMessage}
                </td>
            </tr>
        `;
    }
    
    renderPagination() {
        const filteredData = this.getFilteredData();
        const totalPages = Math.ceil(filteredData.length / this.options.pageSize);
        const startItem = (this.currentPage - 1) * this.options.pageSize + 1;
        const endItem = Math.min(this.currentPage * this.options.pageSize, filteredData.length);
        
        return `
            <div class="table-pagination">
                <div class="pagination-info">
                    Mostrando ${startItem}-${endItem} de ${filteredData.length} registros
                </div>
                <div class="pagination-controls">
                    <button class="btn btn-sm pagination-btn" data-page="prev" ${this.currentPage === 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    ${this.renderPageNumbers(totalPages)}
                    <button class="btn btn-sm pagination-btn" data-page="next" ${this.currentPage === totalPages ? 'disabled' : ''}>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="pagination-size">
                    <select class="page-size-select">
                        <option value="10" ${this.options.pageSize === 10 ? 'selected' : ''}>10</option>
                        <option value="25" ${this.options.pageSize === 25 ? 'selected' : ''}>25</option>
                        <option value="50" ${this.options.pageSize === 50 ? 'selected' : ''}>50</option>
                        <option value="100" ${this.options.pageSize === 100 ? 'selected' : ''}>100</option>
                    </select>
                </div>
            </div>
        `;
    }
    
    renderPageNumbers(totalPages) {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        
        for (let i = start; i <= end; i++) {
            pages.push(`
                <button class="btn btn-sm pagination-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `);
        }
        
        return pages.join('');
    }
    
    setupEventListeners() {
        // Search
        const searchInput = this.container.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.currentPage = 1;
                this.updateTable();
            });
        }
        
        // Filters
        this.container.querySelectorAll('.filter-input, .filter-select').forEach(input => {
            input.addEventListener('change', (e) => {
                const column = e.target.dataset.column;
                this.filters[column] = e.target.value;
                this.currentPage = 1;
                this.updateTable();
                if (this.onFilter) this.onFilter(this.filters);
            });
        });
        
        // Sorting
        this.container.querySelectorAll('th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.dataset.column;
                if (this.sortColumn === column) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortColumn = column;
                    this.sortDirection = 'asc';
                }
                this.updateTable();
                if (this.onSort) this.onSort(this.sortColumn, this.sortDirection);
            });
        });
        
        // Row selection
        const selectAll = this.container.querySelector('.select-all');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                this.container.querySelectorAll('.row-select').forEach(checkbox => {
                    checkbox.checked = isChecked;
                    const row = checkbox.closest('tr');
                    const id = row.dataset.id;
                    if (isChecked) {
                        this.selectedRows.add(id);
                        row.classList.add('selected');
                    } else {
                        this.selectedRows.delete(id);
                        row.classList.remove('selected');
                    }
                });
                if (this.onRowSelect) this.onRowSelect(Array.from(this.selectedRows));
            });
        }
        
        // Individual row selection
        this.container.addEventListener('change', (e) => {
            if (e.target.classList.contains('row-select')) {
                const row = e.target.closest('tr');
                const id = row.dataset.id;
                if (e.target.checked) {
                    this.selectedRows.add(id);
                    row.classList.add('selected');
                } else {
                    this.selectedRows.delete(id);
                    row.classList.remove('selected');
                }
                if (this.onRowSelect) this.onRowSelect(Array.from(this.selectedRows));
            }
        });
        
        // Row click
        this.container.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            if (row && !e.target.closest('input, button, .action-btn') && this.onRowClick) {
                const id = row.dataset.id;
                const data = this.options.data.find(item => (item.id || this.options.data.indexOf(item)) == id);
                this.onRowClick(data, row);
            }
        });
        
        // Action buttons
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn')) {
                const btn = e.target.closest('.action-btn');
                const action = btn.dataset.action;
                const id = btn.dataset.id;
                const data = this.options.data.find(item => item.id == id);
                
                const actionConfig = this.options.columns
                    .find(col => col.type === 'actions')?.actions
                    ?.find(a => a.name === action);
                
                if (actionConfig && actionConfig.handler) {
                    actionConfig.handler(data, id);
                }
            }
        });
        
        // Pagination
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.pagination-btn')) {
                const btn = e.target.closest('.pagination-btn');
                const page = btn.dataset.page;
                
                if (page === 'prev' && this.currentPage > 1) {
                    this.currentPage--;
                } else if (page === 'next') {
                    const totalPages = Math.ceil(this.getFilteredData().length / this.options.pageSize);
                    if (this.currentPage < totalPages) {
                        this.currentPage++;
                    }
                } else if (!isNaN(page)) {
                    this.currentPage = parseInt(page);
                }
                
                this.updateTable();
                if (this.onPageChange) this.onPageChange(this.currentPage);
            }
        });
        
        // Page size change
        const pageSizeSelect = this.container.querySelector('.page-size-select');
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                this.options.pageSize = parseInt(e.target.value);
                this.currentPage = 1;
                this.updateTable();
            });
        }
        
        // Export
        const exportBtn = this.container.querySelector('.export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportToCSV();
            });
        }
    }
    
    // Data methods
    setData(data) {
        this.options.data = data;
        this.currentPage = 1;
        this.selectedRows.clear();
        this.updateTable();
    }
    
    addRow(row) {
        this.options.data.push(row);
        this.updateTable();
    }
    
    updateRow(id, newData) {
        const index = this.options.data.findIndex(item => item.id === id);
        if (index !== -1) {
            this.options.data[index] = { ...this.options.data[index], ...newData };
            this.updateTable();
        }
    }
    
    removeRow(id) {
        this.options.data = this.options.data.filter(item => item.id !== id);
        this.selectedRows.delete(id);
        this.updateTable();
    }
    
    getFilteredData() {
        let filtered = [...this.options.data];
        
        // Apply search
        if (this.searchTerm) {
            filtered = filtered.filter(row => {
                return this.options.columns.some(col => {
                    const value = this.getNestedValue(row, col.key);
                    return String(value).toLowerCase().includes(this.searchTerm.toLowerCase());
                });
            });
        }
        
        // Apply filters
        Object.keys(this.filters).forEach(column => {
            const filterValue = this.filters[column];
            if (filterValue) {
                filtered = filtered.filter(row => {
                    const value = this.getNestedValue(row, column);
                    return String(value).toLowerCase().includes(filterValue.toLowerCase());
                });
            }
        });
        
        // Apply sorting
        if (this.sortColumn) {
            filtered.sort((a, b) => {
                const aVal = this.getNestedValue(a, this.sortColumn);
                const bVal = this.getNestedValue(b, this.sortColumn);
                
                let comparison = 0;
                if (aVal < bVal) comparison = -1;
                if (aVal > bVal) comparison = 1;
                
                return this.sortDirection === 'desc' ? -comparison : comparison;
            });
        }
        
        return filtered;
    }
    
    getPaginatedData(data) {
        const start = (this.currentPage - 1) * this.options.pageSize;
        const end = start + this.options.pageSize;
        return data.slice(start, end);
    }
    
    updateTable() {
        const tableWrapper = this.container.querySelector('.table-wrapper');
        if (tableWrapper) {
            tableWrapper.innerHTML = this.renderTable();
        }
        
        const pagination = this.container.querySelector('.table-pagination');
        if (pagination && this.options.pageable) {
            pagination.outerHTML = this.renderPagination();
        }
        
        this.setupEventListeners();
    }
    
    // Utility methods
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    
    formatCurrency(value) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(value || 0);
    }
    
    formatDate(value) {
        if (!value) return '';
        return new Date(value).toLocaleDateString('es-PE');
    }
    
    formatDateTime(value) {
        if (!value) return '';
        return new Date(value).toLocaleString('es-PE');
    }
    
    exportToCSV() {
        const data = this.getFilteredData();
        const headers = this.options.columns
            .filter(col => col.type !== 'actions')
            .map(col => col.title);
        
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                this.options.columns
                    .filter(col => col.type !== 'actions')
                    .map(col => {
                        const value = this.getNestedValue(row, col.key);
                        return `"${String(value || '').replace(/"/g, '""')}"`;
                    })
                    .join(',')
            )
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${this.containerId}_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        this.updateTable();
    }
    
    getSelectedRows() {
        return Array.from(this.selectedRows);
    }
    
    clearSelection() {
        this.selectedRows.clear();
        this.container.querySelectorAll('.row-select').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.container.querySelectorAll('tr.selected').forEach(row => {
            row.classList.remove('selected');
        });
    }
    
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataTable;
}