# 📧 Configuração da Newsletter - Rio Negro

## 🔐 Configurar GitHub Secrets

Para ativar a newsletter, você precisa configurar os seguintes secrets no GitHub:

### 1. Acessar Configurações
1. Vá para `Settings` do repositório
2. Clique em `Secrets and variables` → `Actions`
3. Clique em `New repository secret`

### 2. Secrets Necessários

#### `NEWSLETTER_EMAILS`
- **Valor inicial:** `[]` (lista vazia)
- **Descrição:** Lista JSON com emails dos inscritos
- **Exemplo:**
```json
[
  {
    "email": "usuario@email.com",
    "data_cadastro": "2025-01-29T20:45:00Z",
    "ativo": true,
    "origem": "website"
  }
]
```

#### `GMAIL_USER`
- **Valor:** Seu email do Gmail (ex: `seuemail@gmail.com`)
- **Descrição:** Email que enviará as newsletters

#### `GMAIL_PASSWORD`
- **Valor:** Senha de app do Gmail (NÃO a senha normal!)
- **Como gerar:**
  1. Ative a verificação em 2 etapas no Gmail
  2. Vá em `Gerenciar sua Conta Google` → `Segurança`
  3. Em `Verificação em duas etapas`, clique em `Senhas de app`
  4. Gere uma senha para "Email"
  5. Use essa senha de 16 caracteres

## 🚀 Como Funciona

### Fluxo Automático
1. **Usuário cadastra email** no site
2. **JavaScript dispara** GitHub Actions
3. **Email é adicionado** aos secrets (criptografado)
4. **Todo dia às 8h** (5h horário de Manaus):
   - Actions gera gráfico atualizado
   - Envia email para todos os inscritos
   - Atualiza contador público

### Segurança
- ✅ **Emails ficam criptografados** nos GitHub Secrets
- ✅ **Não aparecem no código público**
- ✅ **Só você tem acesso** via configurações do repo
- ✅ **Histórico de envios** nos logs do Actions

## 📊 Monitoramento

### Ver Logs
- Vá em `Actions` no GitHub
- Clique no workflow `Newsletter Rio Negro`
- Veja logs de execução e estatísticas

### Contador Público
- Arquivo `data/newsletter-emails.json` mostra apenas:
  - Total de inscritos ativos
  - Data da última atualização
  - Status do sistema

## 🛠️ Comandos Úteis

### Executar Newsletter Manualmente
1. Vá em `Actions` → `Newsletter Rio Negro`
2. Clique em `Run workflow`
3. Confirme execução

### Adicionar Email Manualmente
Edite o secret `NEWSLETTER_EMAILS` e adicione:
```json
{
  "email": "novo@email.com",
  "data_cadastro": "2025-01-29T20:45:00Z",
  "ativo": true,
  "origem": "manual"
}
```

### Desativar Email
Mude `"ativo": true` para `"ativo": false` no secret.

## 🎯 Exemplo de Email Enviado

**Assunto:** 🌊 Rio Negro 29/01/2025 - 28.45m (Enchendo)

**Conteúdo:**
- Header azul com título e data
- Estatísticas: Nível atual, variação 7 dias, situação
- Gráfico dos últimos 30 dias (PNG embutido)
- Footer com link para o site
- Opção de cancelamento

## 🔧 Troubleshooting

### Newsletter não está enviando
1. Verifique se os 3 secrets estão configurados
2. Confirme que a senha do Gmail é de app (não a normal)
3. Veja logs em `Actions` para erros específicos

### Emails não estão sendo salvos
1. Verifique se `NEWSLETTER_EMAILS` existe (mesmo que vazio: `[]`)
2. Confirme permissões do repositório
3. Teste execução manual do workflow

### Contador não atualiza
1. Verifique se o arquivo `data/newsletter-emails.json` existe
2. Confirme que o workflow tem permissão de commit
3. Veja se há erros nos logs do Actions

## 📈 Escalabilidade

- **Gratuito até:** 2.000 minutos/mês de Actions (suficiente para 1000+ emails/dia)
- **Gmail limits:** 500 emails/dia (upgrade para Google Workspace se precisar mais)
- **Storage:** Ilimitado para secrets (GitHub Pro/Student)

## 🎓 Próximos Passos

1. Configure os 3 secrets
2. Teste enviando seu próprio email
3. Execute workflow manualmente para testar
4. Monitore logs por alguns dias
5. Divulgue a newsletter! 🚀 