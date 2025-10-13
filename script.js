// === Firebase SDK Imports ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

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
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
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
let elementiPerPagina = 20;

// === Gestione modalità visualizzazione ===
let isListViewMode = false;

function renderStrutture(lista) {
  const container = document.getElementById("results");
  const loadingIndicator = document.getElementById("loadingIndicator");
  const emptyState = document.getElementById("emptyState");
  const resultsCount = document.getElementById("resultsCount");
  
  // Nascondi loading indicator
  if (loadingIndicator) {
    loadingIndicator.classList.add('hidden');
  }
  
  // Aggiorna contatore risultati
  if (resultsCount) {
    resultsCount.textContent = `${lista.length} strutture`;
  }
  
  if (container) {
  container.innerHTML = "";
  }

  if (lista.length === 0) {
    if (emptyState) {
      emptyState.classList.remove('hidden');
    }
    return;
  } else {
    if (emptyState) {
      emptyState.classList.add('hidden');
    }
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

    if (isListViewMode) {
      // Modalità elenco - layout orizzontale compatto
      card.innerHTML = `
        <div class="card-header">
          <h3 class="card-title clickable-title" data-id="${s.id}">${s.Struttura || "Suggerisci nome"}</h3>
          <div class="card-actions">
            <button class="btn btn-ghost toggle-elenco ${isInElenco ? 'in-elenco' : ''}" data-id="${s.id}">
              ${isInElenco ? '⭐' : '☆'}
            </button>
            <button class="btn btn-ghost notes-btn" onclick="mostraNotePersonali('${s.id}')" title="Note personali">
              📝
            </button>
          </div>
        </div>
        
        <div class="card-content">
          <div class="card-field">
            <span class="card-field-icon">📍</span>
            <span class="card-field-value">${s.Luogo || "Luogo non specificato"}, ${s.Prov || "Provincia non specificata"}</span>
          </div>
          
          <div class="card-badges">
            ${s.Casa ? '<span class="badge badge-primary">🏠 Casa</span>' : ''}
            ${s.Terreno ? '<span class="badge badge-primary">🌲 Terreno</span>' : ''}
            ${s.stato ? `<span class="status-badge ${s.stato}">${getStatoLabel(s.stato)}</span>` : ''}
            ${s.rating?.average ? `<span class="rating-badge">⭐ ${s.rating.average.toFixed(1)}</span>` : ''}
            ${s.segnalazioni?.length ? `<span class="reports-badge">⚠️ ${s.segnalazioni.length}</span>` : ''}
          </div>
          
          ${s.Referente || s.Contatto ? `
          <div class="card-field">
            <span class="card-field-icon">👤</span>
            <span class="card-field-value">${s.Referente || ''} ${s.Contatto ? `• ${s.Contatto}` : ''}</span>
          </div>` : ''}
          
          ${s.Info ? `<div class="card-field">
            <span class="card-field-icon">ℹ️</span>
            <span class="card-field-value">${s.Info.length > 100 ? s.Info.substring(0, 100) + '...' : s.Info}</span>
          </div>` : ''}
        </div>
      `;
    } else {
      // Modalità schede - layout verticale completo
      card.innerHTML = `
        <div class="card-header">
          <h3 class="card-title clickable-title" data-id="${s.id}">${s.Struttura || "Suggerisci nome"}</h3>
          <div class="card-actions">
            <button class="btn btn-ghost toggle-elenco ${isInElenco ? 'in-elenco' : ''}" data-id="${s.id}">
              ${isInElenco ? '⭐' : '☆'}
            </button>
            <button class="btn btn-ghost notes-btn" onclick="mostraNotePersonali('${s.id}')" title="Note personali">
              📝
            </button>
          </div>
        </div>
        
        <div class="card-content">
          <div class="card-field">
            <span class="card-field-icon">📍</span>
            <span class="card-field-value">${s.Luogo || "Luogo non specificato"}, ${s.Prov || "Provincia non specificata"}</span>
          </div>
          
          ${s.Info ? `<div class="card-field">
            <span class="card-field-icon">ℹ️</span>
            <span class="card-field-value">${s.Info}</span>
          </div>` : ''}
          
          <div class="card-badges">
            ${s.Casa ? '<span class="badge badge-primary">🏠 Casa</span>' : ''}
            ${s.Terreno ? '<span class="badge badge-primary">🌲 Terreno</span>' : ''}
            ${s.stato ? `<span class="status-badge ${s.stato}">${getStatoLabel(s.stato)}</span>` : ''}
            ${s.rating?.average ? `<span class="rating-badge">⭐ ${s.rating.average.toFixed(1)}</span>` : ''}
            ${s.segnalazioni?.length ? `<span class="reports-badge">⚠️ ${s.segnalazioni.length}</span>` : ''}
          </div>
          
          ${s.Letti || s.Branco || s.Reparto || s.Compagnia ? `
          <div class="card-field">
            <span class="card-field-icon">🏕️</span>
            <span class="card-field-value">
              ${s.Letti ? `Letti: ${s.Letti}` : ''}
              ${s.Branco ? ` • Branco: ${s.Branco}` : ''}
              ${s.Reparto ? ` • Reparto: ${s.Reparto}` : ''}
              ${s.Compagnia ? ` • Compagnia: ${s.Compagnia}` : ''}
            </span>
          </div>` : ''}
          
          ${s.Referente ? `<div class="card-field">
            <span class="card-field-icon">👤</span>
            <span class="card-field-value">${s.Referente}</span>
          </div>` : ''}
          
          ${s.Email ? `<div class="card-field">
            <span class="card-field-icon">📧</span>
            <span class="card-field-value">${s.Email}</span>
          </div>` : ''}
          
          ${s.Sito ? `<div class="card-field">
            <span class="card-field-icon">🌐</span>
            <span class="card-field-value">${s.Sito}</span>
          </div>` : ''}
          
          ${s.Contatto ? `<div class="card-field">
            <span class="card-field-icon">📞</span>
            <span class="card-field-value">${s.Contatto}</span>
          </div>` : ''}
          
          ${s['Ultimo controllo'] ? `<div class="card-field">
            <span class="card-field-icon">📅</span>
            <span class="card-field-value">Ultimo controllo: ${s['Ultimo controllo']}</span>
          </div>` : ''}
        </div>
      `;
    }
    
    container.appendChild(card);
  });

  // Eventi pulsanti
  document.querySelectorAll(".clickable-title").forEach((title) => {
    title.addEventListener("click", () => {
      mostraSchedaCompleta(title.dataset.id);
    });
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
    const paginazione = document.createElement('div');
    paginazione.className = 'paginazione';
  
  // Selettore elementi per pagina
  const itemsPerPageSelector = `
    <div class="pagination-items-per-page">
      <label for="items-per-page">Elementi per pagina:</label>
      <select id="items-per-page" onchange="cambiaElementiPerPagina(this.value)">
        <option value="20" ${elementiPerPagina === 20 ? 'selected' : ''}>20</option>
        <option value="50" ${elementiPerPagina === 50 ? 'selected' : ''}>50</option>
        <option value="100" ${elementiPerPagina === 100 ? 'selected' : ''}>100</option>
        <option value="${lista.length}" ${elementiPerPagina === lista.length ? 'selected' : ''}>Tutte (${lista.length})</option>
      </select>
    </div>
  `;
  
  // Controlli di paginazione (solo se ci sono più pagine)
  const paginationControls = totalePagine > 1 ? `
      <div class="pagination-info">
        Mostrando ${inizio + 1}-${Math.min(fine, lista.length)} di ${lista.length} strutture
      </div>
      <div class="pagination-controls">
        <button ${paginaCorrente === 1 ? 'disabled' : ''} onclick="cambiaPagina(${paginaCorrente - 1})">« Precedente</button>
        <span class="pagination-numbers">
        ${generaNumeriPagina(totalePagine, paginaCorrente)}
        </span>
        <button ${paginaCorrente === totalePagine ? 'disabled' : ''} onclick="cambiaPagina(${paginaCorrente + 1})">Successiva »</button>
      </div>
  ` : `
    <div class="pagination-info">
      Mostrando tutte le ${lista.length} strutture
    </div>
    `;
  
  paginazione.innerHTML = itemsPerPageSelector + paginationControls;
    container.appendChild(paginazione);
}

function cambiaPagina(nuovaPagina) {
  paginaCorrente = Math.max(1, nuovaPagina);
  const listaFiltrata = filtra(strutture);
  renderStrutture(listaFiltrata);
}

function cambiaElementiPerPagina(nuovoValore) {
  elementiPerPagina = parseInt(nuovoValore);
  paginaCorrente = 1; // Reset alla prima pagina
  const listaFiltrata = filtra(strutture);
  renderStrutture(listaFiltrata);
}

function generaNumeriPagina(totalePagine, paginaCorrente) {
  const numeri = [];
  const maxNumeri = 5; // Numero massimo di numeri da mostrare
  
  if (totalePagine <= maxNumeri) {
    // Se ci sono poche pagine, mostra tutte
    for (let i = 1; i <= totalePagine; i++) {
      numeri.push(`<button class="${i === paginaCorrente ? 'active' : ''}" onclick="cambiaPagina(${i})">${i}</button>`);
    }
  } else {
    // Logica per pagine multiple
    let inizio = Math.max(1, paginaCorrente - 2);
    let fine = Math.min(totalePagine, inizio + maxNumeri - 1);
    
    // Aggiusta l'inizio se siamo vicini alla fine
    if (fine - inizio < maxNumeri - 1) {
      inizio = Math.max(1, fine - maxNumeri + 1);
    }
    
    // Aggiungi "..." se necessario
    if (inizio > 1) {
      numeri.push(`<button onclick="cambiaPagina(1)">1</button>`);
      if (inizio > 2) {
        numeri.push(`<span class="pagination-dots">...</span>`);
      }
    }
    
    // Aggiungi i numeri centrali
    for (let i = inizio; i <= fine; i++) {
      numeri.push(`<button class="${i === paginaCorrente ? 'active' : ''}" onclick="cambiaPagina(${i})">${i}</button>`);
    }
    
    // Aggiungi "..." se necessario
    if (fine < totalePagine) {
      if (fine < totalePagine - 1) {
        numeri.push(`<span class="pagination-dots">...</span>`);
      }
      numeri.push(`<button onclick="cambiaPagina(${totalePagine})">${totalePagine}</button>`);
    }
  }
  
  return numeri.join('');
}


// === Ricerca Avanzata ===
function mostraRicercaAvanzata() {
  console.log('🔍 Apertura ricerca avanzata...');
  
  // Rimuovi modal esistente se presente
  const existingModal = document.getElementById('ricercaAvanzataModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'ricercaAvanzataModal';
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
    min-width: 320px;
    width: 100%;
  `;
  
  // Header
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
  title.textContent = '🔍 Ricerca Avanzata';
  title.style.cssText = `
    margin: 0;
    color: #2f6b2f;
    font-size: 1.5rem;
  `;
  
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
  closeBtn.onclick = () => modal.remove();
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  // Form di ricerca
  const form = document.createElement('form');
  form.style.cssText = `
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 20px;
  `;
  
  // Campi di ricerca organizzati per categoria
  const categorie = {
    'Informazioni Principali': [
      { campo: 'Struttura', tipo: 'text', placeholder: 'Nome della struttura' },
      { campo: 'Luogo', tipo: 'text', placeholder: 'Città o località' },
      { campo: 'Indirizzo', tipo: 'text', placeholder: 'Indirizzo completo' },
      { campo: 'Prov', tipo: 'text', placeholder: 'Sigla provincia (es. MI)' },
      { campo: 'Info', tipo: 'textarea', placeholder: 'Informazioni generali' }
    ],
    'Prezzi e Offerte': [
      { campo: '€ notte', tipo: 'text', placeholder: 'Prezzo per notte' },
      { campo: 'Offerta', tipo: 'text', placeholder: 'Offerte speciali' },
      { campo: 'Forfait', tipo: 'text', placeholder: 'Pacchetti forfait' }
    ],
    'Caratteristiche Struttura': [
      { campo: 'Terreno', tipo: 'checkbox', placeholder: 'Disponibile terreno' },
      { campo: 'Casa', tipo: 'checkbox', placeholder: 'Disponibile casa' },
      { campo: 'Letti', tipo: 'text', placeholder: 'Numero di letti' },
      { campo: 'Cucina', tipo: 'text', placeholder: 'Tipo di cucina' },
      { campo: 'Spazi', tipo: 'text', placeholder: 'Spazi disponibili' },
      { campo: 'Fuochi', tipo: 'text', placeholder: 'Disponibilità fuochi' }
    ],
    'Attività e Servizi': [
      { campo: 'Escursioni', tipo: 'text', placeholder: 'Escursioni disponibili' },
      { campo: 'Trasporti', tipo: 'text', placeholder: 'Servizi di trasporto' }
    ],
    'Gruppi Scout': [
      { campo: 'Branco', tipo: 'checkbox', placeholder: 'Adatto per branco' },
      { campo: 'Reparto', tipo: 'checkbox', placeholder: 'Adatto per reparto' },
      { campo: 'Compagnia', tipo: 'checkbox', placeholder: 'Adatto per compagnia' }
    ],
    'Contatti': [
      { campo: 'Referente', tipo: 'text', placeholder: 'Nome del referente' },
      { campo: 'Email', tipo: 'email', placeholder: 'Indirizzo email' },
      { campo: 'Sito', tipo: 'url', placeholder: 'Sito web' },
      { campo: 'Contatto', tipo: 'tel', placeholder: 'Numero di telefono' },
      { campo: 'IIcontatto', tipo: 'tel', placeholder: 'Secondo contatto' }
    ],
    'Gestione': [
      { campo: 'Ultimo controllo', tipo: 'date', placeholder: 'Data ultimo controllo' },
      { campo: 'Note', tipo: 'textarea', placeholder: 'Note aggiuntive' }
    ],
    'Stato e Valutazioni': [
      { campo: 'stato', tipo: 'select', placeholder: 'Stato struttura', options: [
        { value: '', label: 'Tutti gli stati' },
        { value: 'attiva', label: '🟢 Attiva' },
        { value: 'temporaneamente_non_attiva', label: '🟡 Temporaneamente non attiva' },
        { value: 'non_piu_attiva', label: '🔴 Non più attiva' }
      ]},
      { campo: 'rating_min', tipo: 'number', placeholder: 'Rating minimo (1-5)' },
      { campo: 'rating_max', tipo: 'number', placeholder: 'Rating massimo (1-5)' },
      { campo: 'has_images', tipo: 'checkbox', placeholder: 'Ha immagini' },
      { campo: 'has_reports', tipo: 'checkbox', placeholder: 'Ha segnalazioni' }
    ],
    'Posizione Geografica': [
      { campo: 'coordinate_lat', tipo: 'number', placeholder: 'Latitudine' },
      { campo: 'coordinate_lng', tipo: 'number', placeholder: 'Longitudine' },
      { campo: 'distance_km', tipo: 'number', placeholder: 'Distanza massima (km)' },
      { campo: 'near_me', tipo: 'checkbox', placeholder: 'Vicino alla mia posizione' }
    ],
    'Date e Versioni': [
      { campo: 'created_after', tipo: 'date', placeholder: 'Creata dopo' },
      { campo: 'created_before', tipo: 'date', placeholder: 'Creata prima' },
      { campo: 'modified_after', tipo: 'date', placeholder: 'Modificata dopo' },
      { campo: 'modified_before', tipo: 'date', placeholder: 'Modificata prima' }
    ]
  };
  
  Object.entries(categorie).forEach(([nomeCategoria, campi]) => {
    const categoriaDiv = document.createElement('div');
    categoriaDiv.className = 'categoria-div';
    categoriaDiv.style.cssText = `
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      border-left: 4px solid #2f6b2f;
    `;
    
    const categoriaTitle = document.createElement('h3');
    categoriaTitle.className = 'categoria-title';
    categoriaTitle.textContent = nomeCategoria;
    categoriaTitle.style.cssText = `
      margin: 0 0 15px 0;
      color: #2f6b2f;
      font-size: 1.1rem;
    `;
    categoriaDiv.appendChild(categoriaTitle);
    
    campi.forEach(({ campo, tipo, placeholder, options }) => {
      const campoDiv = document.createElement('div');
      campoDiv.className = 'campo-div';
      campoDiv.style.cssText = `
        margin-bottom: 12px;
      `;
      
      const label = document.createElement('label');
      label.textContent = campo;
      label.style.cssText = `
        display: block;
        font-weight: 500;
        color: #495057;
        margin-bottom: 4px;
        font-size: 14px;
      `;
      
      let input;
      if (tipo === 'checkbox') {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `search-${campo.replace(/\s+/g, '-')}`;
        input.style.cssText = `
          margin-right: 8px;
          transform: scale(1.1);
        `;
        
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'checkbox-div';
        checkboxDiv.style.cssText = `
          display: flex;
          align-items: center;
        `;
        checkboxDiv.appendChild(input);
        checkboxDiv.appendChild(label);
        campoDiv.appendChild(checkboxDiv);
      } else if (tipo === 'select') {
        input = document.createElement('select');
        input.id = `search-${campo.replace(/\s+/g, '-')}`;
        input.style.cssText = `
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        `;
        
        // Aggiungi opzioni
        if (options) {
          options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            input.appendChild(optionElement);
          });
        }
        
        campoDiv.appendChild(label);
        campoDiv.appendChild(input);
      } else if (tipo === 'textarea') {
        input = document.createElement('textarea');
        input.id = `search-${campo.replace(/\s+/g, '-')}`;
        input.placeholder = placeholder;
        input.rows = 3;
        input.style.cssText = `
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
        `;
        
        campoDiv.appendChild(label);
        campoDiv.appendChild(input);
      } else if (tipo === 'number') {
        input = document.createElement('input');
        input.type = 'number';
        input.id = `search-${campo.replace(/\s+/g, '-')}`;
        input.placeholder = placeholder;
        input.style.cssText = `
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        `;
        
        // Aggiungi min/max per rating
        if (campo.includes('rating')) {
          input.min = 1;
          input.max = 5;
          input.step = 0.1;
        }
        
        campoDiv.appendChild(label);
        campoDiv.appendChild(input);
      } else {
        input = document.createElement('input');
        input.type = tipo;
        input.id = `search-${campo.replace(/\s+/g, '-')}`;
        input.placeholder = placeholder;
        input.style.cssText = `
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        `;
        
        campoDiv.appendChild(label);
        campoDiv.appendChild(input);
      }
      
      categoriaDiv.appendChild(campoDiv);
    });
    
    form.appendChild(categoriaDiv);
  });
  
  // Footer con pulsanti
  const footer = document.createElement('div');
  footer.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #e9ecef;
    gap: 10px;
  `;
  
  const leftActions = document.createElement('div');
  leftActions.style.cssText = `display: flex; gap: 10px;`;
  
  const clearBtn = document.createElement('button');
  clearBtn.innerHTML = '🧹 Pulisci';
  clearBtn.type = 'button';
  clearBtn.style.cssText = `
    background: #6c757d;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;
  clearBtn.onclick = () => {
    form.reset();
    // Pulisci anche i filtri attivi
    document.getElementById('search').value = '';
    document.getElementById('filter-prov').value = '';
    document.getElementById('filter-casa').checked = false;
    document.getElementById('filter-terreno').checked = false;
    renderStrutture(filtra(strutture));
  };
  
  const rightActions = document.createElement('div');
  rightActions.style.cssText = `display: flex; gap: 10px;`;
  
  const saveBtn = document.createElement('button');
  saveBtn.innerHTML = '💾 Salva Filtri';
  saveBtn.type = 'button';
  saveBtn.style.cssText = `
    background: #17a2b8;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;
  saveBtn.onclick = () => {
    salvaFiltriAvanzati();
  };
  
  const searchBtn = document.createElement('button');
  searchBtn.innerHTML = '🔍 Cerca';
  searchBtn.type = 'button';
  searchBtn.style.cssText = `
    background: #28a745;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;
  searchBtn.onclick = () => {
    const filtriAvanzati = raccogliFiltriAvanzati();
    applicaRicercaAvanzata(filtriAvanzati);
    modal.remove();
  };
  
  const cancelBtn = document.createElement('button');
  cancelBtn.innerHTML = '❌ Annulla';
  cancelBtn.type = 'button';
  cancelBtn.style.cssText = `
    background: #dc3545;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;
  cancelBtn.onclick = () => modal.remove();
  
  leftActions.appendChild(clearBtn);
  rightActions.appendChild(saveBtn);
  rightActions.appendChild(cancelBtn);
  rightActions.appendChild(searchBtn);
  
  footer.appendChild(leftActions);
  footer.appendChild(rightActions);
  
  modalContent.appendChild(header);
  modalContent.appendChild(form);
  modalContent.appendChild(footer);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Chiudi cliccando fuori
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function raccogliFiltriAvanzati() {
  const filtri = {};
  
  // Raccogli tutti i valori dai campi di ricerca avanzata
  document.querySelectorAll('#ricercaAvanzataModal input, #ricercaAvanzataModal textarea, #ricercaAvanzataModal select').forEach(input => {
    const campo = input.id.replace('search-', '').replace(/-/g, ' ');
    
    if (input.type === 'checkbox') {
      if (input.checked) {
        filtri[campo] = true;
      }
    } else if (input.type === 'number') {
      const value = parseFloat(input.value);
      if (!isNaN(value) && value !== '') {
        filtri[campo] = value;
      }
    } else if (input.type === 'date') {
      if (input.value) {
        filtri[campo] = new Date(input.value);
      }
    } else if (input.value.trim() !== '') {
      filtri[campo] = input.value.trim();
    }
  });
  
  return filtri;
}

function applicaRicercaAvanzata(filtriAvanzati) {
  // Salva i filtri avanzati per usarli nella funzione filtra
  window.filtriAvanzatiAttivi = filtriAvanzati;
  
  // Reset paginazione
  paginaCorrente = 1;
  
  // Applica i filtri
  const listaFiltrata = filtra(strutture);
  renderStrutture(listaFiltrata);
  
  // Mostra indicatore di ricerca avanzata attiva
  mostraIndicatoreRicercaAvanzata(Object.keys(filtriAvanzati).length);
}

// === Gestione Filtri Salvati ===
async function salvaFiltriAvanzati() {
  const filtri = raccogliFiltriAvanzati();
  
  if (Object.keys(filtri).length === 0) {
    alert('Non ci sono filtri da salvare!');
    return;
  }
  
  const nomeFiltro = prompt('Inserisci un nome per questi filtri:');
  if (!nomeFiltro || nomeFiltro.trim() === '') {
    return;
  }
  
  try {
    if (!utenteCorrente) {
      alert('Devi essere loggato per salvare i filtri!');
      return;
    }
    
    const filtroData = {
      userId: utenteCorrente.uid,
      nome: nomeFiltro.trim(),
      filtri: filtri,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await addDoc(collection(db, "user_filters"), filtroData);
    
    // Log attività
    await logActivity('filter_saved', nomeFiltro, utenteCorrente.uid, {
      filterCount: Object.keys(filtri).length
    });
    
    alert('✅ Filtri salvati con successo!');
    console.log('✅ Filtri salvati:', nomeFiltro);
  } catch (error) {
    console.error('❌ Errore nel salvataggio filtri:', error);
    alert('Errore nel salvataggio dei filtri');
  }
}

async function caricaFiltriSalvati() {
  try {
    if (!utenteCorrente) return [];
    
    const filtersRef = collection(db, "user_filters");
    const q = query(
      filtersRef, 
      where("userId", "==", utenteCorrente.uid)
    );
    const snapshot = await getDocs(q);
    const filtri = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Ordina localmente per evitare problemi di indice
    return filtri.sort((a, b) => {
      const dateA = a.updatedAt?.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt || 0);
      const dateB = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt || 0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Errore nel caricamento filtri salvati:', error);
    return [];
  }
}

async function applicaFiltriSalvati(filtroId) {
  try {
    const filtroDoc = await getDoc(doc(db, "user_filters", filtroId));
    if (!filtroDoc.exists()) {
      alert('Filtro non trovato!');
      return;
    }
    
    const filtroData = filtroDoc.data();
    window.filtriAvanzatiAttivi = filtroData.filtri;
    
    // Reset paginazione
    paginaCorrente = 1;
    
    // Applica i filtri
    const listaFiltrata = filtra(strutture);
    renderStrutture(listaFiltrata);
    
    // Mostra indicatore
    mostraIndicatoreRicercaAvanzata(Object.keys(filtroData.filtri).length);
    
    console.log('✅ Filtri applicati:', filtroData.nome);
  } catch (error) {
    console.error('Errore nell\'applicazione filtri salvati:', error);
    alert('Errore nell\'applicazione dei filtri');
  }
}

function mostraIndicatoreRicercaAvanzata(numeroFiltri) {
  console.log('🔍 Mostra indicatore ricerca avanzata:', numeroFiltri);
  
  // Rimuovi indicatore esistente
  const existingIndicator = document.getElementById('indicatore-ricerca-avanzata');
  if (existingIndicator) {
    existingIndicator.remove();
  }
  
  if (numeroFiltri > 0) {
    const indicator = document.createElement('div');
    indicator.id = 'indicatore-ricerca-avanzata';
    indicator.style.cssText = `
      background: #17a2b8;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      margin: 8px auto;
      display: flex;
      align-items: center;
      gap: 6px;
      justify-content: center;
      max-width: 300px;
    `;
    indicator.innerHTML = `
      🔍 Ricerca avanzata attiva (${numeroFiltri} filtri)
      <button onclick="rimuoviRicercaAvanzata()" style="background:none;border:none;color:white;cursor:pointer;font-size:14px;margin-left:4px;">✕</button>
    `;
    
    // Trova un elemento appropriato nella nuova UI per mostrare l'indicatore
    const searchSection = document.querySelector('.search-section');
    const resultsHeader = document.querySelector('.results-header');
    const mainContent = document.querySelector('.main-content');
    
    // Prova diversi elementi in ordine di priorità
    let targetElement = null;
    
    if (searchSection) {
      // Aggiungi dopo la search section
      targetElement = searchSection.parentNode;
      indicator.style.margin = '8px 0';
    } else if (resultsHeader) {
      targetElement = resultsHeader;
    } else if (mainContent) {
      targetElement = mainContent;
    } else {
      // Fallback: aggiungi al body
      targetElement = document.body;
      indicator.style.position = 'fixed';
      indicator.style.top = '70px';
      indicator.style.left = '50%';
      indicator.style.transform = 'translateX(-50%)';
      indicator.style.zIndex = '999';
    }
    
    if (targetElement) {
      try {
        if (searchSection && targetElement === searchSection.parentNode) {
          // Inserisci dopo search section
          searchSection.parentNode.insertBefore(indicator, searchSection.nextSibling);
        } else {
          // Aggiungi come primo elemento
          targetElement.insertBefore(indicator, targetElement.firstChild);
        }
        console.log('✅ Indicatore aggiunto con successo');
      } catch (error) {
        console.error('❌ Errore nell\'aggiunta dell\'indicatore:', error);
        // Fallback sicuro
        document.body.appendChild(indicator);
      }
    } else {
      console.error('❌ Nessun elemento target trovato per l\'indicatore');
    }
  }
}

function rimuoviRicercaAvanzata() {
  window.filtriAvanzatiAttivi = null;
  
  const indicator = document.getElementById('indicatore-ricerca-avanzata');
  if (indicator) {
    indicator.remove();
  }
  
  // Ricarica i risultati senza filtri avanzati
  const listaFiltrata = filtra(strutture);
  renderStrutture(listaFiltrata);
}

// === Filtri e ricerca ===

function filtra(lista) {
  const q = document.getElementById("search").value.toLowerCase();
  const prov = document.getElementById("filter-prov").value;
  const casa = document.getElementById("filter-casa").checked;
  const terreno = document.getElementById("filter-terreno").checked;
  const stato = document.getElementById("filter-stato").value;

  let filtrata = lista.filter((s) => {
    // Filtri base
    const matchTesto =
      s.Struttura?.toLowerCase().includes(q) ||
      s.Luogo?.toLowerCase().includes(q) ||
      s.Info?.toLowerCase().includes(q) ||
      s.Referente?.toLowerCase().includes(q);
    const matchProv = !prov || s.Prov === prov;
    const matchCasa = !casa || s.Casa === true;
    const matchTerreno = !terreno || s.Terreno === true;
    const matchStato = !stato || s.stato === stato;
    
    // Filtri avanzati
    let matchAvanzati = true;
    if (window.filtriAvanzatiAttivi) {
      for (const [campo, valore] of Object.entries(window.filtriAvanzatiAttivi)) {
        if (valore === true) {
          // Per checkbox, verifica che il valore sia true
          matchAvanzati = matchAvanzati && s[campo] === true;
        } else if (typeof valore === 'string') {
          // Per campi di testo, verifica che contenga il valore (case insensitive)
          matchAvanzati = matchAvanzati && 
            s[campo] && 
            s[campo].toString().toLowerCase().includes(valore.toLowerCase());
        } else if (typeof valore === 'number') {
          // Per numeri (rating, coordinate, etc.)
          if (campo === 'rating_min') {
            matchAvanzati = matchAvanzati && (s.rating?.average || 0) >= valore;
          } else if (campo === 'rating_max') {
            matchAvanzati = matchAvanzati && (s.rating?.average || 0) <= valore;
          } else if (campo === 'coordinate_lat') {
            matchAvanzati = matchAvanzati && s.coordinate?.lat && Math.abs(s.coordinate.lat - valore) < 0.01;
          } else if (campo === 'coordinate_lng') {
            matchAvanzati = matchAvanzati && s.coordinate?.lng && Math.abs(s.coordinate.lng - valore) < 0.01;
          } else if (campo === 'distance_km') {
            // Calcola distanza se coordinate disponibili
            if (s.coordinate?.lat && s.coordinate?.lng) {
              // Implementa calcolo distanza se necessario
              matchAvanzati = matchAvanzati && true; // Placeholder
            }
          }
        } else if (valore instanceof Date) {
          // Per date
          if (campo === 'created_after') {
            matchAvanzati = matchAvanzati && s.createdAt && new Date(s.createdAt) >= valore;
          } else if (campo === 'created_before') {
            matchAvanzati = matchAvanzati && s.createdAt && new Date(s.createdAt) <= valore;
          } else if (campo === 'modified_after') {
            matchAvanzati = matchAvanzati && s.lastModified && new Date(s.lastModified) >= valore;
          } else if (campo === 'modified_before') {
            matchAvanzati = matchAvanzati && s.lastModified && new Date(s.lastModified) <= valore;
          }
        }
        
        // Filtri speciali
        if (campo === 'has_images') {
          matchAvanzati = matchAvanzati && s.immagini && s.immagini.length > 0;
        } else if (campo === 'has_reports') {
          matchAvanzati = matchAvanzati && s.segnalazioni && s.segnalazioni.length > 0;
        } else if (campo === 'near_me') {
          // Implementa geolocalizzazione se necessario
          matchAvanzati = matchAvanzati && true; // Placeholder
        }
      }
    }
    
    return matchTesto && matchProv && matchCasa && matchTerreno && matchStato && matchAvanzati;
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
      default:
        return 0;
    }
  });

  return filtrata;
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
    
    <label>
      Stato Struttura
      <select id="edit-stato">
        <option value="attiva" ${strutturaCorrente.stato === 'attiva' ? 'selected' : ''}>🟢 Attiva</option>
        <option value="temporaneamente_non_attiva" ${strutturaCorrente.stato === 'temporaneamente_non_attiva' ? 'selected' : ''}>🟡 Temporaneamente non attiva</option>
        <option value="non_piu_attiva" ${strutturaCorrente.stato === 'non_piu_attiva' ? 'selected' : ''}>🔴 Non più attiva</option>
      </select>
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
    stato: document.getElementById('edit-stato').value,
    Info: document.getElementById('edit-info').value.trim(),
    // Aggiorna metadati
    lastModified: new Date(),
    lastModifiedBy: utenteCorrente?.uid || null,
    version: (strutturaCorrente.version || 1) + 1
  };
  
  // Validazione
  if (!formData.Struttura) {
    alert('Il nome della struttura è obbligatorio!');
    return;
  }
  
  try {
    // Salva versione precedente prima di modificare
    await salvaVersione(strutturaCorrente, utenteCorrente?.uid);
    
    // Aggiorna struttura
    await updateDoc(doc(db, "strutture", strutturaCorrente.id), formData);
    
    // Log attività
    await logActivity('structure_updated', strutturaCorrente.id, utenteCorrente?.uid, {
      changes: Object.keys(formData).filter(key => formData[key] !== strutturaCorrente[key])
    });
    
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

async function eliminaStrutturaConConferma(id) {
  const struttura = strutture.find(s => s.id === id);
  if (!struttura) {
    console.error('Struttura non trovata:', id);
    return;
  }
  
  // Rimuovi modal esistente se presente
  const existingModal = document.getElementById('confirmDeleteModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'confirmDeleteModal';
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
    z-index: 10003;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 30px;
    max-width: 95%;
    width: 90%;
    min-width: 320px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    text-align: center;
  `;
  
  modalContent.innerHTML = `
    <div style="margin-bottom: 20px;">
      <div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
      <h2 style="color: #dc3545; margin: 0 0 10px 0;">Conferma Eliminazione</h2>
      <p style="color: #666; margin: 0;">
        Sei sicuro di voler eliminare la struttura:
      </p>
    </div>
    
    <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 20px; border-left: 4px solid #dc3545;">
      <h3 style="margin: 0 0 8px 0; color: #2f6b2f;">${struttura.Struttura || 'Senza nome'}</h3>
      <p style="margin: 0; color: #666; font-size: 14px;">
        📍 ${struttura.Luogo || 'N/A'}, ${struttura.Prov || 'N/A'}
        ${struttura.Referente ? `<br>👤 Referente: ${struttura.Referente}` : ''}
      </p>
    </div>
    
    <div style="background: #fff5f5; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
      <p style="margin: 0; color: #721c24; font-size: 14px; font-weight: bold;">
        ⚠️ ATTENZIONE: Questa azione non può essere annullata!
      </p>
    </div>
    
    <div style="display: flex; gap: 10px; justify-content: center;">
      <button id="cancelDeleteBtn" 
              style="background: #6c757d; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px;">
        ❌ Annulla
      </button>
      <button id="confirmDeleteBtn" 
              style="background: #dc3545; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;">
        🗑️ Elimina Definitivamente
      </button>
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Event listeners
  document.getElementById('cancelDeleteBtn').onclick = () => {
    modal.remove();
  };
  
  document.getElementById('confirmDeleteBtn').onclick = async () => {
    try {
      modal.remove();
      // Chiudi anche la scheda completa se aperta
      if (modalScheda) {
        modalScheda.remove();
      }
      await deleteDoc(doc(db, "strutture", id));
      aggiornaLista();
      
      // Mostra messaggio di successo
      const successModal = document.createElement('div');
      successModal.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10004;
        animation: slideIn 0.3s ease-out;
      `;
      successModal.innerHTML = '✅ Struttura eliminata con successo!';
      
      // Aggiungi CSS per animazione
      if (!document.getElementById('deleteSuccessStyles')) {
        const style = document.createElement('style');
        style.id = 'deleteSuccessStyles';
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(successModal);
      
      // Rimuovi messaggio dopo 3 secondi
      setTimeout(() => {
        if (successModal.parentNode) {
          successModal.remove();
        }
      }, 3000);
      
    } catch (error) {
      console.error('❌ Errore nell\'eliminazione:', error);
      alert('❌ Errore nell\'eliminazione: ' + error.message);
    }
  };
  
  // Chiudi cliccando fuori
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
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
    Note: '',
    // Nuovi campi per il sistema avanzato
    stato: 'attiva',
    coordinate: { lat: null, lng: null },
    rating: { total: 0, count: 0, average: 0 },
    segnalazioni: [],
    immagini: [],
    lastModified: new Date(),
    lastModifiedBy: auth.currentUser?.uid || null,
    createdAt: new Date(),
    createdBy: auth.currentUser?.uid || null,
    version: 1
  };
  
  // Aggiungi la struttura temporanea all'array
  strutture.push(nuovaStruttura);
  
  // Aggiorna le strutture globali
  window.strutture = strutture;
  
  // Apri la scheda in modalità creazione
  mostraSchedaCompleta(nuovaStruttura.id);
}

// === Sistema di Versioning e Activity Log ===
async function salvaVersione(struttura, userId) {
  try {
    const versionData = {
      strutturaId: struttura.id,
      version: struttura.version || 1,
      data: { ...struttura },
      savedAt: new Date(),
      savedBy: userId
    };
    
    await addDoc(collection(db, "structure_versions"), versionData);
    console.log(`✅ Versione ${struttura.version} salvata per struttura ${struttura.id}`);
  } catch (error) {
    console.error('❌ Errore nel salvataggio versione:', error);
  }
}

async function getVersionHistory(strutturaId) {
  try {
    const versionsRef = collection(db, "structure_versions");
    const q = query(versionsRef, where("strutturaId", "==", strutturaId), orderBy("savedAt", "desc"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('❌ Errore nel recupero cronologia:', error);
    return [];
  }
}

async function ripristinaVersione(strutturaId, version) {
  try {
    const versionsRef = collection(db, "structure_versions");
    const q = query(versionsRef, where("strutturaId", "==", strutturaId), where("version", "==", version));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Versione non trovata');
    }
    
    const versionData = snapshot.docs[0].data();
    const docRef = doc(db, "strutture", strutturaId);
    
    // Aggiorna la struttura con i dati della versione
    await updateDoc(docRef, {
      ...versionData.data,
      lastModified: new Date(),
      lastModifiedBy: utenteCorrente?.uid || null,
      version: versionData.version + 1
    });
    
    console.log(`✅ Struttura ${strutturaId} ripristinata alla versione ${version}`);
    return true;
  } catch (error) {
    console.error('❌ Errore nel ripristino versione:', error);
    return false;
  }
}

async function logActivity(action, entity, userId, details = {}) {
  try {
    // Ottieni informazioni utente correnti
    const userInfo = utenteCorrente ? {
      userName: utenteCorrente.displayName || utenteCorrente.email?.split('@')[0] || 'Utente',
      userEmail: utenteCorrente.email || 'N/A'
    } : {
      userName: 'Utente sconosciuto',
      userEmail: 'N/A'
    };
    
    const activityData = {
      action,
      entity,
      userId,
      ...userInfo,
      details,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      ip: await getClientIP() // Funzione helper per IP
    };
    
    await addDoc(collection(db, "activity_log"), activityData);
    console.log(`📝 Attività loggata: ${action} su ${entity}`);
  } catch (error) {
    console.error('❌ Errore nel logging attività:', error);
  }
}

// Helper function per ottenere IP client (semplificata)
async function getClientIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}

// Helper functions per stati strutture
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

// === Gestione Note Personali ===
async function mostraNotePersonali(strutturaId) {
  const struttura = strutture.find(s => s.id === strutturaId);
  if (!struttura) return;
  
  // Rimuovi modal esistente se presente
  const existingModal = document.getElementById('noteModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'noteModal';
  modal.setAttribute('data-struttura-id', strutturaId);
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
  
  // Carica note esistenti
  const noteEsistenti = await caricaNotePersonali(strutturaId);
  
  modalContent.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h3 style="margin: 0; color: #2f6b2f;">📝 Note Personali</h3>
      <button id="closeNoteModal" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button>
    </div>
    
    <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
      <strong>${struttura.Struttura || 'Struttura senza nome'}</strong><br>
      <span style="color: #666;">📍 ${struttura.Luogo || 'N/A'}, ${struttura.Prov || 'N/A'}</span>
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Aggiungi nuova nota:</label>
      <textarea id="nuovaNota" placeholder="Scrivi qui le tue note personali su questa struttura..." 
                style="width: 100%; height: 100px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"></textarea>
    </div>
    
    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
      <button id="salvaNota" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
        💾 Salva Nota
      </button>
      <button id="cancellaNota" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
        🗑️ Cancella Testo
      </button>
    </div>
    
    <div id="noteEsistenti" style="max-height: 300px; overflow-y: auto;">
      ${noteEsistenti.length > 0 ? 
        noteEsistenti.map(nota => `
          <div style="background: #e8f5e8; border-left: 4px solid #28a745; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
            <div style="font-size: 12px; color: #666; margin-bottom: 5px;">
              📅 ${new Date(nota.createdAt).toLocaleString('it-IT')}
            </div>
            <div style="white-space: pre-wrap;">${nota.nota}</div>
            <button onclick="eliminaNota('${nota.id}')" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 12px; margin-top: 5px;">
              🗑️ Elimina
            </button>
          </div>
        `).join('') : 
        '<div style="text-align: center; color: #666; padding: 20px;">Nessuna nota personale salvata</div>'
      }
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Event listeners
  document.getElementById('closeNoteModal').onclick = () => modal.remove();
  document.getElementById('cancellaNota').onclick = () => {
    document.getElementById('nuovaNota').value = '';
  };
  
  document.getElementById('salvaNota').onclick = async () => {
    const testoNota = document.getElementById('nuovaNota').value.trim();
    if (!testoNota) {
      alert('Inserisci una nota prima di salvarla!');
      return;
    }
    
    try {
      await salvaNotaPersonale(strutturaId, testoNota);
      document.getElementById('nuovaNota').value = '';
      modal.remove();
      mostraNotePersonali(strutturaId); // Ricarica il modal con le nuove note
    } catch (error) {
      console.error('Errore nel salvataggio nota:', error);
      alert('Errore nel salvataggio della nota');
    }
  };
  
  // Chiudi cliccando fuori
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

async function caricaNotePersonali(strutturaId) {
  try {
    if (!utenteCorrente) return [];
    
    const notesRef = collection(db, "user_notes");
    const q = query(
      notesRef, 
      where("userId", "==", utenteCorrente.uid),
      where("strutturaId", "==", strutturaId)
    );
    const snapshot = await getDocs(q);
    
    const note = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Converti timestamp Firestore in Date JavaScript
        createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date(),
        updatedAt: data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)) : new Date()
      };
    });
    
    // Ordina localmente per data di creazione (più recenti prima)
    note.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });
    
    return note;
  } catch (error) {
    console.error('Errore nel caricamento note:', error);
    return [];
  }
}

async function salvaNotaPersonale(strutturaId, nota) {
  try {
    if (!utenteCorrente) {
      alert('Devi essere loggato per salvare note personali');
      return;
    }
    
    const noteData = {
      userId: utenteCorrente.uid,
      strutturaId: strutturaId,
      nota: nota,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await addDoc(collection(db, "user_notes"), noteData);
    
    // Log attività
    await logActivity('note_created', strutturaId, utenteCorrente.uid, {
      noteLength: nota.length
    });
    
    console.log('✅ Nota personale salvata');
  } catch (error) {
    console.error('Errore nel salvataggio nota:', error);
    throw error;
  }
}

async function eliminaNota(notaId) {
  try {
    if (!utenteCorrente) {
      alert('Devi essere loggato per eliminare note');
      return;
    }
    
    if (!confirm('Sei sicuro di voler eliminare questa nota?')) {
      return;
    }
    
    await deleteDoc(doc(db, "user_notes", notaId));
    
    // Log attività
    await logActivity('note_deleted', notaId, utenteCorrente.uid);
    
    // Ricarica il modal delle note
    const modal = document.getElementById('noteModal');
    if (modal) {
      // Trova la strutturaId dal modal per ricaricare
      const strutturaId = modal.querySelector('[data-struttura-id]')?.dataset.strutturaId;
      if (strutturaId) {
        // Ricarica le note
        const noteEsistenti = await caricaNotePersonali(strutturaId);
        const noteContainer = document.getElementById('noteEsistenti');
        if (noteContainer) {
          noteContainer.innerHTML = noteEsistenti.length > 0 ? 
            noteEsistenti.map(nota => `
              <div style="background: #e8f5e8; border-left: 4px solid #28a745; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
                <div style="font-size: 12px; color: #666; margin-bottom: 5px;">
                  📅 ${nota.createdAt.toLocaleString('it-IT')}
                </div>
                <div style="white-space: pre-wrap;">${nota.nota}</div>
                <button onclick="eliminaNota('${nota.id}')" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 12px; margin-top: 5px;">
                  🗑️ Elimina
                </button>
              </div>
            `).join('') : 
            '<div style="text-align: center; color: #666; padding: 20px;">Nessuna nota personale salvata</div>';
        }
      }
    }
    
    console.log('✅ Nota eliminata con successo');
  } catch (error) {
    console.error('Errore nell\'eliminazione nota:', error);
    alert('Errore nell\'eliminazione della nota');
  }
}

// Rendi le funzioni accessibili globalmente
window.eliminaNota = eliminaNota;
window.mostraFeedAttivita = mostraFeedAttivita;
window.trovaVicinoAMe = trovaVicinoAMe;
window.geocodificaTutteStrutture = geocodificaTutteStrutture;
window.loginWithEmail = loginWithEmail;
window.registerWithEmail = registerWithEmail;
window.loginWithGoogle = loginWithGoogle;
window.logoutUser = logoutUser;
window.aggiungiStruttura = aggiungiStruttura;
window.modificaStruttura = modificaStruttura;
window.eliminaStruttura = eliminaStruttura;
window.eliminaStrutturaConConferma = eliminaStrutturaConConferma;
window.filtra = filtra;
window.mostraRicercaAvanzata = mostraRicercaAvanzata;
window.rimuoviRicercaAvanzata = rimuoviRicercaAvanzata;
window.esportaElencoPersonale = esportaElencoPersonale;
window.mostraGestioneElencoPersonale = mostraGestioneElencoPersonale;
window.mostraNotePersonali = mostraNotePersonali;
window.salvaNotaPersonale = salvaNotaPersonale;

// === Helper per Modali Responsive ===
function createResponsiveModal(id, title, content) {
  // Rimuovi modal esistente se presente
  const existingModal = document.getElementById(id);
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = id;
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
    z-index: 10000;
    padding: 10px;
    box-sizing: border-box;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 20px;
    max-width: 100%;
    max-height: 95vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    position: relative;
    width: 100%;
    box-sizing: border-box;
  `;
  
  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #2f6b2f;
  `;
  
  const titleEl = document.createElement('h2');
  titleEl.textContent = title;
  titleEl.style.cssText = `
    margin: 0;
    color: #2f6b2f;
    font-size: 1.5rem;
  `;
  
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
  closeBtn.onclick = () => modal.remove();
  
  header.appendChild(titleEl);
  header.appendChild(closeBtn);
  
  modalContent.appendChild(header);
  modalContent.appendChild(content);
  modal.appendChild(modalContent);
  
  // Chiudi modal cliccando fuori
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Media query per mobile
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  function handleMobileView(e) {
    if (e.matches) {
      // Mobile: modal a schermo intero
      modalContent.style.cssText = `
        background: white;
        border-radius: 0;
        padding: 15px;
        max-width: 100%;
        max-height: 100vh;
        overflow-y: auto;
        box-shadow: none;
        position: relative;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
      `;
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        display: flex;
        align-items: stretch;
        justify-content: stretch;
        z-index: 10000;
        padding: 0;
        box-sizing: border-box;
      `;
    } else {
      // Desktop: modal centrato
      modalContent.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 20px;
        max-width: 90%;
        max-height: 95vh;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        position: relative;
        width: 100%;
        box-sizing: border-box;
      `;
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
        z-index: 10000;
        padding: 10px;
        box-sizing: border-box;
      `;
    }
  }
  
  // Applica stili iniziali
  handleMobileView(mediaQuery);
  
  // Ascolta cambiamenti di viewport
  mediaQuery.addListener(handleMobileView);
  
  // Pulisci listener quando il modal viene rimosso
  const observer = new MutationObserver(() => {
    if (!document.getElementById(id)) {
      mediaQuery.removeListener(handleMobileView);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  
  document.body.appendChild(modal);
  return modal;
}

// === Gestione Mappe ===
async function mostraMappa() {
  // Rimuovi modal esistente se presente
  const existingModal = document.getElementById('mapModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'mapModal';
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
    z-index: 10000;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 20px;
    max-width: 95%;
    max-height: 95%;
    width: 100%;
    height: 90%;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    position: relative;
    display: flex;
    flex-direction: column;
  `;
  
  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #2f6b2f;
  `;
  
  const title = document.createElement('h2');
  title.textContent = '🗺️ Mappa Strutture';
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
  
  const centerBtn = document.createElement('button');
  centerBtn.innerHTML = '📍 Centro su di me';
  centerBtn.style.cssText = `
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  `;
  centerBtn.onclick = async () => {
    try {
      await window.centerMapOnUser();
    } catch (error) {
      alert('Impossibile ottenere la tua posizione');
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
  closeBtn.onclick = () => modal.remove();
  
  controls.appendChild(centerBtn);
  controls.appendChild(closeBtn);
  
  header.appendChild(title);
  header.appendChild(controls);
  
  // Container mappa
  const mapContainer = document.createElement('div');
  mapContainer.id = 'map';
  mapContainer.style.cssText = `
    flex: 1;
    min-height: 400px;
    border-radius: 8px;
    overflow: hidden;
  `;
  
  modalContent.appendChild(header);
  modalContent.appendChild(mapContainer);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Inizializza mappa
  try {
    // Debug: verifica se la funzione esiste
    if (typeof window.initializeMap !== 'function') {
      console.error('❌ window.initializeMap non è disponibile');
      console.log('🔍 Funzioni disponibili su window:', Object.keys(window).filter(key => key.includes('Map')));
      console.log('🔍 window.mapsManager disponibile:', typeof window.mapsManager);
      throw new Error('Funzione initializeMap non disponibile');
    }
    
    await window.initializeMap('map');
    
    // Mostra tutte le strutture sulla mappa
    const listaFiltrata = filtra(strutture);
    window.showStructuresOnMap(listaFiltrata);
    
    console.log('✅ Mappa inizializzata con', listaFiltrata.length, 'strutture');
  } catch (error) {
    console.error('❌ Errore inizializzazione mappa:', error);
    mapContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">Errore nel caricamento della mappa</div>';
  }
  
  // Chiudi cliccando fuori
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Rendi la funzione accessibile globalmente
window.mostraMappa = mostraMappa;

// === Sistema Rating ===
async function voteStructure(strutturaId, rating) {
  try {
    if (!utenteCorrente) {
      alert('Devi essere loggato per votare una struttura');
      return;
    }

    const struttura = strutture.find(s => s.id === strutturaId);
    if (!struttura) {
      console.error('Struttura non trovata:', strutturaId);
      return;
    }

    // Inizializza rating se non esiste
    if (!struttura.rating) {
      struttura.rating = { total: 0, count: 0, average: 0 };
    }

    // Salva il voto su Firestore
    const voteData = {
      userId: utenteCorrente.uid,
      strutturaId: strutturaId,
      rating: rating,
      createdAt: new Date(),
      userName: utenteCorrente.displayName || utenteCorrente.email?.split('@')[0] || 'Utente'
    };

    await addDoc(collection(db, "structure_ratings"), voteData);

    // Aggiorna il rating della struttura
    struttura.rating.count += 1;
    struttura.rating.total += rating;
    struttura.rating.average = struttura.rating.total / struttura.rating.count;

    // Salva su Firestore
    await updateDoc(doc(db, "strutture", strutturaId), {
      rating: struttura.rating,
      lastModified: new Date(),
      lastModifiedBy: utenteCorrente.uid
    });

    // Log attività
    await logActivity('structure_rated', strutturaId, utenteCorrente.uid, {
      rating: rating,
      newAverage: struttura.rating.average
    });

    // Aggiorna la scheda se è aperta
    const modalScheda = document.getElementById('schedaCompletaModal');
    if (modalScheda) {
      // Chiudi e riapri la scheda per mostrare il rating aggiornato
      modalScheda.remove();
      // Ri-apri la scheda con i dati aggiornati
      setTimeout(() => {
        mostraSchedaCompleta(strutturaId);
      }, 100);
    }

    // Aggiorna la lista
    const listaFiltrata = filtra(strutture);
    renderStrutture(listaFiltrata);

    console.log(`✅ Voto ${rating}/5 registrato per ${struttura.Struttura}`);
    
    // Mostra notifica
    if (window.showNotification) {
      window.showNotification(
        '⭐ Voto registrato!',
        {
          body: `Hai votato ${rating}/5 stelle per ${struttura.Struttura}`,
          tag: 'vote-success'
        }
      );
    }
  } catch (error) {
    console.error('❌ Errore nel salvataggio voto:', error);
    alert('Errore nel salvataggio del voto');
  }
}

// Rendi la funzione accessibile globalmente
window.voteStructure = voteStructure;

// === Sistema Segnalazioni ===
async function mostraSegnalazione(strutturaId) {
  const struttura = strutture.find(s => s.id === strutturaId);
  if (!struttura) {
    console.error('Struttura non trovata:', strutturaId);
    return;
  }
  
  // Rimuovi modal esistente se presente
  const existingModal = document.getElementById('reportModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'reportModal';
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
      <h3 style="margin: 0; color: #dc3545;">⚠️ Segnala Problema</h3>
      <button id="closeReportModal" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button>
    </div>
    
    <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
      <strong>Struttura:</strong> ${struttura.Struttura || 'Senza nome'}<br>
      <span style="color: #666;">📍 ${struttura.Luogo || 'N/A'}, ${struttura.Prov || 'N/A'}</span>
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Tipo di problema:</label>
      <select id="reportType" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <option value="dati_obsoleti">Dati obsoleti o non aggiornati</option>
        <option value="struttura_chiusa">Struttura chiusa o non più disponibile</option>
        <option value="info_errate">Informazioni errate o incomplete</option>
        <option value="contatto_non_funzionante">Contatti non funzionanti</option>
        <option value="prezzi_aggiornati">Prezzi non aggiornati</option>
        <option value="altro">Altro</option>
      </select>
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Descrizione del problema:</label>
      <textarea id="reportDescription" placeholder="Descrivi il problema riscontrato..." 
                style="width: 100%; height: 100px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"></textarea>
    </div>
    
    <div style="display: flex; gap: 10px; justify-content: flex-end;">
      <button id="cancelReport" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
        ❌ Annulla
      </button>
      <button id="submitReport" style="background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
        📤 Invia Segnalazione
      </button>
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Event listeners
  document.getElementById('closeReportModal').onclick = () => modal.remove();
  document.getElementById('cancelReport').onclick = () => modal.remove();
  
  document.getElementById('submitReport').onclick = async () => {
    const reportType = document.getElementById('reportType').value;
    const description = document.getElementById('reportDescription').value.trim();
    
    if (!description) {
      alert('Inserisci una descrizione del problema!');
      return;
    }
    
    try {
      await inviaSegnalazione(strutturaId, reportType, description);
      modal.remove();
    } catch (error) {
      console.error('Errore nell\'invio segnalazione:', error);
      alert('Errore nell\'invio della segnalazione');
    }
  };
  
  // Chiudi cliccando fuori
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

async function inviaSegnalazione(strutturaId, tipo, descrizione) {
  try {
    const struttura = strutture.find(s => s.id === strutturaId);
    if (!struttura) {
      throw new Error('Struttura non trovata');
    }

    // Crea la segnalazione
    const reportData = {
      strutturaId: strutturaId,
      strutturaNome: struttura.Struttura || 'Senza nome',
      tipo: tipo,
      descrizione: descrizione,
      userId: utenteCorrente?.uid || null,
      userName: utenteCorrente?.displayName || utenteCorrente?.email?.split('@')[0] || 'Utente anonimo',
      userEmail: utenteCorrente?.email || null,
      createdAt: new Date(),
      status: 'pending', // pending, reviewed, resolved
      reviewedBy: null,
      reviewedAt: null
    };

    // Salva su Firestore
    await addDoc(collection(db, "structure_reports"), reportData);

    // Aggiorna il contatore segnalazioni nella struttura
    if (!struttura.segnalazioni) {
      struttura.segnalazioni = [];
    }
    
    struttura.segnalazioni.push({
      tipo: tipo,
      descrizione: descrizione,
      createdAt: new Date(),
      userId: utenteCorrente?.uid || null
    });

    // Aggiorna su Firestore
    await updateDoc(doc(db, "strutture", strutturaId), {
      segnalazioni: struttura.segnalazioni,
      lastModified: new Date(),
      lastModifiedBy: utenteCorrente?.uid || null
    });

    // Log attività
    await logActivity('report_submitted', strutturaId, utenteCorrente?.uid || 'anonymous', {
      reportType: tipo,
      reportDescription: descrizione.substring(0, 100)
    });

    console.log('✅ Segnalazione inviata per:', struttura.Struttura);
    
    // Mostra notifica
    if (window.showNotification) {
      window.showNotification(
        '⚠️ Segnalazione inviata',
        {
          body: `La tua segnalazione per ${struttura.Struttura} è stata inviata`,
          tag: 'report-success'
        }
      );
    }
    
    alert('✅ Segnalazione inviata con successo! Grazie per il tuo contributo.');
  } catch (error) {
    console.error('❌ Errore nell\'invio segnalazione:', error);
    throw error;
  }
}

// Rendi le funzioni accessibili globalmente
window.mostraSegnalazione = mostraSegnalazione;
window.inviaSegnalazione = inviaSegnalazione;

// === Ottimizzazioni Performance ===
function setupLazyLoading() {
  // Verifica se l'Intersection Observer è supportato
  if (!('IntersectionObserver' in window)) {
    console.log('⚠️ Intersection Observer non supportato, caricamento immagini normale');
    return;
  }

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        
        // Carica l'immagine
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          img.classList.add('loaded');
        }
        
        // Rimuovi l'observer per questa immagine
        imageObserver.unobserve(img);
      }
    });
  }, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  });

  // Osserva tutte le immagini lazy
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });

  console.log('✅ Lazy loading configurato');
}

// Funzione per creare immagini lazy
function createLazyImage(src, alt = '', className = '') {
  const img = document.createElement('img');
  img.dataset.src = src;
  img.alt = alt;
  img.className = `lazy ${className}`;
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjhmOWZhIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2Yzc1N2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5GvIENhcmljYW1lbnRvLi4uPC90ZXh0Pgo8L3N2Zz4='; // Placeholder SVG
  
  // Stili per il placeholder
  img.style.cssText = `
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    transition: opacity 0.3s ease;
  `;
  
  img.onload = () => {
    img.style.opacity = '1';
  };
  
  return img;
}

// Cache intelligente per i dati
class DataCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minuti
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Verifica se è scaduto
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

// Inizializza cache globale
window.dataCache = new DataCache();

// Funzione per caricare dati con cache
async function loadDataWithCache(key, loaderFunction) {
  // Verifica cache
  if (window.dataCache.has(key)) {
    console.log(`📦 Dati caricati da cache: ${key}`);
    return window.dataCache.get(key);
  }

  // Carica dati
  console.log(`🌐 Caricamento dati da server: ${key}`);
  const data = await loaderFunction();
  
  // Salva in cache
  window.dataCache.set(key, data);
  
  return data;
}

// Paginazione ottimizzata con virtual scrolling
function setupVirtualScrolling(container, items, itemsPerPage = 20) {
  let currentPage = 1;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  function renderPage(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = items.slice(start, end);
    
    container.innerHTML = '';
    pageItems.forEach(item => {
      // Renderizza l'item
      const itemElement = document.createElement('div');
      itemElement.className = 'virtual-item';
      // Aggiungi contenuto dell'item
      container.appendChild(itemElement);
    });
  }
  
  function nextPage() {
    if (currentPage < totalPages) {
      currentPage++;
      renderPage(currentPage);
    }
  }
  
  function prevPage() {
    if (currentPage > 1) {
      currentPage--;
      renderPage(currentPage);
    }
  }
  
  // Inizializza prima pagina
  renderPage(1);
  
  return {
    nextPage,
    prevPage,
    currentPage: () => currentPage,
    totalPages: () => totalPages
  };
}

// Skeleton screens per caricamento
function showSkeletonScreen(container, type = 'cards') {
  const skeletonHTML = {
    cards: `
      <div class="skeleton-card">
        <div class="skeleton-header"></div>
        <div class="skeleton-content">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
        </div>
      </div>
    `,
    list: `
      <div class="skeleton-list-item">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-content">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    `
  };
  
  container.innerHTML = skeletonHTML[type].repeat(5);
}

// Rendi le funzioni accessibili globalmente
window.setupLazyLoading = setupLazyLoading;
window.createLazyImage = createLazyImage;
window.loadDataWithCache = loadDataWithCache;
window.setupVirtualScrolling = setupVirtualScrolling;
window.showSkeletonScreen = showSkeletonScreen;

// === Gestione Temi ===
class ThemeManager {
  constructor() {
    this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
    this.applyTheme(this.currentTheme);
  }

  getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  getStoredTheme() {
    return localStorage.getItem('theme');
  }

  storeTheme(theme) {
    localStorage.setItem('theme', theme);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    this.storeTheme(theme);
    
    // Aggiorna l'icona del toggle
    this.updateToggleIcon(theme);
    
    console.log(`🎨 Tema applicato: ${theme}`);
  }

  updateToggleIcon(theme) {
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      const sunIcon = toggle.querySelector('.sun-icon');
      if (sunIcon) {
        sunIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
      }
    }
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    
    // Mostra notifica
    if (window.showNotification) {
      window.showNotification(
        `🎨 Tema ${newTheme === 'dark' ? 'scuro' : 'chiaro'} attivato`,
        {
          body: `L'interfaccia è stata aggiornata al tema ${newTheme === 'dark' ? 'scuro' : 'chiaro'}`,
          tag: 'theme-change'
        }
      );
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }
}

// Inizializza il gestore dei temi
const themeManager = new ThemeManager();

// Funzione per il toggle del tema
function toggleTheme() {
  themeManager.toggleTheme();
}

// Rendi le funzioni accessibili globalmente
window.toggleTheme = toggleTheme;
window.themeManager = themeManager;

// === Gestione Utenti Firebase ===
let utenteCorrente = null;
let userProfile = null;

// Inizializza il sistema di autenticazione
function inizializzaAuth() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Utente autenticato
      utenteCorrente = user;
      console.log('✅ Utente autenticato:', user.email);
      
      // Nascondi schermata di login
      nascondiSchermataLogin();
      
      // Carica profilo utente da Firestore
      await caricaProfiloUtente(user.uid);
      
      // Aggiorna UI
      aggiornaUIUtente();
      caricaElencoPersonaleUtente();
      
      // Aggiorna contatore elenco
      aggiornaContatoreElenco();
    } else {
      // Utente non autenticato
      utenteCorrente = null;
      userProfile = null;
      elencoPersonale = [];
      console.log('❌ Nessun utente autenticato');
      
      // Mostra schermata di login
      mostraSchermataLogin();
    }
  });
}

async function caricaProfiloUtente(uid) {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      userProfile = userDoc.data();
      console.log('📋 Profilo utente caricato:', userProfile);
    } else {
      // Crea profilo utente se non esiste
      userProfile = {
        nome: utenteCorrente.displayName || utenteCorrente.email.split('@')[0],
        email: utenteCorrente.email,
        dataCreazione: new Date().toISOString(),
        elencoPersonale: []
      };
      
      await setDoc(userDocRef, userProfile);
      console.log('✅ Nuovo profilo utente creato');
    }
  } catch (error) {
    console.error('❌ Errore caricamento profilo:', error);
  }
}

