// === Firebase SDK Imports ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// === Configurazione Firebase ===
const firebaseConfig = {
  apiKey: "AIzaSyDHFnQOMoaxY1d-7LRVgh7u_ioRWPDWVfI",
  authDomain: "quovadiscout.firebaseapp.com",
  projectId: "quovadiscout",
  storageBucket: "quovadiscout.firebasestorage.app",
  messagingSenderId: "745134651793",
  appId: "1:745134651793:web:dabd5ae6b7b579172dc230"
};

// === Inizializzazione Firebase ===
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const colRef = collection(db, "strutture");

// === Caricamento dati da Firestore ===
async function caricaStrutture() {
  try {
    console.log('🔗 Connessione a Firestore...');
    console.log('📊 Progetto:', firebaseConfig.projectId);
    console.log('📁 Collezione: strutture');
    
  const snapshot = await getDocs(colRef);
    console.log('✅ Connessione Firestore riuscita');
    console.log('📄 Documenti trovati:', snapshot.docs.length);
    
    const dati = snapshot.docs.map((d) => {
      const docData = d.data();
      console.log(`📋 Documento ${d.id}:`, docData);
      return { id: d.id, ...docData };
    });
    
    console.log(`✅ Caricate ${dati.length} strutture da Firestore`);
    
    // Se Firestore è vuoto, prova con i dati locali
    if (dati.length === 0) {
      console.log('⚠️ Firestore vuoto, tentativo di caricamento da file locale...');
      return await caricaStruttureLocali();
    }
    
    return dati;
  } catch (error) {
    console.error('❌ Errore nel caricamento da Firestore:', error);
    console.log('🔄 Tentativo di caricamento da file locale...');
    return await caricaStruttureLocali();
  }
}

// === Caricamento dati locali di fallback ===
async function caricaStruttureLocali() {
  try {
    const response = await fetch('./data.json');
    if (!response.ok) {
      throw new Error('File data.json non trovato');
    }
    const dati = await response.json();
    console.log(`Caricate ${dati.length} strutture da file locale`);
    return dati;
  } catch (error) {
    console.error('Errore nel caricamento locale:', error);
    // Dati di esempio se tutto fallisce
    return [
      {
        id: 'demo-1',
        Struttura: 'Casa Scout Demo',
        Luogo: 'Milano',
        Prov: 'MI',
        Casa: true,
        Terreno: false,
        Referente: 'Mario Rossi',
        Contatto: '333-1234567',
        Info: 'Struttura di esempio per test'
      },
      {
        id: 'demo-2',
        Struttura: 'Terreno Scout Demo',
        Luogo: 'Bergamo',
        Prov: 'BG',
        Casa: false,
        Terreno: true,
        Referente: 'Giulia Bianchi',
        Contatto: 'giulia@scout.it',
        Info: 'Terreno di esempio per test'
      }
    ];
  }
}

// === Paginazione ===
let paginaCorrente = 1;
const elementiPerPagina = 20;

function renderStrutture(lista) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (lista.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <h3>🔍 Nessuna struttura trovata</h3>
        <p>Prova a modificare i filtri di ricerca</p>
      </div>
    `;
    return;
  }

  // Calcola paginazione
  const totalePagine = Math.ceil(lista.length / elementiPerPagina);
  const inizio = (paginaCorrente - 1) * elementiPerPagina;
  const fine = inizio + elementiPerPagina;
  const listaPagina = lista.slice(inizio, fine);

  listaPagina.forEach((s) => {
    const card = document.createElement("div");
    card.className = "card";
    const isInElenco = elencoPersonale.includes(s.id);

    card.innerHTML = `
      <div class="card-header">
        <h3>${s.Struttura || "Senza nome"}</h3>
        <div class="card-actions">
          <button class="toggle-elenco ${isInElenco ? 'in-elenco' : ''}" data-id="${s.id}">
            ${isInElenco ? '⭐' : '☆'}
          </button>
        </div>
      </div>
      
      <div class="card-content">
        <div class="location">
          <span class="location-icon">📍</span>
          <span>${s.Luogo || "Luogo non specificato"}, ${s.Prov || "Provincia non specificata"}</span>
        </div>
        
        ${s.Info ? `<div class="info-section">
          <p>${s.Info}</p>
        </div>` : ''}
        
        <div class="tags">
          ${s.Casa ? '<span class="tag casa">🏠 Casa</span>' : ''}
          ${s.Terreno ? '<span class="tag terreno">🌱 Terreno</span>' : ''}
        </div>
        
        <div class="card-details">
          ${s.Letti ? `<div class="detail-item"><strong>Letti:</strong> ${s.Letti}</div>` : ''}
          ${s.Branco ? `<div class="detail-item"><strong>Branco:</strong> ${s.Branco}</div>` : ''}
          ${s.Reparto ? `<div class="detail-item"><strong>Reparto:</strong> ${s.Reparto}</div>` : ''}
          ${s.Compagnia ? `<div class="detail-item"><strong>Compagnia:</strong> ${s.Compagnia}</div>` : ''}
        </div>
        
        ${s.Referente ? `<div class="contact-info">
          <strong>Referente:</strong> ${s.Referente}
        </div>` : ''}
        
        ${s.Email ? `<div class="contact-info">
          <strong>Email:</strong> ${s.Email}
        </div>` : ''}
        
        ${s.Sito ? `<div class="contact-info">
          <strong>Sito:</strong> ${s.Sito}
        </div>` : ''}
        
        ${s.Contatto ? `<div class="contact-info">
          <strong>Contatto:</strong> ${s.Contatto}
        </div>` : ''}
        
        ${s['Ultimo controllo'] ? `<div class="contact-info">
          <strong>Ultimo controllo:</strong> ${s['Ultimo controllo']}
        </div>` : ''}
      </div>
      
      <div class="card-footer">
        <button class="btn-view" data-id="${s.id}">📋 Visualizza/Modifica</button>
        <button class="btn-delete" data-id="${s.id}">🗑️ Elimina</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Eventi pulsanti
  document.querySelectorAll(".btn-view").forEach((btn) => {
    btn.addEventListener("click", () => mostraSchedaCompleta(btn.dataset.id));
  });
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => eliminaStruttura(btn.dataset.id));
  });
  document.querySelectorAll(".toggle-elenco").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if (elencoPersonale.includes(id)) {
        rimuoviDallElenco(id);
        btn.classList.remove('in-elenco');
        btn.textContent = '☆';
      } else {
        aggiungiAllElenco(id);
        btn.classList.add('in-elenco');
        btn.textContent = '⭐';
      }
    });
  });

  // Aggiungi controlli di paginazione
  if (totalePagine > 1) {
    const paginazione = document.createElement('div');
    paginazione.className = 'paginazione';
    paginazione.innerHTML = `
      <div class="pagination-info">
        Mostrando ${inizio + 1}-${Math.min(fine, lista.length)} di ${lista.length} strutture
      </div>
      <div class="pagination-controls">
        <button ${paginaCorrente === 1 ? 'disabled' : ''} onclick="cambiaPagina(${paginaCorrente - 1})">« Precedente</button>
        <span class="pagination-numbers">
          ${Array.from({length: Math.min(5, totalePagine)}, (_, i) => {
            const num = Math.max(1, Math.min(totalePagine, paginaCorrente - 2 + i));
            return `<button class="${num === paginaCorrente ? 'active' : ''}" onclick="cambiaPagina(${num})">${num}</button>`;
          }).join('')}
        </span>
        <button ${paginaCorrente === totalePagine ? 'disabled' : ''} onclick="cambiaPagina(${paginaCorrente + 1})">Successiva »</button>
      </div>
    `;
    container.appendChild(paginazione);
  }
}

