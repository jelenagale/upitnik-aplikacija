#!/bin/bash

echo "=========================================="
echo "🌐 Pokretanje Aplikacije sa Javnim Pristupom"
echo "=========================================="
echo ""

# Provjeri da li je ngrok instaliran
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok nije instaliran"
    echo ""
    echo "📥 Instalirajte ngrok:"
    echo "   1. Idite na: https://ngrok.com/download"
    echo "   2. Registrirajte se i dobijte authtoken"
    echo "   3. Pokrenite: ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    echo "Ili koristite alternativu - LocalTunnel:"
    echo "   npm install -g localtunnel"
    echo "   npm start & lt --port 3000"
    echo ""
    exit 1
fi

# Provjeri da li server već radi
if netstat -tlnp 2>/dev/null | grep -q ":3000" || ss -tlnp 2>/dev/null | grep -q ":3000"; then
    echo "⚠️  Server već radi na portu 3000"
    read -p "Želite li ga zaustaviti i pokrenuti ponovo? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:3000 | xargs kill -9 2>/dev/null
        sleep 2
    else
        echo "Koristim postojeći server..."
    fi
fi

# Pokreni server u pozadini ako ne radi
if ! netstat -tlnp 2>/dev/null | grep -q ":3000" && ! ss -tlnp 2>/dev/null | grep -q ":3000"; then
    echo "🚀 Pokretanje servera..."
    cd "$(dirname "$0")"
    npm start > server.log 2>&1 &
    SERVER_PID=$!
    sleep 3
    
    if kill -0 $SERVER_PID 2>/dev/null; then
        echo "✅ Server pokrenut (PID: $SERVER_PID)"
        echo "   Logovi: server.log"
    else
        echo "❌ Greška pri pokretanju servera"
        cat server.log
        exit 1
    fi
fi

echo ""
echo "🌐 Pokretanje ngrok tunela..."
echo ""
echo "=========================================="
echo "📋 Važno:"
echo "=========================================="
echo "1. ngrok će generirati javni URL (npr. https://abc123.ngrok.io)"
echo "2. Taj URL možete podijeliti s bilo kim, s bilo koje mreže!"
echo "3. Pritisnite Ctrl+C za zaustavljanje"
echo ""
echo "=========================================="
echo ""

# Pokreni ngrok
ngrok http 3000

# Cleanup kada se ngrok zaustavi
echo ""
echo "Zaustavljanje servera..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
echo "✅ Gotovo"