function mostraSchermataLogin() {
  // Nascondi il contenuto principale
  const main = document.querySelector('main');
  const header = document.querySelector('header');
  if (main) main.style.display = 'none';
  if (header) header.style.display = 'none';
  
  // Rimuovi modal esistente se presente
  const existingModal = document.getElementById('loginModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'loginModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #2f6b2f 0%, #28a745 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 16px;
    padding: 40px;
    max-width: 95%;
    width: 90%;
    min-width: 320px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    text-align: center;
  `;
  
  modalContent.innerHTML = `
    <div style="margin-bottom: 30px;">
      <h1 style="color: #2f6b2f; margin: 0 0 10px 0; font-size: 2rem;">🏕️ QuoVadiScout</h1>
      <p style="color: #666; margin: 0;">Strutture e Terreni per Scout</p>
    </div>
    
    <div id="loginForm" style="margin-bottom: 20px;">
      <input type="email" id="loginEmail" placeholder="Email" 
             style="width: 100%; padding: 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; margin-bottom: 15px; box-sizing: border-box;">
      
      <input type="password" id="loginPassword" placeholder="Password" 
             style="width: 100%; padding: 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; margin-bottom: 20px; box-sizing: border-box;">
      
      <button id="loginBtn" 
              style="background: #28a745; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; font-size: 16px; width: 100%; margin-bottom: 15px;">
        🔑 Accedi
      </button>
      
      <button id="googleLoginBtn" 
              style="background: #4285f4; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; font-size: 16px; width: 100%; margin-bottom: 15px;">
        🌐 Accedi con Google
      </button>
      
      <button id="showRegisterBtn" 
              style="background: transparent; color: #666; border: 1px solid #ddd; padding: 15px 30px; border-radius: 8px; cursor: pointer; font-size: 16px; width: 100%;">
        📝 Crea Account
      </button>
    </div>
    
    <div id="registerForm" style="margin-bottom: 20px; display: none;">
      <input type="text" id="registerNome" placeholder="Nome utente" 
             style="width: 100%; padding: 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; margin-bottom: 15px; box-sizing: border-box;">
      
      <input type="email" id="registerEmail" placeholder="Email" 
             style="width: 100%; padding: 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; margin-bottom: 15px; box-sizing: border-box;">
      
      <input type="password" id="registerPassword" placeholder="Password (min. 6 caratteri)" 
             style="width: 100%; padding: 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; margin-bottom: 20px; box-sizing: border-box;">
      
      <button id="registerBtn" 
              style="background: #007bff; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; font-size: 16px; width: 100%; margin-bottom: 15px;">
        ✨ Registrati
      </button>
      
      <button id="showLoginBtn" 
              style="background: transparent; color: #666; border: 1px solid #ddd; padding: 15px 30px; border-radius: 8px; cursor: pointer; font-size: 16px; width: 100%;">
        ← Torna al Login
      </button>
    </div>
    
    <div id="loadingMessage" style="display: none; color: #28a745; font-weight: bold;">
      <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid #28a745; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 10px;"></div>
      Caricamento...
    </div>
    
    <div id="errorMessage" style="display: none; color: #dc3545; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin-top: 20px;"></div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Aggiungi CSS per animazione
  if (!document.getElementById('authStyles')) {
    const style = document.createElement('style');
    style.id = 'authStyles';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Event listeners
  setupAuthEventListeners();
}

function setupAuthEventListeners() {
  // Toggle tra login e registrazione
  document.getElementById('showRegisterBtn').onclick = () => {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    hideError();
  };
  
  document.getElementById('showLoginBtn').onclick = () => {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    hideError();
  };
  
  // Login con email/password
  document.getElementById('loginBtn').onclick = async () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
      showError('⚠️ Inserisci email e password');
      return;
    }
    
    await loginWithEmail(email, password);
  };
  
  // Registrazione
  document.getElementById('registerBtn').onclick = async () => {
    const nome = document.getElementById('registerNome').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (!nome || !email || !password) {
      showError('⚠️ Compila tutti i campi');
      return;
    }
    
    if (password.length < 6) {
      showError('⚠️ La password deve essere di almeno 6 caratteri');
      return;
    }
    
    await registerWithEmail(nome, email, password);
  };
  
  // Login con Google
  document.getElementById('googleLoginBtn').onclick = async () => {
    await loginWithGoogle();
  };
  
  // Enter per login
  document.getElementById('loginPassword').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('loginBtn').click();
    }
  });
}

