const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const db = admin.firestore();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Middleware validazione token
async function validateToken(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token mancante' });
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(401).json({ error: 'Token non valido' });
  }
}

// Middleware rate limiting
const rateLimits = new Map();
function rateLimit(maxRequests, windowMs) {
  return (req, res, next) => {
    const userId = req.user.uid;
    const now = Date.now();
    const userLimits = rateLimits.get(userId) || { count: 0, resetTime: now + windowMs };
    
    if (now > userLimits.resetTime) {
      userLimits.count = 0;
      userLimits.resetTime = now + windowMs;
    }
    
    if (userLimits.count >= maxRequests) {
      return res.status(429).json({ 
        error: 'Troppi tentativi',
        retryAfter: Math.ceil((userLimits.resetTime - now) / 1000)
      });
    }
    
    userLimits.count++;
    rateLimits.set(userId, userLimits);
    next();
  };
}

// API: Crea struttura
app.post('/strutture', validateToken, rateLimit(10, 60000), async (req, res) => {
  try {
    const data = req.body;
    
    // Validazione dati
    if (!data.Struttura || data.Struttura.trim() === '') {
      return res.status(400).json({ error: 'Nome struttura obbligatorio' });
    }
    
    // Aggiungi metadata sicurezza
    const structureData = {
      ...data,
      createdBy: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastModifiedBy: req.user.uid,
      lastModified: admin.firestore.FieldValue.serverTimestamp(),
      version: 1
    };
    
    const docRef = await db.collection('strutture').add(structureData);
    
    // Log attività
    await db.collection('activity_log').add({
      action: 'structure_created',
      structureId: docRef.id,
      userId: req.user.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: { name: data.Struttura }
    });
    
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Error creating structure:', error);
    res.status(500).json({ error: 'Errore creazione struttura' });
  }
});

// API: Aggiorna struttura
app.put('/strutture/:id', validateToken, rateLimit(50, 60000), async (req, res) => {
  try {
    const structureId = req.params.id;
    const data = req.body;
    
    // Verifica permessi
    const structureDoc = await db.collection('strutture').doc(structureId).get();
    if (!structureDoc.exists) {
      return res.status(404).json({ error: 'Struttura non trovata' });
    }
    
    const structure = structureDoc.data();
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const isAdmin = userDoc.exists && userDoc.data().role === 'admin';
    
    if (structure.createdBy !== req.user.uid && !isAdmin) {
      return res.status(403).json({ error: 'Non autorizzato' });
    }
    
    // Salva versione precedente
    await db.collection('structure_versions').add({
      structureId: structureId,
      data: structure,
      savedBy: req.user.uid,
      savedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Aggiorna struttura
    const updateData = {
      ...data,
      lastModifiedBy: req.user.uid,
      lastModified: admin.firestore.FieldValue.serverTimestamp(),
      version: admin.firestore.FieldValue.increment(1)
    };
    
    await db.collection('strutture').doc(structureId).update(updateData);
    
    // Log attività
    await db.collection('activity_log').add({
      action: 'structure_updated',
      structureId: structureId,
      userId: req.user.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: { changes: Object.keys(data) }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating structure:', error);
    res.status(500).json({ error: 'Errore aggiornamento struttura' });
  }
});

// API: Elimina struttura
app.delete('/strutture/:id', validateToken, rateLimit(5, 60000), async (req, res) => {
  try {
    const structureId = req.params.id;
    
    // Verifica permessi
    const structureDoc = await db.collection('strutture').doc(structureId).get();
    if (!structureDoc.exists) {
      return res.status(404).json({ error: 'Struttura non trovata' });
    }
    
    const structure = structureDoc.data();
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const isAdmin = userDoc.exists && userDoc.data().role === 'admin';
    
    if (structure.createdBy !== req.user.uid && !isAdmin) {
      return res.status(403).json({ error: 'Non autorizzato' });
    }
    
    // Archivia prima di eliminare
    await db.collection('structure_versions').add({
      structureId: structureId,
      data: structure,
      action: 'deleted',
      savedBy: req.user.uid,
      savedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    await db.collection('strutture').doc(structureId).delete();
    
    // Log attività
    await db.collection('activity_log').add({
      action: 'structure_deleted',
      structureId: structureId,
      userId: req.user.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting structure:', error);
    res.status(500).json({ error: 'Errore eliminazione struttura' });
  }
});

// API: Valida token (health check)
app.get('/validate-token', validateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: {
      uid: req.user.uid,
      email: req.user.email
    }
  });
});

// API: Ottieni log attività (solo admin)
app.get('/activity-log', validateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const isAdmin = userDoc.exists && userDoc.data().role === 'admin';
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Solo admin può accedere ai log' });
    }
    
    const snapshot = await db.collection('activity_log')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();
    
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({ logs });
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.status(500).json({ error: 'Errore recupero log attività' });
  }
});

// API: Ottieni statistiche sicurezza (solo admin)
app.get('/security-stats', validateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const isAdmin = userDoc.exists && userDoc.data().role === 'admin';
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Solo admin può accedere alle statistiche' });
    }
    
    // Conta incidenti di sicurezza
    const incidentsSnapshot = await db.collection('security_incidents').get();
    const incidentsCount = incidentsSnapshot.size;
    
    // Conta attività recenti
    const recentActivities = await db.collection('activity_log')
      .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(
        new Date(Date.now() - 24 * 60 * 60 * 1000) // Ultime 24 ore
      ))
      .get();
    
    const stats = {
      securityIncidents: incidentsCount,
      recentActivities: recentActivities.size,
      lastUpdated: new Date().toISOString()
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching security stats:', error);
    res.status(500).json({ error: 'Errore recupero statistiche sicurezza' });
  }
});

// Export Cloud Function
exports.api = functions.https.onRequest(app);

// Funzione per cleanup rate limiting (ogni ora)
exports.cleanupRateLimits = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
  const now = Date.now();
  for (const [userId, limits] of rateLimits.entries()) {
    if (now > limits.resetTime) {
      rateLimits.delete(userId);
    }
  }
  console.log('Rate limits cleaned up');
});