function cambiaPagina(nuovaPagina) {
  paginaCorrente = Math.max(1, nuovaPagina);
  const listaFiltrata = filtra(strutture);
  renderStrutture(listaFiltrata);
}

// === Filtri e ricerca ===
let filtroRapidoAttivo = 'all';

function filtra(lista) {
  const q = document.getElementById("search").value.toLowerCase();
  const prov = document.getElementById("filter-prov").value;
  const casa = document.getElementById("filter-casa").checked;
  const terreno = document.getElementById("filter-terreno").checked;

  let filtrata = lista.filter((s) => {
    const matchTesto =
      s.Struttura?.toLowerCase().includes(q) ||
      s.Luogo?.toLowerCase().includes(q) ||
      s.Info?.toLowerCase().includes(q) ||
      s.Referente?.toLowerCase().includes(q);
    const matchProv = !prov || s.Prov === prov;
    
    // Applica filtro rapido se attivo
    let matchFiltroRapido = true;
    if (filtroRapidoAttivo !== 'all') {
      switch (filtroRapidoAttivo) {
        case 'casa':
          matchFiltroRapido = s.Casa && !s.Terreno;
          break;
        case 'terreno':
          matchFiltroRapido = s.Terreno && !s.Casa;
          break;
        case 'entrambe':
          matchFiltroRapido = s.Casa && s.Terreno;
          break;
        case 'senza':
          matchFiltroRapido = !s.Casa && !s.Terreno;
          break;
      }
    }
    
    // Filtri tradizionali (solo se nessun filtro rapido attivo)
    const matchCasa = filtroRapidoAttivo === 'all' ? (!casa || s.Casa === true) : true;
    const matchTerreno = filtroRapidoAttivo === 'all' ? (!terreno || s.Terreno === true) : true;
    
    return matchTesto && matchProv && matchCasa && matchTerreno && matchFiltroRapido;
  });

  // Applica ordinamento
  const sortBy = document.getElementById("sort-by").value;
  filtrata.sort((a, b) => {
    switch (sortBy) {
      case 'struttura':
        return (a.Struttura || '').localeCompare(b.Struttura || '');
      case 'luogo':
        return (a.Luogo || '').localeCompare(b.Luogo || '');
      case 'provincia':
        return (a.Prov || '').localeCompare(b.Prov || '');
      case 'referente':
        return (a.Referente || '').localeCompare(b.Referente || '');
      default:
        return 0;
    }
  });

  return filtrata;
}

