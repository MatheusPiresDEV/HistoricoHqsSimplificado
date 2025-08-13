// ==========================================
// MODERN DASHBOARD JAVASCRIPT
// Reading History Dashboard - Interactive Charts
// ==========================================

// Global variables
let charts = {};
let readingData = {
  hqs: { total: 0, read: 0, emAndamento: 0, naoLidas: 0 },
  livros: { total: 0, read: 0, emAndamento: 0, naoLidos: 0 }
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
  initializeDashboard();
  loadSavedData();
  setupEventListeners();
});

// Initialize dashboard components
function initializeDashboard() {
  console.log('🚀 Dashboard initialized');
  updateDisplay();
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('adicionarBtn').addEventListener('click', handleSaveData);
  
  // Real-time updates
  ['qtdHqs', 'hqsLidas', 'hqsEmAndamento', 'qtdLivros', 'livrosLidos', 'livrosEmAndamento'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateDisplay);
  });
}

// Smart calculation function
function calculateSmartValues() {
  const hqsTotal = parseInt(document.getElementById('qtdHqs').value) || 0;
  const hqsRead = parseInt(document.getElementById('hqsLidas').value) || 0;
  const hqsEmAndamento = parseInt(document.getElementById('hqsEmAndamento').value) || 0;
  
  const livrosTotal = parseInt(document.getElementById('qtdLivros').value) || 0;
  const livrosRead = parseInt(document.getElementById('livrosLidos').value) || 0;
  const livrosEmAndamento = parseInt(document.getElementById('livrosEmAndamento').value) || 0;

  // Smart calculation: ensure sum equals total
  const hqsNaoLidas = Math.max(0, hqsTotal - hqsRead - hqsEmAndamento);
  const livrosNaoLidos = Math.max(0, livrosTotal - livrosRead - livrosEmAndamento);

  // Auto-adjust if sum exceeds total
  let adjustedHqsRead = hqsRead;
  let adjustedHqsEmAndamento = hqsEmAndamento;
  let adjustedLivrosRead = livrosRead;
  let adjustedLivrosEmAndamento = livrosEmAndamento;

  if (hqsRead + hqsEmAndamento > hqsTotal) {
    const ratio = hqsTotal / (hqsRead + hqsEmAndamento);
    adjustedHqsRead = Math.floor(hqsRead * ratio);
    adjustedHqsEmAndamento = Math.floor(hqsEmAndamento * ratio);
  }

  if (livrosRead + livrosEmAndamento > livrosTotal) {
    const ratio = livrosTotal / (livrosRead + livrosEmAndamento);
    adjustedLivrosRead = Math.floor(livrosRead * ratio);
    adjustedLivrosEmAndamento = Math.floor(livrosEmAndamento * ratio);
  }

  return {
    hqs: {
      total: hqsTotal,
      read: adjustedHqsRead,
      emAndamento: adjustedHqsEmAndamento,
      naoLidas: Math.max(0, hqsTotal - adjustedHqsRead - adjustedHqsEmAndamento)
    },
    livros: {
      total: livrosTotal,
      read: adjustedLivrosRead,
      emAndamento: adjustedLivrosEmAndamento,
      naoLidos: Math.max(0, livrosTotal - adjustedLivrosRead - adjustedLivrosEmAndamento)
    }
  };
}

function handleSaveData() {
  console.log('handleSaveData called');
  
  // Get smart calculated values
  const smartData = calculateSmartValues();
  
  // Validate inputs
  if (!validateInputs(smartData)) {
    return;
  }

  // Save data
  readingData = smartData;
  localStorage.setItem('readingData', JSON.stringify(readingData));
  
  // Update display with confirmation
  updateDisplay();
  renderizarGraficos();
  showSuccessFeedback();
}

