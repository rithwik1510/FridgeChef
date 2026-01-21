@echo off
title FridgeChef - Full Stack Startup
color 0A

echo.
echo ========================================
echo   FridgeChef - Starting Full Stack
echo ========================================
echo.

REM Check if .env exists in backend
if not exist "backend\.env" (
    echo ERROR: Backend is not configured!
    echo.
    echo Please run FIRST_TIME_SETUP.bat first.
    echo.
    pause
    exit /b 1
)

echo [1/2] Starting Backend...
start "FridgeChef Backend" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 5 /nobreak >nul

echo [2/2] Starting Frontend...
start "FridgeChef Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ========================================
echo   FridgeChef is Starting!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo Two new windows opened:
echo   - Backend (Python/FastAPI)
echo   - Frontend (Next.js)
echo.
echo Close this window or press any key...
pause >nul
