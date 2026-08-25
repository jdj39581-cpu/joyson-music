@echo off
title AuraBeat - AI Mood Music Player
rem ====================================================
rem AuraBeat – AI Mood Music Player One-Click Launch
rem ====================================================

echo ====================================================
echo   Starting AuraBeat Mood Music Player...
echo ====================================================

cd /d "%~dp0"

rem Check .env
if not exist .env (
  if exist .env.example (
    echo Creating .env from template...
    copy .env.example .env >nul
  )
)

rem Launch backend server in separate window
echo Starting Backend API (Port 4000)...
start "AuraBeat Backend" cmd /k "cd /d "%~dp0" && npm run dev:server"

rem Launch frontend Vite dev server in separate window
echo Starting Frontend Client (Port 5173)...
start "AuraBeat Frontend" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ====================================================
echo   AuraBeat is running!
echo   Front-end UI: http://localhost:5173
echo   Back-end API: http://localhost:4000
echo ====================================================
echo.

timeout /t 3 >nul
start http://localhost:5173

pause
