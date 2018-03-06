@echo off
cd %~dp0

xcopy /D /Y /I /E src docs

@echo on
