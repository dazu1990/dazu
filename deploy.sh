#!/bin/bash

git pull
rm -rf node_modules package-lock.json yarn.lock
npm install
npm run build
