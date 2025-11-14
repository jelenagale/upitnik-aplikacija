# 🚀 Brzi Start - Javni Pristup (5 minuta)

## Opcija 1: ngrok (Preporučeno) ⭐

### Korak 1: Instalirajte ngrok
```bash
# Linux
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

### Korak 2: Registrirajte se
1. Idite na https://ngrok.com
2. Kreirajte besplatni account
3. Dobijte authtoken sa dashboarda
4. Pokrenite:
```bash
ngrok config add-authtoken YOUR_TOKEN
```

### Korak 3: Pokrenite aplikaciju
```bash
cd /home/jelena/upitnik-aplikacija
./start-public.sh
```

Ili ručno:
```bash
# Terminal 1
npm start

# Terminal 2
ngrok http 3000
```

### Korak 4: Koristite javni URL
ngrok će prikazati URL poput: `https://abc123.ngrok-free.app`
**Taj URL možete podijeliti s bilo kim, s bilo koje mreže!**

---

## Opcija 2: LocalTunnel (Bez registracije) 🔄

```bash
# Instalirajte
npm install -g localtunnel

# Terminal 1 - Pokrenite server
npm start

# Terminal 2 - Pokrenite tunnel
lt --port 3000
```

LocalTunnel će dati javni URL koji možete koristiti!

---

## Opcija 3: Cloud Deployment (Trajno) ☁️

Za trajno rješenje, deployajte na:
- **Railway.app** - https://railway.app (najlakše, automatski)
- **Render.com** - https://render.com (besplatno)
- **Heroku** - https://heroku.com

Detaljne upute u [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## ⚠️ Važno

- Javni URL znači da **bilo tko** može pristupiti aplikaciji
- ngrok besplatni plan ima ograničenja (ali dovoljno za testiranje)
- Za produkciju, razmotrite cloud deployment

---

## 🆘 Problemi?

1. **ngrok ne radi?** Provjerite authtoken
2. **Server ne pokreće?** Provjerite da li port 3000 nije zauzet
3. **URL ne radi?** Provjerite da li je server pokrenut

