#!/bin/bash

echo "=========================================="
echo "📤 Git Push sa Personal Access Token"
echo "=========================================="
echo ""

echo "1. Idite na: https://github.com/settings/tokens"
echo "2. Kliknite 'Generate new token (classic)'"
echo "3. Odaberite scope: 'repo'"
echo "4. Kopirajte token"
echo ""
read -p "Unesite vaš Personal Access Token: " TOKEN

if [ -z "$TOKEN" ]; then
    echo "❌ Token nije unesen"
    exit 1
fi

cd "$(dirname "$0")"

# Postavi remote sa tokenom
git remote set-url origin https://${TOKEN}@github.com/jelenagale/upitnik-aplikacija.git

echo ""
echo "🚀 Pushanje na GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Uspješno pushano na GitHub!"
    echo "📱 Provjerite: https://github.com/jelenagale/upitnik-aplikacija"
    
    # Ukloni token iz remote URL-a (sigurnost)
    git remote set-url origin https://github.com/jelenagale/upitnik-aplikacija.git
    echo "🔒 Token uklonjen iz konfiguracije (sigurnost)"
else
    echo ""
    echo "❌ Greška pri push-u"
    echo "Provjerite da li je token ispravan i da ima 'repo' scope"
fi

