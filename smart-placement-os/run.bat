@echo off
SETLOCAL EnableDelayedExpansion

echo ===================================================
echo   PRECISION AI - ZERO MANUAL SETUP INITIALIZER
echo ===================================================

:: 1. Check for winget
echo [1/8] Checking for winget...
winget --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] winget not found. Please install it or FFmpeg/Ollama manually.
    pause
    exit /b
)

:: 2. Install FFmpeg
echo [2/8] Ensuring FFmpeg is installed...
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing FFmpeg via winget...
    winget install -e --id Gyan.FFmpeg --accept-source-agreements --accept-package-agreements
) else (
    echo FFmpeg is already installed.
)

:: 3. Check for Ollama with Absolute Paths
echo [3/8] Ensuring Ollama is installed...
SET "OLLAMA_BIN=ollama"
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    IF EXIST "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" (
        SET "OLLAMA_BIN=%LOCALAPPDATA%\Programs\Ollama\ollama.exe"
        echo Found Ollama at !OLLAMA_BIN!
    ) ELSE (
        echo Installing Ollama via winget...
        winget install -e --id Ollama.Ollama --accept-source-agreements --accept-package-agreements
        echo [IMPORTANT] Restarting script to update PATH...
        timeout /t 5
        goto :EOF
    )
)

:: 4. Start Ollama and Pull Model
echo [4/8] Pulling phi3 model...
tasklist /fi "imagename eq ollama.exe" | findstr /i "ollama.exe" >nul
if %errorlevel% neq 0 (
    echo Starting Ollama service...
    start "" "!OLLAMA_BIN!" serve
    timeout /t 10
)
"!OLLAMA_BIN!" pull phi3

:: 5. Setup Python Environment
echo [5/8] Setting up Python virtual environment...
if not exist "interview_backend\venv" (
    echo Creating venv...
    python -m venv interview_backend\venv
)
call interview_backend\venv\Scripts\activate.bat

:: 6. Install Dependencies
echo [6/8] Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r interview_backend\requirements.txt

:: 7. Start Services
echo [7/8] Starting Backend and Frontend...

:: Start Backend in a new window
echo Starting FastAPI Backend...
start "AI Interview Backend" cmd /k "call interview_backend\venv\Scripts\activate.bat && cd interview_backend && python main.py"

:: Start Frontend
echo Starting Next.js Frontend...
echo Waiting for services to initialize...
timeout /t 5
start http://localhost:3000/dashboard/student/interview

npm run dev
pause
