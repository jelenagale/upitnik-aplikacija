#!/bin/bash

echo "=========================================="
echo "🌐 Postavljanje Javnog Pristupa (ngrok)"
echo "=========================================="
echo ""

# Provjeri da li je ngrok instaliran
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok nije instaliran"
    echo ""
    echo "📥 Instalacija ngrok:"
    echo ""
    echo "1. Preuzmite ngrok sa: https://ngrok.com/download"
    echo "2. Ili koristite:"
    echo "   curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null"
    echo "   echo 'deb https://ngrok-agent.s3.amazonaws.com buster main' | sudo tee /etc/apt/sources.list.d/ngrok.list"
    echo "   sudo apt update && sudo apt install ngrok"
    echo ""
    echo "3. Nakon instalacije, registrirajte se na https://ngrok.com i dobijte authtoken"
    echo "4. Pokrenite: ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    exit 1
fi

echo "✅ ngrok je instaliran"
echo ""

# Provjeri da li server radi
if ! netstat -tlnp 2>/dev/null | grep -q ":3000" && ! ss -tlnp 2>/dev/null | grep -q ":3000"; then
    echo "⚠️  Server ne radi na portu 3000"
    echo "Pokrećem server u pozadini..."
    cd "$(dirname "$0")"
    npm start > /dev/null 2>&1 &
    SERVER_PID=$!
    sleep 3
    echo "✅ Server pokrenut (PID: $SERVER_PID)"
    echo ""
fi

echo "🚀 Pokretanje ngrok tunela..."
echo ""
echo "Vaša aplikacija će biti dostupna na javnoj URL adresi"
echo "koju će ngrok generirati."
echo ""
echo "Pritisnite Ctrl+C za zaustavljanje"
echo ""

# Pokreni ngrok
ngrok http 3000

