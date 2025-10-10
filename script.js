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
  getDoc
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
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    position: relative;
    min-width: 800px;
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
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
    ]
  };
  
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
    
    campi.forEach(({ campo, tipo, placeholder }) => {
      const campoDiv = document.createElement('div');
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
        checkboxDiv.style.cssText = `
          display: flex;
          align-items: center;
        `;
        checkboxDiv.appendChild(input);
        checkboxDiv.appendChild(label);
        campoDiv.appendChild(checkboxDiv);
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
  document.querySelectorAll('#ricercaAvanzataModal input, #ricercaAvanzataModal textarea').forEach(input => {
    const campo = input.id.replace('search-', '').replace(/-/g, ' ');
    
    if (input.type === 'checkbox') {
      if (input.checked) {
        filtri[campo] = true;
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

function mostraIndicatoreRicercaAvanzata(numeroFiltri) {
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
      margin-left: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    `;
    indicator.innerHTML = `
      🔍 Ricerca avanzata attiva (${numeroFiltri} filtri)
      <button onclick="rimuoviRicercaAvanzata()" style="background:none;border:none;color:white;cursor:pointer;font-size:14px;margin-left:4px;">✕</button>
    `;
    
    document.querySelector('.controls').appendChild(indicator);
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
        }
      }
    }
    
    return matchTesto && matchProv && matchCasa && matchTerreno && matchAvanzati;
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
    max-width: 450px;
    width: 90%;
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

function aggiornaUIUtente() {
  const userBtn = document.getElementById('userBtn');
  const userName = userBtn.querySelector('.user-name');
  if (utenteCorrente) {
    const displayName = userProfile?.nome || utenteCorrente.displayName || utenteCorrente.email.split('@')[0];
    userName.textContent = displayName;
    userBtn.title = `Utente: ${displayName} (${elencoPersonale.length} strutture) - Clicca per disconnetterti`;
  } else {
    userName.textContent = 'Accedi';
    userBtn.title = 'Accedi o registrati';
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
    logoutUser();
  } else {
    // Se non c'è utente, mostra direttamente la schermata di login
    mostraSchermataLogin();
  }
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
  const contatore = document.getElementById('contatore-elenco');
  if (contatore) {
    contatore.textContent = elencoPersonale.length;
  }
  
  // Aggiorna anche l'UI utente per riflettere il nuovo numero di strutture
  aggiornaUIUtente();
}

// === Gestione Elenco Personale ===
function esportaElencoPersonale() {
  mostraGestioneElencoPersonale();
}

function mostraGestioneElencoPersonale() {
  const struttureElenco = strutture.filter(s => elencoPersonale.includes(s.id));
  
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
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    position: relative;
    min-width: 600px;
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
    listaContainer.style.cssText = `
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 10px;
    `;
    
    struttureElenco.forEach((struttura, index) => {
      const itemDiv = document.createElement('div');
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
        mostraGestioneElencoPersonale(); // Ricarica il modal
      };
      
      actionsDiv.appendChild(viewBtn);
      actionsDiv.appendChild(removeBtn);
      
      itemDiv.appendChild(infoDiv);
      itemDiv.appendChild(actionsDiv);
      listaContainer.appendChild(itemDiv);
    });
    
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
    if (struttureElenco.length > 0) {
      modal.remove();
      mostraMenuEsportazione(struttureElenco);
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
  const menu = document.createElement('div');
  menu.className = 'export-menu';
  menu.innerHTML = `
    <div class="export-options">
      <h3>Esporta Elenco Personale (${struttureElenco.length} elementi)</h3>
      <button onclick="esportaJSON()">📄 JSON</button>
      <button onclick="esportaCSV()">📊 CSV</button>
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
  
  window.chiudiMenu = () => {
    document.body.removeChild(menu);
  };
}

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
  
  // Inizializza sistema autenticazione Firebase
  inizializzaAuth();
  
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
  
  document.getElementById("add-btn").addEventListener("click", aggiungiStruttura);
  document.getElementById("resetBtn").addEventListener("click", resetFiltri);
  document.getElementById("exportBtn").addEventListener("click", esportaElencoPersonale);
  
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
});
