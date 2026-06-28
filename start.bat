@echo off
echo ===================================================
echo         Starting Zomato Clone Project
echo ===================================================

echo.
echo [1/3] Starting Databases (MongoDB ^& Redis) via Docker...
docker-compose up -d
timeout /t 3 /nobreak > NUL

echo.
echo [2/3] Starting Backend API Server...
echo Opening a new window for the Backend...
start "Zomato Backend (Port 5000)" cmd /k "cd server && npm run dev"

echo.
echo [3/3] Starting Frontend React/Next.js Client...
echo Opening a new window for the Frontend...
start "Zomato Frontend (Port 3000)" cmd /k "cd client && npm run dev"

echo.
echo ===================================================
echo ALL SERVICES ARE BOOTING UP!
echo.
echo - Your Website will open at:  http://localhost:3000
echo - Your API is running at:     http://localhost:5000
echo ===================================================
echo.
echo (You can close this specific window now, but keep the new black terminal windows open while you are testing the app!)
pause
