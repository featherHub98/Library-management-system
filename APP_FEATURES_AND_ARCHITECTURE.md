# Library Management System - Features & Implementation Architecture

## 1) System Overview

This project is a microservices-based library platform with a Next.js frontend and Node.js backend services.

### Core Runtime Components
- **my-app** (Next.js App Router): user/admin UI + backend-for-frontend API routes
- **api-gateway** (Express + proxy middleware): routes API traffic to backend services
- **auth-service** (Express + MongoDB): authentication, signup/login, password reset, role issuance
- **book-service** (Express + MongoDB + PostgreSQL): book catalog, stock/status logic, bookings, image storage
- **config-server** (Express): fetches service config from GitHub, with local defaults fallback
- **consul**: service registration/discovery
- **mongodb + postgres**: persistent data stores

---

## 2) High-Level Request Flow

1. Browser calls `my-app` pages and local API handlers (`/api/...`).
2. `my-app` API routes forward requests to `api-gateway`.
3. `api-gateway` resolves service targets (Consul first, fallback URLs second).
4. Gateway proxies to `auth-service` or `book-service`.
5. Services read/write MongoDB/PostgreSQL and return JSON.
6. `my-app` handles token cookies and role-based route protection.

---

## 3) Architecture by Service

## A) API Gateway
**Path:** `api-gateway/src/server.ts`

### What it does
- Runs on port `8080`
- Proxies auth requests from `/api/auth/*` to auth-service
- Proxies books requests from `/api/books/*` to book-service
- Uses Consul service discovery with fallback static URLs
- Exposes `/health`

### Key implementation choices
- `createProxyMiddleware` for route-level proxying
- Defensive fallbacks if Consul is unavailable
- Per-route proxy error responses for availability diagnostics

---

## B) Auth Service
**Paths:**
- `auth-service/src/server.ts`
- `auth-service/src/models/mongo/User.ts`
- `auth-service/src/services/AuthService.ts`
- `auth-service/src/controllers/AuthController.ts`
- `auth-service/src/dtos/auth.dto.ts`

### Implemented features
1. **User registration/login**
   - Password hashing with `bcrypt`
   - JWT generation with `id`, `username`, and `role`
2. **Role model in schema**
   - `role: 'admin' | 'public'`
   - Default role is `public`
3. **Password reset flow**
   - Generates reset code + expiration
   - Validates code and updates hashed password
4. **Config-first startup**
   - Pulls config from `config-server`
   - Falls back to local defaults if unavailable
5. **Mongo auth source handling**
   - Connects with `?authSource=admin`

### Code-level notes
- Role is stored in Mongo user schema and returned in auth responses.
- Role is embedded in JWT payload so frontend routing can enforce access rules.

---

## C) Book Service (Dual DB)
**Paths:**
- `book-service/src/server.ts`
- `book-service/src/config/database.ts`
- `book-service/src/models/mongo/Book.ts`
- `book-service/src/models/postgres/BookImage.ts`
- `book-service/src/services/book.service.ts`
- `book-service/src/controllers/book.controller.ts`
- `book-service/src/routes/book.routes.ts`

### Implemented features
1. **Book CRUD**
2. **Physical vs eBook pricing**
   - eBook price = `basePrice * 0.9`
   - physical price = `basePrice`
3. **Physical stock tracking**
   - `stock` integer with min `0`
4. **Out-of-stock status**
   - `status: 'in_stock' | 'out_of_stock'`
   - derived from stock for physical books
5. **Validation: physical requires stock**
   - Create endpoint rejects missing/invalid stock for physical format
6. **Booking endpoints**
   - create and list bookings per book
7. **Image storage split**
   - metadata in MongoDB
   - binary images in PostgreSQL
8. **Cascade cleanup**
   - deleting a book also deletes its image record

### Data architecture
- **MongoDB (`Book`)**: title, author, basePrice, format, computed price, stock, status
- **PostgreSQL (`BookImage`)**: image blob, mime type, filename keyed by book id

