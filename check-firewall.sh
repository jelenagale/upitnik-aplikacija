#!/bin/bash

echo "=========================================="
echo "🔍 Provjera Firewall i Mrežnih Postavki"
echo "=========================================="
echo ""

# Provjeri da li server radi
echo "1. Provjera da li server radi na portu 3000..."
if netstat -tlnp 2>/dev/null | grep -q ":3000" || ss -tlnp 2>/dev/null | grep -q ":3000"; then
    echo "   ✅ Server radi na portu 3000"
    netstat -tlnp 2>/dev/null | grep ":3000" || ss -tlnp 2>/dev/null | grep ":3000"
else
    echo "   ❌ Server NE radi na portu 3000"
    echo "   Pokrenite server sa: npm start"
    exit 1
fi

echo ""
echo "2. Provjera IP adrese..."
IP=$(hostname -I | awk '{print $1}' 2>/dev/null || ip addr show | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}' | cut -d/ -f1)
if [ -z "$IP" ]; then
    echo "   ⚠️  Nije moguće pronaći IP adresu"
else
    echo "   ✅ Vaša IP adresa: $IP"
    echo "   📱 Korisnici mogu pristupiti preko: http://$IP:3000"
fi

echo ""
echo "3. Provjera firewall-a..."

# Provjeri ufw
if command -v ufw &> /dev/null; then
    echo "   Pronađen UFW firewall"
    UFW_STATUS=$(sudo ufw status 2>/dev/null | grep -i "Status" || echo "Status: unknown")
    echo "   $UFW_STATUS"
    
    if echo "$UFW_STATUS" | grep -qi "active"; then
        if sudo ufw status | grep -q "3000/tcp"; then
            echo "   ✅ Port 3000 je dozvoljen u firewall-u"
        else
            echo "   ❌ Port 3000 NIJE dozvoljen u firewall-u"
            echo ""
            echo "   🔧 Za popravak pokrenite:"
            echo "   sudo ufw allow 3000/tcp"
            echo "   sudo ufw reload"
        fi
    else
        echo "   ℹ️  UFW je isključen"
    fi
fi

# Provjeri firewalld
if command -v firewall-cmd &> /dev/null; then
    echo "   Pronađen firewalld"
    if sudo firewall-cmd --list-ports 2>/dev/null | grep -q "3000/tcp"; then
        echo "   ✅ Port 3000 je dozvoljen u firewall-u"
    else
        echo "   ❌ Port 3000 NIJE dozvoljen u firewall-u"
        echo ""
        echo "   🔧 Za popravak pokrenite:"
        echo "   sudo firewall-cmd --add-port=3000/tcp --permanent"
        echo "   sudo firewall-cmd --reload"
    fi
fi

echo ""
echo "4. Test konekcije..."
if curl -s http://localhost:3000/api/server-info > /dev/null 2>&1; then
    echo "   ✅ Server odgovara na localhost:3000"
else
    echo "   ❌ Server NE odgovara na localhost:3000"
fi

echo ""
echo "=========================================="
echo "📋 Sažetak:"
echo "=========================================="
if [ ! -z "$IP" ]; then
    echo "Mrežna IP adresa: $IP"
    echo "URL za pristup: http://$IP:3000"
    echo ""
    echo "Za test konekcije otvorite: http://$IP:3000/test"
fi
echo ""
echo "Ako i dalje ne možete pristupiti s drugog uređaja:"
echo "1. Provjerite da su oba uređaja na istoj mreži"
echo "2. Provjerite firewall postavke (gore)"
echo "3. Provjerite da li router blokira konekcije"
echo "4. Pokušajte pristupiti preko IP adrese umjesto hostname-a"

