@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo يلزم تثبيت Node.js أولاً، ثم تشغيل هذا الملف من جديد.
  echo https://nodejs.org/
  pause
  exit /b 1
)
echo افتح الموقع على http://localhost:8000
node start-server.mjs
pause
