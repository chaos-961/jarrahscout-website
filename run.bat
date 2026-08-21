@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

set "PORT=5173"
set "URL=http://localhost:%PORT%/"
title Jarrah Scouts timeline map

rem Grab a LAN address so the same page can be opened on a real phone.
set "LANIP="
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
  for /f "tokens=1" %%b in ("%%a") do set "LANIP=%%b"
)

echo.
echo   Jarrah Scouts timeline map
echo   ---------------------------------------------
echo   root    %CD%
echo   desktop %URL%
if defined LANIP echo   phone   http://!LANIP!:%PORT%/
echo   ---------------------------------------------
echo   Ctrl+C to stop.
echo.

rem Open the browser once the server has had a moment to bind.
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Milliseconds 1200; Start-Process '%URL%'"

where py >nul 2>&1
if %errorlevel%==0 (
  py -3 -m http.server %PORT% --bind 0.0.0.0
  goto :done
)

where python >nul 2>&1
if %errorlevel%==0 (
  python -m http.server %PORT% --bind 0.0.0.0
  goto :done
)

where npx >nul 2>&1
if %errorlevel%==0 (
  npx --yes http-server . -p %PORT% -a 0.0.0.0 -c-1
  goto :done
)

echo   No Python and no Node found on PATH.
echo   Opening index.html straight from disk instead.
start "" "%CD%\index.html"

:done
endlocal
