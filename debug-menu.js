// debug-menu.js
// Script di debug per il menu hamburger

console.log('🐛 Debug Menu Script caricato');

// Funzione per testare il menu
function debugMenu() {
  console.log('\n🐛 === DEBUG MENU ===');
  
  // Verifica elementi DOM
  const menuToggle = document.getElementById('menuToggle');
  const mainMenu = document.getElementById('mainMenu');
  
  console.log('1. Elementi DOM:');
  console.log('   - Menu Toggle:', menuToggle ? '✅ Trovato' : '❌ Non trovato');
  console.log('   - Main Menu:', mainMenu ? '✅ Trovato' : '❌ Non trovato');
  
  if (menuToggle) {
    console.log('   - Menu Toggle classes:', menuToggle.classList.toString());
    console.log('   - Menu Toggle styles:', window.getComputedStyle(menuToggle).display);
  }
  
  if (mainMenu) {
    console.log('   - Main Menu classes:', mainMenu.classList.toString());
    console.log('   - Main Menu styles:', {
      display: window.getComputedStyle(mainMenu).display,
      visibility: window.getComputedStyle(mainMenu).visibility,
      opacity: window.getComputedStyle(mainMenu).opacity,
      zIndex: window.getComputedStyle(mainMenu).zIndex
    });
  }
  
  // Verifica CSS
  console.log('\n2. CSS Variables:');
  const root = document.documentElement;
  const zMenu = getComputedStyle(root).getPropertyValue('--z-menu');
  console.log('   - --z-menu:', zMenu || '❌ Non definita');
  
  // Verifica event listeners
  console.log('\n3. Event Listeners:');
  if (menuToggle) {
    console.log('   - Menu Toggle click listeners:', menuToggle.onclick ? '✅ Presente' : '❌ Assente');
  }
  
  // Test manuale
  console.log('\n4. Test Manuale:');
  if (mainMenu) {
    const isHidden = mainMenu.classList.contains('hidden');
    console.log('   - Menu attualmente:', isHidden ? 'nascosto' : 'visibile');
    
    // Test apertura/chiusura
    console.log('   - Test toggle...');
    mainMenu.classList.toggle('hidden');
    const newState = mainMenu.classList.contains('hidden');
    console.log('   - Nuovo stato:', newState ? 'nascosto' : 'visibile');
    
    // Ripristina stato originale
    if (isHidden !== newState) {
      mainMenu.classList.toggle('hidden');
      console.log('   - Stato ripristinato');
    }
  }
  
  console.log('🐛 === FINE DEBUG ===\n');
}

// Funzione per forzare apertura menu
function forceOpenMenu() {
  const mainMenu = document.getElementById('mainMenu');
  if (mainMenu) {
    mainMenu.classList.remove('hidden');
    console.log('🔧 Menu forzato aperto');
  } else {
    console.error('❌ Menu non trovato');
  }
}

// Funzione per forzare chiusura menu
function forceCloseMenu() {
  const mainMenu = document.getElementById('mainMenu');
  if (mainMenu) {
    mainMenu.classList.add('hidden');
    console.log('🔧 Menu forzato chiuso');
  } else {
    console.error('❌ Menu non trovato');
  }
}

// Funzione per simulare click
function simulateMenuClick() {
  const menuToggle = document.getElementById('menuToggle');
  if (menuToggle) {
    console.log('🖱️ Simulazione click menu toggle');
    menuToggle.click();
  } else {
    console.error('❌ Menu toggle non trovato');
  }
}

// Auto-debug dopo 2 secondi
setTimeout(() => {
  console.log('🐛 Auto-debug menu in corso...');
  debugMenu();
}, 2000);

// Esponi funzioni globalmente
window.debugMenu = debugMenu;
window.forceOpenMenu = forceOpenMenu;
window.forceCloseMenu = forceCloseMenu;
window.simulateMenuClick = simulateMenuClick;

console.log('🐛 Funzioni debug disponibili:');
console.log('   - debugMenu() - Debug completo');
console.log('   - forceOpenMenu() - Forza apertura');
console.log('   - forceCloseMenu() - Forza chiusura');
console.log('   - simulateMenuClick() - Simula click');
