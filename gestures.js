// === QuoVadiScout v1.2.1 - Cache Bust: 2024-12-19-11-25 ===
console.log('🔄 Gestures.js caricato con versione v1.2.1 - Cache bust applicato');

// TouchGestures per gesti touch su mobile
class TouchGestures {
  static enableSwipeToDelete(element, onSwipe) {
    let startX, startY, currentX, currentY;
    let isDragging = false;
    let swipeThreshold = 100;
    let deleteThreshold = 150;
    
    element.style.transition = 'transform 0.2s ease-out';
    element.style.touchAction = 'pan-y';
    
    element.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      currentX = startX;
      currentY = startY;
      isDragging = false;
      
      // Rimuovi transizione durante il drag
      element.style.transition = 'none';
    });
    
    element.addEventListener('touchmove', (e) => {
      if (!startX || !startY) return;
      
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
      
      const diffX = currentX - startX;
      const diffY = currentY - startY;
      
      // Verifica se è un swipe orizzontale
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
        isDragging = true;
        e.preventDefault();
        
        // Limita il movimento a sinistra
        const moveX = Math.min(0, diffX);
        element.style.transform = `translateX(${moveX}px)`;
        
        // Cambia opacità in base alla distanza
        const opacity = Math.max(0.3, 1 - Math.abs(moveX) / 200);
        element.style.opacity = opacity;
      }
    });
    
    element.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      
      const diffX = currentX - startX;
      const moveX = Math.min(0, diffX);
      
      // Ripristina transizione
      element.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
      
      if (Math.abs(moveX) > deleteThreshold) {
        // Elimina elemento
        element.style.transform = `translateX(-100%)`;
        element.style.opacity = '0';
        
        setTimeout(() => {
          if (onSwipe) onSwipe('delete');
        }, 200);
      } else if (Math.abs(moveX) > swipeThreshold) {
        // Mostra azione secondaria
        element.style.transform = `translateX(-80px)`;
        element.style.opacity = '0.7';
        
        setTimeout(() => {
          if (onSwipe) onSwipe('secondary');
        }, 100);
      } else {
        // Ripristina posizione
        element.style.transform = 'translateX(0)';
        element.style.opacity = '1';
      }
    });
  }
  
  static enablePullToRefresh(container, onRefresh) {
    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    let pullThreshold = 80;
    
    // Crea indicatore di refresh
    const refreshIndicator = document.createElement('div');
    refreshIndicator.style.cssText = `
      position: absolute;
      top: -60px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 40px;
      border: 3px solid #2f6b2f;
      border-top: 3px solid transparent;
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.2s ease-out;
    `;
    container.appendChild(refreshIndicator);
    
    container.addEventListener('touchstart', (e) => {
      if (container.scrollTop === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    });
    
    container.addEventListener('touchmove', (e) => {
      if (!isPulling || container.scrollTop > 0) return;
      
      currentY = e.touches[0].clientY;
      const diffY = currentY - startY;
      
      if (diffY > 0) {
        e.preventDefault();
        
        // Calcola opacità in base alla distanza
        const opacity = Math.min(1, diffY / pullThreshold);
        refreshIndicator.style.opacity = opacity;
        
        // Ruota l'indicatore
        const rotation = (diffY / pullThreshold) * 360;
        refreshIndicator.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
        
        // Cambia colore quando raggiunge la soglia
        if (diffY >= pullThreshold) {
          refreshIndicator.style.borderColor = '#28a745 #28a745 transparent';
        } else {
          refreshIndicator.style.borderColor = '#2f6b2f #2f6b2f transparent';
        }
      }
    });
    
    container.addEventListener('touchend', (e) => {
      if (!isPulling) return;
      
      const diffY = currentY - startY;
      
      if (diffY >= pullThreshold) {
        // Attiva refresh
        refreshIndicator.style.borderColor = '#28a745 #28a745 transparent';
        
        // Animazione di caricamento
        refreshIndicator.style.animation = 'spin 1s linear infinite';
        
        if (onRefresh) {
          onRefresh().finally(() => {
            // Ripristina stato
            refreshIndicator.style.animation = '';
            refreshIndicator.style.opacity = '0';
            refreshIndicator.style.borderColor = '#2f6b2f #2f6b2f transparent';
            refreshIndicator.style.transform = 'translateX(-50%) rotate(0deg)';
          });
        }
      } else {
        // Ripristina stato
        refreshIndicator.style.opacity = '0';
        refreshIndicator.style.transform = 'translateX(-50%) rotate(0deg)';
        refreshIndicator.style.borderColor = '#2f6b2f #2f6b2f transparent';
      }
      
      isPulling = false;
    });
  }
  
  static enableDoubleTapZoom(element, onDoubleTap) {
    let lastTap = 0;
    let tapCount = 0;
    
    element.addEventListener('touchend', (e) => {
      const currentTime = Date.now();
      const tapLength = currentTime - lastTap;
      
      if (tapLength < 500 && tapLength > 0) {
        tapCount++;
        
        if (tapCount === 2) {
          if (onDoubleTap) onDoubleTap(e);
          tapCount = 0;
        }
      } else {
        tapCount = 1;
      }
      
      lastTap = currentTime;
    });
  }
  
  static enablePinchZoom(container, minScale = 0.5, maxScale = 3) {
    let initialDistance = 0;
    let initialScale = 1;
    let currentScale = 1;
    
    function getDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }
    
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialDistance = getDistance(e.touches);
        initialScale = currentScale;
        e.preventDefault();
      }
    });
    
    container.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const currentDistance = getDistance(e.touches);
        const scale = (currentDistance / initialDistance) * initialScale;
        
        currentScale = Math.max(minScale, Math.min(maxScale, scale));
        container.style.transform = `scale(${currentScale})`;
        
        e.preventDefault();
      }
    });
    
    container.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) {
        // Snap to bounds se necessario
        if (currentScale < 1) {
          currentScale = 1;
          container.style.transition = 'transform 0.2s ease-out';
          container.style.transform = 'scale(1)';
          
          setTimeout(() => {
            container.style.transition = '';
          }, 200);
        }
      }
    });
  }
  
  static enableLongPress(element, onLongPress, duration = 500) {
    let pressTimer = null;
    let isLongPress = false;
    
    element.addEventListener('touchstart', (e) => {
      isLongPress = false;
      pressTimer = setTimeout(() => {
        isLongPress = true;
        if (onLongPress) onLongPress(e);
      }, duration);
    });
    
    element.addEventListener('touchend', (e) => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    });
    
    element.addEventListener('touchmove', (e) => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    });
  }
}

// Crea istanza globale
window.touchGestures = TouchGestures;

// Funzioni di utilità globali
window.enableSwipeToDelete = (element, onSwipe) => TouchGestures.enableSwipeToDelete(element, onSwipe);
window.enablePullToRefresh = (container, onRefresh) => TouchGestures.enablePullToRefresh(container, onRefresh);
window.enableDoubleTapZoom = (element, onDoubleTap) => TouchGestures.enableDoubleTapZoom(element, onDoubleTap);
window.enablePinchZoom = (container, minScale, maxScale) => TouchGestures.enablePinchZoom(container, minScale, maxScale);
window.enableLongPress = (element, onLongPress, duration) => TouchGestures.enableLongPress(element, onLongPress, duration);

// Alias per compatibilità test
window.TouchGestureManager = TouchGestures;

console.log('🔄 TouchGestures inizializzato');
