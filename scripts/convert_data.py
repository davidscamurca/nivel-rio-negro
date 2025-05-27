#!/usr/bin/env python3
"""
Script para converter dados de planilha (Excel/CSV) para JSON
para o site de monitoramento do Rio Negro.

Uso:
    python convert_data.py planilha.xlsx
    python convert_data.py dados.csv

Formato esperado da planilha:
- Coluna 1: Data (formato: DD/MM/YYYY ou YYYY-MM-DD)
- Coluna 2: Nível do Rio (em metros)
- Coluna 3: Encheu/Vazou (em centímetros)

Ou com cabeçalhos:
- data, nivel_rio, encheu_vazou
"""

import pandas as pd
import json
import sys
import os
from datetime import datetime
import argparse

def convert_date(date_str):
    """Converte diferentes formatos de data para YYYY-MM-DD"""
    if pd.isna(date_str):
        return None
    
    # Se já é um objeto datetime
    if isinstance(date_str, datetime):
        return date_str.strftime('%Y-%m-%d')
    
    # Tentar diferentes formatos
    formats = ['%d/%m/%Y', '%Y-%m-%d', '%d-%m-%Y', '%m/%d/%Y']
    
    for fmt in formats:
        try:
            date_obj = datetime.strptime(str(date_str), fmt)
            return date_obj.strftime('%Y-%m-%d')
        except ValueError:
            continue
    
    print(f"Aviso: Não foi possível converter a data: {date_str}")
    return None

def clean_numeric(value):
    """Limpa e converte valores numéricos"""
    if pd.isna(value):
        return 0.0
    
    # Remover vírgulas e converter para float
    if isinstance(value, str):
        value = value.replace(',', '.')
    
    try:
        return float(value)
    except (ValueError, TypeError):
        print(f"Aviso: Não foi possível converter o valor numérico: {value}")
        return 0.0

def load_data(file_path):
    """Carrega dados de Excel ou CSV"""
    file_ext = os.path.splitext(file_path)[1].lower()
    
    try:
        if file_ext in ['.xlsx', '.xls']:
            df = pd.read_excel(file_path)
        elif file_ext == '.csv':
            # Tentar diferentes separadores
            try:
                df = pd.read_csv(file_path, sep=',')
            except:
                try:
                    df = pd.read_csv(file_path, sep=';')
                except:
                    df = pd.read_csv(file_path, sep='\t')
        else:
            raise ValueError(f"Formato de arquivo não suportado: {file_ext}")
        
        return df
    except Exception as e:
        print(f"Erro ao carregar arquivo: {e}")
        return None

def process_dataframe(df):
    """Processa o DataFrame e converte para o formato necessário"""
    # Detectar colunas automaticamente
    columns = df.columns.tolist()
    
    # Mapear colunas baseado no nome ou posição
    date_col = None
    level_col = None
    variation_col = None
    
    # Tentar encontrar colunas por nome
    for col in columns:
        col_lower = str(col).lower()
        if any(word in col_lower for word in ['data', 'date', 'dia']):
            date_col = col
        elif any(word in col_lower for word in ['nivel', 'level', 'rio', 'altura']):
            level_col = col
        elif any(word in col_lower for word in ['encheu', 'vazou', 'variacao', 'variation', 'mudanca']):
            variation_col = col
    
    # Se não encontrou por nome, usar posição
    if not date_col and len(columns) >= 1:
        date_col = columns[0]
    if not level_col and len(columns) >= 2:
        level_col = columns[1]
    if not variation_col and len(columns) >= 3:
        variation_col = columns[2]
    
    print(f"Usando colunas:")
    print(f"  Data: {date_col}")
    print(f"  Nível: {level_col}")
    print(f"  Variação: {variation_col}")
    
    # Processar dados
    data = []
    for index, row in df.iterrows():
        try:
            date_str = convert_date(row[date_col])
            if not date_str:
                continue
            
            level = clean_numeric(row[level_col]) if level_col else 0.0
            variation = clean_numeric(row[variation_col]) if variation_col else 0.0
            
            data.append({
                "data": date_str,
                "nivel_rio": round(level, 1),
                "encheu_vazou": round(variation, 1)
            })
        except Exception as e:
            print(f"Erro na linha {index + 1}: {e}")
            continue
    
    # Ordenar por data
    data.sort(key=lambda x: x['data'])
    
    return data

def save_json(data, output_path):
    """Salva dados em formato JSON"""
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Dados salvos em: {output_path}")
        return True
    except Exception as e:
        print(f"Erro ao salvar arquivo: {e}")
        return False

def validate_data(data):
    """Valida os dados convertidos"""
    if not data:
        print("Erro: Nenhum dado foi convertido!")
        return False
    
    print(f"\nResumo dos dados:")
    print(f"  Total de registros: {len(data)}")
    print(f"  Período: {data[0]['data']} até {data[-1]['data']}")
    
    # Verificar dados faltantes
    missing_dates = sum(1 for item in data if not item['data'])
    missing_levels = sum(1 for item in data if item['nivel_rio'] == 0.0)
    
    if missing_dates > 0:
        print(f"  Aviso: {missing_dates} registros com datas inválidas")
    if missing_levels > 0:
        print(f"  Aviso: {missing_levels} registros com nível zero")
    
    # Mostrar amostra
    print(f"\nPrimeiros 3 registros:")
    for i, item in enumerate(data[:3]):
        print(f"  {i+1}. {item}")
    
    return True

def main():
    parser = argparse.ArgumentParser(description='Converter dados de planilha para JSON')
    parser.add_argument('input_file', help='Arquivo de entrada (Excel ou CSV)')
    parser.add_argument('-o', '--output', help='Arquivo de saída (padrão: rio-negro-data.json)')
    parser.add_argument('--preview', action='store_true', help='Apenas visualizar os dados sem salvar')
    
    args = parser.parse_args()
    
    input_file = args.input_file
    output_file = args.output or 'rio-negro-data.json'
    
    # Verificar se arquivo existe
    if not os.path.exists(input_file):
        print(f"Erro: Arquivo não encontrado: {input_file}")
        return 1
    
    print(f"Carregando dados de: {input_file}")
    
    # Carregar dados
    df = load_data(input_file)
    if df is None:
        return 1
    
    print(f"Arquivo carregado com {len(df)} linhas e {len(df.columns)} colunas")
    
    # Processar dados
    data = process_dataframe(df)
    
    # Validar dados
    if not validate_data(data):
        return 1
    
    # Salvar ou apenas visualizar
    if args.preview:
        print("\nModo preview - dados não foram salvos")
        print("Use sem --preview para salvar o arquivo")
    else:
        if save_json(data, output_file):
            print(f"\n✅ Conversão concluída com sucesso!")
            print(f"Arquivo salvo: {output_file}")
            print(f"Para usar no site, copie o arquivo para a pasta 'data/' do projeto")
        else:
            return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 