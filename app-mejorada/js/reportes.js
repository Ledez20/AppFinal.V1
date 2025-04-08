/**
 * Módulo de Reportes
 * Permite generar informes consolidados del dashboard en formato PDF y Excel
 */

const Reportes = {
    // Estado del módulo
    state: {
        periodo: 'semanal', // 'semanal' o 'mensual'
        fechaInicio: '',
        fechaFin: '',
        tipoInforme: 'completo' // 'completo', 'operaciones', 'notas'
    },

    // Inicializar módulo
    init() {
        console.log('Inicializando módulo de reportes...');
        
        // Cargar plantilla
        this.loadTemplate();
        
        // Escuchar eventos de cambio de sección
        document.addEventListener('sectionChanged', (event) => {
            if (event.detail.section === 'reportes') {
                this.inicializarFechas();
                this.configurarEventListeners();
                this.actualizarVistaPrevia();
            }
        });
    },

    // Cargar plantilla HTML en la sección
    loadTemplate() {
        const template = `
            <div class="container-fluid">
                <div class="row mb-4">
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title">Generación de Informes</h5>
                            </div>
                            <div class="card-body">
                                <form id="formReportes">
                                    <div class="row">
                                        <div class="col-md-4 mb-3">
                                            <label for="periodoReporte" class="form-label">Período</label>
                                            <select class="form-select" id="periodoReporte">
                                                <option value="semanal">Semanal</option>
                                                <option value="mensual">Mensual</option>
                                                <option value="personalizado">Personalizado</option>
                                            </select>
                                        </div>
                                        <div class="col-md-4 mb-3">
                                            <label for="fechaInicioReporte" class="form-label">Fecha Inicio</label>
                                            <input type="date" class="form-control" id="fechaInicioReporte">
                                        </div>
                                        <div class="col-md-4 mb-3">
                                            <label for="fechaFinReporte" class="form-label">Fecha Fin</label>
                                            <input type="date" class="form-control" id="fechaFinReporte">
                                        </div>
                                    </div>
                                    
                                    <div class="row mb-3">
                                        <div class="col-md-12">
                                            <label class="form-label">Tipo de Informe</label>
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" name="tipoInforme" id="tipoInformeCompleto" value="completo" checked>
                                                <label class="form-check-label" for="tipoInformeCompleto">
                                                    Informe completo (Operaciones, Notas, Métricas)
                                                </label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" name="tipoInforme" id="tipoInformeOperaciones" value="operaciones">
                                                <label class="form-check-label" for="tipoInformeOperaciones">
                                                    Solo Operaciones (Descargas y Clasificaciones)
                                                </label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" name="tipoInforme" id="tipoInformeNotas" value="notas">
                                                <label class="form-check-label" for="tipoInformeNotas">
                                                    Solo Notas y Programación
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                                                <button type="button" id="btnVistaPrevia" class="btn btn-primary">
                                                    <i class="fas fa-eye me-2"></i>Vista Previa
                                                </button>
                                                <button type="button" id="btnGenerarPDF" class="btn btn-danger">
                                                    <i class="fas fa-file-pdf me-2"></i>Generar PDF
                                                </button>
                                                <button type="button" id="btnGenerarExcel" class="btn btn-success">
                                                    <i class="fas fa-file-excel me-2"></i>Generar Excel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title">Vista Previa del Informe</h5>
                            </div>
                            <div class="card-body">
                                <div id="vistaPrevia" class="report-preview">
                                    <div class="text-center py-5">
                                        <i class="fas fa-chart-line fa-3x mb-3"></i>
                                        <p>Seleccione los parámetros del informe y haga clic en "Vista Previa" para visualizar los datos.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        UI.cargarContenido('reportes', template);
    },
    
    // Inicializar fechas por defecto
    inicializarFechas() {
        const hoy = new Date();
        const fechaFin = hoy.toISOString().split('T')[0];
        
        // Calcular fecha de inicio según el período
        let fechaInicio;
        if (this.state.periodo === 'semanal') {
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // Inicio de la semana (domingo)
            fechaInicio = inicioSemana.toISOString().split('T')[0];
        } else { // mensual
            const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            fechaInicio = inicioMes.toISOString().split('T')[0];
        }
        
        // Actualizar el estado
        this.state.fechaInicio = fechaInicio;
        this.state.fechaFin = fechaFin;
        
        // Actualizar los campos de fecha
        const inputFechaInicio = document.getElementById('fechaInicioReporte');
        const inputFechaFin = document.getElementById('fechaFinReporte');
        
        if (inputFechaInicio) inputFechaInicio.value = fechaInicio;
        if (inputFechaFin) inputFechaFin.value = fechaFin;
    },
    
    // Configurar event listeners
    configurarEventListeners() {
        // Selector de período
        const selectPeriodo = document.getElementById('periodoReporte');
        if (selectPeriodo) {
            selectPeriodo.value = this.state.periodo;
            selectPeriodo.addEventListener('change', () => {
                this.state.periodo = selectPeriodo.value;
                if (this.state.periodo !== 'personalizado') {
                    this.inicializarFechas();
                }
            });
        }
        
        // Campos de fecha
        const inputFechaInicio = document.getElementById('fechaInicioReporte');
        const inputFechaFin = document.getElementById('fechaFinReporte');
        
        if (inputFechaInicio) {
            inputFechaInicio.addEventListener('change', () => {
                this.state.fechaInicio = inputFechaInicio.value;
            });
        }
        
        if (inputFechaFin) {
            inputFechaFin.addEventListener('change', () => {
                this.state.fechaFin = inputFechaFin.value;
            });
        }
        
        // Tipo de informe
        const radios = document.querySelectorAll('input[name="tipoInforme"]');
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    this.state.tipoInforme = radio.value;
                }
            });
        });
        
        // Botones de acción
        const btnVistaPrevia = document.getElementById('btnVistaPrevia');
        if (btnVistaPrevia) {
            btnVistaPrevia.addEventListener('click', () => this.actualizarVistaPrevia());
        }
        
        const btnGenerarPDF = document.getElementById('btnGenerarPDF');
        if (btnGenerarPDF) {
            btnGenerarPDF.addEventListener('click', () => this.generarPDF());
        }
        
        const btnGenerarExcel = document.getElementById('btnGenerarExcel');
        if (btnGenerarExcel) {
            btnGenerarExcel.addEventListener('click', () => this.generarExcel());
        }
    },
    
    // Actualizar vista previa del informe
    actualizarVistaPrevia() {
        const container = document.getElementById('vistaPrevia');
        if (!container) return;
        
        // Recopilar datos para el informe
        const datos = this.recopilarDatos();
        
        // Generar HTML para la vista previa
        let html = `
            <div class="report-header">
                <h2>Informe de Producción</h2>
                <p><strong>Período:</strong> ${new Date(this.state.fechaInicio).toLocaleDateString('es-ES')} al ${new Date(this.state.fechaFin).toLocaleDateString('es-ES')}</p>
            </div>
        `;
        
        // Sección de Operaciones
        if (this.state.tipoInforme === 'completo' || this.state.tipoInforme === 'operaciones') {
            html += `
                <div class="report-section">
                    <h3>Descargas y Clasificaciones</h3>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="stats-card">
                                <h4>Resumen</h4>
                                <ul class="stats-list">
                                    <li><strong>Total Operaciones:</strong> ${datos.operaciones.total}</li>
                                    <li><strong>Descargas:</strong> ${datos.operaciones.descargas}</li>
                                    <li><strong>Clasificaciones:</strong> ${datos.operaciones.clasificaciones}</li>
                                </ul>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="stats-card">
                                <h4>Operaciones por Cliente</h4>
                                <ul class="stats-list">
                                    ${Object.entries(datos.operaciones.porCliente).map(([cliente, cantidad]) => 
                                        `<li><strong>${cliente}:</strong> ${cantidad}</li>`
                                    ).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <h4>Listado de Operaciones</h4>
                    <div class="table-responsive">
                        <table class="table table-striped table-sm">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Cliente</th>
                                    <th>Personal</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${datos.operaciones.listado.map(op => `
                                    <tr>
                                        <td>${new Date(op.fecha).toLocaleDateString('es-ES')}</td>
                                        <td>${op.tipo}</td>
                                        <td>${op.lugar}</td>
                                        <td>${op.personasInfo || ''}</td>
                                        <td>${op.estado || 'pendiente'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
        
        // Sección de Notas y Programación
        if (this.state.tipoInforme === 'completo' || this.state.tipoInforme === 'notas') {
            html += `
                <div class="report-section">
                    <h3>Notas y Programación</h3>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="stats-card">
                                <h4>Resumen</h4>
                                <ul class="stats-list">
                                    <li><strong>Total Notas:</strong> ${datos.notas.total}</li>
                                </ul>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="stats-card">
                                <h4>Notas por Área</h4>
                                <ul class="stats-list">
                                    ${Object.entries(datos.notas.porArea).map(([area, cantidad]) => 
                                        `<li><strong>${area}:</strong> ${cantidad}</li>`
                                    ).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <h4>Listado de Notas</h4>
                    <div class="table-responsive">
                        <table class="table table-striped table-sm">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Área</th>
                                    <th>Contenido</th>
                                    <th>Personal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${datos.notas.listado.map(nota => `
                                    <tr>
                                        <td>${new Date(nota.fecha).toLocaleDateString('es-ES')}</td>
                                        <td>${nota.area}</td>
                                        <td>${nota.contenido}</td>
                                        <td>${nota.personasNombres ? nota.personasNombres.join(', ') : ''}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
    },
    
    // Recopilar datos para el informe
    recopilarDatos() {
        // Obtener todas las operaciones y notas en el rango de fechas
        const operaciones = DB.getAll('operaciones').filter(op => 
            op.fecha >= this.state.fechaInicio && op.fecha <= this.state.fechaFin
        );
        
        const notas = DB.getAll('notas').filter(nota => {
            const fechaNota = new Date(nota.fecha);
            const fechaInicioObj = new Date(this.state.fechaInicio);
            const fechaFinObj = new Date(this.state.fechaFin);
            fechaFinObj.setHours(23, 59, 59);
            return fechaNota >= fechaInicioObj && fechaNota <= fechaFinObj;
        });
        
        // Procesar datos de operaciones
        const descargas = operaciones.filter(op => op.tipo === 'Descarga').length;
        const clasificaciones = operaciones.filter(op => op.tipo === 'Clasificación').length;
        
        // Agrupar por cliente
        const porCliente = {};
        operaciones.forEach(op => {
            if (!porCliente[op.lugar]) {
                porCliente[op.lugar] = 0;
            }
            porCliente[op.lugar]++;
        });
        
        // Procesar datos de notas
        const porArea = {};
        notas.forEach(nota => {
            if (!porArea[nota.area]) {
                porArea[nota.area] = 0;
            }
            porArea[nota.area]++;
        });
        
        // Preparar objeto de datos
        return {
            operaciones: {
                total: operaciones.length,
                descargas,
                clasificaciones,
                porCliente,
                listado: operaciones
            },
            notas: {
                total: notas.length,
                porArea,
                listado: notas
            }
        };
    },
    
    // Generar PDF del informe
    generarPDF() {
        try {
            // Verificar disponibilidad de jsPDF
            if (typeof window.jspdf === 'undefined') {
                UI.mostrarNotificacion('Biblioteca jsPDF no disponible', 'error');
                return;
            }
            
            // Recopilar datos
            const datos = this.recopilarDatos();
            
            // Crear documento PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Título
            doc.setFontSize(18);
            doc.text('Informe de Producción', 20, 20);
            
            // Período
            doc.setFontSize(12);
            doc.text(`Período: ${new Date(this.state.fechaInicio).toLocaleDateString()} al ${new Date(this.state.fechaFin).toLocaleDateString()}`, 20, 30);
            
            let y = 40;
            
            // Sección de Operaciones
            if (this.state.tipoInforme === 'completo' || this.state.tipoInforme === 'operaciones') {
                doc.setFontSize(16);
                doc.text('Descargas y Clasificaciones', 20, y);
                y += 10;
                
                doc.setFontSize(12);
                doc.text(`Total Operaciones: ${datos.operaciones.total}`, 20, y);
                y += 7;
                doc.text(`Descargas: ${datos.operaciones.descargas}`, 20, y);
                y += 7;
                doc.text(`Clasificaciones: ${datos.operaciones.clasificaciones}`, 20, y);
                y += 12;
                
                // Tabla de operaciones
                if (datos.operaciones.listado.length > 0) {
                    doc.setFontSize(14);
                    doc.text('Listado de Operaciones', 20, y);
                    y += 8;
                    
                    const headers = [['Fecha', 'Tipo', 'Cliente', 'Personal', 'Estado']];
                    const body = datos.operaciones.listado.map(op => [
                        new Date(op.fecha).toLocaleDateString(),
                        op.tipo,
                        op.lugar,
                        op.personasInfo || '',
                        op.estado || 'pendiente'
                    ]);
                    
                    doc.autoTable({
                        startY: y,
                        head: headers,
                        body: body,
                        theme: 'grid',
                        styles: { fontSize: 8, cellPadding: 2 },
                        headStyles: { fillColor: [41, 128, 185], textColor: 255 }
                    });
                    
                    y = doc.lastAutoTable.finalY + 15;
                }
            }
            
            // Sección de Notas
            if (this.state.tipoInforme === 'completo' || this.state.tipoInforme === 'notas') {
                // Si estamos cerca del final de la página, añadir una nueva
                if (y > 220) {
                    doc.addPage();
                    y = 20;
                }
                
                doc.setFontSize(16);
                doc.text('Notas y Programación', 20, y);
                y += 10;
                
                doc.setFontSize(12);
                doc.text(`Total Notas: ${datos.notas.total}`, 20, y);
                y += 12;
                
                // Tabla de notas
                if (datos.notas.listado.length > 0) {
                    doc.setFontSize(14);
                    doc.text('Listado de Notas', 20, y);
                    y += 8;
                    
                    const headers = [['Fecha', 'Área', 'Contenido', 'Personal']];
                    const body = datos.notas.listado.map(nota => [
                        new Date(nota.fecha).toLocaleDateString(),
                        nota.area,
                        nota.contenido.substring(0, 40) + (nota.contenido.length > 40 ? '...' : ''),
                        nota.personasNombres ? nota.personasNombres.join(', ') : ''
                    ]);
                    
                    doc.autoTable({
                        startY: y,
                        head: headers,
                        body: body,
                        theme: 'grid',
                        styles: { fontSize: 8, cellPadding: 2 },
                        headStyles: { fillColor: [46, 204, 113], textColor: 255 }
                    });
                }
            }
            
            // Guardar el PDF
            const fileName = `informe_produccion_${this.state.fechaInicio}_${this.state.fechaFin}.pdf`;
            doc.save(fileName);
            
            UI.mostrarNotificacion(`PDF generado: ${fileName}`, 'success');
        } catch (error) {
            console.error('Error al generar PDF:', error);
            UI.mostrarNotificacion(`Error al generar PDF: ${error.message}`, 'error');
        }
    },
    
    // Generar Excel del informe
    generarExcel() {
        try {
            // Verificar disponibilidad de XLSX
            if (typeof XLSX === 'undefined') {
                UI.mostrarNotificacion('Biblioteca XLSX no disponible', 'error');
                return;
            }
            
            // Recopilar datos
            const datos = this.recopilarDatos();
            
            // Crear libro y hojas
            const wb = XLSX.utils.book_new();
            
            // Hoja de Resumen
            const resumenData = [
                ['INFORME DE PRODUCCIÓN'],
                [`Período: ${new Date(this.state.fechaInicio).toLocaleDateString()} al ${new Date(this.state.fechaFin).toLocaleDateString()}`],
                [],
                ['RESUMEN'],
                ['Total Operaciones:', datos.operaciones.total],
                ['Descargas:', datos.operaciones.descargas],
                ['Clasificaciones:', datos.operaciones.clasificaciones],
                ['Total Notas:', datos.notas.total],
                [],
                ['OPERACIONES POR CLIENTE']
            ];
            
            // Añadir datos de operaciones por cliente
            Object.entries(datos.operaciones.porCliente).forEach(([cliente, cantidad]) => {
                resumenData.push([cliente, cantidad]);
            });
            
            resumenData.push([]);
            resumenData.push(['NOTAS POR ÁREA']);
            
            // Añadir datos de notas por área
            Object.entries(datos.notas.porArea).forEach(([area, cantidad]) => {
                resumenData.push([area, cantidad]);
            });
            
            const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
            XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
            
            // Hoja de Operaciones
            if (this.state.tipoInforme === 'completo' || this.state.tipoInforme === 'operaciones') {
                const operacionesData = [
                    ['LISTADO DE OPERACIONES'],
                    [],
                    ['Fecha', 'Tipo', 'Cliente', 'Descripción', 'Personal', 'Estado']
                ];
                
                // Añadir datos de operaciones
                datos.operaciones.listado.forEach(op => {
                    operacionesData.push([
                        new Date(op.fecha).toLocaleDateString(),
                        op.tipo,
                        op.lugar,
                        op.descripcion || '',
                        op.personasInfo || '',
                        op.estado || 'pendiente'
                    ]);
                });
                
                const wsOperaciones = XLSX.utils.aoa_to_sheet(operacionesData);
                XLSX.utils.book_append_sheet(wb, wsOperaciones, 'Operaciones');
            }
            
            // Hoja de Notas
            if (this.state.tipoInforme === 'completo' || this.state.tipoInforme === 'notas') {
                const notasData = [
                    ['LISTADO DE NOTAS'],
                    [],
                    ['Fecha', 'Área', 'Contenido', 'Personal']
                ];
                
                // Añadir datos de notas
                datos.notas.listado.forEach(nota => {
                    notasData.push([
                        new Date(nota.fecha).toLocaleDateString(),
                        nota.area,
                        nota.contenido,
                        nota.personasNombres ? nota.personasNombres.join(', ') : ''
                    ]);
                });
                
                const wsNotas = XLSX.utils.aoa_to_sheet(notasData);
                XLSX.utils.book_append_sheet(wb, wsNotas, 'Notas');
            }
            
            // Guardar archivo
            const fileName = `informe_produccion_${this.state.fechaInicio}_${this.state.fechaFin}.xlsx`;
            XLSX.writeFile(wb, fileName);
            
            UI.mostrarNotificacion(`Excel generado: ${fileName}`, 'success');
        } catch (error) {
            console.error('Error al generar Excel:', error);
            UI.mostrarNotificacion(`Error al generar Excel: ${error.message}`, 'error');
        }
    }
};

// Inicializar módulo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Reportes.init();
}); 