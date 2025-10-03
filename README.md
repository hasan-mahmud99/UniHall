# UniHall Frontend

React + Vite + Tailwind implementation of the NSTU hall allotment system UI. Self-contained under `UniHall/frontend/`.

## Run locally

```powershell
cd C:\Users\HP\Desktop\Web\HTML\UniHall\frontend
npm install
npm run dev
```

Open the URL printed (default http://localhost:5173).

## Default accounts

- See ADMIN_CREDENTIALS.md

## Features implemented

- Auth: login, register (mock; localStorage)
- Student: dashboard, dynamic form fill, application list, renewal request, notifications, complaints
- Admin: dashboard, dynamic form builder, set active form, applications (review/approve/reject, mark paid), seat plan (status + assign), notifications, complaints

All data persists in browser localStorage. Clear site data to reset.

## Build

```powershell
cd C:\Users\HP\Desktop\Web\HTML\UniHall\frontend
npm run build
npm run preview
```

## Next steps (optional)

- Connect to a real backend API
- Add role-based API guards and pagination
- Visual seat map UI (grid per hall/floor)
- File uploads (photos, docs) in forms
- Replace localStorage with server persistence
