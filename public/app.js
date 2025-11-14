let pitanjeCounter = 0;

function dodajPitanje() {
    pitanjeCounter++;
    const pitanjaLista = document.getElementById('pitanjaLista');
    
    const pitanjeDiv = document.createElement('div');
    pitanjeDiv.className = 'pitanje-item';
    pitanjeDiv.id = `pitanje-${pitanjeCounter}`;
    
    pitanjeDiv.innerHTML = `
        <h3>Pitanje ${pitanjeCounter}</h3>
        <div class="form-group">
            <label>Tekst pitanja:</label>
            <input type="text" name="pitanje_tekst_${pitanjeCounter}" required placeholder="Unesite pitanje">
        </div>
        <div class="form-group">
            <label>Tip pitanja:</label>
            <select name="pitanje_tip_${pitanjeCounter}" onchange="promijeniTipPitanja(${pitanjeCounter})" required>
                <option value="text">Tekst (kratak odgovor)</option>
                <option value="textarea">Tekst (dugi odgovor)</option>
                <option value="radio">Višestruki izbor (jedan odgovor)</option>
                <option value="checkbox">Višestruki izbor (više odgovora)</option>
            </select>
        </div>
        <div class="form-group" id="opcije-container-${pitanjeCounter}" style="display: none;">
            <label>Opcije (jedna po liniji):</label>
            <textarea name="pitanje_opcije_${pitanjeCounter}" rows="4" placeholder="Opcija 1&#10;Opcija 2&#10;Opcija 3"></textarea>
        </div>
        <button type="button" class="remove-btn" onclick="ukloniPitanje(${pitanjeCounter})">Ukloni Pitanje</button>
    `;
    
    pitanjaLista.appendChild(pitanjeDiv);
}

function ukloniPitanje(id) {
    const pitanjeDiv = document.getElementById(`pitanje-${id}`);
    if (pitanjeDiv) {
        pitanjeDiv.remove();
    }
}

function promijeniTipPitanja(id) {
    const select = document.querySelector(`select[name="pitanje_tip_${id}"]`);
    const opcijeContainer = document.getElementById(`opcije-container-${id}`);
    
    if (select.value === 'radio' || select.value === 'checkbox') {
        opcijeContainer.style.display = 'block';
        opcijeContainer.querySelector('textarea').required = true;
    } else {
        opcijeContainer.style.display = 'none';
        opcijeContainer.querySelector('textarea').required = false;
    }
}

document.getElementById('upitnikForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const naslov = formData.get('naslov');
    const opis = formData.get('opis');
    
    // Prikupljanje pitanja
    const pitanja = [];
    const pitanjeItems = document.querySelectorAll('.pitanje-item');
    
    if (pitanjeItems.length === 0) {
        alert('Molimo dodajte barem jedno pitanje!');
        return;
    }
    
    pitanjeItems.forEach(item => {
        const tekstInput = item.querySelector('input[type="text"]');
        const tipSelect = item.querySelector('select');
        const opcijeTextarea = item.querySelector('textarea[name^="pitanje_opcije"]');
        
        const pitanje = {
            tekst: tekstInput.value,
            tip: tipSelect.value
        };
        
        if (opcijeTextarea && opcijeTextarea.value.trim()) {
            pitanje.opcije = opcijeTextarea.value.split('\n').map(o => o.trim()).filter(o => o);
        }
        
        pitanja.push(pitanje);
    });
    
    try {
        const response = await fetch('/api/upitnici', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                naslov,
                opis,
                pitanja
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Koristi link koji server vraća (ako postoji), inače koristi trenutni origin
            const link = data.link || `${window.location.origin}/upitnik/${data.id}`;
            const rezultatiLink = data.link ? data.link.replace('/upitnik/', '/rezultati/') : `${window.location.origin}/rezultati/${data.id}`;
            
            document.getElementById('upitnikForm').style.display = 'none';
            document.getElementById('rezultat').style.display = 'block';
            document.getElementById('linkInput').value = link;
            document.getElementById('pregledLink').href = link;
            document.getElementById('rezultatiLink').href = rezultatiLink;
        } else {
            alert('Greška pri kreiranju upitnika: ' + (data.error || 'Nepoznata greška'));
        }
    } catch (error) {
        alert('Greška pri kreiranju upitnika: ' + error.message);
    }
});

function kopirajLink() {
    const linkInput = document.getElementById('linkInput');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999); // Za mobilne uređaje
    
    navigator.clipboard.writeText(linkInput.value).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ Kopirano!';
        btn.style.background = '#28a745';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
    }).catch(err => {
        alert('Nije moguće kopirati link. Molimo kopirajte ručno.');
    });
}

// Dodaj prvo pitanje automatski
window.addEventListener('DOMContentLoaded', () => {
    dodajPitanje();
});

