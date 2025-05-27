# 🌊 Monitoramento do Nível do Rio Negro

Um site estático moderno e interativo para visualizar dados históricos do nível do Rio Negro desde 2000.

## 🚀 Características

- **Gráficos Interativos**: Visualizações dinâmicas com Chart.js
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Filtros Avançados**: Filtre por ano, período ou use zoom nos gráficos
- **Tooltips Informativos**: Passe o mouse sobre os gráficos para ver detalhes
- **Estatísticas em Tempo Real**: Cards com métricas importantes
- **Design Moderno**: Interface limpa com tema aquático

## 📊 Funcionalidades

### Gráficos Disponíveis
1. **Comparação de Níveis por Ano (2019-2025)**: Sobreposição de anos para comparação sazonal
2. **Nível do Rio e Médias Móveis**: Histórico completo com médias móveis de 6M, 1A e 2A

### Filtros e Controles
- Filtro por ano específico
- Filtros por período (último mês, 3 meses, 6 meses, ano)
- Zoom interativo nos gráficos
- Reset de zoom

### Estatísticas
- Nível atual do rio
- Variação mais recente
- Máximo histórico
- Mínimo histórico

## 🛠️ Estrutura do Projeto

```
nivel-rio-negro/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Lógica JavaScript
├── data/
│   └── rio-negro-sample.json  # Exemplo de estrutura de dados
├── README.md           # Este arquivo
└── LICENSE            # Licença do projeto
```

## 📝 Formato dos Dados

Os dados devem estar em formato JSON com a seguinte estrutura:

```json
[
  {
    "data": "2024-01-01",
    "nivel_rio": 18.5,
    "encheu_vazou": 2.3
  },
  {
    "data": "2024-01-02",
    "nivel_rio": 18.7,
    "encheu_vazou": 2.0
  }
]
```

### Campos Obrigatórios:
- `data`: Data no formato YYYY-MM-DD
- `nivel_rio`: Nível do rio em metros (número decimal)
- `encheu_vazou`: Variação em centímetros (positivo = subiu, negativo = desceu)

## 🚀 Como Usar

### 1. Converter seus Dados CSV

Se você tem dados no formato CSV com colunas `PERIODO`, `COTA`, `VARIACAO`, use o script de conversão:

```bash
# Instalar dependências
pip install pandas

# Converter CSV para JSON
python3 scripts/csv_to_json.py seus_dados.csv
```

O script irá:
- Ler seu arquivo CSV
- Converter datas para formato YYYY-MM-DD
- Converter valores numéricos (substituindo vírgulas por pontos)
- Salvar como `data/rio-negro-data.json`

### 2. Formato dos Dados CSV Esperado

```csv
PERIODO,COTA,VARIACAO
01/01/2000,19.15,15
02/01/2000,19.31,16
03/01/2000,19.47,16
```

### 3. Dados já Configurados

O site já está configurado para carregar automaticamente o arquivo `data/rio-negro-data.json`. Após converter seus dados, o site funcionará automaticamente!

### 3. Testar Localmente

Abra o arquivo `index.html` em um navegador web moderno.

### 4. Deploy no GitHub Pages

1. Faça commit de todos os arquivos no seu repositório
2. Vá em Settings > Pages no seu repositório GitHub
3. Selecione "Deploy from a branch"
4. Escolha "main" branch e "/ (root)"
5. Clique em "Save"

Seu site estará disponível em: `https://seu-usuario.github.io/nivel-rio-negro`

## 🔧 Personalização

### Cores e Tema
Edite as variáveis CSS em `styles.css`:

```css
:root {
    --primary-blue: #1e40af;
    --secondary-blue: #3b82f6;
    /* ... outras cores */
}
```

### Configurações dos Gráficos
Modifique as opções do Chart.js em `script.js`:

```javascript
// Exemplo: alterar altura dos gráficos
.chart-wrapper {
    height: 500px; /* Altere conforme necessário */
}
```

## 📱 Compatibilidade

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar problemas ou tiver dúvidas:

1. Verifique se seus dados estão no formato correto
2. Abra o console do navegador (F12) para ver erros
3. Consulte a documentação do Chart.js para customizações avançadas

## 🔍 Funcionalidades Avançadas

### Exportar Dados
No console do navegador, você pode usar:
```javascript
riverApp.exportData(); // Baixa os dados atuais em JSON
```

### Carregar Novos Dados
```javascript
riverApp.loadRealData('caminho/para/novos-dados.json');
```

### Debug
```javascript
console.log(riverApp.riverData()); // Ver todos os dados
console.log(riverApp.filteredData()); // Ver dados filtrados
```

## 🎯 Próximas Melhorias

- [ ] Previsão de tendências
- [ ] Alertas de níveis críticos
- [ ] Comparação entre anos
- [ ] Exportação de gráficos como imagem
- [ ] API para atualização automática de dados
- [ ] Modo escuro/claro

---

Desenvolvido com ❤️ para o monitoramento do Rio Negro 