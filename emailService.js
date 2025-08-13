// EmailJS Configuration and Service
const EMAIL_CONFIG = {
    service_id: 'service_l9pr7ee', // EmailJS service ID
    template_id: 'template_s9nortx', // EmailJS template ID
    public_key: 'H1o6cMMb_pNd88i_2',   // EmailJS public key
    destination_email: 'matheusgustavodasilvapires@gmail.com'
};

// Initialize EmailJS
(function() {
    emailjs.init(EMAIL_CONFIG.public_key);
})();

// Email Service Class
class EmailService {
    constructor() {
        this.password = 'mathe0us';
        this.isSending = false;
    }

    // Password validation
    async validatePassword(inputPassword) {
        return inputPassword === this.password;
    }

    // Calculate age and birthday countdown
    calculateAgeAndCountdown() {
        const birthDate = new Date('2006-11-12');
        const now = new Date();
        
        // Calculate age
        let age = now.getFullYear() - birthDate.getFullYear();
        const monthDiff = now.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
            age--;
        }

        // Calculate next birthday
        const nextBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (nextBirthday < now) {
            nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
        }

        const timeDiff = nextBirthday - now;
        
        return {
            age,
            countdown: {
                months: Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30)),
                days: Math.floor(timeDiff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((timeDiff % (1000 * 60)) / 1000),
                milliseconds: timeDiff % 1000
            }
        };
    }

    // Collect dashboard data
    collectDashboardData() {
        const hqs = JSON.parse(localStorage.getItem('hqs') || '[]');
        const livros = JSON.parse(localStorage.getItem('livros') || '[]');
        
        const totalHqs = hqs.length;
        const totalLivros = livros.length;
        const hqsLidas = hqs.filter(hq => hq.lido).length;
        const livrosLidos = livros.filter(livro => livro.lido).length;
        
        const totalItems = totalHqs + totalLivros;
        const totalLidos = hqsLidas + livrosLidos;
        const porcentagemLidos = totalItems > 0 ? ((totalLidos / totalItems) * 100).toFixed(2) : 0;
        
        // Calculate average and standard deviation
        const hqsPorAno = hqs.reduce((acc, hq) => {
            const ano = hq.ano || 'Desconhecido';
            acc[ano] = (acc[ano] || 0) + 1;
            return acc;
        }, {});
        
        const livrosPorAno = livros.reduce((acc, livro) => {
            const ano = livro.ano || 'Desconhecido';
            acc[ano] = (acc[ano] || 0) + 1;
            return acc;
        }, {});
        
        const allAnos = [...new Set([...Object.keys(hqsPorAno), ...Object.keys(livrosPorAno)])];
        const counts = allAnos.map(ano => (hqsPorAno[ano] || 0) + (livrosPorAno[ano] || 0));
        const average = counts.reduce((a, b) => a + b, 0) / counts.length || 0;
        const variance = counts.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / counts.length || 0;
        const desvioPadrao = Math.sqrt(variance).toFixed(2);
        
        return {
            totalHqs,
            totalLivros,
            hqsLidas,
            livrosLidos,
            totalItems,
            totalLidos,
            porcentagemLidos,
            media: average.toFixed(2),
            desvioPadrao
        };
    }

    // Capture chart images
    async captureChartImages() {
        const charts = {};
        
        // Capture anoChart
        const anoChartCanvas = document.getElementById('anoChart');
        if (anoChartCanvas) {
            charts.anoChart = anoChartCanvas.toDataURL('image/png');
        }
        
        // Capture statusChart
        const statusChartCanvas = document.getElementById('statusChart');
        if (statusChartCanvas) {
            charts.statusChart = statusChartCanvas.toDataURL('image/png');
        }
        
        return charts;
    }

    // Format current date/time
    formatDateTime() {
        const now = new Date();
        return {
            date: now.toLocaleDateString('pt-BR'),
            time: now.toLocaleTimeString('pt-BR'),
            full: now.toLocaleString('pt-BR')
        };
    }

    // Create email HTML content
    createEmailContent(data, charts, ageInfo, dateTime) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                    <h1 style="color: #667eea; text-align: center; margin-bottom: 30px;">📊 Dashboard de Leitura - Relatório Completo</h1>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h2 style="color: #333;">📈 Estatísticas de Leitura</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="background: #e9ecef;">
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total de HQs</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${data.totalHqs}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>HQs Lidas</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${data.hqsLidas}</td>
                            </tr>
                            <tr style="background: #e9ecef;">
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total de Livros</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${data.totalLivros}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Livros Lidos</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${data.livrosLidos}</td>
                            </tr>
                            <tr style="background: #e9ecef;">
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Porcentagem Lidos</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${data.porcentagemLidos}%</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Média por Ano</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${data.media}</td>
                            </tr>
                            <tr style="background: #e9ecef;">
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Desvio Padrão</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${data.desvioPadrao}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="background: #e3f2fd; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #1976d2;">👤 Informações Pessoais</h3>
                        <p><strong>Idade Atual:</strong> ${ageInfo.age} anos</p>
                        <p><strong>Data do Relatório:</strong> ${dateTime.full}</p>
                        <p><strong>Tempo até próximo aniversário:</strong></p>
                        <ul>
                            <li>${ageInfo.countdown.months} meses</li>
                            <li>${ageInfo.countdown.days} dias</li>
                            <li>${ageInfo.countdown.hours} horas</li>
                            <li>${ageInfo.countdown.minutes} minutos</li>
                            <li>${ageInfo.countdown.seconds} segundos</li>
                        </ul>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <h3 style="color: #333;">📊 Gráficos do Dashboard</h3>
                        ${charts.anoChart ? `<img src="${charts.anoChart}" alt="Distribuição por Ano" style="max-width: 100%; height: auto; margin: 10px 0;">` : ''}
                        ${charts.statusChart ? `<img src="${charts.statusChart}" alt="Status de Leitura" style="max-width: 100%; height: auto; margin: 10px 0;">` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Send email with all data
    async sendEmail() {
        if (this.isSending) return;

        try {
            this.isSending = true;
            this.updateStatus('Verificando senha...');

            // Password prompt
            const inputPassword = prompt('Digite a senha para enviar o e-mail:');
            if (!inputPassword) {
                this.updateStatus('Envio cancelado.');
                return;
            }

            const isValid = await this.validatePassword(inputPassword);
            if (!isValid) {
                this.updateStatus('Senha incorreta. Envio bloqueado.', true);
                return;
            }

            this.updateStatus('Preparando dados...');

            // Collect all data
            const data = this.collectDashboardData();
            const ageInfo = this.calculateAgeAndCountdown();
            const dateTime = this.formatDateTime();
            
            this.updateStatus('Capturando gráficos...');
            const charts = await this.captureChartImages();

            this.updateStatus('Enviando e-mail...');

            const emailContent = this.createEmailContent(data, charts, ageInfo, dateTime);

            const templateParams = {
                to_email: EMAIL_CONFIG.destination_email,
                subject: `Dashboard de Leitura - Relatório ${dateTime.date}`,
                message: emailContent,
                reply_to: EMAIL_CONFIG.destination_email
            };

            await emailjs.send(EMAIL_CONFIG.service_id, EMAIL_CONFIG.template_id, templateParams);

            this.updateStatus('E-mail enviado com sucesso!', false, true);
            
        } catch (error) {
            console.error('Erro ao enviar e-mail:', error);
            this.updateStatus('Erro ao enviar e-mail: ' + error.message, true);
        } finally {
            this.isSending = false;
        }
    }

    // Update status message
    updateStatus(message, isError = false, isSuccess = false) {
        const statusElement = document.getElementById('emailStatus');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `email-status ${isError ? 'error' : isSuccess ? 'success' : ''}`;
        }
    }

    // Download report as HTML
    async downloadReport() {
        try {
            const data = this.collectDashboardData();
            const ageInfo = this.calculateAgeAndCountdown();
            const dateTime = this.formatDateTime();
            const charts = await this.captureChartImages();

            const htmlContent = this.createEmailContent(data, charts, ageInfo, dateTime);
            
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dashboard-leitura-${dateTime.date.replace(/\//g, '-')}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.updateStatus('Relatório baixado com sucesso!', false, true);
        } catch (error) {
            this.updateStatus('Erro ao baixar relatório: ' + error.message, true);
        }
    }
}

// Initialize email service
const emailService = new EmailService();

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // First set of buttons (home tab)
    const emailBtn = document.getElementById('enviarEmailBtn');
    const downloadBtn = document.getElementById('downloadReportBtn');
    
    // Second set of buttons (graficos tab)
    const emailBtn2 = document.getElementById('enviarEmailBtn2');
    const downloadBtn2 = document.getElementById('downloadReportBtn2');
    
    if (emailBtn) {
        emailBtn.addEventListener('click', () => emailService.sendEmail());
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => emailService.downloadReport());
    }
    
    if (emailBtn2) {
        emailBtn2.addEventListener('click', () => emailService.sendEmail());
    }
    
    if (downloadBtn2) {
        downloadBtn2.addEventListener('click', () => emailService.downloadReport());
    }
});
