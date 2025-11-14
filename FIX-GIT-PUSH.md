# 🔧 Rješavanje Git Push Problema

## Problem: "could not read Username" ili "Authentication failed"

GitHub više ne prihvaća password za HTTPS. Trebate koristiti **Personal Access Token**.

## Rješenje 1: Personal Access Token (Preporučeno)

### Korak 1: Kreirajte Personal Access Token

1. **Idite na:** https://github.com/settings/tokens
2. **Kliknite:** "Generate new token" → "Generate new token (classic)"
3. **Ime tokena:** `upitnik-deployment` (ili bilo koje ime)
4. **Expiration:** Odaberite koliko želite (npr. 90 dana)
5. **Scopes:** Odaberite `repo` (sve pod-opcije)
6. **Kliknite:** "Generate token"
7. **VAŽNO:** Kopirajte token odmah (prikazuje se samo jednom!)
   - Token izgleda ovako: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Korak 2: Koristite Token za Push

```bash
cd /home/jelena/upitnik-aplikacija

# Kada git pita za username, unesite vaš GitHub username
# Kada git pita za password, unesite TOKEN (ne password!)
git push -u origin main
```

**Ili direktno u URL-u:**
```bash
git remote set-url origin https://TOKEN@github.com/jelenagale/upitnik-aplikacija.git
git push -u origin main
```

---

## Rješenje 2: SSH (Alternativa)

### Korak 1: Generirajte SSH Key

```bash
ssh-keygen -t ed25519 -C "vas@email.com"
# Pritisnite Enter za sve (koristi default lokacije)
```

### Korak 2: Dodajte SSH Key na GitHub

```bash
# Prikaži javni ključ
cat ~/.ssh/id_ed25519.pub
```

1. **Kopirajte cijeli output**
2. **Idite na:** https://github.com/settings/keys
3. **Kliknite:** "New SSH key"
4. **Title:** `Upitnik Deployment`
5. **Key:** Zalijepite kopirani ključ
6. **Kliknite:** "Add SSH key"

### Korak 3: Promijenite Remote na SSH

```bash
cd /home/jelena/upitnik-aplikacija
git remote set-url origin git@github.com:jelenagale/upitnik-aplikacija.git
git push -u origin main
```

---

## Rješenje 3: GitHub CLI (Najlakše)

```bash
# Instalirajte GitHub CLI
sudo apt install gh

# Login
gh auth login

# Push
git push -u origin main
```

---

## Brzi Fix (Ako imate token):

```bash
cd /home/jelena/upitnik-aplikacija

# Zamijenite YOUR_TOKEN sa vašim tokenom
git remote set-url origin https://YOUR_TOKEN@github.com/jelenagale/upitnik-aplikacija.git

# Push
git push -u origin main
```

---

## Provjera

Nakon uspješnog push-a, provjerite na:
https://github.com/jelenagale/upitnik-aplikacija

Svi fajlovi bi trebali biti tamo!

