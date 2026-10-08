@echo off
chcp 65001 >nul
echo ====================================================
echo  E-Book Store - Push Changes to GitHub
echo ====================================================
echo.
cd /d "%~dp0"

echo [1/3] Adding files...
.tools\git\cmd\git.exe add .

echo [2/3] Committing changes...
.tools\git\cmd\git.exe commit -m "update: fix register profile error and sql schema"

echo [3/3] Pushing to GitHub (origin main)...
.tools\git\cmd\git.exe push origin main

echo.
echo ====================================================
echo  DONE! Vercel will automatically redeploy the new code.
echo ====================================================
pause
