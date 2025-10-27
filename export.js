// Export functionality for QuoVadiScout
// Excel and PDF export with advanced options

// === Excel Export Functions ===
function esportaExcel(strutture, options = {}) {
  try {
    const {
      layout = 'completo',
      includeImages = false,
      includeNotes = false,
      includePersonalNotes = false,
      onlyPersonalList = false
    } = options;

    // Prepara i dati per l'export
    let dataToExport = strutture;
    
    if (onlyPersonalList && window.elencoPersonale) {
      dataToExport = strutture.filter(s => window.elencoPersonale.includes(s.id));
    }

    // Crea workbook
    const wb = XLSX.utils.book_new();
    
    if (layout === 'completo') {
      // Layout completo con tutti i campi
      const ws = createCompleteWorksheet(dataToExport, includeImages, includeNotes, includePersonalNotes);
      XLSX.utils.book_append_sheet(wb, ws, 'Strutture');
    } else if (layout === 'compatto') {
      // Layout compatto con campi essenziali
      const ws = createCompactWorksheet(dataToExport);
      XLSX.utils.book_append_sheet(wb, ws, 'Strutture');
    } else if (layout === 'contatti') {
      // Solo informazioni di contatto
      const ws = createContactsWorksheet(dataToExport);
      XLSX.utils.book_append_sheet(wb, ws, 'Contatti');
    } else if (layout === 'categorie') {
      // Fogli separati per categoria
      createCategorizedSheets(wb, dataToExport);
    }

    // Genera e scarica il file
    const fileName = `quovadiscout-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    console.log('✅ Export Excel completato');
    return true;
  } catch (error) {
    console.error('❌ Errore export Excel:', error);
    alert('Errore durante l\'export Excel: ' + error.message);
    return false;
  }
}

function createCompleteWorksheet(strutture, includeImages, includeNotes, includePersonalNotes) {
  const headers = [
    'ID', 'Struttura', 'Luogo', 'Provincia', 'Indirizzo', 'Stato',
    'Casa', 'Terreno', 'Letti', 'Cucina', 'Spazi', 'Fuochi', 'Hike',
    'Escursioni', 'Trasporti', 'Branco', 'Reparto', 'Compagnia', 'Gruppo', 'Sezione',
    'Referente', 'Email', 'Sito', 'Contatto', 'II Contatto',
    'A Persona', 'A Giornata', 'A Notte', 'Offerta', 'Forfait', 'Riscaldamento', 'Cucina Costo', 'Altri Costi',
    'Ultimo Controllo', 'Da Chi',
    'Info', 'Note', 'Altre Info', 'Rating', 'Coordinate', 'Immagini', 'Segnalazioni'
  ];

  if (includePersonalNotes) {
    headers.push('Note Personali');
  }

  const data = strutture.map(s => [
    s.id,
    s.Struttura || '',
    s.Luogo || '',
    s.Prov || '',
    s.Indirizzo || '',
    s.stato || 'attiva',
    s.Casa ? 'Sì' : 'No',
    s.Terreno ? 'Sì' : 'No',
    s.Letti || '',
    s.Cucina || '',
    s.Spazi || '',
    s.Fuochi || '',
    s.Hike || '',
    s.Escursioni || '',
    s.Trasporti || '',
    s.Branco ? 'Sì' : 'No',
    s.Reparto ? 'Sì' : 'No',
    s.Compagnia ? 'Sì' : 'No',
    s.Gruppo ? 'Sì' : 'No',
    s.Sezione ? 'Sì' : 'No',
    s.Referente || '',
    s.Email || '',
    s.Sito || '',
    s.Contatto || '',
    s.IIcontatto || '',
    s['A persona'] || '',
    s['A giornata'] || '',
    s['A notte'] || '',
    s.Offerta || '',
    s.Forfait || '',
    s.Riscaldamento || '',
    s.Cucina || '',
    s['Altri costi'] || '',
    s['Ultimo controllo'] || '',
    s['Da chi'] || '',
    s.Info || '',
    s.Note || '',
    s['Altre info'] || '',
    s.rating?.average || 0,
    s.coordinate ? `${s.coordinate.lat}, ${s.coordinate.lng}` : '',
    includeImages ? (s.immagini?.length || 0) : '',
    s.segnalazioni?.length || 0
  ]);

  if (includePersonalNotes) {
    // Aggiungi note personali se richieste
    data.forEach((row, index) => {
      const struttura = strutture[index];
      if (struttura && window.elencoPersonale?.includes(struttura.id)) {
        // Qui dovresti caricare le note personali da Firestore
        row.push('Note personali da implementare');
      } else {
        row.push('');
      }
    });
  }

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
  // Formattazione
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cellAddress]) continue;
    ws[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "E8F5E8" } },
      alignment: { horizontal: "center" }
    };
  }

  // Auto-fit columns
  ws['!cols'] = headers.map(() => ({ wch: 15 }));

  return ws;
}

function createCompactWorksheet(strutture) {
  const headers = [
    'Struttura', 'Luogo', 'Provincia', 'Stato', 'Casa', 'Terreno',
    'Referente', 'Contatto', 'Email', 'Rating'
  ];

  const data = strutture.map(s => [
    s.Struttura || '',
    s.Luogo || '',
    s.Prov || '',
    s.stato || 'attiva',
    s.Casa ? 'Sì' : 'No',
    s.Terreno ? 'Sì' : 'No',
    s.Referente || '',
    s.Contatto || '',
    s.Email || '',
    s.rating?.average || 0
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
  // Formattazione
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cellAddress]) continue;
    ws[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "E8F5E8" } }
    };
  }

  return ws;
}

function createContactsWorksheet(strutture) {
  const headers = [
    'Struttura', 'Referente', 'Email', 'Contatto', 'II Contatto', 'Sito'
  ];

  const data = strutture.map(s => [
    s.Struttura || '',
    s.Referente || '',
    s.Email || '',
    s.Contatto || '',
    s.IIcontatto || '',
    s.Sito || ''
  ]);

  return XLSX.utils.aoa_to_sheet([headers, ...data]);
}

function createCategorizedSheets(wb, strutture) {
  // Casa
  const caseStrutture = strutture.filter(s => s.Casa);
  if (caseStrutture.length > 0) {
    const ws = createCompactWorksheet(caseStrutture);
    XLSX.utils.book_append_sheet(wb, ws, 'Case');
  }

  // Terreni
  const terreniStrutture = strutture.filter(s => s.Terreno);
  if (terreniStrutture.length > 0) {
    const ws = createCompactWorksheet(terreniStrutture);
    XLSX.utils.book_append_sheet(wb, ws, 'Terreni');
  }

  // Per stato
  const stati = ['attiva', 'temporaneamente_non_attiva', 'non_piu_attiva'];
  stati.forEach(stato => {
    const struttureStato = strutture.filter(s => s.stato === stato);
    if (struttureStato.length > 0) {
      const ws = createCompactWorksheet(struttureStato);
      XLSX.utils.book_append_sheet(wb, ws, `Stato ${stato}`);
    }
  });
}

// === PDF Export Functions ===
async function esportaPDF(strutture, options = {}) {
  try {
    const {
      layout = 'completo',
      includeImages = false,
      includeNotes = false,
      includePersonalNotes = false,
      onlyPersonalList = false,
      orientation = 'portrait',
      template = 'default'
    } = options;

    // Prepara i dati per l'export
    let dataToExport = strutture;
    
    if (onlyPersonalList && window.elencoPersonale) {
      dataToExport = strutture.filter(s => window.elencoPersonale.includes(s.id));
    }

    // Carica note personali se richieste
    if (includePersonalNotes && window.utenteCorrente) {
      console.log('📝 Caricamento note personali per export...');
      await loadPersonalNotesForStructures(dataToExport);
      console.log('✅ Note personali caricate');
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF(orientation === 'landscape' ? 'l' : 'p', 'mm', 'a4');

    if (template === 'default') {
      createDefaultPDF(doc, dataToExport, options);
    } else if (template === 'professional') {
      createProfessionalPDF(doc, dataToExport, options);
    } else if (template === 'minimal') {
      createMinimalPDF(doc, dataToExport, options);
    }

    // Genera e scarica il file
    const fileName = `quovadiscout-export-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    console.log('✅ Export PDF completato');
    return true;
  } catch (error) {
    console.error('❌ Errore export PDF:', error);
    alert('Errore durante l\'export PDF: ' + error.message);
    return false;
  }
}

