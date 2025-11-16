const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const XLSX = require('xlsx');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Sluša na svim mrežnim interfejsima

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'upitnik-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production' ? 'auto' : false,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 dana
  },
  name: 'upitnik.sid'
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// CORS middleware - omogućava pristup s bilo koje domene
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV !== 'production') {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Inicijalizacija baze podataka
const db = new sqlite3.Database('upitnici.db');

// Kreiranje tablica
db.serialize(() => {
  // Tablica za korisnike
  db.run(`CREATE TABLE IF NOT EXISTS korisnici (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    lozinka TEXT NOT NULL,
    ime TEXT,
    kreiran_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tablica za upitnike
  db.run(`CREATE TABLE IF NOT EXISTS upitnici (
    id TEXT PRIMARY KEY,
    korisnik_id TEXT,
    naslov TEXT NOT NULL,
    opis TEXT,
    kreiran_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    aktiviran INTEGER DEFAULT 1,
    FOREIGN KEY (korisnik_id) REFERENCES korisnici(id)
  )`);

  // Tablica za pitanja
  db.run(`CREATE TABLE IF NOT EXISTS pitanja (
    id TEXT PRIMARY KEY,
    upitnik_id TEXT NOT NULL,
    tekst TEXT NOT NULL,
    tip TEXT NOT NULL,
    redoslijed INTEGER,
    opcije TEXT,
    FOREIGN KEY (upitnik_id) REFERENCES upitnici(id)
  )`);

  // Tablica za odgovore
  db.run(`CREATE TABLE IF NOT EXISTS odgovori (
    id TEXT PRIMARY KEY,
    upitnik_id TEXT NOT NULL,
    pitanje_id TEXT NOT NULL,
    sesija_id TEXT,
    odgovor TEXT NOT NULL,
    ispunjeno_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (upitnik_id) REFERENCES upitnici(id),
    FOREIGN KEY (pitanje_id) REFERENCES pitanja(id)
  )`);

  // Tablica za sesije (za grupiranje odgovora po ispunjavanju)
  db.run(`CREATE TABLE IF NOT EXISTS sesije (
    id TEXT PRIMARY KEY,
    upitnik_id TEXT NOT NULL,
    ispunjeno_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (upitnik_id) REFERENCES upitnici(id)
  )`);
});

// Middleware za provjeru autentifikacije
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: 'Potrebna autentifikacija' });
};

// API Rute

// Registracija
app.post('/api/register', async (req, res) => {
  const { email, lozinka, ime } = req.body;

  if (!email || !lozinka) {
    return res.status(400).json({ error: 'Email i lozinka su obavezni' });
  }

  // Provjeri da li korisnik već postoji
  db.get('SELECT * FROM korisnici WHERE email = ?', [email], async (err, korisnik) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (korisnik) {
      return res.status(400).json({ error: 'Email već postoji' });
    }

    // Hash lozinke
    const hashedLozinka = await bcrypt.hash(lozinka, 10);
    const korisnikId = uuidv4();

    // Kreiraj korisnika
    db.run(
      'INSERT INTO korisnici (id, email, lozinka, ime) VALUES (?, ?, ?, ?)',
      [korisnikId, email, hashedLozinka, ime || null],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Automatski login
        req.session.userId = korisnikId;
        req.session.userEmail = email;
        req.session.userName = ime || email;

        res.json({
          success: true,
          message: 'Registracija uspješna',
          user: {
            id: korisnikId,
            email: email,
            ime: ime || email
          }
        });
      }
    );
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, lozinka } = req.body;

  if (!email || !lozinka) {
    return res.status(400).json({ error: 'Email i lozinka su obavezni' });
  }

  db.get('SELECT * FROM korisnici WHERE email = ?', [email], async (err, korisnik) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!korisnik) {
      return res.status(401).json({ error: 'Neispravan email ili lozinka' });
    }

    // Provjeri lozinku
    const isValid = await bcrypt.compare(lozinka, korisnik.lozinka);
    if (!isValid) {
      return res.status(401).json({ error: 'Neispravan email ili lozinka' });
    }

    // Postavi session
    req.session.userId = korisnik.id;
    req.session.userEmail = korisnik.email;
    req.session.userName = korisnik.ime || korisnik.email;

    res.json({
      success: true,
      message: 'Login uspješan',
      user: {
        id: korisnik.id,
        email: korisnik.email,
        ime: korisnik.ime || korisnik.email
      }
    });
  });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Greška pri logout-u' });
    }
    res.json({ success: true, message: 'Logout uspješan' });
  });
});

// Provjera trenutnog korisnika
app.get('/api/me', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({
      authenticated: true,
      user: {
        id: req.session.userId,
        email: req.session.userEmail,
        ime: req.session.userName
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Kreiranje novog upitnika
app.post('/api/upitnici', requireAuth, (req, res) => {
  const { naslov, opis, pitanja } = req.body;
  const korisnikId = req.session.userId;
  const upitnikId = uuidv4();

  if (!naslov) {
    return res.status(400).json({ error: 'Naslov je obavezan' });
  }

  if (!pitanja || pitanja.length === 0) {
    return res.status(400).json({ error: 'Potrebno je dodati barem jedno pitanje' });
  }

  console.log('Kreiranje upitnika:', { naslov, pitanjaCount: pitanja?.length, upitnikId, korisnikId });

  db.run(
    'INSERT INTO upitnici (id, korisnik_id, naslov, opis) VALUES (?, ?, ?, ?)',
    [upitnikId, korisnikId, naslov, opis || ''],
    function(err) {
      if (err) {
        console.error('Greška pri spremanju upitnika:', err);
        return res.status(500).json({ error: err.message });
      }

      console.log('Upitnik spremljen, ID:', upitnikId, 'Row ID:', this.lastID);

      // Dodavanje pitanja
      const stmt = db.prepare('INSERT INTO pitanja (id, upitnik_id, tekst, tip, redoslijed, opcije) VALUES (?, ?, ?, ?, ?, ?)');
      
      pitanja.forEach((pitanje, index) => {
        const pitanjeId = uuidv4();
        const opcijeJson = pitanje.opcije ? JSON.stringify(pitanje.opcije) : null;
        stmt.run(pitanjeId, upitnikId, pitanje.tekst, pitanje.tip, index, opcijeJson);
        console.log('Pitanje dodano:', { pitanjeId, tekst: pitanje.tekst, tip: pitanje.tip });
      });
      
      stmt.finalize((err) => {
        if (err) {
          console.error('Greška pri spremanju pitanja:', err);
          return res.status(500).json({ error: err.message });
        }
        
        // Generiraj puni link - koristi X-Forwarded-Proto za HTTPS na Railway/Render
        const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
        const host = req.get('x-forwarded-host') || req.get('host') || `localhost:${PORT}`;
        const baseUrl = `${protocol}://${host}`;
        const link = `${baseUrl}/upitnik/${upitnikId}`;
        
        console.log('Upitnik kreiran uspješno:', { upitnikId, link });
        
        res.json({ 
          id: upitnikId, 
          link: link,
          relativeLink: `/upitnik/${upitnikId}`
        });
      });
    }
  );
});

