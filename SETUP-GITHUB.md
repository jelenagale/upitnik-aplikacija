# 📦 Priprema za Deployment - GitHub Setup

Prije deploymenta na besplatne platforme, trebate postaviti GitHub repozitorij.

## Korak 1: Provjerite da li imate Git

```bash
git --version
```

Ako nije instaliran:
```bash
sudo apt install git
```

## Korak 2: Konfigurirajte Git (ako još niste)

```bash
git config --global user.name "Vaše Ime"
git config --global user.email "vas@email.com"
```

## Korak 3: Inicijalizirajte Git Repozitorij

```bash
cd /home/jelena/upitnik-aplikacija

# Inicijaliziraj git
git init

# Dodaj sve fajlove
git add .

# Napravi prvi commit
git commit -m "Initial commit - Upitnik aplikacija"
```

## Korak 4: Kreirajte GitHub Repozitorij

1. **Idite na** https://github.com
2. **Kliknite "+" → "New repository"**
3. **Ime repozitorija:** `upitnik-aplikacija`
4. **Ostavite "Public"** (ili "Private" ako želite)
5. **NE kreirajte README, .gitignore ili license** (već imamo)
6. **Kliknite "Create repository"**

## Korak 5: Povežite Lokalni Repo sa GitHub

```bash
cd /home/jelena/upitnik-aplikacija

# Dodaj remote (zamijenite USERNAME sa vašim GitHub username-om)
git remote add origin https://github.com/USERNAME/upitnik-aplikacija.git

# Promijeni branch u main
git branch -M main

# Pushaj kod na GitHub
git push -u origin main
```

GitHub će tražiti autentifikaciju. Možete koristiti:
- **Personal Access Token** (preporučeno)
- **GitHub CLI**

### Ako trebate Personal Access Token:

1. Idite na: https://github.com/settings/tokens
2. Kliknite "Generate new token" → "Generate new token (classic)"
3. Ime: `upitnik-deployment`
4. Odaberite scope: `repo` (sve pod-opcije)
5. Kliknite "Generate token"
6. **Kopirajte token** (prikazuje se samo jednom!)
7. Koristite token umjesto lozinke pri push-u

## Korak 6: Provjerite

Idite na `https://github.com/USERNAME/upitnik-aplikacija` i provjerite da li su svi fajlovi tamo.

## ✅ Gotovo!

Sada možete deployati na Railway ili Render! 

Pogledajte [DEPLOY-FREE.md](./DEPLOY-FREE.md) za sljedeće korake.

---

## 🆘 Problemi?

### Problem: "Permission denied"
**Rješenje:** Provjerite da li koristite pravi token ili password

### Problem: "Repository not found"
**Rješenje:** Provjerite da li je repo kreiran i da li koristite pravi username

### Problem: "Remote origin already exists"
**Rješenje:**
```bash
git remote remove origin
git remote add origin https://github.com/USERNAME/upitnik-aplikacija.git
```

