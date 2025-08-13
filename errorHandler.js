// ==========================================
// COMPREHENSIVE ERROR HANDLING SYSTEM
// Reading History Dashboard - Enhanced Validation
// ==========================================

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
    this.setupRealTimeValidation();
    this.setupErrorDisplay();
    this.setupSaveButtonState();
  }

  // Real-time validation setup
  setupRealTimeValidation() {
    this.fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('input', () => this.validateField(fieldId));
        field.addEventListener('blur', () => this.validateField(fieldId));
      }
    });
  }

  // Setup error display elements
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

  // Setup save button state management
  setupSaveButtonState() {
    const saveBtn = document.getElementById('adicionarBtn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.style.opacity = '0.5';
      saveBtn.style.cursor = 'not-allowed';
    }
  }

  // Validate individual field
  validateField(fieldId) {
    const field = document.getElementById(fieldId);
    const value = parseInt(field.value) || 0;
    let error = null;

    // Check for negative values
    if (value < 0) {
      error = 'Valor não pode ser negativo';
    }

    // Check for non-numeric input
    if (field.value && isNaN(parseInt(field.value))) {
      error = 'Por favor, insira apenas números';
    }

    // Specific validations based on field type
    if (fieldId.includes('Lidas') || fieldId.includes('Lidos')) {
      const totalField = fieldId.includes('Hqs') ? 'qtdHqs' : 'qtdLivros';
      const total = parseInt(document.getElementById(totalField).value) || 0;
      
      if (value > total) {
        error = 'Não pode exceder o total';
      }
    }

    if (fieldId.includes('EmAndamento')) {
      const totalField = fieldId.includes('Hqs') ? 'qtdHqs' : 'qtdLivros';
      const readField = fieldId.includes('Hqs') ? 'hqsLidas' : 'livrosLidos';
      const total = parseInt(document.getElementById(totalField).value) || 0;
      const read = parseInt(document.getElementById(readField).value) || 0;
      
      if (read + value > total) {
        error = 'Soma de lidas + em andamento excede o total';
      }
    }

    this.setFieldError(fieldId, error);
    this.updateSaveButtonState();
  }

  // Validate logical consistency across all fields
  validateLogicalConsistency() {
    const hqsTotal = parseInt(document.getElementById('qtdHqs').value) || 0;
    const hqsRead = parseInt(document.getElementById('hqsLidas').value) || 0;
    const hqsEmAndamento = parseInt(document.getElementById('hqsEmAndamento').value) || 0;

    const livrosTotal = parseInt(document.getElementById('qtdLivros').value) || 0;
    const livrosRead = parseInt(document.getElementById('livrosLidos').value) || 0;
    const livrosEmAndamento = parseInt(document.getElementById('livrosEmAndamento').value) || 0;

    let hasError = false;

    // HQs validation
    if (hqsRead + hqsEmAndamento > hqsTotal) {
      this.setFieldError('hqsLidas', 'Soma de HQs lidas + em andamento excede o total');
      this.setFieldError('hqsEmAndamento', 'Soma de HQs lidas + em andamento excede o total');
      hasError = true;
    }

    // Livros validation
    if (livrosRead + livrosEmAndamento > livrosTotal) {
      this.setFieldError('livrosLidos', 'Soma de livros lidos + em andamento excede o total');
      this.setFieldError('livrosEmAndamento', 'Soma de livros lidos + em andamento excede o total');
      hasError = true;
    }

    return !hasError;
  }

  // Set field error
  setFieldError(fieldId, error) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(`${fieldId}-error`);
    
    if (error) {
      this.errors.set(fieldId, error);
      field.classList.add('error-field');
      field.style.borderColor = '#ef4444';
      field.style.backgroundColor = '#fee2e2';
      
      if (errorDiv) {
        errorDiv.textContent = error;
        errorDiv.style.display = 'block';
      }
    } else {
      this.errors.delete(fieldId);
      field.classList.remove('error-field');
      field.style.borderColor = '';
      field.style.backgroundColor = '';
      
      if (errorDiv) {
        errorDiv.style.display = 'none';
      }
    }
  }

  // Update save button state based on errors
  updateSaveButtonState() {
    const saveBtn = document.getElementById('adicionarBtn');
    const hasErrors = this.errors.size > 0;
    
    if (saveBtn) {
      saveBtn.disabled = hasErrors;
      saveBtn.style.opacity = hasErrors ? '0.5' : '1';
      saveBtn.style.cursor = hasErrors ? 'not-allowed' : 'pointer';
      
      if (hasErrors) {
        saveBtn.title = 'Corrija os erros antes de salvar';
      } else {
        saveBtn.title = '';
      }
    }
  }

  // Get all current errors
  getAllErrors() {
    return Array.from(this.errors.entries());
  }

  // Clear all errors
  clearAllErrors() {
    this.errors.clear();
    this.fields.forEach(fieldId => {
      this.setFieldError(fieldId, null);
    });
    this.updateSaveButtonState();
  }

  // Validate all fields
  validateAll() {
    this.fields.forEach(fieldId => this.validateField(fieldId));
    this.validateLogicalConsistency();
    return this.errors.size === 0;
  }
}

