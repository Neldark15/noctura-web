#!/bin/bash
# Compila LUNARIA (Vite, single-file) y sincroniza el build a la web publicada.
# Uso: bash lunaria-src/deploy.sh   (luego git add lunaria/index.html && git push)
set -e
cd "$(dirname "$0")"
npm run build
cp dist/index.html ../lunaria/index.html
echo "OK: LUNARIA sincronizado -> noctura-web/lunaria/index.html"
