# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2025-05-27

### ✨ Adicionado
- **Gráficos Interativos**: Implementação completa com Plotly.js
  - Gráfico de comparação anual (2019-2025) com replicação exata do Python
  - Gráfico de médias móveis (6M, 1A, 2A) com remoção de outliers por IQR
- **Destaque do Dia Atual**: Linha vertical e pontos destacados mostrando o dia atual vs mesmo período em anos anteriores
- **Interface Moderna**: Design responsivo com tema profissional
- **Estatísticas em Tempo Real**: Cards com métricas importantes (nível atual, tendência, máx/mín, etc.)
- **Deploy Automático**: Workflow do GitHub Actions para deploy no GitHub Pages
- **Dados Reais**: Carregamento de 46k+ registros históricos do Rio Negro

### 🔧 Técnico
- **Migração Chart.js → Plotly.js**: Simplificação significativa do código (400+ → 150 linhas)
- **Remoção de Outliers**: Implementação do método IQR idêntico ao Python
- **Deduplicação de Dados**: Para gráfico anual, mantém último registro por dia-mês
- **Modularização**: Separação de utilitários em `js/utils.js`
- **Linting**: Configuração completa do ESLint com correção automática
- **Formatação**: Prettier configurado para consistência de código

### 🎨 Interface
- **Cores Exatas**: Replicação das cores do matplotlib Python
- **Legendas Horizontais**: Posicionamento otimizado para não sobrepor gráficos
- **Dimensões Otimizadas**: Gráficos com 1100px de largura para melhor visualização
- **Tooltips Informativos**: Informações detalhadas ao passar o mouse
- **Responsividade**: Adaptação para desktop, tablet e mobile

### 📊 Funcionalidades dos Gráficos
- **Eixos Automáticos**: Formatação automática de datas e labels dia-mês
- **Estilos de Linha**: Diferentes estilos (sólido, tracejado, pontilhado) para médias móveis
- **Espessura Dinâmica**: Linhas mais grossas para anos mais relevantes
- **Zoom Interativo**: Capacidade de zoom e pan nos gráficos
- **Anotações**: Indicação visual do dia atual com seta e texto

### 🔄 Processamento de Dados
- **Formato JSON**: Carregamento otimizado de dados estruturados
- **Ordenação Temporal**: Dados organizados cronologicamente
- **Validação**: Verificação de integridade dos dados carregados
- **Performance**: Processamento eficiente de grandes volumes de dados

### 📱 Compatibilidade
- ✅ Chrome 60+
- ✅ Firefox 55+  
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Navegadores móveis

### 🚀 Deploy
- **GitHub Pages**: Deploy automático via GitHub Actions
- **Domínio Personalizado**: Suporte para domínios customizados
- **HTTPS**: Certificado SSL automático
- **CDN**: Distribuição global via GitHub

---

## Próximas Versões Planejadas

### [0.1.0] - Planejado
- [ ] Previsão de tendências com machine learning
- [ ] Alertas de níveis críticos
- [ ] Modo escuro/claro
- [ ] Exportação de gráficos como imagem

### [0.2.0] - Planejado  
- [ ] API para atualização automática de dados
- [ ] Comparação entre múltiplos rios
- [ ] Histórico de eventos climáticos
- [ ] Dashboard administrativo

---

**Legenda:**
- ✨ Adicionado: Novas funcionalidades
- 🔧 Técnico: Melhorias técnicas e refatorações
- 🎨 Interface: Melhorias de design e UX
- 📊 Funcionalidades: Recursos específicos dos gráficos
- 🔄 Processamento: Melhorias no processamento de dados
- 📱 Compatibilidade: Suporte a navegadores e dispositivos
- 🚀 Deploy: Melhorias de deployment e infraestrutura 