// === Filtri Rapidi ===
function applicaFiltroRapido(tipo) {
  filtroRapidoAttivo = tipo;
  
  // Aggiorna UI
  document.querySelectorAll('.quick-filter').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-filter="${tipo}"]`).classList.add('active');
  
  // Disabilita filtri tradizionali se filtro rapido attivo
  const casaCheckbox = document.getElementById('filter-casa');
  const terrenoCheckbox = document.getElementById('filter-terreno');
  
  if (tipo === 'all') {
    casaCheckbox.disabled = false;
    terrenoCheckbox.disabled = false;
  } else {
    casaCheckbox.disabled = true;
    terrenoCheckbox.disabled = true;
    casaCheckbox.checked = false;
    terrenoCheckbox.checked = false;
  }
  
  // Reset alla prima pagina
  paginaCorrente = 1;
  
  // Applica filtro
  const listaFiltrata = filtra(strutture);
  renderStrutture(listaFiltrata);
  
  // Mostra contatore risultati
  aggiornaContatoreRisultati(listaFiltrata.length);
}

function aggiornaContatoreRisultati(numero) {
  let contatore = document.getElementById('contatore-risultati');
  if (!contatore) {
    contatore = document.createElement('div');
    contatore.id = 'contatore-risultati';
    contatore.className = 'contatore-risultati';
    document.querySelector('.topbar').appendChild(contatore);
  }
  
  const filtroAttivo = document.querySelector('.quick-filter.active');
  const nomeFiltro = filtroAttivo ? filtroAttivo.textContent.trim() : 'Tutte';
  
  contatore.textContent = `${nomeFiltro}: ${numero} risultati`;
}

// === Modifica struttura ===
let strutturaCorrente = null;

async function modificaStruttura(id) {
  strutturaCorrente = strutture.find(s => s.id === id);
  if (!strutturaCorrente) return;
  
  const modal = document.getElementById('modal');
  const form = document.getElementById('editForm');
  
  // Popola il form
  form.innerHTML = `
    <label>
      Nome Struttura *
      <input type="text" id="edit-struttura" value="${strutturaCorrente.Struttura || ''}" required>
    </label>
    
    <label>
      Luogo
      <input type="text" id="edit-luogo" value="${strutturaCorrente.Luogo || ''}">
    </label>
    
    <label>
      Provincia
      <select id="edit-prov">
        <option value="">Seleziona provincia</option>
        ${[...new Set(strutture.map(s => s.Prov).filter(Boolean))].sort().map(prov => 
          `<option value="${prov}" ${strutturaCorrente.Prov === prov ? 'selected' : ''}>${prov}</option>`
        ).join('')}
      </select>
    </label>
    
    <label>
      Referente
      <input type="text" id="edit-referente" value="${strutturaCorrente.Referente || ''}">
    </label>
    
    <label>
      Contatto/Telefono
      <input type="text" id="edit-contatto" value="${strutturaCorrente.Contatto || ''}">
    </label>
    
    <label>
      Email
      <input type="email" id="edit-email" value="${strutturaCorrente.Email || ''}">
    </label>
    
    <label>
      Casa
      <input type="checkbox" id="edit-casa" ${strutturaCorrente.Casa ? 'checked' : ''}>
    </label>
    
    <label>
      Terreno
      <input type="checkbox" id="edit-terreno" ${strutturaCorrente.Terreno ? 'checked' : ''}>
    </label>
    
    <label class="full-width">
      Informazioni aggiuntive
      <textarea id="edit-info" rows="3" placeholder="Informazioni dettagliate sulla struttura...">${strutturaCorrente.Info || ''}</textarea>
    </label>
  `;
  
  modal.classList.remove('hidden');
}

async function salvaModifiche() {
  if (!strutturaCorrente) return;
  
  const formData = {
    Struttura: document.getElementById('edit-struttura').value.trim(),
    Luogo: document.getElementById('edit-luogo').value.trim(),
    Prov: document.getElementById('edit-prov').value,
    Referente: document.getElementById('edit-referente').value.trim(),
    Contatto: document.getElementById('edit-contatto').value.trim(),
    Email: document.getElementById('edit-email').value.trim(),
    Casa: document.getElementById('edit-casa').checked,
    Terreno: document.getElementById('edit-terreno').checked,
    Info: document.getElementById('edit-info').value.trim()
  };
  
  // Validazione
  if (!formData.Struttura) {
    alert('Il nome della struttura è obbligatorio!');
    return;
  }
  
  try {
    await updateDoc(doc(db, "strutture", strutturaCorrente.id), formData);
    chiudiModale();
  aggiornaLista();
  } catch (error) {
    console.error('Errore nel salvataggio:', error);
    alert('Errore nel salvataggio delle modifiche');
  }
}

function chiudiModale() {
  document.getElementById('modal').classList.add('hidden');
  strutturaCorrente = null;
}

// === Elimina struttura ===
async function eliminaStruttura(id) {
  if (confirm("Vuoi davvero eliminare questa struttura?")) {
    await deleteDoc(doc(db, "strutture", id));
    aggiornaLista();
  }
}

// === Test Firestore ===
async function testFirestore() {
  console.log('🔥 Test connessione Firestore...');
  
  try {
    // Test di scrittura
    console.log('📝 Test scrittura...');
    const testDoc = await addDoc(colRef, {
      Struttura: 'Test Firestore',
      Luogo: 'Test',
      Prov: 'TS',
      Casa: true,
      Terreno: false,
      Referente: 'Test User',
      Contatto: 'test@example.com',
      Info: 'Documento di test per verificare la connessione Firestore',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Scrittura riuscita, ID:', testDoc.id);
    
    // Test di lettura
    console.log('📖 Test lettura...');
    const snapshot = await getDocs(colRef);
    console.log('✅ Lettura riuscita, documenti:', snapshot.docs.length);
    
    // Mostra tutti i documenti
    snapshot.docs.forEach(doc => {
      console.log(`📋 ${doc.id}:`, doc.data());
    });
    
    alert('✅ Test Firestore completato con successo!\nControlla la console per i dettagli.');
    
    // Ricarica i dati
    aggiornaLista();
    
  } catch (error) {
    console.error('❌ Test Firestore fallito:', error);
    alert('❌ Test Firestore fallito!\nErrore: ' + error.message + '\nControlla la console per i dettagli.');
  }
}

// === Deduplicazione ===
function rimuoviDuplicati(dati) {
  console.log('🔍 Analisi duplicati in corso...');
  
  // Crea una mappa per tracciare i duplicati
  const visti = new Map();
  const duplicati = [];
  const unici = [];
  
  dati.forEach((record, index) => {
    // Crea una chiave unica basata su nome struttura + luogo + provincia
    const chiave = `${(record.Struttura || '').toLowerCase().trim()}_${(record.Luogo || '').toLowerCase().trim()}_${(record.Prov || '').toLowerCase().trim()}`;
    
    if (visti.has(chiave)) {
      // È un duplicato
      duplicati.push({
        index: index + 1,
        record: record,
        duplicatoDi: visti.get(chiave)
      });
      console.log(`🔄 Duplicato trovato: "${record.Struttura}" (riga ${index + 1})`);
    } else {
      // È unico
      visti.set(chiave, index + 1);
      unici.push(record);
    }
  });
  
  if (duplicati.length > 0) {
    console.log(`🧹 Trovati ${duplicati.length} duplicati:`);
    duplicati.forEach(dup => {
      console.log(`  - "${dup.record.Struttura}" (riga ${dup.index}) duplicato di riga ${dup.duplicatoDi}`);
    });
  }
  
  console.log(`✅ Deduplicazione completata: ${unici.length} record unici, ${duplicati.length} duplicati rimossi`);
  return unici;
}

// === Pulizia Duplicati Esistenti ===
async function rimuoviDuplicatiEsistenti() {
  if (!confirm('⚠️ ATTENZIONE: Questa operazione rimuoverà i duplicati esistenti in Firestore.\n\nProcedere?')) {
    return;
  }
  
  console.log('🧹 Inizio pulizia duplicati esistenti...');
  
  try {
    // Carica tutti i dati da Firestore
    const snapshot = await getDocs(colRef);
    const tuttiDati = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`📊 Trovati ${tuttiDati.length} documenti in Firestore`);
    
    // Trova duplicati
    const duplicati = [];
    const visti = new Map();
    
    tuttiDati.forEach(doc => {
      const chiave = `${(doc.Struttura || '').toLowerCase().trim()}_${(doc.Luogo || '').toLowerCase().trim()}_${(doc.Prov || '').toLowerCase().trim()}`;
      
      if (visti.has(chiave)) {
        duplicati.push({
          id: doc.id,
          struttura: doc.Struttura,
          duplicatoDi: visti.get(chiave)
        });
      } else {
        visti.set(chiave, doc.id);
      }
    });
    
    if (duplicati.length === 0) {
      alert('✅ Nessun duplicato trovato in Firestore!');
      return;
    }
    
    console.log(`🔄 Trovati ${duplicati.length} duplicati da rimuovere`);
    
    // Mostra conferma con dettagli
    const conferma = confirm(`Trovati ${duplicati.length} duplicati da rimuovere:\n\n${duplicati.slice(0, 5).map(d => `• ${d.struttura}`).join('\n')}${duplicati.length > 5 ? `\n... e altri ${duplicati.length - 5}` : ''}\n\nProcedere con la rimozione?`);
    
    if (!conferma) return;
    
    // Rimuovi duplicati
    let rimossi = 0;
    for (const duplicato of duplicati) {
      try {
        await deleteDoc(doc(db, "strutture", duplicato.id));
        rimossi++;
        console.log(`🗑️ Rimosso duplicato: ${duplicato.struttura} (${duplicato.id})`);
      } catch (error) {
        console.error(`❌ Errore rimozione ${duplicato.struttura}:`, error);
      }
    }
    
    alert(`✅ Pulizia completata!\n\n📊 Risultati:\n• ${rimossi} duplicati rimossi\n• ${tuttiDati.length - rimossi} documenti unici rimasti`);
    
    // Ricarica i dati
    aggiornaLista();
    
  } catch (error) {
    console.error('❌ Errore durante la pulizia:', error);
    alert('❌ Errore durante la pulizia: ' + error.message);
  }
}

// === Importazione Excel ===
function avviaImportazioneExcel() {
  const fileInput = document.getElementById('excelFile');
  fileInput.click();
}

async function importaExcel(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  console.log('📊 Inizio importazione Excel:', file.name);
  
  try {
    const data = await leggiFileExcel(file);
    console.log('📋 Dati letti:', data.length, 'righe');
    
    if (data.length === 0) {
      alert('❌ Nessun dato trovato nel file Excel');
      return;
    }
    
    // Mostra anteprima dei dati
    const conferma = await mostraAnteprimaImportazione(data);
    if (!conferma) return;
    
    // Importa in Firestore
    await importaInFirestore(data);
    
  } catch (error) {
    console.error('❌ Errore nell\'importazione:', error);
    alert('❌ Errore nell\'importazione: ' + error.message);
  }
}

function leggiFileExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Mappa i campi Excel ai campi dell'app
        const datiMappati = jsonData.map((row, index) => {
          const record = {
            // Campi principali
            Struttura: row['Struttura'] || row['Nome'] || row['Nome Struttura'] || '',
            Luogo: row['Luogo'] || row['Città'] || row['Città'] || '',
            Prov: row['Prov'] || row['Provincia'] || row['Prov'] || '',
            Casa: convertiBoolean(row['Casa'] || row['Ha Casa'] || row['Casa']),
            Terreno: convertiBoolean(row['Terreno'] || row['Ha Terreno'] || row['Terreno']),
            Referente: row['Referente'] || row['Contatto'] || row['Responsabile'] || '',
            Contatto: row['Contatto'] || row['Telefono'] || row['Tel'] || '',
            Email: row['Email'] || row['E-mail'] || row['Mail'] || '',
            Info: row['Info'] || row['Informazioni'] || row['Note'] || row['Descrizione'] || '',
            
            // Campi aggiuntivi standard
            Indirizzo: row['Indirizzo'] || row['Via'] || '',
            Cap: row['Cap'] || row['CAP'] || '',
            Coordinate: row['Coordinate'] || row['GPS'] || '',
            Capacita: row['Capacità'] || row['Posti'] || '',
            Servizi: row['Servizi'] || row['Disponibilità'] || '',
            
            // Importa TUTTI gli altri campi dal Excel
            ...Object.keys(row).reduce((acc, key) => {
              // Se il campo non è già mappato, aggiungilo
              const keyLower = key.toLowerCase();
              const isMapped = [
                'struttura', 'nome', 'nome struttura',
                'luogo', 'città', 'città',
                'prov', 'provincia',
                'casa', 'ha casa',
                'terreno', 'ha terreno',
                'referente', 'contatto', 'responsabile',
                'telefono', 'tel',
                'email', 'e-mail', 'mail',
                'info', 'informazioni', 'note', 'descrizione',
                'indirizzo', 'via',
                'cap', 'cap',
                'coordinate', 'gps',
                'capacità', 'posti',
                'servizi', 'disponibilità'
              ].includes(keyLower);
              
              if (!isMapped && row[key] !== undefined && row[key] !== null && row[key] !== '') {
                acc[key] = row[key];
              }
              return acc;
            }, {})
          };
          
          return record;
        });
        
        resolve(datiMappati);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Errore nella lettura del file'));
    reader.readAsArrayBuffer(file);
  });
}

function convertiBoolean(valore) {
  if (typeof valore === 'boolean') return valore;
  if (typeof valore === 'string') {
    const val = valore.toLowerCase().trim();
    return val === 'sì' || val === 'si' || val === 'yes' || val === 'true' || val === '1' || val === 'x';
  }
  return false;
}

async function mostraAnteprimaImportazione(dati) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 800px;">
        <button class="close" onclick="this.closest('.modal').remove()">✕</button>
        <h2>📊 Anteprima Importazione</h2>
        <p><strong>${dati.length}</strong> strutture trovate nel file Excel</p>
        
        <!-- Mostra tutti i campi disponibili -->
        <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; margin: 10px 0;">
          <strong>📋 Campi che verranno importati:</strong>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
            ${Object.keys(dati[0] || {}).slice(0, 15).map(campo => 
              `<span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 12px; font-size: 12px;">${campo}</span>`
            ).join('')}
            ${Object.keys(dati[0] || {}).length > 15 ? 
              `<span style="background: #f0f0f0; color: #666; padding: 4px 8px; border-radius: 12px; font-size: 12px;">+${Object.keys(dati[0] || {}).length - 15} altri</span>` : ''
            }
          </div>
        </div>
        
        <div style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
          ${dati.slice(0, 10).map((item, i) => `
            <div style="border-bottom: 1px solid #eee; padding: 8px 0;">
              <strong>${i + 1}. ${item.Struttura || 'Senza nome'}</strong><br>
              <small>📍 ${item.Luogo}, ${item.Prov} | 👤 ${item.Referente || 'N/A'}</small>
              <br><small style="color: #666;">📊 ${Object.keys(item).length} campi per questa struttura</small>
            </div>
          `).join('')}
          ${dati.length > 10 ? `<div style="text-align: center; padding: 10px; color: #666;">... e altre ${dati.length - 10} strutture</div>` : ''}
        </div>
        <div class="modal-actions">
          <button id="importaBtn" style="background: var(--accent); color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">✅ Importa in Firestore</button>
          <button onclick="this.closest('.modal').remove(); resolve(false);" style="background: #666; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">❌ Annulla</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listener per il pulsante di importazione
    modal.querySelector('#importaBtn').addEventListener('click', async () => {
      modal.remove();
      await importaInFirestore(dati);
      resolve(true);
    });
    
    // Chiudi cliccando fuori
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        resolve(false);
      }
    });
  });
}

