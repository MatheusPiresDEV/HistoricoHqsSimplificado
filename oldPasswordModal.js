// Old style password modal - Classic implementation
class OldPasswordModal {
    constructor() {
        this.correctPassword = 'mathe0us';
        this.modal = null;
        this.createOldModal();
    }

    createOldModal() {
        // Classic modal style - simpler, more direct
        const modalHTML = `
            <div id="oldPasswordModal" class="old-modal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border: 2px solid #333; padding: 20px; z-index: 1000; box-shadow: 0 0 10px rgba(0,0,0,0.5);">
                <div style="text-align: center;">
                    <h3 style="margin-top: 0; color: #333;">Senha de Confirmação</h3>
                    <p style="margin: 10px 0;">Digite a senha para enviar o relatório:</p>
                    <input type="password" id="oldPasswordInput" style="padding: 5px; margin: 10px 0; border: 1px solid #ccc; width: 200px;">
                    <div id="oldPasswordError" style="color: red; font-size: 12px; margin: 5px 0;"></div>
                    <div style="margin-top: 15px;">
                        <button onclick="oldPasswordModal.cancel()" style="margin-right: 10px; padding: 5px 15px;">Cancelar</button>
                        <button onclick="oldPasswordModal.verify()" style="padding: 5px 15px;">OK</button>
                    </div>
                </div>
            </div>
            <div id="oldModalOverlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999;"></div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('oldPasswordModal');
        this.overlay = document.getElementById('oldModalOverlay');
    }

    openModal() {
        this.modal.style.display = 'block';
        this.overlay.style.display = 'block';
        document.getElementById('oldPasswordInput').focus();
        document.getElementById('oldPasswordInput').value = '';
        document.getElementById('oldPasswordError').textContent = '';
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.overlay.style.display = 'none';
    }

    cancel() {
        this.closeModal();
    }

    verify() {
        const password = document.getElementById('oldPasswordInput').value;
        const errorElement = document.getElementById('oldPasswordError');

        if (!password) {
            errorElement.textContent = 'Digite uma senha!';
            return;
        }

        if (password === this.correctPassword) {
            this.closeModal();
            this.sendEmail();
        } else {
            errorElement.textContent = 'Senha incorreta!';
            document.getElementById('oldPasswordInput').select();
        }
    }

    sendEmail() {
        // Use mailto as fallback
        const subject = `Relatório de Leitura - ${new Date().toLocaleDateString('pt-BR')}`;
        const body = this.createEmailBody();
        
        window.location.href = `mailto:matheusgustavodasilvapires@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    createEmailBody() {
        const data = JSON.parse(localStorage.getItem('readingData') || '{}');
        const hqs = data.hqs || { total: 0, read: 0, emAndamento: 0 };
        const livros = data.livros || { total: 0, read: 0, emAndamento: 0 };

        return `RELATÓRIO DE LEITURA

📊 ESTATÍSTICAS:
• HQs: ${hqs.read}/${hqs.total} lidas (${Math.round((hqs.read/hqs.total)*100)}%)
• Livros: ${livros.read}/${livros.total} lidos (${Math.round((livros.read/livros.total)*100)}%)

📅 Data: ${new Date().toLocaleDateString('pt-BR')}`;
    }
}

// Initialize old password modal
const oldPasswordModal = new OldPasswordModal();
