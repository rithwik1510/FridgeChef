@echo off
echo ========================================
echo   FridgeChef Backend Starting...
echo ========================================
echo.

cd /d "%~dp0backend"

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt -q

REM Create uploads folder
if not exist "uploads" mkdir uploads

REM Start the server
echo.
echo ========================================
echo   Backend running at: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo   Press Ctrl+C to stop
echo ========================================
echo.
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
