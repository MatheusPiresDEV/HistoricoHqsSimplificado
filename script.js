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

  // Email buttons
  const enviarEmailBtn = document.getElementById('enviarEmailBtn');
  const enviarEmailBtn2 = document.getElementById('enviarEmailBtn2');
  
  if (enviarEmailBtn) {
    enviarEmailBtn.addEventListener('click', handleSendEmail);
  }
  
  if (enviarEmailBtn2) {
    enviarEmailBtn2.addEventListener('click', handleSendEmail);
  }

  // Download buttons
  const downloadReportBtn = document.getElementById('downloadReportBtn');
  const downloadReportBtn2 = document.getElementById('downloadReportBtn2');
  
  if (downloadReportBtn) {
    downloadReportBtn.addEventListener('click', handleDownloadReport);
  }
  
  if (downloadReportBtn2) {
    downloadReportBtn2.addEventListener('click', handleDownloadReport);
  }
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

// Handle email sending
function handleSendEmail() {
    try {
        // Check if there's data to send
        const savedData = localStorage.getItem('readingData');
        if (!savedData) {
            showMessage('Nenhum dado encontrado. Por favor, salve seus dados primeiro.', 'erro');
            return;
        }

        const data = JSON.parse(savedData);
        if ((!data.hqs || data.hqs.total === 0) && (!data.livros || data.livros.total === 0)) {
            showMessage('Nenhum dado de leitura encontrado. Adicione alguns dados primeiro.', 'erro');
            return;
        }

        // Use enhanced email service with password verification
        if (typeof enhancedEmailService !== 'undefined') {
            enhancedEmailService.sendEmailWithPassword();
        } else {
            showMessage('Sistema de e-mail não disponível.', 'erro');
        }
    } catch (error) {
        console.error('Erro ao preparar envio de e-mail:', error);
        showMessage('Erro ao preparar envio de e-mail.', 'erro');
    }
}

