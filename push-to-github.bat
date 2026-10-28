@echo off
chcp 65001 >nul
echo ====================================================
echo  SafeGrocer - Push ke GitHub Repository
echo  Repo: https://github.com/prasadautomo/Smart-Grocery-Price-Tracker.git
echo ====================================================
echo.
"C:\Program Files\Git\cmd\git.exe" push origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo [BERHASIL] Seluruh commit berhasil di-push ke GitHub main!
) else (
    echo [PERHATIAN] Git memerlukan otorisasi akun GitHub milikmu.
    echo Jendela browser akan terbuka atau masukkan Personal Access Token (PAT).
)
echo.
pause
