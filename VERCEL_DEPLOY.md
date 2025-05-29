# 🚀 Deploy no Vercel - Newsletter Automática

## 📋 **Pré-requisitos**
- ✅ Conta no Vercel (já logado com GitHub)
- ✅ Repositório no GitHub
- ✅ Gmail com senha de app configurada

## 🎯 **Passo a Passo**

### 1. **Deploy no Vercel**
1. Acesse: https://vercel.com/dashboard
2. Clique em **"New Project"**
3. Selecione o repositório `nivel-rio-negro`
4. Clique em **"Deploy"**

### 2. **Configurar Banco de Dados KV**
1. No dashboard do projeto, vá em **"Storage"**
2. Clique em **"Create Database"**
3. Selecione **"KV"** (Redis)
4. Nome: `newsletter-db`
5. Clique em **"Create"**

### 3. **Configurar Variáveis de Ambiente**
No dashboard do projeto, vá em **"Settings" → "Environment Variables"**:

```bash
# API Token (gere um token aleatório)
NEWSLETTER_API_TOKEN=seu_token_super_secreto_aqui

# URL do projeto (será algo como)
VERCEL_API_URL=https://nivel-rio-negro.vercel.app
```

### 4. **Configurar GitHub Secrets**
Vá em: https://github.com/SEU_USUARIO/nivel-rio-negro/settings/secrets/actions

Adicione/atualize:
```bash
# Existentes (manter)
GMAIL_USER=seu-email@gmail.com
GMAIL_PASSWORD=sua_senha_de_app_16_caracteres

# Novos
VERCEL_API_URL=https://nivel-rio-negro.vercel.app
NEWSLETTER_API_TOKEN=mesmo_token_do_vercel
```

### 5. **Testar o Sistema**

#### Teste 1: Formulário
1. Acesse: https://nivel-rio-negro.vercel.app
2. Cadastre um email no formulário
3. Deve aparecer "Email cadastrado com sucesso!"

#### Teste 2: API
```bash
# Verificar contador
curl https://nivel-rio-negro.vercel.app/api/newsletter

# Deve retornar algo como:
# {"total_subscribers":1,"status":"active","last_updated":"2025-05-29T..."}
```

#### Teste 3: Newsletter
1. Vá em: https://github.com/SEU_USUARIO/nivel-rio-negro/actions
2. Clique no workflow **"Newsletter Rio Negro"**
3. Clique em **"Run workflow"**
4. Aguarde execução
5. Verifique se recebeu o email

## 🎉 **Pronto!**

Agora o sistema está **100% automático**:
- ✅ **Formulário funcional** - pessoas podem se cadastrar
- ✅ **Emails salvos** no banco KV do Vercel
- ✅ **Newsletter diária** às 8h UTC (5h Manaus)
- ✅ **Gráficos automáticos** nos emails
- ✅ **Contador atualizado** na interface

## 🔧 **Solução de Problemas**

### Erro: "Email inválido"
- Verifique se o email tem formato correto

### Erro: "Não autorizado" na API
- Verifique se `NEWSLETTER_API_TOKEN` está igual no Vercel e GitHub

### Newsletter não chega
- Verifique se `GMAIL_USER` e `GMAIL_PASSWORD` estão corretos
- Confirme que a senha é de **app** (16 caracteres), não a senha normal

### Contador não atualiza
- Aguarde alguns minutos para propagação
- Verifique se o banco KV está conectado

## 📞 **Suporte**
Se algo não funcionar, verifique:
1. **Logs do Vercel**: Dashboard → Functions → Logs
2. **Logs do GitHub**: Actions → Workflow → Logs
3. **Console do navegador**: F12 → Console 