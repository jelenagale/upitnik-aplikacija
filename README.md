# Upitnik Aplikacija

Aplikacija za kreiranje i rješavanje upitnika sa mogućnošću exporta rezultata u Excel format.

## Funkcionalnosti

- ✅ Kreiranje upitnika sa različitim tipovima pitanja
- ✅ Dijeljenje upitnika putem linka
- ✅ Rješavanje upitnika online
- ✅ Prikupljanje i prikaz rezultata
- ✅ Export rezultata u Excel format

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

1. **Kreiranje upitnika:**
   - Otvorite aplikaciju u browseru (lokalno ili preko mrežne IP adrese)
   - Unesite naslov i opis upitnika
   - Dodajte pitanja (kliknite na "Dodaj Pitanje")
   - Odaberite tip pitanja
   - Za radio/checkbox pitanja, unesite opcije (jedna po liniji)
   - Kliknite "Kreiraj Upitnik"

2. **Dijeljenje upitnika:**
   - Nakon kreiranja, dobit ćete link
   - Kopirajte link i pošaljite ga osobama koje će rješavati upitnik

3. **Pregled rezultata:**
   - Kliknite na "Pregledaj Rezultate" nakon kreiranja upitnika
   - Ili otvorite `/rezultati/{id-upitnika}`
   - Kliknite na "Exportuj u Excel" za preuzimanje rezultata

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

- `POST /api/upitnici` - Kreiranje novog upitnika
- `GET /api/upitnici` - Lista svih upitnika
- `GET /api/upitnici/:id` - Dohvaćanje upitnika
- `POST /api/upitnici/:id/odgovori` - Slanje odgovora
- `GET /api/upitnici/:id/rezultati` - Dohvaćanje rezultata
- `GET /api/upitnici/:id/export` - Export rezultata u Excel

## 🌐 Deployment za Druge Korisnike

**Želite da drugi ljudi koriste vašu aplikaciju?**

👉 **Pogledajte [DEPLOY-FOR-USERS.md](./DEPLOY-FOR-USERS.md) - detaljne upute!**

**Brzo rješenje:**
1. Deploy na **Railway.app** (besplatno, 5 minuta)
2. Dobijete javni URL (npr. `upitnik-app.railway.app`)
3. Podijelite URL s korisnicima - gotovo!

👉 **Za tehničke detalje:** [DEPLOY-FREE.md](./DEPLOY-FREE.md)

### Brzi start sa ngrok:

1. Instalirajte ngrok: https://ngrok.com/download
2. Registrirajte se i dobijte authtoken
3. Pokrenite:
   ```bash
   npm start  # Terminal 1
   ngrok http 3000  # Terminal 2
   ```
4. Koristite javni URL koji ngrok generira!

Ili koristite skriptu:
```bash
./ngrok-setup.sh
```

## Napomene

- Baza podataka se kreira automatski pri prvom pokretanju
- Svi upitnici su javno dostupni preko linka (nema autentifikacije)
- Rezultati se grupiraju po sesijama (svako ispunjavanje = jedna sesija)
- Za javni pristup, razmotrite deployment na cloud platformu (Render, Railway, itd.)