async function importaInFirestore(dati) {
  console.log('📤 Inizio importazione in Firestore...');
  
  // Deduplicazione automatica
  console.log('🔍 Controllo duplicati...');
  const datiUnici = rimuoviDuplicati(dati);
  const duplicatiRimossi = dati.length - datiUnici.length;
  
  if (duplicatiRimossi > 0) {
    console.log(`🧹 Rimossi ${duplicatiRimossi} duplicati automaticamente`);
  }
  
  let successi = 0;
  let errori = 0;
  
  // Mostra indicatore di progresso
  const progressModal = document.createElement('div');
  progressModal.className = 'modal';
  progressModal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <h2>📤 Importazione in corso...</h2>
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" id="progressFill"></div>
        </div>
        <p id="progressText">Preparazione importazione...</p>
      </div>
    </div>
  `;
  document.body.appendChild(progressModal);
  
  const progressFill = progressModal.querySelector('#progressFill');
  const progressText = progressModal.querySelector('#progressText');
  
  try {
    for (const [index, dato] of datiUnici.entries()) {
      try {
        await addDoc(colRef, dato);
        successi++;
        
        // Aggiorna progresso
        const percentuale = Math.round(((index + 1) / dati.length) * 100);
        progressFill.style.width = `${percentuale}%`;
        progressText.textContent = `${index + 1}/${dati.length} (${percentuale}%) - ${dato.Struttura || 'Senza nome'}`;
        
        console.log(`✅ ${index + 1}/${dati.length}: ${dato.Struttura}`);
        
        // Piccola pausa per non sovraccaricare Firestore
        if (index % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        errori++;
        console.error(`❌ ${index + 1}/${dati.length}: ${dato.Struttura} - ${error.message}`);
      }
    }
    
    // Chiudi modal di progresso
    progressModal.remove();
    
    console.log(`📊 Importazione completata: ${successi} successi, ${errori} errori`);
    const messaggio = `✅ Importazione completata!\n\n📊 Risultati:\n• ${successi} strutture importate con successo\n• ${errori} errori${duplicatiRimossi > 0 ? `\n• ${duplicatiRimossi} duplicati rimossi automaticamente` : ''}\n\nL'app si ricaricherà automaticamente.`;
    alert(messaggio);
    
    // Ricarica i dati
    aggiornaLista();
    
  } catch (error) {
    progressModal.remove();
    console.error('❌ Errore durante l\'importazione:', error);
    alert('❌ Errore durante l\'importazione: ' + error.message);
  }
}