async function loginWithEmail(email, password) {
  try {
    showLoading(true);
    hideError();
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Login riuscito:', userCredential.user.email);
    
    // La UI si aggiornerà automaticamente tramite onAuthStateChanged
    
  } catch (error) {
    console.error('❌ Errore login:', error);
    let errorMessage = 'Errore durante il login';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = '❌ Utente non trovato';
        break;
      case 'auth/wrong-password':
        errorMessage = '❌ Password errata';
        break;
      case 'auth/invalid-email':
        errorMessage = '❌ Email non valida';
        break;
      case 'auth/too-many-requests':
        errorMessage = '❌ Troppi tentativi, riprova più tardi';
        break;
    }
    
    showError(errorMessage);
  } finally {
    showLoading(false);
  }
}

async function registerWithEmail(nome, email, password) {
  try {
    showLoading(true);
    hideError();
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Aggiorna il profilo con il nome
    await userCredential.user.updateProfile({
      displayName: nome
    });
    
    console.log('✅ Registrazione riuscita:', userCredential.user.email);
    
    // Il profilo verrà creato automaticamente in caricaProfiloUtente
    
  } catch (error) {
    console.error('❌ Errore registrazione:', error);
    let errorMessage = 'Errore durante la registrazione';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = '❌ Email già in uso';
        break;
      case 'auth/weak-password':
        errorMessage = '❌ Password troppo debole';
        break;
      case 'auth/invalid-email':
        errorMessage = '❌ Email non valida';
        break;
    }
    
    showError(errorMessage);
  } finally {
    showLoading(false);
  }
}

