#!/bin/bash
# Watchdog: restarts the server if it dies
cd /home/z/my-project
while true; do
  if ! curl -s -o /dev/null --connect-timeout 2 http://localhost:3000/ 2>/dev/null; then
    echo "[$(date)] Server down, restarting..." >> watchdog.log
    pkill -f "server.js" 2>/dev/null
    sleep 1
    node .next/standalone/server.js > dev.log 2>&1 &
    SERVER_PID=$!
    echo "[$(date)] Started PID $SERVER_PID" >> watchdog.log
    sleep 3
  fi
  sleep 5
done
