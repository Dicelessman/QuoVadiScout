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
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// === Render delle card ===
function renderStrutture(lista) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (lista.length === 0) {
    container.innerHTML = `<p>Nessuna struttura trovata.</p>`;
    return;
  }

  lista.forEach((s) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${s.Struttura || "Senza nome"}</h3>
      <p><strong>Luogo:</strong> ${s.Luogo || ""}</p>
      <p><strong>Provincia:</strong> ${s.Prov || ""}</p>
      <p><strong>Info:</strong> ${s.Info || ""}</p>
      <p><strong>Casa:</strong> ${s.Casa ? "✅" : "❌"} |
         <strong>Terreno:</strong> ${s.Terreno ? "✅" : "❌"}</p>
      <p><strong>Referente:</strong> ${s.Referente || ""}</p>
      <p><strong>Contatti:</strong> ${s.Contatto || s.Email || "—"}</p>
      <div class="buttons">
        <button class="edit" data-id="${s.id}">Modifica</button>
        <button class="delete" data-id="${s.id}">Elimina</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Eventi pulsanti
  document.querySelectorAll(".edit").forEach((btn) => {
    btn.addEventListener("click", () => modificaStruttura(btn.dataset.id));
  });
  document.querySelectorAll(".delete").forEach((btn) => {
    btn.addEventListener("click", () => eliminaStruttura(btn.dataset.id));
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
async function modificaStruttura(id) {
  const nuovoNome = prompt("Nuovo nome struttura:");
  if (!nuovoNome) return;
  await updateDoc(doc(db, "strutture", id), { Struttura: nuovoNome });
  aggiornaLista();
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

// === Aggiorna lista ===
let strutture = [];
async function aggiornaLista() {
  strutture = await caricaStrutture();
  renderStrutture(filtra(strutture));
}

// === Inizializzazione pagina ===
window.addEventListener("DOMContentLoaded", async () => {
  strutture = await caricaStrutture();
  renderStrutture(strutture);

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
});