// Validate inputs
function validateInputs(data) {
  let hasError = false;
  clearErrorStates();

  // Check for negative values
  const allValues = [
    data.hqs.total, data.hqs.read, data.hqs.emAndamento,
    data.livros.total, data.livros.read, data.livros.emAndamento
  ];

  if (allValues.some(val => val < 0)) {
    showMessage('❌ Valores não podem ser negativos!', 'erro');
    hasError = true;
  }

  // Check if read + in progress exceeds total (shouldn't happen with smart calculation)
  if (data.hqs.read + data.hqs.emAndamento > data.hqs.total) {
    showFieldError('hqsLidas', 'Soma de lidas + em andamento excede o total');
    hasError = true;
  }

  if (data.livros.read + data.livros.emAndamento > data.livros.total) {
    showFieldError('livrosLidos', 'Soma de lidos + em andamento excede o total');
    hasError = true;
  }

  return !hasError;
}

// Show success feedback
function showSuccessFeedback() {
  const messageDiv = document.getElementById('mensagem');
  messageDiv.innerHTML = `
    <div class="success-feedback">
      <span class="success-icon">✅</span>
      <div class="success-content">
        <strong>Dados salvos com sucesso!</strong>
        <br>
        <small>HQs: ${readingData.hqs.read} lidas, ${readingData.hqs.emAndamento} em andamento, ${readingData.hqs.naoLidas} não lidas</small>
        <br>
        <small>Livros: ${readingData.livros.read} lidos, ${readingData.livros.emAndamento} em andamento, ${readingData.livros.naoLidos} não lidos</small>
      </div>
    </div>
  `;
  messageDiv.className = 'mensagem sucesso';
  messageDiv.style.display = 'block';
  
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 4000);
}

// Show field error
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  field.classList.add('error');
  field.style.borderColor = '#ef4444';
  field.style.backgroundColor = '#fee2e2';
  
  // Create error message element
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  errorDiv.style.color = '#ef4444';
  errorDiv.style.fontSize = '0.875rem';
  errorDiv.style.marginTop = '0.25rem';
  
  // Insert after the field
  field.parentNode.appendChild(errorDiv);
}

// Clear error states
function clearErrorStates() {
  const fields = ['qtdHqs', 'hqsLidas', 'qtdLivros', 'livrosLidos'];
  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    field.classList.remove('error');
    field.style.borderColor = '';
    field.style.backgroundColor = '';
    
    // Remove error messages
    const errorMessages = field.parentNode.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
  });
}

// Load saved data
function loadSavedData() {
  const saved = localStorage.getItem('readingData');
  if (saved) {
    readingData = JSON.parse(saved);
    
    document.getElementById('qtdHqs').value = readingData.hqs.total;
    document.getElementById('hqsLidas').value = readingData.hqs.read;
    document.getElementById('hqsEmAndamento').value = readingData.hqs.emAndamento || 0;
    document.getElementById('qtdLivros').value = readingData.livros.total;
    document.getElementById('livrosLidos').value = readingData.livros.read;
    document.getElementById('livrosEmAndamento').value = readingData.livros.emAndamento || 0;
    
    updateDisplay();
    renderizarGraficos();
  }
}

