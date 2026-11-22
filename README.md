# Home Ration Webapp

A multilingual (English, Hindi, Telugu) supermarket ration list manager with electrical and sanitary items. Built with Node.js/Express, MySQL, and React.

## Features

- **Multilingual Support**: English, Hindi (हिंदी), Telugu (తెలుగు) for both UI and item names
- **User Authentication**: JWT-based auth with register, login, logout, password change
- **Categories Management**: Create categories with names/descriptions in 3 languages
- **Items Management**: Full CRUD for items with multilingual names, descriptions, brands, pricing, stock tracking
- **Ration Lists**: Create multiple lists, add items with quantities, mark as purchased, track actual vs estimated costs
- **Templates**: Save lists as templates for quick reuse
- **Electrical & Sanitary Categories**: Pre-seeded with common items
- **Responsive UI**: Works on desktop and mobile
- **Dark Mode**: System-aware dark/light theme

## Tech Stack

### Backend
- Node.js + Express
- MySQL with Sequelize ORM
- JWT Authentication
- i18next for backend translations
- Helmet, CORS, Rate Limiting

### Frontend
- React 18 + Vite
- React Router v6
- Tailwind CSS
- Zustand for state management
- react-i18next for translations
- Lucide React icons
- React Hot Toast

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### 1. Clone and Setup Backend

```bash
cd home-ration-webapp
cp .env.example .env
# Edit .env with your database credentials
```

### 2. Configure Database

Create a MySQL database:
```sql
CREATE DATABASE home_ration CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Install Dependencies & Run Migrations

```bash
# Backend
npm install
npm run db:migrate
npm run db:seed

# Frontend
cd frontend
npm install
cd ..
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend (port 3000)
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend && npm run dev
```

Visit `http://localhost:5173` - the frontend proxies API calls to `http://localhost:3000`.

### 5. Demo Login
- **Email**: demo@example.com
- **Password**: demo123

## Docker Deployment

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with production values

# Build and start
docker-compose up -d --build

# Check logs
docker-compose logs -f app
```

## EC2 Deployment Steps

### On your EC2 instance (Ubuntu 22.04):

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# 3. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Clone your repo
git clone <your-repo-url>
cd home-ration-webapp

# 5. Configure environment
cp .env.example .env
# Edit .env with secure passwords
# IMPORTANT: Change JWT_SECRET to a strong random string!

# 6. Start services
docker-compose up -d --build

# 7. Verify
docker-compose ps
docker-compose logs -f app
```

### Nginx Reverse Proxy (Optional but Recommended)

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/home-ration
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/home-ration /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## Project Structure

```
home-ration-webapp/
├── src/
│   ├── config/          # Database, i18n config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── db/              # Migration & seed scripts
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── stores/      # Zustand stores
│   │   ├── services/    # API service
│   │   ├── App.jsx      # Main app
│   │   └── main.jsx     # Entry point
│   └── public/locales/  # Translation files
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Categories
- `GET /api/categories` - List categories
- `GET /api/categories/:id` - Get category
- `POST /api/categories` - Create (admin)
- `PUT /api/categories/:id` - Update (admin)
- `DELETE /api/categories/:id` - Delete (admin)

### Items
- `GET /api/items` - List items
- `GET /api/items/featured` - Featured items
- `GET /api/items/low-stock` - Low stock (admin)
- `GET /api/items/:id` - Get item
- `POST /api/items` - Create (admin)
- `PUT /api/items/:id` - Update (admin)
- `DELETE /api/items/:id` - Delete (admin)

### Lists
- `GET /api/lists` - User's lists
- `GET /api/lists/templates` - Templates
- `GET /api/lists/:id` - Get list with items
- `POST /api/lists` - Create list
- `PUT /api/lists/:id` - Update list
- `DELETE /api/lists/:id` - Delete list
- `POST /api/lists/:id/items` - Add item to list
- `PUT /api/lists/:id/items/:itemId` - Update list item
- `DELETE /api/lists/:id/items/:itemId` - Remove item
- `PATCH /api/lists/:id/items/:itemId/purchase` - Toggle purchased
- `POST /api/lists/templates/:templateId/create` - Create from template

## Multilingual Data Model

All user-facing text supports 3 languages:
- **Categories**: name_en, name_hi, name_te + descriptions
- **Items**: name_en, name_hi, name_te + descriptions, brands
- **Lists**: name_en, name_hi, name_te + descriptions
- **List Items**: notes_en, notes_hi, notes_te

Frontend language switcher persists choice in localStorage.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 3000 |
| DB_HOST | MySQL host | localhost |
| DB_PORT | MySQL port | 3306 |
| DB_NAME | Database name | home_ration |
| DB_USER | Database user | root |
| DB_PASSWORD | Database password | - |
| JWT_SECRET | JWT signing secret | **Required** |
| JWT_EXPIRES_IN | Access token expiry | 7d |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry | 30d |
| FRONTEND_URL | CORS origin | http://localhost:3000 |

## Adding New Languages

1. Add language code to `supportedLngs` in `src/config/i18n.js` and `frontend/src/i18n.js`
2. Create translation files in `src/locales/<lang>/translation.json` and `frontend/public/locales/<lang>/translation.json`
3. Add language option to LanguageSwitcher component
4. Add columns to models (name_XX, description_XX) and run migration

## License

MIT