# UniHall Backend

Node.js + Express service for the UniHall project.

## Getting Started

1. Copy `.env.example` to `.env` and update the MySQL credentials.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server with auto-reload:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:5000/api/health` to confirm the API and database connectivity.

## Scripts

- `npm run dev` – start the server with nodemon.
- `npm start` – start the server with Node.

## Project Structure

```
backend/
  config/
    db.js
  src/
    app.js
    server.js
    controllers/
      healthController.js
    middleware/
      errorHandler.js
      notFound.js
    routes/
      healthRoutes.js
      index.js
```

Extend the controllers and routes as you add new features (auth, allocations, etc.).
