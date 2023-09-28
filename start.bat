@echo off
echo Installing dependencies...
call npm install
echo Installed dependencies.
echo Running "start" function...
node -e "require('./functions/generalFunctions').%1start();"
echo The program has finished.
pause
