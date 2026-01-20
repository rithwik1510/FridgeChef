@echo off
echo ========================================
echo   FridgeChef Setup
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

REM Create .env file
echo GOOGLE_API_KEY=%API_KEY%> .env

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
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To run the application:
echo   1. Open TWO terminal windows
echo   2. In terminal 1: Run start_backend.bat
echo   3. In terminal 2: Run start_frontend.bat
echo   4. Open http://localhost:3000 in your browser
echo.
pause