// Update display with current data
function updateDisplay() {
  const hqsTotal = parseInt(document.getElementById('qtdHqs').value) || 0;
  const hqsRead = parseInt(document.getElementById('hqsLidas').value) || 0;
  const hqsEmAndamento = parseInt(document.getElementById('hqsEmAndamento').value) || 0;
  const livrosTotal = parseInt(document.getElementById('qtdLivros').value) || 0;
  const livrosRead = parseInt(document.getElementById('livrosLidos').value) || 0;
  const livrosEmAndamento = parseInt(document.getElementById('livrosEmAndamento').value) || 0;

  // Calculate Não Lidas
  const hqsNaoLidas = hqsTotal - hqsRead - hqsEmAndamento;
  const livrosNaoLidos = livrosTotal - livrosRead - livrosEmAndamento;

  // Calculate percentages
  const percentHqsLidas = hqsTotal > 0 ? Math.round((hqsRead / hqsTotal) * 100) : 0;
  const percentHqsEmAndamento = hqsTotal > 0 ? Math.round((hqsEmAndamento / hqsTotal) * 100) : 0;
  const percentHqsNaoLidas = hqsTotal > 0 ? Math.round((hqsNaoLidas / hqsTotal) * 100) : 0;

  const percentLivrosLidos = livrosTotal > 0 ? Math.round((livrosRead / livrosTotal) * 100) : 0;
  const percentLivrosEmAndamento = livrosTotal > 0 ? Math.round((livrosEmAndamento / livrosTotal) * 100) : 0;
  const percentLivrosNaoLidos = livrosTotal > 0 ? Math.round((livrosNaoLidos / livrosTotal) * 100) : 0;

  // Update reading data
  readingData = {
    hqs: { total: hqsTotal, read: hqsRead, emAndamento: hqsEmAndamento, naoLidas: hqsNaoLidas },
    livros: { total: livrosTotal, read: livrosRead, emAndamento: livrosEmAndamento, naoLidos: livrosNaoLidos }
  };

  // Update UI
  document.getElementById('totalHqs').textContent = hqsTotal;
  document.getElementById('hqsLidasResumo').textContent = hqsRead;
  document.getElementById('hqsNaoLidasResumo').textContent = hqsNaoLidas;
  document.getElementById('hqsEmAndamentoResumo').textContent = hqsEmAndamento;
  document.getElementById('percentHqsLidasResumo').textContent = percentHqsLidas + '%';
  document.getElementById('percentHqsNaoLidasResumo').textContent = percentHqsNaoLidas + '%';
  document.getElementById('percentHqsEmAndamentoResumo').textContent = percentHqsEmAndamento + '%';
  document.getElementById('mediaHqs').textContent = hqsTotal > 0 ? (hqsRead / hqsTotal).toFixed(2) : 0;
  document.getElementById('dpHqs').textContent = calculateStandardDeviation([hqsRead, hqsEmAndamento, hqsNaoLidas]).toFixed(2);
  document.getElementById('progressHqs').style.width = percentHqsLidas + '%';

  document.getElementById('totalLivros').textContent = livrosTotal;
  document.getElementById('livrosLidosResumo').textContent = livrosRead;
  document.getElementById('livrosNaoLidosResumo').textContent = livrosNaoLidos;
  document.getElementById('livrosEmAndamentoResumo').textContent = livrosEmAndamento;
  document.getElementById('percentLivrosLidosResumo').textContent = percentLivrosLidos + '%';
  document.getElementById('percentLivrosNaoLidosResumo').textContent = percentLivrosNaoLidos + '%';
  document.getElementById('percentLivrosEmAndamentoResumo').textContent = percentLivrosEmAndamento + '%';
  document.getElementById('mediaLivros').textContent = livrosTotal > 0 ? (livrosRead / livrosTotal).toFixed(2) : 0;
  document.getElementById('dpLivros').textContent = calculateStandardDeviation([livrosRead, livrosEmAndamento, livrosNaoLidos]).toFixed(2);
  document.getElementById('progressLivros').style.width = percentLivrosLidos + '%';
}

// Calculate standard deviation
function calculateStandardDeviation(values) {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquareDiff);
}

// Tab switching
function mostrarAba(abaId) {
  // Hide all tabs
  document.querySelectorAll('.aba').forEach(tab => {
    tab.classList.remove('ativa');
  });
  
  // Remove active class from nav links
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.remove('ativa');
  });
  
  // Show selected tab
  document.getElementById(abaId).classList.add('ativa');
  
  // Add active class to clicked link
  event.target.classList.add('ativa');
  
  // Render charts if graficos tab is selected
  if (abaId === 'graficos') {
    setTimeout(renderizarGraficos, 100);
  }
}

// Render all charts
function renderizarGraficos() {
  if (typeof Chart === 'undefined') {
    console.error('Chart.js não está carregado');
    return;
  }

  // Destroy existing charts
  Object.values(charts).forEach(chart => chart.destroy());
  charts = {};

  const { hqs, livros } = readingData;
  
  // Only render if there's data
  if (hqs.total === 0 && livros.total === 0) {
    console.log('No data to render charts');
    return;
  }

  // Chart 1: HQs Percentage Pie Chart with Lidas, Em Andamento, Não Lidas
  if (hqs.total > 0) {
    const ctx1 = document.getElementById('graficoPercentHqs');
    if (ctx1) {
      charts.hqsPie = new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: ['Lidas', 'Em Andamento', 'Não Lidas'],
          datasets: [{
            data: [hqs.read, hqs.emAndamento || 0, hqs.naoLidas || 0],
            backgroundColor: ['#10b981', '#3b82f6', '#e5e7eb'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }
  }

  // Chart 2: Books Percentage Pie Chart with Lidos, Em Andamento, Não Lidos
  if (livros.total > 0) {
    const ctx2 = document.getElementById('graficoPercentLivros');
    if (ctx2) {
      charts.livrosPie = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['Lidos', 'Em Andamento', 'Não Lidos'],
          datasets: [{
            data: [livros.read, livros.emAndamento || 0, livros.naoLidos || 0],
            backgroundColor: ['#f59e0b', '#3b82f6', '#e5e7eb'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }
  }

  // Chart 3: Reading Proportion Bar Chart with Lidos, Em Andamento, Não Lidos
  const ctx3 = document.getElementById('graficoProporcao');
  if (ctx3) {
    charts.proporcao = new Chart(ctx3, {
      type: 'bar',
      data: {
        labels: ['HQs Lidos', 'HQs Em Andamento', 'HQs Não Lidos', 'Livros Lidos', 'Livros Em Andamento', 'Livros Não Lidos'],
        datasets: [{
          label: 'Quantidade',
          data: [
            hqs.read,
            hqs.emAndamento || 0,
            hqs.naoLidas || 0,
            livros.read,
            livros.emAndamento || 0,
            livros.naoLidos || 0
          ],
          backgroundColor: ['#10b981', '#3b82f6', '#e5e7eb', '#f59e0b', '#3b82f6', '#e5e7eb']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  // Chart 4: Average Reading Line Chart
  const ctx4 = document.getElementById('graficoMedia');
  if (ctx4) {
    charts.media = new Chart(ctx4, {
      type: 'line',
      data: {
        labels: ['HQs', 'Livros'],
        datasets: [{
          label: 'Taxa de Leitura',
          data: [
            hqs.total > 0 ? (hqs.read / hqs.total) * 100 : 0,
            livros.total > 0 ? (livros.read / livros.total) * 100 : 0
          ],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 100 }
        }
      }
    });
  }

  // Chart 5: Standard Deviation Chart
  const ctx5 = document.getElementById('graficoDP');
  if (ctx5) {
    const dpHqs = calculateStandardDeviation([hqs.read, hqs.total - hqs.read]);
    const dpLivros = calculateStandardDeviation([livros.read, livros.total - livros.read]);
    
    charts.dp = new Chart(ctx5, {
      type: 'radar',
      data: {
        labels: ['HQs', 'Livros'],
        datasets: [{
          label: 'Desvio Padrão',
          data: [dpHqs, dpLivros],
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          borderColor: '#f59e0b',
          pointBackgroundColor: '#f59e0b'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: { beginAtZero: true }
        }
      }
    });
  }

  // Chart 6: Overall Summary Chart
  const ctx6 = document.getElementById('graficoGeral');
  if (ctx6) {
    charts.geral = new Chart(ctx6, {
      type: 'polarArea',
      data: {
        labels: ['HQs Lidas', 'HQs Pendentes', 'Livros Lidos', 'Livros Pendentes'],
        datasets: [{
          data: [
            hqs.read,
            hqs.total - hqs.read,
            livros.read,
            livros.total - livros.read
          ],
          backgroundColor: ['#10b981', '#e5e7eb', '#f59e0b', '#d1d5db']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }
}

// Show message function
function showMessage(text, type = 'sucesso') {
  const messageDiv = document.getElementById('mensagem');
  messageDiv.textContent = text;
  messageDiv.className = `mensagem ${type}`;
  messageDiv.style.display = 'block';
  
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 3000);
}

// Initialize charts on page load
window.addEventListener('load', function() {
  setTimeout(renderizarGraficos, 500);
});
