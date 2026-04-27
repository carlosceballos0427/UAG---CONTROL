@echo off
start cmd /k "F: && cd F:\APP-SEGUIMIENTO CONTRACTUAL\UAG---CONTROL-main\backend && venv\Scripts\activate.bat && python manage.py runserver 0.0.0.0:8000"
start cmd /k "F: && cd F:\APP-SEGUIMIENTO CONTRACTUAL\UAG---CONTROL-main && npm run dev -- --host"
timeout /t 5
start http://localhost:5173
