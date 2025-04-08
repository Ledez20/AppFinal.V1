/**
 * Módulo de gestión de nóminas
 */

const Nomina = {
    // Estado del módulo
    state: {
        nominaEditando: null,
        filtros: {
            fechaDesde: '',
            fechaHasta: '',
            persona: '',
            seccion: ''
        }
    },

    // Inicializar módulo
    init() {
        // Cargar plantilla de nómina
        this.loadTemplate();
        
        // Escuchar eventos de cambio de sección
        document.addEventListener('sectionChanged', (event) => {
            if (event.detail.section === 'nomina') {
                this.verificarYCargarPersonal();
                this.mostrarNominas();
            }
        });
        
        // Escuchar eventos de actualización de personal
        document.addEventListener('personalActualizado', () => {
            if (document.getElementById('nomina').classList.contains('active')) {
                this.cargarPersonasEnSelectores();
            }
        });
    },
    
    // Cargar plantilla HTML
    loadTemplate() {
        console.log("Cargando plantilla de nómina...");
        
        // Usar directamente la plantilla interna para evitar problemas de CORS
        this.crearPlantillaInterna();
        
        // Descomentar esto solo si se está sirviendo desde un servidor web
        /*
        fetch('templates/nomina.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar la plantilla de nómina');
                }
                return response.text();
            })
            .then(html => {
                const section = document.getElementById('nomina');
                if (section) {
                    section.innerHTML = html;
                    this.setupEventListeners();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Crear plantilla interna si no se puede cargar el archivo
                this.crearPlantillaInterna();
            });
        */
    },
    
    // Crear plantilla interna si no se puede cargar el archivo
    crearPlantillaInterna() {
        const section = document.getElementById('nomina');
        if (!section) return;
        
        section.innerHTML = `
            <div class="row">
                <div class="col-12 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Registro de Nóminas</h5>
                        </div>
                        <div class="card-body">
                            <form id="formularioNomina">
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label">Persona</label>
                                        <select class="form-select" id="nominaPersona" required>
                                            <option value="">Seleccionar persona</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label">Fecha</label>
                                        <input type="date" class="form-control" id="nominaFecha" required>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label">Sección</label>
                                        <select class="form-select" id="nominaSeccion" required>
                                            <option value="">Seleccionar sección</option>
                                            <option value="Descarga">Descarga</option>
                                            <option value="Elaboración">Elaboración</option>
                                            <option value="Clasificación">Clasificación</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Horas Normales</label>
                                        <input type="number" class="form-control" id="nominaHorasNormales" min="0" step="0.5" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Horas Extras</label>
                                        <input type="number" class="form-control" id="nominaHorasExtras" min="0" step="0.5" value="0">
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Observaciones</label>
                                    <textarea class="form-control" id="nominaObservaciones" rows="2"></textarea>
                                </div>
                                <div class="d-flex justify-content-end">
                                    <button type="button" class="btn btn-secondary me-2" id="btnLimpiarNomina">Limpiar</button>
                                    <button type="submit" class="btn btn-primary" id="btnGuardarNomina">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Registros de Nómina</h5>
                            <div class="input-group" style="max-width: 300px;">
                                <input type="text" class="form-control" id="buscarNomina" placeholder="Buscar...">
                                <button class="btn btn-outline-secondary" type="button" id="btnFiltrarNomina">
                                    <i class="fas fa-filter"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Persona</th>
                                            <th>Fecha</th>
                                            <th>Sección</th>
                                            <th>Horas Normales</th>
                                            <th>Horas Extras</th>
                                            <th>Total Horas</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody id="nominasTableBody">
                                        <!-- Contenido dinámico -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="botones-superiores">
                <button class="boton-accion" id="btnExportarPDF">
                    <i class="fas fa-file-pdf"></i> PDF
                </button>
                <button class="boton-accion" id="btnExportarExcel">
                    <i class="fas fa-file-excel"></i> Excel
                </button>
                <button class="boton-accion" id="btnRespaldarDatos">
                    <i class="fas fa-save"></i> Respaldo
                </button>
                <button class="boton-accion" id="btnCargarDatos">
                    <i class="fas fa-upload"></i> Cargar
                </button>
            </div>
        `;
        
        this.setupEventListeners();
    },
    
    // Configurar eventos
    setupEventListeners() {
        const form = document.getElementById('formularioNomina');
        const btnLimpiar = document.getElementById('btnLimpiarNomina');
        const btnExportarPDF = document.getElementById('btnExportarPDF');
        const btnExportarExcel = document.getElementById('btnExportarExcel');
        const btnRespaldarDatos = document.getElementById('btnRespaldarDatos');
        const btnCargarDatos = document.getElementById('btnCargarDatos');
        const btnFiltrar = document.getElementById('btnFiltrarNomina');
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.guardarNomina();
            });
        }
        
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', () => this.limpiarFormulario());
        }
        
        if (btnExportarPDF) {
            btnExportarPDF.addEventListener('click', () => this.exportarPDF());
        }
        
        if (btnExportarExcel) {
            btnExportarExcel.addEventListener('click', () => this.exportarExcel());
        }
        
        if (btnRespaldarDatos) {
            btnRespaldarDatos.addEventListener('click', () => this.respaldarDatos());
        }
        
        if (btnCargarDatos) {
            btnCargarDatos.addEventListener('click', () => this.cargarDatos());
        }
        
        if (btnFiltrar) {
            btnFiltrar.addEventListener('click', () => this.aplicarFiltros());
        }
        
        // Establecer fecha actual
        const inputFecha = document.getElementById('nominaFecha');
        if (inputFecha) {
            const hoy = new Date().toISOString().split('T')[0];
            inputFecha.value = hoy;
        }
    },
    
    // Verificar y cargar datos del personal
    verificarYCargarPersonal() {
        const personas = DB.getAll('personal');
        const personasActivas = personas.filter(p => p.activo !== false);
        
        if (personas.length === 0) {
            UI.mostrarNotificacion('No hay personal registrado. Por favor, agregue personal primero.', 'warning');
        } else if (personasActivas.length === 0) {
            UI.mostrarNotificacion('No hay personal activo. Por favor, active algún miembro del personal.', 'warning');
        } else {
            this.cargarPersonasEnSelectores();
        }
    },
    
    // Cargar personas en selectores
    cargarPersonasEnSelectores() {
        const personas = DB.getAll('personal');
        const personasActivas = personas.filter(p => p.activo !== false);
        
        // Ordenar alfabéticamente
        personasActivas.sort((a, b) => a.nombre.localeCompare(b.nombre));
        
        // Selectores donde cargar las personas
        const selectores = [
            document.getElementById('nominaPersona'),
            document.getElementById('filtroPersona')
        ];
        
        selectores.forEach(selector => {
            if (!selector) return;
            
            // Mantener la opción "Seleccionar persona" o "Todas" según el caso
            const valorPredeterminado = selector.id === 'filtroPersona' ? 
                '<option value="">Todas</option>' : 
                '<option value="">Seleccionar persona</option>';
                
            selector.innerHTML = valorPredeterminado;
            
            personasActivas.forEach(persona => {
                const option = document.createElement('option');
                option.value = persona.id;
                option.textContent = persona.nombre;
                selector.appendChild(option);
            });
        });
    },
    
    // Guardar registro de nómina
    guardarNomina() {
        const personaId = document.getElementById('nominaPersona').value;
        const fecha = document.getElementById('nominaFecha').value;
        const seccion = document.getElementById('nominaSeccion').value;
        const horasNormales = parseFloat(document.getElementById('nominaHorasNormales').value);
        const horasExtras = parseFloat(document.getElementById('nominaHorasExtras').value) || 0;
        const observaciones = document.getElementById('nominaObservaciones').value;
        
        if (!personaId || !fecha || !seccion || isNaN(horasNormales)) {
            UI.mostrarNotificacion('Por favor, complete todos los campos requeridos', 'warning');
            return;
        }
        
        const persona = DB.getById('personal', personaId);
        if (!persona) {
            UI.mostrarNotificacion('Persona no encontrada', 'error');
            return;
        }
        
        const nomina = {
            id: this.state.nominaEditando ? this.state.nominaEditando : Date.now().toString(),
            personaId,
            personaNombre: persona.nombre,
            fecha,
            seccion,
            horasNormales,
            horasExtras,
            estado: 'pendiente',
            observaciones,
            fechaRegistro: new Date().toISOString()
        };
        
        console.log('Guardando nómina:', nomina);
        
        try {
            if (this.state.nominaEditando) {
                console.log('Actualizando nómina existente con ID:', this.state.nominaEditando);
                // Corregir: Usar método adecuado para actualizar nómina
                const resultado = DB.actualizarNomina(nomina);
                console.log('Resultado de actualización:', resultado);
                UI.mostrarNotificacion('Registro de nómina actualizado correctamente', 'success');
            } else {
                console.log('Agregando nueva nómina');
                const resultado = DB.agregarNomina(nomina);
                console.log('Nueva nómina agregada con ID:', resultado);
                UI.mostrarNotificacion('Registro de nómina guardado correctamente', 'success');
            }
            
            this.limpiarFormulario();
            this.mostrarNominas();
        } catch (error) {
            console.error('Error al guardar/actualizar nómina:', error);
            UI.mostrarNotificacion(`Error: ${error.message}`, 'error');
        }
    },
    
    // Limpiar formulario
    limpiarFormulario() {
        document.getElementById('formularioNomina').reset();
        
        // Establecer fecha actual
        const inputFecha = document.getElementById('nominaFecha');
        if (inputFecha) {
            const hoy = new Date().toISOString().split('T')[0];
            inputFecha.value = hoy;
        }
        
        this.state.nominaEditando = null;
        
        // Cambiar botón a "Guardar"
        const btnGuardar = document.getElementById('btnGuardarNomina');
        if (btnGuardar) {
            btnGuardar.textContent = 'Guardar';
        }
    },
    
    // Mostrar registros de nómina
    mostrarNominas() {
        console.log('Mostrando registros de nómina');
        const nominas = DB.getNominas();
        const tbody = document.getElementById('nominasTableBody');
        
        if (!tbody) {
            console.error('No se encontró el elemento tbody para mostrar nóminas');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (nominas.length === 0) {
            console.log('No hay registros de nómina para mostrar');
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">No hay registros de nómina</td>
                </tr>
            `;
            return;
        }
        
        console.log(`Mostrando ${nominas.length} registros de nómina`);
        
        // Ordenar por fecha (más recientes primero)
        nominas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        nominas.forEach(nomina => {
            const totalHoras = (nomina.horasNormales || 0) + (nomina.horasExtras || 0);
            const fechaFormateada = new Date(nomina.fecha).toLocaleDateString('es-ES');
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${nomina.personaNombre || 'Sin asignar'}</td>
                <td>${fechaFormateada}</td>
                <td>${nomina.seccion || 'N/A'}</td>
                <td>${(nomina.horasNormales || 0).toFixed(1)}</td>
                <td>${(nomina.horasExtras || 0).toFixed(1)}</td>
                <td>${totalHoras.toFixed(1)}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary btn-editar" data-id="${nomina.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-eliminar" data-id="${nomina.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // Configurar eventos en los botones (separado para evitar problemas con innerHTML)
        this.configurarBotonesAcciones();
    },
    
    // Configurar eventos de botones de acciones (editar, eliminar)
    configurarBotonesAcciones() {
        console.log('Configurando botones de acciones para nóminas');
        
        // Botones de editar
        const botonesEditar = document.querySelectorAll('#nominasTableBody .btn-editar');
        botonesEditar.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                console.log('Botón editar presionado para ID:', id);
                this.editarNomina(id);
            });
        });
        
        // Botones de eliminar
        const botonesEliminar = document.querySelectorAll('#nominasTableBody .btn-eliminar');
        botonesEliminar.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                console.log('Botón eliminar presionado para ID:', id);
                this.confirmarEliminarNomina(id);
            });
        });
        
        console.log(`Configurados ${botonesEditar.length} botones de editar y ${botonesEliminar.length} botones de eliminar`);
    },
    
    // Editar nómina
    editarNomina(id) {
        console.log('Editando nómina con ID:', id);
        
        // Obtener el registro de nómina desde DB
        const nomina = DB.getNominaPorId(id);
        if (!nomina) {
            console.error('Registro de nómina no encontrado con ID:', id);
            UI.mostrarNotificacion('Registro no encontrado', 'error');
            return;
        }
        
        console.log('Datos de nómina recuperados:', nomina);
        
        // Establecer valores en el formulario
        document.getElementById('nominaPersona').value = nomina.personaId || '';
        document.getElementById('nominaFecha').value = nomina.fecha || '';
        document.getElementById('nominaSeccion').value = nomina.seccion || '';
        document.getElementById('nominaHorasNormales').value = nomina.horasNormales || 0;
        document.getElementById('nominaHorasExtras').value = nomina.horasExtras || 0;
        document.getElementById('nominaObservaciones').value = nomina.observaciones || '';
        
        // Guardar ID de la nómina que se está editando
        this.state.nominaEditando = id;
        
        // Cambiar botón a "Actualizar"
        const btnGuardar = document.getElementById('btnGuardarNomina');
        if (btnGuardar) {
            btnGuardar.textContent = 'Actualizar';
        }
        
        // Desplazarse al formulario
        document.getElementById('formularioNomina').scrollIntoView({ behavior: 'smooth' });
    },
    
    // Confirmar eliminación
    confirmarEliminarNomina(id) {
        if (confirm('¿Está seguro de eliminar este registro de nómina? Esta acción no se puede deshacer.')) {
            this.eliminarNomina(id);
        }
    },
    
    // Eliminar nómina
    eliminarNomina(id) {
        try {
            DB.eliminarNomina(id);
            UI.mostrarNotificacion('Registro de nómina eliminado correctamente', 'success');
            this.mostrarNominas();
        } catch (error) {
            UI.mostrarNotificacion(`Error: ${error.message}`, 'error');
        }
    },
    
    // Aplicar filtros a la lista de nóminas
    aplicarFiltros() {
        // Implementar filtros
        UI.mostrarNotificacion('Funcionalidad de filtrado en desarrollo', 'info');
    },
    
    // Exportar a PDF
    exportarPDF() {
        const nominas = DB.getNominas();
        if (nominas.length === 0) {
            UI.mostrarNotificacion('No hay datos para exportar', 'warning');
            return;
        }
        
        try {
            // Verificar disponibilidad de jsPDF
            if (typeof window.jspdf === 'undefined') {
                UI.mostrarNotificacion('Biblioteca jsPDF no disponible', 'error');
                return;
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configurar título y fecha
            doc.setFontSize(16);
            doc.text('Registro de Nóminas', 20, 20);
            
            doc.setFontSize(10);
            doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, 20, 30);
            
            // Crear tabla de datos
            const headers = [['ID', 'Persona', 'Fecha', 'Sección', 'Horas Normales', 'Horas Extras', 'Observaciones', 'Estado']];
            
            const data = nominas.map(nomina => [
                nomina.id.toString().substring(0, 8),
                nomina.personaNombre || 'No asignado',
                nomina.fecha,
                nomina.seccion || 'N/A',
                nomina.horasNormales.toString(),
                nomina.horasExtras.toString(),
                (nomina.observaciones || '').substring(0, 20),
                nomina.estado || 'pendiente'
            ]);
            
            // Añadir tabla al documento
            doc.autoTable({
                head: headers,
                body: data,
                startY: 40,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                alternateRowStyles: { fillColor: [240, 240, 240] },
                margin: { top: 40 }
            });
            
            // Calcular totales
            let totalHorasNormales = 0;
            let totalHorasExtras = 0;
            
            nominas.forEach(nomina => {
                totalHorasNormales += nomina.horasNormales || 0;
                totalHorasExtras += nomina.horasExtras || 0;
            });
            
            // Añadir resumen al final del documento
            const finalY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(12);
            doc.text('Resumen:', 20, finalY);
            doc.setFontSize(10);
            doc.text(`Total Registros: ${nominas.length}`, 20, finalY + 7);
            doc.text(`Total Horas Normales: ${totalHorasNormales.toFixed(2)}`, 20, finalY + 14);
            doc.text(`Total Horas Extras: ${totalHorasExtras.toFixed(2)}`, 20, finalY + 21);
            doc.text(`Total Horas: ${(totalHorasNormales + totalHorasExtras).toFixed(2)}`, 20, finalY + 28);
            
            // Guardar el PDF
            const fileName = `registro_nominas_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            UI.mostrarNotificacion(`PDF generado: ${fileName}`, 'success');
        } catch (error) {
            console.error('Error al generar PDF:', error);
            UI.mostrarNotificacion(`Error al generar PDF: ${error.message}`, 'error');
        }
    },
    
    // Exportar a Excel
    exportarExcel() {
        const nominas = DB.getNominas();
        if (nominas.length === 0) {
            UI.mostrarNotificacion('No hay datos para exportar', 'warning');
            return;
        }
        
        try {
            // Verificar disponibilidad de XLSX
            if (typeof XLSX === 'undefined') {
                UI.mostrarNotificacion('Biblioteca XLSX no disponible', 'error');
                return;
            }
            
            // Crear libro y hoja de trabajo
            const wb = XLSX.utils.book_new();
            
            // Preparar datos para el encabezado
            const data = [
                ['REGISTRO DE NÓMINAS'],
                [`Fecha de generación: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`],
                [],
                ['ID', 'Persona', 'Fecha', 'Sección', 'Horas Normales', 'Horas Extras', 'Total Horas', 'Observaciones', 'Estado', 'Fecha Registro']
            ];
            
            // Agregar datos de cada nómina
            nominas.forEach(nomina => {
                const totalHoras = (nomina.horasNormales || 0) + (nomina.horasExtras || 0);
                
                data.push([
                    nomina.id.toString(),
                    nomina.personaNombre || 'No asignado',
                    nomina.fecha,
                    nomina.seccion || 'N/A',
                    nomina.horasNormales || 0,
                    nomina.horasExtras || 0,
                    totalHoras,
                    nomina.observaciones || '',
                    nomina.estado || 'pendiente',
                    nomina.fechaRegistro || ''
                ]);
            });
            
            // Calcular totales
            let totalHorasNormales = 0;
            let totalHorasExtras = 0;
            
            nominas.forEach(nomina => {
                totalHorasNormales += nomina.horasNormales || 0;
                totalHorasExtras += nomina.horasExtras || 0;
            });
            
            // Añadir fila en blanco y resumen
            data.push([]);
            data.push(['RESUMEN:']);
            data.push(['Total Registros:', nominas.length]);
            data.push(['Total Horas Normales:', totalHorasNormales.toFixed(2)]);
            data.push(['Total Horas Extras:', totalHorasExtras.toFixed(2)]);
            data.push(['Total Horas:', (totalHorasNormales + totalHorasExtras).toFixed(2)]);
            
            // Crear hoja de trabajo
            const ws = XLSX.utils.aoa_to_sheet(data);
            
            // Configurar ancho de columnas
            const colWidths = [
                { wch: 12 },  // ID
                { wch: 25 },  // Persona
                { wch: 12 },  // Fecha
                { wch: 15 },  // Sección
                { wch: 15 },  // Horas Normales
                { wch: 15 },  // Horas Extras
                { wch: 15 },  // Total Horas
                { wch: 30 },  // Observaciones
                { wch: 12 },  // Estado
                { wch: 20 }   // Fecha Registro
            ];
            
            ws['!cols'] = colWidths;
            
            // Añadir hoja al libro
            XLSX.utils.book_append_sheet(wb, ws, 'Nóminas');
            
            // Guardar archivo
            const fileName = `registro_nominas_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);
            
            UI.mostrarNotificacion(`Excel generado: ${fileName}`, 'success');
        } catch (error) {
            console.error('Error al generar Excel:', error);
            UI.mostrarNotificacion(`Error al generar Excel: ${error.message}`, 'error');
        }
    },
    
    // Respaldar datos
    respaldarDatos() {
        const nominas = DB.getNominas();
        if (nominas.length === 0) {
            UI.mostrarNotificacion('No hay datos para respaldar', 'warning');
            return;
        }
        
        const datos = JSON.stringify(nominas);
        const blob = new Blob([datos], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nominas_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        UI.mostrarNotificacion('Datos respaldados correctamente', 'success');
    },
    
    // Cargar datos desde respaldo
    cargarDatos() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const nominas = JSON.parse(event.target.result);
                    DB.importarNominas(nominas);
                    this.mostrarNominas();
                    UI.mostrarNotificacion('Datos cargados correctamente', 'success');
                } catch (error) {
                    UI.mostrarNotificacion('Error al cargar el archivo: formato incorrecto', 'error');
                }
            };
            reader.readAsText(file);
        });
        
        input.click();
    }
};

// Registrar módulo para inicialización
if (typeof modulesToInit === 'undefined') {
    window.modulesToInit = {};
}
window.modulesToInit.nomina = Nomina; 