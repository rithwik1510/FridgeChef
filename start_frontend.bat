@echo off
echo ========================================
echo   FridgeChef Frontend Starting...
echo ========================================
echo.

cd /d "%~dp0frontend"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Create .env.local if not exists
if not exist ".env.local" (
    echo Creating .env.local file...
    echo NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 > .env.local
)

REM Start the development server
echo.
echo ========================================
echo   Frontend running at: http://localhost:3000
echo   Press Ctrl+C to stop
echo ========================================
echo.
call npm run dev