async function loginWithGoogle() {
  try {
    showLoading(true);
    hideError();
    
    const result = await signInWithPopup(auth, googleProvider);
    console.log('✅ Login Google riuscito:', result.user.email);
    
    // La UI si aggiornerà automaticamente tramite onAuthStateChanged
    
  } catch (error) {
    console.error('❌ Errore login Google:', error);
    
    if (error.code === 'auth/popup-closed-by-user') {
      showError('❌ Login annullato');
    } else {
      showError('❌ Errore durante il login con Google');
    }
  } finally {
    showLoading(false);
  }
}

async function logoutUser() {
  try {
    // Salva l'elenco personale prima del logout
    await salvaElencoPersonaleUtente();
    
    // Effettua il logout
    await signOut(auth);
    console.log('✅ Logout riuscito');
    
    // La UI si aggiornerà automaticamente tramite onAuthStateChanged
    
  } catch (error) {
    console.error('❌ Errore logout:', error);
    alert('Errore durante il logout');
  }
}

function showLoading(show) {
  const loading = document.getElementById('loadingMessage');
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const googleBtn = document.getElementById('googleLoginBtn');
  
  if (loading) loading.style.display = show ? 'block' : 'none';
  if (loginBtn) loginBtn.disabled = show;
  if (registerBtn) registerBtn.disabled = show;
  if (googleBtn) googleBtn.disabled = show;
}

