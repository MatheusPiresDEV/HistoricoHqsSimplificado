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
        // Usar a função completa de geração de conteúdo
        const data = { hqs, livros };
        return this.generateCompleteCopyContent(data);
    }

    generateCompleteCopyContent(data) {
        const hqs = data.hqs || { total: 0, read: 0, emAndamento: 0, naoLidas: 0 };
        const livros = data.livros || { total: 0, read: 0, emAndamento: 0, naoLidos: 0 };
        
        // Calculate age and birthday countdown
        const birthdayInfo = this.calculateAgeAndBirthdayCountdown('2006-11-12');
        
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
        content += `Desvio Padrão: ${this.calculateStandardDeviation([hqs.read, hqs.emAndamento, hqs.naoLidas]).toFixed(2)}\n\n`;
        
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
        content += `Desvio Padrão: ${this.calculateStandardDeviation([livros.read, livros.emAndamento, livros.naoLidos]).toFixed(2)}\n\n`;
        
        // 3. Títulos da biblioteca
        content += `📖 TÍTULOS DA BIBLIOTECA\n\n`;
        
        // HQs da biblioteca
        hqsBiblioteca.forEach(item => {
            content += `${item.tipo === 'hq' ? 'HQ' : 'Livro'}: ${item.nome} — ${this.formatStatus(item.status)}\n`;
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
            content += `${item.tipo === 'hq' ? 'HQ' : 'Livro'}: ${item.nome} — ${this.formatStatus(item.status)}\n`;
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
        const colecoes = this.identificarColecoes(carrinhoData);
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
    formatStatus(status) {
        const statusMap = {
            'lido': 'Lido',
            'emAndamento': 'Em Andamento',
            'naoLido': 'Não Lido'
        };
        return statusMap[status] || status;
    }

    // Helper function to identify collections (items added in batch)
    identificarColecoes(carrinhoData) {
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

    // Calculate standard deviation
    calculateStandardDeviation(values) {
        if (values.length === 0) return 0;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squareDiffs = values.map(value => Math.pow(value - mean, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(avgSquareDiff);
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
