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
  iniciarAnimacoesGSAP();
});

// Initialize dashboard components
function initializeDashboard() {
  console.log('🚀 Dashboard initialized');
  updateDisplay();
  iniciarAnimacoesGSAP();
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

  // Check for victory condition
  checkVictoryCondition();

  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 4000);
}

// Check if user has completed all reading (victory condition)
function checkVictoryCondition() {
  const hqsCompleted = readingData.hqs.total > 0 && readingData.hqs.naoLidas === 0 && readingData.hqs.emAndamento === 0;
  const livrosCompleted = readingData.livros.total > 0 && readingData.livros.naoLidos === 0 && readingData.livros.emAndamento === 0;

  if (hqsCompleted && livrosCompleted) {
    showVictoryScreen();
  }
}

// Show victory screen
function showVictoryScreen() {
  // Create victory overlay
  const victoryOverlay = document.createElement('div');
  victoryOverlay.id = 'victory-overlay';
  victoryOverlay.innerHTML = `
    <div class="victory-modal">
      <div class="victory-content">
        <div class="victory-header">
          <span class="victory-icon">🏆</span>
          <h2>PARABÉNS! VITÓRIA CONQUISTADA!</h2>
        </div>
        <div class="victory-body">
          <p>🎉 Você completou a leitura de todos os seus HQs e Livros!</p>
          <div class="victory-stats">
            <div class="stat-item">
              <span class="stat-number">${readingData.hqs.total}</span>
              <span class="stat-label">HQs Concluídas</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${readingData.livros.total}</span>
              <span class="stat-label">Livros Concluídos</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${readingData.hqs.total + readingData.livros.total}</span>
              <span class="stat-label">Total de Leituras</span>
            </div>
          </div>
          <p class="victory-message">
            Você é um verdadeiro mestre da leitura! 📚✨<br>
            Continue explorando novos mundos através das páginas!
          </p>
        </div>
        <div class="victory-actions">
          <button class="victory-btn primary" onclick="closeVictoryScreen()">🎊 Continuar Celebrando</button>
          <button class="victory-btn secondary" onclick="shareVictory()">📤 Compartilhar Vitória</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(victoryOverlay);

  // Add CSS styles for victory screen
  const style = document.createElement('style');
  style.textContent = `
    #victory-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.5s ease-out;
    }

    .victory-modal {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 2rem;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.6s ease-out;
      text-align: center;
      color: white;
    }

    .victory-header {
      margin-bottom: 1.5rem;
    }

    .victory-icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 1rem;
    }

    .victory-header h2 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }

    .victory-body {
      margin-bottom: 2rem;
    }

    .victory-body p {
      font-size: 1.1rem;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .victory-stats {
      display: flex;
      justify-content: space-around;
      margin: 1.5rem 0;
      flex-wrap: wrap;
    }

    .stat-item {
      background: rgba(255, 255, 255, 0.2);
      padding: 1rem;
      border-radius: 10px;
      margin: 0.5rem;
      min-width: 100px;
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .victory-message {
      font-style: italic;
      opacity: 0.9;
    }

    .victory-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .victory-btn {
      padding: 0.8rem 1.5rem;
      border: none;
      border-radius: 25px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .victory-btn.primary {
      background: #ff6b6b;
      color: white;
      box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
    }

    .victory-btn.primary:hover {
      background: #ff5252;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
    }

    .victory-btn.secondary {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .victory-btn.secondary:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: scale(0.8) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    @media (max-width: 600px) {
      .victory-modal {
        padding: 1.5rem;
        margin: 1rem;
      }

      .victory-stats {
        flex-direction: column;
        align-items: center;
      }

      .victory-actions {
        flex-direction: column;
      }

      .victory-btn {
        width: 100%;
        margin-bottom: 0.5rem;
      }
    }
  `;
  document.head.appendChild(style);

  // Play victory sound effect (optional)
  playVictorySound();
}

// Close victory screen
function closeVictoryScreen() {
  const overlay = document.getElementById('victory-overlay');
  if (overlay) {
    overlay.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 300);
  }
}

// Share victory
function shareVictory() {
  const victoryText = `🏆 VITÓRIA CONQUISTADA! 📚\n\nCompletei a leitura de todos os meus HQs e Livros!\n\n📊 Estatísticas:\n• ${readingData.hqs.total} HQs concluídas\n• ${readingData.livros.total} Livros concluídos\n• Total: ${readingData.hqs.total + readingData.livros.total} leituras\n\nQuem também quer alcançar essa vitória? 📖✨`;

  if (navigator.share) {
    navigator.share({
      title: 'Vitória na Leitura!',
      text: victoryText
    });
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(victoryText).then(() => {
      showMessage('Texto de vitória copiado para compartilhar! 📋', 'sucesso');
    });
  }
}

// Play victory sound effect
function playVictorySound() {
  try {
    // Create audio context for victory sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Victory melody notes (C4, E4, G4, C5)
    const notes = [261.63, 329.63, 392.00, 523.25];
    let noteIndex = 0;

    function playNote() {
      if (noteIndex < notes.length) {
        oscillator.frequency.setValueAtTime(notes[noteIndex], audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        noteIndex++;
        setTimeout(playNote, 200);
      } else {
        oscillator.stop();
      }
    }

    oscillator.start();
    playNote();
  } catch (error) {
    console.log('Audio not supported, skipping victory sound');
  }
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
  if (event && event.target) {
    event.target.classList.add('ativa');
  }

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
async function handleDownloadReport() {
  try {
    // Ativa a aba de gráficos para garantir que os canvases estejam visíveis e renderizados
    mostrarAba('graficos');
    await new Promise(resolve => setTimeout(resolve, 400)); // Aguarda renderização

    renderizarGraficos();
    await new Promise(resolve => setTimeout(resolve, 200)); // Aguarda renderização

    const savedData = localStorage.getItem('readingData');
    if (!savedData) {
      showMessage('Nenhum dado encontrado. Por favor, salve seus dados primeiro.', 'erro');
      return;
    }
    const data = JSON.parse(savedData);

    // IDs dos canvases dos gráficos
    const chartIds = [
      'graficoPercentHqs',
      'graficoPercentLivros',
      'graficoProporcao',
      'graficoMedia',
      'graficoDP',
      'graficoGeral'
    ];
    const chartImages = {};
    for (const id of chartIds) {
      const canvas = document.getElementById(id);
      if (canvas) {
        chartImages[id] = canvas.toDataURL('image/png');
      }
    }

    // Gera o relatório HTML com as imagens dos gráficos
    const reportContent = await createHTMLReportContentWithCharts(data, chartImages);

    const blob = new Blob([reportContent], { type: 'text/html;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-leitura-${new Date().toISOString().split('T')[0]}.html`;
    a.style.display = 'none';
    document.body.appendChild(a);

    setTimeout(() => {
      try {
        a.click();
        setTimeout(() => {
          if (document.body.contains(a)) document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
        showMessage('Dashboard baixado com sucesso! 📥', 'sucesso');
      } catch (error) {
        if (document.body.contains(a)) document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showMessage('Erro ao baixar dashboard. Por favor, tente novamente.', 'erro');
      }
    }, 100);

  } catch (error) {
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

  // Calculate standard deviations
  const dpHqs = calculateStandardDeviation([hqs.read, hqs.emAndamento || 0, hqs.naoLidas || 0]);
  const dpLivros = calculateStandardDeviation([livros.read, livros.emAndamento || 0, livros.naoLidos || 0]);

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
                            <td>${new Date(item.dataAdicionado).toLocaleString('pt-BR')}</td>
                            <td>${item.dataComprado ? new Date(item.dataComprado).toLocaleString('pt-BR') : '-'}</td>
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
}
async function createHTMLReportContentWithCharts(data, chartImages) {
  // Estatísticas do carrinho
  const carrinhoData = JSON.parse(localStorage.getItem('carrinhoCompras') || '[]');
  const itensComprados = carrinhoData.filter(item => item.status === 'comprado');
  const itensAComprar = carrinhoData.filter(item => item.status === 'a-comprar');
  const totalItensCarrinho = carrinhoData.length;
  const porcentagemComprados = totalItensCarrinho > 0 ? Math.round((itensComprados.length / totalItensCarrinho) * 100) : 0;
  const porcentagemAComprar = totalItensCarrinho > 0 ? Math.round((itensAComprar.length / totalItensCarrinho) * 100) : 0;
  let tempoMedioTotalMs = 0, itensComTempo = 0;
  itensComprados.forEach(item => {
    if (item.dataAdicionado && item.dataComprado) {
      tempoMedioTotalMs += (new Date(item.dataComprado) - new Date(item.dataAdicionado));
      itensComTempo++;
    }
  });
  const tempoMedioMs = itensComTempo > 0 ? tempoMedioTotalMs / itensComTempo : 0;
  const dias = Math.floor(tempoMedioMs / (1000 * 60 * 60 * 24));
  const horas = Math.floor((tempoMedioMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((tempoMedioMs % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((tempoMedioMs % (1000 * 60)) / 1000);

  const birthdayInfo = calculateAgeAndBirthdayCountdown('2006-11-12');
  const dataHoraAtual = new Date().toLocaleString('pt-BR');
  const progress = birthdayInfo.progress || 0;

  // Estatísticas
  const hqs = data.hqs || { total: 0, read: 0, emAndamento: 0, naoLidas: 0 };
  const livros = data.livros || { total: 0, read: 0, emAndamento: 0, naoLidos: 0 };
  const percentHqsLidas = hqs.total > 0 ? Math.round((hqs.read / hqs.total) * 100) : 0;
  const percentLivrosLidos = livros.total > 0 ? Math.round((livros.read / livros.total) * 100) : 0;

  // Biblioteca
  const bibliotecaData = JSON.parse(localStorage.getItem('minhaBiblioteca') || '[]');
  const hqsBiblioteca = bibliotecaData.filter(item => item.tipo === 'hq');
  const livrosBiblioteca = bibliotecaData.filter(item => item.tipo === 'livro');

  // Resumo HQs
  const totalHqsBib = hqsBiblioteca.length;
  const lidosHqsBib = hqsBiblioteca.filter(i => i.status === 'lido').length;
  const emAndamentoHqsBib = hqsBiblioteca.filter(i => i.status === 'emAndamento').length;
  const naoLidosHqsBib = totalHqsBib - lidosHqsBib - emAndamentoHqsBib;
  const percLidosHqsBib = totalHqsBib > 0 ? ((lidosHqsBib / totalHqsBib) * 100).toFixed(1) : '0.0';
  const percEmAndamentoHqsBib = totalHqsBib > 0 ? ((emAndamentoHqsBib / totalHqsBib) * 100).toFixed(1) : '0.0';
  const percNaoLidosHqsBib = totalHqsBib > 0 ? ((naoLidosHqsBib / totalHqsBib) * 100).toFixed(1) : '0.0';

  // Resumo Livros
  const totalLivrosBib = livrosBiblioteca.length;
  const lidosLivrosBib = livrosBiblioteca.filter(i => i.status === 'lido').length;
  const emAndamentoLivrosBib = livrosBiblioteca.filter(i => i.status === 'emAndamento').length;
  const naoLidosLivrosBib = totalLivrosBib - lidosLivrosBib - emAndamentoLivrosBib;
  const percLidosLivrosBib = totalLivrosBib > 0 ? ((lidosLivrosBib / totalLivrosBib) * 100).toFixed(1) : '0.0';
  const percEmAndamentoLivrosBib = totalLivrosBib > 0 ? ((emAndamentoLivrosBib / totalLivrosBib) * 100).toFixed(1) : '0.0';
  const percNaoLidosLivrosBib = totalLivrosBib > 0 ? ((naoLidosLivrosBib / totalLivrosBib) * 100).toFixed(1) : '0.0';

  // Generate HTML content
  return `
  <!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Dashboard de Leitura</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #fff;
      color: #222;
      margin: 0;
      padding: 12px;
      font-size: 11px;
      max-width: 21cm;
    }
    h1 { color: #2563eb; margin: 0 0 8px 0; }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 10px;
      margin-bottom: 10px;
    }
    .card {
      background: #f8fafc;
      border-radius: 10px;
      box-shadow: 0 1px 2px #0001;
      padding: 12px 10px;
      min-width: 140px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .card-title {
      font-size: 1.1em;
      color: #2563eb;
      font-weight: bold;
      margin-bottom: 4px;
      text-align: center;
    }
    .card-content {
      font-size: 1em;
      color: #222;
      text-align: center;
      margin-bottom: 2px;
    }
    .card-label {
      color: #6b7280;
      font-size: 0.93em;
      margin-bottom: 2px;
    }
    .charts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 7px; justify-content: center; margin-bottom: 10px;
    }
    .chart-block {
      background: #f8fafc; border-radius: 8px; box-shadow: 0 1px 2px #0001;
      padding: 4px 2px 2px 2px; text-align: center;
    }
    .chart-block h3 { font-size: 0.93rem; margin-bottom: 2px; color: #6b7280; }
    img { max-width: 100%; height: auto; border-radius: 5px; background: #fff; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 8px 0; }
    .progress-aniversario-container {
      margin: 8px 0 0 0; width: 100%; max-width: 350px;
    }
    .progress-aniversario-label { font-size: 0.95em; color: #6b7280; margin-bottom: 2px; }
    .progress-aniversario-bar {
      background: #e5e7eb; height: 10px; border-radius: 5px; overflow: hidden; width: 100%;
    }
    .progress-aniversario-fill {
      background: linear-gradient(90deg, #6366f1, #10b981);
      height: 100%; border-radius: 5px; transition: width 0.3s;
    }
    .progress-aniversario-text { font-size: 0.93em; color: #374151; text-align: right; margin-top: 1px; }
    .badge {
      background: #f1f5f9; color: #2563eb; border-radius: 16px;
      padding: 3px 10px; font-size: 0.93em; font-weight: 600;
      display: inline-block; margin-right: 5px; margin-bottom: 5px;
    }
    .footer {
      text-align: center;
      margin-top: 12px;
      padding-top: 7px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 11px;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 6px 8px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      color: #374151;
    }
    .print-btn-container {
      text-align: center;
      margin: 18px 0 0 0;
    }
    .print-btn {
      background: #2563eb;
      color: white;
      padding: 10px 22px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 15px;
      margin-top: 8px;
      transition: background 0.2s;
    }
    .print-btn:hover {
      background: #1741a6;
    }
    @media print {
      .print-btn-container, .print-btn { display: none !important; }
    }
  </style>
</head>
<body>
  <h1>📊 DASHBOARD DE LEITURA</h1>
  <div class="cards-grid">
    <div class="card">
      <div class="card-title">Relatório Completo</div>
      <div class="card-label">${dataHoraAtual}</div>
    </div>
    <div class="card">
      <div class="card-title">👤 Idade</div>
      <div class="card-label">${birthdayInfo.age} anos</div>
    </div>
    <div class="card">
      <div class="card-title">🎂 Próximo aniversário</div>
      <div class="card-label">${birthdayInfo.countdown.months} meses, ${birthdayInfo.countdown.days} dias</div>
    </div>
    <div class="card">
      <div class="card-title">📅 Gerado em</div>
      <div class="card-label">${dataHoraAtual}</div>
    </div>
  </div>
  <div class="progress-aniversario-container">
    <div class="progress-aniversario-label">Progresso até o aniversário</div>
    <div class="progress-aniversario-bar">
      <div class="progress-aniversario-fill" style="width:${progress}%"></div>
    </div>
    <div class="progress-aniversario-text">${progress}% do ano percorrido</div>
  </div>
  <hr>
  <div class="charts">
    <div class="chart-block"><h3>HQs Lidas</h3><img src="${chartImages['graficoPercentHqs'] || ''}"></div>
    <div class="chart-block"><h3>Livros Lidos</h3><img src="${chartImages['graficoPercentLivros'] || ''}"></div>
    <div class="chart-block"><h3>Proporção</h3><img src="${chartImages['graficoProporcao'] || ''}"></div>
    <div class="chart-block"><h3>Média</h3><img src="${chartImages['graficoMedia'] || ''}"></div>
    <div class="chart-block"><h3>Desvio Padrão</h3><img src="${chartImages['graficoDP'] || ''}"></div>
    <div class="chart-block"><h3>Resumo Geral</h3><img src="${chartImages['graficoGeral'] || ''}"></div>
  </div>
  <hr>
  <div class="cards-grid">
    <div class="card">
      <div class="card-title">📚 HQs</div>
      <div class="card-content">${hqs.total} TOTAL</div>
      <div class="card-label">Lidas: ${hqs.read}</div>
      <div class="card-label">Em andamento: ${hqs.emAndamento}</div>
      <div class="card-label">Não lidas: ${hqs.naoLidas}</div>
      <div class="card-label">${percentHqsLidas}% concluídas</div>
      <div class="card-label">Média: ${(hqs.total > 0 ? (hqs.read / hqs.total).toFixed(2) : 0)}</div>
    </div>
    <div class="card">
      <div class="card-title">📚 Livros</div>
      <div class="card-content">${livros.total} TOTAL</div>
      <div class="card-label">Lidos: ${livros.read}</div>
      <div class="card-label">Em andamento: ${livros.emAndamento}</div>
      <div class="card-label">Não lidos: ${livros.naoLidos}</div>
      <div class="card-label">${percentLivrosLidos}% concluídos</div>
      <div class="card-label">Média: ${(livros.total > 0 ? (livros.read / livros.total).toFixed(2) : 0)}</div>
    </div>
    <div class="card">
      <div class="card-title">📈 Resumo Geral</div>
      <div class="card-label">Total de itens: ${hqs.total + livros.total}</div>
      <div class="card-label">Itens concluídos: ${hqs.read + livros.read}</div>
      <div class="card-label">Porcentagem total: ${hqs.total + livros.total > 0 ? Math.round(((hqs.read + livros.read) / (hqs.total + livros.total)) * 100) : 0}%</div>
      <div class="card-label">Itens em andamento: ${(hqs.emAndamento || 0) + (livros.emAndamento || 0)}</div>
    </div>
    <div class="card">
      <div class="card-title">⚡ Desempenho</div>
      <div class="card-label">Desvio padrão HQs: ${calculateStandardDeviation([hqs.read, hqs.emAndamento || 0, hqs.naoLidas || 0]).toFixed(2)}</div>
      <div class="card-label">Desvio padrão Livros: ${calculateStandardDeviation([livros.read, livros.emAndamento || 0, livros.naoLidos || 0]).toFixed(2)}</div>
      <div class="card-label">Taxa de conclusão HQs: ${percentHqsLidas}%</div>
      <div class="card-label">Taxa de conclusão Livros: ${percentLivrosLidos}%</div>
    </div>
    <div class="card">
      <div class="card-title">📊 Estatísticas do Carrinho</div>
      <div class="card-label">${totalItensCarrinho} itens no carrinho</div>
      <div class="card-label">✅ Itens Comprados: ${itensComprados.length} - ${porcentagemComprados}%</div>
      <div class="card-label">🛒 Itens a Comprar: ${itensAComprar.length} - ${porcentagemAComprar}%</div>
      <div class="card-label">⏱️ Tempo Médio: ${dias}d ${horas}h ${minutos}m ${segundos}s</div>
    </div>
  </div>
  <hr>
  <div class="cards-grid">
    <div class="card" style="grid-column: span 2;">
      <div class="card-title">📖 BIBLIOTECA - ${bibliotecaData.length} ITENS</div>
      <div style="width:100%">
        <div style="font-weight:bold;margin-bottom:4px;">📚 HQs NA BIBLIOTECA (${hqsBiblioteca.length})</div>
        ${hqsBiblioteca.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Status</th>
              <th>Adicionado em</th>
              <th>Finalizado em</th>
            </tr>
          </thead>
          <tbody>
            ${hqsBiblioteca.map(item => `
              <tr>
                <td>${item.nome}</td>
                <td>${formatStatus(item.status)}</td>
                <td>${new Date(item.dataAdicionado).toLocaleDateString('pt-BR')}</td>
                <td>${item.dataFim ? new Date(item.dataFim).toLocaleDateString('pt-BR') : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : '<div style="color:#888;">Nenhuma HQ na biblioteca.</div>'}
        <div style="font-weight:bold;margin:8px 0 4px 0;">📕 LIVROS NA BIBLIOTECA (${livrosBiblioteca.length})</div>
        ${livrosBiblioteca.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Status</th>
              <th>Adicionado em</th>
            </tr>
          </thead>
          <tbody>
            ${livrosBiblioteca.map(item => `
              <tr>
                <td>${item.nome}</td>
                <td>${formatStatus(item.status)}</td>
                <td>${new Date(item.dataAdicionado).toLocaleDateString('pt-BR')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : '<div style="color:#888;">Nenhum livro na biblioteca.</div>'}
      </div>
    </div>
  </div>
  <div class="footer">
    <p>📄 Dashboard gerado automaticamente em ${dataHoraAtual}</p>
    <p>✨ Histórico de HQs Simplificado - Todos os direitos reservados</p>
  </div>
  <div class="print-btn-container no-print">
    <button class="print-btn" onclick="window.print()">🖨️ Imprimir Dashboard</button>
  </div>
</body>
</html>
  `;
}

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
}

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
    'lidas': 'Lidas',
    'emAndamento': 'Em Andamento',
    'naoLido': 'Não Lido',
    'naoLidas': 'Não Lidas',
    'naoLidos': 'Não Lidos',
    'lidos': 'Lidos',
    'a-comprar': 'A Comprar',
    'comprado': 'Comprado'
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

// ==========================================
// GSAP ANIMATIONS - THRASH METAL THEME
// ==========================================

function iniciarAnimacoesGSAP() {
  // Check if GSAP is loaded
  if (typeof gsap === 'undefined') {
    console.warn('GSAP não está carregado. Pulando animações.');
    return;
  }

  console.log('🚀 Inicializando animações GSAP - Thrash Metal Edition');

  // Register GSAP plugins if available
  if (gsap.registerPlugin) {
    // Register ScrollTrigger if available
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
  }

  // 1. Page Load Animation - Metal Entrance
  gsap.set('.header', { y: -100, opacity: 0 });
  gsap.set('.container', { scale: 0.8, opacity: 0 });
  gsap.set('.stat-card', { y: 50, opacity: 0 });
  gsap.set('.form-section', { x: -100, opacity: 0 });

  // Animate header entrance with metal sound effect
  gsap.to('.header', {
    y: 0,
    opacity: 1,
    duration: 1.2,
    ease: 'power3.out',
    onComplete: () => {
      // Add electric spark effect to header
      createElectricSparks('.header h1');
    }
  });

  // Animate main container with scale effect
  gsap.to('.container', {
    scale: 1,
    opacity: 1,
    duration: 1.5,
    delay: 0.3,
    ease: 'back.out(1.7)'
  });

  // Animate form section sliding in
  gsap.to('.form-section', {
    x: 0,
    opacity: 1,
    duration: 1,
    delay: 0.6,
    ease: 'power2.out'
  });

  // Animate stat cards with staggered entrance
  gsap.to('.stat-card', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    delay: 0.9,
    stagger: 0.2,
    ease: 'power2.out',
    onComplete: () => {
      // Add hover animations to stat cards
      addCardHoverAnimations();
    }
  });

  // 2. Tab Switching Animations
  const originalMostrarAba = window.mostrarAba;
  window.mostrarAba = function(abaId) {
    // Hide current tab with metal transition
    const currentTab = document.querySelector('.aba.ativa');
    if (currentTab) {
      gsap.to(currentTab, {
        scale: 0.9,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          // Call original function
          originalMostrarAba(abaId);

          // Show new tab with metal entrance
          const newTab = document.getElementById(abaId);
          gsap.fromTo(newTab,
            { scale: 0.8, opacity: 0, y: 30 },
            {
              scale: 1,
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: 'back.out(1.7)',
              onComplete: () => {
                // Add electric sparks to new tab
                createElectricSparks(`#${abaId} h2`);
              }
            }
          );
        }
      });
    } else {
      originalMostrarAba(abaId);
    }
  };

  // 3. Button Hover Animations with Sparks
  addButtonSparks();

  // 4. Progress Bar Animations
  animateProgressBars();

  // 5. Chart Loading Animations
  addChartAnimations();

  // 6. Loading Effects with Riffs
  addLoadingEffects();

  // 7. Timeline Animation for Reading Progress
  createReadingTimeline();

  console.log('✅ Animações GSAP inicializadas com sucesso!');
}

// Create electric sparks effect
function createElectricSparks(selector) {
  const element = document.querySelector(selector);
  if (!element) return;

  // Create spark container
  const sparkContainer = document.createElement('div');
  sparkContainer.className = 'electric-sparks';
  sparkContainer.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
  `;

  // Create multiple sparks
  for (let i = 0; i < 8; i++) {
    const spark = document.createElement('div');
    spark.style.cssText = `
      position: absolute;
      width: 2px;
      height: 2px;
      background: #ff0000;
      border-radius: 50%;
      box-shadow: 0 0 4px #ff0000;
    `;

    sparkContainer.appendChild(spark);

    // Animate spark
    gsap.set(spark, {
      x: Math.random() * 100 + '%',
      y: Math.random() * 100 + '%',
      scale: 0
    });

    gsap.to(spark, {
      scale: Math.random() * 3 + 1,
      opacity: 0,
      duration: 0.8 + Math.random() * 0.4,
      delay: Math.random() * 0.5,
      ease: 'power2.out',
      onComplete: () => spark.remove()
    });
  }

  element.style.position = 'relative';
  element.appendChild(sparkContainer);

  // Remove container after animation
  setTimeout(() => {
    if (sparkContainer.parentNode) {
      sparkContainer.remove();
    }
  }, 1500);
}

// Add hover animations to stat cards
function addCardHoverAnimations() {
  const cards = document.querySelectorAll('.stat-card');

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        scale: 1.05,
        y: -10,
        duration: 0.3,
        ease: 'power2.out',
        boxShadow: '0 20px 40px rgba(255, 0, 0, 0.3)'
      });

      // Add electric border effect
      gsap.to(card, {
        borderColor: '#ff0000',
        duration: 0.3
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
        boxShadow: '0 0 20px rgba(255, 0, 0, 0.7)'
      });

      // Reset border color
      gsap.to(card, {
        borderColor: '#ff0000',
        duration: 0.3
      });
    });
  });
}

// Add button sparks on hover
function addButtonSparks() {
  const buttons = document.querySelectorAll('.btn-primary, .btn-email, .btn-download');

  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      // Create spark effect
      createElectricSparks(button);

      // Button scale animation
      gsap.to(button, {
        scale: 1.05,
        duration: 0.2,
        ease: 'power2.out'
      });
    });

    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out'
      });
    });

    // Click animation
    button.addEventListener('click', () => {
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    });
  });
}

// Animate progress bars
function animateProgressBars() {
  const progressBars = document.querySelectorAll('.progress-fill');

  progressBars.forEach(bar => {
    const targetWidth = bar.style.width;

    gsap.set(bar, { width: 0 });

    gsap.to(bar, {
      width: targetWidth,
      duration: 2,
      delay: 1.5,
      ease: 'power2.out'
    });
  });
}

// Add chart loading animations
function addChartAnimations() {
  // This will be called when charts are rendered
  const originalRenderizarGraficos = window.renderizarGraficos;
  window.renderizarGraficos = function() {
    originalRenderizarGraficos();

    // Animate chart containers
    const chartContainers = document.querySelectorAll('.chart-container');
    gsap.fromTo(chartContainers,
      { scale: 0.8, opacity: 0, y: 30 },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)'
      }
    );
  };
}

// Add loading effects with riffs
function addLoadingEffects() {
  // Add loading animation to buttons when clicked
  const buttons = document.querySelectorAll('.btn-primary, .btn-email, .btn-download');

  buttons.forEach(button => {
    button.addEventListener('click', function() {
      const originalText = this.innerHTML;

      // Add loading state
      this.innerHTML = '⏳ Carregando...';
      this.disabled = true;

      // Simulate loading (remove after actual action completes)
      setTimeout(() => {
        this.innerHTML = originalText;
        this.disabled = false;
      }, 2000);
    });
  });
}

// Create reading timeline animation
function createReadingTimeline() {
  // Create a timeline for reading progress visualization
  const timeline = gsap.timeline({ paused: true });

  // This would be used for more complex animations
  // For now, just animate the age progress bar
  const progressBar = document.getElementById('progressBar');
  if (progressBar) {
    timeline.to(progressBar, {
      width: progressBar.style.width,
      duration: 3,
      ease: 'power2.out'
    });
  }

  // Play timeline after page load
  setTimeout(() => {
    timeline.play();
  }, 2000);
}

// Add scroll animations if ScrollTrigger is available
function addScrollAnimations() {
  if (typeof ScrollTrigger === 'undefined') return;

  // Animate sections on scroll
  gsap.utils.toArray('.section').forEach(section => {
    gsap.fromTo(section,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });
}

// Initialize scroll animations
addScrollAnimations();
