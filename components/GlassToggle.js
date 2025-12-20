export class GlassToggle {
  constructor(target, options = {}) {
    this.onChange = options.onChange || null;
    this.checked = !!options.checked;
    this.disabled = !!options.disabled;

    this.root = typeof target === 'string' ? document.querySelector(target) : target;
    if (!this.root) {
      console.error('GlassToggle: target element not found');
      return;
    }

    this.build();
    this.applyState();
    this.attachEvents();
  }

  build() {
    this.root.classList.add('glass-toggle');
    this.root.setAttribute('role', 'switch');
    this.root.setAttribute('aria-checked', String(this.checked));
    this.root.setAttribute('tabindex', this.disabled ? '-1' : '0');
    if (this.disabled) {
      this.root.setAttribute('aria-disabled', 'true');
    }

    this.track = document.createElement('div');
    this.track.className = 'glass-toggle-track';

    this.thumb = document.createElement('div');
    this.thumb.className = 'glass-toggle-thumb';

    // Optional label slot if none exists
    if (!this.root.querySelector('.glass-toggle-label') && this.root.textContent.trim()) {
      const label = document.createElement('span');
      label.className = 'glass-toggle-label';
      label.textContent = this.root.textContent.trim();
      this.root.textContent = '';
      this.root.appendChild(label);
    }

    this.root.appendChild(this.track);
    this.root.appendChild(this.thumb);
  }

  attachEvents() {
    this.root.addEventListener('click', (e) => {
      if (this.disabled) return;
      e.preventDefault();
      this.toggle();
    });

    this.root.addEventListener('keydown', (e) => {
      if (this.disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  toggle() {
    this.setChecked(!this.checked);
  }

  setChecked(next) {
    const newVal = !!next;
    if (newVal === this.checked) return;
    this.checked = newVal;
    this.applyState();
    if (typeof this.onChange === 'function') {
      this.onChange(this.checked);
    }
  }

  isChecked() {
    return this.checked;
  }

  setDisabled(disabled) {
    this.disabled = !!disabled;
    this.root.setAttribute('tabindex', this.disabled ? '-1' : '0');
    if (this.disabled) {
      this.root.setAttribute('aria-disabled', 'true');
      this.root.classList.add('disabled');
    } else {
      this.root.removeAttribute('aria-disabled');
      this.root.classList.remove('disabled');
    }
  }

  applyState() {
    if (!this.root) return;
    this.root.classList.toggle('checked', this.checked);
    this.root.setAttribute('aria-checked', String(this.checked));
  }
}
