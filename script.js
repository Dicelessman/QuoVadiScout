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
    console.log('Tentativo di caricamento da Firestore...');
    const snapshot = await getDocs(colRef);
    const dati = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log(`Caricate ${dati.length} strutture da Firestore`);
    return dati;
  } catch (error) {
    console.warn('Errore nel caricamento da Firestore:', error);
    console.log('Tentativo di caricamento da file locale...');
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

// === Render delle card ===
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

  lista.forEach((s) => {
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
        
        ${s.Referente ? `<div class="contact-info">
          <strong>Referente:</strong> ${s.Referente}
        </div>` : ''}
        
        ${s.Contatto || s.Email ? `<div class="contact-info">
          <strong>Contatti:</strong> ${s.Contatto || s.Email}
        </div>` : ''}
      </div>
      
      <div class="card-footer">
        <button class="btn-edit" data-id="${s.id}">✏️ Modifica</button>
        <button class="btn-delete" data-id="${s.id}">🗑️ Elimina</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Eventi pulsanti
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => modificaStruttura(btn.dataset.id));
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
}

// === Filtri e ricerca ===
function filtra(lista) {
  const q = document.getElementById("search").value.toLowerCase();
  const prov = document.getElementById("filter-prov").value;
  const casa = document.getElementById("filter-casa").checked;
  const terreno = document.getElementById("filter-terreno").checked;

  return lista.filter((s) => {
    const matchTesto =
      s.Struttura?.toLowerCase().includes(q) ||
      s.Luogo?.toLowerCase().includes(q) ||
      s.Info?.toLowerCase().includes(q) ||
      s.Referente?.toLowerCase().includes(q);
    const matchProv = !prov || s.Prov === prov;
    const matchCasa = !casa || s.Casa === true;
    const matchTerreno = !terreno || s.Terreno === true;
    return matchTesto && matchProv && matchCasa && matchTerreno;
  });
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
  const nome = prompt("Nome nuova struttura:");
  if (!nome) return;
  await addDoc(colRef, { Struttura: nome, Casa: false, Terreno: false });
  aggiornaLista();
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

// === Reset filtri ===
function resetFiltri() {
  document.getElementById('search').value = '';
  document.getElementById('filter-prov').value = '';
  document.getElementById('filter-casa').checked = false;
  document.getElementById('filter-terreno').checked = false;
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