function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
}

function hideError() {
  const errorDiv = document.getElementById('errorMessage');
  if (errorDiv) {
    errorDiv.style.display = 'none';
  }
}

// Funzioni rimosse - ora gestite da Firebase Auth

// === Gestione Errori UI ===
function safeUpdateElement(elementId, updateFunction) {
  const element = document.getElementById(elementId);
  if (element) {
    try {
      updateFunction(element);
    } catch (error) {
      console.warn(`⚠️ Errore aggiornamento elemento ${elementId}:`, error.message);
    }
  } else {
    console.warn(`⚠️ Elemento ${elementId} non trovato`);
  }
}

function safeQuerySelector(selector, updateFunction) {
  const element = document.querySelector(selector);
  if (element) {
    try {
      updateFunction(element);
    } catch (error) {
      console.warn(`⚠️ Errore aggiornamento elemento ${selector}:`, error.message);
    }
  } else {
    console.warn(`⚠️ Elemento ${selector} non trovato`);
  }
}

function aggiornaUIUtente() {
  const userBtn = document.getElementById('userBtn');
  if (!userBtn) {
    console.warn('⚠️ Pulsante utente non trovato');
    return;
  }
  
  const userIcon = userBtn.querySelector('.user-icon') || userBtn.querySelector('.user-avatar');
  const userName = userBtn.querySelector('.user-name');
  
  if (utenteCorrente) {
    const displayName = userProfile?.nome || utenteCorrente.displayName || utenteCorrente.email.split('@')[0];
    if (userName) userName.textContent = displayName;
    if (userIcon) userIcon.textContent = '👤';
    userBtn.title = `Utente: ${displayName} (${elencoPersonale.length} strutture) - Clicca per disconnetterti`;
    
    // Aggiungi stile per utente autenticato
    userBtn.style.background = '#28a745';
    userBtn.style.color = 'white';
    userBtn.style.borderColor = '#28a745';
  } else {
    if (userName) userName.textContent = 'Accedi';
    if (userIcon) userIcon.textContent = '🔑';
    userBtn.title = 'Accedi o registrati';
    
    // Stile per utente non autenticato
    userBtn.style.background = 'white';
    userBtn.style.color = '#6c757d';
    userBtn.style.borderColor = '#6c757d';
  }
}

function caricaElencoPersonaleUtente() {
  if (userProfile) {
    elencoPersonale = userProfile.elencoPersonale || [];
  } else {
    elencoPersonale = [];
  }
}

async function salvaElencoPersonaleUtente() {
  if (utenteCorrente && userProfile) {
    try {
      // Aggiorna il profilo locale
      userProfile.elencoPersonale = elencoPersonale;
      
      // Salva su Firestore
      const userDocRef = doc(db, 'users', utenteCorrente.uid);
      await updateDoc(userDocRef, {
        elencoPersonale: elencoPersonale,
        ultimoAggiornamento: new Date().toISOString()
      });
      
      console.log('✅ Elenco personale salvato su Firestore');
    } catch (error) {
      console.error('❌ Errore salvataggio elenco personale:', error);
    }
  }
}

function cambiaUtente() {
  if (utenteCorrente) {
    // Mostra conferma logout elegante
    mostraConfermaLogout();
  } else {
    // Se non c'è utente, mostra direttamente la schermata di login
    mostraSchermataLogin();
  }
}

