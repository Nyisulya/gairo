# 🎓 ShuleLink - Gairo Secondary School (Physics Portal)

Mfumo mahiri wa kazi za likizo na mitihani ya Fizikia (Physics) kwa shule ya sekondari ya **Gairo Secondary School** (Mwl. Richard Lomayan), wenye usahihishaji wa picha za madaftari ya wanafunzi moja kwa moja kwa **DeepSeek Vision AI** na kuhifadhi data kwenye **PostgreSQL**.

---

## 🚀 Teknolojia Zilizotumika (Tech Stack)
- **Frontend**: React 19, Vite, Lucide Icons, Pure Responsive Vanilla CSS
- **Backend**: Node.js, Express 5, Dotenv, CORS
- **Database**: PostgreSQL 16 (`gairo`)
- **AI Engine**: DeepSeek Vision API (`deepseek-v4-flash-vision-exp`)

---

## 🛠️ Mipangilio ya Mazingira (.env)

Tengeneza faili la `.env` kwenye root ya mradi kwa kunakili mfano wa `.env.example`:

```bash
cp .env.example .env
```

Jaza vigezo vifuatavyo kwenye `.env`:
```ini
PORT=5000
PGUSER=postgres
PGPASSWORD=nyisu
PGHOST=localhost
PGPORT=5432
PGDATABASE=gairo
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
```

---

## 🖥️ Mwongozo wa Kuweka Kwenye VPS (Ubuntu / Debian Deployment)

### 1. Weka Node.js na PostgreSQL kwenye VPS:
```bash
# Update mfumo
sudo apt update && sudo apt upgrade -y

# Weka Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs postgresql postgresql-contrib git

# Weka PM2 kwa ajili ya kuendesha mfumo background
sudo npm install -g pm2
```

### 2. Sanidi Database ya PostgreSQL kwenye VPS:
```bash
sudo -u postgres psql

# Ndani ya psql, badili password na tengeneza database gairo:
ALTER USER postgres PASSWORD 'nyisu';
CREATE DATABASE gairo;
\q
```

### 3. Clone Repository na Weka Dependencies:
```bash
git clone https://github.com/Nyisulya/gairo.git
cd gairo

npm install
cp .env.example .env
# Edit .env uweke DEEPSEEK_API_KEY yako
nano .env

# Jenga frontend bundle
npm run build
```

### 4. Endesha Mfumo kwa PM2:
```bash
pm2 start server.js --name "gairo-shulelink"
pm2 save
pm2 startup
```

---

## 🔒 Usalama & Class Codes
- **Teacher PIN**: Inathibitishwa kupitia PostgreSQL bila kuruhusu bypass.
- **Class Codes**: Form 1 (`GAIRO-F1`), Form 2 (`GAIRO-F2`), Form 3 (`GAIRO-F3`), Form 4 (`GAIRO-F4`).

© 2026 Gairo Secondary School. Haki zote zimehifadhiwa.
