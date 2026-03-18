# KaamSathi

KaamSathi is a two-sided hiring marketplace with:
- Jobseeker experience (discover jobs, apply, save jobs, chat, notifications, reviews)
- Employer experience (post/manage jobs, view applicants, pay freelancers, reviews)
- Admin operations (user/payment oversight)

## Monorepo Structure
- `backend/` → Express + MongoDB API
- `client/vite-project/` → React + Vite frontend

## Local Development

### 1) Backend
```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:4000`.

### 2) Frontend
```bash
cd client/vite-project
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Environment Variables
Create `backend/.env` from `backend/.env.example` and configure values for your environment.

## Production Readiness Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Set strong `JWT_SECRET`
- [ ] Set `MONGODB_URL` / `MONGODB_URL_DIRECT`
- [ ] Configure `ALLOWED_ORIGIN` with deployed frontend domain(s)
- [ ] Configure Stripe variables (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) if payments are enabled
- [ ] Configure mail variables (`SENDER_EMAIL`, SMTP credentials)
- [ ] Enable HTTPS for frontend + backend domains
- [ ] Add process manager (`pm2`) or container orchestration for backend uptime

## Health Endpoints
- `GET /health` → process health + uptime
- `GET /ready` → readiness check

## Build Commands

### Frontend
```bash
cd client/vite-project
npm run build
```

### Backend (syntax check)
```bash
cd backend
node --check server.js
```

## Recommended Deploy Strategy
- Deploy frontend on Vercel/Netlify
- Deploy backend on Render/Railway/Fly.io
- Use managed MongoDB (Atlas)

Set frontend `BASE_URL` to your deployed backend URL and backend `ALLOWED_ORIGIN` to your deployed frontend URL.
