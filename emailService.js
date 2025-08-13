// Email Service with EmailJS integration
class EmailService {
    constructor() {
        this.isProcessing = false;
    }

    // Collect current dashboard data
    collectDashboardData() {
        const readingData = JSON.parse(localStorage.getItem('readingData') || '{}');
        
        const hqs = readingData.hqs || { total: 0, read: 0, emAndamento: 0, naoLidas: 0 };
        const livros = readingData.livros || { total: 0, read: 0, emAndamento: 0, naoLidos: 0 };
        
        const totalItems = hqs.total + livros.total;
        const totalLidos = hqs.read + livros.read;
        const porcentagemLidos = totalItems > 0 ? ((totalLidos / totalItems) * 100).toFixed(2) : 0;
        
        return {
            hqs,
            livros,
            totalItems,
            totalLidos,
            porcentagemLidos,
            dataAtual: new Date().toLocaleDateString('pt-BR'),
            horaAtual: new Date().toLocaleTimeString('pt-BR')
        };
    }

    // Send email using EmailJS
    async sendEmailWithEmailJS() {
        try {
            this.showLoadingFeedback('Enviando e-mail...');

            const data = this.collectDashboardData();
            
            // Prepare email template parameters
            const templateParams = {
                to_email: 'matheusgustavodasilvapires@gmail.com',
                subject: `Relatório de Leitura - ${data.dataAtual}`,
                message: this.createEmailContent(data),
                total_hqs: data.hqs.total,
                hqs_lidas: data.hqs.read,
                hqs_em_andamento: data.hqs.emAndamento,
                total_livros: data.livros.total,
                livros_lidos: data.livros.read,
                livros_em_andamento: data.livros.emAndamento,
                porcentagem_lidos: data.porcentagemLidos
            };

            // Send email using EmailJS
            const response = await emailjs.send(
                'service_l9pr7ee',
                'template_s9nortx',
                templateParams,
                'H1o6cMMb_pNd88i_2'
            );

            if (response.status === 200) {
                this.showSuccessFeedback('E-mail enviado com sucesso! ✉️');
                return true;
            } else {
                throw new Error('Erro ao enviar e-mail');
            }

        } catch (error) {
            console.error('Erro ao enviar e-mail:', error);
            this.showErrorFeedback('Erro ao enviar e-mail. Por favor, tente novamente.');
            return false;
        }
    }

    // Create email content
    createEmailContent(data) {
        return `
RELATÓRIO DE LEITURA - ${data.dataAtual}

📊 ESTATÍSTICAS GERAIS:
• Total de HQs: ${data.hqs.total}
• HQs Lidas: ${data.hqs.read}
• HQs Em Andamento: ${data.hqs.emAndamento}
• HQs Não Lidas: ${data.hqs.naoLidas}

• Total de Livros: ${data.livros.total}
• Livros Lidos: ${data.livros.read}
• Livros Em Andamento: ${data.livros.emAndamento}
• Livros Não Lidos: ${data.livros.naoLidos}

📈 PORCENTAGENS:
• Porcentagem Total Lida: ${data.porcentagemLidos}%
• Total de Itens: ${data.totalItems}
• Total Lidos: ${data.totalLidos}

📅 Data do Relatório: ${data.dataAtual}
⏰ Hora de Geração: ${data.horaAtual}
        `;
    }

    // Update status message
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
}

// Initialize email service
const emailService = new EmailService();
