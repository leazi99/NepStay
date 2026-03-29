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

## Marketplace Upgrade Roadmap (Upwork + Merojob Style)

### Phase 1: Core Hiring Reliability
- [x] Proposal workflow backend (submit proposal, employer review, accept/reject)
- [ ] Proposal UI for freelancer and employer dashboards
- [ ] Contract start flow after accepted proposal/application
- [ ] Better job search filters (experience level, budget type, category)

### Phase 2: Trust and Quality
- [ ] Freelancer profile completeness score and portfolio section
- [ ] Employer trust badges (verified identity, payment verified)
- [ ] Stronger review system (private + public feedback dimensions)
- [ ] Dispute and support ticket baseline

### Phase 3: Work Management
- [ ] Milestones with partial releases
- [ ] Timesheet tracking for hourly contracts
- [ ] Contract room with file sharing and offer terms
- [ ] Offer negotiation (counter-offer, revised budget/timeline)

### Phase 4: Growth and Matching
- [ ] Personalized job recommendations for jobseekers
- [ ] Invite-only proposals from employers to selected freelancers
- [ ] Saved searches and job alerts
- [ ] Skills-based ranking and improved search relevance

