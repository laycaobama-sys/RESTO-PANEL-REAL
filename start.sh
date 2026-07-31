#!/bin/bash
cd /home/z/my-project
while true; do
  lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null
  sleep 1
  node .next/standalone/server.js > /home/z/my-project/dev.log 2>&1
  sleep 2
done
