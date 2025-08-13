// Handler simples para email com senha única e mailto
class SimpleEmailHandler {
    constructor() {
        this.correctPassword = 'mathe0us';
        this.email = 'matheusgustavodasilvapires@gmail.com';
        this.setupEmailButtons();
    }

    setupEmailButtons() {
        // Configurar os botões de email
        const emailBtn1 = document.getElementById('enviarEmailBtn');
        const emailBtn2 = document.getElementById('enviarEmailBtn2');
        
        if (emailBtn1) {
            emailBtn1.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPasswordPrompt();
            });
        }
        
        if (emailBtn2) {
            emailBtn2.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPasswordPrompt();
            });
        }
    }

    showPasswordPrompt() {
        const password = prompt('Digite a senha para enviar o relatório:');
        if (password === this.correctPassword) {
            this.sendEmail();
        } else if (password !== null) {
            alert('Senha incorreta!');
        }
    }

    sendEmail() {
        // Coletar dados do localStorage
        const data = JSON.parse(localStorage.getItem('readingData') || '{}');
        const hqs = data.hqs || { total: 0, read: 0, emAndamento: 0 };
        const livros = data.livros || { total: 0, read: 0, emAndamento: 0 };
        
        // Criar corpo do email
        const body = this.createEmailBody(hqs, livros);
        const subject = `Relatório de Leitura - ${new Date().toLocaleDateString('pt-BR')}`;
        
        // Abrir mailto
        window.location.href = `mailto:${this.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    createEmailBody(hqs, livros) {
        return `RELATÓRIO DE LEITURA

📊 ESTATÍSTICAS GERAIS:
• Total de HQs: ${hqs.total}
• HQs Lidas: ${hqs.read}
• HQs Em Andamento: ${hqs.emAndamento}

• Total de Livros: ${livros.total}
• Livros Lidos: ${livros.read}
• Livros Em Andamento: ${livros.emAndamento}

📅 Data do Relatório: ${new Date().toLocaleDateString('pt-BR')}
⏰ Hora de Geração: ${new Date().toLocaleTimeString('pt-BR')}

Obrigado por usar nosso dashboard de leitura!`;
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    const emailHandler = new SimpleEmailHandler();
});
