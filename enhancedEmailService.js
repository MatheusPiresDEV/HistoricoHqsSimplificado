// Enhanced Email Service with password verification and mailto functionality
class EnhancedEmailService {
    constructor() {
        this.correctPassword = 'mathe0us';
        this.isProcessing = false;
    }

    // Calculate age based on birth date
    calculateAge() {
        const birthDate = new Date('2006-11-12');
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    // Calculate time until next birthday
    calculateTimeUntilNextBirthday() {
        const birthDate = new Date('2006-11-12');
        const today = new Date();
        
        // Next birthday
        let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        // If birthday has passed this year, use next year
        if (today > nextBirthday) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        const diff = nextBirthday - today;
        
        // Calculate time components
        const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
        const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        const milliseconds = diff % 1000;
        
        return {
            months,
            days,
            hours,
            minutes,
            seconds,
            milliseconds
        };
    }

    // Get current data from storage
    getCurrentData() {
        const saved = localStorage.getItem('readingData');
        return saved ? JSON.parse(saved) : {
            hqs: { total: 0, read: 0, emAndamento: 0, naoLidas: 0 },
            livros: { total: 0, read: 0, emAndamento: 0, naoLidos: 0 }
        };
    }

    // Calculate statistics
    calculateStatistics(data) {
        const hqs = data.hqs;
        const livros = data.livros;
        
        const totalHqs = hqs.total;
        const totalLivros = livros.total;
        const totalItems = totalHqs + totalLivros;
        const totalLidos = hqs.read + livros.read;
        
        const percentHqsLidas = totalHqs > 0 ? (hqs.read / totalHqs) * 100 : 0;
        const percentLivrosLidos = totalLivros > 0 ? (livros.read / totalLivros) * 100 : 0;
        const percentTotalLidos = totalItems > 0 ? (totalLidos / totalItems) * 100 : 0;
        
        // Calculate means
        const mediaHqs = totalHqs > 0 ? hqs.read / totalHqs : 0;
        const mediaLivros = totalLivros > 0 ? livros.read / totalLivros : 0;
        
        // Calculate standard deviations
        const hqsValues = [hqs.read, hqs.emAndamento, hqs.naoLidas].filter(v => v > 0);
        const livrosValues = [livros.read, livros.emAndamento, livros.naoLidos].filter(v => v > 0);
        
        const dpHqs = hqsValues.length > 1 ? this.calculateStandardDeviation(hqsValues) : 0;
        const dpLivros = livrosValues.length > 1 ? this.calculateStandardDeviation(livrosValues) : 0;
        
        return {
            totalHqs,
            totalLivros,
            totalItems,
            totalLidos,
            percentHqsLidas,
            percentLivrosLidos,
            percentTotalLidos,
            mediaHqs,
            mediaLivros,
            dpHqs,
            dpLivros
        };
    }

    // Calculate standard deviation
    calculateStandardDeviation(values) {
        if (values.length === 0) return 0;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squareDiffs = values.map(value => Math.pow(value - mean, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(avgSquareDiff);
    }

    // Capture canvas charts as base64 images
    async captureCharts() {
        const charts = {};
        
        // Capture HQs chart
        const hqsChart = document.getElementById('graficoPercentHqs');
        if (hqsChart) {
            charts.hqs = hqsChart.toDataURL('image/png');
        }
        
        // Capture Livros chart
        const livrosChart = document.getElementById('graficoPercentLivros');
        if (livrosChart) {
            charts.livros = livrosChart.toDataURL('image/png');
        }
        
        // Capture other charts
        const proporcaoChart = document.getElementById('graficoProporcao');
        if (proporcaoChart) {
            charts.proporcao = proporcaoChart.toDataURL('image/png');
        }
        
        return charts;
    }

    // Generate email content
    generateEmailContent(data, charts, age, timeUntilBirthday) {
        const stats = this.calculateStatistics(data);
        const now = new Date();
        
        let content = `RELATÓRIO DE LEITURA - ${now.toLocaleDateString('pt-BR')}\n\n`;
        content += `📊 ESTATÍSTICAS GERAIS\n`;
        content += `• Data e Hora: ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}\n`;
        content += `• Idade Atual: ${age} anos\n`;
        content += `• Tempo até próximo aniversário: ${timeUntilBirthday.months} meses, ${timeUntilBirthday.days} dias, ${timeUntilBirthday.hours} horas, ${timeUntilBirthday.minutes} minutos, ${timeUntilBirthday.seconds} segundos, ${timeUntilBirthday.milliseconds} milissegundos\n\n`;
        
        content += `📚 HISTÓRICO DE LEITURA\n`;
        content += `• Total de HQs: ${stats.totalHqs}\n`;
        content += `• HQs Lidas: ${data.hqs.read}\n`;
        content += `• HQs Em Andamento: ${data.hqs.emAndamento}\n`;
        content += `• HQs Não Lidas: ${data.hqs.naoLidas}\n`;
        content += `• Porcentagem de HQs Lidas: ${stats.percentHqsLidas.toFixed(2)}%\n\n`;
        
        content += `📖 LIVROS\n`;
        content += `• Total de Livros: ${stats.totalLivros}\n`;
        content += `• Livros Lidos: ${data.livros.read}\n`;
        content += `• Livros Em Andamento: ${data.livros.emAndamento}\n`;
        content += `• Livros Não Lidos: ${data.livros.naoLidos}\n`;
        content += `• Porcentagem de Livros Lidos: ${stats.percentLivrosLidos.toFixed(2)}%\n\n`;
        
        content += `📈 ESTATÍSTICAS AVANÇADAS\n`;
        content += `• Total de Itens: ${stats.totalItems}\n`;
        content += `• Total Lidos: ${stats.totalLidos}\n`;
        content += `• Porcentagem Total Lida: ${stats.percentTotalLidos.toFixed(2)}%\n`;
        content += `• Média de HQs: ${stats.mediaHqs.toFixed(2)}\n`;
        content += `• Média de Livros: ${stats.mediaLivros.toFixed(2)}\n`;
        content += `• Desvio Padrão HQs: ${stats.dpHqs.toFixed(2)}\n`;
        content += `• Desvio Padrão Livros: ${stats.dpLivros.toFixed(2)}\n\n`;
        
        // Add chart references
        if (charts.hqs) {
            content += `📊 Gráfico de HQs: [Imagem em anexo]\n`;
        }
        if (charts.livros) {
            content += `📊 Gráfico de Livros: [Imagem em anexo]\n`;
        }
        
        return content;
    }

    // Show loading feedback
    showLoadingFeedback(message) {
        const statusElements = [
            document.getElementById('emailStatus'),
            document.getElementById('emailStatus2')
        ];
        
        statusElements.forEach(element => {
            if (element) {
                element.textContent = message;
                element.className = 'email-status loading';
                element.style.display = 'block';
            }
        });
    }

    // Show success feedback
    showSuccessFeedback(message) {
        const statusElements = [
            document.getElementById('emailStatus'),
            document.getElementById('emailStatus2')
        ];
        
        statusElements.forEach(element => {
            if (element) {
                element.textContent = message;
                element.className = 'email-status success';
                element.style.display = 'block';
                
                setTimeout(() => {
                    element.style.display = 'none';
                }, 5000);
            }
        });
    }

    // Show error feedback
    showErrorFeedback(message) {
        const statusElements = [
            document.getElementById('emailStatus'),
            document.getElementById('emailStatus2')
        ];
        
        statusElements.forEach(element => {
            if (element) {
                element.textContent = message;
                element.className = 'email-status error';
                element.style.display = 'block';
                
                setTimeout(() => {
                    element.style.display = 'none';
                }, 5000);
            }
        });
    }

    // Main function to send email with password verification
    async sendEmailWithPassword() {
        try {
            // Show loading
            this.showLoadingFeedback('Verificando senha...');
            
            // Prompt for password
            const password = prompt('Por favor, insira a senha para enviar o relatório por e-mail:');
            
            if (!password) {
                this.showErrorFeedback('Senha não fornecida. Operação cancelada.');
                return;
            }
            
            if (password !== this.correctPassword) {
                this.showErrorFeedback('Senha incorreta. Tente novamente.');
                return;
            }
            
            // Show next loading message
            this.showLoadingFeedback('Preparando resumo...');
            
            // Get current data
            const data = this.getCurrentData();
            
            // Calculate age and time until birthday
            const age = this.calculateAge();
            const timeUntilBirthday = this.calculateTimeUntilNextBirthday();
            
            // Show loading message
            this.showLoadingFeedback('Capturando gráficos...');
            
            // Capture charts
            const charts = await this.captureCharts();
            
            // Show loading message
            this.showLoadingFeedback('Abrindo cliente de e-mail...');
            
            // Generate email content
            const emailContent = this.generateEmailContent(data, charts, age, timeUntilBirthday);
            
            // Create mailto link
            const subject = encodeURIComponent('Resumo de Leitura');
            const body = encodeURIComponent(emailContent);
            const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
            
            // Open email client
            window.location.href = mailtoLink;
            
            // Show success message
            setTimeout(() => {
                this.showSuccessFeedback('Resumo pronto para envio! ✉️');
            }, 1000);
            
        } catch (error) {
            console.error('Erro ao enviar e-mail:', error);
            this.showErrorFeedback('Erro ao preparar e-mail. Por favor, tente novamente.');
        }
    }
}

// Initialize enhanced email service
const enhancedEmailService = new EnhancedEmailService();

// Update existing button to use new service
document.addEventListener('DOMContentLoaded', function() {
    const enviarEmailBtn = document.getElementById('enviarEmailBtn');
    const enviarEmailBtn2 = document.getElementById('enviarEmailBtn2');
    
    if (enviarEmailBtn) {
        enviarEmailBtn.addEventListener('click', () => enhancedEmailService.sendEmailWithPassword());
    }
    
    if (enviarEmailBtn2) {
        enviarEmailBtn2.addEventListener('click', () => enhancedEmailService.sendEmailWithPassword());
    }
});
