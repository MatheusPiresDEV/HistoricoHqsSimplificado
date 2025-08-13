// Mailto handler for proper mailto: link functionality
class MailtoHandler {
    constructor() {
        this.defaultEmail = 'matheusgustavodasilvapires@gmail.com';
        this.setupMailtoLinks();
    }

    setupMailtoLinks() {
        // Handle mailto links with proper formatting
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-mailto]')) {
                e.preventDefault();
                this.handleMailto(e.target.dataset.mailto);
            }
        });
    }

    handleMailto(type) {
        switch(type) {
            case 'report':
                this.sendReportEmail();
                break;
            case 'feedback':
                this.sendFeedbackEmail();
                break;
            default:
                this.sendGenericEmail();
        }
    }

    sendReportEmail() {
        const data = JSON.parse(localStorage.getItem('readingData') || '{}');
        const hqs = data.hqs || { total: 0, read: 0, emAndamento: 0 };
        const livros = data.livros || { total: 0, read: 0, emAndamento: 0 };

        const subject = `Relatório de Leitura - ${new Date().toLocaleDateString('pt-BR')}`;
        const body = `RELATÓRIO DE LEITURA

📊 ESTATÍSTICAS:
• HQs: ${hqs.read}/${hqs.total} lidas (${Math.round((hqs.read/hqs.total)*100)}%)
• Livros: ${livros.read}/${livros.total} lidos (${Math.round((livros.read/livros.total)*100)}%)

📅 Data: ${new Date().toLocaleDateString('pt-BR')}`;

        window.location.href = `mailto:${this.defaultEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    sendFeedbackEmail() {
        const subject = 'Feedback - Dashboard de Leitura';
        const body = 'Olá! Gostaria de compartilhar meu feedback sobre o dashboard de leitura:\n\n';
        
        window.location.href = `mailto:${this.defaultEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    sendGenericEmail() {
        const subject = 'Contato - Dashboard de Leitura';
        const body = 'Olá! Gostaria de entrar em contato.\n\n';
        
        window.location.href = `mailto:${this.defaultEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
}

// Initialize mailto handler
const mailtoHandler = new MailtoHandler();
