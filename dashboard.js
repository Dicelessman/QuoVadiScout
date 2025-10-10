// === Firebase SDK Imports ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
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

// === Variabili Globali ===
let strutture = [];
let map;
let markers = [];
let currentFilter = 'all';

// === Caricamento Dati ===
async function caricaStrutture() {
  try {
    console.log('📊 Caricamento dati per dashboard...');
    const snapshot = await getDocs(colRef);
    strutture = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✅ Caricate ${strutture.length} strutture`);
    return strutture;
  } catch (error) {
    console.error('❌ Errore nel caricamento:', error);
    throw error;
  }
}

// === Calcolo Statistiche ===
function calcolaStatistiche() {
  const stats = {
    totali: strutture.length,
    case: strutture.filter(s => s.Casa && !s.Terreno).length,
    terreni: strutture.filter(s => s.Terreno && !s.Casa).length,
    entrambe: strutture.filter(s => s.Casa && s.Terreno).length,
    senza: strutture.filter(s => !s.Casa && !s.Terreno).length
  };
  
  return stats;
}

function calcolaStatisticheProvince() {
  const provinceStats = {};
  
  strutture.forEach(struttura => {
    const prov = struttura.Prov || 'Non specificata';
    if (!provinceStats[prov]) {
      provinceStats[prov] = {
        totali: 0,
        case: 0,
        terreni: 0,
        entrambe: 0,
        senza: 0
      };
    }
    
    provinceStats[prov].totali++;
    
    if (struttura.Casa && struttura.Terreno) {
      provinceStats[prov].entrambe++;
    } else if (struttura.Casa) {
      provinceStats[prov].case++;
    } else if (struttura.Terreno) {
      provinceStats[prov].terreni++;
    } else {
      provinceStats[prov].senza++;
    }
  });
  
  return provinceStats;
}

// === Aggiorna Statistiche ===
function aggiornaStatistiche() {
  const stats = calcolaStatistiche();
  
  document.getElementById('totalStructures').textContent = stats.totali;
  document.getElementById('totalCase').textContent = stats.case;
  document.getElementById('totalTerreni').textContent = stats.terreni;
  document.getElementById('totalEntrambe').textContent = stats.entrambe;
  document.getElementById('totalSenza').textContent = stats.senza;
}

function aggiornaStatisticheProvince() {
  const provinceStats = calcolaStatisticheProvince();
  const container = document.getElementById('provinceStats');
  
  container.innerHTML = '';
  
  // Ordina per numero totale di strutture
  const sortedProvinces = Object.entries(provinceStats)
    .sort(([,a], [,b]) => b.totali - a.totali);
  
  sortedProvinces.forEach(([provincia, stats]) => {
    const card = document.createElement('div');
    card.className = 'province-card';
    card.innerHTML = `
      <h4>${provincia}</h4>
      <div class="province-stats">
        <div class="province-stat">
          <span>Totali:</span>
          <strong>${stats.totali}</strong>
        </div>
        <div class="province-stat">
          <span>🏠 Case:</span>
          <span>${stats.case}</span>
        </div>
        <div class="province-stat">
          <span>🌱 Terreni:</span>
          <span>${stats.terreni}</span>
        </div>
        <div class="province-stat">
          <span>🏢🌱 Entrambe:</span>
          <span>${stats.entrambe}</span>
        </div>
        <div class="province-stat">
          <span>❓ Senza:</span>
          <span>${stats.senza}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// === Inizializzazione Mappa ===
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 6,
    center: { lat: 41.9028, lng: 12.4964 }, // Centro Italia
    mapTypeId: 'roadmap'
  });
  
  // Aggiungi marker per ogni struttura
  aggiungiMarkers();
  
  // Event listeners per i controlli
  document.getElementById('showAllBtn').addEventListener('click', () => filtraMarkers('all'));
  document.getElementById('showCaseBtn').addEventListener('click', () => filtraMarkers('casa'));
  document.getElementById('showTerrenoBtn').addEventListener('click', () => filtraMarkers('terreno'));
  document.getElementById('showEntrambeBtn').addEventListener('click', () => filtraMarkers('entrambe'));
}

