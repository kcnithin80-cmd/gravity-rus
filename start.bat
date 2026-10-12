@echo off
title Gravity Rush Launcher
echo Starting Gravity Rush local server...
start "" http://localhost:8080
"C:\Users\USER\AppData\Roaming\Antigravity\bin\agy-node.cmd" server.js
pause
