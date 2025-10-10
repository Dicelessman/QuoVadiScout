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
    Branco: false,
    Reparto: false,
    Compagnia: false,
    Referente: '',
    Email: '',
    Sito: '',
    Contatto: '',
    IIcontatto: '',
    'Ultimo controllo': '',
    Note: ''
  };
  
  // Aggiungi la struttura temporanea all'array
  strutture.push(nuovaStruttura);
  
  // Aggiorna le strutture globali
  window.strutture = strutture;
  
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
        // Aggiorna le strutture globali
        window.strutture = strutture;
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
        // Aggiorna le strutture globali
        window.strutture = strutture;
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
          const isCheckboxField = ['Terreno', 'Casa', 'Branco', 'Reparto', 'Compagnia'].includes(campo);
          
          if (isCheckboxField) {
            // Campo checkbox
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = struttura[campo] === true || struttura[campo] === 'true' || struttura[campo] === 'Sì' || struttura[campo] === 'sì';
            input.style.cssText = `
              margin-left: 10px;
              transform: scale(1.2);
            `;
            input.onchange = (e) => {
              struttura[campo] = e.target.checked;
            };
            
            campoDiv.appendChild(label);
            campoDiv.appendChild(input);
          } else {
            // Campo di testo normale
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
          }
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
    
    // Aggiungi campo Note
    const noteDiv = document.createElement('div');
    noteDiv.style.cssText = `
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      border-left: 4px solid #6c757d;
      grid-column: 1 / -1;
    `;
    
    const noteTitle = document.createElement('h3');
    noteTitle.textContent = 'Note';
    noteTitle.style.cssText = `
      margin: 0 0 15px 0;
      color: #6c757d;
      font-size: 1.1rem;
    `;
    noteDiv.appendChild(noteTitle);
    
    const campoDiv = document.createElement('div');
    campoDiv.style.cssText = `
      margin-bottom: 10px;
      padding: 8px;
      background: white;
      border-radius: 4px;
      border: 1px solid #e9ecef;
    `;
    
    const label = document.createElement('strong');
    label.textContent = 'Note: ';
    label.style.color = '#495057';
    
    if (isEditMode) {
      // Modalità modifica - textarea per note
      const textarea = document.createElement('textarea');
      textarea.value = struttura.Note || '';
      textarea.placeholder = 'Aggiungi note aggiuntive...';
      textarea.rows = 4;
      textarea.style.cssText = `
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        font-family: inherit;
        resize: vertical;
        min-height: 80px;
      `;
      textarea.onchange = (e) => {
        struttura.Note = e.target.value;
      };
      
      campoDiv.appendChild(label);
      campoDiv.appendChild(textarea);
    } else {
      // Modalità visualizzazione
      const value = document.createElement('span');
      const valore = struttura.Note;
      
      if (valore === undefined || valore === null || valore === '') {
        value.textContent = 'Nessuna nota';
        value.style.color = '#6c757d';
        value.style.fontStyle = 'italic';
      } else {
        value.textContent = valore;
        value.style.color = '#212529';
        value.style.whiteSpace = 'pre-wrap';
      }
      
      campoDiv.appendChild(label);
      campoDiv.appendChild(value);
    }
    
    noteDiv.appendChild(campoDiv);
    content.appendChild(noteDiv);
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
        
        // Aggiorna le strutture globali
        window.strutture = strutture;
        
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
        
        // Aggiorna le strutture globali
        window.strutture = strutture;
        
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
          // Aggiorna le strutture globali
          window.strutture = strutture;
        }
      }
      modalScheda.remove();
    }
  });
}

// Rendi la funzione globale per essere accessibile dalla dashboard
window.mostraSchedaCompleta = mostraSchedaCompleta;

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
  
  // Rendi le strutture globali per accesso dalla dashboard
  window.strutture = strutture;
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
