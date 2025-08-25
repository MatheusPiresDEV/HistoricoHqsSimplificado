class ErrorHandler {
  constructor() {
    this.errors = new Map();
    this.fields = [
      'qtdHqs', 'hqsLidas', 'hqsEmAndamento',
      'qtdLivros', 'livrosLidos', 'livrosEmAndamento'
    ];
    this.init();
  }

  init() {
    this.setupValidation();
    this.setupErrorDisplay();
    this.setupSaveButton();
  }

  setupValidation() {
    this.fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('input', () => {
          this.validateField(fieldId);
          this.validateLogicalConsistency();
        });
      }
    });
  }

  setupErrorDisplay() {
    this.fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.id = `${fieldId}-error`;
        errorDiv.style.cssText = `
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          display: none;
        `;
        field.parentNode.appendChild(errorDiv);
      }
    });
  }

  setupSaveButton() {
    const btn = document.getElementById('adicionarBtn');
    if (btn) {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    }
  }

  validateField(fieldId) {
    const field = document.getElementById(fieldId);
    const raw = field.value.trim();
    const value = Number(raw);
    let error = null;

    if (raw === '') return this.setFieldError(fieldId, null); // Campo vazio, sem erro

    if (isNaN(value)) {
      error = 'Insira apenas números';
    } else if (value < 0) {
      error = 'Valor não pode ser negativo';
    }

    this.setFieldError(fieldId, error);
    this.updateSaveButtonState();
  }

  validateLogicalConsistency() {
    const hqsTotal = Number(document.getElementById('qtdHqs').value) || 0;
    const hqsLidas = Number(document.getElementById('hqsLidas').value) || 0;
    const hqsEmAndamento = Number(document.getElementById('hqsEmAndamento').value) || 0;

    const livrosTotal = Number(document.getElementById('qtdLivros').value) || 0;
    const livrosLidos = Number(document.getElementById('livrosLidos').value) || 0;
    const livrosEmAndamento = Number(document.getElementById('livrosEmAndamento').value) || 0;

    let errorHQ = null;
    let errorLivro = null;

    if (hqsLidas + hqsEmAndamento > hqsTotal) {
      errorHQ = 'Lidas + em andamento excedem o total';
    }

    if (livrosLidos + livrosEmAndamento > livrosTotal) {
      errorLivro = 'Lidos + em andamento excedem o total';
    }

    this.setFieldError('hqsLidas', errorHQ);
    this.setFieldError('hqsEmAndamento', errorHQ);
    this.setFieldError('livrosLidos', errorLivro);
    this.setFieldError('livrosEmAndamento', errorLivro);

    this.updateSaveButtonState();
  }

  setFieldError(fieldId, error) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(`${fieldId}-error`);

    if (error) {
      this.errors.set(fieldId, error);
      field.classList.add('error-field');
      field.style.borderColor = '#ef4444';
      field.style.backgroundColor = '#fee2e2';
      errorDiv.textContent = error;
      errorDiv.style.display = 'block';
    } else {
      this.errors.delete(fieldId);
      field.classList.remove('error-field');
      field.style.borderColor = '';
      field.style.backgroundColor = '';
      errorDiv.style.display = 'none';
    }
  }

  updateSaveButtonState() {
    const btn = document.getElementById('adicionarBtn');
    const hasErrors = this.errors.size > 0;
    if (btn) {
      btn.disabled = hasErrors;
      btn.style.opacity = hasErrors ? '0.5' : '1';
      btn.style.cursor = hasErrors ? 'not-allowed' : 'pointer';
    }
  }

  validateAll() {
    this.fields.forEach(fieldId => this.validateField(fieldId));
    this.validateLogicalConsistency();
    return this.errors.size === 0;
  }

  getAllErrors() {
    return Array.from(this.errors.entries());
  }
}

// Inicializa o validador
document.addEventListener('DOMContentLoaded', () => {
  window.errorHandler = new ErrorHandler();

  const btn = document.getElementById('adicionarBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      if (errorHandler.validateAll()) {
        // Aqui você pode salvar os dados
        console.log('Dados válidos. Salvando...');
      } else {
        console.log('Corrija os erros antes de salvar.');
      }
    });
  }
});
