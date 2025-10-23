// === Aggiorna Statistiche App ===
function aggiornaStatisticheApp() {
  const container = document.getElementById('appStatsContent');
  if (!container) return;
  
  // Genera statistiche
  const stats = window.analyticsManager ? window.analyticsManager.generateUserReport() : {
    sessionId: 'N/A',
    sessionDuration: 0,
    totalEvents: 0,
    totalActions: 0,
    totalErrors: 0,
    performanceMetrics: {}
  };

  const smartStats = window.smartNotificationManager ? window.smartNotificationManager.getNotificationStats() : {
    todayNotifications: 0,
    weekNotifications: 0,
    nearbyStructures: 0,
    visitedStructures: 0
  };

  const backupStats = window.backupSyncManager ? {
    lastSync: window.backupSyncManager.lastSyncTime,
    backupCount: window.backupSyncManager.backupHistory.length,
    storageUsed: window.backupSyncManager.getStorageUsage()
  } : {
    lastSync: null,
    backupCount: 0,
    storageUsed: { localStorage: 0, estimated: 0 }
  };

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
      
      <!-- Sessione Corrente -->
      <div style="padding: 15px; background: var(--bg-primary, white); border-radius: 8px; box-shadow: var(--shadow-sm);">
        <h3 style="margin: 0 0 15px 0; color: var(--primary, #2f6b2f);">⏱️ Sessione</h3>
        <div style="display: flex; flex-direction: column; gap: 8px; color: var(--text-primary, #1a1a1a);">
          <div><strong>Durata:</strong> ${stats.sessionDuration}s</div>
          <div><strong>Eventi:</strong> ${stats.totalEvents}</div>
          <div><strong>Azioni:</strong> ${stats.totalActions}</div>
          <div><strong>Errori:</strong> ${stats.totalErrors}</div>
        </div>
      </div>

      <!-- Performance -->
      <div style="padding: 15px; background: var(--bg-primary, white); border-radius: 8px; box-shadow: var(--shadow-sm);">
        <h3 style="margin: 0 0 15px 0; color: var(--primary, #2f6b2f);">⚡ Performance</h3>
        <div style="display: flex; flex-direction: column; gap: 8px; color: var(--text-primary, #1a1a1a);">
          <div><strong>Load Time:</strong> ${stats.performanceMetrics.loadTime ? Math.round(stats.performanceMetrics.loadTime) + 'ms' : 'N/A'}</div>
          <div><strong>LCP:</strong> ${stats.performanceMetrics.lcp ? Math.round(stats.performanceMetrics.lcp) + 'ms' : 'N/A'}</div>
          <div><strong>FID:</strong> ${stats.performanceMetrics.fid ? Math.round(stats.performanceMetrics.fid) + 'ms' : 'N/A'}</div>
          <div><strong>CLS:</strong> ${stats.performanceMetrics.cls ? stats.performanceMetrics.cls.toFixed(3) : 'N/A'}</div>
        </div>
      </div>

      <!-- Notifiche -->
      <div style="padding: 15px; background: var(--bg-primary, white); border-radius: 8px; box-shadow: var(--shadow-sm);">
        <h3 style="margin: 0 0 15px 0; color: var(--primary, #2f6b2f);">🧠 Notifiche</h3>
        <div style="display: flex; flex-direction: column; gap: 8px; color: var(--text-primary, #1a1a1a);">
          <div><strong>Oggi:</strong> ${smartStats.todayNotifications}</div>
          <div><strong>Settimana:</strong> ${smartStats.weekNotifications}</div>
          <div><strong>Vicine:</strong> ${smartStats.nearbyStructures}</div>
          <div><strong>Visitate:</strong> ${smartStats.visitedStructures}</div>
        </div>
      </div>

      <!-- Backup -->
      <div style="padding: 15px; background: var(--bg-primary, white); border-radius: 8px; box-shadow: var(--shadow-sm);">
        <h3 style="margin: 0 0 15px 0; color: var(--primary, #2f6b2f);">💾 Backup</h3>
        <div style="display: flex; flex-direction: column; gap: 8px; color: var(--text-primary, #1a1a1a);">
          <div><strong>Ultima Sync:</strong> ${backupStats.lastSync ? new Date(backupStats.lastSync).toLocaleString('it-IT') : 'Mai'}</div>
          <div><strong>Backup:</strong> ${backupStats.backupCount}</div>
          <div><strong>Spazio:</strong> ${Math.round(backupStats.storageUsed.localStorage / 1024)}KB</div>
          <div><strong>Totale:</strong> ${Math.round(backupStats.storageUsed.estimated / 1024)}KB</div>
        </div>
      </div>

    </div>
  `;
}

