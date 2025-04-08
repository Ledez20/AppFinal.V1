/**
 * Módulo de protección de datos
 * Proporciona funcionalidades para evitar pérdida de datos
 */

const DataProtection = {
    // Configuración
    config: {
        backupPrefix: 'gp_backup_',
        maxBackups: 5,
        autoBackupInterval: 5 * 60 * 1000, // 5 minutos
        backupNotificationDuration: 3000,
        lastBackupKey: 'gp_last_backup_info',
        exitWarningEnabled: true,
        autoBackupEnabled: true,
        remindBeforeClose: true,
        autoBackup: true,
        backupCount: 5, // Número de respaldos a mantener
    },
    
    // Estado
    state: {
        hasUnsavedChanges: false,
        lastSaved: null,
        backupTimer: null,
        dataModified: false
    },
    
    // Inicializar protección de datos
    init() {
        console.log("Inicializando sistema de protección de datos...");
        
        // Guardar referencia a la base de datos
        this.db = DB;
        
        // Registrar eventos de cierre de ventana/pestaña
        this.setupWindowCloseProtection();
        
        // Configurar respaldo automático
        if (this.config.autoBackup) {
            this.setupAutoBackup();
        }
        
        // Añadir botones de respaldo al UI
        this.addBackupUI();
        
        // Hooks para detectar cambios en datos
        this.setupDataChangeDetection();
        
        console.log("Sistema de protección de datos inicializado.");
    },
    
    // Configurar protección al cerrar ventana
    setupWindowCloseProtection() {
        window.addEventListener('beforeunload', (event) => {
            if (this.state.hasUnsavedChanges && this.config.remindBeforeClose) {
                // Mensaje estándar de confirmación (el texto exacto depende del navegador)
                const message = "¡ATENCIÓN! Hay datos sin guardar. Si cierras la página, podrías perderlos. ¿Estás seguro de que deseas salir?";
                event.returnValue = message;
                return message;
            }
        });
    },
    
    // Configurar respaldo automático
    setupAutoBackup() {
        // Limpiar timer existente
        if (this.state.backupTimer) {
            clearInterval(this.state.backupTimer);
        }
        
        // Crear nuevo timer para respaldo periódico
        this.state.backupTimer = setInterval(() => {
            if (this.state.dataModified) {
                this.createBackup('auto');
                this.state.dataModified = false;
            }
        }, this.config.autoBackupInterval);
        
        // Verificar cuándo fue el último respaldo
        this.checkLastBackup();
    },
    
    // Revisar último respaldo
    checkLastBackup() {
        const lastBackup = localStorage.getItem(this.config.lastBackupKey);
        
        if (lastBackup) {
            const backupTime = new Date(JSON.parse(lastBackup).timestamp);
            const now = new Date();
            const hoursSinceBackup = (now - backupTime) / (1000 * 60 * 60);
            
            // Si han pasado más de 24 horas, sugerir respaldo
            if (hoursSinceBackup > 24) {
                this.showBackupReminder(hoursSinceBackup);
            }
        } else {
            // Si nunca se ha hecho respaldo, sugerir hacerlo
            this.showBackupReminder();
        }
    },
    
    // Mostrar recordatorio de respaldo
    showBackupReminder(hours = null) {
        let message = "Es recomendable hacer un respaldo de tus datos.";
        
        if (hours) {
            message = `Han pasado ${Math.floor(hours)} horas desde tu último respaldo. ${message}`;
        } else {
            message = `No se ha encontrado ningún respaldo anterior. ${message}`;
        }
        
        UI.mostrarNotificacion(message, 'warning', 10000, true);
    },
    
    // Crear un respaldo de los datos
    async createBackup(type = 'auto') {
        try {
            console.log(`Creando respaldo ${type}...`);
            const timestamp = Date.now();
            
            // Obtener todos los datos de la base de datos
            let datosActuales;
            try {
                console.log("Obteniendo datos para respaldo...");
                datosActuales = await this.db.obtenerTodosLosDatos();
                console.log("Datos obtenidos correctamente:", Object.keys(datosActuales));
            } catch (error) {
                console.error('Error al obtener los datos para respaldo:', error);
                
                // Alternativa: obtener datos directamente de los stores
                console.log("Usando método alternativo para obtener datos...");
                datosActuales = {};
                Object.keys(this.db.stores).forEach(store => {
                    datosActuales[store] = this.db.getAll(store);
                });
                console.log("Datos obtenidos por método alternativo:", Object.keys(datosActuales));
            }
            
            // Verificar que tenemos datos
            if (!datosActuales || Object.keys(datosActuales).length === 0) {
                throw new Error('No se pudieron obtener datos para el respaldo');
            }
            
            const backupKey = `${this.config.backupPrefix}${timestamp}`;
            
            // Crear objeto de respaldo
            const backupData = {
                timestamp,
                tipo: type,
                datos: datosActuales
            };
            
            // Convertir a JSON
            const backupJson = JSON.stringify(backupData);
            console.log(`Tamaño del respaldo: ${(backupJson.length / 1024).toFixed(2)} KB`);
            
            // Guardar datos en localStorage
            try {
                localStorage.setItem(backupKey, backupJson);
                console.log(`Respaldo guardado en localStorage con clave: ${backupKey}`);
            } catch (storageError) {
                console.error('Error al guardar en localStorage:', storageError);
                if (storageError.name === 'QuotaExceededError' || 
                    storageError.message.includes('exceeded') || 
                    storageError.message.includes('quota')) {
                    // Si el error es por exceder el límite de cuota
                    this.limpiarRespaldosAntiguos(3); // Eliminar más respaldos para liberar espacio
                    // Intentar guardar de nuevo
                    localStorage.setItem(backupKey, backupJson);
                } else {
                    throw storageError;
                }
            }
            
            // Guardar información sobre el último respaldo
            localStorage.setItem(this.config.lastBackupKey, JSON.stringify({
                timestamp,
                tipo: type,
                key: backupKey,
                elementos: Object.keys(datosActuales).reduce((total, key) => {
                    return total + (Array.isArray(datosActuales[key]) ? datosActuales[key].length : 0);
                }, 0)
            }));
            
            // Si es respaldo manual, ofrecer descarga
            if (type === 'manual') {
                console.log("Iniciando exportación de respaldo a archivo...");
                this.exportarRespaldo(datosActuales);
            }
            
            // Limpiar backups antiguos
            this.limitarNumeroRespaldos();
            
            // Actualizar UI de respaldo si existe
            this.addBackupUI();
            
            // Mostrar notificación
            UI.mostrarNotificacion(
                type === 'auto' 
                    ? 'Respaldo automático creado' 
                    : 'Respaldo creado correctamente',
                'success', 
                this.config.backupNotificationDuration
            );
            
            return true;
        } catch (error) {
            console.error('Error al crear respaldo:', error);
            
            UI.mostrarNotificacion(
                `Error al crear respaldo: ${error.message}`,
                'error',
                6000
            );
            
            return false;
        }
    },
    
    // Limpiar respaldos antiguos en caso de error de cuota
    limpiarRespaldosAntiguos(mantener = 2) {
        try {
            console.log(`Limpiando respaldos antiguos, manteniendo los ${mantener} más recientes...`);
            const respaldos = this.obtenerRespaldosLocales();
            
            // Ordenar por fecha (más recientes primero)
            respaldos.sort((a, b) => b.timestamp - a.timestamp);
            
            // Mantener solo los N más recientes
            const aEliminar = respaldos.slice(mantener);
            
            if (aEliminar.length > 0) {
                aEliminar.forEach(backup => {
                    localStorage.removeItem(backup.key);
                    console.log(`Respaldo eliminado para liberar espacio: ${backup.key}`);
                });
                UI.mostrarNotificacion(`Se eliminaron ${aEliminar.length} respaldos antiguos para liberar espacio`, 'warning');
            }
            
            return true;
        } catch (error) {
            console.error('Error al limpiar respaldos antiguos:', error);
            return false;
        }
    },
    
    // Exportar respaldo a un archivo para descargar
    exportarRespaldo(datos) {
        try {
            console.log("Exportando respaldo a archivo...");
            
            if (!datos || Object.keys(datos).length === 0) {
                throw new Error('No hay datos para exportar');
            }
            
            // Crear objeto de respaldo
            const respaldo = {
                timestamp: Date.now(),
                tipo: 'manual',
                version: '1.0',
                datos: datos
            };
            
            // Formatear nombre de archivo con fecha y hora
            const date = new Date();
            const dateStr = date.toLocaleDateString('es-ES').replace(/\//g, '-');
            const timeStr = date.toLocaleTimeString('es-ES').replace(/:/g, '-');
            const fileName = `respaldo_gestion_produccion_${dateStr}_${timeStr}.json`;
            
            console.log(`Nombre de archivo: ${fileName}`);
            
            // Convertir a JSON y crear blob
            const jsonStr = JSON.stringify(respaldo, null, 2); // Formateado para mejor legibilidad
            const blob = new Blob([jsonStr], { type: 'application/json' });
            
            console.log(`Tamaño del archivo: ${(blob.size / 1024).toFixed(2)} KB`);
            
            // Crear URL de objeto y link de descarga
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = fileName;
            downloadLink.style.display = 'none';
            
            // Añadir a DOM, disparar click y limpiar
            document.body.appendChild(downloadLink);
            console.log("Iniciando descarga...");
            downloadLink.click();
            
            // Limpiar después de un tiempo para asegurar que la descarga comience
            setTimeout(() => {
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(url);
                console.log("Descarga iniciada y recursos liberados");
            }, 500);
            
            UI.mostrarNotificacion(`Respaldo exportado: ${fileName}`, 'success');
            return true;
        } catch (error) {
            console.error('Error al exportar respaldo:', error);
            UI.mostrarNotificacion(`Error al exportar respaldo: ${error.message}`, 'error');
            return false;
        }
    },
    
    // Restaurar datos desde respaldo
    restoreFromBackup(backupData) {
        try {
            const data = typeof backupData === 'string' ? JSON.parse(backupData) : backupData;
            
            // Validar formato de los datos
            if (!data.stores || !data.timestamp) {
                throw new Error('Formato de respaldo inválido');
            }
            
            // Confirmar restauración
            if (!confirm(`¿Estás seguro de restaurar el respaldo del ${new Date(data.timestamp).toLocaleString()}? ¡Esto reemplazará TODOS tus datos actuales!`)) {
                return false;
            }
            
            // Restaurar cada almacén
            Object.keys(data.stores).forEach(store => {
                if (DB.stores[store] !== undefined) {
                    DB.stores[store] = data.stores[store];
                }
            });
            
            // Guardar cambios
            DB.save();
            
            // Recargar los datos en la interfaz
            if (typeof reloadAllData === 'function') {
                reloadAllData();
            } else {
                location.reload(); // Alternativa: recargar la página
            }
            
            UI.mostrarNotificacion('Datos restaurados correctamente', 'success');
            return true;
        } catch (error) {
            console.error('Error al restaurar respaldo:', error);
            UI.mostrarNotificacion(`Error al restaurar respaldo: ${error.message}`, 'error');
            return false;
        }
    },
    
    // Restaurar desde archivo
    restoreFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.restoreFromBackup(data);
                } catch (error) {
                    UI.mostrarNotificacion(`Error al leer el archivo: ${error.message}`, 'error');
                }
            };
            reader.readAsText(file);
        });
        
        input.click();
    },
    
    // Restaurar desde respaldo local
    restoreFromLocalBackup() {
        const backups = this.getLocalBackups();
        
        if (backups.length === 0) {
            UI.mostrarNotificacion('No hay respaldos locales disponibles', 'warning');
            return;
        }
        
        // Crear modal para seleccionar respaldo
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'backupModal';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Restaurar desde respaldo</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="list-group">
                            ${backups.map((backup, index) => `
                                <button type="button" class="list-group-item list-group-item-action backup-item" 
                                        data-index="${index}">
                                    ${new Date(backup.timestamp).toLocaleString()} 
                                    <span class="badge bg-secondary">${backup.type === 'manual' ? 'Manual' : 'Auto'}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Registrar eventos
        modal.querySelectorAll('.backup-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.getAttribute('data-index'));
                const backupData = backups[index].data;
                const bsModal = bootstrap.Modal.getInstance(modal);
                bsModal.hide();
                setTimeout(() => {
                    this.restoreFromBackup(backupData);
                    modal.remove();
                }, 500);
            });
        });
        
        // Mostrar modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },
    
    // Obtener respaldos locales
    getLocalBackups() {
        const backups = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('gp_backup_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    backups.push({
                        key: key,
                        timestamp: data.timestamp,
                        type: data.type,
                        data: data
                    });
                } catch (e) {
                    console.error(`Error parsing backup ${key}:`, e);
                }
            }
        }
        
        // Ordenar por fecha, más recientes primero
        return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    
    // Agregar UI para respaldos
    addBackupUI() {
        console.log("Añadiendo botones de respaldo a la UI...");
        // Agregar botones de respaldo al sidebar
        const sidebar = document.querySelector('.sidebar-footer');
        
        if (!sidebar) {
            console.warn("No se encontró el elemento sidebar-footer para añadir botones de respaldo");
            return;
        }
        
        // Limpiar botones existentes
        const existingButtons = document.querySelectorAll('[data-backup-btn]');
        existingButtons.forEach(btn => btn.remove());
        
        // Crear contenedor para botones en el sidebar
        const backupContainer = document.createElement('div');
        backupContainer.className = 'sidebar-backup-controls';
        
        // Verificar último respaldo
        const lastBackupInfo = localStorage.getItem(this.config.lastBackupKey);
        let lastBackupTimeAgo = '';
        let lastBackupDate = null;
        
        if (lastBackupInfo) {
            try {
                const backupData = JSON.parse(lastBackupInfo);
                lastBackupDate = new Date(backupData.timestamp);
                const now = new Date();
                const diffMinutes = Math.floor((now - lastBackupDate) / (1000 * 60));
                
                // Formatear tiempo transcurrido
                if (diffMinutes < 60) {
                    lastBackupTimeAgo = `hace ${diffMinutes} min`;
                } else if (diffMinutes < 1440) { // menos de 24 horas
                    const hours = Math.floor(diffMinutes / 60);
                    lastBackupTimeAgo = `hace ${hours} hora${hours > 1 ? 's' : ''}`;
                } else {
                    const days = Math.floor(diffMinutes / 1440);
                    lastBackupTimeAgo = `hace ${days} día${days > 1 ? 's' : ''}`;
                }
            } catch (e) {
                console.error('Error al analizar fecha de último respaldo', e);
            }
        }
        
        // Crear etiqueta de último respaldo
        const lastBackupLabel = document.createElement('div');
        lastBackupLabel.className = 'backup-status';
        
        if (lastBackupTimeAgo) {
            const needsBackup = lastBackupDate && (new Date() - lastBackupDate) > (24 * 60 * 60 * 1000);
            lastBackupLabel.innerHTML = `
                <div class="backup-status-icon ${needsBackup ? 'warning' : 'ok'}">
                    <i class="fas ${needsBackup ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
                </div>
                <div class="backup-status-text">
                    <span>Último respaldo:</span>
                    <strong>${lastBackupTimeAgo}</strong>
                </div>
            `;
        } else {
            lastBackupLabel.innerHTML = `
                <div class="backup-status-icon warning">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="backup-status-text">
                    <span>Sin respaldos</span>
                </div>
            `;
        }
        
        // Agregar solo el botón de respaldo
        const backupBtn = document.createElement('button');
        backupBtn.className = 'sidebar-backup-btn backup';
        backupBtn.setAttribute('data-backup-btn', 'true');
        backupBtn.setAttribute('title', 'Crear respaldo de datos');
        backupBtn.innerHTML = '<i class="fas fa-save"></i>';
        backupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Botón de respaldo clickeado");
            this.crearRespaldoManual();
        });
        
        backupContainer.appendChild(backupBtn);
        
        // Crear contenedor general
        const backupControls = document.createElement('div');
        backupControls.className = 'sidebar-backup-wrapper';
        backupControls.appendChild(lastBackupLabel);
        backupControls.appendChild(backupContainer);
        
        // Insertar antes del texto de versión
        sidebar.prepend(backupControls);
        
        // Agregar estilos si no existen
        this.addBackupStyles();
        console.log("Botones de respaldo añadidos correctamente");
    },
    
    // Función para manejar el clic en el botón de respaldo manual
    crearRespaldoManual() {
        console.log("Iniciando creación de respaldo manual...");
        UI.mostrarNotificacion("Creando respaldo de datos...", "info", 3000);
        
        // Usamos setTimeout para evitar bloquear la interfaz
        setTimeout(async () => {
            try {
                const resultado = await this.createBackup('manual');
                if (resultado) {
                    console.log("Respaldo manual creado correctamente");
                } else {
                    console.error("Falló la creación del respaldo manual");
                }
            } catch (error) {
                console.error("Error al crear respaldo manual:", error);
                UI.mostrarNotificacion(`Error al crear respaldo: ${error.message}`, "error", 5000);
            }
        }, 100);
    },
    
    // Mostrar opciones de restauración
    showRestoreOptions() {
        try {
            // Buscar respaldos disponibles
            const respaldos = this.obtenerRespaldosLocales();
            
            // Crear modal
            const modalContent = document.createElement('div');
            modalContent.className = 'backup-restore-options';
            
            // Título
            const titulo = document.createElement('h3');
            titulo.textContent = 'Restaurar desde respaldo';
            modalContent.appendChild(titulo);
            
            // Si hay respaldos locales
            if (respaldos.length > 0) {
                // Ordenar por fecha, más reciente primero
                respaldos.sort((a, b) => b.timestamp - a.timestamp);
                
                // Crear sección de respaldos locales
                const localesDiv = document.createElement('div');
                localesDiv.className = 'backup-section';
                
                const subtitulo = document.createElement('h4');
                subtitulo.textContent = 'Respaldos locales disponibles';
                localesDiv.appendChild(subtitulo);
                
                const lista = document.createElement('ul');
                lista.className = 'backup-list';
                
                respaldos.forEach(backup => {
                    const fecha = new Date(backup.timestamp);
                    const item = document.createElement('li');
                    item.className = 'backup-item';
                    
                    // Formatear fecha legible
                    const fechaStr = fecha.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                    
                    const horaStr = fecha.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    // Determinar tipo de respaldo con ícono
                    const tipoIcono = backup.tipo === 'auto' ? 
                        '<i class="fas fa-clock"></i>' : 
                        '<i class="fas fa-user"></i>';
                    
                    // Calcular elementos respaldados
                    let elementosStr = '';
                    if (backup.elementos) {
                        elementosStr = `<span class="backup-count">${backup.elementos} elementos</span>`;
                    }
                    
                    item.innerHTML = `
                        <div class="backup-info">
                            <div class="backup-date">
                                <span class="backup-type">${tipoIcono} ${backup.tipo === 'auto' ? 'Automático' : 'Manual'}</span>
                                <strong>${fechaStr}</strong> 
                                <span class="backup-time">${horaStr}</span>
                            </div>
                            ${elementosStr}
                        </div>
                        <button class="btn btn-sm btn-primary restore-btn">Restaurar</button>
                    `;
                    
                    // Agregar evento para restaurar este respaldo
                    const restoreBtn = item.querySelector('.restore-btn');
                    restoreBtn.addEventListener('click', async () => {
                        if (await this.confirmarRestauracion(backup)) {
                            UI.closeModal();
                        }
                    });
                    
                    lista.appendChild(item);
                });
                
                localesDiv.appendChild(lista);
                modalContent.appendChild(localesDiv);
            } else {
                const noBackups = document.createElement('p');
                noBackups.className = 'no-backups-message';
                noBackups.innerHTML = '<i class="fas fa-exclamation-circle"></i> No hay respaldos locales disponibles.';
                modalContent.appendChild(noBackups);
            }
            
            // Opción para importar archivo
            const importDiv = document.createElement('div');
            importDiv.className = 'backup-section';
            
            const importTitle = document.createElement('h4');
            importTitle.textContent = 'Restaurar desde archivo';
            importDiv.appendChild(importTitle);
            
            const importDesc = document.createElement('p');
            importDesc.textContent = 'Selecciona un archivo de respaldo (.json) para restaurar los datos.';
            importDiv.appendChild(importDesc);
            
            // Crear un contenedor para el input y el botón
            const fileInputContainer = document.createElement('div');
            fileInputContainer.className = 'file-input-container';
            
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.id = 'backup-file-input';
            fileInput.style.display = 'none';
            
            const fileLabel = document.createElement('label');
            fileLabel.htmlFor = 'backup-file-input';
            fileLabel.className = 'btn btn-outline-primary';
            fileLabel.innerHTML = '<i class="fas fa-file-upload"></i> Seleccionar archivo';
            
            fileInputContainer.appendChild(fileInput);
            fileInputContainer.appendChild(fileLabel);
            importDiv.appendChild(fileInputContainer);
            
            // Crear elemento para mostrar el nombre del archivo seleccionado
            const selectedFileName = document.createElement('div');
            selectedFileName.id = 'selected-file-name';
            selectedFileName.className = 'selected-file-name mt-2';
            importDiv.appendChild(selectedFileName);
            
            // Agregar event listener para mostrar el nombre del archivo y procesar el archivo
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    const file = e.target.files[0];
                    selectedFileName.textContent = `Archivo seleccionado: ${file.name}`;
                    
                    // Crear botón para iniciar la restauración
                    const restoreButton = document.createElement('button');
                    restoreButton.className = 'btn btn-success mt-2';
                    restoreButton.innerHTML = '<i class="fas fa-check"></i> Restaurar desde este archivo';
                    restoreButton.onclick = () => {
                        UI.closeModal();
                        this.restaurarDesdeArchivo(file);
                    };
                    
                    // Eliminar botón anterior si existe
                    const prevButton = importDiv.querySelector('.btn-success');
                    if (prevButton) {
                        importDiv.removeChild(prevButton);
                    }
                    
                    importDiv.appendChild(restoreButton);
                } else {
                    selectedFileName.textContent = '';
                }
            });
            
            modalContent.appendChild(importDiv);
            
            // Estilos específicos para el modal
            const modalStyle = document.createElement('style');
            modalStyle.textContent = `
                .backup-restore-options {
                    font-family: var(--font-family);
                }
                
                .backup-restore-options h3 {
                    margin-top: 0;
                    color: var(--primary-color);
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                }
                
                .backup-section {
                    margin: 15px 0;
                }
                
                .backup-section h4 {
                    margin-bottom: 10px;
                    color: #333;
                }
                
                .backup-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    max-height: 250px;
                    overflow-y: auto;
                    border: 1px solid #eee;
                    border-radius: 5px;
                }
                
                .backup-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 15px;
                    border-bottom: 1px solid #eee;
                    transition: background-color 0.2s;
                }
                
                .backup-item:last-child {
                    border-bottom: none;
                }
                
                .backup-item:hover {
                    background-color: #f9f9f9;
                }
                
                .backup-date {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .backup-type {
                    font-size: 0.8rem;
                    background: #f0f0f0;
                    padding: 2px 6px;
                    border-radius: 4px;
                    color: #555;
                }
                
                .backup-time {
                    color: #777;
                    font-size: 0.9em;
                }
                
                .backup-count {
                    font-size: 0.85rem;
                    color: #666;
                }
                
                .no-backups-message {
                    text-align: center;
                    padding: 20px;
                    color: #777;
                    background: #f9f9f9;
                    border-radius: 5px;
                    font-style: italic;
                }
                
                .no-backups-message i {
                    margin-right: 5px;
                    color: #f39c12;
                }
                
                .selected-file-name {
                    color: #555;
                    font-size: 0.9rem;
                    margin-top: 5px;
                }
                
                #backup-file-input + label {
                    display: inline-block;
                    margin-top: 10px;
                    cursor: pointer;
                }
            `;
            
            document.head.appendChild(modalStyle);
            
            // Mostrar modal
            UI.mostrarModal({
                title: 'Restaurar datos',
                content: modalContent,
                width: '450px',
                onClose: () => {
                    // Limpiar el estilo modal cuando se cierre
                    if (document.head.contains(modalStyle)) {
                        document.head.removeChild(modalStyle);
                    }
                }
            });
            
        } catch (error) {
            console.error('Error al mostrar opciones de restauración:', error);
            UI.mostrarNotificacion('Error al cargar opciones de restauración', 'error');
        }
    },
    
    // Obtener respaldos locales
    obtenerRespaldosLocales() {
        const respaldos = [];
        
        // Buscar todas las claves en localStorage que comiencen con el prefijo de respaldo
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.config.backupPrefix)) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data && data.timestamp) {
                        respaldos.push({
                            key: key,
                            timestamp: data.timestamp,
                            tipo: data.tipo || 'auto',
                            elementos: data.datos ? Object.values(data.datos).flat().length : 0
                        });
                    }
                } catch (e) {
                    console.error('Error al leer respaldo:', e);
                }
            }
        }
        
        return respaldos;
    },
    
    // Confirmar restauración de un respaldo
    async confirmarRestauracion(backup) {
        try {
            const fecha = new Date(backup.timestamp);
            const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const confirmado = await UI.confirmar({
                title: 'Confirmar restauración',
                message: `¿Estás seguro de restaurar el respaldo del ${fechaFormateada}? Esta acción sobrescribirá todos los datos actuales.`,
                confirmText: 'Restaurar',
                cancelText: 'Cancelar',
                type: 'warning'
            });
            
            if (confirmado) {
                const respaldoData = JSON.parse(localStorage.getItem(backup.key));
                if (!respaldoData || !respaldoData.datos) {
                    throw new Error('El formato del respaldo es inválido');
                }
                
                // Restaurar cada almacén
                const datosRestaurados = respaldoData.datos;
                
                // Restaurar en la base de datos
                for (const almacen in datosRestaurados) {
                    if (almacen in this.db.stores) {
                        this.db.stores[almacen] = datosRestaurados[almacen];
                    }
                }
                
                // Guardar cambios
                this.db.save();
                
                // Notificar a la aplicación
                document.dispatchEvent(new CustomEvent('datosRestaurados', {
                    detail: {
                        timestamp: backup.timestamp,
                        tipo: backup.tipo
                    }
                }));
                
                UI.mostrarNotificacion('Datos restaurados correctamente', 'success');
                
                // Forzar refresco de la aplicación
                setTimeout(() => location.reload(), 1500);
                
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error al restaurar respaldo:', error);
            UI.mostrarNotificacion('Error al restaurar respaldo. Inténtalo de nuevo.', 'error', 6000);
            return false;
        }
    },
    
    // Restaurar desde archivo
    restaurarDesdeArchivo(file) {
        if (!file || !(file instanceof File)) {
            UI.mostrarNotificacion('No se ha seleccionado un archivo válido', 'error');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const contenido = e.target.result;
                let data;
                
                try {
                    data = JSON.parse(contenido);
                } catch (parseError) {
                    throw new Error(`Error al analizar el archivo JSON: ${parseError.message}`);
                }
                
                // Validar estructura básica
                if (!data.datos && !data.stores) {
                    throw new Error('El archivo no contiene un respaldo válido. Formato incorrecto.');
                }
                
                // Compatibilidad con diferentes formatos de respaldo
                const datosParaRestaurar = data.datos || data.stores;
                const timestamp = data.timestamp || new Date().toISOString();
                
                const fechaStr = new Date(timestamp).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                const confirmado = await UI.confirmar({
                    title: 'Confirmar restauración',
                    message: `¿Estás seguro de restaurar el respaldo del archivo con fecha ${fechaStr}? Esta acción sobrescribirá todos los datos actuales.`,
                    confirmText: 'Restaurar',
                    cancelText: 'Cancelar',
                    type: 'warning'
                });
                
                if (confirmado) {
                    // Crear respaldo antes de restaurar por seguridad
                    await this.createBackup('pre_restore');
                    
                    // Restaurar cada almacén
                    for (const almacen in datosParaRestaurar) {
                        if (almacen in this.db.stores) {
                            this.db.stores[almacen] = datosParaRestaurar[almacen];
                            console.log(`Restaurado almacén: ${almacen} con ${datosParaRestaurar[almacen].length || 0} registros`);
                        }
                    }
                    
                    // Guardar cambios
                    if (this.db.save()) {
                        // Notificar a la aplicación
                        document.dispatchEvent(new CustomEvent('datosRestaurados', {
                            detail: {
                                timestamp: timestamp,
                                tipo: 'archivo',
                                nombreArchivo: file.name
                            }
                        }));
                        
                        UI.mostrarNotificacion('Datos restaurados correctamente desde archivo', 'success');
                        
                        // Forzar refresco de la aplicación después de un breve momento
                        setTimeout(() => location.reload(), 1500);
                    } else {
                        throw new Error('Error al guardar los datos restaurados');
                    }
                }
            } catch (error) {
                console.error('Error al procesar archivo de respaldo:', error);
                UI.mostrarNotificacion(`Error al procesar el archivo: ${error.message}`, 'error', 6000);
            }
        };
        
        reader.onerror = (error) => {
            console.error('Error al leer el archivo:', error);
            UI.mostrarNotificacion('Error al leer el archivo seleccionado', 'error');
        };
        
        reader.readAsText(file);
    },
    
    // Configurar detección de cambios en datos
    setupDataChangeDetection() {
        // Sobreescribir método save de la DB para detectar cambios
        const originalSave = DB.save;
        
        DB.save = function() {
            const result = originalSave.apply(this, arguments);
            
            if (result) {
                DataProtection.state.hasUnsavedChanges = true;
                DataProtection.state.dataModified = true;
            }
            
            return result;
        };
    },
    
    // Agregar estilos para los botones de respaldo
    addBackupStyles() {
        if (document.getElementById('backup-btn-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'backup-btn-styles';
        style.textContent = `
            .sidebar-backup-wrapper {
                margin-bottom: 15px;
                width: 100%;
            }
            
            .backup-status {
                display: flex;
                align-items: center;
                padding: 5px 10px;
                margin-bottom: 8px;
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.7);
                background: rgba(0, 0, 0, 0.1);
                border-radius: 6px;
            }
            
            .backup-status-icon {
                margin-right: 8px;
                font-size: 12px;
            }
            
            .backup-status-icon.ok {
                color: #2ecc71;
            }
            
            .backup-status-icon.warning {
                color: #f39c12;
            }
            
            .backup-status-text {
                display: flex;
                flex-direction: column;
                line-height: 1.2;
            }
            
            .backup-status-text span {
                opacity: 0.7;
            }
            
            .backup-status-text strong {
                color: white;
            }
            
            .sidebar-backup-controls {
                display: flex;
                justify-content: center;
                padding: 8px;
                background: rgba(0, 0, 0, 0.15);
                border-radius: 20px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2) inset;
            }
            
            .sidebar-backup-btn {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 50%;
                color: rgba(255, 255, 255, 0.8);
                cursor: pointer;
                height: 40px;
                width: 40px;
                margin: 0 8px;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                position: relative;
            }
            
            .sidebar-backup-btn.backup {
                background: rgba(52, 152, 219, 0.2);
            }
            
            .sidebar-backup-btn.restore {
                background: rgba(46, 204, 113, 0.2);
            }
            
            .sidebar-backup-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                color: #fff;
                transform: translateY(-3px);
                box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
            }
            
            .sidebar-backup-btn.backup:hover {
                background: rgba(52, 152, 219, 0.4);
            }
            
            .sidebar-backup-btn.restore:hover {
                background: rgba(46, 204, 113, 0.4);
            }
            
            .sidebar-backup-btn:active {
                transform: translateY(0);
            }
            
            .sidebar-footer {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
        `;
        
        document.head.appendChild(style);
    },
    
    // Limitar el número de respaldos automáticos
    limitarNumeroRespaldos() {
        try {
            console.log(`Limpiando respaldos antiguos según configuración (max: ${this.config.maxBackups})...`);
            const respaldos = this.obtenerRespaldosLocales();
            
            // Ordenar por fecha (más antiguos primero)
            respaldos.sort((a, b) => a.timestamp - b.timestamp);
            
            // Si hay más respaldos de los permitidos, eliminar los más antiguos
            if (respaldos.length > this.config.maxBackups) {
                // Mantener los respaldos manuales siempre que sea posible
                const respaldosAuto = respaldos.filter(r => r.tipo === 'auto');
                
                // Si hay suficientes respaldos automáticos para eliminar
                if (respaldosAuto.length > this.config.maxBackups / 2) {
                    // Eliminar los respaldos automáticos más antiguos
                    const aEliminar = respaldosAuto.slice(0, respaldos.length - this.config.maxBackups);
                    
                    aEliminar.forEach(backup => {
                        localStorage.removeItem(backup.key);
                        console.log(`Respaldo antiguo eliminado: ${backup.key}`);
                    });
                } else {
                    // Eliminar los respaldos más antiguos sin importar su tipo
                    const aEliminar = respaldos.slice(0, respaldos.length - this.config.maxBackups);
                    
                    aEliminar.forEach(backup => {
                        localStorage.removeItem(backup.key);
                        console.log(`Respaldo antiguo eliminado: ${backup.key}`);
                    });
                }
                
                console.log(`Limpieza finalizada. Respaldos restantes: ${localStorage.length}`);
            } else {
                console.log(`No es necesario limpiar. Respaldos: ${respaldos.length}, máximo: ${this.config.maxBackups}`);
            }
            
            return true;
        } catch (error) {
            console.error('Error al limitar número de respaldos:', error);
            return false;
        }
    },
    
    // Importar datos generales desde un archivo de respaldo
    importarDatosGenerales() {
        console.log("Iniciando importación de datos generales...");
        
        // Crear y mostrar el selector de archivos
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        // Mostrar notificación
        UI.mostrarNotificacion('Selecciona el archivo de datos para importar', 'info');
        
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
                    // Usar la función importData de la base de datos
                    if (DB && typeof DB.importData === 'function') {
                        DB.importData(contenido);
                    } else {
                        throw new Error('No se encontró la función de importación de la base de datos');
                    }
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
    },
    
    // Detectar a qué almacén corresponden los datos de un array
    detectarAlmacen(datos) {
        if (!Array.isArray(datos) || datos.length === 0) return null;
        
        // Tomar una muestra de los datos para analizar
        const muestra = datos.slice(0, Math.min(5, datos.length));
        
        // Buscar características de cada tipo de almacén
        const caracteristicas = {
            nominas: item => item.personaId && item.horasNormales !== undefined,
            elaboraciones: item => item.nBins !== undefined && item.kgRecibidos !== undefined,
            personal: item => item.nombre && item.cargo && !item.kgRecibidos,
            inventario: item => item.productoId && item.tipo && (item.tipo === 'entrada' || item.tipo === 'salida'),
            operaciones: item => item.lugar && item.descripcion && item.tipo,
            notas: item => item.contenido && item.area
        };
        
        // Probar cada tipo de almacén
        for (const [almacen, test] of Object.entries(caracteristicas)) {
            if (muestra.every(item => test(item))) {
                return almacen;
            }
        }
        
        return null;
    },
};

// Exponer globalmente para que esté accesible directamente
window.DataProtection = DataProtection;

// Registrar módulo para inicialización
if (typeof modulesToInit === 'undefined') {
    window.modulesToInit = {};
}
window.modulesToInit.dataProtection = DataProtection; 