// Dohvaćanje upitnika
app.get('/api/upitnici/:id', (req, res) => {
  const { id } = req.params;
  
  console.log('Traženje upitnika sa ID:', id);

  db.get('SELECT * FROM upitnici WHERE id = ?', [id], (err, upitnik) => {
    if (err) {
      console.error('Greška pri dohvaćanju upitnika:', err);
      return res.status(500).json({ error: err.message });
    }
    if (!upitnik) {
      console.log('Upitnik nije pronađen sa ID:', id);
      // Provjeri da li uopće postoje upitnici
      db.all('SELECT id FROM upitnici LIMIT 5', (err, allUpitnici) => {
        if (!err) {
          console.log('Dostupni upitnici:', allUpitnici.map(u => u.id));
        }
      });
      return res.status(404).json({ error: 'Upitnik nije pronađen' });
    }
    
    console.log('Upitnik pronađen:', upitnik.naslov);

    db.all('SELECT * FROM pitanja WHERE upitnik_id = ? ORDER BY redoslijed', [id], (err, pitanja) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const pitanjaSaOpcijama = pitanja.map(p => {
        let opcije = null;
        if (p.opcije) {
          try {
            opcije = JSON.parse(p.opcije);
          } catch (e) {
            console.error('Greška pri parsiranju opcija za pitanje:', p.id, e);
            console.error('Opcije string:', p.opcije);
            // Pokušaj parsirati kao array string
            try {
              opcije = p.opcije.split(',').map(o => o.trim());
            } catch (e2) {
              opcije = [];
            }
          }
        }
        return {
          ...p,
          opcije: opcije
        };
      });

      res.json({
        ...upitnik,
        pitanja: pitanjaSaOpcijama
      });
    });
  });
});

