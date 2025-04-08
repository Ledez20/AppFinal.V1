// Módulo de exportación
const Export = {
    // Exportar nómina a PDF
    exportarNominaPDF: function(nomina) {
        try {
            // Asegurarse de que jsPDF está disponible
            if (typeof window.jspdf === 'undefined') {
                console.error('jsPDF no está disponible');
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configuración inicial
            doc.setFontSize(16);
            doc.text('Nómina de Producción', 20, 20);
            
            // Información de la nómina
            doc.setFontSize(12);
            doc.text(`Fecha: ${nomina.fecha}`, 20, 30);
            doc.text(`Almacén: ${nomina.almacen}`, 20, 40);
            
            // Tabla de personal
            const headers = ['Nombre', 'Horas', 'Producción', 'Total'];
            const data = nomina.personal.map(p => [
                p.nombre,
                p.horas,
                p.produccion,
                p.total
            ]);
            
            // Estilo de la tabla
            doc.autoTable({
                startY: 50,
                head: [headers],
                body: data,
                theme: 'grid',
                headStyles: {
                    fillColor: [44, 62, 80],
                    textColor: 255,
                    fontSize: 10
                },
                styles: {
                    fontSize: 9,
                    cellPadding: 3
                }
            });
            
            // Guardar el PDF
            const fileName = `nomina_${nomina.fecha.replace(/\//g, '-')}.pdf`;
            doc.save(fileName);
            console.log('PDF generado exitosamente:', fileName);
        } catch (error) {
            console.error('Error al generar PDF:', error);
            UI.mostrarNotificacion('Error al generar el PDF: ' + error.message, 'error');
        }
    },
    
    // Exportar nómina a Excel
    exportarNominaExcel: function(nomina) {
        try {
            // Asegurarse de que XLSX está disponible
            if (typeof XLSX === 'undefined') {
                console.error('XLSX no está disponible');
                return;
            }

            const wb = XLSX.utils.book_new();
            
            // Preparar datos
            const data = [
                ['Nómina de Producción'],
                ['Fecha:', nomina.fecha],
                ['Almacén:', nomina.almacen],
                [],
                ['Nombre', 'Horas', 'Producción', 'Total']
            ];
            
            // Añadir datos del personal
            nomina.personal.forEach(p => {
                data.push([p.nombre, p.horas, p.produccion, p.total]);
            });
            
            // Crear hoja de cálculo
            const ws = XLSX.utils.aoa_to_sheet(data);
            
            // Aplicar estilos
            ws['!cols'] = [
                {wch: 30}, // Nombre
                {wch: 10}, // Horas
                {wch: 15}, // Producción
                {wch: 15}  // Total
            ];
            
            // Añadir hoja al libro
            XLSX.utils.book_append_sheet(wb, ws, 'Nómina');
            
            // Guardar archivo
            const fileName = `nomina_${nomina.fecha.replace(/\//g, '-')}.xlsx`;
            XLSX.writeFile(wb, fileName);
            console.log('Excel generado exitosamente:', fileName);
        } catch (error) {
            console.error('Error al generar Excel:', error);
            UI.mostrarNotificacion('Error al generar el Excel: ' + error.message, 'error');
        }
    },
    
    // Exportar métricas de producción a PDF
    exportarMetricasPDF: function(metricas) {
        try {
            // Asegurarse de que jsPDF está disponible
            if (typeof window.jspdf === 'undefined') {
                console.error('jsPDF no está disponible');
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Título
            doc.setFontSize(16);
            doc.text('Métricas de Producción', 20, 20);
            
            // Fecha del informe
            doc.setFontSize(12);
            doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);
            
            // Resumen general
            doc.setFontSize(14);
            doc.text('Resumen General', 20, 45);
            
            doc.setFontSize(12);
            let y = 55;
            Object.entries(metricas.resumen).forEach(([key, value]) => {
                doc.text(`${key}: ${value}`, 20, y);
                y += 10;
            });
            
            // Gráficos de producción
            doc.setFontSize(14);
            doc.text('Producción por Área', 20, y + 10);
            
            // Tabla de producción por área
            const headers = ['Área', 'Producción', 'Eficiencia'];
            const data = metricas.areas.map(a => [a.nombre, a.produccion, a.eficiencia]);
            
            doc.autoTable({
                startY: y + 20,
                head: [headers],
                body: data,
                theme: 'grid',
                headStyles: {
                    fillColor: [44, 62, 80],
                    textColor: 255,
                    fontSize: 10
                },
                styles: {
                    fontSize: 9,
                    cellPadding: 3
                }
            });
            
            // Guardar el PDF
            const fileName = `metricas_produccion_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            console.log('PDF de métricas generado exitosamente:', fileName);
        } catch (error) {
            console.error('Error al generar PDF de métricas:', error);
            UI.mostrarNotificacion('Error al generar el PDF de métricas: ' + error.message, 'error');
        }
    },
    
    // Exportar métricas a Excel
    exportarMetricasExcel: function(metricas) {
        try {
            // Asegurarse de que XLSX está disponible
            if (typeof XLSX === 'undefined') {
                console.error('XLSX no está disponible');
                return;
            }

            const wb = XLSX.utils.book_new();
            
            // Hoja de resumen
            const resumenData = [
                ['Métricas de Producción'],
                ['Fecha:', new Date().toLocaleDateString()],
                [],
                ['Resumen General']
            ];
            
            Object.entries(metricas.resumen).forEach(([key, value]) => {
                resumenData.push([key, value]);
            });
            
            const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
            wsResumen['!cols'] = [{wch: 30}, {wch: 20}];
            
            // Hoja de producción por área
            const areasData = [
                ['Producción por Área'],
                ['Área', 'Producción', 'Eficiencia']
            ];
            
            metricas.areas.forEach(a => {
                areasData.push([a.nombre, a.produccion, a.eficiencia]);
            });
            
            const wsAreas = XLSX.utils.aoa_to_sheet(areasData);
            wsAreas['!cols'] = [{wch: 30}, {wch: 15}, {wch: 15}];
            
            // Añadir hojas al libro
            XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
            XLSX.utils.book_append_sheet(wb, wsAreas, 'Producción por Área');
            
            // Guardar archivo
            const fileName = `metricas_produccion_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);
            console.log('Excel de métricas generado exitosamente:', fileName);
        } catch (error) {
            console.error('Error al generar Excel de métricas:', error);
            UI.mostrarNotificacion('Error al generar el Excel de métricas: ' + error.message, 'error');
        }
    }
}; 