// Caricamento dati e funzionalità dell'app prototype
let dataset = []; // dati correnti (modificabili)
let original = []; // copia originale per reset
const cardsEl = document.getElementById('cards');
const searchEl = document.getElementById('search');
const provSelect = document.getElementById('provSelect');
const hasCasa = document.getElementById('hasCasa');
const hasTerreno = document.getElementById('hasTerreno');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');

// Modal ed edit
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const editForm = document.getElementById('editForm');
const saveBtn = document.getElementById('saveBtn');
const deleteBtn = document.getElementById('deleteBtn');

// Carica dati (data.json)
async function loadData(){
  try{
    const resp = await fetch('data.json');
    const json = await resp.json();
    dataset = json;
    original = JSON.parse(JSON.stringify(json));
    // se esiste versione in localStorage la carico
    const local = localStorage.getItem('strutture_data');
    if(local){ dataset = JSON.parse(local); }
    populateProv();
    renderCards(dataset);
  }catch(e){ console.error(e); cardsEl.innerHTML='<p>Errore caricamento dati.</p>';}
}

function populateProv(){
  const provs = Array.from(new Set(dataset.map(d=>d.Prov).filter(Boolean))).sort();
  provs.forEach(p => {
    const opt = document.createElement('option'); opt.value=p; opt.textContent=p;
    provSelect.appendChild(opt);
  });
}

// Filtri
function applyFilters(){
  const q = searchEl.value.trim().toLowerCase();
  const prov = provSelect.value;
  const casa = hasCasa.checked;
  const terreno = hasTerreno.checked;
  let res = dataset.filter(item => {
    // ricerca fulltext su alcune colonne
    const hay = (item.Struttura + ' ' + item.Luogo + ' ' + (item.Referente||'') + ' ' + (item.Info||'')).toLowerCase();
    if(q && !hay.includes(q)) return false;
    if(prov && item.Prov !== prov) return false;
    if(casa && !(Number(item.Casa) > 0 || item.Casa === '1' || item.Casa === 1)) return false;
    if(terreno && !(Number(item.Terreno) > 0 || item.Terreno === '1' || item.Terreno === 1)) return false;
    return true;
  });
  renderCards(res);
}

function renderCards(list){
  if(!list || list.length===0){ cardsEl.innerHTML='<p class="footer-note">Nessuna struttura trovata.</p>'; return; }
  cardsEl.innerHTML='';
  list.forEach((item, idx) => {
    const card = document.createElement('article'); card.className='card';
    const h = document.createElement('h3'); h.textContent = item.Struttura || '(senza nome)';
    const meta = document.createElement('div'); meta.className='meta';
    meta.innerHTML = `<strong>${item.Luogo||''}</strong> — ${item.Indirizzo||''} <br> <small>${item.Prov||''} • Referente: ${item.Referente||''}</small>`;
    const info = document.createElement('div'); info.textContent = item.Info || '';
    const tags = document.createElement('div'); tags.className='tags';
    if(item.Casa && Number(item.Casa)>0) tags.innerHTML += `<span class="tag">Casa</span>`;
    if(item.Terreno && Number(item.Terreno)>0) tags.innerHTML += `<span class="tag">Terreno</span>`;
    if(item.Offerta && String(item.Offerta).toLowerCase().includes('si')) tags.innerHTML += `<span class="tag">Offerta</span>`;
    // Contatti
    const contacts = document.createElement('div'); contacts.className='meta';
    contacts.innerHTML = `Contatto: ${item.Contatto||''} ${item.IIcontatto?(' / '+item.IIcontatto):''} <br> Email: ${item.Email||''} Sito: ${item.Sito||''}`;
    // Azioni
    const actions = document.createElement('div'); actions.style.marginTop='10px';
    const btnView = document.createElement('button'); btnView.textContent='Modifica'; btnView.onclick = ()=> openModal(item, idx);
    actions.appendChild(btnView);
    card.appendChild(h); card.appendChild(meta); card.appendChild(info); card.appendChild(tags); card.appendChild(contacts); card.appendChild(actions);
    cardsEl.appendChild(card);
  });
}

// Modal edit
let currentIdx = null;
function openModal(item, idx){
  currentIdx = idx;
  editForm.innerHTML = '';
  // crea campi per le colonne principali
  const keys = ['Struttura','Luogo','Indirizzo','Prov','Info','Contatto','IIcontatto','Referente','Email','Sito','Casa','Terreno','Offerta','€ notte','Forfait'];
  keys.forEach(k=>{
    const label = document.createElement('label'); label.innerHTML = `<span>${k}</span>`;
    const input = document.createElement('input'); input.name = k; input.value = item[k] || '';
    // tipi checkbox per Casa/Terreno
    if(k==='Casa' || k==='Terreno'){ input.type='number'; input.min=0; }
    label.appendChild(input);
    editForm.appendChild(label);
  });
  modal.classList.remove('hidden');
}

closeModal.onclick = ()=>{ modal.classList.add('hidden'); currentIdx=null; }
saveBtn.onclick = (e)=>{
  e.preventDefault();
  if(currentIdx===null) return;
  const formData = new FormData(editForm);
  const obj = dataset.find((d,i)=>i===currentIdx);
  const keys = Array.from(formData.keys());
  keys.forEach(k=>{
    obj[k] = formData.get(k);
  });
  // salva su localStorage
  localStorage.setItem('strutture_data', JSON.stringify(dataset));
  applyFilters();
  modal.classList.add('hidden');
}
deleteBtn.onclick = (e)=>{
  e.preventDefault();
  if(currentIdx===null) return;
  if(!confirm('Eliminare questa struttura?')) return;
  dataset.splice(currentIdx,1);
  localStorage.setItem('strutture_data', JSON.stringify(dataset));
  applyFilters();
  modal.classList.add('hidden');
}

// Export JSON
exportBtn.onclick = ()=>{
  const a = document.createElement('a');
  const blob = new Blob([JSON.stringify(dataset, null, 2)], {type:'application/json;charset=utf-8'});
  a.href = URL.createObjectURL(blob);
  a.download = 'strutture_export.json';
  a.click();
}

// Reset
resetBtn.onclick = ()=>{
  if(confirm('Ripristinare i dati originali e pulire le modifiche locali?')){
    dataset = JSON.parse(JSON.stringify(original));
    localStorage.removeItem('strutture_data');
    provSelect.value='';
    hasCasa.checked=false; hasTerreno.checked=false; searchEl.value='';
    applyFilters();
  }
}

// Event listeners
searchEl.addEventListener('input', applyFilters);
provSelect.addEventListener('change', applyFilters);
hasCasa.addEventListener('change', applyFilters);
hasTerreno.addEventListener('change', applyFilters);

// Inizializzo
loadData();