// Handle report download
function handleDownloadReport() {
  try {
    // Check if there's data to download
    const savedData = localStorage.getItem('readingData');
    if (!savedData) {
      showMessage('Nenhum dado encontrado. Por favor, salve seus dados primeiro.', 'erro');
      return;
    }

    const data = JSON.parse(savedData);
    if ((!data.hqs || data.hqs.total === 0) && (!data.livros || data.livros.total === 0)) {
      showMessage('Nenhum dado de leitura encontrado. Adicione alguns dados primeiro.', 'erro');
      return;
    }

    // Create HTML report content
    const reportContent = createHTMLReportContent(data);
    
    // Create and download file with improved error handling
    const blob = new Blob([reportContent], { type: 'text/html;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-leitura-${new Date().toISOString().split('T')[0]}.html`;
    a.style.display = 'none';
    
    // Add to document and trigger click
    document.body.appendChild(a);
    
    // Use setTimeout to ensure the UI remains responsive
    setTimeout(() => {
      try {
        a.click();
        
        // Clean up after a short delay to prevent UI issues
        setTimeout(() => {
          if (document.body.contains(a)) {
            document.body.removeChild(a);
          }
          window.URL.revokeObjectURL(url);
        }, 100);
        
        showMessage('Dashboard baixado com sucesso! 📥', 'sucesso');
      } catch (error) {
        console.error('Erro ao iniciar download:', error);
        showMessage('Erro ao baixar dashboard. Por favor, tente novamente.', 'erro');
        
        // Clean up on error
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        window.URL.revokeObjectURL(url);
      }
    }, 100);
    
  } catch (error) {
    console.error('Erro ao baixar dashboard:', error);
    showMessage('Erro ao baixar dashboard. Por favor, tente novamente.', 'erro');
  }
}

// Create HTML report content for download - Complete Dashboard
function createHTMLReportContent(data) {
  const hqs = data.hqs || { total: 0, read: 0, emAndamento: 0, naoLidas: 0 };
  const livros = data.livros || { total: 0, read: 0, emAndamento: 0, naoLidos: 0 };
  
  // Calculate age and birthday countdown
  const birthdayInfo = calculateAgeAndBirthdayCountdown('2006-11-12');
  
  // Get library data
  const bibliotecaData = JSON.parse(localStorage.getItem('minhaBiblioteca') || '[]');
  const hqsBiblioteca = bibliotecaData.filter(item => item.tipo === 'hq');
  const livrosBiblioteca = bibliotecaData.filter(item => item.tipo === 'livro');
  
  // Get cart data
  const carrinhoData = JSON.parse(localStorage.getItem('carrinhoCompras') || '[]');
  const itensComprados = carrinhoData.filter(item => item.status === 'comprado');
  const itensAComprar = carrinhoData.filter(item => item.status === 'a-comprar');
  
  // Calculate cart statistics
  const totalItensCarrinho = carrinhoData.length;
  const porcentagemComprados = totalItensCarrinho > 0 ? Math.round((itensComprados.length / totalItensCarrinho) * 100) : 0;
  const porcentagemAComprar = totalItensCarrinho > 0 ? Math.round((itensAComprar.length / totalItensCarrinho) * 100) : 0;
  
  // Calculate average time for purchased items
  let tempoMedioTotalMs = 0;
  let itensComTempo = 0;
  
  itensComprados.forEach(item => {
    if (item.dataAdicionado && item.dataComprado) {
      const dataAdicionado = new Date(item.dataAdicionado);
      const dataComprado = new Date(item.dataComprado);
      tempoMedioTotalMs += (dataComprado - dataAdicionado);
      itensComTempo++;
    }
  });
  
  const tempoMedioMs = itensComTempo > 0 ? tempoMedioTotalMs / itensComTempo : 0;
  const dias = Math.floor(tempoMedioMs / (1000 * 60 * 60 * 24));
  const horas = Math.floor((tempoMedioMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((tempoMedioMs % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((tempoMedioMs % (1000 * 60)) / 1000);
  
  // Format current date and time
  const dataHoraAtual = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate percentages
  const percentHqsLidas = hqs.total > 0 ? Math.round((hqs.read / hqs.total) * 100) : 0;
  const percentHqsEmAndamento = hqs.total > 0 ? Math.round((hqs.emAndamento / hqs.total) * 100) : 0;
  const percentHqsNaoLidas = hqs.total > 0 ? Math.round((hqs.naoLidas / hqs.total) * 100) : 0;

  const percentLivrosLidos = livros.total > 0 ? Math.round((livros.read / livros.total) * 100) : 0;
  const percentLivrosEmAndamento = livros.total > 0 ? Math.round((livros.emAndamento / livros.total) * 100) : 0;
  const percentLivrosNaoLidos = livros.total > 0 ? Math.round((livros.naoLidos / livros.total) * 100) : 0;

  // Generate complete HTML dashboard
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard de Leitura - ${new Date().toLocaleDateString('pt-BR')}</title>
    <style>
        /* Print Styles */
        @media print {
            @page {
                margin: 1cm;
                size: A4 portrait;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 21cm;
                margin: 0 auto;
                padding: 20px;
                background: white;
                font-size: 12px;
            }
            .no-print {
                display: none !important;
            }
            .page-break {
                page-break-before: always;
            }
        }
        
        /* Screen Styles */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 21cm;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        /* Header */
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header .subtitle {
            color: #6b7280;
            font-size: 16px;
            margin-top: 5px;
        }
        .header-info {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 15px;
            flex-wrap: wrap;
        }
        .info-badge {
            background: #f1f5f9;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            color: #475569;
        }
        
        /* Sections */
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .section-title {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 18px;
            font-weight: 600;
        }
        
        /* Statistics Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-card.hqs {
            border-left: 4px solid #10b981;
        }
        .stat-card.livros {
            border-left: 4px solid #f59e0b;
        }
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
        }
        .stat-label {
            color: #6b7280;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
        }
        .stat-percentage {
            font-size: 14px;
            color: #059669;
            margin-top: 5px;
            font-weight: 600;
        }
        .progress-container {
            margin: 15px 0;
        }
        .progress-bar {
            background: #e5e7eb;
            height: 8px;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 5px;
        }
        .progress-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        .progress-fill.hqs {
            background: linear-gradient(90deg, #10b981, #34d399);
        }
        .progress-fill.livros {
            background: linear-gradient(90deg, #f59e0b, #fbbf24);
        }
        .progress-text {
            font-size: 12px;
            color: #6b7280;
            text-align: right;
        }
        
        /* Info Grid */
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .info-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .info-card h3 {
            color: #374151;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 16px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 8px 0;
        }
        .info-item:not(:last-child) {
            border-bottom: 1px solid #f3f4f6;
        }
        .info-label {
            color: #6b7280;
            font-weight: 500;
        }
        .info-value {
            color: #1f2937;
            font-weight: 600;
        }
        
        /* Badges */
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .badge-success {
            background: #dcfce7;
            color: #166534;
        }
        .badge-warning {
            background: #fef3c7;
            color: #92400e;
        }
        .badge-info {
            background: #dbeafe;
            color: #1e40af;
        }
        .badge-secondary {
            background: #f3f4f6;
            color: #374151;
        }
        
        /* Lists */
        .item-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .item-list li {
            padding: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 10px;
            background: #fafafa;
        }
        .item-list li:last-child {
            margin-bottom: 0;
        }
        
        /* Tables */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .data-table th,
        .data-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        .data-table th {
            background: #f8fafc;
            font-weight: 600;
            color: #374151;
        }
        .data-table tr:hover {
            background: #f1f5f9;
        }
        
        /* Footer */
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        
        /* Print-specific adjustments */
        @media print {
            .stat-card {
                break-inside: avoid;
            }
            .info-card {
                break-inside: avoid;
            }
            .section {
                break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 DASHBOARD DE LEITURA</h1>
        <div class="subtitle">Relatório Completo - ${dataHoraAtual}</div>
        <div class="header-info">
            <div class="info-badge">👤 Idade: ${birthdayInfo.age} anos</div>
            <div class="info-badge">🎂 Próximo aniversário: ${birthdayInfo.countdown.months} meses, ${birthdayInfo.countdown.days} dias</div>
            <div class="info-badge">📅 Gerado em: ${dataHoraAtual}</div>
        </div>
    </div>

    <!-- Section 1: Reading Statistics -->
    <div class="section">
        <div class="section-title">📚 ESTATÍSTICAS DE LEITURA</div>
        
        <div class="stats-grid">
            <!-- HQs Statistics -->
            <div class="stat-card hqs">
                <div class="stat-number">${hqs.total}</div>
                <div class="stat-label">TOTAL DE HQs</div>
                
                <div class="info-item">
                    <span class="info-label">Lidas:</span>
                    <span class="info-value">${hqs.read}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Em andamento:</span>
                    <span class="info-value">${hqs.emAndamento || 0}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Não lidas:</span>
                    <span class="info-value">${hqs.naoLidas || 0}</span>
                </div>
                
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill hqs" style="width: ${percentHqsLidas}%"></div>
                    </div>
                    <div class="progress-text">${percentHqsLidas}% concluídas</div>
                </div>
                
                <div class="info-item">
                    <span class="info-label">Média:</span>
                    <span class="info-value">${hqs.total > 0 ? (hqs.read / hqs.total).toFixed(2) : 0}</span>
                </div>
            </div>

            <!-- Books Statistics -->
            <div class="stat-card livros">
                <div class="stat-number">${livros.total}</div>
                <div class="stat-label">TOTAL DE LIVROS</div>
                
                <div class="info-item">
                    <span class="info-label">Lidos:</span>
                    <span class="info-value">${livros.read}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Em andamento:</span>
                    <span class="info-value">${livros.emAndamento || 0}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Não lidos:</span>
                    <span class="info-value">${livros.naoLidos || 0}</span>
                </div>
                
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill livros" style="width: ${percentLivrosLidos}%"></div>
                    </div>
                    <div class="progress-text">${percentLivrosLidos}% concluídos</div>
                </div>
                
                <div class="info-item">
                    <span class="info-label">Média:</span>
                    <span class="info-value">${livros.total > 0 ? (livros.read / livros.total).toFixed(2) : 0}</span>
                </div>
            </div>
        </div>

        <!-- Summary Statistics -->
        <div class="info-grid">
            <div class="info-card">
                <h3>📈 RESUMO GERAL</h3>
                <div class="info-item">
                    <span class="info-label">Total de itens:</span>
                    <span class="info-value">${hqs.total + livros.total}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Itens concluídos:</span>
                    <span class="info-value">${hqs.read + livros.read}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Porcentagem total:</span>
                    <span class="info-value">${hqs.total + livros.total > 0 ? Math.round(((hqs.read + livros.read) / (hqs.total + livros.total)) * 100) : 0}%</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Itens em andamento:</span>
                    <span class="info-value">${(hqs.emAndamento || 0) + (livros.emAndamento || 0)}</span>
                </div>
            </div>

            <div class="info-card">
                <h3>⚡ DESEMPENHO</h3>
                <div class="info-item">
                    <span class="info-label">Desvio padrão HQs:</span>
                    <span class="info-value">${calculateStandardDeviation([hqs.read, hqs.emAndamento || 0, hqs.naoLidas || 0]).toFixed(2)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Desvio padrão Livros:</span>
                    <span class="info-value">${calculateStandardDeviation([livros.read, livros.emAndamento || 0, livros.naoLidos || 0]).toFixed(2)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Taxa de conclusão HQs:</span>
                    <span class="info-value">${percentHqsLidas}%</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Taxa de conclusão Livros:</span>
                    <span class="info-value">${percentLivrosLidos}%</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Section 2: Library Items -->
    ${bibliotecaData.length > 0 ? `
    <div class="section page-break">
        <div class="section-title">📖 BIBLIOTECA - ${bibliotecaData.length} ITENS</div>
        
        <div class="info-grid">
            <div class="info-card">
                <h3>📚 HQs NA BIBLIOTECA (${hqsBiblioteca.length})</h3>
                ${hqsBiblioteca.length > 0 ? `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Status</th>
                            <th>Adicionado em</th>
                            ${hqsBiblioteca.some(item => item.dataFim) ? '<th>Finalizado em</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${hqsBiblioteca.map(item => `
                        <tr>
                            <td>${item.nome}</td>
                            <td><span class="badge ${item.status === 'lido' ? 'badge-success' : item.status === 'emAndamento' ? 'badge-warning' : 'badge-secondary'}">${formatStatus(item.status)}</span></td>
                            <td>${new Date(item.dataAdicionado).toLocaleDateString('pt-BR')}</td>
                            ${item.dataFim ? `<td>${new Date(item.dataFim).toLocaleDateString('pt-BR')}</td>` : '<td>-</td>'}
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : '<p>Nenhuma HQ na biblioteca.</p>'}
            </div>

            <div class="info-card">
                <h3>📕 LIVROS NA BIBLIOTECA (${livrosBiblioteca.length})</h3>
                ${livrosBiblioteca.length > 0 ? `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Status</th>
                            <th>Adicionado em</th>
                            ${livrosBiblioteca.some(item => item.dataFim) ? '<th>Finalizado em</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${livrosBiblioteca.map(item => `
                        <tr>
                            <td>${item.nome}</td>
                            <td><span class="badge ${item.status === 'lido' ? 'badge-success' : item.status === 'emAndamento' ? 'badge-warning' : 'badge-secondary'}">${formatStatus(item.status)}</span></td>
                            <td>${new Date(item.dataAdicionado).toLocaleDateString('pt-BR')}</td>
                            ${item.dataFim ? `<td>${new Date(item.dataFim).toLocaleDateString('pt-BR')}</td>` : '<td>-</td>'}
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : '<p>Nenhum livro na biblioteca.</p>'}
            </div>
        </div>
    </div>
    ` : ''}

    <!-- Section 3: Shopping Cart -->
    ${carrinhoData.length > 0 ? `
    <div class="section page-break">
        <div class="section-title">🛒 CARRINHO DE COMPRAS</div>
        
        <div class="info-grid">
            <div class="info-card">
                <h3>📊 ESTATÍSTICAS DO CARRINHO</h3>
                <div class="info-item">
                    <span class="info-label">Total de itens:</span>
                    <span class="info-value">${totalItensCarrinho}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Itens comprados:</span>
                    <span class="info-value">${itensComprados.length} (${porcentagemComprados}%)</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Itens a comprar:</span>
                    <span class="info-value">${itensAComprar.length} (${porcentagemAComprar}%)</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Tempo médio:</span>
                    <span class="info-value">${dias}d ${horas}h ${minutos}m</span>
                </div>
            </div>

            <div class="info-card">
                <h3>📋 ITENS DO CARRINHO</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Status</th>
                            <th>Adicionado em</th>
                            <th>Comprado em</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${carrinhoData.map(item => `
                        <tr>
                            <td>${item.nome}</td>
                            <td><span class="badge ${item.status === 'comprado' ? 'badge-success' : 'badge-warning'}">${item.status === 'comprado' ? 'Comprado' : 'A Comprar'}</span></td>
                            <td>${new Date(item.dataAdicionado).toLocaleDateString('pt-BR')}</td>
                            <td>${item.dataComprado ? new Date(item.dataComprado).toLocaleDateString('pt-BR') : '-'}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
        <p>📄 Dashboard gerado automaticamente em ${dataHoraAtual}</p>
        <p>✨ Histórico de HQs Simplificado - Todos os direitos reservados</p>
    </div>

    <!-- Print button for screen view -->
    <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="background: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
            🖨️ Imprimir Dashboard
        </button>
    </div>
</body>
</html>`;

// Calculate age and birthday countdown - CORRIGIDA
function calculateAgeAndBirthdayCountdown(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  
  // Calculate age correctly
  let age = today.getFullYear() - birth.getFullYear();
  const currentMonth = today.getMonth();
  const birthMonth = birth.getMonth();
  const currentDay = today.getDate();
  const birthDay = birth.getDate();
  
  // Adjust age if birthday hasn't occurred yet this year
  if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
    age--;
  }
  
  // Calculate next birthday
  let nextBirthdayYear = today.getFullYear();
  const nextBirthday = new Date(nextBirthdayYear, birthMonth, birthDay);
  
  // If birthday has already passed this year, set to next year
  if (today > nextBirthday) {
    nextBirthdayYear++;
    nextBirthday.setFullYear(nextBirthdayYear);
  }
  
  // Calculate time until next birthday in milliseconds
  const timeDiff = nextBirthday - today;
  
  // Calculate progress percentage (how much of the year has passed since last birthday)
  const lastBirthday = new Date(nextBirthdayYear - 1, birthMonth, birthDay);
  const nextBirthdayFull = new Date(nextBirthdayYear, birthMonth, birthDay);
  const totalYearMs = nextBirthdayFull - lastBirthday;
  const timeSinceLastBirthday = today - lastBirthday;
  const progress = (timeSinceLastBirthday / totalYearMs) * 100;
  
  // Calculate time components with better precision
  const totalSeconds = Math.floor(timeDiff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  // Calculate months approximation (not exact but good for display)
  const months = Math.floor(days / 30.44);
  const remainingDays = Math.floor(days % 30.44);
  
  return {
    age: age,
    countdown: {
      months: months,
      days: remainingDays,
      hours: hours,
      minutes: minutes,
      seconds: seconds
    },
    progress: Math.max(0, Math.min(100, progress.toFixed(2)))
  };

// Create enhanced copy content with age and birthday info
function createEnhancedCopyContent(data) {
  const hqs = data.hqs || { total: 0, read: 0, emAndamento: 0, naoLidas: 0 };
  const livros = data.livros || { total: 0, read: 0, emAndamento: 0, naoLidos: 0 };
  
  const totalItems = hqs.total + livros.total;
  const totalLidos = hqs.read + livros.read;
  const porcentagemLidos = totalItems > 0 ? ((totalLidos / totalItems) * 100).toFixed(2) : 0;
  
  // Calculate age and birthday countdown
  const birthdayInfo = calculateAgeAndBirthdayCountdown('2006-11-12');
  
  return `📊 MEU HISTÓRICO DE LEITURA

👤 INFORMAÇÕES PESSOAIS
• Idade Atual: ${birthdayInfo.age} anos
• Próximo Aniversário: 12/11/${new Date().getFullYear() + (new Date().getMonth() > 10 || (new Date().getMonth() === 10 && new Date().getDate() > 12) ? 1 : 0)}
• Tempo até o Aniversário: ${birthdayInfo.countdown.months} meses, ${birthdayInfo.countdown.days} dias, ${birthdayInfo.countdown.hours}h ${birthdayInfo.countdown.minutes}min ${birthdayInfo.countdown.seconds}s

📚 HQs:
• Total: ${hqs.total}
• Lidas: ${hqs.read}
• Em andamento: ${hqs.emAndamento || 0}
• % Concluídas: ${hqs.total > 0 ? ((hqs.read / hqs.total) * 100).toFixed(1) : 0}%

📖 Livros:
• Total: ${livros.total}
• Lidos: ${livros.read}
• Em andamento: ${livros.emAndamento || 0}
• % Concluídos: ${livros.total > 0 ? ((livros.read / livros.total) * 100).toFixed(1) : 0}%

📅 Data: ${new Date().toLocaleDateString('pt-BR')}`;
}

// Initialize charts on page load
window.addEventListener('load', function() {
  setTimeout(renderizarGraficos, 500);
});

// Add copy functionality for export buttons
document.addEventListener('DOMContentLoaded', function() {
  // Add event listeners for copy buttons
  const exportBtn = document.getElementById('exportBtn');
  const exportBtn2 = document.getElementById('exportBtn2');
  
  if (exportBtn) {
    exportBtn.addEventListener('click', handleCopyData);
  }
  
  if (exportBtn2) {
    exportBtn2.addEventListener('click', handleCopyData);
  }
});

// Handle copy data functionality
function handleCopyData() {
  try {
    // Check if there's data to copy
    const savedData = localStorage.getItem('readingData');
    if (!savedData) {
      showMessage('Nenhum dado encontrado. Por favor, salve seus dados primeiro.', 'erro');
      return;
    }

    const data = JSON.parse(savedData);
    
    // Create complete copy content with all information
    const copyContent = generateCompleteCopyContent(data);
    
    // Copy to clipboard
    navigator.clipboard.writeText(copyContent).then(() => {
      showMessage('Dados copiados com sucesso! 📋', 'sucesso');
    }).catch(err => {
      console.error('Erro ao copiar:', err);
      showMessage('Erro ao copiar dados. Por favor, tente novamente.', 'erro');
    });
    
  } catch (error) {
    console.error('Erro ao copiar dados:', error);
    showMessage('Erro ao copiar dados.', 'erro');
  }
}

// Generate complete copy content with all requested information
function generateCompleteCopyContent(data) {
  const hqs = data.hqs || { total: 0, read: 0, emAndamento: 0, naoLidas: 0 };
  const livros = data.livros || { total: 0, read: 0, emAndamento: 0, naoLidos: 0 };
  
  // Calculate age and birthday countdown
  const birthdayInfo = calculateAgeAndBirthdayCountdown('2006-11-12');
  
  // Get library data
  const bibliotecaData = JSON.parse(localStorage.getItem('minhaBiblioteca') || '[]');
  const hqsBiblioteca = bibliotecaData.filter(item => item.tipo === 'hq');
  const livrosBiblioteca = bibliotecaData.filter(item => item.tipo === 'livro');
  
  // Get cart data
  const carrinhoData = JSON.parse(localStorage.getItem('carrinhoCompras') || '[]');
  const itensComprados = carrinhoData.filter(item => item.status === 'comprado');
  const itensAComprar = carrinhoData.filter(item => item.status === 'a-comprar');
  
  // Calculate cart statistics
  const totalItensCarrinho = carrinhoData.length;
  const porcentagemComprados = totalItensCarrinho > 0 ? Math.round((itensComprados.length / totalItensCarrinho) * 100) : 0;
  const porcentagemAComprar = totalItensCarrinho > 0 ? Math.round((itensAComprar.length / totalItensCarrinho) * 100) : 0;
  
  // Calculate average time for purchased items
  let tempoMedioTotalMs = 0;
  let itensComTempo = 0;
  
  itensComprados.forEach(item => {
    if (item.dataAdicionado && item.dataComprado) {
      const dataAdicionado = new Date(item.dataAdicionado);
      const dataComprado = new Date(item.dataComprado);
      tempoMedioTotalMs += (dataComprado - dataAdicionado);
      itensComTempo++;
    }
  });
  
  const tempoMedioMs = itensComTempo > 0 ? tempoMedioTotalMs / itensComTempo : 0;
  const dias = Math.floor(tempoMedioMs / (1000 * 60 * 60 * 24));
  const horas = Math.floor((tempoMedioMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((tempoMedioMs % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((tempoMedioMs % (1000 * 60)) / 1000);
  
  // Format current date and time
  const dataHoraAtual = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  // Generate content
  let content = `📊 MEU HISTÓRICO COMPLETO DE LEITURA\n\n`;
  
  // 1. Informações gerais
  content += `👤 INFORMAÇÕES GERAIS\n`;
  content += `Data e hora atual: ${dataHoraAtual}\n`;
  content += `Idade do usuário: ${birthdayInfo.age} anos\n`;
  content += `Tempo restante até o próximo aniversário: ${birthdayInfo.countdown.months} meses, ${birthdayInfo.countdown.days} dias, ${birthdayInfo.countdown.hours}h ${birthdayInfo.countdown.minutes}min ${birthdayInfo.countdown.seconds}s\n\n`;
  
  // 2. Histórico de leitura
  content += `📚 HISTÓRICO DE LEITURA\n\n`;
  
  // HQs
  content += `HQs\n`;
  content += `Total: ${hqs.total}\n`;
  content += `Lidas: ${hqs.read}\n`;
  content += `Não Lidas: ${hqs.naoLidas}\n`;
  content += `Em Andamento: ${hqs.emAndamento}\n`;
  content += `Porcentagem Lidas: ${hqs.total > 0 ? Math.round((hqs.read/hqs.total)*100) : 0}%\n`;
  content += `Porcentagem Não Lidas: ${hqs.total > 0 ? Math.round((hqs.naoLidas/hqs.total)*100) : 0}%\n`;
  content += `Porcentagem Em Andamento: ${hqs.total > 0 ? Math.round((hqs.emAndamento/hqs.total)*100) : 0}%\n`;
  content += `Média: ${hqs.total > 0 ? (hqs.read / hqs.total).toFixed(2) : 0}\n`;
  content += `Desvio Padrão: ${calculateStandardDeviation([hqs.read, hqs.emAndamento, hqs.naoLidas]).toFixed(2)}\n\n`;
  
  // Livros
  content += `Livros\n`;
  content += `Total: ${livros.total}\n`;
  content += `Lidos: ${livros.read}\n`;
  content += `Não Lidos: ${livros.naoLidos}\n`;
  content += `Em Andamento: ${livros.emAndamento}\n`;
  content += `Porcentagem Lidos: ${livros.total > 0 ? Math.round((livros.read/livros.total)*100) : 0}%\n`;
  content += `Porcentagem Não Lidas: ${livros.total > 0 ? Math.round((livros.naoLidos/livros.total)*100) : 0}%\n`;
  content += `Porcentagem Em Andamento: ${livros.total > 0 ? Math.round((livros.emAndamento/livros.total)*100) : 0}%\n`;
  content += `Média: ${livros.total > 0 ? (livros.read / livros.total).toFixed(2) : 0}\n`;
  content += `Desvio Padrão: ${calculateStandardDeviation([livros.read, livros.emAndamento, livros.naoLidos]).toFixed(2)}\n\n`;
  
  // 3. Títulos da biblioteca
  content += `📖 TÍTULOS DA BIBLIOTECA\n\n`;
  
  // HQs da biblioteca
  hqsBiblioteca.forEach(item => {
    content += `${item.tipo === 'hq' ? 'HQ' : 'Livro'}: ${item.nome} — ${formatStatus(item.status)}\n`;
    content += `Adicionado em: ${item.dataAdicionado}\n`;
    
    if (item.dataInicio) {
      content += `Iniciado em: ${item.dataInicio}\n`;
    }
    if (item.dataFim) {
      content += `Finalizado em: ${item.dataFim}\n`;
      
      // Format estimated time
      const tempoEstimadoMin = Math.floor(item.tempoEstimado / 60);
      const tempoEstimadoSeg = item.tempoEstimado % 60;
      const tempoEstimadoFormatado = tempoEstimadoMin > 0 ? 
        `${tempoEstimadoMin} min ${tempoEstimadoSeg} seg` : 
        `${tempoEstimadoSeg} seg`;
      
      content += `Tempo Estimado: ${tempoEstimadoFormatado}\n`;
      
      // Format real time
      if (item.tempoReal !== null) {
        const tempoRealMin = Math.floor(item.tempoReal / 60);
        const tempoRealSeg = item.tempoReal % 60;
        const tempoRealFormatado = tempoRealMin > 0 ? 
          `${tempoRealMin} min ${tempoRealSeg.toFixed(0)} seg` : 
          `${tempoRealSeg.toFixed(0)} seg`;
        
        content += `Tempo Real: ${tempoRealFormatado}\n`;
      }
      
      content += `Classificação: ${item.classificacaoVelocidade || 'N/A'}\n`;
    }
    if (item.paginas) {
      content += `Páginas: ${item.paginas}\n`;
    }
    content += `\n`;
  });
  
  // Livros da biblioteca
  livrosBiblioteca.forEach(item => {
    content += `${item.tipo === 'hq' ? 'HQ' : 'Livro'}: ${item.nome} — ${formatStatus(item.status)}\n`;
    content += `Adicionado em: ${item.dataAdicionado}\n`;
    
    if (item.dataInicio) {
      content += `Iniciado em: ${item.dataInicio}\n`;
    }
    if (item.dataFim) {
      content += `Finalizado em: ${item.dataFim}\n`;
      
      // Format estimated time
      const tempoEstimadoMin = Math.floor(item.tempoEstimado / 60);
      const tempoEstimadoSeg = item.tempoEstimado % 60;
      const tempoEstimadoFormatado = tempoEstimadoMin > 0 ? 
        `${tempoEstimadoMin} min ${tempoEstimadoSeg} seg` : 
        `${tempoEstimadoSeg} seg`;
      
      content += `Tempo Estimado: ${tempoEstimadoFormatado}\n`;
      
      // Format real time
      if (item.tempoReal !== null) {
        const tempoRealMin = Math.floor(item.tempoReal / 60);
        const tempoRealSeg = item.tempoReal % 60;
        const tempoRealFormatado = tempoRealMin > 0 ? 
          `${tempoRealMin} min ${tempoRealSeg.toFixed(0)} seg` : 
          `${tempoRealSeg.toFixed(0)} seg`;
        
        content += `Tempo Real: ${tempoRealFormatado}\n`;
      }
      
      content += `Classificação: ${item.classificacaoVelocidade || 'N/A'}\n`;
    }
    if (item.paginas) {
      content += `Páginas: ${item.paginas}\n`;
    }
    content += `\n`;
  });
  
  // 4. Estatísticas do carrinho
  content += `🛒 ESTATÍSTICAS DO CARRINHO\n\n`;
  content += `Estatísticas do Carrinho - ${totalItensCarrinho} itens no carrinho\n\n`;
  
  content += `Itens Comprados\n`;
  content += `${itensComprados.length} - ${porcentagemComprados}%\n`;
  content += `Total de itens marcados como comprados\n\n`;
  
  content += `Itens a Comprar\n`;
  content += `${itensAComprar.length} - ${porcentagemAComprar}%\n`;
  content += `Total de itens pendentes\n\n`;
  
  content += `Tempo Médio\n`;
  content += `${dias}d ${horas}h ${minutos}m ${segundos}s\n`;
  content += `Tempo médio para conclusão\n\n`;
  
  // 5. Itens do carrinho
  content += `📋 ITENS DO CARRINHO\n\n`;
  
  carrinhoData.forEach(item => {
    const dataAdicionado = new Date(item.dataAdicionado).toLocaleString('pt-BR');
    content += `${item.nome}\n`;
    content += `${item.status === 'comprado' ? 'Comprado' : 'A Comprar'}\n`;
    content += `Adicionado em: ${dataAdicionado}\n`;
    
    if (item.status === 'comprado' && item.dataComprado) {
      const dataComprado = new Date(item.dataComprado).toLocaleString('pt-BR');
      content += `Comprado em: ${dataComprado}\n`;
    }
    content += `\n`;
  });
  
  // 6. Categorias de adição
  content += `📦 CATEGORIAS DE ADIÇÃO\n\n`;
  
  // Coleções (itens adicionados em lote - identificados por terem datas próximas)
  const colecoes = identificarColecoes(carrinhoData);
  content += `Coleções: ${colecoes.length} coleções encontradas\n\n`;
  
  colecoes.forEach((colecao, index) => {
    content += `Coleção ${index + 1}:\n`;
    colecao.itens.forEach(item => {
      content += `- ${item.nome} (${new Date(item.dataAdicionado).toLocaleString('pt-BR')})\n`;
    });
    content += `\n`;
  });
  
  // Adicionar apenas um (itens individuais)
  const itensIndividuais = carrinhoData.filter(item => 
    !colecoes.some(colecao => colecao.itens.some(i => i.id === item.id))
  );
  
  content += `Adicionar apenas um: ${itensIndividuais.length} itens individuais\n\n`;
  itensIndividuais.forEach(item => {
    content += `- ${item.nome} (${new Date(item.dataAdicionado).toLocaleString('pt-BR')})\n`;
  });
  
  return content;
}

// Helper function to format status
function formatStatus(status) {
  const statusMap = {
    'lido': 'Lido',
    'emAndamento': 'Em Andamento',
    'naoLido': 'Não Lido'
  };
  return statusMap[status] || status;
}

// Helper function to identify collections (items added in batch)
function identificarColecoes(carrinhoData) {
  const colecoes = [];
  const processedIds = new Set();
  
  // Sort by addition date
  const sortedItems = [...carrinhoData].sort((a, b) => 
    new Date(a.dataAdicionado) - new Date(b.dataAdicionado)
  );
  
  for (let i = 0; i < sortedItems.length; i++) {
    if (processedIds.has(sortedItems[i].id)) continue;
    
    const currentItem = sortedItems[i];
    const currentTime = new Date(currentItem.dataAdicionado).getTime();
    const colecao = { itens: [currentItem] };
    processedIds.add(currentItem.id);
    
    // Look for items added within 5 minutes of this item
    for (let j = i + 1; j < sortedItems.length; j++) {
      if (processedIds.has(sortedItems[j].id)) continue;
      
      const nextItemTime = new Date(sortedItems[j].dataAdicionado).getTime();
      const timeDiff = Math.abs(nextItemTime - currentTime);
      
      // Consider items added within 5 minutes as part of the same collection
      if (timeDiff <= 5 * 60 * 1000) {
        colecao.itens.push(sortedItems[j]);
        processedIds.add(sortedItems[j].id);
      }
    }
    
    if (colecao.itens.length > 1) {
      colecoes.push(colecao);
    }
  }
  
  return colecoes;
}
}
}