### Code-level behavior
- `BookSchema.pre('save')` computes `price/status` and normalizes eBook stock.
- `BookService` recomputes `price/status` during create/update/read for consistency.
- Query endpoint supports search + pagination + filters.

---

## D) Config Server
**Path:** `config-server/src/server.ts`

### What it does
- Runs on port `8888`
- `GET /:serviceName/:profile` fetches config JSON from GitHub
- If GitHub fetch fails, returns local default config for supported services

### Why this matters
- Services can boot with dynamic config in distributed mode
- Local development remains resilient when external config is unavailable

---

## E) Frontend (Next.js my-app)
**Paths:**
- `my-app/proxy.ts`
- `my-app/app/api/auth/login/route.ts`
- `my-app/app/api/auth/signup/route.ts`
- `my-app/app/api/books/route.ts`
- `my-app/app/[lang]/admin/books/page.tsx`
- `my-app/app/[lang]/books/page.tsx`
- `my-app/app/components/LandingPage/LandinPage.tsx`

### Implemented features
1. **Localized routing** (`/en`, `/fr`, `/ar`)
2. **Role-based route protection** (`proxy.ts`)
   - Unauthenticated user hitting admin pages -> redirect to `/{lang}/login`
   - Non-admin token on admin pages -> redirect to `/{lang}`
   - Authenticated users visiting auth pages (`/login`, `/signup`, etc.) are redirected away based on role
3. **Auth cookie handling in API routes**
   - Login/signup routes set `authToken` as `httpOnly` cookie
4. **Admin Books management**
   - create/edit/delete books
   - physical stock input + status visibility in table
5. **Public Books catalog**
   - search + pagination
   - stock + “Out of stock” badge for physical books
6. **Landing map locations**
   - predefined location list with markers buttons
   - selected location updates OpenStreetMap embed marker
   - **default location is Sousse**

### Security/UX notes
- Route access checks are centralized in `proxy.ts`.
- Token role parsing is done from JWT payload in edge/runtime-safe code.
- Auth cookies use `httpOnly`, `sameSite: 'strict'`, and `secure` in production.

---

## 4) Infrastructure & Local Dev

### Docker services
**Path:** `docker-compose.yml`
- MongoDB: `27017`
- PostgreSQL: `5432`
- Consul: host networking

MongoDB is initialized with root credentials (`admin/secret`), and services authenticate using `authSource=admin`.

### Dev launcher
**Path:** `dev.ps1`
- Starts all service dev servers in separate PowerShell windows:
  - api-gateway
  - auth-service
  - book-service
  - config-server
  - my-app

---

## 5) Feature-to-Code Mapping (Quick Index)

- **Role in user schema:** `auth-service/src/models/mongo/User.ts`
- **Role in JWT:** `auth-service/src/services/AuthService.ts`
- **Role-based page protection:** `my-app/proxy.ts`
- **Physical stock + status model:** `book-service/src/models/mongo/Book.ts`
- **Physical stock validation:** `book-service/src/controllers/book.controller.ts`
- **Stock/status compute logic:** `book-service/src/services/book.service.ts`
- **Admin stock/status UI:** `my-app/app/[lang]/admin/books/page.tsx`
- **Public out-of-stock UI:** `my-app/app/[lang]/books/page.tsx`
- **Sousse-default map locations:** `my-app/app/components/LandingPage/LandinPage.tsx`

---

## 6) Current Architectural Strengths

- Clear separation of concerns between gateway, auth, catalog, and config services
- Resilient startup with Consul + fallback URLs and config fallbacks
- Practical dual-database model for metadata vs binary content
- Centralized role-aware route gating at frontend edge layer
- Consistent stock/status behavior enforced at schema + service + UI levels

---

## 7) Suggested Next Engineering Steps

1. Add backend authorization guards (JWT verification + role checks) on admin-only API actions.
2. Move JWT parsing/validation in frontend proxy to signature-verified flow.
3. Add integration tests for:
   - role redirects
   - stock/status transitions
   - book delete -> image cascade
4. Consolidate docs by replacing generic `my-app/README.md` with project-specific operational docs.
