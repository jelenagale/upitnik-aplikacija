const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Sluša na svim mrežnim interfejsima

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// CORS middleware - omogućava pristup s bilo koje domene
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Inicijalizacija baze podataka
const db = new sqlite3.Database('upitnici.db');

// Kreiranje tablica
db.serialize(() => {
  // Tablica za upitnike
  db.run(`CREATE TABLE IF NOT EXISTS upitnici (
    id TEXT PRIMARY KEY,
    naslov TEXT NOT NULL,
    opis TEXT,
    kreiran_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    aktiviran INTEGER DEFAULT 1
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

// API Rute

// Dohvaćanje server informacija (IP adresa)
app.get('/api/server-info', (req, res) => {
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let serverIP = null;
  
  // Pronađi prvu IPv4 adresu koja nije loopback
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        serverIP = iface.address;
        break;
      }
    }
    if (serverIP) break;
  }
  
  const protocol = req.protocol || 'http';
  const host = req.get('host') || `${serverIP || 'localhost'}:${PORT}`;
  const baseUrl = `${protocol}://${host}`;
  
  res.json({
    serverIP: serverIP,
    port: PORT,
    baseUrl: baseUrl,
    localUrl: `http://localhost:${PORT}`,
    networkUrl: serverIP ? `http://${serverIP}:${PORT}` : null
  });
});

// Kreiranje novog upitnika
app.post('/api/upitnici', (req, res) => {
  const { naslov, opis, pitanja } = req.body;
  const upitnikId = uuidv4();

  db.run(
    'INSERT INTO upitnici (id, naslov, opis) VALUES (?, ?, ?)',
    [upitnikId, naslov, opis || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Dodavanje pitanja
      const stmt = db.prepare('INSERT INTO pitanja (id, upitnik_id, tekst, tip, redoslijed, opcije) VALUES (?, ?, ?, ?, ?, ?)');
      
      pitanja.forEach((pitanje, index) => {
        const pitanjeId = uuidv4();
        const opcijeJson = pitanje.opcije ? JSON.stringify(pitanje.opcije) : null;
        stmt.run(pitanjeId, upitnikId, pitanje.tekst, pitanje.tip, index, opcijeJson);
      });
      
      stmt.finalize((err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        // Generiraj puni link sa server IP adresom
        const protocol = req.protocol || 'http';
        const host = req.get('host') || `localhost:${PORT}`;
        const baseUrl = `${protocol}://${host}`;
        const link = `${baseUrl}/upitnik/${upitnikId}`;
        
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

  db.get('SELECT * FROM upitnici WHERE id = ?', [id], (err, upitnik) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!upitnik) {
      return res.status(404).json({ error: 'Upitnik nije pronađen' });
    }

    db.all('SELECT * FROM pitanja WHERE upitnik_id = ? ORDER BY redoslijed', [id], (err, pitanja) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const pitanjaSaOpcijama = pitanja.map(p => ({
        ...p,
        opcije: p.opcije ? JSON.parse(p.opcije) : null
      }));

      res.json({
        ...upitnik,
        pitanja: pitanjaSaOpcijama
      });
    });
  });
});

// Lista svih upitnika
app.get('/api/upitnici', (req, res) => {
  db.all('SELECT * FROM upitnici ORDER BY kreiran_at DESC', (err, upitnici) => {
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

// Dohvaćanje rezultata upitnika
app.get('/api/upitnici/:id/rezultati', (req, res) => {
  const { id } = req.params;

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
                const parsed = JSON.parse(odgovor.odgovor);
                red[pitanje.tekst] = Array.isArray(parsed) ? parsed.join(', ') : parsed;
              } catch {
                red[pitanje.tekst] = odgovor.odgovor;
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

// Export u Excel
app.get('/api/upitnici/:id/export', (req, res) => {
  const { id } = req.params;

  // Dohvaćanje upitnika
  db.get('SELECT * FROM upitnici WHERE id = ?', [id], (err, upitnik) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Dohvaćanje pitanja
    db.all('SELECT * FROM pitanja WHERE upitnik_id = ? ORDER BY redoslijed', [id], (err, pitanja) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Dohvaćanje sesija
      db.all('SELECT * FROM sesije WHERE upitnik_id = ? ORDER BY ispunjeno_at', [id], (err, sesije) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Dohvaćanje odgovora
        db.all('SELECT * FROM odgovori WHERE upitnik_id = ?', [id], (err, odgovori) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Priprema podataka za Excel
          const headers = ['Vrijeme ispunjavanja', ...pitanja.map(p => p.tekst)];
          const rows = sesije.map(sesija => {
            const sesijaOdgovori = odgovori.filter(o => o.sesija_id === sesija.id);
            const red = [new Date(sesija.ispunjeno_at).toLocaleString('hr-HR')];

            pitanja.forEach(pitanje => {
              const odgovor = sesijaOdgovori.find(o => o.pitanje_id === pitanje.id);
              if (odgovor) {
                try {
                  const parsed = JSON.parse(odgovor.odgovor);
                  red.push(Array.isArray(parsed) ? parsed.join(', ') : parsed);
                } catch {
                  red.push(odgovor.odgovor);
                }
              } else {
                red.push('');
              }
            });

            return red;
          });

          // Kreiranje Excel fajla
          const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Rezultati');

          // Slanje fajla
          const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', `attachment; filename="${upitnik.naslov.replace(/[^a-z0-9]/gi, '_')}_rezultati.xlsx"`);
          res.send(buffer);
        });
      });
    });
  });
});

// Frontend rute
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/upitnik/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upitnik.html'));
});

app.get('/rezultati/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'rezultati.html'));
});

app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test-connection.html'));
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

