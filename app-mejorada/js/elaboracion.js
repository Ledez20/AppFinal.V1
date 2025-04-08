/**
 * Módulo de Elaboración de Rejo de potón
 */

const Elaboracion = {
    // Estado del módulo
    state: {
        elaboracionEditando: null,
        filtros: {
            fechaDesde: '',
            fechaHasta: '',
            proveedor: '',
            busqueda: ''
        }
    },

    // Inicializar módulo
    init() {
        // Cargar plantilla de elaboración
        this.loadTemplate();
        
        // Escuchar eventos de cambio de sección
        document.addEventListener('sectionChanged', (event) => {
            if (event.detail.section === 'elaboracion') {
                this.mostrarElaboraciones();
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
                            <h2 class="section-title">Elaboración de Rejo de Potón</h2>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Registrar Elaboración</h5>
                                <form id="formNuevaElaboracion">
                                    <div class="mb-3">
                                        <label for="fechaElaboracion" class="form-label">Fecha</label>
                                        <input type="date" class="form-control" id="fechaElaboracion" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="proveedorElaboracion" class="form-label">Proveedor</label>
                                        <select class="form-select" id="proveedorElaboracion" required>
                                            <option value="">Seleccionar proveedor...</option>
                                            <option value="Wofco">Wofco</option>
                                            <option value="Oversea">Oversea</option>
                                            <option value="Iberconsa">Iberconsa</option>
                                            <option value="Scanfisk">Scanfisk</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label for="loteElaboracion" class="form-label">Lote</label>
                                        <input type="text" class="form-control" id="loteElaboracion" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="kgRecibidosElaboracion" class="form-label">Kg Recibidos</label>
                                        <input type="number" step="0.01" class="form-control" id="kgRecibidosElaboracion" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="kgElaboradosElaboracion" class="form-label">Kg Elaborados</label>
                                        <input type="number" step="0.01" class="form-control" id="kgElaboradosElaboracion" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="rendimientoElaboracion" class="form-label">Rendimiento (%)</label>
                                        <input type="text" class="form-control" id="rendimientoElaboracion" readonly>
                                    </div>
                                    
                                    <hr>
                                    <h6 class="mb-3">Insumos Utilizados (Cálculo automático)</h6>
                                    
                                    <!-- SAL -->
                                    <div class="mb-3">
                                        <label class="form-label">SAL</label>
                                        <div class="input-group">
                                            <span class="input-group-text bg-light" id="infoCalculoSal">0.0 Kg</span>
                                            <select class="form-select" id="loteSalSeleccionado">
                                                <option value="">Seleccionar lote...</option>
                                            </select>
                                        </div>
                                        <div class="form-text" id="infoLoteSal"></div>
                                    </div>
                                    
                                    <!-- HIDRAL-70 -->
                                    <div class="mb-3">
                                        <label class="form-label">HIDRAL-70</label>
                                        <div class="input-group">
                                            <span class="input-group-text bg-light" id="infoCalculoHidral">0.0 Kg</span>
                                            <select class="form-select" id="loteHidralSeleccionado">
                                                <option value="">Seleccionar lote...</option>
                                            </select>
                                        </div>
                                        <div class="form-text" id="infoLoteHidral"></div>
                                    </div>
                                    
                                    <!-- HYDROMAR-4 -->
                                    <div class="mb-3">
                                        <label class="form-label">HYDROMAR-4</label>
                                        <div class="input-group">
                                            <span class="input-group-text bg-light" id="infoCalculoHydromar">0.0 L</span>
                                            <select class="form-select" id="loteHydromarSeleccionado">
                                                <option value="">Seleccionar lote...</option>
                                            </select>
                                        </div>
                                        <div class="form-text" id="infoLoteHydromar"></div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="observacionesElaboracion" class="form-label">Observaciones</label>
                                        <textarea class="form-control" id="observacionesElaboracion" rows="3"></textarea>
                                    </div>
                                    <div class="d-grid">
                                        <button type="submit" class="btn btn-primary">Guardar Elaboración</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Historial de Elaboraciones</h5>
                                
                                <div class="row mb-3 filtros-container">
                                    <div class="col-md-6">
                                        <div class="row g-2">
                                            <div class="col-6">
                                                <label for="filtroFechaDesdeElaboracion" class="form-label">Desde</label>
                                                <input type="date" class="form-control" id="filtroFechaDesdeElaboracion">
                                            </div>
                                            <div class="col-6">
                                                <label for="filtroFechaHastaElaboracion" class="form-label">Hasta</label>
                                                <input type="date" class="form-control" id="filtroFechaHastaElaboracion">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <label for="filtroProveedorElaboracion" class="form-label">Proveedor</label>
                                        <select class="form-select" id="filtroProveedorElaboracion">
                                            <option value="">Todos los proveedores</option>
                                            <option value="Wofco">Wofco</option>
                                            <option value="Oversea">Oversea</option>
                                            <option value="Iberconsa">Iberconsa</option>
                                            <option value="Scanfisk">Scanfisk</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label for="filtroBusquedaElaboracion" class="form-label">Buscar</label>
                                        <div class="input-group">
                                            <input type="text" class="form-control" id="filtroBusquedaElaboracion" placeholder="Buscar...">
                                            <button class="btn btn-outline-secondary" type="button" id="btnBuscarElaboracion">
                                                <i class="fas fa-search"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div id="listaElaboraciones" class="elaboraciones-container">
                                    <!-- Las elaboraciones se cargarán dinámicamente -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal para editar elaboración -->
            <div class="modal fade" id="editarElaboracionModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Editar Elaboración</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="formEditarElaboracion">
                                <input type="hidden" id="idElaboracionEditar">
                                <div class="mb-3">
                                    <label for="fechaElaboracionEditar" class="form-label">Fecha</label>
                                    <input type="date" class="form-control" id="fechaElaboracionEditar" required>
                                </div>
                                <div class="mb-3">
                                    <label for="proveedorElaboracionEditar" class="form-label">Proveedor</label>
                                    <select class="form-select" id="proveedorElaboracionEditar" required>
                                        <option value="">Seleccionar proveedor...</option>
                                        <option value="Wofco">Wofco</option>
                                        <option value="Oversea">Oversea</option>
                                        <option value="Iberconsa">Iberconsa</option>
                                        <option value="Scanfisk">Scanfisk</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="loteElaboracionEditar" class="form-label">Lote</label>
                                    <input type="text" class="form-control" id="loteElaboracionEditar" required>
                                </div>
                                <div class="mb-3">
                                    <label for="kgRecibidosElaboracionEditar" class="form-label">Kg Recibidos</label>
                                    <input type="number" step="0.01" class="form-control" id="kgRecibidosElaboracionEditar" required>
                                </div>
                                <div class="mb-3">
                                    <label for="kgElaboradosElaboracionEditar" class="form-label">Kg Elaborados</label>
                                    <input type="number" step="0.01" class="form-control" id="kgElaboradosElaboracionEditar" required>
                                </div>
                                <div class="mb-3">
                                    <label for="rendimientoElaboracionEditar" class="form-label">Rendimiento (%)</label>
                                    <input type="text" class="form-control" id="rendimientoElaboracionEditar" readonly>
                                </div>
                                <div class="mb-3">
                                    <label for="observacionesElaboracionEditar" class="form-label">Observaciones</label>
                                    <textarea class="form-control" id="observacionesElaboracionEditar" rows="3"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="btnGuardarEdicionElaboracion">Guardar cambios</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        UI.cargarContenido('elaboracion', template);
        
        // Inicializar eventos después de cargar la plantilla
        this.setupEventos();
        
        // Inicializar desplegables de Bootstrap después de que el DOM esté listo
        setTimeout(() => {
            const dropdowns = document.querySelectorAll('.dropdown-toggle');
            dropdowns.forEach(dropdown => {
                new bootstrap.Dropdown(dropdown, {
                    autoClose: true
                });
            });
        }, 0);
    },

    // Configurar eventos para la interfaz de elaboración
    setupEventos() {
        // Formulario para nueva elaboración
        const formNuevaElaboracion = document.getElementById('formNuevaElaboracion');
        if (formNuevaElaboracion) {
            formNuevaElaboracion.addEventListener('submit', (e) => {
                e.preventDefault();
                this.guardarElaboracion();
            });
            
            // Calcular rendimiento automáticamente
            const kgRecibidos = document.getElementById('kgRecibidosElaboracion');
            const kgElaborados = document.getElementById('kgElaboradosElaboracion');
            const rendimiento = document.getElementById('rendimientoElaboracion');
            
            const calcularRendimiento = () => {
                if (kgRecibidos.value && kgElaborados.value) {
                    const recibidos = parseFloat(kgRecibidos.value);
                    const elaborados = parseFloat(kgElaborados.value);
                    if (recibidos > 0) {
                        const rend = ((elaborados / recibidos) * 100).toFixed(2);
                        rendimiento.value = rend + '%';
                        
                        // Calcular cantidades de insumos basadas en kg elaborados
                        this.calcularInsumosNecesarios(elaborados);
                    }
                }
            };
            
            kgRecibidos.addEventListener('input', calcularRendimiento);
            kgElaborados.addEventListener('input', calcularRendimiento);
            
            // Inicializar selectores de lotes
            const selectoresLotes = document.querySelectorAll('.lote-selector');
            selectoresLotes.forEach(selector => {
                const productoId = selector.getAttribute('data-producto');
                
                // Asegurarse de que el botón tenga los atributos correctos para Bootstrap
                selector.setAttribute('data-bs-toggle', 'dropdown');
                selector.setAttribute('aria-expanded', 'false');
                
                // Inicializar dropdown de Bootstrap
                new bootstrap.Dropdown(selector);
                
                // Agregar evento de clic
                selector.addEventListener('click', (e) => {
                    e.preventDefault();
                    const infoCalculo = document.getElementById(`infoCalculo${this.formatearIdProducto(productoId)}`);
                    
                    if (infoCalculo && infoCalculo.textContent) {
                        const cantidadNecesaria = parseFloat(infoCalculo.textContent);
                        if (!isNaN(cantidadNecesaria)) {
                            this.cargarLotesDisponibles(productoId, cantidadNecesaria);
                        } else {
                            UI.mostrarNotificacion('Primero debe calcular las cantidades necesarias', 'warning');
                        }
                    } else {
                        UI.mostrarNotificacion('Primero debe calcular las cantidades necesarias', 'warning');
                    }
                });
            });
        }
        
        // Eventos para filtros
        const filtroFechaDesde = document.getElementById('filtroFechaDesdeElaboracion');
        const filtroFechaHasta = document.getElementById('filtroFechaHastaElaboracion');
        const filtroProveedor = document.getElementById('filtroProveedorElaboracion');
        const filtroBusqueda = document.getElementById('filtroBusquedaElaboracion');
        const btnBuscar = document.getElementById('btnBuscarElaboracion');
        
        if (filtroFechaDesde) {
            filtroFechaDesde.addEventListener('change', () => {
                this.state.filtros.fechaDesde = filtroFechaDesde.value;
                this.mostrarElaboraciones();
            });
        }
        
        if (filtroFechaHasta) {
            filtroFechaHasta.addEventListener('change', () => {
                this.state.filtros.fechaHasta = filtroFechaHasta.value;
                this.mostrarElaboraciones();
            });
        }
        
        if (filtroProveedor) {
            filtroProveedor.addEventListener('change', () => {
                this.state.filtros.proveedor = filtroProveedor.value;
                this.mostrarElaboraciones();
            });
        }
        
        if (filtroBusqueda && btnBuscar) {
            filtroBusqueda.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.state.filtros.busqueda = filtroBusqueda.value;
                    this.mostrarElaboraciones();
                }
            });
            
            btnBuscar.addEventListener('click', () => {
                this.state.filtros.busqueda = filtroBusqueda.value;
                this.mostrarElaboraciones();
            });
        }
        
        // Eventos para editar elaboración
        const btnGuardarEdicion = document.getElementById('btnGuardarEdicionElaboracion');
        if (btnGuardarEdicion) {
            btnGuardarEdicion.addEventListener('click', () => {
                this.guardarEdicionElaboracion();
            });
        }
        
        // Calcular rendimiento en el formulario de edición
        const kgRecibidosEditar = document.getElementById('kgRecibidosElaboracionEditar');
        const kgElaboradosEditar = document.getElementById('kgElaboradosElaboracionEditar');
        const rendimientoEditar = document.getElementById('rendimientoElaboracionEditar');
        
        if (kgRecibidosEditar && kgElaboradosEditar) {
            const calcularRendimientoEditar = () => {
                if (kgRecibidosEditar.value && kgElaboradosEditar.value) {
                    const recibidos = parseFloat(kgRecibidosEditar.value);
                    const elaborados = parseFloat(kgElaboradosEditar.value);
                    if (recibidos > 0) {
                        const rend = ((elaborados / recibidos) * 100).toFixed(2);
                        rendimientoEditar.value = rend + '%';
                    }
                }
            };
            
            kgRecibidosEditar.addEventListener('input', calcularRendimientoEditar);
            kgElaboradosEditar.addEventListener('input', calcularRendimientoEditar);
        }
        
        // Inicializar fecha actual en el formulario
        const fechaElaboracion = document.getElementById('fechaElaboracion');
        if (fechaElaboracion) {
            const ahora = new Date();
            fechaElaboracion.value = ahora.toISOString().split('T')[0];
            
            // Inicializar los elementos de cálculo de insumos
            document.getElementById('infoCalculoSal').textContent = '';
            document.getElementById('infoCalculoHidral').textContent = '';
            document.getElementById('infoCalculoHydromar').textContent = '';
        }
    },

    // Cargar lotes disponibles en el selector
    cargarLotesDisponibles(productoId, cantidadNecesaria) {
        const selectorIds = {
            'sal': 'loteSalSeleccionado',
            'hidral70': 'loteHidralSeleccionado',
            'hydromar4': 'loteHydromarSeleccionado'
        };
        
        const selectorId = selectorIds[productoId];
        const selector = document.getElementById(selectorId);
        
        if (!selector) {
            console.error(`No se encontró el selector con ID: ${selectorId}`);
            return;
        }
        
        // Limpiar el selector manteniendo la primera opción
        selector.innerHTML = '<option value="">Seleccionar lote...</option>';
        
        // Obtener los lotes disponibles
        const lotes = this.getLotesDisponiblesPorProducto(productoId);
        
        if (!lotes || lotes.length === 0) {
            const option = document.createElement('option');
            option.disabled = true;
            option.textContent = 'No hay lotes disponibles';
            selector.appendChild(option);
            return;
        }
        
        // Agregar los lotes al selector
        lotes.forEach(lote => {
            const option = document.createElement('option');
            option.value = lote.numLote;
            option.dataset.cantidad = lote.cantidad;
            
            const stockSuficiente = lote.cantidad >= cantidadNecesaria;
            const unidad = productoId === 'hydromar4' ? 'L' : 'Kg';
            
            option.textContent = `Lote ${lote.numLote} - ${lote.cantidad.toFixed(1)} ${unidad} ${stockSuficiente ? '✓' : '⚠️'}`;
            option.classList.add(stockSuficiente ? 'text-success' : 'text-warning');
            
            selector.appendChild(option);
        });
        
        // Agregar evento de cambio
        selector.addEventListener('change', () => {
            const selectedOption = selector.options[selector.selectedIndex];
            if (selectedOption.value) {
                const cantidad = parseFloat(selectedOption.dataset.cantidad);
                this.actualizarInfoLote(productoId, selectedOption.value, cantidad, cantidadNecesaria);
            } else {
                this.limpiarInfoLote(productoId);
            }
        });
    },

    // Actualizar información del lote seleccionado
    actualizarInfoLote(productoId, numLote, cantidadDisponible, cantidadNecesaria) {
        const infoIds = {
            'sal': 'infoLoteSal',
            'hidral70': 'infoLoteHidral',
            'hydromar4': 'infoLoteHydromar'
        };
        
        const infoElement = document.getElementById(infoIds[productoId]);
        if (!infoElement) return;
        
        const stockSuficiente = cantidadDisponible >= cantidadNecesaria;
        const unidad = productoId === 'hydromar4' ? 'L' : 'Kg';
        
        infoElement.innerHTML = `
            <div class="mt-1">
                <span class="${stockSuficiente ? 'text-success' : 'text-warning'}">
                    <i class="fas fa-${stockSuficiente ? 'check-circle' : 'exclamation-circle'}"></i>
                    Stock disponible: ${cantidadDisponible.toFixed(1)} ${unidad}
                </span>
                ${!stockSuficiente ? `
                <br>
                <small class="text-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    Necesario: ${cantidadNecesaria.toFixed(1)} ${unidad}
                </small>
                ` : ''}
            </div>
        `;
    },

    // Limpiar información del lote
    limpiarInfoLote(productoId) {
        const infoIds = {
            'sal': 'infoLoteSal',
            'hidral70': 'infoLoteHidral',
            'hydromar4': 'infoLoteHydromar'
        };
        
        const infoElement = document.getElementById(infoIds[productoId]);
        if (infoElement) {
            infoElement.innerHTML = '';
        }
    },

    // Formatear ID del producto para usar en selectores
    formatearIdProducto(productoId) {
        switch(productoId) {
            case 'sal':
                return 'Sal';
            case 'hidral70':
                return 'Hidral';
            case 'hydromar4':
                return 'Hydromar';
            default:
                return productoId.charAt(0).toUpperCase() + productoId.slice(1);
        }
    },

    // Obtener lotes disponibles para un producto específico
    getLotesDisponiblesPorProducto(productoId) {
        // Obtener todos los movimientos de inventario
        const movimientos = DB.getAll('inventario');
        
        // Filtrar por el producto específico
        const movimientosProducto = movimientos.filter(m => m.productoId === productoId);
        
        // Agrupar por número de lote y calcular stock disponible
        const lotes = {};
        
        // Primero procesar las entradas
        movimientosProducto
            .filter(m => m.tipo === 'entrada' && m.numLote)
            .forEach(entrada => {
                if (!lotes[entrada.numLote]) {
                    lotes[entrada.numLote] = {
                        cantidad: 0,
                        fecha: entrada.fecha,
                        observaciones: entrada.observaciones || '',
                        proveedor: entrada.proveedor || ''
                    };
                }
                lotes[entrada.numLote].cantidad += entrada.cantidad;
            });
        
        // Luego restar las salidas
        movimientosProducto
            .filter(m => m.tipo === 'salida' && m.numLote)
            .forEach(salida => {
                if (lotes[salida.numLote]) {
                    lotes[salida.numLote].cantidad -= salida.cantidad;
                }
            });
        
        // Filtrar lotes con stock positivo y ordenar por fecha descendente
        return Object.entries(lotes)
            .filter(([_, info]) => info.cantidad > 0)
            .map(([numLote, info]) => ({
                numLote,
                cantidad: info.cantidad,
                fecha: info.fecha,
                observaciones: info.observaciones,
                proveedor: info.proveedor
            }))
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    },

    // Guardar nueva elaboración
    guardarElaboracion() {
        const fecha = document.getElementById('fechaElaboracion').value;
        const proveedor = document.getElementById('proveedorElaboracion').value;
        const lote = document.getElementById('loteElaboracion').value;
        const kgRecibidos = parseFloat(document.getElementById('kgRecibidosElaboracion').value);
        const kgElaborados = parseFloat(document.getElementById('kgElaboradosElaboracion').value);
        const observaciones = document.getElementById('observacionesElaboracion').value;
        
        // Validar campos requeridos
        if (!fecha || !proveedor || !lote || isNaN(kgRecibidos) || isNaN(kgElaborados)) {
            UI.mostrarNotificacion('Por favor complete todos los campos obligatorios', 'error');
            return;
        }
        
        // Validar selección de lotes para los insumos
        const loteSal = document.getElementById('loteSalSeleccionado').value;
        const loteHidral = document.getElementById('loteHidralSeleccionado').value;
        const loteHydromar = document.getElementById('loteHydromarSeleccionado').value;
        
        if (!loteSal || !loteHidral || !loteHydromar) {
            UI.mostrarNotificacion('Debe seleccionar los lotes para todos los insumos', 'error');
            return;
        }
        
        // Calcular rendimiento
        const rendimiento = (kgElaborados / kgRecibidos * 100).toFixed(2) + '%';
        
        // Calcular número de sacos (cada saco es de 20kg)
        const nSacos = Math.ceil(kgElaborados / 20);
        
        // Calcular número de bins (cada bin lleva 12 sacos)
        const nBins = Math.ceil(nSacos / 12);
        
        // Calcular cantidades de insumos automáticamente
        const cantidadSal = nBins * 12.5;
        const cantidadHidral = nBins * 6;
        const cantidadHydromar = nBins * 1;
        
        // Verificar stock disponible para cada lote seleccionado
        const lotesSal = this.getLotesDisponiblesPorProducto('sal');
        const lotesHidral = this.getLotesDisponiblesPorProducto('hidral70');
        const lotesHydromar = this.getLotesDisponiblesPorProducto('hydromar4');
        
        const loteSeleccionadoSal = lotesSal.find(l => l.numLote === loteSal);
        const loteSeleccionadoHidral = lotesHidral.find(l => l.numLote === loteHidral);
        const loteSeleccionadoHydromar = lotesHydromar.find(l => l.numLote === loteHydromar);
        
        // Verificar si hay suficiente stock en los lotes seleccionados
        if (!loteSeleccionadoSal || loteSeleccionadoSal.cantidad < cantidadSal) {
            UI.mostrarNotificacion(`Stock insuficiente de SAL en el lote ${loteSal}. Disponible: ${loteSeleccionadoSal?.cantidad || 0} Kg`, 'error');
            return;
        }
        
        if (!loteSeleccionadoHidral || loteSeleccionadoHidral.cantidad < cantidadHidral) {
            UI.mostrarNotificacion(`Stock insuficiente de HIDRAL-70 en el lote ${loteHidral}. Disponible: ${loteSeleccionadoHidral?.cantidad || 0} Kg`, 'error');
            return;
        }
        
        if (!loteSeleccionadoHydromar || loteSeleccionadoHydromar.cantidad < cantidadHydromar) {
            UI.mostrarNotificacion(`Stock insuficiente de HYDROMAR-4 en el lote ${loteHydromar}. Disponible: ${loteSeleccionadoHydromar?.cantidad || 0} L`, 'error');
            return;
        }
        
        // Recopilar insumos utilizados con sus lotes
        const insumos = [
            {
                id: 'sal',
                nombre: 'SAL',
                cantidad: cantidadSal,
                unidad: 'Kg',
                lote: loteSal
            },
            {
                id: 'hidral70',
                nombre: 'HIDRAL-70',
                cantidad: cantidadHidral,
                unidad: 'Kg',
                lote: loteHidral
            },
            {
                id: 'hydromar4',
                nombre: 'HYDROMAR-4',
                cantidad: cantidadHydromar,
                unidad: 'L',
                lote: loteHydromar
            }
        ];
        
        // Crear objeto de elaboración
        const elaboracion = {
            id: `elab_${Date.now()}`,
            fecha,
            proveedor,
            lote,
            kgRecibidos,
            kgElaborados,
            rendimiento,
            observaciones,
            insumos,
            nSacos,
            nBins,
            createdAt: new Date().toISOString()
        };
        
        // Guardar elaboración
        const resultado = DB.add('elaboraciones', elaboracion);
        
        if (resultado) {
            // Registrar consumo de insumos
            this.registrarConsumoInsumos(resultado);
            
            // Limpiar formulario
            document.getElementById('formNuevaElaboracion').reset();
            document.getElementById('rendimientoElaboracion').value = '';
            this.limpiarInfoLote('sal');
            this.limpiarInfoLote('hidral70');
            this.limpiarInfoLote('hydromar4');
            
            // Notificar evento de elaboración creada
            document.dispatchEvent(new CustomEvent('elaboracionCreada', { 
                detail: { elaboracion: resultado } 
            }));
            
            // Notificar actualización de datos para el dashboard
            document.dispatchEvent(new CustomEvent('datosActualizados', { 
                detail: { 
                    tipo: 'elaboracion',
                    data: {
                        fecha: fecha,
                        kgRecibidos: kgRecibidos,
                        kgElaborados: kgElaborados,
                        rendimiento: rendimiento
                    }
                } 
            }));
            
            // Actualizar lista de elaboraciones
            this.mostrarElaboraciones();
            
            // Actualizar métricas en el dashboard
            this.actualizarMetricasDashboard();
        } else {
            UI.mostrarNotificacion('Error', 'No se pudo registrar la elaboración', 'error');
        }
    },

    // Registrar consumo de insumos en el inventario
    registrarConsumoInsumos(elaboracion) {
        if (!elaboracion.insumos || elaboracion.insumos.length === 0) return;
        
        // Obtener todos los movimientos de inventario una sola vez
        const movimientosInventario = DB.getAll('inventario');
        
        // Procesar cada insumo
        for (const insumo of elaboracion.insumos) {
            if (!insumo.cantidad || insumo.cantidad <= 0 || !insumo.lote) continue;
            
            // Calcular stock actual del lote específico
            const stockLote = this.calcularStockLote(movimientosInventario, insumo.id, insumo.lote);
            
            if (stockLote < insumo.cantidad) {
                UI.mostrarNotificacion(
                    `Stock insuficiente de ${insumo.nombre} en el lote ${insumo.lote}. ` +
                    `Necesario: ${insumo.cantidad} ${insumo.unidad}, ` +
                    `Disponible: ${stockLote} ${insumo.unidad}`,
                    'error'
                );
                return false;
            }
            
            // Crear registro de salida
            const salida = {
                id: `inv_${Date.now()}_${insumo.id}`,
                fecha: elaboracion.fecha,
                productoId: insumo.id,
                productoNombre: insumo.nombre,
                cantidad: insumo.cantidad,
                unidad: insumo.unidad,
                tipo: 'salida',
                numLote: insumo.lote,
                elaboracionId: elaboracion.id,
                motivo: `Elaboración de rejo. Lote: ${elaboracion.lote}`,
                observaciones: elaboracion.observaciones,
                createdAt: new Date().toISOString()
            };
            
            // Guardar la salida en la base de datos
            DB.add('inventario', salida);
        }
        
        // Notificar actualización de inventario
        document.dispatchEvent(new CustomEvent('inventarioActualizado'));
        return true;
    },

    // Calcular stock actual de un lote específico
    calcularStockLote(movimientos, productoId, numLote) {
        let stock = 0;
        
        // Filtrar movimientos por producto y lote
        const movimientosLote = movimientos.filter(m => 
            m.productoId === productoId && 
            m.numLote === numLote
        );
        
        // Calcular stock sumando entradas y restando salidas
        movimientosLote.forEach(movimiento => {
            if (movimiento.tipo === 'entrada') {
                stock += movimiento.cantidad;
            } else if (movimiento.tipo === 'salida') {
                stock -= movimiento.cantidad;
            }
        });
        
        return stock;
    },

    // Obtener información de un producto por su ID
    getProductoById(productoId) {
        const productos = DB.getAll('productos');
        return productos.find(p => p.id === productoId) || null;
    },

    // Obtener las elaboraciones filtradas
    getElaboracionesFiltradas(filtroProveedor = '', filtroFechaDesde = '', filtroFechaHasta = '') {
        let elaboraciones = DB.getAll('elaboraciones');
        
        // Ordenar por fecha (más recientes primero)
        elaboraciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        // Aplicar filtro de proveedor si está definido
        if (filtroProveedor) {
            elaboraciones = elaboraciones.filter(e => 
                e.proveedor.toLowerCase().includes(filtroProveedor.toLowerCase())
            );
        }
        
        // Aplicar filtro de fecha desde
        if (filtroFechaDesde) {
            const fechaDesde = new Date(filtroFechaDesde);
            fechaDesde.setHours(0, 0, 0, 0);
            elaboraciones = elaboraciones.filter(e => new Date(e.fecha) >= fechaDesde);
        }
        
        // Aplicar filtro de fecha hasta
        if (filtroFechaHasta) {
            const fechaHasta = new Date(filtroFechaHasta);
            fechaHasta.setHours(23, 59, 59, 999);
            elaboraciones = elaboraciones.filter(e => new Date(e.fecha) <= fechaHasta);
        }
        
        return elaboraciones;
    },

    // Mostrar las elaboraciones según los filtros
    mostrarElaboraciones() {
        const contenedorElaboraciones = document.getElementById('listaElaboraciones');
        if (!contenedorElaboraciones) return;
        
        const filtroProveedor = document.getElementById('filtroProveedorElaboracion')?.value || '';
        const filtroFechaDesde = document.getElementById('filtroFechaDesdeElaboracion')?.value || '';
        const filtroFechaHasta = document.getElementById('filtroFechaHastaElaboracion')?.value || '';
        
        let elaboraciones = this.getElaboracionesFiltradas(filtroProveedor, filtroFechaDesde, filtroFechaHasta);
        
        if (elaboraciones.length === 0) {
            contenedorElaboraciones.innerHTML = `
                <div class="alert alert-info">
                    No hay elaboraciones registradas con los filtros seleccionados.
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="table-responsive">
                <table class="table table-striped table-hover table-sm">
                    <thead class="table-dark">
                        <tr>
                            <th style="width:10%">Fecha</th>
                            <th style="width:12%">Proveedor</th>
                            <th style="width:8%">Lote</th>
                            <th style="width:8%">Recibido</th>
                            <th style="width:8%">Elaborado</th>
                            <th style="width:8%">Rend.</th>
                            <th style="width:36%">Insumos</th>
                            <th style="width:10%">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        elaboraciones.forEach(elaboracion => {
            // Formatear insumos utilizados - hacerlos más compactos
            let insumosHTML = '';
            if (elaboracion.insumos && elaboracion.insumos.length > 0) {
                insumosHTML = elaboracion.insumos.map(insumo => {
                    const loteInfo = insumo.lote ? `<small class="text-muted">(L:${insumo.lote})</small>` : '';
                    return `<div class="small">${insumo.nombre}: ${insumo.cantidad}${insumo.unidad} ${loteInfo}</div>`;
                }).join('');
            } else if (elaboracion.nBins) {
                insumosHTML = `
                    <div class="small">SAL: ${elaboracion.nBins * 12.5}Kg</div>
                    <div class="small">HIDRAL-70: ${elaboracion.nBins * 6}Kg</div>
                    <div class="small">HYDROMAR-4: ${elaboracion.nBins * 1}L</div>
                `;
            }
            
            html += `
                <tr>
                    <td class="small">${new Date(elaboracion.fecha).toLocaleDateString('es-ES')}</td>
                    <td class="small fw-semibold">${elaboracion.proveedor}</td>
                    <td class="small">${elaboracion.lote}</td>
                    <td class="small">${elaboracion.kgRecibidos}Kg</td>
                    <td class="small">${elaboracion.kgElaborados}Kg</td>
                    <td class="small">${elaboracion.rendimiento}</td>
                    <td>${insumosHTML}</td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-primary btn-sm" 
                                    data-bs-toggle="tooltip" title="Ver detalle"
                                    onclick="Elaboracion.mostrarDetalleElaboracion('${elaboracion.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm"
                                    data-bs-toggle="tooltip" title="Eliminar"
                                    onclick="Elaboracion.confirmarEliminarElaboracion('${elaboracion.id}')">
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
        
        contenedorElaboraciones.innerHTML = html;
        
        // Inicializar tooltips de Bootstrap
        const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(tooltip => {
            new bootstrap.Tooltip(tooltip);
        });
    },

    // Abrir modal para editar elaboración
    editarElaboracion(id) {
        // Obtener elaboración
        const elaboracion = DB.getById('elaboraciones', id);
        
        if (!elaboracion) {
            UI.mostrarNotificacion('Error', 'No se encontró la elaboración', 'error');
            return;
        }
        
        // Guardar referencia a la elaboración en edición
        this.state.elaboracionEditando = elaboracion;
        
        // Llenar formulario
        document.getElementById('idElaboracionEditar').value = elaboracion.id;
        document.getElementById('fechaElaboracionEditar').value = elaboracion.fecha;
        document.getElementById('proveedorElaboracionEditar').value = elaboracion.proveedor;
        document.getElementById('loteElaboracionEditar').value = elaboracion.lote;
        document.getElementById('kgRecibidosElaboracionEditar').value = elaboracion.kgRecibidos;
        document.getElementById('kgElaboradosElaboracionEditar').value = elaboracion.kgElaborados;
        document.getElementById('rendimientoElaboracionEditar').value = elaboracion.rendimiento;
        document.getElementById('observacionesElaboracionEditar').value = elaboracion.observaciones || '';
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('editarElaboracionModal'));
        modal.show();
    },

    // Guardar los cambios de una elaboración editada
    guardarEdicionElaboracion() {
        const id = document.getElementById('idElaboracionEditar').value;
        const fecha = document.getElementById('fechaElaboracionEditar').value;
        const proveedor = document.getElementById('proveedorElaboracionEditar').value;
        const lote = document.getElementById('loteElaboracionEditar').value;
        const kgRecibidos = parseFloat(document.getElementById('kgRecibidosElaboracionEditar').value);
        const kgElaborados = parseFloat(document.getElementById('kgElaboradosElaboracionEditar').value);
        const observaciones = document.getElementById('observacionesElaboracionEditar').value;
        
        if (!id || !fecha || !proveedor || !lote || isNaN(kgRecibidos) || isNaN(kgElaborados)) {
            UI.mostrarNotificacion('Error', 'Por favor complete los campos requeridos', 'error');
            return;
        }
        
        // Calcular rendimiento
        const rendimiento = kgRecibidos > 0 ? (kgElaborados / kgRecibidos) * 100 : 0;
        
        // Calcular número de sacos (cada saco es de 20kg)
        const nSacos = Math.ceil(kgElaborados / 20);
        
        // Calcular número de bins (cada bin lleva 12 sacos)
        const nBins = Math.ceil(nSacos / 12);
        
        // Obtener elaboración anterior para comparar cambios
        const elaboracionAnterior = DB.getById('elaboraciones', id);
        
        if (!elaboracionAnterior) {
            UI.mostrarNotificacion('Error', 'La elaboración no existe', 'error');
            return;
        }
        
        // Calcular diferencia de bins
        const nBinsAnterior = elaboracionAnterior.nBins || 0;
        const diferenciaBins = nBins - nBinsAnterior;
        
        // Si hay aumento en los bins, verificar stock disponible
        if (diferenciaBins > 0) {
            // Verificar stock disponible para los insumos adicionales necesarios
            const consumosNecesarios = [
                { id: 'sal', nombre: 'SAL', cantidad: diferenciaBins * 12.5, unidad: 'Kg' },
                { id: 'hidral70', nombre: 'HIDRAL-70', cantidad: diferenciaBins * 6, unidad: 'Kg' },
                { id: 'hydromar4', nombre: 'HYDROMAR-4', cantidad: diferenciaBins * 1, unidad: 'L' }
            ];
            
            // Obtener productos con stock actual
            const productosStock = DB.getProductosConStock();
            
            // Verificar si hay suficiente stock para cada producto
            for (const consumo of consumosNecesarios) {
                const producto = productosStock.find(p => p.id === consumo.id);
                
                if (!producto || producto.stock < consumo.cantidad) {
                    const stockDisponible = producto ? producto.stock.toFixed(1) : '0';
                    UI.mostrarNotificacion(
                        'Error', 
                        `Stock insuficiente de ${consumo.nombre}. Necesita: ${consumo.cantidad} ${consumo.unidad}, Disponible: ${stockDisponible} ${consumo.unidad}`, 
                        'error'
                    );
                    return;
                }
            }
        }
        
        // Actualizar datos
        const actualizacion = {
            fecha,
            proveedor,
            lote,
            kgRecibidos,
            kgElaborados,
            nSacos,
            rendimiento: rendimiento.toFixed(2),
            nBins,
            observaciones,
            updatedAt: new Date().toISOString()
        };
        
        // Guardar cambios
        const resultado = DB.update('elaboraciones', id, actualizacion);
        
        if (resultado) {
            // Crear registros de insumos utilizados
            // Solo si los bins cambiaron
            if (nBins !== nBinsAnterior) {
                // Reconstruir la lista de insumos con los lotes originales si es posible
                const lotesOriginales = {};
                
                // Buscar movimientos anteriores para obtener los números de lote
                const movimientosAnteriores = DB.getAll('inventario').filter(m => 
                    m.elaboracionId === id && m.tipo === 'salida'
                );
                
                // Extraer los lotes utilizados anteriormente
                movimientosAnteriores.forEach(mov => {
                    if (mov.numLote) {
                        lotesOriginales[mov.productoId] = mov.numLote;
                    }
                });
                
                // Construir lista de insumos para la elaboración actualizada
                const insumos = [
                    {
                        id: 'sal',
                        nombre: 'SAL',
                        cantidad: nBins * 12.5,
                        unidad: 'Kg',
                        lote: lotesOriginales['sal'] || ''
                    },
                    {
                        id: 'hidral70',
                        nombre: 'HIDRAL-70',
                        cantidad: nBins * 6,
                        unidad: 'Kg',
                        lote: lotesOriginales['hidral70'] || ''
                    },
                    {
                        id: 'hydromar4',
                        nombre: 'HYDROMAR-4',
                        cantidad: nBins * 1,
                        unidad: 'L',
                        lote: lotesOriginales['hydromar4'] || ''
                    }
                ];
                
                // Actualizar la elaboración con los insumos
                DB.update('elaboraciones', id, { insumos });
                
                // Registrar nuevos consumos de insumos
                this.registrarConsumoInsumos({ ...resultado, insumos });
            }
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editarElaboracionModal'));
            if (modal) {
                modal.hide();
            }
            
            // Limpiar estado
            this.state.elaboracionEditando = null;
            
            // Disparar evento de elaboración actualizada
            document.dispatchEvent(new CustomEvent('elaboracionActualizada', { 
                detail: { 
                    elaboracion: resultado,
                    elaboracionAnterior: elaboracionAnterior
                } 
            }));
            
            // Actualizar vista
            UI.mostrarNotificacion('Éxito', 'Elaboración actualizada correctamente', 'success');
            this.mostrarElaboraciones();
        } else {
            UI.mostrarNotificacion('Error', 'No se pudo actualizar la elaboración', 'error');
        }
    },

    // Mostrar detalle de una elaboración específica
    mostrarDetalleElaboracion(id) {
        const elaboracion = DB.getById('elaboraciones', id);
        if (!elaboracion) {
            UI.mostrarNotificacion('No se encontró la elaboración', 'error');
            return;
        }
        
        // Crear modal de detalle
        const modalId = 'modalDetalleElaboracion';
        let modal = document.getElementById(modalId);
        
        // Si el modal no existe, crearlo
        if (!modal) {
            const modalHTML = `
                <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="modalDetalleElaboracionLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header bg-primary text-white">
                                <h5 class="modal-title" id="modalDetalleElaboracionLabel">Detalle de Elaboración</h5>
                                <button type="button" class="btn-close bg-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body" id="modalDetalleElaboracionBody">
                                <!-- El contenido se llenará dinámicamente -->
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            modal = document.getElementById(modalId);
        }
        
        // Formatear insumos utilizados
        let insumosHTML = '';
        if (elaboracion.insumos && elaboracion.insumos.length > 0) {
            insumosHTML = `
                <h6 class="mt-3">Insumos utilizados:</h6>
                <div class="table-responsive">
                    <table class="table table-sm table-bordered">
                        <thead class="table-light">
                            <tr>
                                <th>Insumo</th>
                                <th>Cantidad</th>
                                <th>Lote</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            elaboracion.insumos.forEach(insumo => {
                insumosHTML += `
                    <tr>
                        <td>${insumo.nombre}</td>
                        <td>${insumo.cantidad} ${insumo.unidad}</td>
                        <td>${insumo.lote || 'No especificado'}</td>
                    </tr>
                `;
            });
            
            insumosHTML += `
                        </tbody>
                    </table>
                </div>
            `;
        } else if (elaboracion.nBins) {
            // Para elaboraciones antiguas que no tienen insumos detallados
            insumosHTML = `
                <h6 class="mt-3">Insumos estimados:</h6>
                <div class="table-responsive">
                    <table class="table table-sm table-bordered">
                        <thead class="table-light">
                            <tr>
                                <th>Insumo</th>
                                <th>Cantidad estimada</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>SAL</td>
                                <td>${elaboracion.nBins * 12.5} Kg</td>
                            </tr>
                            <tr>
                                <td>HIDRAL-70</td>
                                <td>${elaboracion.nBins * 6} Kg</td>
                            </tr>
                            <tr>
                                <td>HYDROMAR-4</td>
                                <td>${elaboracion.nBins * 1} L</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        // Llenar el cuerpo del modal con los detalles
        const modalBody = document.getElementById('modalDetalleElaboracionBody');
        modalBody.innerHTML = `
            <div class="card mb-3">
                <div class="card-header bg-light">
                    <h6 class="mb-0">Información General</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Fecha:</strong> ${new Date(elaboracion.fecha).toLocaleDateString('es-ES')}</p>
                            <p><strong>Proveedor:</strong> ${elaboracion.proveedor}</p>
                            <p><strong>Lote:</strong> ${elaboracion.lote}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Kg Recibidos:</strong> ${elaboracion.kgRecibidos} Kg</p>
                            <p><strong>Kg Elaborados:</strong> ${elaboracion.kgElaborados} Kg</p>
                            <p><strong>Rendimiento:</strong> ${elaboracion.rendimiento}</p>
                        </div>
                    </div>
                    ${elaboracion.observaciones ? `
                    <div class="mt-2">
                        <strong>Observaciones:</strong>
                        <p class="mb-0">${elaboracion.observaciones}</p>
                    </div>` : ''}
                </div>
            </div>
            
            ${insumosHTML}
        `;
        
        // Mostrar el modal
        const modalBootstrap = new bootstrap.Modal(modal);
        modalBootstrap.show();
    },

    // Confirmar eliminación de una elaboración
    confirmarEliminarElaboracion(id) {
        // Verificar que la elaboración exista
        const elaboracion = DB.getById('elaboraciones', id);
        if (!elaboracion) {
            UI.mostrarNotificacion('No se encontró la elaboración', 'error');
            return;
        }
        
        // Mostrar confirmación usando el modal de UI con promesa
        UI.confirmar({
            title: 'Eliminar elaboración',
            message: `¿Está seguro de eliminar la elaboración del ${new Date(elaboracion.fecha).toLocaleDateString('es-ES')} del proveedor ${elaboracion.proveedor}?`,
            type: 'warning',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        }).then(confirmed => {
            if (confirmed) {
                this.eliminarElaboracion(id);
            }
        });
    },

    // Eliminar una elaboración
    eliminarElaboracion(id) {
        // Eliminar consumos de inventario relacionados a esta elaboración
        const movimientos = DB.getAll('inventario').filter(m => m.elaboracionId === id);
        
        if (movimientos.length > 0) {
            movimientos.forEach(movimiento => {
                DB.delete('inventario', movimiento.id);
            });
            
            // Notificar actualización de inventario
            document.dispatchEvent(new CustomEvent('inventarioActualizado'));
        }
        
        // Eliminar la elaboración
        const resultado = DB.delete('elaboraciones', id);
        
        if (resultado) {
            UI.mostrarNotificacion('Elaboración eliminada correctamente', 'success');
            this.mostrarElaboraciones();
        } else {
            UI.mostrarNotificacion('Error al eliminar la elaboración', 'error');
        }
    },

    // Calcular insumos necesarios basados en los kg elaborados
    calcularInsumosNecesarios(kgElaborados) {
        // Calcular número de sacos (cada saco es de 20kg)
        const nSacos = Math.ceil(kgElaborados / 20);
        
        // Calcular número de bins (cada bin lleva 12 sacos)
        const nBins = Math.ceil(nSacos / 12);
        
        // Calcular cantidades de insumos
        const cantidadSal = nBins * 12.5;
        const cantidadHidral = nBins * 6;
        const cantidadHydromar = nBins * 1;
        
        // Actualizar información de cálculo
        const infoSal = document.getElementById('infoCalculoSal');
        const infoHidral = document.getElementById('infoCalculoHidral');
        const infoHydromar = document.getElementById('infoCalculoHydromar');
        
        if (infoSal) {
            infoSal.textContent = `${cantidadSal.toFixed(1)} Kg`;
            infoSal.classList.remove('d-none');
        }
        if (infoHidral) {
            infoHidral.textContent = `${cantidadHidral.toFixed(1)} Kg`;
            infoHidral.classList.remove('d-none');
        }
        if (infoHydromar) {
            infoHydromar.textContent = `${cantidadHydromar.toFixed(1)} L`;
            infoHydromar.classList.remove('d-none');
        }
        
        // Cargar lotes disponibles para cada insumo
        this.cargarLotesDisponibles('sal', cantidadSal);
        this.cargarLotesDisponibles('hidral70', cantidadHidral);
        this.cargarLotesDisponibles('hydromar4', cantidadHydromar);
    },

    // Actualizar métricas en el dashboard
    actualizarMetricasDashboard() {
        const elaboraciones = DB.getAll('elaboraciones');
        
        // Calcular métricas
        const totalElaboraciones = elaboraciones.length;
        const kgTotalesElaborados = elaboraciones.reduce((total, e) => total + e.kgElaborados, 0);
        const rendimientoPromedio = elaboraciones.reduce((total, e) => {
            const rend = parseFloat(e.rendimiento);
            return total + (isNaN(rend) ? 0 : rend);
        }, 0) / (elaboraciones.length || 1);
        
        // Actualizar elementos del dashboard
        const elementosTotales = document.getElementById('totalElaboraciones');
        if (elementosTotales) {
            elementosTotales.textContent = totalElaboraciones;
        }
        
        // Actualizar otros elementos de métricas si existen
        const elementosKgElaborados = document.getElementById('kgTotalesElaborados');
        if (elementosKgElaborados) {
            elementosKgElaborados.textContent = kgTotalesElaborados.toFixed(2) + ' Kg';
        }
        
        const elementoRendimiento = document.getElementById('rendimientoPromedio');
        if (elementoRendimiento) {
            elementoRendimiento.textContent = rendimientoPromedio.toFixed(2) + '%';
        }
        
        // Actualizar gráfico de estadísticas si existe
        const chartSemanal = document.getElementById('chartSemanal');
        if (chartSemanal) {
            this.actualizarGraficoEstadisticas(elaboraciones);
        }
    },

    // Actualizar gráfico de estadísticas
    actualizarGraficoEstadisticas(elaboraciones) {
        const ctx = document.getElementById('chartSemanal');
        if (!ctx) return;
        
        // Obtener datos de la última semana
        const hoy = new Date();
        const ultimaSemana = new Date(hoy.getTime() - (7 * 24 * 60 * 60 * 1000));
        
        // Preparar datos para el gráfico
        const labels = [];
        const datos = [];
        
        for (let i = 0; i < 7; i++) {
            const fecha = new Date(ultimaSemana.getTime() + (i * 24 * 60 * 60 * 1000));
            const fechaStr = fecha.toISOString().split('T')[0];
            
            labels.push(fecha.toLocaleDateString('es-ES', { weekday: 'short' }));
            
            const elaboracionesDia = elaboraciones.filter(e => e.fecha === fechaStr);
            const kgElaboradosDia = elaboracionesDia.reduce((total, e) => total + e.kgElaborados, 0);
            datos.push(kgElaboradosDia);
        }
        
        // Crear o actualizar gráfico
        if (window.chartEstadisticas) {
            window.chartEstadisticas.destroy();
        }
        
        window.chartEstadisticas = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Kg Elaborados',
                    data: datos,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Kilogramos'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Producción Semanal'
                    }
                }
            }
        });
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Elaboracion.init();
}); 