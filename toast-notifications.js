// === QuoVadiScout v1.3.0 - Toast Notifications System ===

/**
 * Sistema di notifiche toast moderno e accessibile
 * Sostituisce gli alert() con notifiche eleganti
 */
class ToastManager {
  constructor() {
    this.container = null;
    this.activeToasts = new Set();
    this.maxToasts = 5;
    this.init();
  }

  init() {
    // Crea il container per i toast
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'toast-container';
    this.container.setAttribute('role', 'status');
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(this.container);

    // Aggiungi stili CSS inline se non esistono già
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
        }

        .toast {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 16px 20px;
          min-width: 300px;
          max-width: 400px;
          display: flex;
          align-items: center;
          gap: 12px;
          pointer-events: auto;
          animation: slideInRight 0.3s ease-out;
          transition: opacity 0.3s ease-out;
        }

        .toast.toast-leaving {
          animation: slideOutRight 0.3s ease-out;
          opacity: 0;
        }

        .toast-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .toast-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .toast-title {
          font-weight: 600;
          font-size: 14px;
          color: #1a1a1a;
          margin: 0;
        }

        .toast-message {
          font-size: 13px;
          color: #666;
          margin: 0;
        }

        .toast-close {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          font-size: 20px;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: color 0.2s;
        }

        .toast-close:hover {
          color: #333;
        }

        /* Tipi di toast */
        .toast-success {
          border-left: 4px solid #2f6b2f;
        }

        .toast-success .toast-icon {
          color: #2f6b2f;
        }

        .toast-error {
          border-left: 4px solid #dc3545;
        }

        .toast-error .toast-icon {
          color: #dc3545;
        }

        .toast-warning {
          border-left: 4px solid #ffc107;
        }

        .toast-warning .toast-icon {
          color: #ffc107;
        }

        .toast-info {
          border-left: 4px solid #17a2b8;
        }

        .toast-info .toast-icon {
          color: #17a2b8;
        }

        /* Animazioni */
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .toast {
            background: #2a2a2a;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          .toast-title {
            color: #f0f0f0;
          }

          .toast-message {
            color: #aaa;
          }

          .toast-close {
            color: #999;
          }

          .toast-close:hover {
            color: #ccc;
          }
        }

        /* Mobile responsive */
        @media (max-width: 480px) {
          .toast-container {
            top: 10px;
            right: 10px;
            left: 10px;
          }

          .toast {
            min-width: auto;
            max-width: 100%;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Mostra un toast notification
   * @param {string} message - Messaggio da mostrare
   * @param {Object} options - Opzioni del toast
   * @param {string} options.type - Tipo: 'success', 'error', 'warning', 'info'
   * @param {string} options.title - Titolo opzionale
   * @param {number} options.duration - Durata in ms (default: 3000)
   * @param {boolean} options.dismissible - Mostra pulsante chiusura (default: true)
   */
  show(message, options = {}) {
    const {
      type = 'info',
      title = null,
      duration = 3000,
      dismissible = true
    } = options;

    // Rimuovi toast più vecchi se siamo al limite
    if (this.activeToasts.size >= this.maxToasts) {
      const oldestToast = this.container.firstElementChild;
      if (oldestToast) {
        this.remove(oldestToast);
      }
    }

    // Crea il toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    // Icone per tipo
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    // Contenuto del toast
    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true">${icons[type] || icons.info}</span>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      ${dismissible ? '<button class="toast-close" aria-label="Chiudi notifica" onclick="window.toastManager.remove(this.closest(\'.toast\'))">×</button>' : ''}
    `;

    // Aggiungi al container
    this.container.appendChild(toast);
    this.activeToasts.add(toast);

    // Auto-rimuovi dopo la durata specificata
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast);
      }, duration);
    }

    return toast;
  }

  /**
   * Rimuove un toast
   */
  remove(toast) {
    if (!toast || !toast.parentNode) return;

    toast.classList.add('toast-leaving');
    this.activeToasts.delete(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }

  /**
   * Metodi di convenienza per i vari tipi
   */
  success(message, options = {}) {
    return this.show(message, { ...options, type: 'success' });
  }

  error(message, options = {}) {
    return this.show(message, { ...options, type: 'error', duration: 5000 });
  }

  warning(message, options = {}) {
    return this.show(message, { ...options, type: 'warning' });
  }

  info(message, options = {}) {
    return this.show(message, { ...options, type: 'info' });
  }

  /**
   * Rimuove tutti i toast
   */
  clear() {
    this.activeToasts.forEach(toast => this.remove(toast));
  }
}

// Inizializza il ToastManager
const toastManager = new ToastManager();

// Rendi disponibile globalmente
window.toastManager = toastManager;

// Funzioni helper globali per compatibilità
window.showToast = (message, options) => toastManager.show(message, options);
window.showSuccess = (message, options) => toastManager.success(message, options);
window.showError = (message, options) => toastManager.error(message, options);
window.showWarning = (message, options) => toastManager.warning(message, options);
window.showInfo = (message, options) => toastManager.info(message, options);

// Rimossa dichiarazione export per compatibilità con script globale
// export default toastManager;

