// Security Client per validazione token e chiamate API sicure

class SecurityClient {
  constructor() {
    this.apiBaseUrl = 'https://us-central1-quovadiscout.cloudfunctions.net/api';
    this.tokenCache = null;
    this.tokenExpiry = null;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  // Ottieni token valido
  async getValidToken() {
    // Usa token cached se ancora valido
    if (this.tokenCache && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.tokenCache;
    }

    if (!auth.currentUser) {
      throw new Error('Utente non autenticato');
    }

    try {
      // Ottieni nuovo token
      const token = await auth.currentUser.getIdToken(true);
      this.tokenCache = token;
      // Token valido per 55 minuti (scade dopo 1 ora)
      this.tokenExpiry = Date.now() + (55 * 60 * 1000);
      this.retryCount = 0; // Reset retry count su successo
      
      return token;
    } catch (error) {
      console.error('Errore ottenimento token:', error);
      throw new Error('Errore autenticazione');
    }
  }

  // Valida token con backend
  async validateToken() {
    try {
      const token = await this.getValidToken();
      const response = await fetch(`${this.apiBaseUrl}/validate-token`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Token non valido');
      }

      const result = await response.json();
      console.log('✅ Token validato con successo');
      return result;
    } catch (error) {
      console.error('Errore validazione token:', error);
      // Forza logout se token non valido
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`🔄 Tentativo ${this.retryCount} di validazione token`);
        return await this.validateToken();
      } else {
        await this.forceLogout();
        return false;
      }
    }
  }

  // Chiamata API sicura generica con retry
  async secureApiCall(method, endpoint, data = null, retryCount = 0) {
    try {
      const token = await this.getValidToken();
      
      const options = {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.apiBaseUrl}${endpoint}`, options);
      
      if (response.status === 401) {
        // Token scaduto o non valido
        if (retryCount < this.maxRetries) {
          console.log(`🔄 Token scaduto, retry ${retryCount + 1}`);
          this.tokenCache = null; // Forza refresh token
          return await this.secureApiCall(method, endpoint, data, retryCount + 1);
        } else {
          await this.forceLogout();
          throw new Error('Sessione scaduta, effettua nuovamente il login');
        }
      }

      if (response.status === 429) {
        const errorData = await response.json();
        throw new Error(`Troppi tentativi. Riprova tra ${errorData.retryAfter} secondi`);
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore nella richiesta');
      }

      return await response.json();
    } catch (error) {
      console.error('Errore API call:', error);
      if (typeof showError === 'function') {
        showError(error.message);
      }
      throw error;
    }
  }

  // Crea struttura (via API)
  async createStructure(data) {
    try {
      console.log('🔒 Creazione struttura via API sicura...');
      const result = await this.secureApiCall('POST', '/strutture', data);
      console.log('✅ Struttura creata con successo:', result.id);
      return result;
    } catch (error) {
      console.error('❌ Errore creazione struttura:', error);
      throw error;
    }
  }

  // Aggiorna struttura (via API)
  async updateStructure(id, data) {
    try {
      console.log('🔒 Aggiornamento struttura via API sicura...', id);
      const result = await this.secureApiCall('PUT', `/strutture/${id}`, data);
      console.log('✅ Struttura aggiornata con successo');
      return result;
    } catch (error) {
      console.error('❌ Errore aggiornamento struttura:', error);
      throw error;
    }
  }

  // Elimina struttura (via API)
  async deleteStructure(id) {
    try {
      console.log('🔒 Eliminazione struttura via API sicura...', id);
      const result = await this.secureApiCall('DELETE', `/strutture/${id}`);
      console.log('✅ Struttura eliminata con successo');
      return result;
    } catch (error) {
      console.error('❌ Errore eliminazione struttura:', error);
      throw error;
    }
  }

  // Ottieni log attività (solo admin)
  async getActivityLog() {
    try {
      console.log('🔒 Recupero log attività...');
      const result = await this.secureApiCall('GET', '/activity-log');
      console.log('✅ Log attività recuperati:', result.logs.length);
      return result.logs;
    } catch (error) {
      console.error('❌ Errore recupero log attività:', error);
      throw error;
    }
  }

  // Ottieni statistiche sicurezza (solo admin)
  async getSecurityStats() {
    try {
      console.log('🔒 Recupero statistiche sicurezza...');
      const result = await this.secureApiCall('GET', '/security-stats');
      console.log('✅ Statistiche sicurezza recuperate');
      return result;
    } catch (error) {
      console.error('❌ Errore recupero statistiche sicurezza:', error);
      throw error;
    }
  }

  // Forza logout
  async forceLogout() {
    try {
      console.log('🚪 Forzatura logout per problemi di sicurezza...');
      this.tokenCache = null;
      this.tokenExpiry = null;
      this.retryCount = 0;
      
      if (typeof logoutUser === 'function') {
        await logoutUser();
      } else if (auth.currentUser) {
        await auth.signOut();
      }
      
      if (typeof showError === 'function') {
        showError('Sessione scaduta. Effettua nuovamente il login.');
      }
    } catch (error) {
      console.error('Errore durante logout forzato:', error);
    }
  }

  // Verifica connessione API
  async checkConnection() {
    try {
      const result = await this.validateToken();
      return {
        connected: true,
        user: result.user,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Pulisci cache token
  clearTokenCache() {
    this.tokenCache = null;
    this.tokenExpiry = null;
    this.retryCount = 0;
    console.log('🧹 Cache token pulita');
  }

  // Ottieni stato client
  getStatus() {
    return {
      hasToken: !!this.tokenCache,
      tokenExpiry: this.tokenExpiry,
      retryCount: this.retryCount,
      isTokenValid: this.tokenCache && this.tokenExpiry && Date.now() < this.tokenExpiry
    };
  }
}

// Istanza globale
window.securityClient = new SecurityClient();

// Validazione automatica ogni 10 minuti
setInterval(async () => {
  if (auth.currentUser) {
    try {
      await window.securityClient.validateToken();
    } catch (error) {
      console.warn('⚠️ Validazione token automatica fallita:', error.message);
    }
  }
}, 10 * 60 * 1000);

// Pulisci cache token quando l'utente fa logout
if (typeof auth !== 'undefined') {
  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.securityClient.clearTokenCache();
    }
  });
}

// Funzioni helper globali
window.checkSecurityConnection = async function() {
  const status = await window.securityClient.checkConnection();
  console.log('🔍 Stato connessione sicurezza:', status);
  return status;
};

window.getSecurityStatus = function() {
  const status = window.securityClient.getStatus();
  console.log('📊 Stato security client:', status);
  return status;
};

console.log('🔒 Security Client inizializzato');
