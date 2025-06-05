#!/bin/bash
cd /home/kavia/workspace/code-generation/noteease-18412-3f4bd2b7/noteease_main
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

