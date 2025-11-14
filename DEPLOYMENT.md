# 🌐 Deployment - Javni Pristup Aplikaciji

Ako želite da aplikacija bude dostupna s bilo koje mreže (interneta), imate nekoliko opcija:

## Opcija 1: ngrok (Najbrže - 5 minuta) ⚡

ngrok kreira javni URL koji tunelira do vašeg lokalnog servera.

### Korak 1: Instalirajte ngrok

**Linux:**
```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

**Ili preuzmite sa:** https://ngrok.com/download

### Korak 2: Registrirajte se i dobijte authtoken

1. Idite na https://ngrok.com i kreirajte besplatni account
2. Dobijte authtoken sa dashboarda
3. Pokrenite:
```bash
ngrok config add-authtoken YOUR_TOKEN
```

### Korak 3: Pokrenite aplikaciju

**Terminal 1 - Server:**
```bash
cd /home/jelena/upitnik-aplikacija
npm start
```

**Terminal 2 - ngrok:**
```bash
cd /home/jelena/upitnik-aplikacija
ngrok http 3000
```

Ili koristite skriptu:
```bash
./ngrok-setup.sh
```

### Korak 4: Koristite javni URL

ngrok će prikazati javni URL (npr. `https://abc123.ngrok.io`). 
**Taj URL možete podijeliti s bilo kim, s bilo koje mreže!**

---

## Opcija 2: Cloud Deployment (Trajno rješenje) ☁️

### A) Render.com (Besplatno)

1. **Kreirajte account na** https://render.com

2. **Kreirajte novi Web Service:**
   - Connect GitHub repo (ili upload direktno)
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node`

3. **Dodajte Environment Variables:**
   - `NODE_ENV=production`
   - `PORT=10000` (Render automatski postavlja PORT)

4. **Deploy!** Render će automatski kreirati javni URL.

### B) Railway.app (Besplatno)

1. **Kreirajte account na** https://railway.app

2. **New Project → Deploy from GitHub**

3. **Railway automatski detektira Node.js i pokreće aplikaciju**

4. **Dobijete javni URL automatski!**

### C) Heroku (Besplatno tier ukinut, ali još uvijek radi)

1. **Instalirajte Heroku CLI:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

2. **Login:**
```bash
heroku login
```

3. **Kreirajte app:**
```bash
cd /home/jelena/upitnik-aplikacija
heroku create upitnik-app
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

4. **Otvorena aplikacija:**
```bash
heroku open
```

### D) Vercel / Netlify (Za statičke fajlove + serverless)

Zahtijeva refaktoriranje u serverless funkcije. Nije preporučeno za ovu aplikaciju.

---

## Opcija 3: VPS Server (Najviše kontrole) 🖥️

Ako imate VPS server (DigitalOcean, Linode, AWS EC2, itd.):

1. **Upload fajlova na server:**
```bash
scp -r /home/jelena/upitnik-aplikacija user@your-server:/home/user/
```

2. **Na serveru:**
```bash
ssh user@your-server
cd /home/user/upitnik-aplikacija
npm install
npm start
```

3. **Koristite PM2 za trajno pokretanje:**
```bash
npm install -g pm2
pm2 start server.js --name upitnik
pm2 save
pm2 startup
```

4. **Konfigurirajte Nginx kao reverse proxy:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Opcija 4: LocalTunnel (Alternativa ngrok) 🔄

```bash
npm install -g localtunnel
npm start  # U jednom terminalu
lt --port 3000  # U drugom terminalu
```

---

## Preporuka

- **Za brzo testiranje:** ngrok (5 minuta)
- **Za trajnu produkciju:** Railway.app ili Render.com (besplatno, automatski deployment)
- **Za maksimalnu kontrolu:** VPS sa PM2

---

## Napomene

⚠️ **Sigurnost:**
- Javni pristup znači da bilo tko može pristupiti aplikaciji
- Za produkciju, razmotrite dodavanje autentifikacije
- Koristite HTTPS (ngrok automatski koristi HTTPS)

💾 **Baza podataka:**
- SQLite radi dobro za manje aplikacije
- Za veće aplikacije, razmotrite PostgreSQL ili MySQL

🔒 **Environment Variables:**
- Nikad ne commitajte `.env` fajlove
- Koristite environment variables za osjetljive podatke

