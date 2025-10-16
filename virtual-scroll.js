// === QuoVadiScout v1.2.1 - Cache Bust: 2024-12-19-11-25 ===
console.log('🔄 VirtualScroll caricato con versione v1.2.1 - Cache bust applicato');

// VirtualScroller per ottimizzare il rendering di liste lunghe
class VirtualScroller {
  constructor(container, items, renderItem, options = {}) {
    this.container = container;
    this.items = items;
    this.renderItem = renderItem;
    this.visibleItems = new Set();
    this.placeholderHeight = options.placeholderHeight || 200;
    this.rootMargin = options.rootMargin || '200px';
    this.minItemsToVirtualize = options.minItemsToVirtualize || 20;
    
    // Intersection Observer per rilevare elementi visibili
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      { 
        rootMargin: this.rootMargin,
        threshold: 0
      }
    );
    
    // Container per placeholder
    this.placeholderContainer = null;
    
    console.log('🔄 VirtualScroller inizializzato per', items.length, 'elementi');
  }
  
  // Inizializza la virtualizzazione
  init() {
    // Se ci sono pochi elementi, renderizza normalmente
    if (this.items.length < this.minItemsToVirtualize) {
      this.renderAll();
      return;
    }
    
    console.log('📊 VirtualScroller: Attivando virtualizzazione per', this.items.length, 'elementi');
    
    // Pulisci container
    this.container.innerHTML = '';
    
    // Crea container per placeholder
    this.placeholderContainer = document.createElement('div');
    this.placeholderContainer.className = 'virtual-scroll-container';
    this.placeholderContainer.style.cssText = `
      position: relative;
      min-height: ${this.items.length * this.placeholderHeight}px;
    `;
    
    this.container.appendChild(this.placeholderContainer);
    
    // Crea placeholder per tutti gli elementi
    this.createPlaceholders();
    
    // Renderizza elementi iniziali visibili
    this.renderInitialItems();
  }
  
  // Crea placeholder per tutti gli elementi
  createPlaceholders() {
    this.items.forEach((item, index) => {
      const placeholder = document.createElement('div');
      placeholder.className = 'virtual-scroll-placeholder';
      placeholder.dataset.index = index;
      placeholder.style.cssText = `
        position: absolute;
        top: ${index * this.placeholderHeight}px;
        left: 0;
        right: 0;
        height: ${this.placeholderHeight}px;
        background: transparent;
      `;
      
      this.placeholderContainer.appendChild(placeholder);
      this.observer.observe(placeholder);
    });
  }
  
  // Renderizza elementi inizialmente visibili
  renderInitialItems() {
    const containerRect = this.container.getBoundingClientRect();
    const visibleStart = Math.max(0, Math.floor(-containerRect.top / this.placeholderHeight) - 2);
    const visibleEnd = Math.min(
      this.items.length - 1, 
      Math.ceil((window.innerHeight - containerRect.top) / this.placeholderHeight) + 2
    );
    
    for (let i = visibleStart; i <= visibleEnd; i++) {
      this.renderItemAtIndex(i);
    }
  }
  
  // Gestisce intersezioni con viewport
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = parseInt(entry.target.dataset.index);
        this.renderItemAtIndex(index, entry.target);
      }
    });
  }
  
  // Renderizza elemento specifico
  renderItemAtIndex(index, placeholder) {
    if (!placeholder) {
      placeholder = this.placeholderContainer.querySelector(`[data-index="${index}"]`);
    }
    
    if (!placeholder || this.visibleItems.has(index)) {
      return;
    }
    
    try {
      const item = this.items[index];
      const renderedElement = this.renderItem(item, index);
      
      if (renderedElement) {
        // Sostituisci placeholder con elemento renderizzato
        placeholder.replaceWith(renderedElement);
        this.visibleItems.add(index);
        
        // Aggiungi attributi per tracking
        renderedElement.dataset.virtualIndex = index;
        renderedElement.style.position = 'absolute';
        renderedElement.style.top = `${index * this.placeholderHeight}px`;
        renderedElement.style.left = '0';
        renderedElement.style.right = '0';
        renderedElement.style.height = `${this.placeholderHeight}px`;
        
        console.log('🔄 VirtualScroller: Renderizzato elemento', index);
      }
    } catch (error) {
      console.error('❌ VirtualScroller: Errore rendering elemento', index, error);
    }
  }
  
  // Renderizza tutti gli elementi (per liste piccole)
  renderAll() {
    this.container.innerHTML = '';
    
    this.items.forEach((item, index) => {
      const renderedElement = this.renderItem(item, index);
      if (renderedElement) {
        this.container.appendChild(renderedElement);
        this.visibleItems.add(index);
      }
    });
    
    console.log('🔄 VirtualScroller: Renderizzati tutti gli elementi');
  }
  
  // Aggiorna la lista di elementi
  updateItems(newItems) {
    this.items = newItems;
    this.visibleItems.clear();
    
    if (this.observer) {
      this.observer.disconnect();
    }
    
    this.init();
  }
  
  // Pulisce un elemento specifico
  clearItem(index) {
    const element = this.placeholderContainer?.querySelector(`[data-virtual-index="${index}"]`);
    if (element) {
      const placeholder = document.createElement('div');
      placeholder.className = 'virtual-scroll-placeholder';
      placeholder.dataset.index = index;
      placeholder.style.cssText = `
        position: absolute;
        top: ${index * this.placeholderHeight}px;
        left: 0;
        right: 0;
        height: ${this.placeholderHeight}px;
        background: transparent;
      `;
      
      element.replaceWith(placeholder);
      this.observer.observe(placeholder);
      this.visibleItems.delete(index);
    }
  }
  
  // Ottiene statistiche di rendering
  getStats() {
    return {
      totalItems: this.items.length,
      visibleItems: this.visibleItems.size,
      renderRatio: this.visibleItems.size / this.items.length,
      isVirtualized: this.items.length >= this.minItemsToVirtualize
    };
  }
  
  // Distrugge il virtual scroller
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    this.visibleItems.clear();
    this.container.innerHTML = '';
    
    console.log('🗑️ VirtualScroller: Distrutto');
  }
  
  // Scrolla a un elemento specifico
  scrollToItem(index) {
    if (index < 0 || index >= this.items.length) {
      console.warn('⚠️ VirtualScroller: Indice non valido per scroll:', index);
      return;
    }
    
    const scrollTop = index * this.placeholderHeight;
    this.container.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });
    
    // Assicurati che l'elemento sia renderizzato
    setTimeout(() => {
      this.renderItemAtIndex(index);
    }, 100);
  }
  
  // Ottiene elementi attualmente visibili
  getVisibleItems() {
    return Array.from(this.visibleItems).map(index => ({
      index,
      item: this.items[index]
    }));
  }
}

