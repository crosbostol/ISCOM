@echo off
echo Starting ISCOM Development Environment...

:: Start API in a new window
start "ISCOM API" /D "apps\api" cmd /k "title ISCOM API & npm run dev"

:: Start Client in a new window
start "ISCOM Client" /D "apps\client-v2" cmd /k "title ISCOM Client & npm run dev"

echo Development servers starting in separate windows.
