#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Torres Vistoria — Setup local"
cp -n .env.example .env.local 2>/dev/null || true
npm install
echo "✅ Pronto. Configure .env.local e rode: npm run dev"