// Funzione per caricare note personali per tutte le strutture
async function loadPersonalNotesForStructures(strutture) {
  if (!window.utenteCorrente) return;
  
  try {
    const { collection, query, where, getDocs } = window.firebase.firestore;
    const db = window.db;
    
    // Carica tutte le note personali dell'utente
    const notesRef = collection(db, "user_notes");
    const q = query(notesRef, where("userId", "==", window.utenteCorrente.uid));
    const snapshot = await getDocs(q);
    
    const noteMap = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!noteMap[data.strutturaId]) {
        noteMap[data.strutturaId] = [];
      }
      noteMap[data.strutturaId].push({
        id: doc.id,
        ...data
      });
    });
    
    // Aggiungi le note alle strutture
    strutture.forEach(struttura => {
      if (noteMap[struttura.id]) {
        struttura.personalNotes = noteMap[struttura.id];
        console.log(`📝 Note trovate per ${struttura.Struttura}:`, struttura.personalNotes.length);
      } else {
        struttura.personalNotes = [];
      }
    });
    
  } catch (error) {
    console.error('Errore nel caricamento note personali:', error);
  }
}

function createDefaultPDF(doc, strutture, options) {
  // Header
  doc.setFontSize(20);
  doc.setTextColor(47, 107, 47); // Verde scout
  doc.text('QuoVadiScout - Strutture & Terreni', 20, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Export generato il: ${new Date().toLocaleDateString('it-IT')}`, 20, 30);
  doc.text(`Totale strutture: ${strutture.length}`, 20, 35);

  let yPosition = 45;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;

  strutture.forEach((struttura, index) => {
    // Controlla se serve una nuova pagina
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    // Titolo struttura
    doc.setFontSize(14);
    doc.setTextColor(47, 107, 47);
    doc.text(struttura.Struttura || 'Struttura senza nome', margin, yPosition);
    yPosition += 8;

    // Informazioni base
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const info = [
      `📍 ${struttura.Luogo || 'N/A'}, ${struttura.Prov || 'N/A'}`,
      `👤 Referente: ${struttura.Referente || 'N/A'}`,
      `📞 Contatto: ${struttura.Contatto || 'N/A'}`,
      `📧 Email: ${struttura.Email || 'N/A'}`
    ];

    info.forEach(line => {
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });

    // Tags
    const tags = [];
    if (struttura.Casa) tags.push('🏠 Casa');
    if (struttura.Terreno) tags.push('🌱 Terreno');
    if (struttura.stato) tags.push(`${getStatoIcon(struttura.stato)} ${getStatoLabel(struttura.stato)}`);

    if (tags.length > 0) {
      doc.text(`Tags: ${tags.join(' | ')}`, margin, yPosition);
      yPosition += 5;
    }

    // Rating
    if (struttura.rating?.average) {
      doc.text(`⭐ Rating: ${struttura.rating.average.toFixed(1)}/5`, margin, yPosition);
      yPosition += 5;
    }

    // Info aggiuntive
    if (struttura.Info) {
      const infoText = doc.splitTextToSize(`Info: ${struttura.Info}`, 170);
      doc.text(infoText, margin, yPosition);
      yPosition += infoText.length * 4;
    }

    // Note personali
    if (options.includePersonalNotes && struttura.personalNotes && struttura.personalNotes.length > 0) {
      console.log(`📝 Aggiungendo ${struttura.personalNotes.length} note per ${struttura.Struttura}`);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('📝 Note personali:', margin, yPosition);
      yPosition += 5;
      
      struttura.personalNotes.forEach(nota => {
        const notaText = doc.splitTextToSize(`• ${nota.nota}`, 160);
        doc.text(notaText, margin + 5, yPosition);
        yPosition += notaText.length * 3.5;
      });
      
      doc.setTextColor(0, 0, 0); // Reset colore
    }

    yPosition += 10; // Spazio tra strutture
  });
}

function createProfessionalPDF(doc, strutture, options) {
  // Header professionale
  doc.setFillColor(47, 107, 47);
  doc.rect(0, 0, doc.internal.pageSize.width, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('QuoVadiScout', 20, 20);
  
  doc.setFontSize(10);
  doc.text('Sistema di Gestione Strutture Scout', 20, 25);

  // Tabella strutture
  const headers = ['Struttura', 'Luogo', 'Stato', 'Contatto', 'Rating'];
  const data = strutture.map(s => [
    s.Struttura || 'N/A',
    `${s.Luogo || 'N/A'}, ${s.Prov || 'N/A'}`,
    s.stato || 'attiva',
    s.Contatto || s.Email || 'N/A',
    s.rating?.average ? s.rating.average.toFixed(1) : 'N/A'
  ]);

  doc.autoTable({
    head: [headers],
    body: data,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [47, 107, 47],
      textColor: [255, 255, 255]
    }
  });
}

function createMinimalPDF(doc, strutture, options) {
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  let yPosition = 20;
  
  strutture.forEach(struttura => {
    doc.text(`${struttura.Struttura || 'N/A'} - ${struttura.Luogo || 'N/A'}, ${struttura.Prov || 'N/A'}`, 20, yPosition);
    yPosition += 6;
    
    // Note personali in formato minimale
    if (options.includePersonalNotes && struttura.personalNotes && struttura.personalNotes.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      struttura.personalNotes.forEach(nota => {
        doc.text(`  • ${nota.nota}`, 20, yPosition);
        yPosition += 4;
      });
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
    }
  });
}

// === Export Options Modal ===
function mostraOpzioniEsportazione(strutture) {
  // Rimuovi modal esistente se presente
  const existingModal = document.getElementById('exportOptionsModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'exportOptionsModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 20px;
    max-width: 90%;
    width: 500px;
    max-height: 80%;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  `;
  
  modalContent.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h3 style="margin: 0; color: #2f6b2f;">📊 Opzioni Esportazione</h3>
      <button id="closeExportModal" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button>
    </div>
    
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Formato:</label>
      <div style="display: flex; gap: 10px;">
        <label style="display: flex; align-items: center;">
          <input type="radio" name="format" value="excel" checked style="margin-right: 5px;">
          📊 Excel
        </label>
        <label style="display: flex; align-items: center;">
          <input type="radio" name="format" value="pdf" style="margin-right: 5px;">
          📄 PDF
        </label>
      </div>
    </div>
    
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Layout:</label>
      <select id="exportLayout" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <option value="completo">Completo (tutti i campi)</option>
        <option value="compatto">Compatto (campi essenziali)</option>
        <option value="contatti">Solo contatti</option>
        <option value="categorie">Per categorie (fogli separati)</option>
      </select>
    </div>
    
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Opzioni:</label>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <label style="display: flex; align-items: center;">
          <input type="checkbox" id="includeImages" style="margin-right: 5px;">
          Includi informazioni immagini
        </label>
        <label style="display: flex; align-items: center;">
          <input type="checkbox" id="includeNotes" style="margin-right: 5px;">
          Includi note strutture
        </label>
        <label style="display: flex; align-items: center;">
          <input type="checkbox" id="includePersonalNotes" style="margin-right: 5px;">
          Includi note personali
        </label>
        <label style="display: flex; align-items: center;">
          <input type="checkbox" id="onlyPersonalList" style="margin-right: 5px;">
          Solo elenco personale
        </label>
      </div>
    </div>
    
    <div id="pdfOptions" style="margin-bottom: 20px; display: none;">
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Opzioni PDF:</label>
      <div style="display: flex; gap: 10px; margin-bottom: 10px;">
        <label style="display: flex; align-items: center;">
          <input type="radio" name="orientation" value="portrait" checked style="margin-right: 5px;">
          📄 Verticale
        </label>
        <label style="display: flex; align-items: center;">
          <input type="radio" name="orientation" value="landscape" style="margin-right: 5px;">
          📄 Orizzontale
        </label>
      </div>
      <select id="pdfTemplate" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <option value="default">Default</option>
        <option value="professional">Professionale</option>
        <option value="minimal">Minimale</option>
      </select>
    </div>
    
    <div style="display: flex; gap: 10px; justify-content: flex-end;">
      <button id="cancelExport" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
        ❌ Annulla
      </button>
      <button id="exportData" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
        📊 Esporta
      </button>
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Event listeners
  document.getElementById('closeExportModal').onclick = () => modal.remove();
  document.getElementById('cancelExport').onclick = () => modal.remove();
  
  // Toggle PDF options
  document.querySelectorAll('input[name="format"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const pdfOptions = document.getElementById('pdfOptions');
      pdfOptions.style.display = e.target.value === 'pdf' ? 'block' : 'none';
    });
  });
  
  document.getElementById('exportData').onclick = async () => {
    const format = document.querySelector('input[name="format"]:checked').value;
    const layout = document.getElementById('exportLayout').value;
    const includeImages = document.getElementById('includeImages').checked;
    const includeNotes = document.getElementById('includeNotes').checked;
    const includePersonalNotes = document.getElementById('includePersonalNotes').checked;
    const onlyPersonalList = document.getElementById('onlyPersonalList').checked;
    
    const options = {
      layout,
      includeImages,
      includeNotes,
      includePersonalNotes,
      onlyPersonalList
    };
    
    if (format === 'pdf') {
      options.orientation = document.querySelector('input[name="orientation"]:checked').value;
      options.template = document.getElementById('pdfTemplate').value;
    }
    
    modal.remove();
    
    if (format === 'excel') {
      await esportaExcel(strutture, options);
    } else {
      await esportaPDF(strutture, options);
    }
  };
  
  // Chiudi cliccando fuori
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Helper functions
function getStatoIcon(stato) {
  switch (stato) {
    case 'attiva': return '🟢';
    case 'temporaneamente_non_attiva': return '🟡';
    case 'non_piu_attiva': return '🔴';
    default: return '⚪';
  }
}

function getStatoLabel(stato) {
  switch (stato) {
    case 'attiva': return 'Attiva';
    case 'temporaneamente_non_attiva': return 'Temporaneamente non attiva';
    case 'non_piu_attiva': return 'Non più attiva';
    default: return 'Stato sconosciuto';
  }
}

// Rendi le funzioni accessibili globalmente
window.esportaExcel = esportaExcel;
window.esportaPDF = esportaPDF;
window.mostraOpzioniEsportazione = mostraOpzioniEsportazione;