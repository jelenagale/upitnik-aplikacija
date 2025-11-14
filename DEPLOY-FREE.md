# 🆓 Besplatni Deployment - Korak po Korak

Ovaj vodič će vas provesti kroz deployment na **besplatne** cloud platforme.

## 🎯 Opcija 1: Railway.app (NAJLAKŠE - Preporučeno) ⭐

Railway je najlakša opcija - automatski detektira Node.js i pokreće aplikaciju.

### Korak 1: Priprema GitHub repozitorija

```bash
cd /home/jelena/upitnik-aplikacija

# Ako još niste inicijalizirali git
git init
git add .
git commit -m "Initial commit - Upitnik aplikacija"

# Kreirajte repo na GitHub.com i pushajte
git remote add origin https://github.com/VAS_USERNAME/upitnik-aplikacija.git
git branch -M main
git push -u origin main
```

### Korak 2: Deploy na Railway

1. **Idite na** https://railway.app
2. **Kliknite "Login"** i prijavite se sa GitHub accountom
3. **Kliknite "New Project"**
4. **Odaberite "Deploy from GitHub repo"**
5. **Odaberite vaš repozitorij** (`upitnik-aplikacija`)
6. **Railway automatski:**
   - Detektira Node.js
   - Instalira dependencies (`npm install`)
   - Pokreće aplikaciju (`npm start`)
   - Generira javni URL!

### Korak 3: Dobijte javni URL

- Railway automatski kreira javni URL (npr. `upitnik-aplikacija-production.up.railway.app`)
- Kliknite na "Settings" → "Generate Domain" za custom domenu
- **URL je javno dostupan s bilo koje mreže!**

### ✅ Gotovo!

Vaša aplikacija je sada dostupna javno i besplatno!

---

## 🎯 Opcija 2: Render.com (Alternativa)

Render također nudi besplatan tier.

### Korak 1: Priprema (isti kao Railway - GitHub repo)

### Korak 2: Deploy na Render

1. **Idite na** https://render.com
2. **Kliknite "Get Started"** i prijavite se sa GitHub
3. **Kliknite "New +" → "Web Service"**
4. **Connect GitHub repo:**
   - Odaberite vaš repozitorij
   - Render će automatski detektirati Node.js
5. **Konfiguracija:**
   - **Name:** `upitnik-aplikacija`
   - **Environment:** `Node`
   - **Build Command:** `npm install` (automatski)
   - **Start Command:** `npm start`
   - **Plan:** `Free`
6. **Environment Variables (opcionalno):**
   - `NODE_ENV=production`
   - `PORT=10000` (Render automatski postavlja)
7. **Kliknite "Create Web Service"**

### Korak 3: Čekajte deployment

- Render će automatski buildati i deployati aplikaciju
- Prvi deployment može potrajati 5-10 minuta
- Dobit ćete javni URL (npr. `upitnik-aplikacija.onrender.com`)

### ⚠️ Napomena za Render:

- Besplatni tier "spava" nakon 15 minuta neaktivnosti
- Prvi zahtjev nakon spavanja može potrajati 30-60 sekundi
- Za produkciju, razmotrite paid plan ($7/mjesec)

---

## 🎯 Opcija 3: Fly.io (Alternativa)

Fly.io također nudi besplatan tier.

### Korak 1: Instalirajte Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
```

### Korak 2: Login i Deploy

```bash
cd /home/jelena/upitnik-aplikacija
fly auth login
fly launch
```

Fly će automatski detektirati Node.js i deployati aplikaciju.

---

## 📊 Usporedba Besplatnih Platformi

| Platforma | Besplatni Tier | Spavanje | Custom Domain | Lakoća |
|-----------|----------------|----------|---------------|--------|
| **Railway** | ✅ Da | ❌ Ne | ✅ Da | ⭐⭐⭐⭐⭐ |
| **Render** | ✅ Da | ⚠️ Da (15 min) | ✅ Da | ⭐⭐⭐⭐ |
| **Fly.io** | ✅ Da | ❌ Ne | ✅ Da | ⭐⭐⭐ |

**Preporuka:** Railway.app - najlakše i najbrže!

---

## 🔧 Troubleshooting

### Problem: Build ne uspijeva

**Rješenje:**
- Provjerite da li `package.json` ima sve dependencies
- Provjerite Node.js verziju (treba >= 14)

### Problem: Aplikacija ne radi nakon deploymenta

**Rješenje:**
- Provjerite da li server sluša na `0.0.0.0` (već je postavljeno)
- Provjerite da li PORT koristi environment variable (već je postavljeno)
- Provjerite logove na platformi

### Problem: Baza podataka se resetira

**Rješenje:**
- SQLite fajl se resetira pri svakom redeployu
- Za produkciju, razmotrite PostgreSQL (Railway i Render nude besplatne PostgreSQL instance)

---

## 🚀 Nakon Deploymenta

1. **Testirajte aplikaciju:**
   - Otvorite javni URL
   - Kreirajte test upitnik
   - Podijelite link s drugim uređajima

2. **Custom Domain (opcionalno):**
   - Railway: Settings → Generate Domain
   - Render: Settings → Custom Domain
   - Dodajte DNS zapise

3. **Monitoring:**
   - Svi servisi nude logove i monitoring
   - Pratite usage na dashboardu

---

## 💡 Savjeti

- **Railway** je najbolji izbor za brzi start
- **Render** je dobar ako vam ne smeta spavanje
- Za produkciju, razmotrite paid plan ($5-7/mjesec)
- Backup baze podataka redovito (SQLite se resetira pri redeployu)

---

## 📝 Checklist za Deployment

- [ ] GitHub repozitorij kreiran
- [ ] Kod pushan na GitHub
- [ ] Account kreiran na Railway/Render
- [ ] Projekt kreiran i povezan sa GitHub repo
- [ ] Deployment uspješan
- [ ] Javni URL testiran
- [ ] Aplikacija radi s drugih uređaja

---

## 🆘 Potrebna pomoć?

Ako imate problema:
1. Provjerite logove na platformi
2. Provjerite da li su svi fajlovi commitani
3. Provjerite environment variables
4. Kontaktirajte support platforme

**Sretno s deploymentom! 🎉**

