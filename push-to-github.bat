@echo off
setlocal
echo ========================================================
echo   Royal Spice Restaurant - Push to GitHub
echo ========================================================
echo.

set "GIT_CMD=git"
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    if exist "%~dp0git-bin\cmd\git.exe" (
        set "GIT_CMD=%~dp0git-bin\cmd\git.exe"
    ) else (
        echo [ERROR] Git was not found!
        pause
        exit /b 1
    )
)

echo [1/5] Initializing Git repository...
if not exist "%~dp0.git" (
    "%GIT_CMD%" init
) else (
    echo Git repository already initialized.
)

echo.
echo [2/5] Setting default branch to main...
"%GIT_CMD%" branch -M main

echo.
echo [3/5] Configuring remote origin...
"%GIT_CMD%" remote remove origin >nul 2>&1
"%GIT_CMD%" remote add origin https://github.com/jayeshrajapati332-c/restaurant-management-wad.git

echo.
echo [4/5] Staging and committing files...
"%GIT_CMD%" config user.name "jayeshrajapati332-c"
"%GIT_CMD%" config user.email "jayeshrajapati332-c@users.noreply.github.com"
"%GIT_CMD%" add .
"%GIT_CMD%" commit -m "Complete restaurant website with food ordering, reservations, and admin dashboard"

echo.
echo [5/5] Pushing to GitHub (origin main)...
echo.
echo If a GitHub authentication popup appears, please log in / authorize.
echo.
"%GIT_CMD%" push -u origin main --force

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo [SUCCESS] Code successfully pushed to GitHub!
    echo Repo: https://github.com/jayeshrajapati332-c/restaurant-management-wad
    echo ========================================================
) else (
    echo.
    echo [NOTE] If authentication failed or was cancelled, make sure you sign in to GitHub in the popup.
)

echo.
pause