// Lista upitnika korisnika (samo ulogirani korisnici)
app.get('/api/upitnici', requireAuth, (req, res) => {
  const korisnikId = req.session.userId;
  db.all('SELECT * FROM upitnici WHERE korisnik_id = ? ORDER BY kreiran_at DESC', [korisnikId], (err, upitnici) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(upitnici);
  });
});

// Slanje odgovora
app.post('/api/upitnici/:id/odgovori', (req, res) => {
  const { id } = req.params;
  const { odgovori } = req.body;
  const sesijaId = uuidv4();

  // Kreiranje sesije
  db.run('INSERT INTO sesije (id, upitnik_id) VALUES (?, ?)', [sesijaId, id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Spremanje odgovora
    const stmt = db.prepare('INSERT INTO odgovori (id, upitnik_id, pitanje_id, sesija_id, odgovor) VALUES (?, ?, ?, ?, ?)');
    
    odgovori.forEach((odgovor) => {
      const odgovorId = uuidv4();
      const odgovorTekst = Array.isArray(odgovor.odgovor) ? JSON.stringify(odgovor.odgovor) : odgovor.odgovor;
      stmt.run(odgovorId, id, odgovor.pitanje_id, sesijaId, odgovorTekst);
    });

    stmt.finalize((err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: 'Odgovori su spremljeni' });
    });
  });
});

// Dohvaćanje rezultata upitnika (samo vlasnik)
app.get('/api/upitnici/:id/rezultati', requireAuth, (req, res) => {
  const { id } = req.params;
  const korisnikId = req.session.userId;

  // Provjeri da li korisnik ima pristup ovom upitniku
  db.get('SELECT * FROM upitnici WHERE id = ? AND korisnik_id = ?', [id, korisnikId], (err, upitnik) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!upitnik) {
      return res.status(403).json({ error: 'Nemate pristup ovom upitniku' });
    }

    // Dohvaćanje pitanja
    db.all('SELECT * FROM pitanja WHERE upitnik_id = ? ORDER BY redoslijed', [id], (err, pitanja) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Dohvaćanje svih sesija
    db.all('SELECT * FROM sesije WHERE upitnik_id = ? ORDER BY ispunjeno_at', [id], (err, sesije) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Dohvaćanje odgovora
      db.all('SELECT * FROM odgovori WHERE upitnik_id = ?', [id], (err, odgovori) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Organizacija podataka
        const rezultati = sesije.map(sesija => {
          const sesijaOdgovori = odgovori.filter(o => o.sesija_id === sesija.id);

          const red = {
            'Vrijeme ispunjavanja': new Date(sesija.ispunjeno_at).toLocaleString('hr-HR')
          };

          pitanja.forEach(pitanje => {
            const odgovor = sesijaOdgovori.find(o => o.pitanje_id === pitanje.id);
            if (odgovor) {
              try {
                // Pokušaj parsirati kao JSON
                const parsed = JSON.parse(odgovor.odgovor);
                red[pitanje.tekst] = Array.isArray(parsed) ? parsed.join(', ') : String(parsed);
              } catch (e) {
                // Ako nije JSON, koristi direktno
                red[pitanje.tekst] = odgovor.odgovor || '';
              }
            } else {
              red[pitanje.tekst] = '';
            }
          });

          return red;
        });

        res.json({ pitanja, rezultati });
      });
    });
  });
});

