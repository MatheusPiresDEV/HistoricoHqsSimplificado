// Handler para exportar dados via mensagem (WhatsApp, Telegram, etc.)
class ExportHandler {
    constructor() {
        this.setupExportButtons();
    }

    setupExportButtons() {
        // Configurar botões de exportação corretos
        const exportBtn1 = document.getElementById('exportBtn');
        const exportBtn2 = document.getElementById('exportBtn2');
        
        if (exportBtn1) {
            exportBtn1.addEventListener('click', () => this.exportData());
        }
        
        if (exportBtn2) {
            exportBtn2.addEventListener('click', () => this.exportData());
        }
    }

    exportData() {
        const data = JSON.parse(localStorage.getItem('readingData') || '{}');
        const hqs = data.hqs || { total: 0, read: 0, emAndamento: 0 };
        const livros = data.livros || { total: 0, read: 0, emAndamento: 0 };
        
        const message = this.createMessage(hqs, livros);
        
        // Usar Web Share API se disponível (mais moderno)
        if (navigator.share) {
            this.shareViaWebShare(message);
        } else {
            // Fallback: copiar para área de transferência
            this.copyToClipboard(message);
        }
    }

    createMessage(hqs, livros) {
    const birthdayInfo = this.calculateAgeAndBirthdayCountdown('2006-11-12');

    return `📊 MEU HISTÓRICO DE LEITURA

👤 INFORMAÇÕES PESSOAIS
• Idade atual: ${birthdayInfo.age} anos
• Faltam: ${birthdayInfo.countdown.months} meses, ${birthdayInfo.countdown.days} dias, ${birthdayInfo.countdown.hours}h ${birthdayInfo.countdown.minutes}min ${birthdayInfo.countdown.seconds}s para o seu aniversário

📚 HQs:
• Total: ${hqs.total}
• Lidas: ${hqs.read}
• Em andamento: ${hqs.emAndamento}
• % Concluídas: ${hqs.total > 0 ? Math.round((hqs.read/hqs.total)*100) : 0}%

📖 Livros:
• Total: ${livros.total}
• Lidos: ${livros.read}
• Em andamento: ${livros.emAndamento}
• % Concluídos: ${livros.total > 0 ? Math.round((livros.read/livros.total)*100) : 0}%

📅 Data: ${new Date().toLocaleDateString('pt-BR')}`;
}

    copyToClipboard(text) {
        // Usar a API moderna de clipboard
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text)
                .then(() => this.showSuccessFeedback('Dados copiados com sucesso! Cole em WhatsApp, Telegram ou onde preferir.'))
                .catch(() => this.fallbackCopy(text));
        } else {
            // Fallback para navegadores antigos ou contexto não seguro
            this.fallbackCopy(text);
        }
    }

    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            this.showSuccessFeedback('Dados copiados com sucesso! Cole em WhatsApp, Telegram ou onde preferir.');
        } catch (err) {
            this.showErrorFeedback('Erro ao copiar dados. Por favor, selecione e copie manualmente.');
        }
        
        document.body.removeChild(textarea);
    }

    shareViaWebShare(message) {
        if (navigator.share) {
            navigator.share({
                title: 'Meu Histórico de Leitura',
                text: message
            }).catch(err => {
                console.error('Erro ao compartilhar:', err);
                // Fallback para copiar se o compartilhamento falhar
                this.copyToClipboard(message);
            });
        }
    }

    showSuccessFeedback(message) {
        // Criar notificação visual moderna
        const notification = this.createNotification(message, 'success');
        document.body.appendChild(notification);
        
        // Remover após 3 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    showErrorFeedback(message) {
        const notification = this.createNotification(message, 'error');
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }

    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            max-width: 300px;
            animation: slideIn 0.3s ease;
            ${type === 'success' ? 'background: #28a745;' : 'background: #dc3545;'}
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center;">
                <span style="margin-right: 10px;">${type === 'success' ? '✅' : '❌'}</span>
                <span>${message}</span>
            </div>
        `;

        // Adicionar estilo de animação
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        return notification;
    }
    calculateAgeAndBirthdayCountdown(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    const nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (today > nextBirthday) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    const timeDiff = nextBirthday - today;
    const months = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30.44));
    const days = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return {
        age,
        countdown: { months, days, hours, minutes, seconds }
    };
}

}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    const exportHandler = new ExportHandler();
});
