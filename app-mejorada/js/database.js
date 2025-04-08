/**
 * Módulo de base de datos para gestionar el almacenamiento
 * Utiliza localStorage pero con una estructura más organizada
 */

const DB = {
    // Almacenes de datos
    stores: {
        notas: [],
        personal: [],
        operaciones: [],
        elaboraciones: [],
        inventario: [],
        nominas: [],
        configuracion: {},
        personas: []
    },

    // Inicializar la base de datos
    init() {
        // Cargar datos de localStorage
        try {
            // Verificar si el archivo existe o leer su contenido primero
            Object.keys(this.stores).forEach(store => {
                const data = localStorage.getItem(`gp_${store}`);
                if (data) {
                    this.stores[store] = JSON.parse(data);
                }
            });
            console.log('Base de datos inicializada correctamente');
            return true;
        } catch (error) {
            console.error('Error al inicializar la base de datos:', error);
            return false;
        }
    },

    // Guardar todos los cambios en localStorage
    save() {
        try {
            Object.keys(this.stores).forEach(store => {
                localStorage.setItem(`gp_${store}`, JSON.stringify(this.stores[store]));
            });
            return true;
        } catch (error) {
            console.error('Error al guardar datos:', error);
            return false;
        }
    },

    // --- Operaciones CRUD generales ---

    // Obtener todos los registros de un almacén
    getAll(store) {
        if (!this.stores[store]) {
            console.error(`Almacén ${store} no existe`);
            return [];
        }
        return this.stores[store];
    },

    // Obtener un registro por ID
    getById(store, id) {
        if (!this.stores[store]) {
            console.error(`Almacén ${store} no existe`);
            return null;
        }
        return this.stores[store].find(item => item.id === id) || null;
    },

    // Añadir un nuevo registro
    add(store, item) {
        if (!this.stores[store]) {
            console.error(`Almacén ${store} no existe`);
            return false;
        }
        
        // Asegurar que el item tenga un ID único
        const newItem = {
            ...item,
            id: item.id || Date.now().toString(),
            createdAt: new Date().toISOString()
        };
        
        this.stores[store].push(newItem);
        this.save();
        return newItem;
    },

    // Actualizar un registro existente
    update(store, id, updates) {
        if (!this.stores[store]) {
            console.error(`Almacén ${store} no existe`);
            return false;
        }
        
        const index = this.stores[store].findIndex(item => item.id === id);
        if (index === -1) {
            console.error(`Registro con ID ${id} no encontrado en ${store}`);
            return false;
        }
        
        // Actualizar el registro
        this.stores[store][index] = {
            ...this.stores[store][index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        this.save();
        return this.stores[store][index];
    },

    // Eliminar un registro
    delete(store, id) {
        if (!this.stores[store]) {
            console.error(`Almacén ${store} no existe`);
            return false;
        }
        
        const index = this.stores[store].findIndex(item => item.id === id);
        if (index === -1) {
            console.error(`Registro con ID ${id} no encontrado en ${store}`);
            return false;
        }
        
        this.stores[store].splice(index, 1);
        this.save();
        return true;
    },

    // Consultas específicas

    // Obtener notas con filtros
    getNotas(filtros = {}) {
        let notas = DB.getAll('notas');
        
        // Aplicar filtros
        if (filtros.fecha) {
            const fechaFiltro = new Date(filtros.fecha).setHours(0, 0, 0, 0);
            notas = notas.filter(nota => {
                const fechaNota = new Date(nota.fecha).setHours(0, 0, 0, 0);
                return fechaNota === fechaFiltro;
            });
        }
        
        if (filtros.area) {
            notas = notas.filter(nota => nota.area === filtros.area);
        }
        
        if (filtros.personaId) {
            notas = notas.filter(nota => 
                nota.personaIds && 
                Array.isArray(nota.personaIds) && 
                nota.personaIds.includes(filtros.personaId)
            );
        }
        
        if (filtros.busqueda) {
            const busqueda = filtros.busqueda.toLowerCase();
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

    // Obtener operaciones filtradas
    getOperaciones(filters = {}) {
        let result = [...this.stores.operaciones];
        
        if (filters.fecha) {
            result = result.filter(op => op.fecha.startsWith(filters.fecha));
        }
        
        if (filters.tipo) {
            result = result.filter(op => op.tipo === filters.tipo);
        }
        
        if (filters.lugar) {
            // Buscar coincidencia exacta con el cliente seleccionado
            result = result.filter(op => op.lugar === filters.lugar);
        }
        
        if (filters.persona) {
            result = result.filter(op => 
                op.personaIds && 
                Array.isArray(op.personaIds) && 
                op.personaIds.includes(filters.persona)
            );
        }
        
        if (filters.busqueda) {
            const busqueda = filters.busqueda.toLowerCase();
            result = result.filter(op => {
                const matchContenido = op.descripcion && op.descripcion.toLowerCase().includes(busqueda);
                const matchLugar = op.lugar.toLowerCase().includes(busqueda);
                const matchTipo = op.tipo.toLowerCase().includes(busqueda);
                const matchPersonas = op.personasInfo && op.personasInfo.toLowerCase().includes(busqueda);
                
                return matchContenido || matchLugar || matchTipo || matchPersonas;
            });
        }
        
        // Ordenar por fecha (las más recientes primero)
        result.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        return result;
    },

    // Obtener actividades programadas para hoy
    getActividadesHoy() {
        const hoy = new Date().toISOString().split('T')[0];
        
        // Obtener notas para hoy
        const notas = this.getAll('notas').filter(nota => 
            nota.fecha === hoy
        ).map(nota => ({
            tipo: 'nota',
            titulo: `Nota: ${nota.area}`,
            detalle: nota.contenido,
            fecha: nota.fecha,
            personasIds: nota.personaIds || [],
            personasNombres: nota.personasNombres || [],
            id: nota.id
        }));
        
        // Obtener operaciones para hoy (solo pendientes)
        const operaciones = this.getAll('operaciones').filter(op => 
            op.fecha === hoy && op.estado === 'pendiente'
        ).map(op => ({
            tipo: 'operacion',
            titulo: `${op.tipo}: ${op.lugar}`,
            detalle: op.descripcion || '',
            fecha: op.fecha,
            personasIds: op.personaIds || [],
            personasNombres: op.personasNombres || [],
            id: op.id,
            estado: op.estado
        }));
        
        // Combinar y ordenar
        const actividades = [...notas, ...operaciones];
        
        return actividades;
    },

    // Próximas actividades (futuras)
    getProximasActividades(dias = 7) {
        const hoy = new Date();
        const limite = new Date();
        limite.setDate(hoy.getDate() + dias);
        
        const hoyStr = hoy.toISOString().split('T')[0];
        const limiteStr = limite.toISOString().split('T')[0];
        
        // Filtrar notas y operaciones futuras
        const notas = this.stores.notas.filter(nota => 
            nota.fecha > hoyStr && nota.fecha <= limiteStr
        );
        
        const operaciones = this.stores.operaciones.filter(op => 
            op.fecha > hoyStr && op.fecha <= limiteStr
        );
        
        // Combinar y convertir a formato común
        const actividades = [
            ...notas.map(nota => ({ 
                tipo: 'nota', 
                titulo: `Nota: ${nota.area}`,
                detalle: nota.contenido.substring(0, 100) + (nota.contenido.length > 100 ? '...' : ''),
                fecha: nota.fecha,
                personasIds: nota.personaIds || [],
                personasNombres: nota.personasNombres || [],
                id: nota.id
            })),
            ...operaciones.map(op => ({ 
                tipo: 'operacion', 
                titulo: `${op.tipo}: ${op.lugar}`,
                detalle: op.descripcion || '',
                fecha: op.fecha,
                personasIds: op.personaIds || [],
                personasNombres: op.personasNombres || [],
                id: op.id
            }))
        ];
        
        // Ordenar por fecha
        actividades.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        
        return actividades;
    },

    // Métodos para gestión de nóminas
    getNominas() {
        console.log('Obteniendo nóminas, cantidad:', this.stores.nominas.length);
        return [...this.stores.nominas];
    },
    
    getNominaPorId(id) {
        console.log('Buscando nómina con ID:', id);
        console.log('Total nóminas disponibles:', this.stores.nominas.length);
        
        if (!id) {
            console.error('ID de nómina no válido:', id);
            return null;
        }
        
        const nomina = this.stores.nominas.find(n => n.id === id);
        console.log('Nómina encontrada:', nomina);
        return nomina;
    },
    
    agregarNomina(nomina) {
        if (!nomina.id) {
            nomina.id = Date.now().toString();
        }
        
        this.stores.nominas.push(nomina);
        this.save();
        
        // Notificar actualización
        document.dispatchEvent(new CustomEvent('datosActualizados', {
            detail: { tipo: 'nominas', accion: 'agregar', id: nomina.id }
        }));
        
        return nomina.id;
    },
    
    actualizarNomina(nomina) {
        const index = this.stores.nominas.findIndex(n => n.id === nomina.id);
        if (index === -1) {
            throw new Error('Registro de nómina no encontrado');
        }
        
        this.stores.nominas[index] = nomina;
        this.save();
        
        // Notificar actualización
        document.dispatchEvent(new CustomEvent('datosActualizados', {
            detail: { tipo: 'nominas', accion: 'actualizar', id: nomina.id }
        }));
        
        return true;
    },
    
    eliminarNomina(id) {
        const index = this.stores.nominas.findIndex(n => n.id === id);
        if (index === -1) {
            throw new Error('Registro de nómina no encontrado');
        }
        
        this.stores.nominas.splice(index, 1);
        this.save();
        
        // Notificar actualización
        document.dispatchEvent(new CustomEvent('datosActualizados', {
            detail: { tipo: 'nominas', accion: 'eliminar', id }
        }));
        
        return true;
    },
    
    importarNominas(nominas) {
        if (!Array.isArray(nominas)) {
            throw new Error('Formato de datos inválido');
        }
        
        this.stores.nominas = nominas;
        this.save();
        
        // Notificar actualización
        document.dispatchEvent(new CustomEvent('datosActualizados', {
            detail: { tipo: 'nominas', accion: 'importar' }
        }));
        
        return true;
    },

    // Resumen de nóminas por persona
    getResumenNominas(periodo = {}) {
        const nominas = [...this.stores.nominas];
        let nominasFiltradas = nominas;
        
        if (periodo.inicio && periodo.fin) {
            nominasFiltradas = nominas.filter(n => 
                n.fecha >= periodo.inicio && n.fecha <= periodo.fin
            );
        }
        
        // Agrupar por persona
        const resumen = {};
        
        nominasFiltradas.forEach(nomina => {
            if (!resumen[nomina.personaId]) {
                resumen[nomina.personaId] = {
                    nombre: nomina.personaNombre,
                    horasNormales: 0,
                    horasExtras: 0,
                    diasTrabajados: new Set(),
                    secciones: new Set()
                };
            }
            
            resumen[nomina.personaId].horasNormales += nomina.horasNormales || 0;
            resumen[nomina.personaId].horasExtras += nomina.horasExtras || 0;
            resumen[nomina.personaId].diasTrabajados.add(nomina.fecha);
            resumen[nomina.personaId].secciones.add(nomina.seccion);
        });
        
        // Convertir a array y calcular totales
        return Object.values(resumen).map(persona => ({
            ...persona,
            totalHoras: persona.horasNormales + persona.horasExtras,
            diasTrabajados: persona.diasTrabajados.size,
            secciones: Array.from(persona.secciones)
        }));
    },

    // Obtener todos los datos de todos los almacenes para respaldo
    async obtenerTodosLosDatos() {
        try {
            const resultado = {};
            
            // Obtener la lista de todos los almacenes disponibles
            const almacenes = Object.keys(this.stores);
            
            // Para cada almacén, obtener todos los datos
            for (const almacen of almacenes) {
                resultado[almacen] = this.getAll(almacen);
            }
            
            return resultado;
        } catch (error) {
            console.error('Error al obtener todos los datos para respaldo:', error);
            throw error;
        }
    },

    // Exportar todos los datos a un archivo JSON
    exportData() {
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
    },
    
    // Importar datos desde un archivo JSON
    importData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            // Validar estructura de los datos
            if (!data.stores || !data.timestamp) {
                throw new Error('El formato del archivo no es válido');
            }
            
            // Mostrar detalles sobre los datos a importar
            const fechaImportacion = new Date(data.timestamp).toLocaleString();
            let totalRegistros = 0;
            let detalleRegistros = '';
            
            Object.keys(data.stores).forEach(store => {
                if (this.stores[store] !== undefined) {
                    const cantidad = Array.isArray(data.stores[store]) ? data.stores[store].length : 1;
                    totalRegistros += cantidad;
                    detalleRegistros += `<li>${store}: ${cantidad} registros</li>`;
                }
            });
            
            // Preguntar al usuario con confirmación detallada
            UI.mostrarModal({
                title: 'Confirmar importación de datos',
                content: `
                    <div class="import-confirmation">
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong>¡Advertencia!</strong> Esta acción reemplazará todos los datos actuales.
                        </div>
                        <p>Estás a punto de importar datos del <strong>${fechaImportacion}</strong>.</p>
                        <p>La importación incluye <strong>${totalRegistros} registros</strong> en total:</p>
                        <ul>${detalleRegistros}</ul>
                        <p>¿Deseas continuar con la importación?</p>
                    </div>
                `,
                showCancel: true,
                confirmText: 'Sí, importar datos',
                cancelText: 'Cancelar',
                onConfirm: () => {
                    // Realizar importación
                    UI.mostrarNotificacion('Importando datos...', 'info');
                    
                    setTimeout(() => {
                        try {
                            // Crear respaldo automático antes de importar
                            const respaldoExitoso = this.crearRespaldoAutomatico();
                            if (respaldoExitoso) {
                                console.log('Respaldo automático creado antes de importar');
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
                            
                            // Notificar cambios a la aplicación
                            document.dispatchEvent(new CustomEvent('datosActualizados', {
                                detail: { tipo: 'todos', accion: 'importar' }
                            }));
                            
                            // Actualizar UI
                            this.refreshAll();
                            
                            // Mostrar mensaje de éxito
                            UI.mostrarNotificacion(`Datos importados correctamente. Se importaron ${importCount} registros.`, 'success');
                        } catch (error) {
                            console.error('Error durante la importación:', error);
                            UI.mostrarNotificacion(`Error al importar: ${error.message}`, 'error');
                        }
                    }, 500);
                }
            });
            
            return true;
        } catch (error) {
            console.error('Error al procesar archivo de importación:', error);
            UI.mostrarNotificacion(`Error al procesar archivo: ${error.message}`, 'error');
            return false;
        }
    },

    // Crear respaldo automático antes de importar
    crearRespaldoAutomatico() {
        try {
            const allData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                tipo: 'auto_preimport',
                stores: {}
            };
            
            // Recolectar datos de cada almacén
            Object.keys(this.stores).forEach(store => {
                allData.stores[store] = this.stores[store];
            });
            
            // Guardar en localStorage como respaldo
            const respaldoKey = `gp_backup_preimport_${new Date().toISOString()}`;
            localStorage.setItem(respaldoKey, JSON.stringify(allData));
            
            return true;
        } catch (error) {
            console.error('Error al crear respaldo automático:', error);
            return false;
        }
    },

    // Limpiar todos los datos
    clear() {
        Object.keys(this.stores).forEach(store => {
            if (Array.isArray(this.stores[store])) {
                this.stores[store] = [];
            } else {
                this.stores[store] = {};
            }
            
            // Eliminar directamente del localStorage también para garantizar limpieza completa
            localStorage.removeItem(`gp_${store}`);
        });
        
        // Guardar cambios en localStorage (estados vacíos)
        this.save();
        
        console.log('Base de datos completamente limpiada');
        return true;
    },

    // Forzar refresco de todos los módulos
    refreshAll() {
        console.log('Forzando refresco de todos los módulos...');
        
        // Notificar sobre actualización de personal
        document.dispatchEvent(new CustomEvent('personalActualizado', {
            detail: { forced: true }
        }));
        
        // Notificar sobre actualización de notas
        document.dispatchEvent(new CustomEvent('notasActualizadas', {
            detail: { forced: true }
        }));
        
        return true;
    },

    // Obtener los productos con su stock actual
    getProductosConStock() {
        const inventario = this.stores.inventario;
        const productos = {};
        
        // Agrupar los movimientos por producto
        inventario.forEach(item => {
            const { productoId, productoNombre, cantidad, unidades, tipo, unidad, presentacion } = item;
            
            if (!productos[productoId]) {
                productos[productoId] = {
                    id: productoId,
                    nombre: productoNombre,
                    stock: 0,
                    unidad: unidad,
                    presentacion: presentacion,
                    stockMinimo: 5 // Valor por defecto, podría venir de configuración
                };
            }
            
            // Actualizar el stock: suma para entradas, resta para salidas
            const factor = tipo === 'entrada' ? 1 : -1;
            productos[productoId].stock += unidades * factor;
        });
        
        // Convertir a array y ordenar por nombre
        return Object.values(productos)
            .sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
};

// Inicializar la base de datos al cargar
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando módulo DB...');
    DB.init();
    
    // Exponer funciones globalmente si no están disponibles
    if (window.DB && !window.DB.exportData) {
        window.DB.exportData = DB.exportData.bind(DB);
        console.log('Función exportData expuesta globalmente');
    }
    
    if (window.DB && !window.DB.importData) {
        window.DB.importData = DB.importData.bind(DB);
        console.log('Función importData expuesta globalmente');
    }
});

// Exponer globalmente
window.DB = DB; 