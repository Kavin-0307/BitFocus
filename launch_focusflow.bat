@echo off
title FocusFlow Alpha Launch System
echo [1/5] Terminating old hero/boss processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM java.exe /T >nul 2>&1
taskkill /F /IM python.exe /T >nul 2>&1

echo [2/5] Initializing ML Brain (FastAPI)...
start "FocusFlow: ML Service" cmd /c "cd ml && venv\Scripts\python -m uvicorn main:app --port 8001 --host 0.0.0.0"

echo [3/5] Powering up Backend (Spring Boot)...
start "FocusFlow: Backend" cmd /c "cd backend && mvnw spring-boot:run"

echo [4/5] Activating Visual Interface (Vite)...
start "FocusFlow: Frontend" cmd /c "cd frontend && npm run dev"

echo.
echo ==================================================
echo   FOCUSFLOW SYSTEM INITIALIZED
echo ==================================================
echo   ML:       http://localhost:8001
echo   BACKEND:  http://localhost:8080
echo   FRONTEND: http://localhost:5173
echo ==================================================
echo.
echo Waiting for services to stabilize...
timeout /t 10

echo [5/5] Launching Portal...
start http://localhost:5173

echo Mission Ready.
pause
