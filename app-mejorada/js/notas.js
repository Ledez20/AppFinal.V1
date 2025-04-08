/**
 * Módulo de gestión de notas y programación
 */

const Notas = {
    // Estado del módulo
    state: {
        notaEditando: null,
        filtros: {
            fecha: '',
            area: '',
            busqueda: '',
            persona: ''
        }
    },

    // Inicializar módulo
    init() {
        // Cargar plantilla de notas
        this.loadTemplate();
        
        // Escuchar eventos de cambio de sección
        document.addEventListener('sectionChanged', (event) => {
            if (event.detail.section === 'notas') {
                this.verificarYCargarPersonal();
                this.mostrarNotas();
            }
        });
        
        // Escuchar eventos de actualización de personal
        document.addEventListener('personalActualizado', () => {
            if (document.getElementById('notas').classList.contains('active')) {
                this.cargarPersonasEnSelectores();
            }
        });
    },
    
    // Verificar datos de personal y cargar en selectores
    verificarYCargarPersonal() {
        const personal = DB.getAll('personal');
        console.log(`Verificando datos de personal: ${personal.length} registros encontrados`);
        
        // Cargar los datos en los selectores
        this.cargarPersonasEnSelectores();
    },

    // Cargar plantilla HTML en la sección
    loadTemplate() {
        const template = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Nueva Nota</h5>
                                <form id="formNuevaNota">
                                    <div class="mb-3">
                                        <label for="fechaNota" class="form-label">Fecha</label>
                                        <input type="date" class="form-control" id="fechaNota" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="areaNota" class="form-label">Área</label>
                                        <select class="form-select" id="areaNota" required>
                                            <option value="">Seleccione un área</option>
                                            <option value="Túnel">Túnel</option>
                                            <option value="Empaquetado">Empaquetado</option>
                                            <option value="Glaseo">Glaseo</option>
                                            <option value="Echar y tratar">Echar y tratar</option>
                                            <option value="Corte">Corte</option>
                                            <option value="Carretillo">Carretillo</option>
                                            <option value="General">General</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label for="personaNota" class="form-label">Personas Asignadas</label>
                                        <div class="input-group">
                                            <select class="form-select" id="personaNota" multiple size="3">
                                                <!-- Las personas se cargarán dinámicamente -->
                                            </select>
                                            <button class="btn btn-outline-secondary" type="button" id="btnRefrescarPersonal" title="Actualizar lista de personal">
                                                <i class="fas fa-sync-alt"></i>
                                            </button>
                                        </div>
                                        <div class="form-text">Mantén presionada la tecla Ctrl (o Cmd en Mac) para seleccionar múltiples personas</div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="contenidoNota" class="form-label">Contenido</label>
                                        <textarea class="form-control" id="contenidoNota" rows="4" required></textarea>
                                    </div>
                                    <div class="d-grid">
                                        <button type="submit" class="btn btn-primary">Guardar Nota</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Historial de Notas</h5>
                                
                                <div class="row mb-3 filtros-container">
                                    <div class="col-md-3">
                                        <label for="filtroFecha" class="form-label">Filtrar por fecha</label>
                                        <input type="date" class="form-control" id="filtroFecha">
                                    </div>
                                    <div class="col-md-3">
                                        <label for="filtroArea" class="form-label">Filtrar por área</label>
                                        <select class="form-select" id="filtroArea">
                                            <option value="">Todas las áreas</option>
                                            <option value="Túnel">Túnel</option>
                                            <option value="Empaquetado">Empaquetado</option>
                                            <option value="Glaseo">Glaseo</option>
                                            <option value="Echar y tratar">Echar y tratar</option>
                                            <option value="Corte">Corte</option>
                                            <option value="Carretillo">Carretillo</option>
                                            <option value="General">General</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label for="filtroPersona" class="form-label">Filtrar por persona</label>
                                        <select class="form-select" id="filtroPersona">
                                            <option value="">Todas las personas</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label for="filtroBusqueda" class="form-label">Buscar</label>
                                        <div class="input-group">
                                            <input type="text" class="form-control" id="filtroBusqueda" placeholder="Buscar...">
                                            <button class="btn btn-outline-secondary" type="button" id="btnBuscar">
                                                <i class="fas fa-search"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div id="listaNotas" class="notas-container">
                                    <!-- Las notas se cargarán dinámicamente -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal para editar nota -->
            <div class="modal fade" id="editarNotaModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Editar Nota</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="formEditarNota">
                                <input type="hidden" id="idNotaEditar">
                                <div class="mb-3">
                                    <label for="fechaNotaEditar" class="form-label">Fecha</label>
                                    <input type="date" class="form-control" id="fechaNotaEditar" required>
                                </div>
                                <div class="mb-3">
                                    <label for="areaNotaEditar" class="form-label">Área</label>
                                    <select class="form-select" id="areaNotaEditar" required>
                                        <option value="">Seleccione un área</option>
                                        <option value="Túnel">Túnel</option>
                                        <option value="Empaquetado">Empaquetado</option>
                                        <option value="Glaseo">Glaseo</option>
                                        <option value="Echar y tratar">Echar y tratar</option>
                                        <option value="Corte">Corte</option>
                                        <option value="Carretillo">Carretillo</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="personaNotaEditar" class="form-label">Personas Asignadas</label>
                                    <div class="input-group">
                                        <select class="form-select" id="personaNotaEditar" multiple size="3">
                                            <!-- Las personas se cargarán dinámicamente -->
                                        </select>
                                        <button class="btn btn-outline-secondary" type="button" id="btnRefrescarPersonalEditar" title="Actualizar lista de personal">
                                            <i class="fas fa-sync-alt"></i>
                                        </button>
                                    </div>
                                    <div class="form-text">Mantén presionada la tecla Ctrl (o Cmd en Mac) para seleccionar múltiples personas</div>
                                </div>
                                <div class="mb-3">
                                    <label for="contenidoNotaEditar" class="form-label">Contenido</label>
                                    <textarea class="form-control" id="contenidoNotaEditar" rows="4" required></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="btnGuardarEdicion">Guardar cambios</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        UI.cargarContenido('notas', template);
        
        // Inicializar eventos después de cargar la plantilla
        this.setupEventos();
    },

    // Cargar las personas registradas en los selectores
    cargarPersonasEnSelectores() {
        // Obtener TODAS las personas registradas (solo activas)
        const personal = DB.getAll('personal');
        const personalActivo = personal.filter(p => p.activo !== false);
        
        console.log('Datos del personal:', personal);
        console.log('Personal activo a mostrar:', personalActivo);
        
        // Ordenar alfabéticamente
        personalActivo.sort((a, b) => a.nombre.localeCompare(b.nombre));
        
        // Selectores donde cargar las personas
        const selectores = [
            document.getElementById('personaNota'),
            document.getElementById('personaNotaEditar'),
            document.getElementById('filtroPersona')
        ];
        
        selectores.forEach(selector => {
            if (!selector) {
                console.warn(`Selector '${selector}' no encontrado`);
                return;
            }
            
            // Guardar opciones actuales para depuración
            const opcionesAntes = Array.from(selector.options).map(opt => ({ 
                valor: opt.value, 
                texto: opt.textContent 
            }));
            console.log(`Opciones antes de actualizar en selector ${selector.id}:`, opcionesAntes);
            
            // Limpiar completamente el selector
            selector.innerHTML = '';
            
            // Añadir la primera opción según el selector
            if (selector.id === 'filtroPersona') {
                const opcionTodas = document.createElement('option');
                opcionTodas.value = '';
                opcionTodas.textContent = 'Todas las personas';
                selector.appendChild(opcionTodas);
            } else {
                // No agregamos ninguna opción por defecto para los selectores múltiples
            }
            
            // Registrar IDs ya añadidos para evitar duplicados
            const idsAgregados = new Set();
            
            // Añadir las personas sin duplicados
            personalActivo.forEach(persona => {
                if (!persona.id) {
                    console.warn(`Persona sin ID encontrada: ${persona.nombre}`);
                    return;
                }
                
                // Verificar que no sea un duplicado
                if (idsAgregados.has(persona.id)) {
                    console.warn(`ID duplicado encontrado y omitido: ${persona.id} (${persona.nombre})`);
                    return;
                }
                
                const option = document.createElement('option');
                option.value = persona.id;
                option.textContent = persona.nombre;
                selector.appendChild(option);
                
                // Registrar el ID como agregado
                idsAgregados.add(persona.id);
            });
            
            // Mostrar opciones después de actualizar
            const opcionesDespues = Array.from(selector.options).map(opt => ({ 
                valor: opt.value, 
                texto: opt.textContent 
            }));
            console.log(`Opciones después de actualizar en selector ${selector.id}:`, opcionesDespues);
        });
    },

    // Configurar eventos para el formulario y los filtros
    setupEventos() {
        // Cargar personas en los selectores
        this.verificarYCargarPersonal();
        
        // Eventos para botón de refrescar personal
        const btnRefrescarPersonal = document.getElementById('btnRefrescarPersonal');
        if (btnRefrescarPersonal) {
            btnRefrescarPersonal.addEventListener('click', (e) => {
                e.preventDefault();
                this.verificarYCargarPersonal();
                UI.mostrarNotificacion('Lista de personal actualizada', 'info');
            });
        }
        
        const btnRefrescarPersonalEditar = document.getElementById('btnRefrescarPersonalEditar');
        if (btnRefrescarPersonalEditar) {
            btnRefrescarPersonalEditar.addEventListener('click', (e) => {
                e.preventDefault();
                this.verificarYCargarPersonal();
                UI.mostrarNotificacion('Lista de personal actualizada', 'info');
            });
        }
        
        // Evento para guardar nueva nota
        const formNuevaNota = document.getElementById('formNuevaNota');
        if (formNuevaNota) {
            formNuevaNota.addEventListener('submit', (e) => {
                e.preventDefault();
                this.guardarNota();
            });
        }
        
        // Eventos para filtros
        const filtroFecha = document.getElementById('filtroFecha');
        const filtroArea = document.getElementById('filtroArea');
        const filtroPersona = document.getElementById('filtroPersona');
        const filtroBusqueda = document.getElementById('filtroBusqueda');
        const btnBuscar = document.getElementById('btnBuscar');
        
        if (filtroFecha) filtroFecha.addEventListener('change', () => {
            this.state.filtros.fecha = filtroFecha.value;
            this.mostrarNotas();
        });
        
        if (filtroArea) filtroArea.addEventListener('change', () => {
            this.state.filtros.area = filtroArea.value;
            this.mostrarNotas();
        });
        
        if (filtroPersona) filtroPersona.addEventListener('change', () => {
            this.state.filtros.persona = filtroPersona.value;
            this.mostrarNotas();
        });
        
        if (filtroBusqueda) filtroBusqueda.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.state.filtros.busqueda = filtroBusqueda.value;
                this.mostrarNotas();
            }
        });
        
        if (btnBuscar) btnBuscar.addEventListener('click', () => {
            this.state.filtros.busqueda = filtroBusqueda ? filtroBusqueda.value : '';
            this.mostrarNotas();
        });
        
        // Evento para guardar edición de nota
        const btnGuardarEdicion = document.getElementById('btnGuardarEdicion');
        if (btnGuardarEdicion) {
            btnGuardarEdicion.addEventListener('click', () => {
                this.guardarEdicionNota();
            });
        }
        
        // Inicializar fecha actual en el formulario
        const fechaNota = document.getElementById('fechaNota');
        if (fechaNota) {
            const ahora = new Date();
            fechaNota.value = ahora.toISOString().split('T')[0];
        }
    },

    // Guardar nueva nota
    guardarNota() {
        const fecha = document.getElementById('fechaNota').value;
        const area = document.getElementById('areaNota').value;
        const personaIds = Array.from(document.getElementById('personaNota').selectedOptions, option => option.value);
        const contenido = document.getElementById('contenidoNota').value;
        
        if (!fecha || !area || !contenido) {
            UI.mostrarNotificacion('Por favor complete los campos obligatorios', 'error');
            return;
        }
        
        // Obtener información de las personas asignadas si existen
        let personasNombres = [];
        if (personaIds.length > 0) {
            personaIds.forEach(id => {
                if (id) {
                    const personaObj = DB.getById('personal', id);
                    if (personaObj) {
                        personasNombres.push(personaObj.nombre);
                    }
                }
            });
        }
        
        const fechaObj = new Date(`${fecha}T12:00:00`); // Hora por defecto mediodía
        
        const nuevaNota = {
            id: `nota_${Date.now()}`,
            fecha: fechaObj.toISOString(),
            area,
            personaIds: personaIds.filter(id => id), // Filtrar valores vacíos
            personasNombres: personasNombres,
            contenido,
            creada: new Date().toISOString()
        };
        
        // Guardar en la base de datos
        DB.add('notas', nuevaNota);
        
        // Limpiar formulario
        document.getElementById('formNuevaNota').reset();
        
        // Reiniciar fecha actual tras reset
        document.getElementById('fechaNota').value = new Date().toISOString().split('T')[0];
        
        // Actualizar lista de notas
        this.mostrarNotas();
        
        // Notificar al usuario
        UI.mostrarNotificacion('Nota guardada correctamente', 'success');
        
        // Notificar cambio para actualizar dashboard
        document.dispatchEvent(new CustomEvent('datosActualizados', { 
            detail: { tipo: 'notas' } 
        }));
    },

    // Obtener notas filtradas
    getNotasFiltradas() {
        // Obtener todas las notas
        let notas = DB.getAll('notas');
        
        // Aplicar filtros
        if (this.state.filtros.fecha) {
            const fechaFiltro = new Date(this.state.filtros.fecha).setHours(0, 0, 0, 0);
            notas = notas.filter(nota => {
                const fechaNota = new Date(nota.fecha).setHours(0, 0, 0, 0);
                return fechaNota === fechaFiltro;
            });
        }
        
        if (this.state.filtros.area) {
            notas = notas.filter(nota => nota.area === this.state.filtros.area);
        }
        
        if (this.state.filtros.persona) {
            notas = notas.filter(nota => 
                nota.personaIds && 
                Array.isArray(nota.personaIds) && 
                nota.personaIds.includes(this.state.filtros.persona)
            );
        }
        
        if (this.state.filtros.busqueda) {
            const busqueda = this.state.filtros.busqueda.toLowerCase();
            notas = notas.filter(nota => 
                nota.contenido.toLowerCase().includes(busqueda) || 
                nota.area.toLowerCase().includes(busqueda) ||
                (nota.personasNombres && nota.personasNombres.some(nombre => 
                    nombre.toLowerCase().includes(busqueda)
                ))
            );
        }
        
        // Ordenar por fecha (más recientes primero)
        return notas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    },

    // Mostrar notas en la interfaz
    mostrarNotas() {
        const container = document.getElementById('listaNotas');
        
        if (!container) return;
        
        const notas = this.getNotasFiltradas();
        
        if (notas.length === 0) {
            container.innerHTML = `
                <div class="placeholder-message">
                    <i class="fas fa-sticky-note"></i>
                    <p>No hay notas que coincidan con los filtros</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        // Ordenar notas por fecha (más recientes primero)
        notas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        notas.forEach(nota => {
            const fechaObj = new Date(nota.fecha);
            const fecha = fechaObj.toLocaleDateString('es-ES');
            const hora = fechaObj.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Obtener el color correspondiente al área
            const colorClase = this.getColorClaseArea(nota.area);
            
            // Crear badges para personas asignadas
            let personasBadges = '';
            if (nota.personasNombres && nota.personasNombres.length > 0) {
                personasBadges = nota.personasNombres.map(nombre => 
                    `<span class="badge bg-success"><i class="fas fa-user me-1"></i>${nombre}</span>`
                ).join('');
            }
            
            // Icono para el área
            const icono = this.getIconoArea(nota.area);
            
            html += `
                <div class="nota-item ${colorClase}" data-id="${nota.id}">
                    <div class="nota-header">
                        <div class="nota-meta">
                            <span class="badge ${this.getBadgeClaseArea(nota.area)}">
                                <i class="fas ${icono} me-1"></i>${nota.area}
                            </span>
                            <span class="nota-fecha">
                                <i class="far fa-calendar-alt me-1"></i>${fecha}
                                <i class="far fa-clock ms-2 me-1"></i>${hora}
                            </span>
                        </div>
                        <div class="nota-actions">
                            <button class="btn btn-sm btn-outline-secondary btn-editar-nota" data-id="${nota.id}" title="Editar nota">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger btn-eliminar-nota" data-id="${nota.id}" title="Eliminar nota">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="nota-contenido">${nota.contenido}</div>
                    ${personasBadges ? `<div class="nota-personas">${personasBadges}</div>` : ''}
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Configurar botones de acción
        this.setupBotonesNotas();
    },

    // Obtener clase de color según el área
    getColorClaseArea(area) {
        const clases = {
            'Túnel': 'nota-tunel',
            'Empaquetado': 'nota-empaquetado',
            'Glaseo': 'nota-glaseo',
            'Echar y tratar': 'nota-echar-tratar',
            'Corte': 'nota-corte',
            'Carretillo': 'nota-carretillo',
            'General': 'nota-general'
        };
        
        return clases[area] || 'nota-general';
    },
    
    // Obtener clase de badge según el área
    getBadgeClaseArea(area) {
        const clases = {
            'Túnel': 'bg-primary',
            'Empaquetado': 'bg-success',
            'Glaseo': 'bg-info',
            'Echar y tratar': 'bg-warning',
            'Corte': 'bg-danger',
            'Carretillo': 'bg-secondary',
            'General': 'bg-dark'
        };
        
        return clases[area] || 'bg-dark';
    },
    
    // Obtener icono según el área
    getIconoArea(area) {
        const iconos = {
            'Túnel': 'fa-temperature-low',
            'Empaquetado': 'fa-box',
            'Glaseo': 'fa-tint',
            'Echar y tratar': 'fa-fish',
            'Corte': 'fa-solid fa-scissors',
            'Carretillo': 'fa-dolly',
            'General': 'fa-clipboard'
        };
        
        return iconos[area] || 'fa-clipboard';
    },

    // Configurar botones de acción para cada nota
    setupBotonesNotas() {
        // Botones de editar
        document.querySelectorAll('.btn-editar-nota').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                this.editarNota(id);
            });
        });
        
        // Botones de eliminar
        document.querySelectorAll('.btn-eliminar-nota').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                this.confirmarEliminarNota(id);
            });
        });
    },

    // Abrir modal para editar nota
    editarNota(id) {
        // Buscar nota por ID
        const nota = DB.getById('notas', id);
        
        if (!nota) {
            UI.mostrarNotificacion('Nota no encontrada', 'error');
            return;
        }
        
        // Guardar nota que se está editando
        this.state.notaEditando = nota;
        
        // Llenar el formulario de edición
        const fechaObj = new Date(nota.fecha);
        const fecha = fechaObj.toISOString().split('T')[0];
        
        document.getElementById('idNotaEditar').value = nota.id;
        document.getElementById('fechaNotaEditar').value = fecha;
        document.getElementById('areaNotaEditar').value = nota.area;
        document.getElementById('contenidoNotaEditar').value = nota.contenido;
        
        // Asegurarse de que se ha cargado la lista de personas
        this.cargarPersonasEnSelectores();
        
        // Seleccionar las personas asignadas si existen
        const personaSelect = document.getElementById('personaNotaEditar');
        if (personaSelect && nota.personaIds && Array.isArray(nota.personaIds)) {
            // Deseleccionar todas las opciones primero
            Array.from(personaSelect.options).forEach(option => {
                option.selected = false;
            });
            
            // Seleccionar las opciones correspondientes a personaIds
            nota.personaIds.forEach(personaId => {
                if (personaId) {
                    const option = Array.from(personaSelect.options).find(opt => opt.value === personaId);
                    if (option) {
                        option.selected = true;
                    }
                }
            });
        }
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('editarNotaModal'));
        modal.show();
    },

    // Guardar edición de nota
    guardarEdicionNota() {
        const id = document.getElementById('idNotaEditar').value;
        const fecha = document.getElementById('fechaNotaEditar').value;
        const area = document.getElementById('areaNotaEditar').value;
        const personaIds = Array.from(document.getElementById('personaNotaEditar').selectedOptions, option => option.value);
        const contenido = document.getElementById('contenidoNotaEditar').value;
        
        if (!fecha || !area || !contenido) {
            UI.mostrarNotificacion('Por favor complete todos los campos obligatorios', 'error');
            return;
        }
        
        // Obtener información de las personas asignadas si existen
        let personasNombres = [];
        if (personaIds.length > 0) {
            personaIds.forEach(id => {
                if (id) {
                    const personaObj = DB.getById('personal', id);
                    if (personaObj) {
                        personasNombres.push(personaObj.nombre);
                    }
                }
            });
        }
        
        const fechaObj = new Date(`${fecha}T12:00:00`); // Hora por defecto mediodía
        
        const actualizaciones = {
            fecha: fechaObj.toISOString(),
            area,
            personaIds: personaIds.filter(id => id), // Filtrar valores vacíos
            personasNombres: personasNombres,
            contenido,
            editada: new Date().toISOString()
        };
        
        // Actualizar en la base de datos
        DB.update('notas', id, actualizaciones);
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editarNotaModal'));
        modal.hide();
        
        // Actualizar lista de notas
        this.mostrarNotas();
        
        // Notificar al usuario
        UI.mostrarNotificacion('Nota actualizada correctamente', 'success');
        
        // Notificar cambio para actualizar dashboard
        document.dispatchEvent(new CustomEvent('datosActualizados', { 
            detail: { tipo: 'notas' } 
        }));
    },

    // Confirmar eliminación de nota
    confirmarEliminarNota(id) {
        if (confirm('¿Está seguro que desea eliminar esta nota?')) {
            this.eliminarNota(id);
        }
    },

    // Eliminar nota
    eliminarNota(id) {
        // Eliminar de la base de datos
        DB.delete('notas', id);
        
        // Actualizar lista de notas
        this.mostrarNotas();
        
        // Notificar al usuario
        UI.mostrarNotificacion('Nota eliminada correctamente', 'success');
        
        // Notificar cambio para actualizar dashboard
        document.dispatchEvent(new CustomEvent('datosActualizados', { 
            detail: { tipo: 'notas' } 
        }));
    }
};

// Inicializar módulo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Notas.init();
}); 