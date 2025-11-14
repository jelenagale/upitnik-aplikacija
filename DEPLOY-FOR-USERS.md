# 👥 Deployment za Druge Korisnike

Ako želite da **drugi ljudi** koriste vašu aplikaciju, morate je deployati na **javnu cloud platformu**.

## 🎯 Kako Drugi Korisnici Koriste Aplikaciju

### Trenutno stanje:
- ✅ Aplikacija je na GitHubu
- ❌ Aplikacija još nije javno dostupna
- ❌ Drugi korisnici ne mogu pristupiti

### Nakon deploymenta:
- ✅ Aplikacija će imati javni URL (npr. `upitnik-app.railway.app`)
- ✅ Bilo tko može pristupiti preko tog URL-a
- ✅ Možete podijeliti link s bilo kim

---

## 🚀 Opcija 1: Railway.app (NAJLAKŠE - Preporučeno)

### Korak 1: Prijavite se na Railway

1. **Idite na:** https://railway.app
2. **Kliknite "Login"**
3. **Odaberite "Login with GitHub"**
4. **Autorizirajte Railway** da pristupa vašim repozitorijima

### Korak 2: Kreirajte Novi Projekt

1. **Kliknite "New Project"**
2. **Odaberite "Deploy from GitHub repo"**
3. **Odaberite repozitorij:** `jelenagale/upitnik-aplikacija`
4. **Railway automatski:**
   - Detektira Node.js
   - Instalira dependencies
   - Pokreće aplikaciju
   - Generira javni URL

### Korak 3: Dobijte Javni URL

- Nakon deploymenta (2-5 minuta), Railway će generirati URL
- URL će biti nešto poput: `upitnik-aplikacija-production.up.railway.app`
- **Ovaj URL možete podijeliti s bilo kim!**

### Korak 4: Podijelite Link

**Primjer:**
```
Moja aplikacija za upitnike:
https://upitnik-aplikacija-production.up.railway.app
```

Svi koji otvore ovaj link mogu:
- ✅ Kreirati upitnike
- ✅ Rješavati upitnike
- ✅ Pregledati rezultate

---

## 🚀 Opcija 2: Render.com (Alternativa)

### Korak 1: Prijavite se

1. **Idite na:** https://render.com
2. **"Get Started"** → Login sa GitHub

### Korak 2: Kreirajte Web Service

1. **"New +" → "Web Service"**
2. **Connect GitHub repo:** `jelenagale/upitnik-aplikacija`
3. **Konfiguracija:**
   - Name: `upitnik-aplikacija`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**
4. **Kliknite "Create Web Service"**

### Korak 3: Čekajte Deployment

- Prvi deployment: 5-10 minuta
- URL: `upitnik-aplikacija.onrender.com`

⚠️ **Napomena:** Besplatni tier "spava" nakon 15 minuta neaktivnosti.

---

## 📱 Kako Drugi Korisnici Koriste Aplikaciju

### Scenario 1: Vi kreirate upitnik, drugi ga rješavaju

1. **Vi:**
   - Otvorite: `https://vasa-aplikacija.railway.app`
   - Kreirate upitnik
   - Kopirate link (npr. `https://vasa-aplikacija.railway.app/upitnik/abc123`)

2. **Drugi korisnici:**
   - Otvore link koji ste im poslali
   - Rješavaju upitnik
   - Odgovori se automatski spremaju

3. **Vi:**
   - Pregledate rezultate: `https://vasa-aplikacija.railway.app/rezultati/abc123`
   - Exportujete u Excel

### Scenario 2: Drugi korisnici kreiraju svoje upitnike

- Otvore: `https://vasa-aplikacija.railway.app`
- Kreiraju svoje upitnike
- Dijele linkove s drugima

---

## 🔗 Custom Domain (Opcionalno)

Ako želite ljepši URL (npr. `upitnici.vasa-domena.com`):

### Railway:
1. Settings → Generate Domain
2. Ili dodajte custom domain u Settings

### Render:
1. Settings → Custom Domain
2. Dodajte DNS zapise

---

## 💰 Troškovi

### Besplatno:
- ✅ Railway: Besplatan tier (ograničen resursi)
- ✅ Render: Besplatan tier (spava nakon 15 min)

### Paid (preporučeno za produkciju):
- Railway: $5/mjesec
- Render: $7/mjesec
- **Prednosti:** Ne spava, više resursa, brže

---

## 🔒 Sigurnost

### Trenutno:
- ⚠️ Aplikacija je javno dostupna
- ⚠️ Bilo tko može kreirati upitnike
- ⚠️ Nema autentifikacije

### Za produkciju (opcionalno):
- Dodajte login sistem
- Ograničite tko može kreirati upitnike
- Zaštitite rezultate lozinkom

---

## 📋 Checklist

- [ ] Deploy na Railway ili Render
- [ ] Testirajte javni URL
- [ ] Kreirajte test upitnik
- [ ] Podijelite link s prijateljem (test)
- [ ] Provjerite da li drugi korisnik može pristupiti
- [ ] Provjerite da li rezultati rade

---

## 🆘 Problemi?

### Problem: "Application not found"
**Rješenje:** Provjerite da li je deployment završen (može potrajati 5-10 min)

### Problem: "Application sleeping" (Render)
**Rješenje:** Prvi zahtjev nakon spavanja može potrajati 30-60 sekundi

### Problem: Drugi korisnici ne mogu pristupiti
**Rješenje:** 
- Provjerite da li koriste pravi URL
- Provjerite da li je aplikacija deployana
- Provjerite logove na platformi

---

## ✅ Nakon Deploymenta

**Primjer poruke za korisnike:**

```
Pozdrav!

Kreirao sam aplikaciju za upitnike. Možete je koristiti na:

https://upitnik-aplikacija-production.up.railway.app

Možete:
- Kreirati svoje upitnike
- Dijeliti linkove s drugima
- Pregledati rezultate

Uživajte!
```

---

**Sretno s deploymentom! 🎉**

