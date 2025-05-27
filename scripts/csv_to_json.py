#!/usr/bin/env python3
"""
Script simples para converter CSV do Rio Negro para JSON
Baseado no formato: PERIODO; COTA; VARIACAO
"""

import pandas as pd
import json
import sys
from datetime import datetime

def convert_csv_to_json(csv_file, output_file='data/rio-negro-data.json'):
    """
    Converte CSV com colunas PERIODO, COTA, VARIACAO para JSON
    """
    try:
        # Ler CSV com separador ponto e vírgula
        print(f"Carregando {csv_file}...")
        df = pd.read_csv(csv_file, sep=';', decimal=',')
        
        # Verificar colunas
        print(f"Colunas encontradas: {list(df.columns)}")
        print(f"Total de linhas: {len(df)}")
        
        # Renomear colunas se necessário
        if 'PERIODO' in df.columns:
            df = df.rename(columns={'PERIODO': 'data'})
        if 'COTA' in df.columns:
            df = df.rename(columns={'COTA': 'nivel_rio'})
        if 'VARIACAO' in df.columns:
            df = df.rename(columns={'VARIACAO': 'encheu_vazou'})
            
        # Converter data para formato YYYY-MM-DD
        print("Convertendo datas...")
        df['data'] = pd.to_datetime(df['data'], dayfirst=True, errors='coerce')
        df['data'] = df['data'].dt.strftime('%Y-%m-%d')
        
        # Converter valores numéricos (já lidos com decimal=',')
        print("Convertendo valores numéricos...")
        df['nivel_rio'] = pd.to_numeric(df['nivel_rio'], errors='coerce')
        df['encheu_vazou'] = pd.to_numeric(df['encheu_vazou'], errors='coerce')
        
        # Remover linhas com dados inválidos
        linhas_antes = len(df)
        df = df.dropna()
        linhas_depois = len(df)
        
        if linhas_antes != linhas_depois:
            print(f"⚠️  Removidas {linhas_antes - linhas_depois} linhas com dados inválidos")
        
        # Ordenar por data
        df = df.sort_values('data')
        
        # Converter para lista de dicionários
        print("Gerando JSON...")
        data = []
        for _, row in df.iterrows():
            data.append({
                "data": row['data'],
                "nivel_rio": round(float(row['nivel_rio']), 2),
                "encheu_vazou": round(float(row['encheu_vazou']), 1)
            })
        
        # Salvar JSON
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Conversão concluída!")
        print(f"📊 Total de registros: {len(data)}")
        print(f"📅 Período: {data[0]['data']} até {data[-1]['data']}")
        print(f"💾 Arquivo salvo: {output_file}")
        
        # Mostrar amostra
        print(f"\n📋 Primeiros 5 registros:")
        for i, item in enumerate(data[:5]):
            print(f"  {i+1}. {item}")
            
        print(f"\n📋 Últimos 3 registros:")
        for i, item in enumerate(data[-3:], len(data)-2):
            print(f"  {i}. {item}")
            
        return True
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python csv_to_json.py arquivo.csv")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    convert_csv_to_json(csv_file) 