@echo off
echo Installing All Snax dependencies...
echo.

cd server
echo Installing server dependencies...
call npm install

echo.
echo Installation complete!
echo.
echo To start the server:
echo   cd server
echo   npm start
echo.
echo Then open http://localhost:3000 in your browser
echo.
pause