function aggiungiMarkers() {
  markers.forEach(marker => marker.setMap(null));
  markers = [];
  
  strutture.forEach(struttura => {
    // Prova a estrarre coordinate se disponibili
    let lat, lng;
    
    if (struttura.Coordinate) {
      const coords = struttura.Coordinate.split(',');
      if (coords.length === 2) {
        lat = parseFloat(coords[0].trim());
        lng = parseFloat(coords[1].trim());
      }
    }
    
    // Se non ci sono coordinate, usa geocoding approssimativo per provincia
    if (!lat || !lng) {
      const coord = getCoordinateProvincia(struttura.Prov);
      if (coord) {
        lat = coord.lat;
        lng = coord.lng;
      }
    }
    
    if (lat && lng) {
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: struttura.Struttura || 'Struttura senza nome',
        icon: getMarkerIcon(struttura)
      });
      
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h4>${struttura.Struttura || 'Senza nome'}</h4>
            <p><strong>📍 Luogo:</strong> ${struttura.Luogo || 'N/A'}, ${struttura.Prov || 'N/A'}</p>
            <p><strong>👤 Referente:</strong> ${struttura.Referente || 'N/A'}</p>
            <p><strong>📞 Contatto:</strong> ${struttura.Contatto || 'N/A'}</p>
            <div style="margin-top: 8px;">
              ${struttura.Casa ? '<span style="background: #1976d2; color: white; padding: 2px 6px; border-radius: 3px; font-size: 12px;">🏠 Casa</span>' : ''}
              ${struttura.Terreno ? '<span style="background: #4caf50; color: white; padding: 2px 6px; border-radius: 3px; font-size: 12px; margin-left: 4px;">🌱 Terreno</span>' : ''}
            </div>
          </div>
        `
      });
      
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
      
      markers.push(marker);
    }
  });
}

function getMarkerIcon(struttura) {
  let color = '#9e9e9e'; // Default grigio
  
  if (struttura.Casa && struttura.Terreno) {
    color = '#ff9800'; // Arancione per entrambe
  } else if (struttura.Casa) {
    color = '#1976d2'; // Blu per case
  } else if (struttura.Terreno) {
    color = '#4caf50'; // Verde per terreni
  }
  
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 0.8,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: 8
  };
}

function filtraMarkers(tipo) {
  currentFilter = tipo;
  
  // Aggiorna pulsanti
  document.querySelectorAll('.map-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  markers.forEach(marker => {
    const struttura = strutture.find(s => 
      marker.getPosition().lat() === s.lat && 
      marker.getPosition().lng() === s.lng
    );
    
    if (!struttura) return;
    
    let show = false;
    switch (tipo) {
      case 'all':
        show = true;
        break;
      case 'casa':
        show = struttura.Casa && !struttura.Terreno;
        break;
      case 'terreno':
        show = struttura.Terreno && !struttura.Casa;
        break;
      case 'entrambe':
        show = struttura.Casa && struttura.Terreno;
        break;
    }
    
    marker.setVisible(show);
  });
}

// === Coordinate Province ===
function getCoordinateProvincia(provincia) {
  const coordinate = {
    'MI': { lat: 45.4642, lng: 9.1900 },
    'RM': { lat: 41.9028, lng: 12.4964 },
    'NA': { lat: 40.8518, lng: 14.2681 },
    'TO': { lat: 45.0703, lng: 7.6869 },
    'FI': { lat: 43.7696, lng: 11.2558 },
    'BO': { lat: 44.4949, lng: 11.3426 },
    'GE': { lat: 44.4056, lng: 8.9463 },
    'BA': { lat: 41.1177, lng: 16.8719 },
    'CA': { lat: 39.2238, lng: 9.1217 },
    'VE': { lat: 45.4408, lng: 12.3155 },
    'BG': { lat: 45.6944, lng: 9.6773 },
    'CO': { lat: 45.8081, lng: 9.0852 },
    'SO': { lat: 46.1708, lng: 9.8742 },
    'PV': { lat: 45.1847, lng: 9.1582 }
  };
  
  return coordinate[provincia] || null;
}

// === Grafici ===
function creaGrafici() {
  const stats = calcolaStatistiche();
  const provinceStats = calcolaStatisticheProvince();
  
  // Grafico a torta per tipo
  const typeCtx = document.getElementById('typeChart').getContext('2d');
  new Chart(typeCtx, {
    type: 'doughnut',
    data: {
      labels: ['Case', 'Terreni', 'Casa + Terreno', 'Senza Categoria'],
      datasets: [{
        data: [stats.case, stats.terreni, stats.entrambe, stats.senza],
        backgroundColor: ['#1976d2', '#4caf50', '#ff9800', '#9e9e9e'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
  
  // Grafico a barre per province
  const topProvinces = Object.entries(provinceStats)
    .sort(([,a], [,b]) => b.totali - a.totali)
    .slice(0, 10);
  
  const provinceCtx = document.getElementById('provinceChart').getContext('2d');
  new Chart(provinceCtx, {
    type: 'bar',
    data: {
      labels: topProvinces.map(([prov]) => prov),
      datasets: [{
        label: 'Strutture',
        data: topProvinces.map(([,stats]) => stats.totali),
        backgroundColor: '#2f6b2f',
        borderColor: '#1e5a1e',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

// === Inizializzazione Dashboard ===
async function inizializzaDashboard() {
  try {
    document.getElementById('loading').classList.remove('hidden');
    
    await caricaStrutture();
    aggiornaStatistiche();
    aggiornaStatisticheProvince();
    creaGrafici();
    
    document.getElementById('loading').classList.add('hidden');
    
  } catch (error) {
    console.error('❌ Errore nell\'inizializzazione:', error);
    document.getElementById('loading').innerHTML = `
      <div class="error">
        <h3>⚠️ Errore nel caricamento</h3>
        <p>Impossibile caricare i dati della dashboard.</p>
        <button onclick="location.reload()">🔄 Ricarica</button>
      </div>
    `;
  }
}

// === Event Listeners ===
document.getElementById('refreshBtn').addEventListener('click', inizializzaDashboard);

// === Avvio Dashboard ===
window.addEventListener('DOMContentLoaded', inizializzaDashboard);
