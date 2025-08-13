// Password confirmation modal for email sending
class PasswordModal {
    constructor() {
        this.correctPassword = 'mathe0us';
        this.modal = null;
        this.createModal();
    }

    createModal() {
        // Create modal HTML
        const modalHTML = `
            <div id="passwordModal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>🔐 Confirmação de Segurança</h3>
                        <button class="close-btn" onclick="passwordModal.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Por favor, insira a senha para enviar o relatório por e-mail:</p>
                        <input type="password" id="passwordInput" placeholder="Digite a senha..." autofocus>
                        <div id="passwordError" class="error-message"></div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-cancel" onclick="passwordModal.closeModal()">Cancelar</button>
                        <button class="btn-confirm" onclick="passwordModal.verifyPassword()">Confirmar</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('passwordModal');
        
        // Add event listeners
        this.addEventListeners();
    }

    addEventListeners() {
        // Close modal on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Handle Enter key
        const passwordInput = document.getElementById('passwordInput');
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.verifyPassword();
            }
        });
    }

    openModal() {
        this.modal.style.display = 'flex';
        document.getElementById('passwordInput').focus();
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordError').textContent = '';
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordError').textContent = '';
    }

    verifyPassword() {
        const password = document.getElementById('passwordInput').value;
        const errorElement = document.getElementById('passwordError');

        if (!password) {
            errorElement.textContent = 'Por favor, insira uma senha.';
            return;
        }

        if (password === this.correctPassword) {
            this.closeModal();
            this.sendEmailWithEmailJS();
        } else {
            errorElement.textContent = 'Senha incorreta. Tente novamente.';
            document.getElementById('passwordInput').select();
        }
    }

    async sendEmailWithEmailJS() {
        try {
            this.showLoadingFeedback('Enviando e-mail...');

            // Collect dashboard data
            const data = JSON.parse(localStorage.getItem('readingData') || '{}');
            const hqs = data.hqs || { total: 0, read: 0, emAndamento: 0 };
            const livros = data.livros || { total: 0, read: 0, emAndamento: 0 };
            
            // Prepare email template parameters
            const templateParams = {
                to_email: 'matheusgustavodasilvapires@gmail.com',
                subject: `Relatório de Leitura - ${new Date().toLocaleDateString('pt-BR')}`,
                message: this.createEmailMessage(hqs, livros),
                total_hqs: hqs.total,
                hqs_lidas: hqs.read,
                hqs_em_andamento: hqs.emAndamento,
                total_livros: livros.total,
                livros_lidos: livros.read,
                livros_em_andamento: livros.emAndamento
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
            } else {
                throw new Error('Erro ao enviar e-mail');
            }

        } catch (error) {
            console.error('Erro ao enviar e-mail:', error);
            this.showErrorFeedback('Erro ao enviar e-mail. Por favor, tente novamente.');
        }
    }

    createEmailMessage(hqs, livros) {
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        const horaAtual = new Date().toLocaleTimeString('pt-BR');
        
        return `
RELATÓRIO DE LEITURA - ${dataAtual}

📊 ESTATÍSTICAS GERAIS:
• Total de HQs: ${hqs.total}
• HQs Lidas: ${hqs.read}
• HQs Em Andamento: ${hqs.emAndamento}

• Total de Livros: ${livros.total}
• Livros Lidos: ${livros.read}
• Livros Em Andamento: ${livros.emAndamento}

📅 Data do Relatório: ${dataAtual}
⏰ Hora de Geração: ${horaAtual}

Obrigado por usar nosso dashboard de leitura!
        `;
    }

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

// Initialize password modal
const passwordModal = new PasswordModal();

// Update event listeners to use password modal
document.addEventListener('DOMContentLoaded', function() {
    // Replace original email button functionality with password modal
    const emailBtn = document.getElementById('enviarEmailBtn');
    const emailBtn2 = document.getElementById('enviarEmailBtn2');
    
    if (emailBtn) {
        emailBtn.addEventListener('click', () => passwordModal.openModal());
    }
    
    if (emailBtn2) {
        emailBtn2.addEventListener('click', () => passwordModal.openModal());
    }
});
