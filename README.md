cd /workspaces/delivery-portal1
cat > README.md << 'EOF'
# Delivery Integration Portal

A full-stack 3rd-party delivery integration platform inspired by GuzoGo/Truth Delivery. Businesses ("partners") integrate their systems with a delivery network via a REST API; internal staff ("admins") oversee and manage the platform.

## Tech Stack

**Backend:** Laravel 11 (PHP 8.4), Sanctum (token auth), SQLite (dev)
**Frontend:** React (Vite), React Router, Tailwind CSS, Axios

## Project Structure
delivery-portal1/
├── delivery-integration-portal/
│   ├── backend/                 Laravel API
│   │   ├── app/
│   │   │   ├── Http/
│   │   │   │   ├── Controllers/Api/
│   │   │   │   │   ├── AuthController.php           Register/login/logout/change-password
│   │   │   │   │   ├── PartnerController.php         Company profile, docs, API keys, webhook
│   │   │   │   │   ├── AdminController.php           Company approval, oversight, analytics
│   │   │   │   │   ├── EmailVerificationController.php
│   │   │   │   │   ├── TrackingController.php        Public tracking lookup
│   │   │   │   │   └── V1/DeliveryController.php     Public delivery API (API-key auth)
│   │   │   │   └── Middleware/
│   │   │   │       ├── AuthenticatePartnerApiKey.php  API-key auth + rate limit + request log
│   │   │   │       └── EnsureUserIsAdmin.php
│   │   │   ├── Models/           User, Partner, Driver, ApiKey, Delivery, Tracking,
│   │   │   │                     Payment, PartnerDocument, AuditLog, ApiRequestLog
│   │   │   └── Services/
│   │   │       └── WebhookService.php   Dispatches delivery.* events to partner webhooks
│   │   ├── database/migrations/  All schema migrations
│   │   └── routes/api.php        All API routes
│   │
│   └── frontend/                 React app
│       └── src/
│           ├── pages/
│           │   ├── Login.jsx / Register.jsx    Auth (role-based redirect on login)
│           │   ├── TrackDelivery.jsx            Public tracking lookup (no auth)
│           │   ├── ChangePassword.jsx           Shared, used by both roles
│           │   ├── Company*.jsx                 Onboarding, Dashboard, Deliveries,
│           │   │                                Profile, Documents, Settings (API keys/webhook)
│           │   └── Admin*.jsx                   Dashboard, Companies, ApprovalRequests,
│           │                                    Deliveries, AuditLog, Analytics
│           ├── components/       Sidebar, CompanySidebar, ProtectedRoute, CompanyStatusBanner
│           ├── context/AuthContext.jsx
│           └── services/api.js   Axios instance (baseURL + auth token interceptor)
│
└── README.md

## User Roles

| Role | Access |
|---|---|
| **customer** | Public tracking lookup only (`/track`) |
| **partner** | Company dashboard: manage deliveries, API keys, webhook, documents, profile |
| **admin** | Full oversight: approve companies, global deliveries, rate limits, audit log, analytics, impersonation |

## Core Features

### Company (Partner) side
- Registration → email verification → company profile creation → pending admin approval
- Dashboard with real delivery stats (success rate, active/completed/total)
- Manual delivery creation, listing, filtering, cancellation
- Public Delivery API (create/track/list/cancel/simulate) via API key (`tp_live_...` / `tp_test_...`)
- Webhook notifications (`delivery.created`, `.assigned`, `.picked_up`, `.delivered`, `.cancelled`)
- Document upload (business license, tax cert, ID) for admin review
- Company profile (edit info, upload logo/profile picture)
- Password change

### Admin side
- Approve/reject/suspend companies
- Dedicated "Approval Requests" view: pending companies + their uploaded documents, side by side
- Review/approve/reject individual documents; admin can also upload docs on a company's behalf
- Global deliveries view across all partners; manual status override
- Per-company API rate limiting (enforced live in middleware)
- Audit log of all admin actions (who did what, when, to what)
- Impersonation: generate a token to act as a partner's account (logged to audit trail)
- API usage analytics: request counts, success/error rates, response times, per-company breakdown

## Setup

### Backend
```bash
cd delivery-integration-portal/backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite   # if using SQLite (default)
php artisan migrate
php artisan storage:link
php artisan serve --host=0.0.0.0 --port=8000
```

### Frontend
```bash
cd delivery-integration-portal/frontend
npm install
npm run dev
```

### Environment notes
- `MAIL_MAILER=log` by default — verification emails are written to `storage/logs/laravel.log` instead of actually sending. To send real email, configure a transactional provider (Resend, Mailgun, SES) — **Gmail SMTP does not work reliably from cloud/server environments** (Google blocks unfamiliar server IPs even with valid app passwords).
- Database defaults to SQLite for simplicity. Switching to MySQL requires the `pdo_mysql` PHP extension to be installed — verify this in your specific hosting environment before switching.

## Key API Endpoints
POST   /api/register                          Register (any role)
POST   /api/login                              Login → role-based redirect on frontend
POST   /api/change-password
GET    /api/track/{trackingNumber}             Public, no auth
POST   /api/partner/register                   Create company profile (status: pending)
PATCH  /api/partner/profile
POST   /api/partner/profile-picture
POST   /api/partner/documents
GET    /api/partner/dashboard
GET    /api/partner/deliveries
POST   /api/partner/api-keys
PATCH  /api/partner/webhook
POST   /api/v1/deliveries                      API-key auth (partner integration)
GET    /api/v1/deliveries/{id}
POST   /api/v1/deliveries/{id}/simulate         Sandbox only
GET    /api/admin/approval-requests
PATCH  /api/admin/companies/{id}/approve
PATCH  /api/admin/companies/{id}/rate-limit
POST   /api/admin/companies/{id}/impersonate
GET    /api/admin/analytics
GET    /api/admin/audit-logs

Full route list: `php artisan route:list --path=api`

## Known Limitations / Not Yet Built
- No real email delivery configured (log-based only, see note above)
- No driver-facing app/UI (data model exists, no endpoints)
- No "My Deliveries" customer account view (only anonymous tracking-number lookup)
EOF# delivery-portal1
