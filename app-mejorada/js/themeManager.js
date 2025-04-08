/**
 * Módulo para manejar el cambio de tema (claro/oscuro)
 */

const ThemeManager = {
    // Estado del tema
    isDarkMode: false,
    
    // Inicializar el administrador de temas
    init() {
        console.log('Inicializando administrador de temas...');
        
        // Recuperar preferencia del usuario desde localStorage
        this.loadThemePreference();
        
        // Configurar el botón de cambio de tema
        this.setupThemeToggle();
        
        console.log('Administrador de temas inicializado');
    },
    
    // Cargar preferencia de tema del usuario
    loadThemePreference() {
        const storedTheme = localStorage.getItem('gp_theme');
        
        // Si existe una preferencia guardada, aplicarla
        if (storedTheme === 'dark') {
            this.enableDarkMode();
        } else {
            this.enableLightMode();
        }
    },
    
    // Configurar el botón de cambio de tema
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) {
            console.warn('No se encontró el botón de cambio de tema');
            return;
        }
        
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
    },
    
    // Alternar entre temas
    toggleTheme() {
        if (this.isDarkMode) {
            this.enableLightMode();
        } else {
            this.enableDarkMode();
        }
    },
    
    // Activar modo oscuro
    enableDarkMode() {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('gp_theme', 'dark');
        this.isDarkMode = true;
        
        // Actualizar icono y texto
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            const text = themeToggle.querySelector('span');
            
            if (icon) {
                icon.className = 'fas fa-sun';
            }
            
            if (text) {
                text.textContent = 'Modo claro';
            }
        }
    },
    
    // Activar modo claro
    enableLightMode() {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('gp_theme', 'light');
        this.isDarkMode = false;
        
        // Actualizar icono y texto
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            const text = themeToggle.querySelector('span');
            
            if (icon) {
                icon.className = 'fas fa-moon';
            }
            
            if (text) {
                text.textContent = 'Modo oscuro';
            }
        }
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
}); 