function mostraConfermaLogout() {
  // Rimuovi modal esistente se presente
  const existingModal = document.getElementById('logoutModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'logoutModal';
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
    z-index: 10002;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 30px;
    max-width: 95%;
    width: 90%;
    min-width: 320px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    text-align: center;
  `;
  
  const displayName = userProfile?.nome || utenteCorrente.displayName || utenteCorrente.email.split('@')[0];
  
  modalContent.innerHTML = `
    <div style="margin-bottom: 20px;">
      <div style="font-size: 48px; margin-bottom: 15px;">🚪</div>
      <h2 style="color: #dc3545; margin: 0 0 10px 0;">Conferma Logout</h2>
      <p style="color: #666; margin: 0;">
        Ciao <strong>${displayName}</strong>!<br>
        Vuoi disconnetterti dall'applicazione?
      </p>
    </div>
    
    <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
      <p style="margin: 0; color: #666; font-size: 14px;">
        📋 La tua lista personale (${elencoPersonale.length} elementi) sarà salvata automaticamente e potrai riaccederci al prossimo login.
      </p>
    </div>
    
    <div style="display: flex; gap: 10px; justify-content: center;">
      <button id="cancelLogoutBtn" 
              style="background: #6c757d; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px;">
        ❌ Annulla
      </button>
      <button id="confirmLogoutBtn" 
              style="background: #dc3545; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px;">
        🚪 Disconnetti
      </button>
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Event listeners
  document.getElementById('cancelLogoutBtn').onclick = () => {
    modal.remove();
  };
  
  document.getElementById('confirmLogoutBtn').onclick = async () => {
    modal.remove();
    await logoutUser();
  };
  
  // Chiudi cliccando fuori
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function nascondiSchermataLogin() {
  // Mostra il contenuto principale
  const main = document.querySelector('main');
  const header = document.querySelector('header');
  if (main) main.style.display = 'block';
  if (header) header.style.display = 'flex';
  
  // Rimuovi modal di login
  const loginModal = document.getElementById('loginModal');
  if (loginModal) {
    loginModal.remove();
  }
}

// Funzioni globali rimosse - ora gestite da Firebase Auth

// === Elenco personale ===
let elencoPersonale = [];

function aggiungiAllElenco(id) {
  if (!elencoPersonale.includes(id)) {
    elencoPersonale.push(id);
    salvaElencoPersonaleUtente();
    aggiornaContatoreElenco();
  }
}

function rimuoviDallElenco(id) {
  elencoPersonale = elencoPersonale.filter(item => item !== id);
  salvaElencoPersonaleUtente();
  aggiornaContatoreElenco();
}

function aggiornaContatoreElenco() {
  // Aggiorna contatore principale
  safeUpdateElement('contatore-elenco', (element) => {
    element.textContent = elencoPersonale.length;
  });
  
  // Aggiorna badge nel menu
  safeQuerySelector('.menu-badge', (element) => {
    element.textContent = elencoPersonale.length;
  });
  
  // Aggiorna anche l'UI utente per riflettere il nuovo numero di strutture
  aggiornaUIUtente();
}

// === Gestione Elenco Personale ===
function esportaElencoPersonale() {
  console.log('📤 Avvio esportazione elenco personale...');
  console.log('📋 Strutture in elenco personale:', elencoPersonale.length);
  
  if (elencoPersonale.length === 0) {
    alert('❌ L\'elenco personale è vuoto. Aggiungi alcune strutture prima di esportare.');
    return;
  }
  
  mostraGestioneElencoPersonale();
}

function mostraGestioneElencoPersonale() {
  console.log('📋 Apertura gestione elenco personale...');
  const struttureElenco = strutture.filter(s => elencoPersonale.includes(s.id));
  console.log('📊 Strutture trovate:', struttureElenco.length);
  
  // Rimuovi modal esistente se presente
  const existingModal = document.getElementById('gestioneElencoModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'gestioneElencoModal';
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
    min-width: 320px;
    width: 100%;
  `;
  
  // Header
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
  title.textContent = `📋 Elenco Personale`;
  title.style.cssText = `
    margin: 0;
    color: #2f6b2f;
    font-size: 1.5rem;
  `;
  
  // Toggle visualizzazione per elenco personale
  const headerActions = document.createElement('div');
  headerActions.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
  `;
  
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'modalViewToggle';
  toggleBtn.className = 'btn-view-toggle';
  toggleBtn.innerHTML = `
    <span class="view-icon">📄</span>
    <span class="view-label">Schede</span>
  `;
  toggleBtn.title = 'Cambia visualizzazione';
  
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
  closeBtn.onclick = () => modal.remove();
  
  headerActions.appendChild(toggleBtn);
  headerActions.appendChild(closeBtn);
  
  header.appendChild(title);
  header.appendChild(headerActions);
  
  // Contenuto principale
  const content = document.createElement('div');
  content.style.cssText = `
    margin-bottom: 20px;
  `;
  
  if (struttureElenco.length === 0) {
    content.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #6c757d;">
        <div style="font-size: 3rem; margin-bottom: 20px;">📝</div>
        <h3>Elenco personale vuoto</h3>
        <p>Non hai ancora aggiunto strutture al tuo elenco personale.</p>
        <p>Clicca sulla stella ⭐ nelle schede delle strutture per aggiungerle.</p>
      </div>
    `;
  } else {
    // Lista strutture
    const listaContainer = document.createElement('div');
    listaContainer.className = 'lista-container';
    listaContainer.style.cssText = `
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 10px;
    `;
    
    // Funzione per creare elementi dell'elenco
    const createElencoItem = (struttura, isListMode) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'item-div';
      
      if (isListMode) {
        // Modalità elenco - layout compatto
        itemDiv.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          margin-bottom: 8px;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        `;
        
        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = `flex: 1;`;
        infoDiv.innerHTML = `
          <div style="font-weight: bold; color: #2f6b2f; margin-bottom: 4px;">
            ${struttura.Struttura || 'Senza nome'}
          </div>
          <div style="font-size: 0.9rem; color: #666;">
            📍 ${struttura.Luogo || 'N/A'}, ${struttura.Prov || 'N/A'}
            ${struttura.Referente ? ` | 👤 ${struttura.Referente}` : ''}
          </div>
          <div style="font-size: 0.8rem; color: #888; margin-top: 4px;">
            ${struttura.Casa ? '🏠 Casa' : ''} ${struttura.Terreno ? '🌱 Terreno' : ''}
            ${!struttura.Casa && !struttura.Terreno ? '❓ Senza categoria' : ''}
          </div>
        `;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions-div';
        actionsDiv.style.cssText = `
          display: flex;
          gap: 8px;
          align-items: center;
        `;
        
        const viewBtn = document.createElement('button');
        viewBtn.innerHTML = '👁️';
        viewBtn.title = 'Visualizza scheda completa';
        viewBtn.style.cssText = `
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 6px 10px;
          cursor: pointer;
          font-size: 14px;
        `;
        viewBtn.onclick = () => {
          modal.remove();
          mostraSchedaCompleta(struttura.id);
        };
        
        const notesBtn = document.createElement('button');
        notesBtn.innerHTML = '📝';
        notesBtn.title = 'Note personali';
        notesBtn.style.cssText = `
          background: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 6px 10px;
          cursor: pointer;
          font-size: 14px;
        `;
        notesBtn.onclick = () => {
          mostraNotePersonali(struttura.id);
        };
        
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '🗑️';
        removeBtn.title = 'Rimuovi dall\'elenco';
        removeBtn.style.cssText = `
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 6px 10px;
          cursor: pointer;
          font-size: 14px;
        `;
        removeBtn.onclick = () => {
          rimuoviDallElenco(struttura.id);
          modal.remove();
          mostraGestioneElencoPersonale();
        };
        
        actionsDiv.appendChild(viewBtn);
        actionsDiv.appendChild(notesBtn);
        actionsDiv.appendChild(removeBtn);
        
        itemDiv.appendChild(infoDiv);
        itemDiv.appendChild(actionsDiv);
        
      } else {
        // Modalità schede - layout verticale completo
        itemDiv.style.cssText = `
          display: flex;
          flex-direction: column;
          padding: 16px;
          margin-bottom: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        `;
        
        const headerDiv = document.createElement('div');
        headerDiv.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        `;
        
        const titleDiv = document.createElement('div');
        titleDiv.style.cssText = `
          font-weight: bold;
          color: #2f6b2f;
          font-size: 1.1rem;
          cursor: pointer;
        `;
        titleDiv.textContent = struttura.Struttura || 'Senza nome';
        titleDiv.onclick = () => {
          modal.remove();
          mostraSchedaCompleta(struttura.id);
        };
        
        const actionsDiv = document.createElement('div');
        actionsDiv.style.cssText = `
          display: flex;
          gap: 8px;
        `;
        
        const viewBtn = document.createElement('button');
        viewBtn.innerHTML = '👁️ Visualizza';
        viewBtn.title = 'Visualizza scheda completa';
        viewBtn.style.cssText = `
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 12px;
        `;
        viewBtn.onclick = () => {
          modal.remove();
          mostraSchedaCompleta(struttura.id);
        };
        
        const notesBtn = document.createElement('button');
        notesBtn.innerHTML = '📝 Note';
        notesBtn.title = 'Note personali';
        notesBtn.style.cssText = `
          background: #6f42c1;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 12px;
        `;
        notesBtn.onclick = () => {
          modal.remove();
          mostraNotePersonali(struttura.id);
        };
        
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '🗑️ Rimuovi';
        removeBtn.title = 'Rimuovi dall\'elenco';
        removeBtn.style.cssText = `
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 12px;
        `;
        removeBtn.onclick = () => {
          rimuoviDallElenco(struttura.id);
          modal.remove();
          mostraGestioneElencoPersonale();
        };
        
        actionsDiv.appendChild(viewBtn);
        actionsDiv.appendChild(notesBtn);
        actionsDiv.appendChild(removeBtn);
        
        headerDiv.appendChild(titleDiv);
        headerDiv.appendChild(actionsDiv);
        
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = `
          <div style="margin-bottom: 8px; color: #666;">
            📍 ${struttura.Luogo || 'N/A'}, ${struttura.Prov || 'N/A'}
          </div>
          ${struttura.Referente ? `<div style="margin-bottom: 8px; color: #666;">
            👤 <strong>Referente:</strong> ${struttura.Referente}
          </div>` : ''}
          ${struttura.Contatto ? `<div style="margin-bottom: 8px; color: #666;">
            📞 <strong>Contatto:</strong> ${struttura.Contatto}
          </div>` : ''}
          <div style="margin-bottom: 8px;">
            ${struttura.Casa ? '<span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 8px;">🏠 Casa</span>' : ''}
            ${struttura.Terreno ? '<span style="background: #e8f5e8; color: #2e7d32; padding: 4px 8px; border-radius: 4px; font-size: 12px;">🌱 Terreno</span>' : ''}
          </div>
          ${struttura.Info ? `<div style="font-size: 13px; color: #888; margin-top: 8px;">
            ${struttura.Info.length > 150 ? struttura.Info.substring(0, 150) + '...' : struttura.Info}
          </div>` : ''}
        `;
        
        itemDiv.appendChild(headerDiv);
        itemDiv.appendChild(contentDiv);
      }
      
      return itemDiv;
    };
    
    // Variabile per tracciare la modalità corrente del modale
    let modalListMode = false;
    
    // Genera gli elementi iniziali
    const generateElencoItems = () => {
      listaContainer.innerHTML = '';
      struttureElenco.forEach(struttura => {
        listaContainer.appendChild(createElencoItem(struttura, modalListMode));
      });
    };
    
    // Event listener per il toggle del modale
    toggleBtn.addEventListener('click', () => {
      modalListMode = !modalListMode;
      
      const viewIcon = toggleBtn.querySelector('.view-icon');
      const viewLabel = toggleBtn.querySelector('.view-label');
      
      if (modalListMode) {
        viewIcon.textContent = '📄';
        viewLabel.textContent = 'Schede';
        toggleBtn.classList.add('active');
      } else {
        viewIcon.textContent = '📋';
        viewLabel.textContent = 'Elenco';
        toggleBtn.classList.remove('active');
      }
      
      generateElencoItems();
    });
    
    // Genera gli elementi iniziali
    generateElencoItems();
    
    content.appendChild(listaContainer);
  }
  
  // Footer con azioni
  const footer = document.createElement('div');
  footer.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #e9ecef;
    gap: 10px;
  `;
  
  const leftActions = document.createElement('div');
  leftActions.style.cssText = `display: flex; gap: 10px;`;
  
  const clearAllBtn = document.createElement('button');
  clearAllBtn.innerHTML = '🧹 Svuota Elenco';
  clearAllBtn.style.cssText = `
    background: #ffc107;
    color: #212529;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;
  clearAllBtn.onclick = () => {
    if (confirm('Sei sicuro di voler svuotare completamente l\'elenco personale?')) {
      elencoPersonale = [];
      salvaElencoPersonaleUtente();
      aggiornaContatoreElenco();
      modal.remove();
      mostraGestioneElencoPersonale();
    }
  };
  
  const rightActions = document.createElement('div');
  rightActions.style.cssText = `display: flex; gap: 10px;`;
  
  const exportBtn = document.createElement('button');
  exportBtn.innerHTML = '📤 Esporta';
  exportBtn.style.cssText = `
    background: #28a745;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;
  exportBtn.disabled = struttureElenco.length === 0;
  exportBtn.onclick = () => {
    console.log('📤 Pulsante esportazione cliccato');
    console.log('📊 Strutture da esportare:', struttureElenco.length);
    
    if (struttureElenco.length > 0) {
      console.log('✅ Rimuovo modal e apro menu esportazione');
      modal.remove();
      mostraMenuEsportazione(struttureElenco);
    } else {
      console.log('❌ Nessuna struttura da esportare');
    }
  };
  
  const printBtn = document.createElement('button');
  printBtn.innerHTML = '🖨️ Stampa';
  printBtn.style.cssText = `
    background: #17a2b8;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;
  printBtn.disabled = struttureElenco.length === 0;
  printBtn.onclick = () => {
    if (struttureElenco.length > 0) {
      stampaElenco(struttureElenco);
      modal.remove();
    }
  };
  
  leftActions.appendChild(clearAllBtn);
  rightActions.appendChild(printBtn);
  rightActions.appendChild(exportBtn);
  
  footer.appendChild(leftActions);
  footer.appendChild(rightActions);
  
  modalContent.appendChild(header);
  modalContent.appendChild(content);
  modalContent.appendChild(footer);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Chiudi cliccando fuori
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function mostraMenuEsportazione(struttureElenco) {
  console.log('📋 Apertura menu esportazione...');
  console.log('📊 Strutture ricevute:', struttureElenco.length);
  
  const menu = document.createElement('div');
  menu.className = 'export-menu';
  menu.innerHTML = `
    <div class="export-options">
      <h3>Esporta Elenco Personale (${struttureElenco.length} elementi)</h3>
      <button onclick="esportaJSON()">📄 JSON</button>
      <button onclick="esportaCSV()">📊 CSV</button>
      <button onclick="mostraOpzioniEsportazioneAvanzata()">📊 Export Avanzato</button>
      <button onclick="chiudiMenu()">❌ Chiudi</button>
    </div>
  `;
  
  console.log('✅ Menu creato, aggiungo al DOM');
  document.body.appendChild(menu);
  console.log('✅ Menu aggiunto al DOM');
  
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
  
  window.chiudiMenu = () => {
    document.body.removeChild(menu);
  };
  
  // Wrapper per export avanzato
  window.mostraOpzioniEsportazioneAvanzata = () => {
    // Chiudi il menu corrente
    chiudiMenu();
    // Mostra le opzioni di export avanzato con i dati dell'elenco personale
    if (typeof window.mostraOpzioniEsportazione === 'function') {
      window.mostraOpzioniEsportazione(struttureElenco);
    } else {
      console.error('Funzione mostraOpzioniEsportazione non trovata');
      alert('Funzione di export avanzato non disponibile');
    }
  };
  
  // Salva le strutture dell'elenco in una variabile globale per accesso
  window.struttureElencoPersonale = struttureElenco;
}

// Funzione per export generale (tutte le strutture) - definita più sotto

function stampaElenco(struttureElenco) {
  const printWindow = window.open('', '_blank');
  const printContent = generaContenutoStampa(struttureElenco);
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.print();
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
    min-width: 320px;
    width: 100%;
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
  closeBtn.innerHTML = '← Indietro';
  closeBtn.style.cssText = `
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
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
  
  const reportBtn = document.createElement('button');
  reportBtn.innerHTML = '⚠️ Segnala';
  reportBtn.style.cssText = `
    background: #ffc107;
    color: #212529;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
  `;
  reportBtn.onclick = () => mostraSegnalazione(strutturaId);
  
  controls.appendChild(editBtn);
  controls.appendChild(reportBtn);
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
      ],
      'Valutazioni': [
        'rating'
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
          if (campo === 'rating') {
            // Gestione speciale per il rating
            const ratingDiv = document.createElement('div');
            ratingDiv.style.cssText = `
              display: flex;
              align-items: center;
              gap: 10px;
              margin: 8px 0;
            `;
            
            const ratingLabel = document.createElement('strong');
            ratingLabel.textContent = 'Rating: ';
            ratingLabel.style.color = '#495057';
            
            const starsContainer = document.createElement('div');
            starsContainer.style.cssText = `
              display: flex;
              gap: 2px;
            `;
            
            const currentRating = struttura.rating?.average || 0;
            const totalVotes = struttura.rating?.count || 0;
            
            // Crea le stelle
            for (let i = 1; i <= 5; i++) {
              const star = document.createElement('span');
              star.style.cssText = `
                font-size: 20px;
                color: ${i <= currentRating ? '#ffc107' : '#e9ecef'};
                cursor: pointer;
                transition: color 0.2s;
              `;
              star.textContent = '★';
              star.title = `Vota ${i} stelle`;
              star.onclick = () => voteStructure(struttura.id, i);
              star.onmouseover = () => {
                star.style.color = '#ffc107';
              };
              star.onmouseout = () => {
                star.style.color = i <= currentRating ? '#ffc107' : '#e9ecef';
              };
              starsContainer.appendChild(star);
            }
            
            const ratingInfo = document.createElement('span');
            ratingInfo.textContent = ` (${currentRating.toFixed(1)}/5 - ${totalVotes} voti)`;
            ratingInfo.style.color = '#6c757d';
            ratingInfo.style.fontSize = '14px';
            
            ratingDiv.appendChild(ratingLabel);
            ratingDiv.appendChild(starsContainer);
            ratingDiv.appendChild(ratingInfo);
            
            campoDiv.appendChild(ratingDiv);
          } else {
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
    
    // Aggiungi bottone Elimina solo se non è una nuova struttura
    if (!isNewStructure) {
      const deleteSection = document.createElement('div');
      deleteSection.style.cssText = `
        background: #fff5f5;
        border-radius: 8px;
        padding: 15px;
        border-left: 4px solid #dc3545;
        grid-column: 1 / -1;
        text-align: center;
      `;
      
      const deleteTitle = document.createElement('h3');
      deleteTitle.textContent = 'Zona Pericolosa';
      deleteTitle.style.cssText = `
        margin: 0 0 15px 0;
        color: #dc3545;
        font-size: 1.1rem;
      `;
      deleteSection.appendChild(deleteTitle);
      
      const deleteBtn = document.createElement('button');
      deleteBtn.innerHTML = '🗑️ Elimina Struttura';
      deleteBtn.style.cssText = `
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 12px 24px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
        transition: background-color 0.2s;
      `;
      
      deleteBtn.onmouseover = () => {
        deleteBtn.style.background = '#c82333';
      };
      
      deleteBtn.onmouseout = () => {
        deleteBtn.style.background = '#dc3545';
      };
      
      deleteBtn.onclick = () => {
        eliminaStrutturaConConferma(strutturaId);
      };
      
      deleteSection.appendChild(deleteBtn);
      content.appendChild(deleteSection);
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
        // Aggiorna metadati per nuova struttura
        struttura.lastModified = new Date();
        struttura.lastModifiedBy = utenteCorrente?.uid || null;
        struttura.createdAt = new Date();
        struttura.createdBy = utenteCorrente?.uid || null;
        struttura.version = 1;
        
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
        
        // Log attività
        await logActivity('structure_created', docRef.id, utenteCorrente?.uid, {
          name: struttura.Struttura,
          location: struttura.Luogo
        });
        
        // Notifica push per nuova struttura
        if (window.notifyNewStructure) {
          await window.notifyNewStructure(struttura);
        }
        
        alert('✅ Nuova struttura creata con successo!');
        modalScheda.remove();
        aggiornaLista();
        
      } else {
        // Salva versione precedente prima di modificare
        await salvaVersione(struttura, utenteCorrente?.uid);
        
        // Aggiorna metadati
        struttura.lastModified = new Date();
        struttura.lastModifiedBy = utenteCorrente?.uid || null;
        struttura.version = (struttura.version || 1) + 1;
        
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
        
        // Log attività
        await logActivity('structure_updated', strutturaId, utenteCorrente?.uid, {
          version: struttura.version
        });
        
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

// === Toggle modalità visualizzazione ===
function toggleViewMode() {
  isListViewMode = !isListViewMode;
  
  // Aggiorna il toggle button
  const toggleBtn = document.getElementById('viewToggle');
  const viewIcon = toggleBtn.querySelector('.view-icon');
  const viewLabel = toggleBtn.querySelector('.view-label');
  
  if (isListViewMode) {
    viewIcon.textContent = '📄';
    viewLabel.textContent = 'Schede';
    toggleBtn.classList.add('active');
    
    // Aggiungi classe al body per stili CSS
    document.body.classList.add('list-view');
  } else {
    viewIcon.textContent = '📋';
    viewLabel.textContent = 'Elenco';
    toggleBtn.classList.remove('active');
    
    // Rimuovi classe dal body
    document.body.classList.remove('list-view');
  }
  
  // Ricarica i risultati con la nuova modalità
  const listaFiltrata = filtra(strutture);
  renderStrutture(listaFiltrata);
  
  // Salva preferenza utente
  localStorage.setItem('viewMode', isListViewMode ? 'list' : 'cards');
}

// === Reset filtri ===
function resetFiltri() {
  document.getElementById('search').value = '';
  document.getElementById('filter-prov').value = '';
  document.getElementById('filter-casa').checked = false;
  document.getElementById('filter-terreno').checked = false;
  
  // Reset filtri avanzati
  window.filtriAvanzatiAttivi = null;
  const indicator = document.getElementById('indicatore-ricerca-avanzata');
  if (indicator) indicator.remove();
  
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
  const resultsContainer = document.getElementById('results');
  const loadingIndicator = document.getElementById('loadingIndicator');
  
  if (resultsContainer) {
    resultsContainer.innerHTML = '';
  }
  
  if (loadingIndicator) {
    loadingIndicator.classList.remove('hidden');
  }
}

// Inizializzazione nuova UI mobile-first
function initializeNewUI() {
  // Menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const mainMenu = document.getElementById('mainMenu');
  
  if (menuToggle && mainMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = !mainMenu.classList.contains('hidden');
      mainMenu.classList.toggle('hidden');
      menuToggle.setAttribute('aria-expanded', !isOpen);
      document.body.style.overflow = !isOpen ? 'hidden' : '';
    });
    
    // Chiudi menu cliccando fuori
    mainMenu.addEventListener('click', (e) => {
      if (e.target === mainMenu) {
        mainMenu.classList.add('hidden');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }
  
  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const themeManager = new ThemeManager();
      themeManager.toggleTheme();
    });
  }
  
  // Empty state button
  const addBtnEmpty = document.getElementById('addBtnEmpty');
  const addBtn = document.getElementById('add-btn');
  if (addBtnEmpty && addBtn) {
    addBtnEmpty.addEventListener('click', () => {
      addBtn.click();
    });
  }
  
  console.log('✅ Nuova UI inizializzata');
}

// Inizializzazione event listeners per la nuova UI
function initializeUIEventListeners() {
  // Search functionality
  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      paginaCorrente = 1;
      renderStrutture(filtra(strutture));
    });
  }
  
  // Filter selects
  const filterSelects = ['filter-prov', 'filter-stato', 'sort-by'];
  filterSelects.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', () => {
        paginaCorrente = 1;
        renderStrutture(filtra(strutture));
      });
    }
  });
  
  // Filter checkboxes
  const filterCheckboxes = ['filter-casa', 'filter-terreno'];
  filterCheckboxes.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', () => {
        paginaCorrente = 1;
        renderStrutture(filtra(strutture));
      });
    }
  });
  
  // Main action buttons
  const addBtn = document.getElementById('add-btn');
  if (addBtn) {
    addBtn.addEventListener('click', aggiungiStruttura);
  }
  
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetFiltri);
  }
  
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', esportaElencoPersonale);
  }
  
  // View toggle
  const viewToggle = document.getElementById('viewToggle');
  if (viewToggle) {
    viewToggle.addEventListener('click', toggleViewMode);
  }
  
  // Advanced search
  const advancedSearchBtn = document.getElementById('advancedSearchBtn');
  if (advancedSearchBtn) {
    advancedSearchBtn.addEventListener('click', mostraRicercaAvanzata);
  }
  
  // User button
  const userBtn = document.getElementById('userBtn');
  if (userBtn) {
    userBtn.addEventListener('click', cambiaUtente);
  }
  
  // Saved filters
  const savedFilters = document.getElementById('saved-filters');
  if (savedFilters) {
    savedFilters.addEventListener('change', (e) => {
      if (e.target.value) {
        applicaFiltriSalvati(e.target.value);
      }
    });
  }
  
  console.log('✅ UI Event listeners inizializzati');
}

