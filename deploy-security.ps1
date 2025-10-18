# Deploy Sicurezza QuoVadiScout
# Script PowerShell per Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    DEPLOY SICUREZZA QUOVADISCOUT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifica Firebase CLI e configurazione
Write-Host "[1/5] Verifica configurazione Firebase..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version
    Write-Host "Firebase CLI: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "ERRORE: Firebase CLI non installato" -ForegroundColor Red
    Write-Host "Installa con: npm install -g firebase-tools" -ForegroundColor Yellow
    Read-Host "Premi Invio per uscire"
    exit 1
}

# Verifica file di configurazione
Write-Host "[2/5] Verifica file di configurazione..." -ForegroundColor Yellow
if (-not (Test-Path "firebase.json")) {
    Write-Host "ERRORE: File firebase.json non trovato" -ForegroundColor Red
    Read-Host "Premi Invio per uscire"
    exit 1
}
if (-not (Test-Path "firestore.rules")) {
    Write-Host "ERRORE: File firestore.rules non trovato" -ForegroundColor Red
    Read-Host "Premi Invio per uscire"
    exit 1
}
Write-Host "✅ File di configurazione trovati" -ForegroundColor Green

# Deploy Firestore Rules
Write-Host "[3/5] Deploy Firestore Security Rules..." -ForegroundColor Yellow
try {
    firebase deploy --only firestore:rules
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Firestore Rules deployate con successo" -ForegroundColor Green
    } else {
        throw "Deploy fallito"
    }
} catch {
    Write-Host "ERRORE: Deploy Firestore Rules fallito" -ForegroundColor Red
    Read-Host "Premi Invio per uscire"
    exit 1
}

# Deploy Cloud Functions
Write-Host "[4/5] Deploy Cloud Functions..." -ForegroundColor Yellow
try {
    Set-Location functions
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installazione dipendenze..." -ForegroundColor Yellow
        npm install
    }
    Set-Location ..
    firebase deploy --only functions
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Cloud Functions deployate con successo" -ForegroundColor Green
    } else {
        throw "Deploy fallito"
    }
} catch {
    Write-Host "ERRORE: Deploy Cloud Functions fallito" -ForegroundColor Red
    Read-Host "Premi Invio per uscire"
    exit 1
}

# Verifica deploy
Write-Host "[5/5] Verifica deploy..." -ForegroundColor Yellow
Write-Host "Controllo log Functions..." -ForegroundColor Yellow
firebase functions:log --limit 10

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    DEPLOY COMPLETATO CON SUCCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prossimi passi:" -ForegroundColor Yellow
Write-Host "1. Testa l'autenticazione nell'app" -ForegroundColor White
Write-Host "2. Verifica i log in Firebase Console" -ForegroundColor White
Write-Host "3. Esegui test di sicurezza: runSecurityTests()" -ForegroundColor White
Write-Host ""
Write-Host "Per testare la sicurezza:" -ForegroundColor Yellow
Write-Host "- Apri console browser" -ForegroundColor White
Write-Host "- Esegui: runSecurityTests()" -ForegroundColor White
Write-Host "- Verifica: testSecurityBypass()" -ForegroundColor White
Write-Host ""

# Test automatico se richiesto
$testNow = Read-Host "Vuoi eseguire test di sicurezza ora? (s/n)"
if ($testNow -eq "s" -or $testNow -eq "S") {
    Write-Host "Apri l'app nel browser e esegui i test di sicurezza..." -ForegroundColor Yellow
    Write-Host "URL: http://localhost:3000 o il tuo dominio" -ForegroundColor White
}

Read-Host "Premi Invio per uscire"