// Enhanced validation functions
const ValidationRules = {
  isPositive: (value) => value >= 0 || 'Valor deve ser positivo',
  isInteger: (value) => Number.isInteger(value) || 'Deve ser um número inteiro',
  isLessThanOrEqual: (value, max) => value <= max || `Não pode exceder ${max}`,
  isSumValid: (values, total) => {
    const sum = values.reduce((a, b) => a + b, 0);
    return sum <= total || 'Soma não pode exceder o total';
  }
};

// CSS for error states
const errorStyles = `
  .error-field {
    border-color: #ef4444 !important;
    background-color: #fee2e2 !important;
    animation: shake 0.3s ease-in-out;
  }

  .field-error {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    font-weight: 500;
    animation: fadeIn 0.3s ease;
  }

  .error-card {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: var(--radius);
    padding: 1rem;
    margin-bottom: 1rem;
    color: #991b1b;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .btn-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = errorStyles;
document.head.appendChild(styleSheet);

// Initialize error handler
const errorHandler = new ErrorHandler();

// Enhanced save function with validation
function handleSaveDataWithValidation() {
  if (!errorHandler.validateAll()) {
    showErrorSummary();
    return false;
  }

  // Proceed with save if no errors
  const smartData = calculateSmartValues();
  readingData = smartData;
  localStorage.setItem('readingData', JSON.stringify(readingData));
  
  updateDisplay();
  renderizarGraficos();
  showSuccessFeedback();
  return true;
}

// Show error summary
function showErrorSummary() {
  const errors = errorHandler.getAllErrors();
  const errorCard = document.getElementById('errorCard');
  const errorText = errorCard.querySelector('.error-text');
  
  if (errors.length > 0) {
    errorText.innerHTML = `
      <strong>Por favor, corrija os seguintes erros:</strong>
      <ul style="margin-top: 0.5rem; padding-left: 1rem;">
        ${errors.map(([field, error]) => `<li><strong>${getFieldLabel(field)}:</strong> ${error}</li>`).join('')}
      </ul>
    `;
    errorCard.style.display = 'block';
    
    setTimeout(() => {
      errorCard.style.display = 'none';
    }, 5000);
  }
}

// Get field label for display
function getFieldLabel(fieldId) {
  const labels = {
    'qtdHqs': 'Total de HQs',
    'hqsLidas': 'HQs Lidas',
    'hqsEmAndamento': 'HQs Em Andamento',
    'qtdLivros': 'Total de Livros',
    'livrosLidos': 'Livros Lidos',
    'livrosEmAndamento': 'Livros Em Andamento'
  };
  return labels[fieldId] || fieldId;
}

// Override original save function
document.addEventListener('DOMContentLoaded', function() {
  const saveBtn = document.getElementById('adicionarBtn');
  if (saveBtn) {
    saveBtn.removeEventListener('click', handleSaveData);
    saveBtn.addEventListener('click', handleSaveDataWithValidation);
  }
});

// Export for use in other modules
window.ErrorHandler = ErrorHandler;
window.errorHandler = errorHandler;