// === Inizializzazione pagina ===
window.addEventListener("DOMContentLoaded", async () => {
  mostraCaricamento();
  
  // Inizializza nuova UI mobile-first
  initializeNewUI();
  
  // Gestisci parametri URL dalla dashboard
  const urlParams = new URLSearchParams(window.location.search);
  const filtro = urlParams.get('filtro');
  const provincia = urlParams.get('provincia');
  
  if (filtro && provincia) {
    console.log(`🔍 Filtro dalla dashboard: ${filtro} in ${provincia}`);
    // Applica il filtro automaticamente dopo il caricamento
    window.dashboardFilter = { filtro, provincia };
  }
  
  // Inizializza push notifications
  if (window.pushManager) {
    await window.initializePushNotifications();
  }
  
  // Carica preferenza modalità visualizzazione
  const savedViewMode = localStorage.getItem('viewMode');
  if (savedViewMode === 'list') {
    isListViewMode = true;
    document.body.classList.add('list-view');
    
    // Aggiorna il toggle button
    const toggleBtn = document.getElementById('viewToggle');
    if (toggleBtn) {
    const viewIcon = toggleBtn.querySelector('.view-icon');
    const viewLabel = toggleBtn.querySelector('.view-label');
    
      if (viewIcon) viewIcon.textContent = '📄';
      if (viewLabel) viewLabel.textContent = 'Schede';
    toggleBtn.classList.add('active');
    }
  }
  
  // Inizializza UI event listeners
  initializeUIEventListeners();
  
  // Inizializza sistema autenticazione Firebase
  inizializzaAuth();
  
  try {
  strutture = await caricaStrutture();
  renderStrutture(strutture);
    aggiornaContatoreElenco();
    
    // Applica filtro dalla dashboard se presente
    if (window.dashboardFilter) {
      const { filtro, provincia } = window.dashboardFilter;
      console.log(`🔍 Applicando filtro dashboard: ${filtro} in ${provincia}`);
      
      // Imposta i filtri nell'UI
      if (filtro === 'casa') {
        document.getElementById('filter-casa').checked = true;
      } else if (filtro === 'terreno') {
        document.getElementById('filter-terreno').checked = true;
      } else if (filtro === 'entrambe') {
        document.getElementById('filter-casa').checked = true;
        document.getElementById('filter-terreno').checked = true;
      }
      
      // Imposta la provincia
      const provSelect = document.getElementById('filter-prov');
      if (provSelect) {
        provSelect.value = provincia;
      }
      
      // Applica il filtro
      const struttureFiltrate = filtra(strutture);
      renderStrutture(struttureFiltrate);
      
      // Mostra messaggio informativo
      const container = document.getElementById("results");
      if (container) {
        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = `
          background: #e8f5e8;
          border: 1px solid #2f6b2f;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 20px;
          color: #2f6b2f;
          font-weight: 500;
        `;
        infoDiv.innerHTML = `
          🔍 <strong>Filtro applicato dalla dashboard:</strong> 
          ${filtro === 'casa' ? 'Case' : filtro === 'terreno' ? 'Terreni' : 'Case e Terreni'} 
          in provincia di ${provincia}
          <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: #2f6b2f; cursor: pointer; font-size: 16px;">✕</button>
        `;
        container.insertBefore(infoDiv, container.firstChild);
      }
      
      // Pulisci il filtro dashboard
      delete window.dashboardFilter;
    }
    
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
  
  document.getElementById("add-btn").addEventListener("click", aggiungiStruttura);
  document.getElementById("resetBtn").addEventListener("click", resetFiltri);
  // exportBtn gestito in initializeUIEventListeners()
  
  // Event listener per toggle visualizzazione
  document.getElementById("viewToggle").addEventListener("click", toggleViewMode);
  
  // Event listener per ricerca avanzata
  const advancedSearchBtn = document.getElementById("advancedSearchBtn");
  if (advancedSearchBtn) {
    console.log('✅ Pulsante ricerca avanzata trovato, aggiungo event listener');
    advancedSearchBtn.addEventListener("click", mostraRicercaAvanzata);
  } else {
    console.error('❌ Pulsante ricerca avanzata non trovato!');
  }
  
  // Event listener per pulsante utente
  const userBtn = document.getElementById("userBtn");
  if (userBtn) {
    console.log('✅ Pulsante utente trovato, aggiungo event listener');
    userBtn.addEventListener("click", cambiaUtente);
  } else {
    console.error('❌ Pulsante utente non trovato!');
  }
  
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
  
  // Carica filtri salvati
  await caricaFiltriSalvatiDropdown();
  
  // Inizializza ottimizzazioni performance
  setupLazyLoading();
  
  // Inizializza gestione temi
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
});

// === Gestione Filtri Salvati Dropdown ===
async function caricaFiltriSalvatiDropdown() {
  try {
    const filtriSalvati = await caricaFiltriSalvati();
    const dropdown = document.getElementById('saved-filters');
    
    if (!dropdown) return;
    
    // Pulisci dropdown
    dropdown.innerHTML = '<option value="">Filtri salvati</option>';
    
    if (filtriSalvati.length > 0) {
      filtriSalvati.forEach(filtro => {
        const option = document.createElement('option');
        option.value = filtro.id;
        option.textContent = `${filtro.nome} (${Object.keys(filtro.filtri).length} filtri)`;
        dropdown.appendChild(option);
      });
    }
    
    // Event listener per applicare filtri salvati
    dropdown.addEventListener('change', async (e) => {
      if (e.target.value) {
        await applicaFiltriSalvati(e.target.value);
        e.target.value = ''; // Reset dropdown
      }
    });
    
  } catch (error) {
    console.error('Errore nel caricamento filtri salvati:', error);
  }
}

// === Modale Opzioni Esportazione ===
function mostraOpzioniEsportazioneGenerale() {
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
    z-index: 10000;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 20px;
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    position: relative;
    min-width: 400px;
    width: 100%;
  `;
  
  // Header
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
  title.textContent = '📊 Opzioni Esportazione';
  title.style.cssText = `
    margin: 0;
    color: #2f6b2f;
    font-size: 1.5rem;
  `;
  
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
  closeBtn.onclick = () => modal.remove();
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  // Form opzioni
  const form = document.createElement('form');
  form.style.cssText = `
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 20px;
  `;
  
  // Tipo di esportazione
  const tipoDiv = document.createElement('div');
  tipoDiv.style.cssText = `
    background: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
    border-left: 4px solid #2f6b2f;
  `;
  
  const tipoTitle = document.createElement('h3');
  tipoTitle.textContent = 'Tipo di Esportazione';
  tipoTitle.style.cssText = `
    margin: 0 0 15px 0;
    color: #2f6b2f;
    font-size: 1.1rem;
  `;
  tipoDiv.appendChild(tipoTitle);
  
  const tipoOptions = document.createElement('div');
  tipoOptions.style.cssText = `
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
  `;
  
  const excelOption = document.createElement('label');
  excelOption.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 10px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    flex: 1;
    min-width: 150px;
  `;
  excelOption.innerHTML = `
    <input type="radio" name="exportType" value="excel" checked>
    <span>📊 Excel</span>
  `;
  
  const pdfOption = document.createElement('label');
  pdfOption.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 10px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    flex: 1;
    min-width: 150px;
  `;
  pdfOption.innerHTML = `
    <input type="radio" name="exportType" value="pdf">
    <span>📄 PDF</span>
  `;
  
  tipoOptions.appendChild(excelOption);
  tipoOptions.appendChild(pdfOption);
  tipoDiv.appendChild(tipoOptions);
  
  // Layout
  const layoutDiv = document.createElement('div');
  layoutDiv.style.cssText = `
    background: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
    border-left: 4px solid #17a2b8;
  `;
  
  const layoutTitle = document.createElement('h3');
  layoutTitle.textContent = 'Layout';
  layoutTitle.style.cssText = `
    margin: 0 0 15px 0;
    color: #17a2b8;
    font-size: 1.1rem;
  `;
  layoutDiv.appendChild(layoutTitle);
  
  const layoutSelect = document.createElement('select');
  layoutSelect.id = 'exportLayout';
  layoutSelect.style.cssText = `
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  `;
  
  const layoutOptions = [
    { value: 'completo', text: 'Completo - Tutti i campi' },
    { value: 'compatto', text: 'Compatto - Campi essenziali' },
    { value: 'contatti', text: 'Solo Contatti' },
    { value: 'categorie', text: 'Per Categorie (Excel)' }
  ];
  
  layoutOptions.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option.value;
    optionElement.textContent = option.text;
    layoutSelect.appendChild(optionElement);
  });
  
  layoutDiv.appendChild(layoutSelect);
  
  // Opzioni aggiuntive
  const optionsDiv = document.createElement('div');
  optionsDiv.style.cssText = `
    background: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
    border-left: 4px solid #28a745;
  `;
  
  const optionsTitle = document.createElement('h3');
  optionsTitle.textContent = 'Opzioni Aggiuntive';
  optionsTitle.style.cssText = `
    margin: 0 0 15px 0;
    color: #28a745;
    font-size: 1.1rem;
  `;
  optionsDiv.appendChild(optionsTitle);
  
  const checkboxes = [
    { id: 'includeImages', label: 'Includi immagini', description: 'Aggiungi link alle immagini' },
    { id: 'includeNotes', label: 'Includi note', description: 'Note generali delle strutture' },
    { id: 'includePersonalNotes', label: 'Includi note personali', description: 'Le tue note personali' },
    { id: 'onlyPersonalList', label: 'Solo elenco personale', description: 'Esporta solo le strutture nell\'elenco personale' }
  ];
  
  checkboxes.forEach(checkbox => {
    const checkboxDiv = document.createElement('div');
    checkboxDiv.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    `;
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = checkbox.id;
    input.style.cssText = `
      transform: scale(1.1);
    `;
    
    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.style.cssText = `
      cursor: pointer;
      flex: 1;
    `;
    label.innerHTML = `
      <strong>${checkbox.label}</strong><br>
      <small style="color: #666;">${checkbox.description}</small>
    `;
    
    checkboxDiv.appendChild(input);
    checkboxDiv.appendChild(label);
    optionsDiv.appendChild(checkboxDiv);
  });
  
  // Footer con pulsanti
  const footer = document.createElement('div');
  footer.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #e9ecef;
    gap: 10px;
  `;
  
  const cancelBtn = document.createElement('button');
  cancelBtn.innerHTML = '❌ Annulla';
  cancelBtn.type = 'button';
  cancelBtn.style.cssText = `
    background: #6c757d;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;
  cancelBtn.onclick = () => modal.remove();
  
  const exportBtn = document.createElement('button');
  exportBtn.innerHTML = '📊 Esporta';
  exportBtn.type = 'button';
  exportBtn.style.cssText = `
    background: #28a745;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;
  exportBtn.onclick = () => {
    eseguiEsportazione();
    modal.remove();
  };
  
  footer.appendChild(cancelBtn);
  footer.appendChild(exportBtn);
  
  // Assembla il modal
  form.appendChild(tipoDiv);
  form.appendChild(layoutDiv);
  form.appendChild(optionsDiv);
  
  modalContent.appendChild(header);
  modalContent.appendChild(form);
  modalContent.appendChild(footer);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Chiudi cliccando fuori
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function eseguiEsportazione() {
  const exportType = document.querySelector('input[name="exportType"]:checked').value;
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
  
  try {
    if (exportType === 'excel') {
      if (typeof esportaExcel === 'function') {
        esportaExcel(strutture, options);
      } else {
        alert('Funzione esportazione Excel non disponibile');
      }
    } else if (exportType === 'pdf') {
      if (typeof esportaPDF === 'function') {
        esportaPDF(strutture, options);
      } else {
        alert('Funzione esportazione PDF non disponibile');
      }
    }
  } catch (error) {
    console.error('Errore durante esportazione:', error);
    alert('Errore durante l\'esportazione: ' + error.message);
  }
}

// === Feed Attività ===
async function mostraFeedAttivita() {
  // Rimuovi modal esistente se presente
  const existingModal = document.getElementById('feedAttivitaModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'feedAttivitaModal';
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
    min-width: 400px;
    width: 100%;
  `;
  
  // Header
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
  title.textContent = '📋 Feed Attività';
  title.style.cssText = `
    margin: 0;
    color: #2f6b2f;
    font-size: 1.5rem;
  `;
  
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
  closeBtn.onclick = () => modal.remove();
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  // Filtri
  const filtriDiv = document.createElement('div');
  filtriDiv.style.cssText = `
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    align-items: center;
  `;
  
  const tipoSelect = document.createElement('select');
  tipoSelect.id = 'filtroTipo';
  tipoSelect.style.cssText = `
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  `;
  tipoSelect.innerHTML = `
    <option value="">Tutti i tipi</option>
    <option value="structure_created">Struttura creata</option>
    <option value="structure_updated">Struttura modificata</option>
    <option value="structure_deleted">Struttura eliminata</option>
    <option value="note_created">Nota creata</option>
    <option value="note_deleted">Nota eliminata</option>
    <option value="filter_saved">Filtro salvato</option>
  `;
  
  const periodoSelect = document.createElement('select');
  periodoSelect.id = 'filtroPeriodo';
  periodoSelect.style.cssText = `
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  `;
  periodoSelect.innerHTML = `
    <option value="today">Oggi</option>
    <option value="week">Ultima settimana</option>
    <option value="month">Ultimo mese</option>
    <option value="all">Tutto</option>
  `;
  
  const refreshBtn = document.createElement('button');
  refreshBtn.innerHTML = '🔄 Aggiorna';
  refreshBtn.style.cssText = `
    background: #17a2b8;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  `;
  refreshBtn.onclick = () => caricaAttivita();
  
  filtriDiv.appendChild(document.createElement('label')).textContent = 'Tipo:';
  filtriDiv.appendChild(tipoSelect);
  filtriDiv.appendChild(document.createElement('label')).textContent = 'Periodo:';
  filtriDiv.appendChild(periodoSelect);
  filtriDiv.appendChild(refreshBtn);
  
  // Contenuto attività
  const contentDiv = document.createElement('div');
  contentDiv.id = 'attivitaContent';
  contentDiv.style.cssText = `
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 10px;
  `;
  
  // Assembla il modal
  modalContent.appendChild(header);
  modalContent.appendChild(filtriDiv);
  modalContent.appendChild(contentDiv);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Carica attività iniziali
  await caricaAttivita();
  
  // Chiudi cliccando fuori
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

