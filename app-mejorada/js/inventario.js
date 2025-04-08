/**
 * Módulo de Inventario para gestionar stock de productos
 */

const Inventario = {
    // Estado del módulo
    state: {
        productoEditando: null,
        filtros: {
            tipo: '',
            lote: '',
            busqueda: ''
        },
        productosRegistrados: [
            { 
                id: 'sal', 
                nombre: 'SAL', 
                unidad: 'Kg', 
                presentacion: 25, 
                descripcion: 'Sal en presentación de 25Kg'
            },
            { 
                id: 'hidral70', 
                nombre: 'HIDRAL-70', 
                unidad: 'Kg', 
                presentacion: 6, 
                descripcion: 'Hidral-70 en presentación de 6Kg'
            },
            { 
                id: 'hydromar4', 
                nombre: 'HYDROMAR-4', 
                unidad: 'L', 
                presentacion: 25, 
                descripcion: 'Hydromar-4 en presentación de 25L'
            },
            { 
                id: 'antiespumante', 
                nombre: 'ANTIESPUMANTE', 
                unidad: 'L', 
                presentacion: 25, 
                descripcion: 'Antiespumante en presentación de 25L'
            }
        ]
    },

    // Inicializar módulo
    init() {
        // Cargar plantilla de inventario
        this.loadTemplate();
        
        // Escuchar eventos de cambio de sección
        document.addEventListener('sectionChanged', (event) => {
            if (event.detail.section === 'inventario') {
                this.mostrarInventario();
            }
        });
        
        // Escuchar eventos de modificación de elaboraciones
        document.addEventListener('elaboracionActualizada', (event) => {
            if (event.detail && event.detail.elaboracion && event.detail.elaboracionAnterior) {
                this.procesarActualizacionElaboracion(
                    event.detail.elaboracion,
                    event.detail.elaboracionAnterior
                );
            }
        });
        
        // Escuchar eventos de actualización de inventario
        document.addEventListener('inventarioActualizado', () => {
            const seccionActiva = document.querySelector('.content-section.active');
            if (seccionActiva && seccionActiva.id === 'inventario') {
                this.mostrarInventario();
            }
        });
    },

    // Cargar plantilla HTML en la sección
    loadTemplate() {
        const template = `
            <div class="container-fluid">
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center">
                            <h2 class="section-title">Inventario</h2>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-12 mb-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Nuevo Ingreso de Productos</h5>
                                <form id="formNuevoIngreso" class="row">
                                    <div class="col-md-3 mb-3">
                                        <label for="fechaIngreso" class="form-label">Fecha</label>
                                        <input type="date" class="form-control" id="fechaIngreso" required value="${new Date().toISOString().split('T')[0]}">
                                    </div>
                                    <div class="col-md-3 mb-3">
                                        <label for="productoIngreso" class="form-label">Producto</label>
                                        <select class="form-select" id="productoIngreso" required>
                                            <option value="">Seleccione un producto</option>
                                            <option value="sal">SAL</option>
                                            <option value="hidral70">HIDRAL-70</option>
                                            <option value="hydromar4">HYDROMAR-4</option>
                                            <option value="antiespumante">ANTIESPUMANTE</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3 mb-3">
                                        <label for="proveedorIngreso" class="form-label">Proveedor</label>
                                        <input type="text" class="form-control" id="proveedorIngreso">
                                    </div>
                                    <div class="col-md-3 mb-3">
                                        <label for="numLoteIngreso" class="form-label">Número de Lote</label>
                                        <input type="text" class="form-control" id="numLoteIngreso" required>
                                    </div>
                                    <div class="col-md-3 mb-3">
                                        <label for="cantidadIngreso" class="form-label">Cantidad (Kg/L)</label>
                                        <input type="number" step="0.1" min="0.1" class="form-control" id="cantidadIngreso" required>
                                        <div class="form-text" id="infoProducto"></div>
                                    </div>
                                    <div class="col-md-3 mb-3">
                                        <label for="unidadesCalculadas" class="form-label">Equivalente en unidades</label>
                                        <input type="text" class="form-control" id="unidadesCalculadas" readonly>
                                    </div>
                                    <div class="col-md-3 mb-3">
                                        <label for="ubicacionIngreso" class="form-label">Ubicación</label>
                                        <input type="text" class="form-control" id="ubicacionIngreso" placeholder="Almacén, estantería...">
                                    </div>
                                    <div class="col-md-9 mb-3">
                                        <label for="observacionesIngreso" class="form-label">Observaciones</label>
                                        <textarea class="form-control" id="observacionesIngreso" rows="1"></textarea>
                                    </div>
                                    <div class="col-md-3 mb-3 d-flex align-items-end">
                                        <button type="submit" class="btn btn-primary w-100">Registrar Ingreso</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-12 mb-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Stock Actual</h5>
                                <div id="stockActual">
                                    <!-- El stock se cargará dinámicamente -->
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Movimientos de Inventario</h5>
                                
                                <div class="row mb-3 filtros-container">
                                    <div class="col-md-3">
                                        <label for="filtroTipoMovimiento" class="form-label">Tipo de movimiento</label>
                                        <select class="form-select" id="filtroTipoMovimiento">
                                            <option value="">Todos</option>
                                            <option value="entrada">Entradas</option>
                                            <option value="salida">Salidas</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label for="filtroLote" class="form-label">Filtrar por lote</label>
                                        <input type="text" class="form-control" id="filtroLote" placeholder="Número de lote...">
                                    </div>
                                    <div class="col-md-6">
                                        <label for="filtroBusquedaInventario" class="form-label">Buscar</label>
                                        <div class="input-group">
                                            <input type="text" class="form-control" id="filtroBusquedaInventario" placeholder="Buscar...">
                                            <button class="btn btn-outline-secondary" type="button" id="btnBuscarInventario">
                                                <i class="fas fa-search"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div id="listaMovimientos" class="movimientos-container">
                                    <!-- Los movimientos se cargarán dinámicamente -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        UI.cargarContenido('inventario', template);
        
        // Inicializar eventos después de cargar la plantilla
        this.setupEventos();
    },

    // Configurar eventos para la interfaz de inventario
    setupEventos() {
        // Formulario para nuevo ingreso
        const formNuevoIngreso = document.getElementById('formNuevoIngreso');
        if (formNuevoIngreso) {
            formNuevoIngreso.addEventListener('submit', (e) => {
                e.preventDefault();
                this.registrarIngreso();
            });
        }
        
        // Mostrar información del producto seleccionado y actualizar etiquetas
        const productoSelect = document.getElementById('productoIngreso');
        const infoProducto = document.getElementById('infoProducto');
        const cantidadInput = document.getElementById('cantidadIngreso');
        const unidadesCalculadas = document.getElementById('unidadesCalculadas');
        const unidadLabel = document.getElementById('unidadLabel');
        
        if (productoSelect && infoProducto) {
            productoSelect.addEventListener('change', () => {
                const productoId = productoSelect.value;
                if (productoId) {
                    const producto = this.getProductoById(productoId);
                    if (producto) {
                        // Actualizar la etiqueta de la unidad según el producto
                        unidadLabel.textContent = `Cantidad (${producto.unidad})`;
                        infoProducto.textContent = `Presentación: ${producto.presentacion} ${producto.unidad} por unidad`;
                        
                        // Limpiar los campos de cantidad y unidades calculadas
                        cantidadInput.value = '';
                        unidadesCalculadas.value = '';
                    } else {
                        infoProducto.textContent = '';
                        unidadLabel.textContent = 'Cantidad (Kg/L)';
                    }
                } else {
                    infoProducto.textContent = '';
                    unidadLabel.textContent = 'Cantidad (Kg/L)';
                }
            });
        }
        
        // Calcular unidades según la cantidad en Kg/L
        if (cantidadInput && unidadesCalculadas && productoSelect) {
            cantidadInput.addEventListener('input', () => {
                const productoId = productoSelect.value;
                if (!productoId) return;
                
                const producto = this.getProductoById(productoId);
                if (!producto) return;
                
                const cantidadKgL = parseFloat(cantidadInput.value) || 0;
                if (cantidadKgL <= 0) {
                    unidadesCalculadas.value = '';
                    return;
                }
                
                // Calcular unidades (redondeando hacia arriba)
                const unidades = Math.ceil(cantidadKgL / producto.presentacion);
                unidadesCalculadas.value = `${unidades} unidades (${cantidadKgL} ${producto.unidad} / ${producto.presentacion} ${producto.unidad})`;
            });
        }
        
        // Eventos para filtros
        const filtroTipo = document.getElementById('filtroTipoMovimiento');
        const filtroLote = document.getElementById('filtroLote');
        const filtroBusqueda = document.getElementById('filtroBusquedaInventario');
        const btnBuscar = document.getElementById('btnBuscarInventario');
        
        if (filtroTipo) {
            filtroTipo.addEventListener('change', () => {
                this.state.filtros.tipo = filtroTipo.value;
                this.mostrarMovimientos();
            });
        }
        
        if (filtroLote) {
            filtroLote.addEventListener('input', () => {
                this.state.filtros.lote = filtroLote.value;
                this.mostrarMovimientos();
            });
        }
        
        if (btnBuscar && filtroBusqueda) {
            btnBuscar.addEventListener('click', () => {
                this.state.filtros.busqueda = filtroBusqueda.value;
                this.mostrarMovimientos();
            });
            
            filtroBusqueda.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.state.filtros.busqueda = filtroBusqueda.value;
                    this.mostrarMovimientos();
                }
            });
        }
        
        // Generar número de lote automático si está vacío
        const numLoteInput = document.getElementById('numLoteIngreso');
        const fechaInput = document.getElementById('fechaIngreso');
        const productoInput = document.getElementById('productoIngreso');
        
        if (numLoteInput && fechaInput && productoInput) {
            // Al cambiar el producto o la fecha, generar un lote automático si el campo está vacío
            const generarLoteAutomatico = () => {
                if (!numLoteInput.value.trim()) {
                    const fecha = fechaInput.value ? new Date(fechaInput.value) : new Date();
                    const fechaStr = fecha.toISOString().split('T')[0].replace(/-/g, '');
                    const productoId = productoInput.value;
                    
                    if (productoId) {
                        const producto = this.getProductoById(productoId);
                        const prefijo = producto ? producto.nombre.substring(0, 3).toUpperCase() : 'XXX';
                        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                        numLoteInput.value = `${prefijo}-${fechaStr}-${random}`;
                    }
                }
            };
            
            productoInput.addEventListener('change', generarLoteAutomatico);
            fechaInput.addEventListener('change', generarLoteAutomatico);
        }
    },

    // Registrar nuevo ingreso de producto
    registrarIngreso() {
        const fecha = document.getElementById('fechaIngreso').value;
        const productoId = document.getElementById('productoIngreso').value;
        const cantidad = parseFloat(document.getElementById('cantidadIngreso').value);
        const observaciones = document.getElementById('observacionesIngreso').value;
        const proveedor = document.getElementById('proveedorIngreso').value;
        const numLote = document.getElementById('numLoteIngreso').value;
        const ubicacion = document.getElementById('ubicacionIngreso').value;
        
        if (!fecha || !productoId || !cantidad || cantidad <= 0 || !numLote) {
            UI.mostrarNotificacion('Por favor complete los campos obligatorios', 'error');
            return;
        }
        
        // Obtener información del producto
        const producto = this.getProductoById(productoId);
        if (!producto) {
            UI.mostrarNotificacion('Producto no encontrado', 'error');
            return;
        }
        
        // Calcular unidades
        const unidades = Math.ceil(cantidad / producto.presentacion);
        
        // Crear registro de ingreso de inventario
        const ingreso = {
            id: `inv_${Date.now()}`,
            fecha,
            productoId,
            productoNombre: producto.nombre,
            cantidad,
            unidades,
            unidad: producto.unidad,
            presentacion: producto.presentacion,
            tipo: 'entrada',
            observaciones,
            proveedor,
            numLote,
            ubicacion,
            createdAt: new Date().toISOString()
        };
        
        // Agregar a la base de datos
        DB.add('inventario', ingreso);
        
        // Limpiar formulario
        document.getElementById('formNuevoIngreso').reset();
        document.getElementById('fechaIngreso').value = new Date().toISOString().split('T')[0];
        document.getElementById('unidadesCalculadas').value = '';
        document.getElementById('infoProducto').textContent = '';
        
        // Actualizar vista
        this.mostrarInventario();
        
        // Notificar al usuario
        UI.mostrarNotificacion('Ingreso registrado correctamente', 'success');
    },

    // Procesar consumo automático de una elaboración nueva
    procesarConsumoElaboracion(elaboracion) {
        if (!elaboracion || !elaboracion.nBins || elaboracion.nBins <= 0) {
            console.log('La elaboración no tiene bins registrados');
            return;
        }
        
        const nBins = parseInt(elaboracion.nBins);
        
        // Calcular consumo de productos según los bins (actualizado según las especificaciones)
        const consumos = [
            {
                productoId: 'sal',
                unidades: nBins * 12.5, // 12.5 Kg de sal por bin
                unidad: 'Kg'
            },
            {
                productoId: 'hidral70',
                unidades: nBins * 6, // 6 Kg de Hidral por bin
                unidad: 'Kg'
            },
            {
                productoId: 'hydromar4',
                unidades: nBins * 1, // 1 L de Hydromar por bin
                unidad: 'L'
            }
        ];
        
        // Registrar cada consumo
        consumos.forEach(consumo => {
            const producto = this.getProductoById(consumo.productoId);
            if (!producto) return;
            
            // Calcular cantidad en unidades (redondeando hacia arriba)
            const cantidadUnidades = Math.ceil(consumo.unidades / producto.presentacion);
            
            const movimiento = {
                fecha: elaboracion.fecha,
                tipo: 'salida',
                productoId: consumo.productoId,
                productoNombre: producto.nombre,
                cantidad: cantidadUnidades,
                unidades: consumo.unidades,
                unidad: consumo.unidad,
                motivo: `Elaboración ${elaboracion.lote} (${nBins} bins)`,
                elaboracionId: elaboracion.id,
                observaciones: `Consumo automático por elaboración de rejo. Lote: ${elaboracion.lote}. ${consumo.unidades} ${consumo.unidad} (${cantidadUnidades} unidades)`
            };
            
            DB.add('inventario', movimiento);
        });
        
        // Actualizar vista de inventario si estamos en esa sección
        const seccionActiva = document.querySelector('.content-section.active');
        if (seccionActiva && seccionActiva.id === 'inventario') {
            this.mostrarInventario();
        }
        
        UI.mostrarNotificacion('Inventario', `Se ha descontado material para ${nBins} bins de elaboración`, 'info');
    },

    // Procesar actualización de una elaboración existente
    procesarActualizacionElaboracion(elaboracion, elaboracionAnterior) {
        if (!elaboracion || !elaboracionAnterior) return;
        
        // No hacemos nada si no hay cambio en los parámetros que afectan al consumo
        if (elaboracion.nBins === elaboracionAnterior.nBins) return;
        
        // Buscar movimientos previos asociados a esta elaboración
        const movimientosPrevios = DB.getAll('inventario').filter(m => 
            m.elaboracionId === elaboracion.id && m.tipo === 'salida'
        );
        
        // Eliminar movimientos anteriores
        if (movimientosPrevios.length > 0) {
            movimientosPrevios.forEach(mov => {
                DB.delete('inventario', mov.id);
            });
            
            // Mostrar notificación de que se han eliminado los movimientos previos
            UI.mostrarNotificacion('Inventario', 'Se han eliminado los movimientos anteriores de esta elaboración', 'info');
        }
        
        // El módulo Elaboración se encargará de crear los nuevos movimientos
    },

    // Obtener producto por ID
    getProductoById(id) {
        // Buscar en la lista de productos registrados
        const producto = this.state.productosRegistrados.find(p => p.id === id);
        if (producto) return producto;
        
        // Si no se encuentra en la lista, intentar reconstruirlo desde los datos de inventario
        const movimientos = DB.getAll('inventario');
        const movimiento = movimientos.find(m => m.productoId === id);
        
        if (movimiento) {
            return {
                id: movimiento.productoId,
                nombre: movimiento.productoNombre,
                unidad: movimiento.unidad,
                presentacion: movimiento.presentacion || 0
            };
        }
        
        return null;
    },

    // Obtener movimientos con filtros
    getMovimientosFiltrados() {
        let movimientos = DB.getAll('inventario');
        
        // Aplicar filtros
        if (this.state.filtros.tipo) {
            movimientos = movimientos.filter(m => m.tipo === this.state.filtros.tipo);
        }
        
        if (this.state.filtros.lote) {
            const loteBusqueda = this.state.filtros.lote.toLowerCase();
            movimientos = movimientos.filter(m => 
                m.numLote && m.numLote.toLowerCase().includes(loteBusqueda)
            );
        }
        
        if (this.state.filtros.busqueda) {
            const busqueda = this.state.filtros.busqueda.toLowerCase();
            movimientos = movimientos.filter(m => {
                const enProducto = m.productoNombre.toLowerCase().includes(busqueda);
                const enObservaciones = m.observaciones && m.observaciones.toLowerCase().includes(busqueda);
                const enProveedor = m.proveedor && m.proveedor.toLowerCase().includes(busqueda);
                
                return enProducto || enObservaciones || enProveedor;
            });
        }
        
        // Ordenar por fecha (más recientes primero)
        return movimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    },

    // Mostrar inventario (stock y movimientos)
    mostrarInventario() {
        this.mostrarStockActual();
        this.mostrarMovimientos();
    },

    // Mostrar el stock actual
    mostrarStockActual() {
        const container = document.getElementById('stockActual');
        if (!container) return;
        
        // Calcular el stock por producto y por lote
        const productos = this.getProductosConStock();
        
        if (productos.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    No hay productos en el inventario. Utilice el formulario superior para registrar ingresos.
                </div>
            `;
            return;
        }
        
        // Agrupar productos por tipo y mostrar en tablas separadas
        let html = '';
        
        // Crear tabla con todos los productos
        html += `
            <div class="table-responsive">
                <table class="table table-bordered table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>Producto</th>
                            <th>Lote</th>
                            <th>Proveedor</th>
                            <th>Stock</th>
                            <th>Ubicación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        productos.forEach(producto => {
            // Si el producto tiene varios lotes, mostrar cada uno
            if (producto.lotes && producto.lotes.length > 0) {
                producto.lotes.forEach(lote => {
                    // Estilo según el nivel de stock
                    let claseStock = '';
                    if (lote.stock <= 0) {
                        claseStock = 'text-danger';
                    } else if (lote.stock < producto.stockMinimo) {
                        claseStock = 'text-warning';
                    }
                    
                    html += `
                        <tr>
                            <td>${producto.nombre}</td>
                            <td>${lote.numLote || '-'}</td>
                            <td>${lote.proveedor || '-'}</td>
                            <td class="${claseStock}">
                                <div class="fw-bold">${lote.stock.toFixed(2)} ${producto.unidad}</div>
                                <div class="stock-units">
                                    ${this.formatearUnidades(producto.id, lote.stock)}
                                </div>
                            </td>
                            <td>${lote.ubicacion || '-'}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary btn-consumir-lote" 
                                    data-producto="${producto.id}" 
                                    data-lote="${lote.numLote}"
                                    data-stock="${lote.stock}">
                                    Consumir
                                </button>
                            </td>
                        </tr>
                    `;
                });
            } else {
                // Si no hay lotes detallados, mostrar el stock total
                let claseStock = '';
                if (producto.stock <= 0) {
                    claseStock = 'text-danger';
                } else if (producto.stock < producto.stockMinimo) {
                    claseStock = 'text-warning';
                }
                
                html += `
                    <tr>
                        <td>${producto.nombre}</td>
                        <td>Múltiples</td>
                        <td>-</td>
                        <td class="${claseStock}">
                            <div class="fw-bold">${producto.stock.toFixed(2)} ${producto.unidad}</div>
                            <div class="stock-units">
                                ${this.formatearUnidades(producto.id, producto.stock)}
                            </div>
                        </td>
                        <td>-</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary btn-consumir-lote" 
                                data-producto="${producto.id}" 
                                data-stock="${producto.stock}">
                                Consumir
                            </button>
                        </td>
                    </tr>
                `;
            }
        });
        
        html += `
                    </tbody>
                </table>
            </div>
            
            <div class="alert alert-info mt-3">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Leyenda:</strong>
                <span class="text-danger ms-2">Rojo: Sin stock</span> | 
                <span class="text-warning ms-2">Amarillo: Stock bajo</span>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Configurar botones para consumir lotes
        document.querySelectorAll('.btn-consumir-lote').forEach(btn => {
            btn.addEventListener('click', () => {
                const productoId = btn.getAttribute('data-producto');
                const numLote = btn.getAttribute('data-lote');
                const stockDisponible = parseFloat(btn.getAttribute('data-stock'));
                
                this.mostrarModalConsumir(productoId, numLote, stockDisponible);
            });
        });
    },

    // Mostrar los movimientos de inventario
    mostrarMovimientos() {
        const container = document.getElementById('listaMovimientos');
        if (!container) return;
        
        const movimientos = this.getMovimientosFiltrados();
        
        if (movimientos.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    No hay movimientos que coincidan con los criterios de búsqueda.
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Producto</th>
                            <th>Tipo</th>
                            <th>Cantidad</th>
                            <th>Lote</th>
                            <th>Proveedor</th>
                            <th>Observaciones</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        movimientos.forEach(mov => {
            const fecha = new Date(mov.fecha).toLocaleDateString('es-ES');
            
            // Clase para el tipo de movimiento
            const claseMovimiento = mov.tipo === 'entrada' ? 'success' : 'danger';
            const iconoMovimiento = mov.tipo === 'entrada' ? 'arrow-down' : 'arrow-up';
            
            // Formatear unidades usando el método existente
            const unidadesFormateadas = this.formatearUnidades(mov.productoId, mov.cantidad);
            
            html += `
                <tr>
                    <td>${fecha}</td>
                    <td>${mov.productoNombre}</td>
                    <td>
                        <span class="badge bg-${claseMovimiento}">
                            <i class="fas fa-${iconoMovimiento} me-1"></i>
                            ${mov.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                        </span>
                    </td>
                    <td>
                        <strong>${unidadesFormateadas}</strong>
                        <small class="text-muted d-block">
                            ${mov.cantidad.toFixed(2)} ${mov.unidad}
                        </small>
                    </td>
                    <td>${mov.numLote || '-'}</td>
                    <td>${mov.proveedor || '-'}</td>
                    <td>${mov.observaciones || '-'}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-secondary btn-editar-movimiento" data-id="${mov.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-eliminar-movimiento" data-id="${mov.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Configurar botones de acciones
        document.querySelectorAll('.btn-editar-movimiento').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                this.mostrarModalEditar(id);
            });
        });
        
        document.querySelectorAll('.btn-eliminar-movimiento').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                this.confirmarEliminarMovimiento(id);
            });
        });
    },
    
    // Mostrar modal para editar un movimiento
    mostrarModalEditar(id) {
        const movimiento = DB.getById('inventario', id);
        if (!movimiento) {
            UI.mostrarNotificacion('Error', 'No se encontró el movimiento', 'error');
            return;
        }
        
        // Actualizar el estado
        this.state.productoEditando = movimiento;
        
        // Crear modal si no existe
        if (!document.getElementById('editarMovimientoModal')) {
            const modalHTML = `
                <div class="modal fade" id="editarMovimientoModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Editar Movimiento de Inventario</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form id="formEditarMovimiento">
                                    <input type="hidden" id="idMovimientoEditar">
                                    <div class="mb-3">
                                        <label for="fechaMovimientoEditar" class="form-label">Fecha</label>
                                        <input type="date" class="form-control" id="fechaMovimientoEditar" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="productoMovimientoEditar" class="form-label">Producto</label>
                                        <select class="form-select" id="productoMovimientoEditar" required disabled>
                                            <option value="sal">SAL</option>
                                            <option value="hidral70">HIDRAL-70</option>
                                            <option value="hydromar4">HYDROMAR-4</option>
                                            <option value="antiespumante">ANTIESPUMANTE</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label for="tipoMovimientoEditar" class="form-label">Tipo</label>
                                        <select class="form-select" id="tipoMovimientoEditar" required disabled>
                                            <option value="entrada">Entrada</option>
                                            <option value="salida">Salida</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label id="unidadLabelEditar" for="cantidadMovimientoEditar" class="form-label">Cantidad</label>
                                        <input type="number" step="0.1" min="0.1" class="form-control" id="cantidadMovimientoEditar" required>
                                        <div class="form-text" id="infoProductoEditar"></div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="unidadesCalculadasEditar" class="form-label">Equivalente en unidades</label>
                                        <input type="text" class="form-control" id="unidadesCalculadasEditar" readonly>
                                    </div>
                                    <div class="mb-3">
                                        <label for="motivoMovimientoEditar" class="form-label">Motivo</label>
                                        <input type="text" class="form-control" id="motivoMovimientoEditar" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="observacionesMovimientoEditar" class="form-label">Observaciones</label>
                                        <textarea class="form-control" id="observacionesMovimientoEditar" rows="2"></textarea>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-primary" id="btnGuardarEdicionMovimiento">Guardar cambios</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Añadir el modal al DOM
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Configurar eventos del modal
            document.getElementById('btnGuardarEdicionMovimiento').addEventListener('click', () => {
                this.guardarEdicionMovimiento();
            });
            
            // Calcular unidades al cambiar la cantidad
            const cantidadEditar = document.getElementById('cantidadMovimientoEditar');
            const unidadesCalculadasEditar = document.getElementById('unidadesCalculadasEditar');
            
            cantidadEditar.addEventListener('input', () => {
                if (!this.state.productoEditando) return;
                
                const producto = this.getProductoById(this.state.productoEditando.productoId);
                if (!producto) return;
                
                const cantidadKgL = parseFloat(cantidadEditar.value) || 0;
                if (cantidadKgL <= 0) {
                    unidadesCalculadasEditar.value = '';
                    return;
                }
                
                // Calcular unidades (redondeando hacia arriba)
                const unidades = Math.ceil(cantidadKgL / producto.presentacion);
                unidadesCalculadasEditar.value = `${unidades} unidades (${cantidadKgL} ${producto.unidad} / ${producto.presentacion} ${producto.unidad})`;
            });
        }
        
        // Rellenar el formulario con los datos del movimiento
        document.getElementById('idMovimientoEditar').value = movimiento.id;
        document.getElementById('fechaMovimientoEditar').value = movimiento.fecha;
        document.getElementById('productoMovimientoEditar').value = movimiento.productoId;
        document.getElementById('tipoMovimientoEditar').value = movimiento.tipo;
        document.getElementById('cantidadMovimientoEditar').value = movimiento.unidades;
        document.getElementById('motivoMovimientoEditar').value = movimiento.motivo || '';
        document.getElementById('observacionesMovimientoEditar').value = movimiento.observaciones || '';
        
        // Actualizar información del producto
        const producto = this.getProductoById(movimiento.productoId);
        if (producto) {
            const unidadLabelEditar = document.getElementById('unidadLabelEditar');
            const infoProductoEditar = document.getElementById('infoProductoEditar');
            
            unidadLabelEditar.textContent = `Cantidad (${producto.unidad})`;
            infoProductoEditar.textContent = `Presentación: ${producto.presentacion} ${producto.unidad} por unidad`;
            
            // Calcular unidades
            const cantidadKgL = parseFloat(movimiento.unidades) || 0;
            const unidades = Math.ceil(cantidadKgL / producto.presentacion);
            document.getElementById('unidadesCalculadasEditar').value = 
                `${unidades} unidades (${cantidadKgL} ${producto.unidad} / ${producto.presentacion} ${producto.unidad})`;
        }
        
        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById('editarMovimientoModal'));
        modal.show();
    },
    
    // Guardar cambios en el movimiento editado
    guardarEdicionMovimiento() {
        const id = document.getElementById('idMovimientoEditar').value;
        const fecha = document.getElementById('fechaMovimientoEditar').value;
        const cantidadKgL = parseFloat(document.getElementById('cantidadMovimientoEditar').value);
        const motivo = document.getElementById('motivoMovimientoEditar').value;
        const observaciones = document.getElementById('observacionesMovimientoEditar').value;
        
        if (!id || !fecha || isNaN(cantidadKgL) || cantidadKgL <= 0 || !motivo) {
            UI.mostrarNotificacion('Error', 'Por favor complete todos los campos requeridos', 'error');
            return;
        }
        
        const movimientoOriginal = DB.getById('inventario', id);
        if (!movimientoOriginal) {
            UI.mostrarNotificacion('Error', 'No se encontró el movimiento', 'error');
            return;
        }
        
        const producto = this.getProductoById(movimientoOriginal.productoId);
        if (!producto) {
            UI.mostrarNotificacion('Error', 'No se encontró el producto', 'error');
            return;
        }
        
        // Calcular unidades
        const unidades = Math.ceil(cantidadKgL / producto.presentacion);
        
        // Actualizar movimiento
        const actualizacion = {
            fecha,
            unidades: cantidadKgL,
            cantidad: unidades,
            motivo,
            observaciones,
            updatedAt: new Date().toISOString()
        };
        
        const resultado = DB.update('inventario', id, actualizacion);
        
        if (resultado) {
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editarMovimientoModal'));
            if (modal) {
                modal.hide();
            }
            
            // Limpiar estado
            this.state.productoEditando = null;
            
            // Actualizar vista
            UI.mostrarNotificacion('Movimiento actualizado correctamente', 'success');
            this.mostrarInventario();
        } else {
            UI.mostrarNotificacion('Error', 'No se pudo actualizar el movimiento', 'error');
        }
    },
    
    // Confirmar eliminación de un movimiento
    confirmarEliminarMovimiento(id) {
        const movimiento = DB.getById('inventario', id);
        if (!movimiento) {
            UI.mostrarNotificacion('Error', 'No se encontró el movimiento', 'error');
            return;
        }
        
        // Usar el modal de confirmación con promesas
        UI.confirmar({
            title: 'Eliminar movimiento',
            message: `¿Está seguro que desea eliminar este movimiento de ${movimiento.tipo} de ${movimiento.productoNombre}?`,
            type: 'warning',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        }).then(confirmed => {
            if (confirmed) {
                this.eliminarMovimiento(id);
            }
        });
    },
    
    // Eliminar un movimiento
    eliminarMovimiento(id) {
        const resultado = DB.delete('inventario', id);
        
        if (resultado) {
            UI.mostrarNotificacion('Éxito', 'Movimiento eliminado correctamente', 'success');
            this.mostrarInventario();
        } else {
            UI.mostrarNotificacion('Error', 'No se pudo eliminar el movimiento', 'error');
        }
    },

    // Obtener los productos con su stock actual
    getProductosConStock() {
        const inventario = DB.stores.inventario;
        
        // Primero, agrupar por producto
        const productos = {};
        
        // Luego, dentro de cada producto, agrupar por lote
        const lotes = {};
        
        // Procesar todos los movimientos de inventario
        inventario.forEach(item => {
            const { productoId, productoNombre, cantidad, unidades, tipo, unidad, presentacion, numLote, proveedor, fechaVencimiento, ubicacion } = item;
            
            // El factor es 1 para entradas, -1 para salidas
            const factor = tipo === 'entrada' ? 1 : -1;
            
            // Inicializar el producto si no existe
            if (!productos[productoId]) {
                // Establecer stockMinimo según el tipo de producto
                let stockMinimo = 5;
                
                if (productoId === 'sal') {
                    stockMinimo = 100;
                } else if (productoId === 'hidral70') {
                    stockMinimo = 100;
                } else if (productoId === 'hydromar4') {
                    stockMinimo = 200;
                } else if (productoId === 'antiespumante') {
                    stockMinimo = 100;
                }
                
                productos[productoId] = {
                    id: productoId,
                    nombre: productoNombre,
                    stock: 0,
                    unidad: unidad,
                    presentacion: presentacion,
                    stockMinimo: stockMinimo,
                    lotes: []
                };
            }
            
            // Actualizar stock total del producto
            productos[productoId].stock += cantidad * factor;
            
            // Si tiene número de lote, actualizar el stock por lote
            if (numLote) {
                const loteKey = `${productoId}_${numLote}`;
                
                if (!lotes[loteKey]) {
                    lotes[loteKey] = {
                        numLote,
                        productoId,
                        stock: 0,
                        proveedor,
                        fechaVencimiento,
                        ubicacion
                    };
                }
                
                // Actualizar stock del lote
                lotes[loteKey].stock += cantidad * factor;
            }
        });
        
        // Asignar los lotes a sus productos correspondientes
        Object.values(lotes).forEach(lote => {
            if (productos[lote.productoId]) {
                if (!productos[lote.productoId].lotes) {
                    productos[lote.productoId].lotes = [];
                }
                
                // Solo añadir lotes con stock positivo
                if (lote.stock > 0) {
                    productos[lote.productoId].lotes.push(lote);
                }
            }
        });
        
        // Ordenar los lotes por número de lote
        Object.values(productos).forEach(producto => {
            if (producto.lotes && producto.lotes.length > 0) {
                producto.lotes.sort((a, b) => {
                    return a.numLote.localeCompare(b.numLote);
                });
            }
        });
        
        // Convertir a array y ordenar por nombre
        return Object.values(productos)
            .sort((a, b) => a.nombre.localeCompare(b.nombre));
    },

    // Método para mostrar el modal de consumo de un lote específico
    mostrarModalConsumir(productoId, numLote, stockDisponible) {
        const producto = this.getProductoById(productoId);
        
        if (!producto) {
            UI.mostrarNotificacion('Producto no encontrado', 'error');
            return;
        }
        
        // Crear modal dinámicamente si no existe
        let modalEl = document.getElementById('modalConsumirLote');
        
        if (!modalEl) {
            modalEl = document.createElement('div');
            modalEl.id = 'modalConsumirLote';
            modalEl.className = 'modal fade';
            modalEl.tabIndex = -1;
            modalEl.setAttribute('aria-hidden', 'true');
            
            modalEl.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Consumir Producto</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="formConsumirLote">
                                <input type="hidden" id="productoIdConsumir">
                                <input type="hidden" id="loteConsumir">
                                
                                <div class="mb-3">
                                    <label for="productoNombreConsumir" class="form-label">Producto</label>
                                    <input type="text" class="form-control" id="productoNombreConsumir" readonly>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="loteInfoConsumir" class="form-label">Lote</label>
                                    <input type="text" class="form-control" id="loteInfoConsumir" readonly>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="stockDisponibleConsumir" class="form-label">Stock Disponible</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="stockDisponibleConsumir" readonly>
                                        <span class="input-group-text" id="unidadConsumir"></span>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="cantidadConsumir" class="form-label">Cantidad a Consumir</label>
                                    <div class="input-group">
                                        <input type="number" step="0.01" min="0.01" class="form-control" id="cantidadConsumir" required>
                                        <span class="input-group-text" id="unidadConsumir2"></span>
                                    </div>
                                    <div class="form-text" id="calculoUnidadesConsumir"></div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="motivoConsumir" class="form-label">Motivo / Destino</label>
                                    <select class="form-select" id="motivoConsumir" required>
                                        <option value="">Seleccione un motivo</option>
                                        <option value="Elaboración">Elaboración</option>
                                        <option value="Merma">Merma / Pérdida</option>
                                        <option value="Devolución">Devolución</option>
                                        <option value="Ajuste">Ajuste de Inventario</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="observacionesConsumir" class="form-label">Observaciones</label>
                                    <textarea class="form-control" id="observacionesConsumir" rows="2"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="btnConfirmarConsumir">Confirmar Consumo</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modalEl);
        }
        
        // Inicializar modal
        const modal = new bootstrap.Modal(modalEl);
        
        // Llenar datos en el formulario
        document.getElementById('productoIdConsumir').value = productoId;
        document.getElementById('productoNombreConsumir').value = producto.nombre;
        document.getElementById('loteConsumir').value = numLote || '';
        document.getElementById('loteInfoConsumir').value = numLote || 'Stock General';
        document.getElementById('stockDisponibleConsumir').value = stockDisponible.toFixed(2);
        document.getElementById('unidadConsumir').textContent = producto.unidad;
        document.getElementById('unidadConsumir2').textContent = producto.unidad;
        
        // Configurar cálculo dinámico de unidades
        const cantidadInput = document.getElementById('cantidadConsumir');
        const calculoUnidadesEl = document.getElementById('calculoUnidadesConsumir');
        
        cantidadInput.addEventListener('input', () => {
            const cantidad = parseFloat(cantidadInput.value) || 0;
            
            if (cantidad > stockDisponible) {
                calculoUnidadesEl.innerHTML = `<span class="text-danger">¡Cantidad excede al stock disponible!</span>`;
                cantidadInput.classList.add('is-invalid');
            } else if (cantidad <= 0) {
                calculoUnidadesEl.innerHTML = '';
                cantidadInput.classList.remove('is-invalid');
            } else {
                const unidades = Math.ceil(cantidad / producto.presentacion);
                calculoUnidadesEl.innerHTML = `Equivale a aproximadamente ${unidades} unidades`;
                cantidadInput.classList.remove('is-invalid');
            }
        });
        
        // Configurar evento de confirmación
        const btnConfirmar = document.getElementById('btnConfirmarConsumir');
        
        btnConfirmar.onclick = () => {
            // Validar formulario
            const cantidad = parseFloat(cantidadInput.value) || 0;
            const motivo = document.getElementById('motivoConsumir').value;
            const observaciones = document.getElementById('observacionesConsumir').value;
            
            if (!cantidad || cantidad <= 0 || cantidad > stockDisponible || !motivo) {
                UI.mostrarNotificacion('Por favor complete correctamente los campos', 'error');
                return;
            }
            
            // Calcular unidades
            const unidades = Math.ceil(cantidad / producto.presentacion);
            
            // Crear registro de salida
            const salida = {
                id: `inv_${Date.now()}`,
                fecha: new Date().toISOString().split('T')[0],
                productoId,
                productoNombre: producto.nombre,
                cantidad,
                unidades,
                unidad: producto.unidad,
                presentacion: producto.presentacion,
                tipo: 'salida',
                numLote: numLote || null,
                motivo,
                observaciones,
                createdAt: new Date().toISOString()
            };
            
            // Agregar a la base de datos
            DB.add('inventario', salida);
            
            // Cerrar modal
            modal.hide();
            
            // Actualizar vista
            this.mostrarInventario();
            
            // Notificar al usuario
            UI.mostrarNotificacion(`Se ha registrado el consumo de ${cantidad} ${producto.unidad} de ${producto.nombre}`, 'success');
        };
        
        // Mostrar modal
        modal.show();
    },

    // Método para formatear las unidades de forma más clara
    formatearUnidades(productoId, cantidad) {
        if (!productoId || cantidad === undefined || cantidad === null || isNaN(cantidad)) {
            return '';
        }
        
        // Asegurarse que cantidad es un número
        cantidad = parseFloat(cantidad);
        
        // Definir las equivalencias según lo especificado
        const equivalencias = {
            'sal': { unidad: 'saco', equivalente: 25, medida: 'Kg' },
            'hidral70': { unidad: 'saco', equivalente: 6, medida: 'Kg' },
            'hydromar4': { unidad: 'garrafa', equivalente: 25, medida: 'L' },
            'antiespumante': { unidad: 'garrafa', equivalente: 25, medida: 'L' }
        };
        
        // Si el producto está en la lista de equivalencias
        if (equivalencias[productoId]) {
            const info = equivalencias[productoId];
            const unidadesCompletas = Math.floor(cantidad / info.equivalente);
            const remanente = (cantidad % info.equivalente).toFixed(2);
            
            let texto = '';
            
            // Plural o singular según la cantidad
            const unidadTexto = unidadesCompletas === 1 ? info.unidad : (
                info.unidad === 'saco' ? 'sacos' : 'garrafas'
            );
            
            if (unidadesCompletas > 0) {
                texto = `${unidadesCompletas} ${unidadTexto} de ${info.equivalente} ${info.medida}`;
            }
            
            // Agregar remanente si es mayor que 0
            if (parseFloat(remanente) > 0) {
                texto = texto ? `${texto} + ${remanente} ${info.medida}` : `${remanente} ${info.medida}`;
            } else if (texto === '') {
                // Si no hay unidades completas ni remanente (caso de 0)
                texto = `0 ${info.medida}`;
            }
            
            return texto;
        } else {
            // Para productos no listados, usar el método genérico
            const producto = this.getProductoById(productoId);
            if (producto) {
                const unidades = Math.ceil(cantidad / producto.presentacion);
                return `${unidades} unidades de ${producto.presentacion} ${producto.unidad}`;
            }
            return `${cantidad} unidades`;
        }
    },
};

// Inicializar el módulo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Inventario.init();
});
