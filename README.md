# UniHall

UniHall is a full-stack hall allotment and management system for university residential halls. It digitizes form submission, seat allocation, renewal workflows, complaints, notifications, and admin operations.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MySQL
- Auth/Infra: JWT, Firebase Admin (optional for some flows), SMTP for OTP email

## Project Structure

```
UniHall/
  Backend/        # Express API + MySQL integration
  frontend/       # React web client
  unihall.sql     # Database schema/data dump
  uploads/        # Runtime uploaded files
```

## Prerequisites

- Node.js 18+ (recommended 20+)
- npm 9+
- MySQL 8+

## Quick Start

### 1. Clone and open project

```powershell
git clone <your-repo-url>
cd UniHall
```

### 2. Install dependencies

```powershell
cd Backend
npm install
cd ..\frontend
npm install
cd ..
```

### 3. Configure backend environment

Create or edit Backend/.env (copy from Backend/.env.example):

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=unihall
JWT_SECRET=change_me

FIREBASE_SERVICE_ACCOUNT_JSON=
FIREBASE_SERVICE_ACCOUNT_PATH=

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=UniHall <no-reply@unihall.local>

FRONTEND_BASE_URL=http://localhost:5173
EMAIL_DEBUG_LOG_OTP=false
PASSWORD_RESET_OTP_TTL_MINUTES=10
PASSWORD_RESET_OTP_RATE_LIMIT_SECONDS=60
PASSWORD_RESET_OTP_MAX_ATTEMPTS=5
```

### 4. Configure frontend environment

Create or edit frontend/.env:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 5. Setup database

Create a MySQL database named unihall, then import the SQL dump:

```powershell
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS unihall;"
mysql -u root -p unihall < unihall.sql
```

### 6. Run the backend

```powershell
cd Backend
npm run dev
```

Backend health check:

- http://localhost:5000/
- http://localhost:5000/api/health

### 7. Run the frontend

Open a second terminal:

```powershell
cd frontend
npm run dev
```

Open the Vite URL shown in terminal (default: http://localhost:5173).
## Credential

 - For Admin Credential visit ADMIN_CREDENTIALS.md

## Available Scripts

### Backend

- npm run dev: Start backend with nodemon
- npm start: Start backend with node

### Frontend

- npm run dev: Start Vite dev server
- npm run build: Build production assets
- npm run preview: Preview production build

## Notes

- Do not commit real .env values or Firebase service account JSON keys.
- Uploaded files are generated at runtime under uploads/ and should not be versioned.
- If SMTP is not configured, set EMAIL_DEBUG_LOG_OTP=true for local OTP debugging.
