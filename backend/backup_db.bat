@echo off
echo ===================================================
echo Iniciando Backup de la Base de Datos UAG...
echo ===================================================

:: =====================================================
:: 1. CONFIGURACIÓN DE RUTAS (Modifica la carpeta destino)
:: =====================================================
:: Ruta original de tu base de datos (No cambiar)
set SOURCE_DB=f:\APP-SEGUIMIENTO CONTRACTUAL\UAG---CONTROL-main\backend\db.sqlite3

:: CAMBIA ESTA RUTA por la ruta real donde está tu Google Drive en el computador del CTO
:: Ejemplo: "G:\Mi unidad\Backups_UAG" o "C:\Users\NombreUsuario\Google Drive\Backups_UAG"
set DESTINATION_FOLDER=G:\Mi unidad\Backups_UAG


:: =====================================================
:: 2. CREACIÓN DEL BACKUP
:: =====================================================
:: Obtener fecha y hora exacta usando PowerShell para evitar errores de formato (YYYYMMDD_HHMMSS)
for /f "delims=" %%a in ('powershell -Command "Get-Date -format 'yyyy-MM-dd_HH-mm-ss'"') do set TIMESTAMP=%%a

:: Definir el nombre final del archivo
set BACKUP_FILENAME=db_backup_%TIMESTAMP%.sqlite3

:: Crear la carpeta de destino en Google Drive si no existe
if not exist "%DESTINATION_FOLDER%" (
    echo Creando carpeta de destino: %DESTINATION_FOLDER%
    mkdir "%DESTINATION_FOLDER%"
)

:: Copiar el archivo
echo Copiando %SOURCE_DB% a %DESTINATION_FOLDER%\%BACKUP_FILENAME%...
copy "%SOURCE_DB%" "%DESTINATION_FOLDER%\%BACKUP_FILENAME%" /Y

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [EXITO] Backup completado correctamente.
) else (
    echo.
    echo [ERROR] Hubo un problema al copiar el archivo.
)

:: =====================================================
:: 3. LIMPIEZA AUTOMÁTICA (Opcional)
:: =====================================================
:: Borra automáticamente los backups que tengan más de 30 días para no llenar la capacidad de Google Drive
echo.
echo Limpiando backups antiguos (mas de 30 dias)...
forfiles /P "%DESTINATION_FOLDER%" /M *.sqlite3 /D -30 /C "cmd /c del @path" 2>nul

echo ===================================================
echo Proceso finalizado.
echo ===================================================
timeout /t 5