// Export u Excel (samo vlasnik)
app.get('/api/upitnici/:id/export', requireAuth, (req, res) => {
  const { id } = req.params;
  const korisnikId = req.session.userId;

  db.get('SELECT * FROM upitnici WHERE id = ? AND korisnik_id = ?', [id, korisnikId], (err, upitnik) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!upitnik) return res.status(403).json({ error: 'Nemate pristup ovom upitniku' });

    db.all('SELECT * FROM pitanja WHERE upitnik_id = ? ORDER BY redoslijed', [id], (err, pitanja) => {
      if (err) return res.status(500).json({ error: err.message });

      db.all('SELECT * FROM sesije WHERE upitnik_id = ? ORDER BY ispunjeno_at', [id], (err, sesije) => {
        if (err) return res.status(500).json({ error: err.message });

        db.all('SELECT * FROM odgovori WHERE upitnik_id = ?', [id], (err, odgovori) => {
          if (err) return res.status(500).json({ error: err.message });

          const headers = ['Vrijeme ispunjavanja', ...pitanja.map(p => p.tekst)];
          const rows = sesije.map(sesija => {
            const sesijaOdgovori = odgovori.filter(o => o.sesija_id === sesija.id);
            const red = [new Date(sesija.ispunjeno_at).toLocaleString('hr-HR')];

            pitanja.forEach(pitanje => {
              const odgovor = sesijaOdgovori.find(o => o.pitanje_id === pitanje.id);
              if (odgovor) {
                try {
                  const parsed = JSON.parse(odgovor.odgovor);
                  red.push(Array.isArray(parsed) ? parsed.join(', ') : String(parsed));
                } catch (e) {
                  red.push(odgovor.odgovor || '');
                }
              } else {
                red.push('');
              }
            });

            return red;
          });

          const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Rezultati');

          const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', `attachment; filename="${upitnik.naslov.replace(/[^a-z0-9]/gi, '_')}_rezultati.xlsx"`);
          res.send(buffer);

        }); // zatvaranje odgovori callback
      }); // zatvaranje sesije callback
    }); // zatvaranje pitanja callback
  }); // zatvaranje upitnik callback
}); // zatvaranje app.get


// Frontend rute
app.get('/', (req, res) => {
  // Ako je korisnik ulogiran, preusmjeri na dashboard
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/kreiraj', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/upitnik/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upitnik.html'));
});

app.get('/rezultati/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const korisnikId = req.session.userId;
  
  // Provjeri da li korisnik ima pristup ovom upitniku
  db.get('SELECT * FROM upitnici WHERE id = ? AND korisnik_id = ?', [id, korisnikId], (err, upitnik) => {
    if (err) {
      return res.status(500).send('Greška pri provjeri pristupa');
    }
    if (!upitnik) {
      return res.status(403).send('Nemate pristup ovom upitniku');
    }
    res.sendFile(path.join(__dirname, 'public', 'rezultati.html'));
  });
});

app.listen(PORT, HOST, () => {
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  // Pronađi prvu IPv4 adresu koja nije loopback
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
    if (localIP !== 'localhost') break;
  }
  
  console.log('='.repeat(60));
  console.log(`✅ Server pokrenut!`);
  console.log(`📱 Lokalni pristup: http://localhost:${PORT}`);
  if (localIP !== 'localhost') {
    console.log(`🌐 Mrežni pristup: http://${localIP}:${PORT}`);
  }
  console.log(`🔗 Aplikacija je dostupna s bilo koje IP adrese na portu ${PORT}`);
  console.log('='.repeat(60));
});

