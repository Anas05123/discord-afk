@echo off
title Discord Activity Studio
cd /d "%~dp0"

if exist ".venv\Scripts\python.exe" (
    start "" ".venv\Scripts\pythonw.exe" main.py
) else (
    py -3.12 main.py
)