async function caricaAttivita() {
  try {
    const contentDiv = document.getElementById('attivitaContent');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = '<div style="text-align: center; padding: 20px;">🔄 Caricamento attività...</div>';
    
    const tipoFiltro = document.getElementById('filtroTipo')?.value || '';
    const periodoFiltro = document.getElementById('filtroPeriodo')?.value || 'week';
    
    // Calcola data limite
    let dataLimite = new Date();
    switch (periodoFiltro) {
      case 'today':
        dataLimite.setHours(0, 0, 0, 0);
        break;
      case 'week':
        dataLimite.setDate(dataLimite.getDate() - 7);
        break;
      case 'month':
        dataLimite.setMonth(dataLimite.getMonth() - 1);
        break;
      case 'all':
        dataLimite = null;
        break;
    }
    
    // Carica attività da Firestore
    const activitiesRef = collection(db, "activity_log");
    let q = query(activitiesRef, orderBy("timestamp", "desc"));
    
    if (dataLimite) {
      q = query(activitiesRef, where("timestamp", ">=", dataLimite), orderBy("timestamp", "desc"));
    }
    
    const snapshot = await getDocs(q);
    let attivita = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filtra per tipo se specificato
    if (tipoFiltro) {
      attivita = attivita.filter(a => a.action === tipoFiltro);
    }
    
    // Limita a 50 attività
    attivita = attivita.slice(0, 50);
    
    if (attivita.length === 0) {
      contentDiv.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">Nessuna attività trovata</div>';
      return;
    }
    
    // Renderizza attività
    contentDiv.innerHTML = attivita.map(attivita => {
      const icona = getAttivitaIcona(attivita.action);
      const descrizione = getAttivitaDescrizione(attivita);
      
      // Gestione corretta delle date Firestore
      let data;
      try {
        if (attivita.timestamp && attivita.timestamp.toDate) {
          // Timestamp Firestore
          data = attivita.timestamp.toDate().toLocaleString('it-IT');
        } else if (attivita.timestamp) {
          // Stringa o numero
          data = new Date(attivita.timestamp).toLocaleString('it-IT');
        } else {
          data = 'Data non disponibile';
        }
      } catch (error) {
        console.warn('Errore nel parsing data:', error);
        data = 'Data non disponibile';
      }
      
      // Informazioni utente
      const utente = attivita.userName || attivita.userEmail || 'Utente sconosciuto';
      
      return `
        <div style="display: flex; align-items: center; gap: 12px; padding: 10px; border-bottom: 1px solid #f0f0f0;">
          <div style="font-size: 24px;">${icona}</div>
          <div style="flex: 1;">
            <div style="font-weight: 500; margin-bottom: 4px;">${descrizione}</div>
            <div style="font-size: 12px; color: #666;">
              📅 ${data} | 👤 ${utente}
            </div>
          </div>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Errore nel caricamento attività:', error);
    const contentDiv = document.getElementById('attivitaContent');
    if (contentDiv) {
      contentDiv.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545;">Errore nel caricamento delle attività</div>';
    }
  }
}

function getAttivitaIcona(action) {
  const icone = {
    'structure_created': '➕',
    'structure_updated': '✏️',
    'structure_deleted': '🗑️',
    'note_created': '📝',
    'note_deleted': '🗑️',
    'filter_saved': '💾'
  };
  return icone[action] || '📋';
}

function getAttivitaDescrizione(attivita) {
  const descrizioni = {
    'structure_created': 'Nuova struttura creata',
    'structure_updated': 'Struttura modificata',
    'structure_deleted': 'Struttura eliminata',
    'note_created': 'Nota personale creata',
    'note_deleted': 'Nota personale eliminata',
    'filter_saved': 'Filtro salvato'
  };
  
  let descrizione = descrizioni[attivita.action] || 'Attività sconosciuta';
  
  if (attivita.details && attivita.details.structureName) {
    descrizione += `: ${attivita.details.structureName}`;
  }
  
  return descrizione;
}

// === Geocoding Automatico ===
// Cache per geocoding
const geocodingCache = new Map();
let geocodingQueue = [];
let isProcessingGeocoding = false;
let lastGeocodingRequest = 0;
const GEOCODING_DELAY = 1200; // 1.2 secondi tra richieste

async function geocodificaStruttura(struttura) {
  try {
    if (!struttura.Indirizzo && !struttura.Luogo) {
      console.log('⚠️ Nessun indirizzo disponibile per geocoding');
      return null;
    }
    
    // Costruisci query di ricerca
    let query = '';
    if (struttura.Indirizzo) {
      query = `${struttura.Indirizzo}, ${struttura.Luogo || ''}, ${struttura.Prov || ''}, Italia`;
    } else if (struttura.Luogo) {
      query = `${struttura.Luogo}, ${struttura.Prov || ''}, Italia`;
    }
    
    query = query.replace(/,\s*,/g, ',').replace(/,$/, '').trim();
    
    // Controlla cache
    if (geocodingCache.has(query)) {
      const cached = geocodingCache.get(query);
      if (cached) {
        console.log(`📋 Geocoding da cache per: ${query}`);
        return cached;
      } else {
        console.log(`❌ Geocoding fallito in precedenza per: ${query}`);
        return null;
      }
    }
    
    console.log(`🔍 Geocoding per: ${query}`);
    
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastGeocodingRequest;
    if (timeSinceLastRequest < GEOCODING_DELAY) {
      await new Promise(resolve => 
        setTimeout(resolve, GEOCODING_DELAY - timeSinceLastRequest)
      );
    }
    
    // Usa proxy CORS per evitare errori
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const targetUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=it`;
    
    const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    lastGeocodingRequest = Date.now();
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      const coordinates = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
      
      // Valida coordinate
      if (isNaN(coordinates.lat) || isNaN(coordinates.lng) || 
          coordinates.lat < -90 || coordinates.lat > 90 || 
          coordinates.lng < -180 || coordinates.lng > 180) {
        console.warn('⚠️ Coordinate non valide per:', query);
        geocodingCache.set(query, null);
        return null;
      }
      
      // Salva in cache
      geocodingCache.set(query, coordinates);
      
      console.log(`✅ Coordinate trovate: ${coordinates.lat}, ${coordinates.lng}`);
      return coordinates;
    } else {
      console.log('❌ Nessun risultato trovato per:', query);
      // Salva fallimento in cache per evitare richieste ripetute
      geocodingCache.set(query, null);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Errore nel geocoding:', error);
    
    // Gestione errori specifici
    if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
      console.warn('⚠️ Errore CORS, geocoding non disponibile');
    } else if (error.message.includes('HTTP')) {
      console.warn('⚠️ Errore server geocoding:', error.message);
    }
    
    return null;
  }
}

async function geocodificaTutteStrutture() {
  console.log('🌍 Avvio geocoding di tutte le strutture...');
  
  const strutture = window.strutture || [];
  let processed = 0;
  let success = 0;
  
  for (const struttura of strutture) {
    // Salta se già ha coordinate
    if (struttura.coordinate && struttura.coordinate.lat && struttura.coordinate.lng) {
      console.log(`⏭️ Struttura ${struttura.Struttura} già ha coordinate`);
      continue;
    }
    
    const coordinates = await geocodificaStruttura(struttura);
    
    if (coordinates) {
      try {
        // Aggiorna la struttura su Firestore
        await updateDoc(doc(db, "strutture", struttura.id), {
          coordinate: coordinates,
          lastModified: new Date(),
          lastModifiedBy: utenteCorrente?.uid || null
        });
        
        // Aggiorna anche l'array locale
        struttura.coordinate = coordinates;
        success++;
        
        console.log(`✅ Coordinate salvate per: ${struttura.Struttura}`);
      } catch (error) {
        console.error(`❌ Errore nel salvataggio coordinate per ${struttura.Struttura}:`, error);
      }
    }
    
    processed++;
    
    // Pausa per evitare rate limiting (già gestito nella funzione geocodificaStruttura)
    // await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`🏁 Geocoding completato: ${success} successi su ${processed} strutture processate`);
  
  // Mostra notifica di completamento
  if (success > 0) {
    alert(`✅ Geocoding completato!\n${success} strutture aggiornate con coordinate GPS`);
  } else {
    alert('⚠️ Nessuna struttura è stata aggiornata con coordinate GPS');
  }
}

// Funzione per geocoding manuale di una singola struttura
async function geocodificaSingolaStruttura(strutturaId) {
  const struttura = strutture.find(s => s.id === strutturaId);
  if (!struttura) {
    alert('Struttura non trovata!');
    return;
  }
  
  console.log(`🔍 Geocoding manuale per: ${struttura.Struttura}`);
  
  const coordinates = await geocodificaStruttura(struttura);
  
  if (coordinates) {
    try {
      // Aggiorna la struttura su Firestore
      await updateDoc(doc(db, "strutture", strutturaId), {
        coordinate: coordinates,
        lastModified: new Date(),
        lastModifiedBy: utenteCorrente?.uid || null
      });
      
      // Aggiorna anche l'array locale
      struttura.coordinate = coordinates;
      
      alert(`✅ Coordinate aggiornate per: ${struttura.Struttura}\nLat: ${coordinates.lat}, Lng: ${coordinates.lng}`);
      
      // Log attività
      await logActivity('geocoding_updated', strutturaId, utenteCorrente?.uid, {
        coordinates: coordinates
      });
      
    } catch (error) {
      console.error('❌ Errore nel salvataggio coordinate:', error);
      alert('Errore nel salvataggio delle coordinate');
    }
  } else {
    alert('❌ Impossibile trovare coordinate per questa struttura');
  }
}

// === Geolocalizzazione Utente ===
async function trovaVicinoAMe() {
  try {
    console.log('📍 Richiesta geolocalizzazione utente...');
    
    // Verifica se la geolocalizzazione è supportata
    if (!navigator.geolocation) {
      alert('❌ La geolocalizzazione non è supportata dal tuo browser');
      return;
    }
    
    // Richiedi permesso per la geolocalizzazione
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minuti
      });
    });
    
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    
    console.log(`✅ Posizione utente: ${userLat}, ${userLng}`);
    
    // Calcola distanze per tutte le strutture
    const struttureConDistanza = strutture
      .filter(struttura => struttura.coordinate && struttura.coordinate.lat && struttura.coordinate.lng)
      .map(struttura => {
        const distanza = calcolaDistanza(userLat, userLng, struttura.coordinate.lat, struttura.coordinate.lng);
        return {
          ...struttura,
          distanza: distanza
        };
      })
      .sort((a, b) => a.distanza - b.distanza);
    
    if (struttureConDistanza.length === 0) {
      alert('❌ Nessuna struttura con coordinate GPS disponibile');
      return;
    }
    
    // Mostra le prime 10 strutture più vicine
    const struttureVicine = struttureConDistanza.slice(0, 10);
    
    // Crea modale con risultati
    mostraRisultatiVicinoAMe(struttureVicine, userLat, userLng);
    
  } catch (error) {
    console.error('❌ Errore nella geolocalizzazione:', error);
    
    let errorMessage = '❌ Errore nella geolocalizzazione: ';
    
    if (error.code === error.PERMISSION_DENIED) {
      errorMessage = '❌ Permesso geolocalizzazione negato.\n\nPer utilizzare questa funzione:\n1. Clicca sull\'icona del lucchetto nella barra degli indirizzi\n2. Abilita "Posizione"\n3. Ricarica la pagina e riprova';
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      errorMessage = '❌ Posizione non disponibile.\n\nVerifica che:\n- Il GPS sia attivo\n- La connessione internet sia stabile\n- Il browser abbia accesso ai servizi di localizzazione';
    } else if (error.code === error.TIMEOUT) {
      errorMessage = '❌ Timeout nella geolocalizzazione.\n\nLa richiesta ha impiegato troppo tempo.\nRiprova in un momento con migliore connessione.';
    } else {
      errorMessage += error.message;
    }
    
    // Mostra modale invece di alert per messaggi più lunghi
    if (error.code === error.PERMISSION_DENIED || error.code === error.POSITION_UNAVAILABLE) {
      mostraModaleErroreGeolocalizzazione(errorMessage);
    } else {
      alert(errorMessage);
    }
  }
}

function mostraModaleErroreGeolocalizzazione(message) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'block';
  
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <h2>📍 Geolocalizzazione</h2>
        <button class="close" onclick="this.closest('.modal').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <div style="white-space: pre-line; line-height: 1.6;">
          ${message}
        </div>
        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #007bff;">
          <strong>💡 Suggerimento:</strong><br>
          Puoi comunque utilizzare la funzione "Trova Vicino a Me" selezionando manualmente una posizione sulla mappa.
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Chiudi</button>
        <button class="btn btn-primary" onclick="this.closest('.modal').remove(); mostraMappa();">
          🗺️ Apri Mappa
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function calcolaDistanza(lat1, lng1, lat2, lng2) {
  const R = 6371; // Raggio della Terra in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function mostraRisultatiVicinoAMe(struttureVicine, userLat, userLng) {
  // Rimuovi modal esistente se presente
  const existingModal = document.getElementById('vicinoAMeModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'vicinoAMeModal';
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
    z-index: 10000;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 20px;
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    position: relative;
    min-width: 400px;
    width: 100%;
  `;
  
  // Header
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
  title.textContent = '📍 Strutture Vicino a Te';
  title.style.cssText = `
    margin: 0;
    color: #2f6b2f;
    font-size: 1.5rem;
  `;
  
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
  closeBtn.onclick = () => modal.remove();
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  // Lista strutture
  const listaDiv = document.createElement('div');
  listaDiv.style.cssText = `
    max-height: 400px;
    overflow-y: auto;
  `;
  
  if (struttureVicine.length === 0) {
    listaDiv.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">Nessuna struttura trovata nelle vicinanze</div>';
  } else {
    listaDiv.innerHTML = struttureVicine.map((struttura, index) => `
      <div style="display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid #f0f0f0; cursor: pointer;" onclick="mostraSchedaCompleta('${struttura.id}')">
        <div style="font-size: 24px; color: #2f6b2f; font-weight: bold;">${index + 1}</div>
        <div style="flex: 1;">
          <div style="font-weight: 500; margin-bottom: 4px; color: #2f6b2f;">${struttura.Struttura || 'Senza nome'}</div>
          <div style="font-size: 0.9rem; color: #666; margin-bottom: 4px;">
            📍 ${struttura.Luogo || 'N/A'}, ${struttura.Prov || 'N/A'}
          </div>
          <div style="font-size: 0.8rem; color: #888;">
            ${struttura.Casa ? '🏠 Casa' : ''} ${struttura.Terreno ? '🌱 Terreno' : ''}
            ${!struttura.Casa && !struttura.Terreno ? '❓ Senza categoria' : ''}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 1.2rem; font-weight: bold; color: #2f6b2f;">${struttura.distanza.toFixed(1)} km</div>
          <div style="font-size: 0.8rem; color: #666;">distanza</div>
        </div>
      </div>
    `).join('');
  }
  
  // Footer
  const footer = document.createElement('div');
  footer.style.cssText = `
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #e9ecef;
    text-align: center;
  `;
  
  const mapBtn = document.createElement('button');
  mapBtn.innerHTML = '🗺️ Visualizza su Mappa';
  mapBtn.style.cssText = `
    background: #17a2b8;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;
  mapBtn.onclick = () => {
    modal.remove();
    // Apri dashboard con filtri per strutture vicine
    window.open(`dashboard.html?filter=nearby&lat=${userLat}&lng=${userLng}`, '_blank');
  };
  
  footer.appendChild(mapBtn);
  
  // Assembla il modal
  modalContent.appendChild(header);
  modalContent.appendChild(listaDiv);
  modalContent.appendChild(footer);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Chiudi cliccando fuori
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// === UI Initialization Functions ===
function initializeNewUI() {
  console.log('🎨 Inizializzazione UI mobile-first...');
  
  // Menu toggle functionality
  const menuBtn = document.getElementById('menuBtn');
  const mainMenu = document.getElementById('mainMenu');
  
  if (menuBtn && mainMenu) {
    menuBtn.addEventListener('click', () => {
      console.log('📱 Toggle menu clicked');
      mainMenu.classList.toggle('hidden');
    });
  }
  
  // Theme toggle functionality
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      console.log('🌙 Toggle theme clicked');
      if (typeof window.toggleTheme === 'function') {
        window.toggleTheme();
      }
    });
  }
  
  // Empty state button
  const emptyStateBtn = document.getElementById('emptyStateBtn');
  if (emptyStateBtn) {
    emptyStateBtn.addEventListener('click', () => {
      console.log('➕ Empty state button clicked');
      if (typeof window.aggiungiStruttura === 'function') {
        window.aggiungiStruttura();
      }
    });
  }
}

function initializeUIEventListeners() {
  console.log('🎯 Inizializzazione event listeners UI...');
  
  // Search functionality
  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = strutture.filter(s => 
        s.Struttura?.toLowerCase().includes(query) ||
        s.Luogo?.toLowerCase().includes(query) ||
        s.Provincia?.toLowerCase().includes(query)
      );
      renderStrutture(filtered);
    });
  }
  
  // Filter functionality (now in menu)
  const filterProv = document.getElementById('filter-prov');
  const filterStato = document.getElementById('filter-stato');
  const filterCasa = document.getElementById('filter-casa');
  const filterTerreno = document.getElementById('filter-terreno');
  
  if (filterProv) {
    filterProv.addEventListener('change', () => {
      paginaCorrente = 1;
      renderStrutture(filtra(strutture));
    });
  }
  
  if (filterStato) {
    filterStato.addEventListener('change', () => {
      paginaCorrente = 1;
      renderStrutture(filtra(strutture));
    });
  }
  
  if (filterCasa) {
    filterCasa.addEventListener('change', () => {
      paginaCorrente = 1;
      renderStrutture(filtra(strutture));
    });
  }
  
  if (filterTerreno) {
    filterTerreno.addEventListener('change', () => {
      paginaCorrente = 1;
      renderStrutture(filtra(strutture));
    });
  }
  
  // Action buttons
  const addBtn = document.getElementById('add-btn');
  const resetBtn = document.getElementById('resetBtn');
  const exportBtn = document.getElementById('exportBtn');
  
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (typeof window.aggiungiStruttura === 'function') {
        window.aggiungiStruttura();
      }
    });
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (typeof window.resetFiltri === 'function') {
        window.resetFiltri();
      }
    });
  }
  
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (typeof window.esportaElencoPersonale === 'function') {
        window.esportaElencoPersonale();
      }
    });
  }
  
  // View toggle
  const viewToggle = document.getElementById('viewToggle');
  if (viewToggle) {
    viewToggle.addEventListener('click', () => {
      if (typeof window.toggleViewMode === 'function') {
        window.toggleViewMode();
      }
    });
  }
  
  // Advanced search
  const advancedSearchBtn = document.getElementById('advancedSearchBtn');
  if (advancedSearchBtn) {
    advancedSearchBtn.addEventListener('click', () => {
      if (typeof window.mostraRicercaAvanzata === 'function') {
        window.mostraRicercaAvanzata();
      }
    });
  }
  
  // User button
  const userBtn = document.getElementById('userBtn');
  if (userBtn) {
    userBtn.addEventListener('click', () => {
      if (typeof window.mostraGestioneElencoPersonale === 'function') {
        window.mostraGestioneElencoPersonale();
      }
    });
  }
  
  // Saved filters dropdown
  const savedFiltersSelect = document.getElementById('savedFiltersSelect');
  if (savedFiltersSelect) {
    savedFiltersSelect.addEventListener('change', (e) => {
      if (e.target.value) {
        if (typeof window.applicaFiltriSalvati === 'function') {
          window.applicaFiltriSalvati(e.target.value);
        }
      }
    });
  }
}

// === Esposizione Funzioni Globali ===
// Esponi tutte le funzioni necessarie per compatibilità con HTML onclick
window.cambiaPagina = cambiaPagina;
window.cambiaElementiPerPagina = cambiaElementiPerPagina;
window.mostraRicercaAvanzata = mostraRicercaAvanzata;
window.mostraGestioneElencoPersonale = mostraGestioneElencoPersonale;
window.mostraMappa = mostraMappa;
window.trovaVicinoAMe = trovaVicinoAMe;
window.geocodificaTutteStrutture = geocodificaTutteStrutture;
window.mostraOpzioniEsportazioneGenerale = mostraOpzioniEsportazioneGenerale;
window.mostraFeedAttivita = mostraFeedAttivita;

console.log('✅ Funzioni globali esposte per compatibilità HTML onclick');

// === DOM Ready Initialization ===
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inizializzazione applicazione...');
  
  // Initialize new UI
  initializeNewUI();
  initializeUIEventListeners();
  
  console.log('✅ Inizializzazione UI completata');
});