// === Aggiungi dati di test a Firestore ===
async function aggiungiDatiTest() {
  const datiTest = [
    {
      Struttura: 'Casa Scout Milano Centro',
      Luogo: 'Milano',
      Prov: 'MI',
      Casa: true,
      Terreno: false,
      Referente: 'Mario Rossi',
      Contatto: '333-1234567',
      Email: 'mario@scout.it',
      Info: 'Casa scout nel centro di Milano'
    },
    {
      Struttura: 'Terreno Scout Bergamo',
      Luogo: 'Bergamo',
      Prov: 'BG',
      Casa: false,
      Terreno: true,
      Referente: 'Giulia Bianchi',
      Contatto: '035-123456',
      Email: 'giulia@scout.it',
      Info: 'Terreno scout a Bergamo'
    }
  ];
  
  try {
    console.log('📝 Aggiunta dati di test a Firestore...');
    for (const dato of datiTest) {
      await addDoc(colRef, dato);
      console.log('✅ Aggiunto:', dato.Struttura);
    }
    console.log('✅ Tutti i dati di test aggiunti');
    alert('✅ Dati di test aggiunti a Firestore!');
    aggiornaLista();
  } catch (error) {
    console.error('❌ Errore nell\'aggiunta dati test:', error);
    alert('❌ Errore nell\'aggiunta dati test: ' + error.message);
  }
}

// === Aggiungi nuova struttura ===
async function aggiungiStruttura() {
  // Crea una struttura vuota per la nuova struttura
  const nuovaStruttura = {
    id: 'new_' + Date.now(), // ID temporaneo
    Struttura: '',
    Luogo: '',
    Indirizzo: '',
    Prov: '',
    Info: '',
    '€ notte': '',
    Offerta: '',
    Forfait: '',
    Terreno: false,
    Casa: false,
    Letti: '',
    Cucina: '',
    Spazi: '',
    Fuochi: '',
    Escursioni: '',
    Trasporti: '',
    Branco: '',
    Reparto: '',
    Compagnia: '',
    Referente: '',
    Email: '',
    Sito: '',
    Contatto: '',
    IIcontatto: '',
    'Ultimo controllo': ''
  };
  
  // Aggiungi la struttura temporanea all'array
  strutture.push(nuovaStruttura);
  
  // Apri la scheda in modalità creazione
  mostraSchedaCompleta(nuovaStruttura.id);
}

// === Elenco personale ===
let elencoPersonale = JSON.parse(localStorage.getItem('elencoPersonale') || '[]');

function aggiungiAllElenco(id) {
  if (!elencoPersonale.includes(id)) {
    elencoPersonale.push(id);
    localStorage.setItem('elencoPersonale', JSON.stringify(elencoPersonale));
    aggiornaContatoreElenco();
  }
}

function rimuoviDallElenco(id) {
  elencoPersonale = elencoPersonale.filter(item => item !== id);
  localStorage.setItem('elencoPersonale', JSON.stringify(elencoPersonale));
  aggiornaContatoreElenco();
}

function aggiornaContatoreElenco() {
  const contatore = document.getElementById('contatore-elenco');
  if (contatore) {
    contatore.textContent = `Elenco personale: ${elencoPersonale.length}`;
  }
}

