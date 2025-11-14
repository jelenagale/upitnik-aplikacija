# Upitnik Aplikacija

Aplikacija za kreiranje i rješavanje upitnika sa mogućnošću exporta rezultata u Excel format.

## Funkcionalnosti

- ✅ Registracija i login korisnika
- ✅ Kreiranje upitnika sa različitim tipovima pitanja
- ✅ Dijeljenje upitnika putem linka
- ✅ Rješavanje upitnika online (bez potrebe za login)
- ✅ Prikupljanje i prikaz rezultata (samo vlasnik upitnika)
- ✅ Export rezultata u Excel format (samo vlasnik upitnika)

## Tipovi pitanja

- **Tekst** - kratak odgovor
- **Tekst (dugi)** - dugi odgovor
- **Višestruki izbor (jedan)** - radio button
- **Višestruki izbor (više)** - checkbox

## Instalacija

1. Instalirajte Node.js (verzija 14 ili novija)

2. Instalirajte dependencies:
```bash
npm install
```

## Pokretanje

```bash
npm start
```

Za development sa automatskim restartom:
```bash
npm run dev
```

Aplikacija će biti dostupna na:
- **Lokalno:** `http://localhost:3000`
- **Mrežno:** `http://[VAŠA-IP-ADRESA]:3000`

Server automatski detektira vašu IP adresu i prikazuje je pri pokretanju.

### Pristup s drugih računala

Aplikacija je konfigurirana da prima zahtjeve s bilo koje IP adrese. Da bi drugi korisnici mogli pristupiti:

1. **Pronađite vašu IP adresu:**
   - Server će automatski prikazati mrežnu IP adresu pri pokretanju
   - Ili koristite: `ip addr show` (Linux) ili `ipconfig` (Windows)

2. **Osigurajte da je firewall dozvoljava konekcije:**
   ```bash
   # Ubuntu/Debian
   sudo ufw allow 3000/tcp
   
   # CentOS/RHEL
   sudo firewall-cmd --add-port=3000/tcp --permanent
   sudo firewall-cmd --reload
   ```

3. **Podijelite link:**
   - Korisnici mogu pristupiti preko: `http://[VAŠA-IP]:3000`
   - Linkovi za upitnike će automatski koristiti pravu adresu

### Environment varijable

Možete prilagoditi port i host:
```bash
PORT=8080 HOST=0.0.0.0 npm start
```

## Korištenje

1. **Registracija i Login:**
   - Prvo se registrirajte ili prijavite na aplikaciju
   - Možete kreirati novi račun ili se prijaviti sa postojećim

2. **Kreiranje upitnika:**
   - Nakon login-a, kliknite na "Kreiraj Novi Upitnik"
   - Unesite naslov i opis upitnika
   - Dodajte pitanja (kliknite na "Dodaj Pitanje")
   - Odaberite tip pitanja
   - Za radio/checkbox pitanja, unesite opcije (jedna po liniji)
   - Kliknite "Kreiraj Upitnik"

3. **Dijeljenje upitnika:**
   - Nakon kreiranja, dobit ćete link
   - Kopirajte link i pošaljite ga osobama koje će rješavati upitnik
   - **Napomena:** Upitnike mogu rješavati svi koji imaju link (bez potrebe za login)

4. **Pregled rezultata:**
   - Rezultate može vidjeti samo osoba koja je kreirala upitnik
   - Kliknite na "Rezultati" u dashboard-u ili otvorite `/rezultati/{id-upitnika}`
   - Kliknite na "Exportuj u Excel" za preuzimanje rezultata u Excel formatu

## Struktura projekta

```
upitnik-aplikacija/
├── server.js          # Backend server
├── package.json       # Dependencies
├── upitnici.db        # SQLite baza podataka (kreira se automatski)
└── public/
    ├── index.html     # Stranica za kreiranje upitnika
    ├── upitnik.html   # Stranica za rješavanje upitnika
    ├── rezultati.html # Stranica za pregled rezultata
    ├── style.css      # Stilovi
    └── app.js         # JavaScript za kreiranje upitnika
```

## Tehnologije

- **Backend:** Node.js, Express
- **Baza podataka:** SQLite
- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Excel export:** xlsx library

## API Endpoints

### Autentifikacija
- `POST /api/register` - Registracija novog korisnika
- `POST /api/login` - Login korisnika
- `POST /api/logout` - Logout korisnika
- `GET /api/me` - Provjera trenutnog korisnika

### Upitnici
- `POST /api/upitnici` - Kreiranje novog upitnika (zahtijeva autentifikaciju)
- `GET /api/upitnici` - Lista upitnika trenutnog korisnika (zahtijeva autentifikaciju)
- `GET /api/upitnici/:id` - Dohvaćanje upitnika (javno dostupno)
- `POST /api/upitnici/:id/odgovori` - Slanje odgovora (javno dostupno)
- `GET /api/upitnici/:id/rezultati` - Dohvaćanje rezultata (samo vlasnik)
- `GET /api/upitnici/:id/export` - Export rezultata u Excel (samo vlasnik)

## 🌐 Deployment

Aplikacija može biti deploy-ana na bilo koju platformu koja podržava Node.js:

- **Render.com** - Besplatno za početnike, konfigurisan kroz `render.yaml`
- **Railway.app** - Besplatno sa ograničenjima, konfigurisan kroz `railway.json` i `nixpacks.toml`
- **Heroku** - Konfigurisan kroz `Procfile`
- **Bilo koja VPS** - Direktno pokretanje sa `npm start`

### Deployment konfiguracije:

- `render.yaml` - Konfiguracija za Render.com
- `railway.json` - Konfiguracija za Railway.app
- `nixpacks.toml` - Build konfiguracija za Railway (Nixpacks)
- `Procfile` - Konfiguracija za Heroku i platforme koje koriste Procfile

### Environment varijable za produkciju:

```bash
NODE_ENV=production
PORT=10000
SESSION_SECRET=your-secret-key-here
```

**Napomena:** Obavezno postavite `SESSION_SECRET` na siguran nasumični string u produkciji!

## Napomene

- Baza podataka se kreira automatski pri prvom pokretanju
- Upitnici se mogu rješavati bez login-a (javno dostupni preko linka)
- Rezultate može vidjeti samo vlasnik upitnika
- Rezultati se grupiraju po sesijama (svako ispunjavanje = jedna sesija)
- Export u Excel je dostupan samo vlasniku upitnika

