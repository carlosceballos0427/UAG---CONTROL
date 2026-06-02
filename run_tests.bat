@echo off
echo ==============================================
echo Ejecutando Pruebas (Tests) del Backend
echo ==============================================

cd backend
call venv\Scripts\activate.bat
python manage.py test api

echo.
echo ==============================================
pause
