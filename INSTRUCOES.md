# 📋 Instruções para Converter seus Dados

## Passo a Passo Rápido

### 1. Preparar o arquivo CSV
Certifique-se de que seu arquivo CSV tem as colunas:
- `PERIODO` (data no formato DD/MM/YYYY)
- `COTA` (nível do rio em metros)
- `VARIACAO` (variação em centímetros)

### 2. Converter para JSON
```bash
# No terminal, dentro da pasta do projeto:
python3 scripts/csv_to_json.py caminho/para/seus_dados.csv
```

### 3. Testar o site
```bash
# Iniciar servidor local
python3 -m http.server 8000

# Abrir no navegador: http://localhost:8000
```

## Exemplo de Conversão

Se você tem um arquivo `dados_rio_negro.csv`:
```csv
PERIODO,COTA,VARIACAO
01/01/2000,19.15,15
02/01/2000,19.31,16
03/01/2000,19.47,16
```

Execute:
```bash
python3 scripts/csv_to_json.py dados_rio_negro.csv
```

O script irá criar `data/rio-negro-data.json` automaticamente!

## Gráficos Incluídos

✅ **Comparação Anual**: Sobreposição de anos (2019-2025) - igual ao seu gráfico matplotlib  
✅ **Tendências**: Nível do rio com médias móveis de 6M, 1A e 2A - igual ao seu segundo gráfico  

## Funcionalidades

- 🔍 **Zoom interativo** nos gráficos
- 📅 **Filtros por ano** e período
- 📊 **Estatísticas automáticas** (máximo, mínimo, atual)
- 📱 **Responsivo** para mobile
- 🎨 **Tooltips informativos** em português

## Problemas Comuns

**Erro ao carregar dados?**
- Verifique se o arquivo JSON foi criado em `data/rio-negro-data.json`
- Confirme que as datas estão no formato correto

**Gráficos não aparecem?**
- Abra o console do navegador (F12) para ver erros
- Certifique-se de que está usando um servidor HTTP (não file://)

**Dados incorretos?**
- Verifique se as colunas do CSV estão nomeadas corretamente
- Confirme que os valores numéricos usam vírgula ou ponto decimal 