// Funzione di utilità per creare un virtual scroller
window.createVirtualScroller = (container, items, renderItem, options = {}) => {
  return new VirtualScroller(container, items, renderItem, options);
};

// Auto-scroll intelligente per mantenere posizione
class SmartScrollManager {
  constructor(virtualScroller) {
    this.virtualScroller = virtualScroller;
    this.lastScrollTop = 0;
    this.scrollDirection = 'down';
    this.scrollVelocity = 0;
    this.lastScrollTime = Date.now();
    
    this.setupScrollTracking();
  }
  
  setupScrollTracking() {
    this.virtualScroller.container.addEventListener('scroll', (e) => {
      const currentScrollTop = e.target.scrollTop;
      const currentTime = Date.now();
      
      // Calcola direzione e velocità
      this.scrollDirection = currentScrollTop > this.lastScrollTop ? 'down' : 'up';
      this.scrollVelocity = Math.abs(currentScrollTop - this.lastScrollTop) / (currentTime - this.lastScrollTime);
      
      this.lastScrollTop = currentScrollTop;
      this.lastScrollTime = currentTime;
      
      // Pre-renderizza elementi nella direzione di scroll
      this.preRenderInScrollDirection();
    });
  }
  
  preRenderInScrollDirection() {
    const visibleItems = this.virtualScroller.getVisibleItems();
    if (visibleItems.length === 0) return;
    
    const minIndex = Math.min(...visibleItems.map(v => v.index));
    const maxIndex = Math.max(...visibleItems.map(v => v.index));
    
    if (this.scrollDirection === 'down') {
      // Pre-renderizza elementi in basso
      for (let i = maxIndex + 1; i <= Math.min(maxIndex + 3, this.virtualScroller.items.length - 1); i++) {
        this.virtualScroller.renderItemAtIndex(i);
      }
    } else {
      // Pre-renderizza elementi in alto
      for (let i = Math.max(0, minIndex - 3); i < minIndex; i++) {
        this.virtualScroller.renderItemAtIndex(i);
      }
    }
  }
}

// Esponi globalmente
window.VirtualScroller = VirtualScroller;
// window.VirtualScrollManager = VirtualScrollManager; // Classe non definita

console.log('🔄 VirtualScroll inizializzato');
