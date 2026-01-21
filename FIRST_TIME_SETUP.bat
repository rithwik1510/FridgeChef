@echo off
color 0E
title FridgeChef - First Time Setup
echo.
echo ╔════════════════════════════════════════╗
echo ║  FridgeChef - FIRST TIME SETUP ONLY    ║
echo ╚════════════════════════════════════════╝
echo.
echo ⚠️  WARNING: Only run this script ONCE!
echo.
echo After setup completes, use START_APP.bat
echo to start the application every time.
echo.
echo ========================================
echo.

REM Get API key from user
set /p API_KEY="Enter your Google Gemini API Key: "

if "%API_KEY%"=="" (
    echo Error: API Key is required!
    pause
    exit /b 1
)

echo.
echo Setting up backend...
cd /d "%~dp0backend"

REM Generate SECRET_KEY
for /f %%i in ('python -c "import secrets; print(secrets.token_hex(32))"') do set SECRET_KEY=%%i

REM Create .env file with both required keys
(
echo SECRET_KEY=%SECRET_KEY%
echo GOOGLE_API_KEY=%API_KEY%
) > .env

REM Create virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate and install dependencies
call venv\Scripts\activate.bat
echo Installing Python dependencies...
pip install -r requirements.txt -q

REM Create uploads folder
if not exist "uploads" mkdir uploads

echo.
echo Setting up frontend...
cd /d "%~dp0frontend"

REM Create .env.local
echo NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 > .env.local

REM Install node dependencies
echo Installing Node.js dependencies...
call npm install

echo.
echo ╔════════════════════════════════════════╗
echo ║         Setup Complete! ✅              ║
echo ╚════════════════════════════════════════╝
echo.
echo Your settings are now PERMANENTLY SAVED!
echo.
echo ✅ Backend configured (backend/.env)
echo ✅ Frontend configured (frontend/.env.local)
echo ✅ Dependencies installed
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   FROM NOW ON, TO START THE APP:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo   👉 Double-click: START_APP.bat
echo.
echo   ⚠️  DO NOT run FIRST_TIME_SETUP.bat again!
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause
