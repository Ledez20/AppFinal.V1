/**
 * Módulo UI para manipulación del interfaz de usuario
 * Proporciona funciones para mostrar notificaciones, tooltips, etc.
 */

const UI = {
    // Configuración
    config: {
        notificationDuration: 5000,
        notificationPosition: 'top-right',
        maxNotifications: 3
    },
    
    // Estado
    state: {
        activeNotifications: [],
        notificationContainer: null
    },
    
    // Inicializar UI
    init() {
        console.log('Inicializando UI...');
        this.prepareNotificationContainer();
    },
    
    // Preparar contenedor para notificaciones
    prepareNotificationContainer() {
        // Eliminar contenedor existente si hay uno
        if (this.state.notificationContainer) {
            document.body.removeChild(this.state.notificationContainer);
        }
        
        // Crear nuevo contenedor
        const container = document.createElement('div');
        container.className = `notification-container ${this.config.notificationPosition}`;
        document.body.appendChild(container);
        
        // Guardar referencia
        this.state.notificationContainer = container;
    },
    
    // Mostrar notificación
    mostrarNotificacion(mensaje, tipo = 'info', duracion = null, persistente = false) {
        console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
        
        // Si no hay contenedor, crear uno
        if (!this.state.notificationContainer) {
            this.prepareNotificationContainer();
        }
        
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${tipo}`;
        
        // Determinar ícono según tipo
        let icono = 'fa-info-circle';
        if (tipo === 'success') icono = 'fa-check-circle';
        if (tipo === 'warning') icono = 'fa-exclamation-triangle';
        if (tipo === 'error') icono = 'fa-times-circle';
        
        // Contenido de la notificación
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${icono}"></i>
            </div>
            <div class="notification-content">
                <p>${mensaje}</p>
            </div>
            ${!persistente ? '<button class="notification-close"><i class="fas fa-times"></i></button>' : ''}
        `;
        
        // Añadir al contenedor
        this.state.notificationContainer.appendChild(notification);
        
        // Registrar en las activas
        const notificationId = Date.now().toString();
        notification.setAttribute('data-id', notificationId);
        this.state.activeNotifications.push({
            id: notificationId,
            element: notification,
            timer: null
        });
        
        // Configurar cerrado
        const closeButton = notification.querySelector('.notification-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.closeNotification(notificationId);
            });
        }
        
        // Configurar temporizador de auto-cierre si no es persistente
        if (!persistente) {
            const finalDuration = duracion || this.config.notificationDuration;
            
            const notificationTimer = setTimeout(() => {
                this.closeNotification(notificationId);
            }, finalDuration);
            
            // Guardar referencia al timer
            const notificationInfo = this.state.activeNotifications.find(n => n.id === notificationId);
            if (notificationInfo) {
                notificationInfo.timer = notificationTimer;
            }
        }
        
        // Limitar número de notificaciones si exceden el máximo
        this.limitNotificationCount();
        
        // Añadir clase para iniciar animación
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        return notificationId;
    },
    
    // Cerrar notificación
    closeNotification(id) {
        const notificationInfo = this.state.activeNotifications.find(n => n.id === id);
        
        if (!notificationInfo) return;
        
        // Limpiar timer si existe
        if (notificationInfo.timer) {
            clearTimeout(notificationInfo.timer);
        }
        
        // Iniciar animación de cierre
        notificationInfo.element.classList.add('hiding');
        
        // Eliminar después de la animación
        setTimeout(() => {
            if (notificationInfo.element.parentNode) {
                notificationInfo.element.parentNode.removeChild(notificationInfo.element);
            }
            
            // Remover de las activas
            this.state.activeNotifications = this.state.activeNotifications.filter(n => n.id !== id);
        }, 300);
    },
    
    // Limitar número de notificaciones
    limitNotificationCount() {
        const maxCount = this.config.maxNotifications;
        
        if (this.state.activeNotifications.length > maxCount) {
            // Cerrar las más antiguas hasta estar en el límite
            const toClose = this.state.activeNotifications.slice(0, this.state.activeNotifications.length - maxCount);
            
            toClose.forEach(notification => {
                this.closeNotification(notification.id);
            });
        }
    },
    
    // Mostrar modal
    mostrarModal(options = {}) {
        // Opciones por defecto
        const defaults = {
            title: 'Información',
            content: '', // Puede ser texto o HTML
            message: '', // Para compatibilidad con código anterior
            type: 'info',
            size: 'md',
            width: null, // Ancho personalizado
            confirmText: 'Aceptar',
            cancelText: 'Cancelar',
            showCancel: false,
            onConfirm: null,
            onCancel: null,
            onClose: null,
            backdrop: true,
            keyboard: true,
            buttons: null // Botones personalizados (opcional)
        };
        
        // Combinar opciones proporcionadas con las predeterminadas
        const settings = { ...defaults, ...options };
        
        // Usar content o message, lo que esté disponible
        const modalContent = settings.content || settings.message;
        
        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-hidden', 'true');
        
        // Estructura básica del modal
        let dialogClass = `modal-dialog modal-${settings.size}`;
        if (settings.width) {
            dialogClass += ' modal-dialog-customwidth';
        }
        
        // Crear la estructura HTML del modal
        let modalHTML = `
            <div class="${dialogClass}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${settings.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body ${settings.type ? `modal-${settings.type}` : ''}">
                        ${modalContent}
                    </div>
        `;
        
        // Agregar footer con botones
        if (settings.buttons || settings.showCancel || settings.confirmText) {
            modalHTML += `<div class="modal-footer">`;
            
            // Si hay botones personalizados
            if (settings.buttons && Array.isArray(settings.buttons)) {
                settings.buttons.forEach(btn => {
                    modalHTML += `
                        <button type="button" class="btn btn-${btn.type || 'secondary'}" 
                                data-action="${btn.action || ''}"
                                ${btn.dismiss !== false ? 'data-bs-dismiss="modal"' : ''}>
                            ${btn.text}
                        </button>
                    `;
                });
            } else {
                // Botones predeterminados
                if (settings.showCancel) {
                    modalHTML += `
                        <button type="button" class="btn btn-secondary modal-cancel" data-bs-dismiss="modal">
                            ${settings.cancelText}
                        </button>
                    `;
                }
                
                modalHTML += `
                    <button type="button" class="btn btn-primary modal-confirm" data-bs-dismiss="modal">
                        ${settings.confirmText}
                    </button>
                `;
            }
            
            modalHTML += `</div>`;
        }
        
        // Cerrar estructura del modal
        modalHTML += `
                </div>
            </div>
        `;
        
        // Establecer el HTML del modal
        modal.innerHTML = modalHTML;
        
        // Aplicar estilo de ancho personalizado si se proporciona
        if (settings.width) {
            const style = document.createElement('style');
            style.textContent = `
                .modal-dialog-customwidth {
                    max-width: ${settings.width};
                    width: 100%;
                }
            `;
            document.head.appendChild(style);
            
            // Guardar referencia al estilo para eliminarlo después
            modal.dataset.customStyle = true;
        }
        
        // Agregar modal al DOM
        document.body.appendChild(modal);
        
        // Configurar eventos
        if (settings.onConfirm) {
            const confirmBtn = modal.querySelector('.modal-confirm');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', settings.onConfirm);
            }
        }
        
        if (settings.onCancel) {
            const cancelBtn = modal.querySelector('.modal-cancel');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', settings.onCancel);
            }
        }
        
        // Configurar eventos para botones personalizados
        if (settings.buttons && Array.isArray(settings.buttons)) {
            settings.buttons.forEach(btn => {
                if (btn.onClick && typeof btn.onClick === 'function') {
                    const btnEl = modal.querySelector(`button[data-action="${btn.action}"]`);
                    if (btnEl) {
                        btnEl.addEventListener('click', btn.onClick);
                    }
                }
            });
        }
        
        // Inicializar modal de Bootstrap
        const bsModal = new bootstrap.Modal(modal, {
            backdrop: settings.backdrop,
            keyboard: settings.keyboard
        });
        
        // Evento al cerrar el modal
        modal.addEventListener('hidden.bs.modal', (e) => {
            // Limpiar recursos
            if (settings.onClose && typeof settings.onClose === 'function') {
                settings.onClose();
            }
            
            // Eliminar estilo personalizado
            if (modal.dataset.customStyle) {
                const customStyle = document.querySelector('style[data-modal-style="true"]');
                if (customStyle) {
                    document.head.removeChild(customStyle);
                }
            }
            
            // Eliminar el modal del DOM
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 0);
        });
        
        // Mostrar el modal
        bsModal.show();
        
        // Retornar la instancia del modal para manipulación externa
        return {
            element: modal,
            instance: bsModal,
            close: () => bsModal.hide()
        };
    },
    
    // Método para cerrar un modal (utilizado por otros componentes)
    closeModal() {
        const modalElement = document.querySelector('.modal.show');
        if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            }
        }
    },
    
    // Mostrar diálogo de confirmación
    confirmar(options) {
        return new Promise(resolve => {
            // Si options es un string, convertirlo a objeto
            if (typeof options === 'string') {
                options = { message: options };
            }
            
            // Opciones por defecto
            const settings = {
                title: 'Confirmar acción',
                message: '¿Estás seguro de realizar esta acción?',
                confirmText: 'Confirmar',
                cancelText: 'Cancelar',
                type: 'warning',
                ...options
            };
            
            // Usar el modal actualizado con promesa
            this.mostrarModal({
                title: settings.title,
                content: `<p>${settings.message}</p>`,
                type: settings.type,
                showCancel: true,
                confirmText: settings.confirmText,
                cancelText: settings.cancelText,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    },

    // Método para cargar contenido en una sección específica
    cargarContenido(sectionId, contenido) {
        const section = document.getElementById(sectionId);
        if (!section) {
            console.error(`Sección con ID ${sectionId} no encontrada`);
            return false;
        }
        
        // Cargar el contenido en la sección
        section.innerHTML = contenido;
        
        // Notificar que el contenido ha sido cargado para posible inicialización de componentes
        document.dispatchEvent(new CustomEvent('contenidoCargado', {
            detail: { section: sectionId }
        }));
        
        return true;
    },

    // Método para crear una tabla HTML a partir de datos y configuración de columnas
    crearTabla(datos, columnas) {
        if (!datos || !datos.length || !columnas || !columnas.length) {
            return '<div class="alert alert-info">No hay datos disponibles</div>';
        }

        let html = `
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            ${columnas.map(col => `<th>${col.titulo}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
        `;

        // Generar filas
        datos.forEach(fila => {
            html += '<tr>';
            
            // Generar celdas para cada columna
            columnas.forEach(col => {
                let valor;
                
                // Si la columna tiene una función para obtener el valor
                if (typeof col.valor === 'function') {
                    valor = col.valor(fila);
                } else {
                    // Si es un campo directo
                    valor = fila[col.valor] || '';
                }
                
                html += `<td>${valor}</td>`;
            });
            
            html += '</tr>';
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        return html;
    }
};

// Inicializar al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});

// Agregar estilos para notificaciones si no existen
(function() {
    // Verificar si ya existe el estilo
    if (document.getElementById('ui-notification-styles')) return;
    
    // Crear elemento de estilo
    const style = document.createElement('style');
    style.id = 'ui-notification-styles';
    style.textContent = `
        .notification-container {
            position: fixed;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            max-width: 100%;
            max-height: 100vh;
            overflow-y: auto;
            padding: 10px;
        }
        
        .notification-container.top-right {
            top: 0;
            right: 0;
        }
        
        .notification-container.top-left {
            top: 0;
            left: 0;
        }
        
        .notification-container.bottom-right {
            bottom: 0;
            right: 0;
        }
        
        .notification-container.bottom-left {
            bottom: 0;
            left: 0;
        }
        
        .notification {
            background: white;
            border-radius: 5px;
            box-shadow: 0 3px 6px rgba(0,0,0,0.16);
            margin-bottom: 10px;
            padding: 15px;
            display: flex;
            align-items: flex-start;
            min-width: 300px;
            max-width: 450px;
            transform: translateX(120%);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .notification.show {
            transform: translateX(0);
            opacity: 1;
        }
        
        .notification.hiding {
            transform: translateX(120%);
            opacity: 0;
        }
        
        .notification-icon {
            margin-right: 15px;
            font-size: 1.5rem;
        }
        
        .notification-content {
            flex: 1;
        }
        
        .notification-close {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 0;
            margin-left: 10px;
            font-size: 1rem;
            color: #888;
        }
        
        .notification-success .notification-icon {
            color: #28a745;
        }
        
        .notification-error .notification-icon {
            color: #dc3545;
        }
        
        .notification-warning .notification-icon {
            color: #ffc107;
        }
        
        .notification-info .notification-icon {
            color: #17a2b8;
        }
        
        .modal-info {
            border-left: 5px solid #17a2b8;
        }
        
        .modal-success {
            border-left: 5px solid #28a745;
        }
        
        .modal-warning {
            border-left: 5px solid #ffc107;
        }
        
        .modal-error {
            border-left: 5px solid #dc3545;
        }
    `;
    
    document.head.appendChild(style);
})(); 