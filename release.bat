@echo off
cd %~dp0

del docs /Q
xcopy /D /Y /I /E src docs

@echo on