// === Esportazione ===
function esportaElencoPersonale() {
  const struttureElenco = strutture.filter(s => elencoPersonale.includes(s.id));
  
  if (struttureElenco.length === 0) {
    alert('Il tuo elenco personale è vuoto!');
    return;
  }

  // Crea menu di esportazione
  const menu = document.createElement('div');
  menu.className = 'export-menu';
  menu.innerHTML = `
    <div class="export-options">
      <h3>Esporta Elenco Personale (${struttureElenco.length} elementi)</h3>
      <button onclick="esportaJSON()">📄 JSON</button>
      <button onclick="esportaCSV()">📊 CSV</button>
      <button onclick="stampaElenco()">🖨️ Stampa</button>
      <button onclick="chiudiMenu()">❌ Chiudi</button>
    </div>
  `;
  
  document.body.appendChild(menu);
  
  // Funzioni di esportazione
  window.esportaJSON = () => {
    const dataStr = JSON.stringify(struttureElenco, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'elenco-personale.json';
    a.click();
    URL.revokeObjectURL(url);
    chiudiMenu();
  };
  
  window.esportaCSV = () => {
    const headers = ['Struttura', 'Luogo', 'Provincia', 'Casa', 'Terreno', 'Referente', 'Contatto', 'Info'];
    const csvContent = [
      headers.join(','),
      ...struttureElenco.map(s => [
        `"${s.Struttura || ''}"`,
        `"${s.Luogo || ''}"`,
        `"${s.Prov || ''}"`,
        s.Casa ? 'Sì' : 'No',
        s.Terreno ? 'Sì' : 'No',
        `"${s.Referente || ''}"`,
        `"${s.Contatto || s.Email || ''}"`,
        `"${s.Info || ''}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'elenco-personale.csv';
    a.click();
    URL.revokeObjectURL(url);
    chiudiMenu();
  };
  
  window.stampaElenco = () => {
    const printWindow = window.open('', '_blank');
    const printContent = generaContenutoStampa(struttureElenco);
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    chiudiMenu();
  };
  
  window.chiudiMenu = () => {
    document.body.removeChild(menu);
  };
}

function generaContenutoStampa(struttureElenco) {
  const data = new Date().toLocaleDateString('it-IT');
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Elenco Personale Strutture - ${data}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #2f6b2f; border-bottom: 2px solid #2f6b2f; padding-bottom: 10px; }
        .struttura { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .struttura h3 { color: #2f6b2f; margin: 0 0 10px 0; }
        .info { margin: 5px 0; }
        .tags { margin: 10px 0; }
        .tag { display: inline-block; background: #f0f6ef; padding: 4px 8px; margin: 2px; border-radius: 12px; font-size: 12px; }
        .tag.casa { background: #e8f4fd; color: #1e5a8a; }
        .tag.terreno { background: #f0f9f0; color: #2d5a2d; }
        @media print { body { margin: 0; } .struttura { page-break-inside: avoid; } }
      </style>
    </head>
    <body>
      <h1>Elenco Personale Strutture</h1>
      <p><strong>Data:</strong> ${data} | <strong>Totale:</strong> ${struttureElenco.length} strutture</p>
      
      ${struttureElenco.map(s => `
        <div class="struttura">
          <h3>${s.Struttura || 'Senza nome'}</h3>
          <div class="info"><strong>📍 Luogo:</strong> ${s.Luogo || 'Non specificato'}, ${s.Prov || 'Provincia non specificata'}</div>
          ${s.Referente ? `<div class="info"><strong>👤 Referente:</strong> ${s.Referente}</div>` : ''}
          ${s.Contatto || s.Email ? `<div class="info"><strong>📞 Contatti:</strong> ${s.Contatto || s.Email}</div>` : ''}
          ${s.Info ? `<div class="info"><strong>ℹ️ Info:</strong> ${s.Info}</div>` : ''}
          <div class="tags">
            ${s.Casa ? '<span class="tag casa">🏠 Casa</span>' : ''}
            ${s.Terreno ? '<span class="tag terreno">🌱 Terreno</span>' : ''}
          </div>
        </div>
      `).join('')}
    </body>
    </html>
  `;
}

// === Scheda Completa Struttura (Visualizzazione + Modifica) ===
let modalScheda = null;
let isEditMode = false;

function mostraSchedaCompleta(strutturaId) {
  const struttura = strutture.find(s => s.id === strutturaId);
  if (!struttura) {
    console.error('Struttura non trovata:', strutturaId);
    return;
  }
  
  const isNewStructure = strutturaId.startsWith('new_');
  
  // Rimuovi modal esistente se presente
  if (modalScheda) {
    modalScheda.remove();
  }
  
  // Crea modal per scheda completa
  modalScheda = document.createElement('div');
  modalScheda.id = 'schedaCompletaModal';
  modalScheda.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 20px;
    max-width: 95%;
    max-height: 95%;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    position: relative;
  `;
  
  // Header con titolo e controlli
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #2f6b2f;
  `;
  
  const title = document.createElement('h2');
  title.textContent = isNewStructure ? '📋 Nuova Struttura' : `📋 Scheda: ${struttura.Struttura || 'Senza nome'}`;
  title.style.cssText = `
    margin: 0;
    color: #2f6b2f;
    font-size: 1.5rem;
  `;
  
  const controls = document.createElement('div');
  controls.style.cssText = `
    display: flex;
    gap: 10px;
    align-items: center;
  `;
  
  const editBtn = document.createElement('button');
  editBtn.innerHTML = isNewStructure ? '✏️ Compila' : '✏️ Modifica';
  editBtn.style.cssText = `
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
  `;
  editBtn.onclick = () => toggleEditMode();
  
  const saveBtn = document.createElement('button');
  saveBtn.innerHTML = isNewStructure ? '💾 Crea' : '💾 Salva';
  saveBtn.style.cssText = `
    background: #28a745;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    display: none;
  `;
  saveBtn.onclick = () => salvaModificheScheda(strutturaId);
  
  const cancelBtn = document.createElement('button');
  cancelBtn.innerHTML = '❌ Annulla';
  cancelBtn.style.cssText = `
    background: #6c757d;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    display: none;
  `;
  cancelBtn.onclick = () => {
    if (isNewStructure) {
      // Rimuovi la struttura temporanea e chiudi il modal
      const index = strutture.findIndex(s => s.id === strutturaId);
      if (index !== -1) {
        strutture.splice(index, 1);
      }
      modalScheda.remove();
    } else {
      toggleEditMode();
    }
  };
  
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  closeBtn.style.cssText = `
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  closeBtn.onclick = () => {
    if (isNewStructure) {
      // Rimuovi la struttura temporanea
      const index = strutture.findIndex(s => s.id === strutturaId);
      if (index !== -1) {
        strutture.splice(index, 1);
      }
    }
    modalScheda.remove();
  };
  
  controls.appendChild(editBtn);
  controls.appendChild(saveBtn);
  controls.appendChild(cancelBtn);
  controls.appendChild(closeBtn);
  
  header.appendChild(title);
  header.appendChild(controls);
  
  // Contenuto scheda
  const content = document.createElement('div');
  content.id = 'schedaContent';
  content.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  `;
  
  // Funzione per creare il contenuto
  function creaContenutoScheda() {
    content.innerHTML = '';
    
    // Organizza i campi per categoria
    const categorie = {
      'Informazioni Principali': [
        'Struttura', 'Luogo', 'Indirizzo', 'Prov', 'Info'
      ],
      'Prezzi e Offerte': [
        '€ notte', 'Offerta', 'Forfait'
      ],
      'Caratteristiche Struttura': [
        'Terreno', 'Casa', 'Letti', 'Cucina', 'Spazi', 'Fuochi'
      ],
      'Attività e Servizi': [
        'Escursioni', 'Trasporti'
      ],
      'Gruppi Scout': [
        'Branco', 'Reparto', 'Compagnia'
      ],
      'Contatti': [
        'Referente', 'Email', 'Sito', 'Contatto', 'IIcontatto'
      ],
      'Gestione': [
        'Ultimo controllo'
      ]
    };
    
    // Aggiungi campi per categoria
    Object.entries(categorie).forEach(([nomeCategoria, campi]) => {
      const categoriaDiv = document.createElement('div');
      categoriaDiv.style.cssText = `
        background: #f8f9fa;
        border-radius: 8px;
        padding: 15px;
        border-left: 4px solid #2f6b2f;
      `;
      
      const categoriaTitle = document.createElement('h3');
      categoriaTitle.textContent = nomeCategoria;
      categoriaTitle.style.cssText = `
        margin: 0 0 15px 0;
        color: #2f6b2f;
        font-size: 1.1rem;
      `;
      categoriaDiv.appendChild(categoriaTitle);
      
      campi.forEach(campo => {
        const campoDiv = document.createElement('div');
        campoDiv.style.cssText = `
          margin-bottom: 10px;
          padding: 8px;
          background: white;
          border-radius: 4px;
          border: 1px solid #e9ecef;
        `;
        
        const label = document.createElement('strong');
        label.textContent = `${campo}: `;
        label.style.color = '#495057';
        
        if (isEditMode) {
          // Modalità modifica
          const input = document.createElement('input');
          input.type = 'text';
          input.value = struttura[campo] || '';
          input.placeholder = 'Non specificato';
          input.style.cssText = `
            width: 100%;
            padding: 4px 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
          `;
          input.onchange = (e) => {
            struttura[campo] = e.target.value;
          };
          
          campoDiv.appendChild(label);
          campoDiv.appendChild(input);
        } else {
          // Modalità visualizzazione
          const value = document.createElement('span');
          const valore = struttura[campo];
          
          if (valore === undefined || valore === null || valore === '') {
            value.textContent = 'Non specificato';
            value.style.color = '#6c757d';
            value.style.fontStyle = 'italic';
          } else if (typeof valore === 'boolean') {
            value.textContent = valore ? 'Sì' : 'No';
            value.style.color = valore ? '#28a745' : '#dc3545';
            value.style.fontWeight = 'bold';
          } else {
            value.textContent = valore;
            value.style.color = '#212529';
          }
          
          campoDiv.appendChild(label);
          campoDiv.appendChild(value);
        }
        
        categoriaDiv.appendChild(campoDiv);
      });
      
      content.appendChild(categoriaDiv);
    });
    
    // Aggiungi altri campi non categorizzati
    const altriCampi = Object.keys(struttura).filter(key => 
      !categorie['Informazioni Principali'].includes(key) &&
      !categorie['Contatti'].includes(key) &&
      !categorie['Caratteristiche'].includes(key) &&
      !categorie['Informazioni Aggiuntive'].includes(key) &&
      key !== 'id'
    );
    
    if (altriCampi.length > 0) {
      const altriDiv = document.createElement('div');
      altriDiv.style.cssText = `
        background: #f8f9fa;
        border-radius: 8px;
        padding: 15px;
        border-left: 4px solid #6c757d;
        grid-column: 1 / -1;
      `;
      
      const altriTitle = document.createElement('h3');
      altriTitle.textContent = 'Altri Campi';
      altriTitle.style.cssText = `
        margin: 0 0 15px 0;
        color: #6c757d;
        font-size: 1.1rem;
      `;
      altriDiv.appendChild(altriTitle);
      
      altriCampi.forEach(campo => {
        const campoDiv = document.createElement('div');
        campoDiv.style.cssText = `
          margin-bottom: 10px;
          padding: 8px;
          background: white;
          border-radius: 4px;
          border: 1px solid #e9ecef;
        `;
        
        const label = document.createElement('strong');
        label.textContent = `${campo}: `;
        label.style.color = '#495057';
        
        if (isEditMode) {
          // Modalità modifica
          const input = document.createElement('input');
          input.type = 'text';
          input.value = struttura[campo] || '';
          input.placeholder = 'Non specificato';
          input.style.cssText = `
            width: 100%;
            padding: 4px 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
          `;
          input.onchange = (e) => {
            struttura[campo] = e.target.value;
          };
          
          campoDiv.appendChild(label);
          campoDiv.appendChild(input);
        } else {
          // Modalità visualizzazione
          const value = document.createElement('span');
          const valore = struttura[campo];
          
          if (valore === undefined || valore === null || valore === '') {
            value.textContent = 'Non specificato';
            value.style.color = '#6c757d';
            value.style.fontStyle = 'italic';
          } else if (typeof valore === 'boolean') {
            value.textContent = valore ? 'Sì' : 'No';
            value.style.color = valore ? '#28a745' : '#dc3545';
            value.style.fontWeight = 'bold';
          } else {
            value.textContent = valore;
            value.style.color = '#212529';
          }
          
          campoDiv.appendChild(label);
          campoDiv.appendChild(value);
        }
        
        altriDiv.appendChild(campoDiv);
      });
      
      content.appendChild(altriDiv);
    }
  }
  
  // Funzione per alternare modalità
  function toggleEditMode() {
    isEditMode = !isEditMode;
    editBtn.style.display = isEditMode ? 'none' : 'inline-block';
    saveBtn.style.display = isEditMode ? 'inline-block' : 'none';
    cancelBtn.style.display = isEditMode ? 'inline-block' : 'none';
    creaContenutoScheda();
  }
  
  // Per le nuove strutture, inizia direttamente in modalità modifica
  if (isNewStructure) {
    isEditMode = true;
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
  }
  
  // Funzione per salvare modifiche
  async function salvaModificheScheda(strutturaId) {
    try {
      if (isNewStructure) {
        // Crea nuova struttura in Firestore
        const docRef = await addDoc(colRef, struttura);
        
        // Aggiorna l'ID locale con quello di Firestore
        struttura.id = docRef.id;
        const index = strutture.findIndex(s => s.id === strutturaId);
        if (index !== -1) {
          strutture[index] = { ...struttura };
        }
        
        alert('✅ Nuova struttura creata con successo!');
        modalScheda.remove();
  aggiornaLista();
        
      } else {
        // Aggiorna struttura esistente
        const docRef = doc(db, "strutture", strutturaId);
        await updateDoc(docRef, struttura);
        
        // Aggiorna la struttura locale
        const index = strutture.findIndex(s => s.id === strutturaId);
        if (index !== -1) {
          strutture[index] = { ...struttura };
        }
        
        alert('✅ Modifiche salvate con successo!');
        toggleEditMode();
      }
      
    } catch (error) {
      console.error('❌ Errore nel salvataggio:', error);
      alert('❌ Errore nel salvataggio: ' + error.message);
    }
  }
  
  // Inizializza contenuto
  creaContenutoScheda();
  
  modalContent.appendChild(header);
  modalContent.appendChild(content);
  modalScheda.appendChild(modalContent);
  document.body.appendChild(modalScheda);
  
  // Chiudi modal cliccando fuori
  modalScheda.addEventListener('click', (e) => {
    if (e.target === modalScheda) {
      if (isNewStructure) {
        // Rimuovi la struttura temporanea
        const index = strutture.findIndex(s => s.id === strutturaId);
        if (index !== -1) {
          strutture.splice(index, 1);
        }
      }
      modalScheda.remove();
    }
  });
}

// Rendi la funzione e le variabili globali per essere accessibili dalla dashboard
window.mostraSchedaCompleta = mostraSchedaCompleta;
window.strutture = strutture;

// === Reset filtri ===
function resetFiltri() {
  document.getElementById('search').value = '';
  document.getElementById('filter-prov').value = '';
  document.getElementById('filter-casa').checked = false;
  document.getElementById('filter-terreno').checked = false;
  
  // Reset filtri rapidi
  filtroRapidoAttivo = 'all';
  document.querySelectorAll('.quick-filter').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector('[data-filter="all"]').classList.add('active');
  
  // Riabilita filtri tradizionali
  document.getElementById('filter-casa').disabled = false;
  document.getElementById('filter-terreno').disabled = false;
  
  // Reset contatore
  const contatore = document.getElementById('contatore-risultati');
  if (contatore) contatore.remove();
  
  renderStrutture(filtra(strutture));
}

// === Aggiorna lista ===
let strutture = [];
async function aggiornaLista() {
  strutture = await caricaStrutture();
  renderStrutture(filtra(strutture));
}

// === Indicatore di caricamento ===
function mostraCaricamento() {
  const container = document.getElementById("results");
  container.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Caricamento strutture...</p>
    </div>
  `;
}

// === Inizializzazione pagina ===
window.addEventListener("DOMContentLoaded", async () => {
  mostraCaricamento();
  
  try {
  strutture = await caricaStrutture();
  renderStrutture(strutture);
    aggiornaContatoreElenco();
    
    // Mostra messaggio informativo se si usano dati locali
    if (strutture.length > 0 && strutture[0].id.startsWith('demo-')) {
      const container = document.getElementById("results");
      const infoDiv = document.createElement('div');
      infoDiv.className = 'info-message';
      infoDiv.innerHTML = `
        <div class="info-banner">
          <strong>ℹ️ Modalità Demo</strong> - Stai visualizzando dati di esempio. 
          <button onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
      `;
      container.insertBefore(infoDiv, container.firstChild);
    }
  } catch (error) {
    console.error('Errore nel caricamento:', error);
    const container = document.getElementById("results");
    container.innerHTML = `
      <div class="error">
        <h3>⚠️ Errore nel caricamento</h3>
        <p>Impossibile caricare le strutture. Controlla la connessione e riprova.</p>
        <button onclick="location.reload()">🔄 Ricarica pagina</button>
      </div>
    `;
  }

  // Popola le province
  const province = [...new Set(strutture.map(s => s.Prov).filter(Boolean))].sort();
  const provSelect = document.getElementById("filter-prov");
  province.forEach(prov => {
    const option = document.createElement("option");
    option.value = prov;
    option.textContent = prov;
    provSelect.appendChild(option);
  });

  // Event listeners
  document.getElementById("search").addEventListener("input", () => {
    renderStrutture(filtra(strutture));
  });
  document.getElementById("filter-prov").addEventListener("change", () => {
    renderStrutture(filtra(strutture));
  });
  document.getElementById("filter-casa").addEventListener("change", () => {
    renderStrutture(filtra(strutture));
  });
  document.getElementById("filter-terreno").addEventListener("change", () => {
    renderStrutture(filtra(strutture));
  });
  document.getElementById("sort-by").addEventListener("change", () => {
    paginaCorrente = 1; // Reset alla prima pagina
    renderStrutture(filtra(strutture));
  });
  
  // Event listeners per filtri rapidi
  document.querySelectorAll('.quick-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const filtro = btn.dataset.filter;
      applicaFiltroRapido(filtro);
    });
  });
  
  // Inizializza filtro "Tutte" come attivo
  document.querySelector('[data-filter="all"]').classList.add('active');
  document.getElementById("add-btn").addEventListener("click", aggiungiStruttura);
  document.getElementById("resetBtn").addEventListener("click", resetFiltri);
  document.getElementById("exportBtn").addEventListener("click", esportaElencoPersonale);
  document.getElementById("reloadBtn").addEventListener("click", async () => {
    mostraCaricamento();
    try {
      strutture = await caricaStrutture();
      renderStrutture(strutture);
      aggiornaContatoreElenco();
    } catch (error) {
      console.error('Errore nel ricaricamento:', error);
    }
  });
  document.getElementById("importBtn").addEventListener("click", avviaImportazioneExcel);
  document.getElementById("cleanupBtn").addEventListener("click", rimuoviDuplicatiEsistenti);
  document.getElementById("excelFile").addEventListener("change", importaExcel);
  
  // Event listeners per il modale
  document.getElementById("closeModal").addEventListener("click", chiudiModale);
  document.getElementById("cancelBtn").addEventListener("click", chiudiModale);
  document.getElementById("saveBtn").addEventListener("click", salvaModifiche);
  document.getElementById("deleteBtn").addEventListener("click", () => {
    if (strutturaCorrente && confirm("Vuoi davvero eliminare questa struttura?")) {
      eliminaStruttura(strutturaCorrente.id);
      chiudiModale();
    }
  });
  
  // Chiudi modale cliccando fuori
  document.getElementById("modal").addEventListener("click", (e) => {
    if (e.target.id === "modal") chiudiModale();
  });
});
