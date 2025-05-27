# 🌊 Monitoramento do Nível do Rio Negro

[![Deploy to GitHub Pages](https://github.com/davidscamurca/nivel-rio-negro/actions/workflows/deploy.yml/badge.svg)](https://github.com/davidscamurca/nivel-rio-negro/actions/workflows/deploy.yml)

Sistema web interativo para visualizar dados históricos do nível do Rio Negro desde 2000.

🔗 **[Ver Site](https://davidscamurca.github.io/nivel-rio-negro)**

## ✨ Características

- **Gráficos Interativos**: Visualizações com Plotly.js
- **Comparação Anual**: Sobreposição de anos (2019-2025) para análise sazonal
- **Médias Móveis**: Tendências de 6 meses, 1 ano e 2 anos
- **Estatísticas**: Nível atual, máximo/mínimo histórico, variação 7 dias
- **Situação do Rio**: Enchendo, vazando ou parado (baseado em média de 3 dias)
- **Responsivo**: Funciona em desktop, tablet e mobile

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6
- **Gráficos**: Plotly.js
- **Deploy**: GitHub Pages
- **Dados**: JSON (46k+ registros históricos)

## 📊 Fonte dos Dados

Dados obtidos do [Porto de Manaus](https://portodemanaus.com.br/nivel-do-rio-negro/) - período de 2000 a 2025.

## 🚀 Desenvolvimento Local

```bash
# Clone o repositório
git clone https://github.com/davidscamurca/nivel-rio-negro.git
cd nivel-rio-negro

# Inicie um servidor local
python3 -m http.server 8000

# Acesse http://localhost:8000
```

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

Desenvolvido por **Bemol** com ❤️ para monitoramento ambiental 