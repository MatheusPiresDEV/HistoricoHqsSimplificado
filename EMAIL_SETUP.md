# Configuração do EmailJS - Dashboard de Leitura

## Passos para configurar o envio de e-mails:

### 1. Criar conta no EmailJS
- Acesse: https://www.emailjs.com/
- Crie uma conta gratuita

### 2. Configurar o serviço de e-mail
- No painel do EmailJS, clique em "Email Services"
- Clique em "Add New Service"
- Escolha "Gmail" ou outro serviço desejado
- Siga as instruções para conectar sua conta de e-mail
- Copie o **Service ID** gerado

### 3. Criar o template de e-mail
- Vá para "Email Templates"
- Clique em "Create New Template"
- Configure o template com:
  - **To email**: `{{to_email}}`
  - **Subject**: `{{subject}}`
  - **Message**: `{{message}}`
- Salve o template e copie o **Template ID**

### 4. Obter a Public Key
- Vá para "Account" → "General"
- Copie a **Public Key**

### 5. Atualizar o arquivo emailService.js
Todas as configurações foram aplicadas com sucesso:
```javascript
const EMAIL_CONFIG = {
    service_id: 'service_l9pr7ee', // ✅ Configurado
    template_id: 'template_s9nortx', // ✅ Configurado
    public_key: 'H1o6cMMb_pNd88i_2', // ✅ Configurado
    destination_email: 'matheusgustavodasilvapires@gmail.com'
};
```

## Testando a funcionalidade

1. Abra o dashboard no navegador
2. Clique em "Enviar por E-mail"
3. Digite a senha: `mathe0us`
4. Confirme o envio

## Recursos adicionais

- **Baixar relatório**: Use o botão "Baixar Relatório" para salvar localmente
- **Segurança**: A senha é validada localmente e não é armazenada
- **Gráficos**: Os gráficos são capturados automaticamente como imagens

## Solução de problemas

- Verifique se os gráficos estão visíveis antes de enviar
- Certifique-se de ter dados no localStorage
- Verifique a conexão com a internet
- Confirme as credenciais do EmailJS
