/* ====================================================
   SHOPSPHERE - CUSTOM TOAST NOTIFICATION SYSTEM
   ==================================================== */

class Toast {
  static initContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  static show(message, type = 'info', duration = 3500) {
    const container = this.initContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'i-lucide-info';
    if (type === 'success') icon = '✓';
    else if (type === 'danger') icon = '✕';
    else if (type === 'warning') icon = '⚠';

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-body">${message}</div>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }

  static success(message) {
    this.show(message, 'success');
  }

  static error(message) {
    this.show(message, 'danger');
  }

  static warning(message) {
    this.show(message, 'warning');
  }
}
