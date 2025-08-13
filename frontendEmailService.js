// Frontend-only Email and Download Service
class FrontendEmailService {
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

    // Create email content for display
    createEmailContent(data) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                    <h1 style="color: #667eea; text-align: center; margin-bottom: 30px;">📊 Dashboard de Leitura - Relatório</h1>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h2 style="color: #333;">📈 Estatísticas de Leitura</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="background: #e9ecef;">
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total de HQs</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${data.hqs.total}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>HQs Lidas</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${data.hqs.read}</td>
                            </tr>
                            <tr style="background: #e9ecef;">
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>HQs Em Andamento</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${data.hqs.emAndamento}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total de Livros</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${data.livros.total}</td>
                            </tr>
                            <tr style="background: #e9ecef;">
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Livros Lidos</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${data.livros.read}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Livros Em Andamento</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${data.livros.emAndamento}</td>
                            </tr>
                            <tr style="background: #e9ecef;">
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Porcentagem Total Lida</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${data.porcentagemLidos}%</td>
                            </tr>
                        </table>
                    </div>

                    <div style="background: #e3f2fd; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #1976d2;">📅 Informações do Relatório</h3>
                        <p><strong>Data:</strong> ${data.dataAtual}</p>
                        <p><strong>Hora:</strong> ${data.horaAtual}</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Simulate email sending with frontend-only approach
    async sendEmail() {
        if (this.isProcessing) return;

        try {
            this.isProcessing = true;
            this.updateStatus('Preparando relatório...');

            const data = this.collectDashboardData();
            const emailContent = this.createEmailContent(data);
            
            // Create a new window/tab with the email content
            const emailWindow = window.open('', '_blank', 'width=800,height=600');
            emailWindow.document.write(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Relatório de Leitura - Pronto para Enviar</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                        .email-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        .header { background: #2563eb; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
                        .content { padding: 20px; }
                        .instructions { background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                        .copy-btn { background: #10b981; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 10px 5px; }
                        .copy-btn:hover { background: #059669; }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1>📧 Relatório de Leitura Pronto</h1>
                        </div>
                        <div class="content">
                            <div class="instructions">
                                <h3>📋 Instruções:</h3>
                                <p>1. Copie o conteúdo abaixo</p>
                                <p>2. Cole em seu cliente de email preferido</p>
                                <p>3. Envie para o destinatário desejado</p>
                            </div>
                            
                            <button class="copy-btn" onclick="copyToClipboard()">📋 Copiar Conteúdo</button>
                            <button class="copy-btn" onclick="window.print()">🖨️ Imprimir</button>
                            
                            <div id="report-content">
                                ${emailContent}
                            </div>
                        </div>
                    </div>
                    
                    <script>
                        function copyToClipboard() {
                            const content = document.getElementById('report-content').innerHTML;
                            navigator.clipboard.writeText(content).then(() => {
                                alert('Conteúdo copiado para a área de transferência!');
                            });
                        }
                    </script>
                </body>
                </html>
            `);

            this.updateStatus('Relatório aberto em nova aba!', false, true);
            
        } catch (error) {
            this.updateStatus('Erro ao abrir relatório: ' + error.message, true);
        } finally {
            this.isProcessing = false;
        }
    }

    // Download report as HTML file
    async downloadReport() {
        try {
            this.updateStatus('Preparando download...');
            
            const data = this.collectDashboardData();
            const htmlContent = this.createEmailContent(data);
            
            // Create downloadable HTML file
            const fullHtml = `
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Relatório de Leitura - ${data.dataAtual}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                        .container { max-width: 800px; margin: 0 auto; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 15px 15px 0 0; }
                        .content { background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
                        .stats-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        .stats-table td { padding: 12px; border: 1px solid #ddd; }
                        .stats-table tr:nth-child(even) { background-color: #f9f9f9; }
                        .footer { text-align: center; margin-top: 30px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        ${htmlContent}
                        <div class="footer">
                            <p>Relatório gerado em ${data.dataAtual} às ${data.horaAtual}</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
            
            const blob = new Blob([fullHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `relatorio-leitura-${data.dataAtual.replace(/\//g, '-')}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.updateStatus('Relatório baixado com sucesso!', false, true);
        } catch (error) {
            this.updateStatus('Erro ao baixar relatório: ' + error.message, true);
        }
    }

    // Update status message
    updateStatus(message, isError = false, isSuccess = false) {
        const statusElements = [
            document.getElementById('emailStatus'),
            document.getElementById('emailStatus2')
        ];
        
        statusElements.forEach(element => {
            if (element) {
                element.textContent = message;
                element.className = `email-status ${isError ? 'error' : isSuccess ? 'success' : ''}`;
                element.style.display = 'block';
                
                setTimeout(() => {
                    element.style.display = 'none';
                }, 4000);
            }
        });
    }
}

// Initialize frontend email service
const frontendEmailService = new FrontendEmailService();

// Event listeners for all buttons
document.addEventListener('DOMContentLoaded', function() {
    // First set of buttons (home tab)
    const emailBtn = document.getElementById('enviarEmailBtn');
    const downloadBtn = document.getElementById('downloadReportBtn');
    
    // Second set of buttons (graficos tab)
    const emailBtn2 = document.getElementById('enviarEmailBtn2');
    const downloadBtn2 = document.getElementById('downloadReportBtn2');
    
    if (emailBtn) {
        emailBtn.addEventListener('click', () => frontendEmailService.sendEmail());
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => frontendEmailService.downloadReport());
    }
    
    if (emailBtn2) {
        emailBtn2.addEventListener('click', () => frontendEmailService.sendEmail());
    }
    
    if (downloadBtn2) {
        downloadBtn2.addEventListener('click', () => frontendEmailService.downloadReport());
    }
});
