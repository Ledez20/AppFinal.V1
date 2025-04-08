/**
 * Módulo de Configuración
 * Permite gestionar opciones generales de la aplicación
 */

const Configuracion = {
    // Inicializar módulo
    init() {
        // Cargar plantilla de configuración
        this.loadTemplate();
        
        // Escuchar eventos de cambio de sección
        document.addEventListener('sectionChanged', (event) => {
            if (event.detail.section === 'configuracion') {
                // Acciones específicas cuando se entra a la sección de configuración
                this.setupBotones();
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
                            <h2 class="section-title">Configuración del Sistema</h2>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="card mb-4">
                            <div class="card-header bg-primary text-white">
                                <h5 class="card-title mb-0">Gestión de Datos</h5>
                            </div>
                            <div class="card-body">
                                <p class="text-muted mb-4">Desde aquí puedes gestionar los datos almacenados en la aplicación.</p>
                                
                                <h6 class="mb-3 border-bottom pb-2">Mantenimiento de Datos del Personal</h6>
                                <div class="mb-4">
                                    <p>Limpia registros inconsistentes relacionados con el personal.</p>
                                    <button id="btnLimpiarPersonal" class="btn btn-warning">
                                        <i class="fas fa-user-times me-2"></i>Limpiar datos de personal
                                    </button>
                                </div>
                                
                                <h6 class="mb-3 border-bottom pb-2">Reinicio del Sistema</h6>
                                <div class="mb-4">
                                    <p class="text-danger"><strong>¡Precaución!</strong> Esta acción eliminará todos los datos de la aplicación.</p>
                                    <button id="btnReiniciarTodo" class="btn btn-danger">
                                        <i class="fas fa-trash me-2"></i>Reiniciar todos los datos
                                    </button>
                                </div>
                                
                                <h6 class="mb-3 border-bottom pb-2">Mantenimiento Técnico</h6>
                                <div>
                                    <p class="text-muted">Opciones para uso técnico y resolución de problemas.</p>
                                    <button id="btnLimpiezaTotal" class="btn btn-outline-danger mb-2">
                                        <i class="fas fa-eraser me-2"></i>Limpieza completa del almacenamiento
                                    </button>
                                    <div id="infoAlmacenamiento" class="mt-3 small text-muted">
                                        <!-- Información sobre el almacenamiento se mostrará aquí -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card mb-4">
                            <div class="card-header bg-primary text-white">
                                <h5 class="card-title mb-0">Información del Sistema</h5>
                            </div>
                            <div class="card-body">
                                <p class="text-muted mb-4">Información sobre la aplicación y el estado actual.</p>
                                
                                <div class="mb-3">
                                    <h6 class="mb-2">Versión de la aplicación</h6>
                                    <p class="mb-0">1.0.0</p>
                                </div>
                                
                                <div class="mb-3">
                                    <h6 class="mb-2">Espacio utilizado</h6>
                                    <div id="espacioUtilizado">Calculando...</div>
                                </div>
                                
                                <div class="mb-3">
                                    <h6 class="mb-2">Estado de los módulos</h6>
                                    <div id="estadoModulos">
                                        <div class="d-flex align-items-center mb-2">
                                            <span class="badge bg-success me-2">Activo</span>
                                            <span>Sistema principal</span>
                                        </div>
                                        <div class="d-flex align-items-center mb-2">
                                            <span id="estadoNotas" class="badge bg-success me-2">Activo</span>
                                            <span>Notas y Programación</span>
                                        </div>
                                        <div class="d-flex align-items-center mb-2">
                                            <span id="estadoPersonal" class="badge bg-success me-2">Activo</span>
                                            <span>Gestión de Personal</span>
                                        </div>
                                        <div class="d-flex align-items-center mb-2">
                                            <span id="estadoOperaciones" class="badge bg-success me-2">Activo</span>
                                            <span>Operaciones</span>
                                        </div>
                                        <div class="d-flex align-items-center mb-2">
                                            <span id="estadoInventario" class="badge bg-success me-2">Activo</span>
                                            <span>Inventario</span>
                                        </div>
                                        <div class="d-flex align-items-center">
                                            <span id="estadoElaboracion" class="badge bg-success me-2">Activo</span>
                                            <span>Elaboración</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        UI.cargarContenido('configuracion', template);
    },
    
    // Configurar eventos de botones
    setupBotones() {
        // Botón para limpiar datos inconsistentes de personal
        const btnLimpiarPersonal = document.getElementById('btnLimpiarPersonal');
        if (btnLimpiarPersonal) {
            btnLimpiarPersonal.addEventListener('click', () => {
                this.limpiarDatosPersonal();
            });
        }
        
        // Botón para reiniciar completamente todos los datos
        const btnReiniciarTodo = document.getElementById('btnReiniciarTodo');
        if (btnReiniciarTodo) {
            btnReiniciarTodo.addEventListener('click', () => {
                this.reiniciarTodosDatos();
            });
        }
        
        // Botón para forzar limpieza completa de localStorage
        const btnLimpiezaTotal = document.getElementById('btnLimpiezaTotal');
        if (btnLimpiezaTotal) {
            btnLimpiezaTotal.addEventListener('click', () => {
                this.limpiezaCompletaAlmacenamiento();
            });
        }
        
        // Mostrar información de almacenamiento
        this.mostrarInfoAlmacenamiento();
        
        // Calcular espacio utilizado
        this.calcularEspacioUtilizado();
    },
    
    // Mostrar información sobre el almacenamiento
    mostrarInfoAlmacenamiento() {
        const infoAlmacenamiento = document.getElementById('infoAlmacenamiento');
        if (!infoAlmacenamiento) return;
        
        try {
            // Contar elementos por tienda
            const conteos = {};
            Object.keys(DB.stores).forEach(store => {
                if (Array.isArray(DB.stores[store])) {
                    conteos[store] = DB.stores[store].length;
                } else {
                    conteos[store] = Object.keys(DB.stores[store]).length;
                }
            });
            
            // Crear HTML con la información
            let html = '<ul class="list-unstyled mb-0">';
            Object.keys(conteos).forEach(store => {
                html += `<li><strong>${store}:</strong> ${conteos[store]} registros</li>`;
            });
            html += '</ul>';
            
            infoAlmacenamiento.innerHTML = html;
        } catch (error) {
            console.error('Error al mostrar info de almacenamiento:', error);
            infoAlmacenamiento.innerHTML = '<span class="text-danger">Error al cargar información</span>';
        }
    },
    
    // Calcular espacio utilizado en localStorage
    calcularEspacioUtilizado() {
        const espacioUtilizado = document.getElementById('espacioUtilizado');
        if (!espacioUtilizado) return;
        
        try {
            let totalSize = 0;
            
            // Calcular tamaño aproximado de los datos en localStorage
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('gp_')) {
                    const item = localStorage.getItem(key);
                    totalSize += (item.length * 2) / 1024; // Convertir a KB (aproximado)
                }
            });
            
            espacioUtilizado.textContent = `${totalSize.toFixed(2)} KB de 5MB (${((totalSize / 5120) * 100).toFixed(2)}%)`;
        } catch (error) {
            console.error('Error al calcular espacio:', error);
            espacioUtilizado.textContent = 'No se pudo calcular';
        }
    },
    
    // Limpiar datos inconsistentes de personal
    limpiarDatosPersonal() {
        if (confirm('¿Estás seguro de limpiar los datos de personal? Esto eliminará cualquier registro inconsistente.')) {
            // Eliminar completamente todos los datos de personal
            console.log('Realizando limpieza completa de datos de personal...');
            
            // Vaciar el array de personal en memoria
            DB.stores.personal = [];
            
            // Guardar cambios en localStorage
            DB.save();
            
            // Eliminar cualquier otro dato relacionado con personal que pudiera estar en localStorage
            localStorage.removeItem('gp_personal');
            
            console.log('Limpieza de personal completada');
            
            // Notificar al usuario
            UI.mostrarNotificacion('Datos de personal eliminados completamente', 'success');
            
            // Notificar a otros módulos
            document.dispatchEvent(new CustomEvent('personalActualizado', {
                detail: { forced: true }
            }));
            
            // Actualizar información mostrada
            this.mostrarInfoAlmacenamiento();
            this.calcularEspacioUtilizado();
        }
    },
    
    // Reiniciar completamente todos los datos
    reiniciarTodosDatos() {
        UI.confirmar({
            title: '¿Eliminar todos los datos?',
            message: '¡ADVERTENCIA! Esto eliminará TODOS los datos de la aplicación.<br><br>¿Estás completamente seguro?',
            type: 'error',
            confirmText: 'Sí, eliminar todo',
            cancelText: 'Cancelar'
        }).then(confirmado => {
            if (confirmado) {
                try {
                    console.log('Iniciando eliminación completa de datos...');
                    
                    // Limpiar todos los almacenes de datos en memoria
                    Object.keys(DB.stores).forEach(store => {
                        if (Array.isArray(DB.stores[store])) {
                            DB.stores[store] = [];
                        } else {
                            DB.stores[store] = {};
                        }
                    });
                    
                    // Guardar cambios (esto en realidad limpia el localStorage)
                    DB.save();
                    
                    // Notificar con algo de retraso para permitir ver la notificación
                    UI.mostrarNotificacion('Todos los datos han sido eliminados correctamente', 'success');
                    
                    console.log('Datos eliminados completamente');
                    
                    // Actualizar información de almacenamiento
                    this.mostrarInfoAlmacenamiento();
                    this.calcularEspacioUtilizado();
                    
                    // Recargar aplicación en 2 segundos para refrescar todos los módulos
                    setTimeout(() => {
                        location.reload();
                    }, 2000);
                } catch (error) {
                    console.error('Error al reiniciar datos:', error);
                    UI.mostrarNotificacion('Error al eliminar los datos', 'error');
                }
            }
        });
    },
    
    // Limpieza completa del almacenamiento (localStorage)
    limpiezaCompletaAlmacenamiento() {
        UI.confirmar({
            title: 'Limpieza completa',
            message: 'Esta operación eliminará TODOS los datos almacenados, incluyendo respaldos y configuraciones. ¿Deseas continuar?',
            type: 'error',
            confirmText: 'Eliminar todo',
            cancelText: 'Cancelar'
        }).then(confirmado => {
            if (confirmado) {
                try {
                    // Guardar algunas claves que queremos mantener (opcional)
                    const keysToKeep = [];
                    const savedValues = {};
                    
                    keysToKeep.forEach(key => {
                        const value = localStorage.getItem(key);
                        if (value) {
                            savedValues[key] = value;
                        }
                    });
                    
                    // Borrar TODOS los datos de localStorage para este dominio
                    localStorage.clear();
                    
                    // Restaurar las claves que queremos mantener
                    Object.keys(savedValues).forEach(key => {
                        localStorage.setItem(key, savedValues[key]);
                    });
                    
                    console.log('Almacenamiento completamente limpiado');
                    
                    // Notificar al usuario
                    UI.mostrarNotificacion('Almacenamiento limpiado completamente', 'success');
                    
                    // Actualizar información mostrada
                    this.mostrarInfoAlmacenamiento();
                    this.calcularEspacioUtilizado();
                    
                    // Recargar la aplicación después de un breve retraso
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                } catch (error) {
                    console.error('Error al limpiar almacenamiento:', error);
                    UI.mostrarNotificacion('Error al limpiar el almacenamiento', 'error');
                }
            }
        });
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Configuracion.init();
}); 