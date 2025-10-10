#!/usr/bin/env python3
"""
Script per convertire file Excel in JSON per l'importazione in Firestore
Uso: python import_excel.py input.xlsx output.json
"""

import pandas as pd
import json
import sys
import os

def converti_excel_a_json(file_excel, file_json):
    """Converte un file Excel in JSON per l'importazione Firestore"""
    
    try:
        # Leggi il file Excel
        print(f"📊 Leggendo {file_excel}...")
        df = pd.read_excel(file_excel)
        
        print(f"📋 Trovate {len(df)} righe")
        print(f"📝 Colonne: {list(df.columns)}")
        
        # Mappa i campi
        mappatura = {
            'Struttura': ['Struttura', 'Nome', 'Nome Struttura'],
            'Luogo': ['Luogo', 'Città', 'Città'],
            'Prov': ['Prov', 'Provincia'],
            'Casa': ['Casa', 'Ha Casa'],
            'Terreno': ['Terreno', 'Ha Terreno'],
            'Referente': ['Referente', 'Contatto', 'Responsabile'],
            'Contatto': ['Contatto', 'Telefono', 'Tel'],
            'Email': ['Email', 'E-mail', 'Mail'],
            'Info': ['Info', 'Informazioni', 'Note', 'Descrizione'],
            'Indirizzo': ['Indirizzo', 'Via'],
            'Cap': ['Cap', 'CAP'],
            'Coordinate': ['Coordinate', 'GPS'],
            'Capacita': ['Capacità', 'Posti'],
            'Servizi': ['Servizi', 'Disponibilità']
        }
        
        # Converti i dati
        dati_convertiti = []
        
        for index, row in df.iterrows():
            record = {}
            
            for campo_app, nomi_excel in mappatura.items():
                valore = None
                
                # Cerca il valore nelle colonne possibili
                for nome_col in nomi_excel:
                    if nome_col in df.columns and pd.notna(row[nome_col]):
                        valore = row[nome_col]
                        break
                
                # Conversione speciale per boolean
                if campo_app in ['Casa', 'Terreno'] and valore is not None:
                    if isinstance(valore, str):
                        valore = valore.lower().strip() in ['sì', 'si', 'yes', 'true', '1', 'x']
                    else:
                        valore = bool(valore)
                
                record[campo_app] = valore if valore is not None else ''
            
            dati_convertiti.append(record)
        
        # Salva in JSON
        with open(file_json, 'w', encoding='utf-8') as f:
            json.dump(dati_convertiti, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Convertito in {file_json}")
        print(f"📊 {len(dati_convertiti)} record convertiti")
        
        # Mostra anteprima
        print("\n📋 Anteprima primi 3 record:")
        for i, record in enumerate(dati_convertiti[:3]):
            print(f"{i+1}. {record.get('Struttura', 'N/A')} - {record.get('Luogo', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Errore: {e}")
        return False

def main():
    if len(sys.argv) != 3:
        print("Uso: python import_excel.py input.xlsx output.json")
        sys.exit(1)
    
    file_excel = sys.argv[1]
    file_json = sys.argv[2]
    
    if not os.path.exists(file_excel):
        print(f"❌ File {file_excel} non trovato")
        sys.exit(1)
    
    if converti_excel_a_json(file_excel, file_json):
        print(f"\n🎉 Conversione completata!")
        print(f"📁 File JSON creato: {file_json}")
        print(f"📤 Ora puoi importare questo file nell'app")
    else:
        print("❌ Conversione fallita")
        sys.exit(1)

if __name__ == "__main__":
    main()
