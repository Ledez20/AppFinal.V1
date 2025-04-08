/**
 * Módulo de gestión de personal
 */

const Personal = {
    // Estado del módulo
    state: {
        personalEditando: null,
        filtros: {
            busqueda: '',
            cargo: '',
            estado: 'todos' // todos, activos, inactivos
        }
    },

    // Inicializar módulo
    init() {
        // Cargar plantilla de personal
        this.loadTemplate();
        
        // Escuchar eventos de cambio de sección
        document.addEventListener('sectionChanged', (event) => {
            if (event.detail.section === 'personal') {
                this.mostrarPersonal();
            }
        });
    },

    // Cargar plantilla HTML en la sección
    loadTemplate() {
        const template = `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Registrar Persona</h5>
                                <form id="formNuevoPersonal">
                                    <div class="mb-3">
                                        <label for="nombrePersonal" class="form-label">Nombre completo</label>
                                        <input type="text" class="form-control" id="nombrePersonal" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="cargoPersonal" class="form-label">Cargo / Rol</label>
                                        <select class="form-select" id="cargoPersonal" required>
                                            <option value="">Seleccione un cargo</option>
                                            <option value="Operario">Operario</option>
                                            <option value="Carretillero">Carretillero</option>
                                            <option value="Retráctil">Retráctil</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label for="fechaIngresoPersonal" class="form-label">Fecha de ingreso</label>
                                        <input type="date" class="form-control" id="fechaIngresoPersonal" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="telefonoPersonal" class="form-label">Teléfono</label>
                                        <input type="tel" class="form-control" id="telefonoPersonal">
                                    </div>
                                    <div class="mb-3">
                                        <label for="direccionPersonal" class="form-label">Dirección</label>
                                        <textarea class="form-control" id="direccionPersonal" rows="2"></textarea>
                                    </div>
                                    <div class="mb-3 form-check">
                                        <input type="checkbox" class="form-check-input" id="activoPersonal" checked>
                                        <label class="form-check-label" for="activoPersonal">Activo</label>
                                    </div>
                                    <div class="d-grid">
                                        <button type="submit" class="btn btn-primary">Guardar Personal</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Plantilla laboral</h5>
                                
                                <div class="row mb-3 filtros-container">
                                    <div class="col-md-4">
                                        <label for="filtroCargo" class="form-label">Filtrar por cargo</label>
                                        <select class="form-select" id="filtroCargo">
                                            <option value="">Todos los cargos</option>
                                            <option value="Operario">Operario</option>
                                            <option value="Carretillero">Carretillero</option>
                                            <option value="Retráctil">Retráctil</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label for="filtroEstado" class="form-label">Estado</label>
                                        <select class="form-select" id="filtroEstado">
                                            <option value="todos">Todos</option>
                                            <option value="activos">Activos</option>
                                            <option value="inactivos">Inactivos</option>
                                        </select>
                                    </div>
                                    <div class="col-md-5">
                                        <label for="filtroBusquedaPersonal" class="form-label">Buscar</label>
                                        <div class="input-group">
                                            <input type="text" class="form-control" id="filtroBusquedaPersonal" placeholder="Buscar por nombre...">
                                            <button class="btn btn-outline-secondary" type="button" id="btnBuscarPersonal">
                                                <i class="fas fa-search"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div id="listaPersonal" class="personal-container">
                                    <!-- El personal se cargará dinámicamente -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal para editar persona -->
            <div class="modal fade" id="editarPersonalModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Editar Personal</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="formEditarPersonal">
                                <input type="hidden" id="idPersonalEditar">
                                <div class="mb-3">
                                    <label for="nombrePersonalEditar" class="form-label">Nombre completo</label>
                                    <input type="text" class="form-control" id="nombrePersonalEditar" required>
                                </div>
                                <div class="mb-3">
                                    <label for="cargoPersonalEditar" class="form-label">Cargo / Rol</label>
                                    <select class="form-select" id="cargoPersonalEditar" required>
                                        <option value="Operario">Operario</option>
                                        <option value="Carretillero">Carretillero</option>
                                        <option value="Retráctil">Retráctil</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="fechaIngresoPersonalEditar" class="form-label">Fecha de ingreso</label>
                                    <input type="date" class="form-control" id="fechaIngresoPersonalEditar" required>
                                </div>
                                <div class="mb-3">
                                    <label for="telefonoPersonalEditar" class="form-label">Teléfono</label>
                                    <input type="tel" class="form-control" id="telefonoPersonalEditar">
                                </div>
                                <div class="mb-3">
                                    <label for="direccionPersonalEditar" class="form-label">Dirección</label>
                                    <textarea class="form-control" id="direccionPersonalEditar" rows="2"></textarea>
                                </div>
                                <div class="mb-3 form-check">
                                    <input type="checkbox" class="form-check-input" id="activoPersonalEditar">
                                    <label class="form-check-label" for="activoPersonalEditar">Activo</label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="btnGuardarEdicionPersonal">Guardar cambios</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        UI.cargarContenido('personal', template);
        
        // Inicializar eventos después de cargar la plantilla
        this.setupEventos();
    },

    // Configurar eventos para la interfaz de personal
    setupEventos() {
        // Formulario para nuevo personal
        const formNuevoPersonal = document.getElementById('formNuevoPersonal');
        if (formNuevoPersonal) {
            formNuevoPersonal.addEventListener('submit', (e) => {
                e.preventDefault();
                this.guardarPersonal();
            });
        }
        
        // Eventos para filtros
        const filtroCargo = document.getElementById('filtroCargo');
        const filtroEstado = document.getElementById('filtroEstado');
        const filtroBusqueda = document.getElementById('filtroBusquedaPersonal');
        const btnBuscar = document.getElementById('btnBuscarPersonal');
        
        if (filtroCargo) {
            filtroCargo.addEventListener('change', () => {
                this.state.filtros.cargo = filtroCargo.value;
                this.mostrarPersonal();
            });
        }
        
        if (filtroEstado) {
            filtroEstado.addEventListener('change', () => {
                this.state.filtros.estado = filtroEstado.value;
                this.mostrarPersonal();
            });
        }
        
        if (filtroBusqueda && btnBuscar) {
            filtroBusqueda.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.state.filtros.busqueda = filtroBusqueda.value;
                    this.mostrarPersonal();
                }
            });
            
            btnBuscar.addEventListener('click', () => {
                this.state.filtros.busqueda = filtroBusqueda.value;
                this.mostrarPersonal();
            });
        }
        
        // Eventos para editar personal
        const btnGuardarEdicion = document.getElementById('btnGuardarEdicionPersonal');
        if (btnGuardarEdicion) {
            btnGuardarEdicion.addEventListener('click', () => {
                this.guardarEdicionPersonal();
            });
        }
        
        // Inicializar fecha actual en el formulario
        const fechaIngreso = document.getElementById('fechaIngresoPersonal');
        if (fechaIngreso) {
            const hoy = new Date().toISOString().split('T')[0];
            fechaIngreso.value = hoy;
        }
    },

    // Guardar un nuevo personal
    guardarPersonal() {
        const nombre = document.getElementById('nombrePersonal').value;
        const cargo = document.getElementById('cargoPersonal').value;
        const fechaIngreso = document.getElementById('fechaIngresoPersonal').value;
        const telefono = document.getElementById('telefonoPersonal').value;
        const direccion = document.getElementById('direccionPersonal').value;
        const activo = document.getElementById('activoPersonal').checked;
        
        if (!nombre || !cargo || !fechaIngreso) {
            UI.mostrarNotificacion('Error', 'Por favor complete los campos requeridos', 'error');
            return;
        }
        
        // Crear nueva persona
        const nuevaPersona = {
            nombre,
            cargo,
            fechaIngreso,
            telefono,
            direccion,
            activo
        };
        
        // Guardar en la base de datos
        const resultado = DB.add('personal', nuevaPersona);
        
        if (resultado) {
            // Limpiar formulario
            document.getElementById('nombrePersonal').value = '';
            document.getElementById('cargoPersonal').value = '';
            document.getElementById('telefonoPersonal').value = '';
            document.getElementById('direccionPersonal').value = '';
            
            // Actualizar vista
            this.mostrarPersonal();
            
            // Notificar éxito
            UI.mostrarNotificacion('Éxito', 'Personal registrado correctamente', 'success');
            
            // Notificar a otros módulos que se ha actualizado el personal
            const event = new CustomEvent('personalActualizado', {
                detail: { persona: resultado }
            });
            document.dispatchEvent(event);
            
            // Actualizar dashboard si está visible
            if (document.getElementById('dashboard').classList.contains('active')) {
                App.actualizarResumenPersonal();
            }
        } else {
            UI.mostrarNotificacion('Error', 'No se pudo registrar el personal', 'error');
        }
    },

    // Obtener personal con filtros aplicados
    getPersonalFiltrado() {
        let personal = DB.getAll('personal');
        
        // Aplicar filtros
        if (this.state.filtros.cargo) {
            personal = personal.filter(p => p.cargo === this.state.filtros.cargo);
        }
        
        if (this.state.filtros.estado === 'activos') {
            personal = personal.filter(p => p.activo !== false);
        } else if (this.state.filtros.estado === 'inactivos') {
            personal = personal.filter(p => p.activo === false);
        }
        
        if (this.state.filtros.busqueda) {
            const busqueda = this.state.filtros.busqueda.toLowerCase();
            personal = personal.filter(p => 
                p.nombre.toLowerCase().includes(busqueda) || 
                (p.telefono && p.telefono.includes(busqueda))
            );
        }
        
        // Ordenar por nombre
        personal.sort((a, b) => a.nombre.localeCompare(b.nombre));
        
        return personal;
    },

    // Mostrar el personal según los filtros
    mostrarPersonal() {
        const personal = this.getPersonalFiltrado();
        const container = document.getElementById('listaPersonal');
        
        if (!container) return;
        
        if (personal.length === 0) {
            container.innerHTML = `
                <div class="placeholder-message">
                    <i class="fas fa-users"></i>
                    <p>No hay personal registrado que coincida con los filtros</p>
                </div>
            `;
            return;
        }
        
        // Crear tabla de personal
        const columnas = [
            { titulo: 'Nombre', valor: 'nombre' },
            { titulo: 'Cargo', valor: 'cargo' },
            { titulo: 'Fecha Ingreso', valor: (p) => {
                return new Date(p.fechaIngreso).toLocaleDateString('es-ES');
            }},
            { titulo: 'Estado', valor: (p) => {
                return p.activo !== false ? 
                    '<span class="badge bg-success">Activo</span>' : 
                    '<span class="badge bg-secondary">Inactivo</span>';
            }},
            { titulo: 'Acciones', valor: (p) => {
                return `
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn-outline-primary btn-editar-personal" data-id="${p.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger btn-eliminar-personal" data-id="${p.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
            }}
        ];
        
        // Generar tabla HTML
        container.innerHTML = UI.crearTabla(personal, columnas);
        
        // Asignar eventos a los botones de acciones
        this.setupBotonesPersonal();
    },

    // Configurar eventos para los botones de acciones en personal
    setupBotonesPersonal() {
        // Botones de editar
        const botonesEditar = document.querySelectorAll('.btn-editar-personal');
        botonesEditar.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                this.editarPersonal(id);
            });
        });
        
        // Botones de eliminar
        const botonesEliminar = document.querySelectorAll('.btn-eliminar-personal');
        botonesEliminar.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                this.confirmarEliminarPersonal(id);
            });
        });
    },

    // Abrir modal para editar personal
    editarPersonal(id) {
        // Obtener persona
        const persona = DB.getById('personal', id);
        
        if (!persona) {
            UI.mostrarNotificacion('Error', 'No se encontró el registro de personal', 'error');
            return;
        }
        
        // Guardar referencia a la persona en edición
        this.state.personalEditando = persona;
        
        // Llenar formulario
        document.getElementById('idPersonalEditar').value = persona.id;
        document.getElementById('nombrePersonalEditar').value = persona.nombre;
        document.getElementById('cargoPersonalEditar').value = persona.cargo;
        document.getElementById('fechaIngresoPersonalEditar').value = persona.fechaIngreso;
        document.getElementById('telefonoPersonalEditar').value = persona.telefono || '';
        document.getElementById('direccionPersonalEditar').value = persona.direccion || '';
        document.getElementById('activoPersonalEditar').checked = persona.activo !== false;
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('editarPersonalModal'));
        modal.show();
    },

    // Guardar cambios en la persona editada
    guardarEdicionPersonal() {
        const id = document.getElementById('idPersonalEditar').value;
        const nombre = document.getElementById('nombrePersonalEditar').value;
        const cargo = document.getElementById('cargoPersonalEditar').value;
        const fechaIngreso = document.getElementById('fechaIngresoPersonalEditar').value;
        const telefono = document.getElementById('telefonoPersonalEditar').value;
        const direccion = document.getElementById('direccionPersonalEditar').value;
        const activo = document.getElementById('activoPersonalEditar').checked;
        
        if (!nombre || !cargo || !fechaIngreso) {
            UI.mostrarNotificacion('Error', 'Por favor complete los campos requeridos', 'error');
            return;
        }
        
        // Actualizar persona
        const resultado = DB.update('personal', id, {
            nombre,
            cargo,
            fechaIngreso,
            telefono,
            direccion,
            activo,
            updatedAt: new Date().toISOString()
        });
        
        if (resultado) {
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editarPersonalModal'));
            modal.hide();
            
            // Limpiar referencia
            this.state.personalEditando = null;
            
            // Actualizar vista
            this.mostrarPersonal();
            
            // Notificar éxito
            UI.mostrarNotificacion('Éxito', 'Personal actualizado correctamente', 'success');
            
            // Notificar a otros módulos que se ha actualizado el personal
            const event = new CustomEvent('personalActualizado', {
                detail: { persona: resultado }
            });
            document.dispatchEvent(event);
            
            // Actualizar dashboard si está visible
            if (document.getElementById('dashboard').classList.contains('active')) {
                App.actualizarResumenPersonal();
            }
        } else {
            UI.mostrarNotificacion('Error', 'No se pudo actualizar el personal', 'error');
        }
    },

    // Confirmar eliminación de persona
    confirmarEliminarPersonal(id) {
        UI.confirmar({
            title: 'Eliminar personal',
            message: '¿Está seguro de eliminar esta persona? Esta acción no se puede deshacer.',
            type: 'warning',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        }).then(confirmed => {
            if (confirmed) {
                this.eliminarPersonal(id);
            }
        });
    },

    // Eliminar persona
    eliminarPersonal(id) {
        const resultado = DB.delete('personal', id);
        
        if (resultado) {
            // Actualizar vista
            this.mostrarPersonal();
            
            // Notificar éxito
            UI.mostrarNotificacion('Éxito', 'Personal eliminado correctamente', 'success');
            
            // Notificar a otros módulos que se ha eliminado personal
            const event = new CustomEvent('personalActualizado', {
                detail: { eliminado: true, id: id }
            });
            document.dispatchEvent(event);
            
            // Actualizar dashboard si está visible
            if (document.getElementById('dashboard').classList.contains('active')) {
                App.actualizarResumenPersonal();
            }
        } else {
            UI.mostrarNotificacion('Error', 'No se pudo eliminar el personal', 'error');
        }
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Personal.init();
}); 