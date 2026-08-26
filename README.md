# 🎓 ShuleLink - Gairo Secondary School (Physics Portal)

Mfumo mahiri wa kazi za likizo na mitihani ya Fizikia (Physics) kwa shule ya sekondari ya **Gairo Secondary School** (Mwl. Richard Lomayan), wenye usahihishaji wa picha za madaftari ya wanafunzi moja kwa moja kwa **DeepSeek Vision AI** na kuhifadhi data kwenye **PostgreSQL**.

---

## 🚀 Teknolojia Zilizotumika (Tech Stack)
- **Frontend**: React 19, Vite, Lucide Icons, Pure Responsive CSS
- **Backend**: Node.js 20+, Express 5, Dotenv, CORS
- **Database**: PostgreSQL 14+ / 16 (`gairo`) au Cloud PostgreSQL (DATABASE_URL)
- **Process Manager**: PM2 (Cluster Mode / Auto-restart)
- **Reverse Proxy**: Nginx na Let's Encrypt SSL (HTTPS)
- **AI Engine**: DeepSeek Vision API (`deepseek-v4-flash-vision-exp`)

---

## 🛠️ Mipangilio ya Mazingira (.env)

Tengeneza faili la `.env` kwenye root ya mradi kwa kunakili mfano wa `.env.example`:

```bash
cp .env.example .env
```

Jaza vigezo vifuatavyo kwenye `.env`:
```ini
NODE_ENV=production
PORT=5000

# PostgreSQL (Chaguo 1: Local VPS Database)
PGUSER=postgres
PGPASSWORD=nyisu
PGHOST=localhost
PGPORT=5432
PGDATABASE=gairo

# Au PostgreSQL (Chaguo 2: Cloud Database kama Supabase/Neon/Render)
# DATABASE_URL=postgresql://user:password@host:5432/gairo
# PGSSL=true

# DeepSeek Vision AI API Key (Pata kutoka https://platform.deepseek.com)
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
```

---

## 🖥️ Mwongozo Kamili wa Kuweka Kwenye VPS (Ubuntu / Debian)

### 1. Weka Node.js, PostgreSQL, Nginx, na PM2:
```bash
# Update mfumo
sudo apt update && sudo apt upgrade -y

# Weka Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs postgresql postgresql-contrib nginx git certbot python3-certbot-nginx

# Weka PM2 globally
sudo npm install -g pm2
```

### 2. Sanidi Database ya PostgreSQL:
```bash
sudo -u postgres psql

# Ndani ya psql, tengeneza mtumiaji maalum na umpe mamlaka kwenye database ya 'gairo':
CREATE USER gairo_user WITH ENCRYPTED PASSWORD 'GairoSec2026!';
GRANT ALL PRIVILEGES ON DATABASE gairo TO gairo_user;
\c gairo
GRANT ALL ON SCHEMA public TO gairo_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gairo_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO gairo_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO gairo_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO gairo_user;
\q
```

### 3. Pakua Mradi (Git Clone) na Weka Dependencies:
```bash
# Ingia kwenye saraka ya webapps (k.m. /var/www au home directory)
cd /var/www
git clone https://github.com/Nyisulya/gairo.git
cd gairo

# Sakinisha packages
npm install

# Sanidi .env
cp .env.example .env
nano .env

# Jenga frontend bundle ya uzalishaji (production)
npm run build
```

### 4. Endesha Mfumo kwa PM2:
```bash
# Tumia ecosystem config ya PM2
pm2 start ecosystem.config.cjs

# Hifadhi ili PM2 ijianzishe yenyewe VPS ikizimika au kurestart
pm2 save
pm2 startup
```

### 5. Sanidi Nginx Reverse Proxy (Muhimu Sana: Ruhusu Picha Kubwa):
Tengeneza faili la Nginx `/etc/nginx/sites-available/gairo`:

```bash
sudo nano /etc/nginx/sites-available/gairo
```

Weka maelezo haya (Badili `domain-yako.com` au weka `IP_ADDRESS` ya VPS yako):
```nginx
server {
    listen 80;
    server_name domain-yako.com www.domain-yako.com;

    # MUHIMU: Inaruhusu picha za madaftari hadi 50MB kupakiwa bila kosa la 413
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Washa site na uanze upya Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/gairo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Weka SSL ya Bure (HTTPS) kwa Certbot:
```bash
sudo certbot --nginx -d domain-yako.com -d www.domain-yako.com
```

### 7. Sanidi Firewall (UFW):
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 🔍 Amri Muhimu za Ufuatiliaji (Monitoring & Maintenance)

| Kazi | Amri |
|---|---|
| Kuona hali ya mfumo (Status) | `pm2 status` |
| Kuangalia live logs | `pm2 logs gairo-shulelink` |
| Kuanzisha upya mfumo | `pm2 restart gairo-shulelink` |
| Kufanya update ya mradi | `git pull && npm run build && pm2 reload gairo-shulelink` |
| Kuangalia PostgreSQL status | `sudo systemctl status postgresql` |

---

## 🔒 Usalama & Class Codes
- **Teacher PIN**: Inathibitishwa kupitia PostgreSQL bila kuruhusu bypass.
- **Class Codes**: Form 1 (`GAIRO-F1`), Form 2 (`GAIRO-F2`), Form 3 (`GAIRO-F3`), Form 4 (`GAIRO-F4`).

© 2026 Gairo Secondary School. Haki zote zimehifadhiwa.
