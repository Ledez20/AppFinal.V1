/**
 * Archivo principal de la aplicación
 * Contiene funciones para cargar datos iniciales y actualizar el dashboard
 */

// Definir la aplicación en el ámbito global
window.app = {
    // Estado de la aplicación
    state: {
        datosInicializados: false,
        chartSemanal: null
    },

    // Inicializar la aplicación
    init() {
        console.log('Iniciando aplicación...');
        
        // Verificar que DB esté disponible
        if (!window.DB) {
            console.warn('DB no está disponible, esperando 500ms...');
            setTimeout(() => this.init(), 500);
            return;
        }
        
        // Primero configurar la navegación
        this.setupNavigation();
        
        // Luego cargar los datos
        this.cargarDatos();
        
        // Configurar la actualización automática
        this.configurarActualizacionAutomatica();
        
        // Inicializar funcionalidades de exportación e importación
        this.initDataExportImport();
        
        // Finalmente actualizar el dashboard
        // Usar setTimeout para asegurar que el DOM esté completamente cargado
        setTimeout(() => {
            this.actualizarDashboard();
        }, 100);
    },
    
    // Configurar navegación
    setupNavigation() {
        // Añadir manejadores de eventos a los enlaces del sidebar si no se han configurado
        const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Quitar clase active de todos los enlaces
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Añadir clase active al enlace clicado
                link.classList.add('active');
                
                // Obtener el id de la sección
                const sectionId = link.getAttribute('data-section');
                
                // Cambiar título de la sección
                document.getElementById('sectionTitle').textContent = this.getSectionTitle(sectionId);
                
                // Ocultar todas las secciones
                document.querySelectorAll('.content-section').forEach(section => {
                    section.classList.remove('active');
                });
                
                // Mostrar la sección seleccionada
                const targetSection = document.getElementById(sectionId);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
                
                // Notificar cambio de sección
                document.dispatchEvent(new CustomEvent('sectionChanged', { 
                    detail: { section: sectionId } 
                }));
                
                // En móvil, cerrar sidebar y overlay
                this.closeMobileMenu();
            });
        });
        
        // Configurar botón de toggle del sidebar
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
        
        // Configurar overlay para cerrar el sidebar en móvil
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }
    },
    
    // Abrir/cerrar menú móvil
    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
        
        if (overlay) {
            overlay.classList.toggle('active');
        }
        
        // Evitar scroll en el body cuando el menú está abierto
        if (sidebar && sidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    },
    
    // Cerrar menú móvil
    closeMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) {
            sidebar.classList.remove('active');
        }
        
        if (overlay) {
            overlay.classList.remove('active');
        }
        
        // Restaurar scroll
        document.body.style.overflow = '';
    },
    
    // Obtener título de la sección
    getSectionTitle(sectionId) {
        const titles = {
            'dashboard': 'Dashboard',
            'notas': 'Notas y Programación',
            'personal': 'Gestión de Personal',
            'operaciones': 'Descarga y clasificación',
            'elaboracion': 'Elaboración',
            'inventario': 'Inventario',
            'nomina': 'Nómina',
            'reportes': 'Reportes',
            'configuracion': 'Configuración'
        };
        
        return titles[sectionId] || 'Dashboard';
    },
    
    // Cargar datos iniciales si no existen
    cargarDatos() {
        console.log('Verificando datos iniciales...');
        
        // Verificar si hay datos
        const operaciones = DB.getAll('operaciones');
        const notas = DB.getAll('notas');
        
        if (operaciones.length === 0) {
            console.log('Cargando datos de ejemplo para operaciones...');
            
            // Fechas para los últimos 7 días
            const fechas = [];
            for (let i = 6; i >= 0; i--) {
                const fecha = new Date();
                fecha.setDate(fecha.getDate() - i);
                fechas.push(fecha.toISOString().split('T')[0]);
            }
            
            // Datos de ejemplo para operaciones
            const operacionesEjemplo = [
                { tipo: 'Descarga', lugar: 'FRIGALSA', fecha: fechas[0], descripcion: 'Descarga matutina' },
                { tipo: 'Clasificación', lugar: 'FRIGALSA', fecha: fechas[1], descripcion: 'Clasificación estándar' },
                { tipo: 'Descarga', lugar: 'ISP', fecha: fechas[2], descripcion: 'Descarga vespertina' },
                { tipo: 'Clasificación', lugar: 'PAY-PAY', fecha: fechas[3], descripcion: 'Clasificación especial' },
                { tipo: 'Descarga', lugar: 'ATUNLO', fecha: fechas[4], descripcion: 'Descarga programada' },
                { tipo: 'Clasificación', lugar: 'ISP', fecha: fechas[5], descripcion: 'Clasificación urgente' },
                { tipo: 'Descarga', lugar: 'PAY-PAY', fecha: fechas[6], descripcion: 'Descarga especial' }
            ];
            
            operacionesEjemplo.forEach(op => DB.add('operaciones', op));
        }
        
        if (notas.length === 0) {
            console.log('Cargando datos de ejemplo para notas...');
            
            // Fechas para los últimos 7 días
            const fechas = [];
            for (let i = 6; i >= 0; i--) {
                const fecha = new Date();
                fecha.setDate(fecha.getDate() - i);
                fechas.push(fecha.toISOString().split('T')[0]);
            }
            
            // Datos de ejemplo para notas
            const notasEjemplo = [
                { area: 'Túnel', fecha: fechas[0], contenido: 'Revisión de temperatura' },
                { area: 'Empaquetado', fecha: fechas[1], contenido: 'Control de calidad' },
                { area: 'Glaseo', fecha: fechas[2], contenido: 'Mantenimiento programado' },
                { area: 'Corte', fecha: fechas[3], contenido: 'Ajuste de máquinas' },
                { area: 'Echar y tratar', fecha: fechas[4], contenido: 'Inspección de proceso' },
                { area: 'Túnel', fecha: fechas[5], contenido: 'Limpieza general' },
                { area: 'Empaquetado', fecha: fechas[6], contenido: 'Cambio de turno' }
            ];
            
            notasEjemplo.forEach(nota => DB.add('notas', nota));
        }
        
        console.log('Verificación de datos completada');
    },
    
    // Actualizar todas las secciones del dashboard
    actualizarDashboard() {
        console.log('Actualizando dashboard...');
        this.actualizarActividadesHoy();
        this.actualizarOperacionesRecientes();
        this.actualizarResumenPersonal();
        this.actualizarEstadisticasSemanales();
        this.actualizarProximasActividades();
        this.actualizarGraficosProduccion();
        this.actualizarGraficosNotas();
    },

    // Actualizar actividades de hoy en el dashboard
    actualizarActividadesHoy() {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const hoyStr = hoy.toISOString().split('T')[0];
        
        // Obtener notas para hoy
        const notas = DB.getAll('notas').filter(nota => {
            const fechaNota = new Date(nota.fecha);
            fechaNota.setHours(0, 0, 0, 0);
            return fechaNota.getTime() === hoy.getTime();
        }).map(nota => ({
            id: nota.id,
            tipo: 'nota',
            fecha: nota.fecha,
            area: nota.area,
            detalle: nota.contenido,
            personasNombres: nota.personasNombres || []
        }));

        // Obtener operaciones para hoy
        const operaciones = DB.getAll('operaciones').filter(op => 
            op.fecha === hoyStr && (op.tipo === 'Descarga' || op.tipo === 'Clasificación')
        ).map(op => ({
            id: op.id,
            tipo: 'operacion',
            fecha: op.fecha,
            titulo: `${op.tipo}: ${op.lugar}`,
            detalle: op.descripcion || '',
            lugar: op.lugar,
            tipoOperacion: op.tipo,
            personasNombres: op.personasNombres || [],
            estado: op.estado || 'pendiente'
        }));
        
        // Combinar notas y operaciones
        const todas = [...notas, ...operaciones].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        
        const container = document.getElementById('actividadesHoy');
        const operacionesContainer = document.getElementById('descargasClasificacionesHoy');
        
        // Limpiar los contenedores
        container.innerHTML = '';
        
        if (operacionesContainer) {
            operacionesContainer.innerHTML = '';
        }
        
        // Mostrar notas en el contenedor de actividades
        if (notas.length === 0) {
            container.innerHTML = `
                <div class="placeholder-message">
                    <i class="fas fa-calendar-day"></i>
                    <p>No hay actividades programadas para hoy</p>
                </div>
            `;
        } else {
            // Ordenar notas por hora (si existe)
            notas.sort((a, b) => {
                const fechaA = new Date(a.fecha);
                const fechaB = new Date(b.fecha);
                return fechaA - fechaB;
            });
            
            // Mostrar todas las notas
            notas.forEach(actividad => {
                const fecha = new Date(actividad.fecha);
                const horaFormateada = fecha.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                
                // Obtener el área correcta desde la actividad
                const areaTrabajo = actividad.area || 'General';
                
                // Asignar color según el área
                let claseBadge = 'bg-primary';
                switch (areaTrabajo.toLowerCase()) {
                    case 'túnel':
                    case 'tunel':
                        claseBadge = 'bg-info';
                        break;
                    case 'empaquetado':
                        claseBadge = 'bg-success';
                        break;
                    case 'glaseo':
                        claseBadge = 'bg-warning text-dark';
                        break;
                    case 'corte':
                        claseBadge = 'bg-danger';
                        break;
                    case 'echar y tratar':
                        claseBadge = 'bg-primary';
                        break;
                    default:
                        claseBadge = 'bg-secondary';
                }
                
                // Crear el HTML para la actividad
                const actividadHTML = `
                    <div class="actividad-item ${actividad.tipo}">
                        <div class="d-flex justify-content-between mb-1">
                            <span class="badge ${claseBadge}">
                                <i class="fas fa-sticky-note me-1"></i>
                                ${areaTrabajo}
                            </span>
                            <small class="text-muted">
                                <i class="far fa-clock me-1"></i>${horaFormateada}
                            </small>
                        </div>
                        <div class="actividad-contenido">
                            <p class="mb-1">${actividad.detalle || actividad.contenido}</p>
                        </div>
                        <div class="actividad-personas">
                            ${this.renderizarPersonasActividad(actividad.personasNombres)}
                        </div>
                    </div>
                `;
                
                container.innerHTML += actividadHTML;
            });
        }
        
        // Mostrar operaciones en el contenedor de descargas/clasificaciones
        if (operacionesContainer) {
            if (operaciones.length === 0) {
                operacionesContainer.innerHTML = `
                    <div class="placeholder-message">
                        <i class="fas fa-truck-loading"></i>
                        <p>No hay descargas o clasificaciones programadas para hoy</p>
                    </div>
                `;
            } else {
                // Ordenar operaciones por hora (si existe)
                operaciones.sort((a, b) => {
                    const fechaA = new Date(a.fecha);
                    const fechaB = new Date(b.fecha);
                    return fechaA - fechaB;
                });
                
                // Mostrar todas las operaciones
                operaciones.forEach(operacion => {
                    const fecha = new Date(operacion.fecha);
                    const horaFormateada = fecha.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                    
                    const tipoOperacion = operacion.titulo ? 
                        operacion.titulo.split(':')[0] : 
                        (operacion.tipoOperacion || 'Operación');
                    
                    const lugarOperacion = operacion.titulo ? 
                        operacion.titulo.split(':')[1]?.trim() : 
                        '';
                    
                    const claseBadge = tipoOperacion.includes('Descarga') ? 'bg-success' : 'bg-warning text-dark';
                    
                    // Crear el HTML para la operación
                    const operacionHTML = `
                        <div class="actividad-item operacion">
                            <div class="d-flex justify-content-between mb-1">
                                <span class="badge ${claseBadge}">
                                    <i class="fas fa-truck-loading me-1"></i>
                                    ${tipoOperacion}
                                </span>
                                <small class="text-muted">
                                    <i class="far fa-clock me-1"></i>${horaFormateada}
                                </small>
                            </div>
                            <div class="actividad-contenido">
                                ${lugarOperacion ? `<p class="mb-1 fw-bold">${lugarOperacion}</p>` : ''}
                                <p class="mb-1">${operacion.detalle || ''}</p>
                            </div>
                            <div class="actividad-personas">
                                ${this.renderizarPersonasActividad(operacion.personasNombres)}
                            </div>
                        </div>
                    `;
                    
                    operacionesContainer.innerHTML += operacionHTML;
                });
            }
        }
    },

    // Actualizar operaciones recientes en el dashboard
    actualizarOperacionesRecientes() {
        const operaciones = DB.getAll('operaciones')
            .filter(op => op.tipo === 'Descarga' || op.tipo === 'Clasificación')
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        const container = document.getElementById('operacionesRecientes');
        
        if (!container) return;
        
        if (operaciones.length === 0) {
            container.innerHTML = `
                <div class="placeholder-message">
                    <i class="fas fa-truck-loading"></i>
                    <p>No hay operaciones recientes</p>
                </div>
            `;
            return;
        }
        
        // Agrupar operaciones por cliente
        const clientesOperaciones = {
            'FRIGALSA': { nombre: 'FRIGALSA', operaciones: [], total: 0, ultimaFecha: null },
            'ISP': { nombre: 'ISP', operaciones: [], total: 0, ultimaFecha: null },
            'PAY-PAY': { nombre: 'PAY-PAY', operaciones: [], total: 0, ultimaFecha: null },
            'ATUNLO': { nombre: 'ATUNLO', operaciones: [], total: 0, ultimaFecha: null }
        };
        
        // Procesar operaciones
        operaciones.forEach(op => {
            if (clientesOperaciones[op.lugar]) {
                // Añadir solo si es de los últimos 30 días
                const fechaOp = new Date(op.fecha);
                const hoy = new Date();
                const diff = Math.round((hoy - fechaOp) / (1000 * 60 * 60 * 24));
                
                if (diff <= 30) {
                    clientesOperaciones[op.lugar].total++;
                    
                    // Solo guardar las 3 más recientes para mostrar
                    if (clientesOperaciones[op.lugar].operaciones.length < 3) {
                        clientesOperaciones[op.lugar].operaciones.push(op);
                    }
                    
                    // Actualizar última fecha
                    if (!clientesOperaciones[op.lugar].ultimaFecha || 
                        new Date(op.fecha) > new Date(clientesOperaciones[op.lugar].ultimaFecha)) {
                        clientesOperaciones[op.lugar].ultimaFecha = op.fecha;
                    }
                }
            }
        });
        
        // Ordenar clientes por operaciones recientes (descendente)
        const clientesOrdenados = Object.values(clientesOperaciones)
            .filter(c => c.total > 0) // Solo mostrar clientes con operaciones
            .sort((a, b) => new Date(b.ultimaFecha) - new Date(a.ultimaFecha));
        
        // Generar HTML
        if (clientesOrdenados.length === 0) {
            container.innerHTML = `
                <div class="placeholder-message">
                    <i class="fas fa-truck-loading"></i>
                    <p>No hay operaciones recientes en ningún cliente</p>
                </div>
            `;
            return;
        }
        
        let html = `<div class="clientes-resumen">`;
        
        clientesOrdenados.forEach(cliente => {
            const ultimaFecha = new Date(cliente.ultimaFecha).toLocaleDateString('es-ES');
            
            html += `
                <div class="cliente-card">
                    <div class="cliente-header">
                        <h5 class="cliente-nombre">${cliente.nombre}</h5>
                        <span class="badge bg-primary">${cliente.total} operaciones en 30 días</span>
                    </div>
                    <div class="cliente-info">
                        <p>Última operación: ${ultimaFecha}</p>
                    </div>
                    <div class="cliente-detalles">
            `;
            
            // Mostrar últimas operaciones
            cliente.operaciones.forEach(op => {
                const fecha = new Date(op.fecha).toLocaleDateString('es-ES');
                
                html += `
                    <div class="operacion-mini">
                        <span class="badge ${op.tipoOperacion === 'Descarga' ? 'bg-success' : 'bg-warning'}">${op.tipoOperacion}</span>
                        <span class="fecha-mini">${fecha}</span>
                        ${op.personasInfo ? `<div class="personal-mini"><i class="fas fa-users"></i> ${op.personasInfo}</div>` : ''}
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        container.innerHTML = html;
    },

    // Actualizar resumen de personal
    actualizarResumenPersonal() {
        const personal = DB.getAll('personal');
        const container = document.getElementById('resumenPersonal');
        
        if (!container) return;
        
        if (personal.length === 0) {
            container.innerHTML = `
                <div class="placeholder-message">
                    <i class="fas fa-users"></i>
                    <p>No hay personal registrado</p>
                </div>
            `;
            return;
        }
        
        // Calcular estadísticas básicas
        const totalPersonal = personal.length;
        const personalActivo = personal.filter(p => p.activo !== false).length;
        
        // Agrupar por cargo
        const porCargo = {};
        personal.forEach(p => {
            if (!porCargo[p.cargo]) {
                porCargo[p.cargo] = 0;
            }
            porCargo[p.cargo]++;
        });
        
        // Crear HTML
        let html = `
            <div class="resumen-header">
                <div class="d-flex justify-content-between mb-3">
                    <div>
                        <h6 class="mb-0">Total Personal</h6>
                        <span class="fs-4 fw-bold">${totalPersonal}</span>
                    </div>
                    <div>
                        <h6 class="mb-0">Personal Activo</h6>
                        <span class="fs-4 fw-bold text-success">${personalActivo}</span>
                    </div>
                </div>
            </div>
            <div class="resumen-cargos">
                <h6 class="border-bottom pb-2">Por Cargo</h6>
        `;
        
        // Listar cargos
        Object.entries(porCargo).forEach(([cargo, cantidad]) => {
            html += `
                <div class="d-flex justify-content-between py-1">
                    <span>${cargo || 'Sin cargo'}</span>
                    <span class="badge bg-primary rounded-pill">${cantidad}</span>
                </div>
            `;
        });
        
        html += `</div>`;
        
        container.innerHTML = html;
    },

    // Actualizar próximas actividades en el dashboard
    actualizarProximasActividades() {
        const actividades = this.getProximasActividades(7);
        const container = document.getElementById('proximasActividades');
        const operacionesContainer = document.getElementById('proximasOperaciones');
        
        if (!container) return;
        
        // Limpiar contenedores
        container.innerHTML = '';
        if (operacionesContainer) {
            operacionesContainer.innerHTML = '';
        }
        
        // Separar actividades y operaciones
        const notas = actividades.filter(act => act.tipo === 'nota');
        const operaciones = actividades.filter(act => act.tipo === 'operacion');
        
        // Mostrar próximas actividades (notas)
        if (notas.length === 0) {
            container.innerHTML = `
                <div class="placeholder-message">
                    <i class="fas fa-calendar-week"></i>
                    <p>No hay actividades programadas para los próximos días</p>
                </div>
            `;
        } else {
            // Agrupar por fecha
            const porFecha = {};
            
            notas.forEach(actividad => {
                const fecha = new Date(actividad.fecha);
                const fechaStr = fecha.toLocaleDateString('es-ES', { dateStyle: 'full' });
                
                if (!porFecha[fechaStr]) {
                    porFecha[fechaStr] = [];
                }
                
                porFecha[fechaStr].push(actividad);
            });
            
            // Mostrar por fecha
            Object.keys(porFecha).forEach(fecha => {
                // Crear encabezado de fecha
                const headerHTML = `
                    <div class="fecha-header mb-3">
                        <i class="far fa-calendar-alt me-2"></i>
                        <span>${fecha}</span>
                    </div>
                `;
                
                container.innerHTML += headerHTML;
                
                // Mostrar actividades de esta fecha
                porFecha[fecha].forEach(actividad => {
                    const horaFormateada = new Date(actividad.fecha).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                    
                    // Obtener el área correcta desde la actividad
                    const areaTrabajo = actividad.area || 'General';
                    
                    // Asignar color según el área
                    let claseBadge = 'bg-primary';
                    switch (areaTrabajo.toLowerCase()) {
                        case 'túnel':
                        case 'tunel':
                            claseBadge = 'bg-info';
                            break;
                        case 'empaquetado':
                            claseBadge = 'bg-success';
                            break;
                        case 'glaseo':
                            claseBadge = 'bg-warning text-dark';
                            break;
                        case 'corte':
                            claseBadge = 'bg-danger';
                            break;
                        case 'echar y tratar':
                            claseBadge = 'bg-primary';
                            break;
                        default:
                            claseBadge = 'bg-secondary';
                    }
                    
                    const actividadHTML = `
                        <div class="actividad-item">
                            <div class="d-flex justify-content-between mb-1">
                                <span class="badge ${claseBadge}">
                                    <i class="fas fa-sticky-note me-1"></i>
                                    ${areaTrabajo}
                                </span>
                                <small class="text-muted">
                                    <i class="far fa-clock me-1"></i>${horaFormateada}
                                </small>
                            </div>
                            <div class="actividad-contenido">
                                <p class="mb-1">${actividad.detalle}</p>
                            </div>
                            <div class="actividad-personas">
                                ${this.renderizarPersonasActividad(actividad.personasNombres)}
                            </div>
                        </div>
                    `;
                    
                    container.innerHTML += actividadHTML;
                });
            });
        }
        
        // Mostrar próximas operaciones si existe el contenedor
        if (operacionesContainer) {
            if (operaciones.length === 0) {
                operacionesContainer.innerHTML = `
                    <div class="placeholder-message">
                        <i class="fas fa-truck-loading"></i>
                        <p>No hay operaciones programadas para los próximos días</p>
                    </div>
                `;
            } else {
                // Agrupar por fecha
                const porFecha = {};
                
                operaciones.forEach(operacion => {
                    const fecha = new Date(operacion.fecha);
                    const fechaStr = fecha.toLocaleDateString('es-ES', { dateStyle: 'full' });
                    
                    if (!porFecha[fechaStr]) {
                        porFecha[fechaStr] = [];
                    }
                    
                    porFecha[fechaStr].push(operacion);
                });
                
                // Mostrar por fecha
                Object.keys(porFecha).forEach(fecha => {
                    // Crear encabezado de fecha
                    const headerHTML = `
                        <div class="fecha-header mb-3">
                            <i class="far fa-calendar-alt me-2"></i>
                            <span>${fecha}</span>
                        </div>
                    `;
                    
                    operacionesContainer.innerHTML += headerHTML;
                    
                    // Mostrar operaciones de esta fecha
                    porFecha[fecha].forEach(operacion => {
                        const horaFormateada = new Date(operacion.fecha).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        });
                        
                        const tipoOperacion = operacion.tipoOperacion || 
                            (operacion.titulo ? operacion.titulo.split(':')[0] : 'Operación');
                        
                        const lugarOperacion = operacion.lugar || 
                            (operacion.titulo ? operacion.titulo.split(':')[1]?.trim() : '');
                        
                        const claseBadge = tipoOperacion.includes('Descarga') ? 'bg-success' : 'bg-warning text-dark';
                        
                        const operacionHTML = `
                            <div class="actividad-item operacion">
                                <div class="d-flex justify-content-between mb-1">
                                    <span class="badge ${claseBadge}">
                                        <i class="fas fa-truck-loading me-1"></i>
                                        ${tipoOperacion}
                                    </span>
                                    <small class="text-muted">
                                        <i class="far fa-clock me-1"></i>${horaFormateada}
                                    </small>
                                </div>
                                <div class="actividad-contenido">
                                    ${lugarOperacion ? `<p class="mb-1 fw-bold">${lugarOperacion}</p>` : ''}
                                    <p class="mb-1">${operacion.detalle || ''}</p>
                                </div>
                                <div class="actividad-personas">
                                    ${this.renderizarPersonasActividad(operacion.personasNombres)}
                                </div>
                            </div>
                        `;
                        
                        operacionesContainer.innerHTML += operacionHTML;
                    });
                });
            }
        }
    },

    // Actualizar gráfico de estadísticas semanales
    actualizarEstadisticasSemanales() {
        const canvas = document.getElementById('chartSemanal');
        if (!canvas) return;
        
        // Obtener datos para la semana actual
        const hoy = new Date();
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        
        const diasSemana = [];
        const elaboraciones = [];
        const operaciones = [];
        
        // Preparar etiquetas para los días
        const diasLabel = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        // Recolectar datos para cada día
        for (let i = 0; i < 7; i++) {
            const fecha = new Date(inicioSemana);
            fecha.setDate(inicioSemana.getDate() + i);
            const fechaStr = fecha.toISOString().split('T')[0];
            
            diasSemana.push(diasLabel[i]);
            
            // Contar elaboraciones para este día
            const notasDelDia = DB.getAll('notas').filter(n => 
                n.fecha === fechaStr && (n.area === 'Elaboración' || n.area === 'Otros')
            );
            elaboraciones.push(notasDelDia.length);
            
            // Contar operaciones para este día
            const operacionesDelDia = DB.getAll('operaciones').filter(op => 
                op.fecha === fechaStr && (op.tipo === 'Descarga' || op.tipo === 'Clasificación')
            );
            operaciones.push(operacionesDelDia.length);
        }
        
        // Si ya existe un gráfico, destruirlo para crear uno nuevo
        if (this.state.chartSemanal) {
            this.state.chartSemanal.destroy();
        }
        
        // Crear gráfico
        this.state.chartSemanal = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: diasSemana,
                datasets: [
                    {
                        label: 'Elaboraciones',
                        data: elaboraciones,
                        backgroundColor: 'rgba(52, 152, 219, 0.5)',
                        borderColor: 'rgba(52, 152, 219, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Operaciones',
                        data: operaciones,
                        backgroundColor: 'rgba(46, 204, 113, 0.5)',
                        borderColor: 'rgba(46, 204, 113, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        stacked: false
                    }
                }
            }
        });
    },

    // Obtener próximas actividades (para los próximos días)
    getProximasActividades(dias = 7) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const limite = new Date();
        limite.setDate(hoy.getDate() + dias);
        limite.setHours(23, 59, 59, 999);
        
        const hoyStr = hoy.toISOString().split('T')[0];
        const limiteStr = limite.toISOString().split('T')[0];
        
        // Obtener notas para el período
        const notas = DB.getAll('notas').filter(nota => {
            const fechaNota = new Date(nota.fecha);
            return fechaNota > hoy && fechaNota <= limite;
        }).map(nota => ({
            id: nota.id,
            tipo: 'nota',
            fecha: nota.fecha,
            area: nota.area,
            titulo: `${nota.area}`,
            detalle: nota.contenido,
            personasNombres: nota.personasNombres || []
        }));
        
        // Obtener operaciones para el período
        const operaciones = DB.getAll('operaciones').filter(op => 
            op.fecha > hoyStr && op.fecha <= limiteStr && 
            (op.tipo === 'Descarga' || op.tipo === 'Clasificación')
        ).map(op => ({
            id: op.id,
            tipo: 'operacion',
            fecha: op.fecha,
            tipoOperacion: op.tipo,
            lugar: op.lugar,
            titulo: `${op.tipo}: ${op.lugar}`,
            detalle: op.descripcion || '',
            personasNombres: op.personasNombres || [],
            estado: op.estado || 'pendiente'
        }));
        
        // Combinar notas con operaciones
        const todas = [...notas, ...operaciones].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        
        return todas;
    },

    // Renderizar badges de personas asignadas a actividades
    renderizarPersonasActividad(personasNombres) {
        if (!personasNombres || personasNombres.length === 0) {
            return '';
        }
        
        return personasNombres.map(nombre => 
            `<span class="badge bg-success">
                <i class="fas fa-user me-1"></i>${nombre}
            </span>`
        ).join(' ');
    },

    // Intentar recuperar datos en caso de fallo en la inicialización
    intentarRecuperarDatos() {
        console.log('Intentando recuperar datos desde respaldos automáticos...');
        
        try {
            // Verificar si existe el módulo de protección de datos
            if (DataProtection && typeof DataProtection.obtenerRespaldosLocales === 'function') {
                const respaldos = DataProtection.obtenerRespaldosLocales();
                
                // Si hay respaldos disponibles
                if (respaldos.length > 0) {
                    // Ordenar por fecha, más reciente primero
                    respaldos.sort((a, b) => b.timestamp - a.timestamp);
                    const ultimoRespaldo = respaldos[0];
                    
                    // Preguntar al usuario si desea restaurar
                    UI.mostrarModal({
                        title: 'Problema al iniciar la base de datos',
                        content: `
                            <div class="error-recovery">
                                <p class="alert alert-warning">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    Se ha detectado un problema con la base de datos. 
                                    Los datos podrían estar dañados o inaccesibles.
                                </p>
                                <p>Se ha encontrado un respaldo automático reciente del 
                                ${new Date(ultimoRespaldo.timestamp).toLocaleString()}</p>
                                <p>¿Deseas restaurar los datos desde este respaldo?</p>
                            </div>
                        `,
                        showCancel: true,
                        confirmText: 'Restaurar datos',
                        cancelText: 'Cancelar',
                        onConfirm: () => {
                            // Intentar restaurar desde el último respaldo
                            DataProtection.confirmarRestauracion(ultimoRespaldo)
                                .then(success => {
                                    if (!success) {
                                        this.mostrarUIRecuperacion(respaldos);
                                    }
                                })
                                .catch(err => {
                                    console.error('Error al restaurar datos:', err);
                                    this.mostrarUIRecuperacion(respaldos);
                                });
                        },
                        onCancel: () => {
                            // Mostrar opciones manuales si el usuario rechaza la restauración automática
                            this.mostrarUIRecuperacion(respaldos);
                        }
                    });
                } else {
                    // No hay respaldos disponibles
                    this.mostrarUIRecuperacion([]);
                }
            } else {
                // Si no existe el módulo de protección de datos, mostrar notificación
                console.error('El módulo de protección de datos no está disponible');
                UI.mostrarNotificacion(
                    'Error al inicializar la base de datos. No se encontró el sistema de respaldo.', 
                    'error', 
                    0, 
                    true
                );
            }
        } catch (error) {
            console.error('Error en el proceso de recuperación:', error);
            UI.mostrarNotificacion(
                'Error crítico en la aplicación. Por favor, contacta al soporte técnico.', 
                'error', 
                0, 
                true
            );
        }
    },
    
    // Mostrar UI para recuperación manual
    mostrarUIRecuperacion(respaldos) {
        let mensaje = '';
        
        if (respaldos.length > 0) {
            mensaje = 'Los datos de la aplicación no pudieron ser cargados correctamente. ' +
                      'Puedes intentar restaurar manualmente desde un respaldo o reiniciar la aplicación.';
        } else {
            mensaje = 'No se encontraron respaldos automáticos disponibles. ' +
                      'Los datos podrían haberse perdido o estar dañados. ' +
                      'Intenta reiniciar la aplicación o contacta a soporte técnico.';
        }
        
        UI.mostrarNotificacion(mensaje, 'error', 0, true);
        
        if (respaldos.length > 0) {
            // Añadir botón para mostrar opciones de restauración
            const notif = document.querySelector('.notification.error');
            if (notif) {
                const btnRecuperar = document.createElement('button');
                btnRecuperar.className = 'btn btn-warning btn-sm mt-2';
                btnRecuperar.innerHTML = '<i class="fas fa-undo-alt me-1"></i> Ver opciones de recuperación';
                btnRecuperar.onclick = () => {
                    if (DataProtection) {
                        DataProtection.showRestoreOptions();
                    }
                };
                
                const content = notif.querySelector('.notification-content');
                if (content) {
                    content.appendChild(btnRecuperar);
                }
            }
        }
    },

    // Configurar elementos UI adicionales
    setupUI() {
        // Configurar botones de la barra lateral
        document.querySelectorAll('.sidebar-navigation a[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('data-section');
                this.cambiarSeccion(sectionId);
            });
        });
        
        // Configurar botón para importar datos generales
        const btnImportarDatos = document.getElementById('btnImportarDatos');
        if (btnImportarDatos) {
            btnImportarDatos.addEventListener('click', () => {
                if (window.DataProtection && typeof window.DataProtection.importarDatosGenerales === 'function') {
                    window.DataProtection.importarDatosGenerales();
                } else {
                    UI.mostrarNotificacion('La funcionalidad de importación no está disponible', 'error');
                }
            });
        }
        
        // Configurar modal de información de la app
        const btnInfoApp = document.getElementById('btnInfoApp');
        if (btnInfoApp) {
            btnInfoApp.addEventListener('click', () => this.mostrarInfoApp());
        }
    },

    // Añadir botones de exportación
    addExportButtons: function() {
        // Botones para nóminas
        const nominaSection = document.querySelector('#nomina');
        if (nominaSection && !nominaSection.querySelector('.dashboard-actions')) {
            const dashboardHeader = document.createElement('div');
            dashboardHeader.className = 'dashboard-actions';
            dashboardHeader.innerHTML = `
                <button class="export-btn pdf" onclick="window.app.exportarNominaPDF()">
                    <i class="fas fa-file-pdf"></i> Exportar PDF
                </button>
                <button class="export-btn excel" onclick="window.app.exportarNominaExcel()">
                    <i class="fas fa-file-excel"></i> Exportar Excel
                </button>
            `;
            nominaSection.prepend(dashboardHeader);
        }
        
        // Botones para dashboard
        const dashboardSection = document.querySelector('#dashboard');
        if (dashboardSection && !dashboardSection.querySelector('.dashboard-actions')) {
            const dashboardHeader = document.createElement('div');
            dashboardHeader.className = 'dashboard-actions';
            dashboardHeader.innerHTML = `
                <h2 class="dashboard-title">Métricas de Producción</h2>
                <div class="dashboard-actions">
                    <button class="export-btn pdf" onclick="window.app.exportarMetricasPDF()">
                        <i class="fas fa-file-pdf"></i> Exportar PDF
                    </button>
                    <button class="export-btn excel" onclick="window.app.exportarMetricasExcel()">
                        <i class="fas fa-file-excel"></i> Exportar Excel
                    </button>
                </div>
            `;
            dashboardSection.prepend(dashboardHeader);
        }
    },
    
    // Obtener nómina actual
    getCurrentNomina: function() {
        try {
            // Obtener datos de la base de datos
            const nomina = Database.get('nomina') || {
                fecha: new Date().toLocaleDateString(),
                almacen: 'Almacén Principal',
                personal: [
                    { nombre: 'Juan Pérez', horas: 8, produccion: 100, total: 800 },
                    { nombre: 'María García', horas: 8, produccion: 120, total: 960 }
                ]
            };
            
            console.log('Datos de nómina obtenidos:', nomina);
            return nomina;
        } catch (error) {
            console.error('Error al obtener nómina:', error);
            UI.mostrarNotificacion('Error al obtener datos de nómina', 'error');
            return null;
        }
    },
    
    // Obtener métricas de producción
    getMetricasProduccion: function() {
        try {
            // Obtener datos de la base de datos
            const metricas = Database.get('metricas') || {
                resumen: {
                    'Producción Total': '1,200 unidades',
                    'Eficiencia Media': '85%',
                    'Personal Activo': '15 personas',
                    'Horas Trabajadas': '120 horas'
                },
                areas: [
                    { nombre: 'Túnel', produccion: 500, eficiencia: '90%' },
                    { nombre: 'Empaquetado', produccion: 400, eficiencia: '85%' },
                    { nombre: 'Glaseo', produccion: 300, eficiencia: '80%' }
                ]
            };
            
            console.log('Métricas obtenidas:', metricas);
            return metricas;
        } catch (error) {
            console.error('Error al obtener métricas:', error);
            UI.mostrarNotificacion('Error al obtener métricas de producción', 'error');
            return null;
        }
    },

    // Exportar nómina a PDF
    exportarNominaPDF: function() {
        console.log('Iniciando exportación de nómina a PDF...');
        const nomina = this.getCurrentNomina();
        if (nomina) {
            Export.exportarNominaPDF(nomina);
        } else {
            UI.mostrarNotificacion('No hay datos de nómina para exportar', 'warning');
        }
    },
    
    // Exportar nómina a Excel
    exportarNominaExcel: function() {
        console.log('Iniciando exportación de nómina a Excel...');
        const nomina = this.getCurrentNomina();
        if (nomina) {
            Export.exportarNominaExcel(nomina);
        } else {
            UI.mostrarNotificacion('No hay datos de nómina para exportar', 'warning');
        }
    },
    
    // Exportar métricas a PDF
    exportarMetricasPDF: function() {
        console.log('Iniciando exportación de métricas a PDF...');
        const metricas = this.getMetricasProduccion();
        if (metricas) {
            Export.exportarMetricasPDF(metricas);
        } else {
            UI.mostrarNotificacion('No hay métricas para exportar', 'warning');
        }
    },
    
    // Exportar métricas a Excel
    exportarMetricasExcel: function() {
        console.log('Iniciando exportación de métricas a Excel...');
        const metricas = this.getMetricasProduccion();
        if (metricas) {
            Export.exportarMetricasExcel(metricas);
        } else {
            UI.mostrarNotificacion('No hay métricas para exportar', 'warning');
        }
    },

    // Actualizar gráficos de producción (descarga y clasificación)
    actualizarGraficosProduccion() {
        console.log('Actualizando gráficos de producción...');
        const operaciones = DB.getAll('operaciones');
        console.log('Operaciones obtenidas:', operaciones);

        const hoy = new Date();
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

        // Filtrar operaciones por período
        const operacionesSemana = operaciones.filter(op => {
            const fechaOp = new Date(op.fecha);
            return fechaOp >= inicioSemana && fechaOp <= hoy;
        });

        const operacionesMes = operaciones.filter(op => {
            const fechaOp = new Date(op.fecha);
            return fechaOp >= inicioMes && fechaOp <= hoy;
        });

        console.log('Operaciones semana:', operacionesSemana);
        console.log('Operaciones mes:', operacionesMes);

        // Preparar datos para gráficos
        const datosSemana = this.prepararDatosOperaciones(operacionesSemana);
        const datosMes = this.prepararDatosOperaciones(operacionesMes);

        console.log('Datos preparados semana:', datosSemana);
        console.log('Datos preparados mes:', datosMes);

        // Actualizar gráficos
        this.actualizarGraficoBarras('graficoOperacionesSemana', datosSemana, 'Operaciones por día (Semana)');
        this.actualizarGraficoBarras('graficoOperacionesMes', datosMes, 'Operaciones por día (Mes)');
        this.actualizarGraficoTorta('graficoTipoOperaciones', datosMes, 'Distribución de tipos de operaciones');
    },

    // Preparar datos para gráficos de operaciones
    prepararDatosOperaciones(operaciones) {
        const datos = {
            labels: [],
            datasets: [{
                label: 'Descargas',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }, {
                label: 'Clasificaciones',
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        };

        // Agrupar por fecha y tipo
        const operacionesPorFecha = {};
        operaciones.forEach(op => {
            const fecha = new Date(op.fecha).toLocaleDateString();
            if (!operacionesPorFecha[fecha]) {
                operacionesPorFecha[fecha] = {
                    descargas: 0,
                    clasificaciones: 0
                };
            }
            if (op.tipo === 'Descarga') {
                operacionesPorFecha[fecha].descargas++;
            } else if (op.tipo === 'Clasificación') {
                operacionesPorFecha[fecha].clasificaciones++;
            }
        });

        // Ordenar fechas
        const fechasOrdenadas = Object.keys(operacionesPorFecha).sort((a, b) => new Date(a) - new Date(b));

        // Preparar datos para el gráfico
        fechasOrdenadas.forEach(fecha => {
            datos.labels.push(fecha);
            datos.datasets[0].data.push(operacionesPorFecha[fecha].descargas);
            datos.datasets[1].data.push(operacionesPorFecha[fecha].clasificaciones);
        });

        return datos;
    },

    // Actualizar gráficos de notas y programación
    actualizarGraficosNotas() {
        console.log('Actualizando gráficos de notas...');
        const notas = DB.getAll('notas');
        console.log('Notas obtenidas:', notas);

        const areasFiltradas = ['Túnel', 'Empaquetado', 'Glaseo', 'Corte', 'Echar y tratar'];
        
        // Filtrar notas por áreas específicas
        const notasFiltradas = notas.filter(nota => areasFiltradas.includes(nota.area));
        console.log('Notas filtradas por área:', notasFiltradas);
        
        const hoy = new Date();
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

        // Filtrar notas por período
        const notasSemana = notasFiltradas.filter(nota => {
            const fechaNota = new Date(nota.fecha);
            return fechaNota >= inicioSemana && fechaNota <= hoy;
        });

        const notasMes = notasFiltradas.filter(nota => {
            const fechaNota = new Date(nota.fecha);
            return fechaNota >= inicioMes && fechaNota <= hoy;
        });

        console.log('Notas semana:', notasSemana);
        console.log('Notas mes:', notasMes);

        // Preparar datos para gráficos
        const datosSemana = this.prepararDatosNotas(notasSemana);
        const datosMes = this.prepararDatosNotas(notasMes);

        console.log('Datos preparados notas semana:', datosSemana);
        console.log('Datos preparados notas mes:', datosMes);

        // Actualizar gráficos
        this.actualizarGraficoBarras('graficoNotasSemana', datosSemana, 'Notas por área (Semana)');
        this.actualizarGraficoBarras('graficoNotasMes', datosMes, 'Notas por área (Mes)');
        this.actualizarGraficoTorta('graficoDistribucionNotas', datosMes, 'Distribución de notas por área');
    },

    // Preparar datos para gráficos de notas
    prepararDatosNotas(notas) {
        const areas = ['Túnel', 'Empaquetado', 'Glaseo', 'Corte', 'Echar y tratar'];
        const colores = [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)'
        ];

        const datos = {
            labels: areas,
            datasets: [{
                label: 'Cantidad de notas',
                data: areas.map(area => 
                    notas.filter(nota => nota.area === area).length
                ),
                backgroundColor: colores,
                borderColor: colores.map(color => color.replace('0.5', '1')),
                borderWidth: 1
            }]
        };

        return datos;
    },

    // Actualizar gráfico de barras
    actualizarGraficoBarras(canvasId, datos, titulo) {
        console.log(`Actualizando gráfico de barras ${canvasId}...`);
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`No se encontró el canvas con id ${canvasId}`);
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // Destruir gráfico existente si existe
        if (canvas.chart) {
            console.log(`Destruyendo gráfico existente en ${canvasId}`);
            canvas.chart.destroy();
        }

        // Crear nuevo gráfico
        console.log(`Creando nuevo gráfico en ${canvasId} con datos:`, datos);
        canvas.chart = new Chart(ctx, {
            type: 'bar',
            data: datos,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: titulo
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    },

    // Actualizar gráfico de torta
    actualizarGraficoTorta(canvasId, datos, titulo) {
        console.log(`Actualizando gráfico de torta ${canvasId}...`);
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`No se encontró el canvas con id ${canvasId}`);
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // Destruir gráfico existente si existe
        if (canvas.chart) {
            console.log(`Destruyendo gráfico existente en ${canvasId}`);
            canvas.chart.destroy();
        }

        // Crear nuevo gráfico
        console.log(`Creando nuevo gráfico en ${canvasId} con datos:`, datos);
        canvas.chart = new Chart(ctx, {
            type: 'pie',
            data: datos,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: titulo
                    },
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    },

    configurarActualizacionAutomatica() {
        console.log('Configurando actualización automática...');
        
        // Actualizar cada 5 minutos
        setInterval(() => {
            console.log('Ejecutando actualización automática...');
            this.actualizarDashboard();
        }, 300000);
        
        // Escuchar eventos de actualización de datos
        document.addEventListener('datosActualizados', (event) => {
            console.log('Evento de actualización recibido:', event.detail);
            this.actualizarDashboard();
        });
    },

    // Inicializar funcionalidades de exportación e importación
    initDataExportImport() {
        console.log('Inicializando funcionalidades de exportación e importación...');
        
        // Verificar si los módulos necesarios están disponibles
        if (!window.DB) {
            console.error('El módulo DB no está disponible');
            // Intentar esperar a que DB esté disponible
            setTimeout(() => {
                if (window.DB) {
                    console.log('DB ya está disponible, inicializando exportación/importación...');
                    this.initDataExportImport();
                }
            }, 1000);
            return false;
        }
        
        if (typeof window.DB.exportData !== 'function') {
            console.error('DB no tiene la función exportData');
            // Proporcionar una implementación alternativa
            window.DB.exportData = function() {
                try {
                    const allData = {
                        version: '1.0',
                        timestamp: new Date().toISOString(),
                        stores: {}
                    };
                    
                    // Recolectar datos de cada almacén
                    Object.keys(this.stores).forEach(store => {
                        allData.stores[store] = this.stores[store];
                    });
                    
                    // Crear nombre de archivo con fecha
                    const date = new Date();
                    const dateStr = date.toISOString().split('T')[0];
                    const timeStr = date.toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');
                    const fileName = `gestion_produccion_${dateStr}_${timeStr}.json`;
                    
                    // Crear y descargar archivo
                    const jsonStr = JSON.stringify(allData);
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    UI.mostrarNotificacion(`Datos exportados correctamente como ${fileName}`, 'success');
                    return true;
                } catch (error) {
                    console.error('Error al exportar datos:', error);
                    UI.mostrarNotificacion('Error al exportar datos. Inténtalo de nuevo.', 'error');
                    return false;
                }
            };
            console.log('Implementada función exportData en DB');
        }
        
        // Configurar botones de exportación
        const btnExportarDatos = document.getElementById('btnExportarDatos');
        if (btnExportarDatos) {
            btnExportarDatos.addEventListener('click', () => {
                UI.mostrarNotificacion('Preparando la exportación de datos...', 'info', 2000);
                setTimeout(() => {
                    try {
                        window.DB.exportData();
                    } catch (error) {
                        console.error('Error al exportar datos:', error);
                        UI.mostrarNotificacion('Error al exportar datos: ' + error.message, 'error');
                    }
                }, 300);
            });
            console.log('Botón de exportación configurado');
        }
        
        // Implementar importData si no existe
        if (typeof window.DB.importData !== 'function') {
            console.error('DB no tiene la función importData');
            
            window.DB.importData = function(jsonData) {
                try {
                    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
                    
                    // Validar estructura de los datos
                    if (!data.stores || !data.timestamp) {
                        throw new Error('El formato del archivo no es válido');
                    }
                    
                    // Confirmación
                    if (!confirm(`¿Estás seguro de importar estos datos del ${new Date(data.timestamp).toLocaleString()}? Esto reemplazará TODOS los datos actuales.`)) {
                        return false;
                    }
                    
                    // Importar datos a cada almacén
                    let importCount = 0;
                    
                    Object.keys(data.stores).forEach(store => {
                        if (this.stores[store] !== undefined) {
                            this.stores[store] = data.stores[store];
                            importCount += Array.isArray(data.stores[store]) ? data.stores[store].length : 1;
                        }
                    });
                    
                    // Guardar cambios
                    this.save();
                    
                    // Mostrar mensaje de éxito
                    UI.mostrarNotificacion(`Datos importados correctamente. Se importaron ${importCount} registros.`, 'success');
                    
                    // Recargar la página para aplicar los cambios
                    setTimeout(() => { location.reload(); }, 2000);
                    
                    return true;
                } catch (error) {
                    console.error('Error al importar datos:', error);
                    UI.mostrarNotificacion(`Error al importar datos: ${error.message}`, 'error');
                    return false;
                }
            };
            console.log('Implementada función importData en DB');
        }
        
        // Configurar botones de importación
        const btnImportarDatos = document.getElementById('btnImportarDatos');
        if (btnImportarDatos) {
            btnImportarDatos.addEventListener('click', () => {
                // Crear y mostrar el selector de archivos
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                
                // Mostrar notificación
                UI.mostrarNotificacion('Selecciona el archivo con los datos a importar', 'info');
                
                input.addEventListener('change', (event) => {
                    const file = event.target.files[0];
                    if (!file) {
                        UI.mostrarNotificacion('No se seleccionó ningún archivo', 'warning');
                        return;
                    }
                    
                    console.log(`Archivo seleccionado: ${file.name} (${Math.round(file.size/1024)} KB)`);
                    UI.mostrarNotificacion(`Procesando archivo: ${file.name}`, 'info');
                    
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const contenido = e.target.result;
                            window.DB.importData(contenido);
                        } catch (error) {
                            console.error('Error al procesar archivo:', error);
                            UI.mostrarNotificacion(`Error al procesar archivo: ${error.message}`, 'error');
                        }
                    };
                    
                    reader.onerror = (error) => {
                        console.error('Error al leer archivo:', error);
                        UI.mostrarNotificacion('Error al leer el archivo', 'error');
                    };
                    
                    reader.readAsText(file);
                });
                
                input.click();
            });
            console.log('Botón de importación configurado');
        }
        
        return true;
    }
};

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado. Inicializando módulos...');
    
    // Inicializar módulos
    DB.init();
    UI.init();
    window.app.init();
    
    // Inicializar módulos específicos
    Notas.init();
    Personal.init();
    Operaciones.init();
    Elaboracion.init();
    Inventario.init();
    Configuracion.init();
    Nomina.init();
}); 