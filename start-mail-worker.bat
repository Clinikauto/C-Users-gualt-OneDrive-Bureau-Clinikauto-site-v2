@echo off
REM ─────────────────────────────────────────────────────────────────────────────
REM  Clinikauto – Mail Worker Startup Script (Windows)
REM  Démarre le service de traitement automatique des emails via PM2
REM
REM  Pour démarrer automatiquement au démarrage Windows :
REM    1. Ouvrez le Planificateur de tâches Windows (taskschd.msc)
REM    2. Créez une nouvelle tâche déclenchée "Au démarrage de l'ordinateur"
REM    3. Action : démarrer un programme -> pointez vers ce fichier .bat
REM    4. Cochez "Exécuter même si l'utilisateur n'est pas connecté"
REM ─────────────────────────────────────────────────────────────────────────────

SETLOCAL

REM  Remplacez par le chemin réel de votre projet
SET PROJECT_DIR=%~dp0

cd /d "%PROJECT_DIR%"

REM  Vérifier que Node.js est disponible
where node >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installe ou pas dans le PATH.
    pause
    exit /b 1
)

REM  Vérifier que PM2 est installé (sinon l'installer)
where pm2 >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installation de PM2...
    npm install -g pm2
)

REM  Vérifier que ts-node est installé (sinon l'installer)
where ts-node >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [INFO] Installation de ts-node et tsconfig-paths...
    npm install -g ts-node tsconfig-paths
)

REM  Installer les dépendances du projet si nécessaire
IF NOT EXIST "%PROJECT_DIR%node_modules" (
    echo [INFO] Installation des dependances npm...
    npm install
)

REM  Créer le dossier logs si absent
IF NOT EXIST "%PROJECT_DIR%logs" mkdir "%PROJECT_DIR%logs"

REM  Démarrer / redémarrer le worker avec PM2
echo [INFO] Demarrage du worker Clinikauto Mail...
pm2 start ecosystem.config.cjs --env production

REM  Afficher le statut
pm2 list

echo.
echo [OK] Le service de gestion automatique des emails est actif.
echo      Consultez les logs dans le dossier logs/
echo      Commandes utiles :
echo        pm2 logs clinikauto-mail-worker   (voir les logs en temps reel)
echo        pm2 stop clinikauto-mail-worker    (arreter)
echo        pm2 restart clinikauto-mail-worker (redemarrer)
echo.

ENDLOCAL
