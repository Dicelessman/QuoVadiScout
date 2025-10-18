@echo off
echo ========================================
echo    DEPLOY SICUREZZA QUOVADISCOUT
echo ========================================
echo.

echo [1/5] Verifica configurazione Firebase...
firebase --version
if %errorlevel% neq 0 (
    echo ERRORE: Firebase CLI non installato
    echo Installa con: npm install -g firebase-tools
    pause
    exit /b 1
)

echo [2/5] Verifica file di configurazione...
if not exist "firebase.json" (
    echo ERRORE: File firebase.json non trovato
    pause
    exit /b 1
)
if not exist "firestore.rules" (
    echo ERRORE: File firestore.rules non trovato
    pause
    exit /b 1
)
echo File di configurazione trovati

echo [3/5] Deploy Firestore Security Rules...
firebase deploy --only firestore:rules
if %errorlevel% neq 0 (
    echo ERRORE: Deploy Firestore Rules fallito
    pause
    exit /b 1
)

echo [4/5] Deploy Cloud Functions...
cd functions
if not exist node_modules (
    echo Installazione dipendenze...
    npm install
)
cd ..
firebase deploy --only functions
if %errorlevel% neq 0 (
    echo ERRORE: Deploy Cloud Functions fallito
    pause
    exit /b 1
)

echo [5/5] Verifica deploy...
echo Controllo log Functions...
firebase functions:log --limit 10

echo.
echo ========================================
echo    DEPLOY COMPLETATO CON SUCCESSO!
echo ========================================
echo.
echo Prossimi passi:
echo 1. Testa l'autenticazione nell'app
echo 2. Verifica i log in Firebase Console
echo 3. Esegui test di sicurezza: runSecurityTests()
echo.
echo Per testare la sicurezza:
echo - Apri console browser
echo - Esegui: runSecurityTests()
echo - Verifica: testSecurityBypass()
echo.
pause
