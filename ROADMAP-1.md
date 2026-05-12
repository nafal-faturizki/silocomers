# 🗺️ ROADMAP — Marketplace 3.0

> Panduan pengembangan teknis dari **nol hingga grade industri** untuk developer yang membangun platform edge-native commerce generasi berikutnya.

---

## 📋 Daftar Isi

- [Ikhtisar Fase](#ikhtisar-fase)
- [Fase 0 — Foundation & Tooling](#fase-0--foundation--tooling)
- [Fase 1 — Core Platform](#fase-1--core-platform)
- [Fase 2 — Commerce Engine](#fase-2--commerce-engine)
- [Fase 3 — Intelligence Layer](#fase-3--intelligence-layer)
- [Fase 4 — Logistics Network](#fase-4--logistics-network)
- [Fase 5 — Social & Live Commerce](#fase-5--social--live-commerce)
- [Fase 6 — Scale & Hardening](#fase-6--scale--hardening)
- [Fase 7 — Industry Grade](#fase-7--industry-grade)
- [Standar Teknis Per Layer](#standar-teknis-per-layer)
- [Definition of Done Per Fase](#definition-of-done-per-fase)
- [Tech Debt & Refactor Budget](#tech-debt--refactor-budget)
- [Testing Strategy](#testing-strategy)
- [Observability Roadmap](#observability-roadmap)
- [Security Milestones](#security-milestones)

---

## 🗂️ Ikhtisar Fase

```
FASE 0      FASE 1      FASE 2      FASE 3      FASE 4      FASE 5      FASE 6      FASE 7
Foundation  Core        Commerce    Intelligence Logistics   Social      Scale       Industry
& Tooling   Platform    Engine      Layer        Network     & Live      & Hardening Grade

Week 1-2    Week 3-6    Week 7-12   Week 13-18  Week 19-22  Week 23-26  Week 27-34  Week 35-52
   │           │           │            │            │           │           │           │
   ▼           ▼           ▼            ▼            ▼           ▼           ▼           ▼
Monorepo    Auth +      Checkout    Search AI    Logistics   Live        Load        SOC2 /
DX Setup    Seller      + Escrow    + Rekom      Vendor      Commerce    Testing     ISO 27001
CI/CD       Onboard     Payment     Trust Score  Tracking    Aggregator  DR Plan     Audit Ready
Schema      Product     Multi-cart  Analytics    Escrow      Notif Push  Multi-DC    99.95% SLA
            Catalog     Gateway     Moderation   Reputation  PWA Full    CDN Tuning  PCI DSS
```

---

## ⏱️ Timeline Ringkas

| Fase | Durasi | Milestone Utama |
|------|--------|----------------|
| **Fase 0** — Foundation & Tooling | 2 minggu | Monorepo, CI/CD, schema, local dev siap |
| **Fase 1** — Core Platform | 4 minggu | Auth, seller onboarding, katalog produk live |
| **Fase 2** — Commerce Engine | 6 minggu | Checkout, escrow, payment gateway, order management |
| **Fase 3** — Intelligence Layer | 6 minggu | Search AI, rekomendasi, trust score, analytics |
| **Fase 4** — Logistics Network | 4 minggu | Vendor logistik, tracking, escrow sync |
| **Fase 5** — Social & Live Commerce | 4 minggu | Live detection, notifikasi, PWA penuh |
| **Fase 6** — Scale & Hardening | 8 minggu | Load testing, DR, multi-region, CDN tuning |
| **Fase 7** — Industry Grade | 18 minggu | SOC2, PCI DSS, SLA 99.95%, audit ready |

---

## 🛠️ Fase 0 — Foundation & Tooling

> **Durasi:** 2 minggu
> **Tujuan:** Developer bisa langsung productive dari hari pertama clone repo

### 0.1 — Monorepo Setup

```bash
# Stack monorepo
pnpm workspaces + Turborepo

marketplace/
├── apps/
│   ├── web/              # SvelteKit atau Next.js 14
│   ├── dashboard/        # Seller & logistics dashboard
│   └── workers/          # Cloudflare Workers (Hono)
├── packages/
│   ├── ui/               # Shared component library
│   ├── sdk/              # Shared types, utilities, validators
│   ├── config/           # ESLint, Prettier, TS configs
│   └── test-utils/       # Shared test helpers
└── tools/
    ├── scripts/          # Automation scripts
    └── generators/       # Code generators (Plop.js)
```

**Checklist:**
- [ ] `pnpm` workspaces + `turbo.json` pipeline (build → test → lint)
- [ ] Root `tsconfig.json` dengan path aliases (`@marketplace/*`)
- [ ] `ESLint` + `Prettier` + `commitlint` (Conventional Commits)
- [ ] `Husky` pre-commit hooks (lint + type-check)
- [ ] `.editorconfig` konsisten lintas OS

---

### 0.2 — CI/CD Pipeline

```yaml
# GitHub Actions — .github/workflows/ci.yml
Pipeline:
  pr-check:
    - typecheck (tsc --noEmit)
    - lint (eslint + prettier check)
    - unit tests (vitest)
    - integration tests (miniflare)
    - build validation (turbo build)

  deploy-staging:
    - trigger: push to main
    - deploy Workers ke staging
    - deploy Pages ke staging
    - run E2E tests (Playwright)
    - notify Discord/Slack

  deploy-production:
    - trigger: tag semver (v*)
    - blue-green deploy Workers
    - atomic Pages deploy
    - smoke test production
    - rollback otomatis jika smoke test gagal
```

**Checklist:**
- [ ] GitHub Actions pipeline (PR check + staging + production)
- [ ] Wrangler CLI terintegasi di pipeline
- [ ] Cloudflare Pages auto-preview per PR
- [ ] Secret management via GitHub Secrets + Wrangler Secrets
- [ ] Dependabot untuk dependency updates
- [ ] Semver tagging workflow dengan Changesets

---

### 0.3 — Local Development Environment

```bash
# One-command setup
pnpm setup:dev

# Yang dijalankan:
# 1. Install all dependencies
# 2. Generate .env.local dari .env.example
# 3. Start Miniflare (Workers emulator)
# 4. Seed R2 dengan data dummy
# 5. Start frontend dev server
# 6. Open browser ke localhost:3000
```

**Tools lokal:**
- **Miniflare** — emulasi Cloudflare Workers lokal
- **Wrangler dev** — live reload Workers
- **R2 local** — bucket emulation
- **KV local** — key-value emulation
- **D1 local** — SQLite edge database lokal

**Checklist:**
- [ ] `pnpm dev` menjalankan semua services sekaligus
- [ ] Hot reload aktif untuk Workers + frontend
- [ ] Seed script dengan data realistis (seller, produk, buyer dummy)
- [ ] `pnpm test:local` menjalankan semua test tanpa internet
- [ ] Docker Compose untuk dependensi eksternal (jika ada)
- [ ] `.env.example` lengkap dengan komentar penjelasan

---

### 0.4 — Schema & Data Contracts

```typescript
// packages/sdk/src/schemas/product.ts
import { z } from 'zod'

export const ProductSchema = z.object({
  id: z.string().ulid(),
  sellerId: z.string().ulid(),
  name: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  price: z.number().int().min(100).max(1_000_000_000),
  category: z.array(z.string()).min(1).max(3),
  tags: z.array(z.string()).max(20),
  assets: z.object({
    images: z.array(z.string().url()).min(1).max(10),
    video: z.string().url().optional(),
  }),
  weight_gram: z.number().int().min(1),
  status: z.enum(['draft', 'active', 'suspended', 'deleted']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Product = z.infer<typeof ProductSchema>
```

**Checklist:**
- [ ] Zod schema untuk semua entitas utama (Product, Seller, Buyer, Order, Shipment)
- [ ] ULID sebagai ID strategy (sortable, URL-safe, collision-resistant)
- [ ] JSON Schema export untuk API documentation
- [ ] Type generation otomatis untuk frontend dan Workers
- [ ] Migration strategy untuk schema evolution
- [ ] OpenAPI 3.1 spec dari schema (Hono + Zod OpenAPI)

---

### 0.5 — Documentation Foundation

```
docs/
├── architecture/
│   ├── decisions/        # ADR (Architecture Decision Records)
│   │   ├── ADR-001-monorepo.md
│   │   ├── ADR-002-edge-first.md
│   │   └── ADR-003-ulid-vs-uuid.md
│   ├── diagrams/         # Mermaid diagrams
│   └── data-flow.md
├── api/
│   └── openapi.yaml      # Auto-generated dari code
├── runbooks/             # Operational runbooks
└── contributing.md
```

**Checklist:**
- [ ] ADR template dan 3 ADR pertama terdokumentasi
- [ ] `CONTRIBUTING.md` dengan standar coding, review, dan merge
- [ ] Diagram arsitektur dalam Mermaid (version-controlled)
- [ ] Runbook template untuk incident response
- [ ] Glossary istilah domain (marketplace, escrow, trust score, dll.)

---

## 🏗️ Fase 1 — Core Platform

> **Durasi:** 4 minggu
> **Tujuan:** Seller bisa daftar, verifikasi, upload produk, dan produk terindeks

### 1.1 — Authentication & Identity

```typescript
// Auth Strategy: Edge-native JWT + Refresh Token
//
// Access Token  → 15 menit, disimpan memory (tidak localStorage)
// Refresh Token → 30 hari, httpOnly cookie, rotasi setiap refresh
// Session       → KV store dengan TTL

// Worker: /auth/login
export const loginHandler = async (c: Context) => {
  const { email, password } = await c.req.json()

  // 1. Validasi kredensial (Argon2id hash)
  const user = await verifyCredentials(email, password)

  // 2. Generate token pair
  const { accessToken, refreshToken } = await generateTokenPair(user.id)

  // 3. Simpan refresh token di KV
  await c.env.KV.put(
    `refresh:${refreshToken}`,
    JSON.stringify({ userId: user.id, rotationCount: 0 }),
    { expirationTtl: 30 * 24 * 60 * 60 }
  )

  // 4. Set httpOnly cookie + return access token
  setCookie(c, 'rt', refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict' })
  return c.json({ accessToken, user: sanitizeUser(user) })
}
```

**Fitur:**
- Email + password (Argon2id)
- OAuth2: Google, GitHub (social login)
- OTP via email & SMS (Resend + Twilio)
- Refresh token rotation (security)
- Device fingerprinting (anomaly detection)
- Session invalidation per device
- Rate limiting: 5 percobaan login / 15 menit per IP

**Checklist:**
- [ ] `POST /auth/register` — registrasi email
- [ ] `POST /auth/login` — login email
- [ ] `POST /auth/refresh` — refresh token rotation
- [ ] `POST /auth/logout` — invalidate session
- [ ] `GET /auth/me` — profil user terautentikasi
- [ ] Google OAuth flow (authorization code)
- [ ] OTP endpoint (email & SMS)
- [ ] Rate limiter middleware (Cloudflare KV + sliding window)
- [ ] CSRF protection untuk cookie-based auth
- [ ] Unit test: semua auth flows (100% coverage)

---

### 1.2 — Seller Onboarding

```
Alur Onboarding Seller:

Register → Verify Email → Complete Profile → Verify Phone
    ↓
Connect Social (optional, tingkatkan trust)
    ↓
Setup Storage (CDN endpoint)
    ↓
Activate Subscription
    ↓
Seller Active ✓
```

**API Endpoints:**

```
POST   /sellers/register              # Buat seller profile
GET    /sellers/:id                   # Profil seller publik
PUT    /sellers/me                    # Update profil seller
POST   /sellers/me/verify/email       # Kirim OTP email
POST   /sellers/me/verify/phone       # Kirim OTP telepon
POST   /sellers/me/verify/social      # Link akun sosial
POST   /sellers/me/storage            # Daftarkan CDN endpoint
GET    /sellers/me/storage/validate   # Validasi CDN health
```

**Storage Validation Flow:**

```typescript
// Validasi CDN endpoint seller
async function validateSellerCDN(endpoint: string): Promise<ValidationResult> {
  const testPath = `${endpoint}/.marketplace-validation`

  const checks = await Promise.allSettled([
    // 1. SSL certificate valid
    checkSSL(endpoint),
    // 2. Response time < 500ms
    checkLatency(testPath, 500),
    // 3. CORS headers benar
    checkCORS(endpoint),
    // 4. Content-Type header ada
    checkHeaders(testPath),
  ])

  return {
    valid: checks.every(c => c.status === 'fulfilled'),
    details: checks.map(c => c.status),
  }
}
```

**Checklist:**
- [ ] Seller registration + profile CRUD
- [ ] Email OTP verification
- [ ] Phone OTP verification (Twilio / Zenziva untuk ID)
- [ ] CDN endpoint validation (SSL, latency, CORS, availability)
- [ ] Seller profile schema tersimpan di R2 (metadata JSON)
- [ ] Seller dashboard UI — halaman onboarding step-by-step
- [ ] Progress indicator onboarding (% completion)
- [ ] Webhook: `seller.verified` event
- [ ] Test: happy path + semua edge case validasi CDN

---

### 1.3 — Product Catalog

```typescript
// R2 Object Structure untuk Katalog
//
// metadata/sellers/{sellerId}/products/{productId}.json  → data produk
// metadata/sellers/{sellerId}/catalog.json              → daftar produk seller
// metadata/categories/{slug}/index.json                 → produk per kategori
// metadata/search/shards/{0-15}/{productId}.json        → search shards

// Contoh product metadata object
const productMetadata = {
  id: "01HX...",
  sellerId: "01HW...",
  name: "Sepatu Nike Air Max 270 Original",
  slug: "sepatu-nike-air-max-270-original",
  price: 1250000,
  compareAtPrice: 1500000,      // harga coret
  category: ["fashion", "sepatu", "sneakers"],
  tags: ["nike", "original", "air-max"],
  assets: {
    thumbnail: "https://cdn.seller.com/thumb/sepatu.jpg",  // kecil, dari seller
    images: [
      "https://cdn.seller.com/images/sepatu-1.jpg",
      "https://cdn.seller.com/images/sepatu-2.jpg",
    ]
  },
  variants: [
    { sku: "NK-270-40", size: "40", stock: 5, price: 1250000 },
    { sku: "NK-270-41", size: "41", stock: 3, price: 1250000 },
  ],
  shipping: {
    weight_gram: 800,
    origin_city: "Jakarta Selatan",
    origin_province: "DKI Jakarta",
  },
  status: "active",
  trustSignals: {
    verifiedAssets: true,    // CDN accessible
    moderationPassed: true,  // Lolos moderasi AI
    sellerTrustLevel: 2,     // Level verifikasi seller
  },
  stats: {
    views: 0, sales: 0, rating: 0, reviewCount: 0,
  },
  createdAt: "2024-12-01T10:00:00Z",
  updatedAt: "2024-12-01T10:00:00Z",
}
```

**API Endpoints:**

```
POST   /products                      # Buat produk baru
GET    /products/:id                  # Detail produk
PUT    /products/:id                  # Update produk
DELETE /products/:id                  # Hapus produk (soft delete)
GET    /sellers/me/products           # List produk milik seller
POST   /products/bulk                 # Bulk import via JSON/CSV
POST   /products/:id/publish          # Publish produk ke marketplace
POST   /products/:id/unpublish        # Unpublish produk
GET    /products/:id/analytics        # Statistik produk
```

**Checklist:**
- [ ] CRUD produk lengkap
- [ ] Validasi URL aset (pastikan aset accessible via seller CDN)
- [ ] Slug auto-generation (URL-friendly, unique per seller)
- [ ] Variant system (ukuran, warna, dll.)
- [ ] Bulk import CSV (max 1.000 produk per upload)
- [ ] R2 write strategy (metadata JSON per produk + catalog index)
- [ ] Soft delete dengan audit trail
- [ ] Product status state machine (draft → pending → active → suspended)
- [ ] Seller dashboard: product list + CRUD UI
- [ ] Test: CRUD, validasi, bulk import, state transitions

---

### 1.4 — Seller Dashboard UI

**Stack Frontend:**
- SvelteKit (atau Next.js 14 App Router)
- TailwindCSS + shadcn/ui
- Tanstack Query untuk data fetching
- Zod untuk form validation (shared schema dari `packages/sdk`)

**Halaman yang dibangun di Fase 1:**

| Halaman | Route | Fitur |
|---------|-------|-------|
| Onboarding | `/onboarding` | Wizard 5 langkah |
| Dashboard | `/dashboard` | Overview stats |
| Products | `/dashboard/products` | List + CRUD |
| Product Add | `/dashboard/products/new` | Form + image preview |
| Settings | `/dashboard/settings` | Profil, CDN, notifikasi |

**Checklist:**
- [ ] Layout seller dashboard (sidebar, header, responsive)
- [ ] Onboarding wizard (5 langkah, progress saved)
- [ ] Product list dengan pagination + filter + search
- [ ] Product form (nama, harga, kategori, tag, gambar URL, varian)
- [ ] CDN health indicator (realtime check)
- [ ] Settings: profil, storage config, notifikasi
- [ ] Loading states, error states, empty states
- [ ] Aksesibilitas (WCAG 2.1 AA minimum)
- [ ] Mobile responsive (seller sering pakai HP)

---

## 🛒 Fase 2 — Commerce Engine

> **Durasi:** 6 minggu
> **Tujuan:** Buyer bisa checkout, dana masuk escrow, seller terima order

### 2.1 — Buyer Journey & Storefront

**Halaman Storefront:**

```
/                          → Beranda (feed rekomendasi, trending, kategori)
/search?q=...              → Hasil pencarian
/category/:slug            → Halaman kategori
/product/:slug             → Detail produk
/seller/:username          → Storefront seller
/cart                      → Keranjang belanja
/checkout                  → Checkout flow
/orders                    → Daftar order buyer
/orders/:id                → Detail order + tracking
/account                   → Profil buyer
```

**State Management Keranjang:**

```typescript
// Cart disimpan di: KV (logged in) atau localStorage (guest)
// Saat login → merge guest cart dengan cart tersimpan

interface Cart {
  id: string
  buyerId: string | null  // null = guest
  items: CartItem[]
  appliedCoupon?: string
  updatedAt: string
}

interface CartItem {
  productId: string
  sellerId: string
  variantSku: string
  quantity: number
  snapshotPrice: number      // harga saat ditambah ke cart
  snapshotName: string       // nama produk saat ditambah
  snapshotImage: string
}
```

**Checklist:**
- [ ] Beranda storefront dengan featured products
- [ ] Halaman kategori dengan filter & sorting
- [ ] Halaman detail produk (galeri, varian, ulasan, info seller)
- [ ] Storefront seller (semua produk seller, info, rating)
- [ ] Keranjang: add, update quantity, remove, persist
- [ ] Guest cart dengan merge saat login
- [ ] Price snapshot saat item masuk keranjang
- [ ] Wishlist buyer (simpan produk favorit)
- [ ] Recently viewed products (KV per buyer)

---

### 2.2 — Checkout Engine

```
Alur Checkout:

Keranjang → Alamat → Pilih Ekspedisi → Pembayaran → Konfirmasi
    ↓           ↓           ↓               ↓             ↓
Validasi    Simpan      Hitung          Payment       Order
Stock       Alamat      Ongkir          Gateway       Created
```

**Checkout Atomicity:**

```typescript
// checkout-engine harus atomic:
// Jika salah satu langkah gagal → rollback semua

async function processCheckout(payload: CheckoutPayload, env: Env) {
  // 1. Lock stok semua item (KV dengan TTL 10 menit)
  const stockLock = await lockStock(payload.items, env.KV)
  if (!stockLock.success) throw new InsufficientStockError(stockLock.failedItems)

  try {
    // 2. Kalkulasi harga final (harga + ongkir + fee)
    const pricing = await calculateFinalPricing(payload)

    // 3. Buat order di R2 dengan status "pending_payment"
    const order = await createOrder({ ...payload, pricing }, env.R2)

    // 4. Inisiasi payment di gateway
    const payment = await initiatePayment(order, payload.gateway, env)

    // 5. Update order dengan payment_id
    await updateOrder(order.id, { paymentId: payment.id }, env.R2)

    // 6. Kirim event: order.created
    await env.QUEUE.send({ type: 'order.created', orderId: order.id })

    return { order, payment }
  } catch (error) {
    // Rollback: release stock lock
    await releaseStockLock(stockLock.lockIds, env.KV)
    throw error
  }
}
```

**Checklist:**
- [ ] Checkout flow UI (multi-step form)
- [ ] Manajemen alamat buyer (simpan multiple alamat)
- [ ] Kalkulasi ongkir (integrasi API logistik di Fase 4, dummy dulu)
- [ ] Voucher/kupon discount
- [ ] Price final breakdown (produk + ongkir + platform fee)
- [ ] Stock locking sementara selama checkout (TTL 10 menit)
- [ ] Order creation (atomik, rollback jika gagal)
- [ ] Checkout untuk multi-seller (satu pembayaran, banyak sub-order)
- [ ] Guest checkout (tanpa registrasi)
- [ ] Test: concurrency stock locking, rollback scenarios

---

### 2.3 — Payment Gateway Integration

**Gateway Priority (Indonesia First):**

```typescript
// Gateway abstraction layer
interface PaymentGateway {
  name: string
  createTransaction(order: Order): Promise<PaymentTransaction>
  verifyWebhook(payload: unknown, signature: string): boolean
  refund(transactionId: string, amount: number): Promise<RefundResult>
}

// Implementasi:
class MidtransGateway implements PaymentGateway { ... }
class XenditGateway implements PaymentGateway { ... }
class StripeGateway implements PaymentGateway { ... }

// Factory
function getGateway(name: string, env: Env): PaymentGateway {
  const gateways: Record<string, PaymentGateway> = {
    midtrans: new MidtransGateway(env.MIDTRANS_SERVER_KEY),
    xendit: new XenditGateway(env.XENDIT_SECRET_KEY),
    stripe: new StripeGateway(env.STRIPE_SECRET_KEY),
  }
  return gateways[name] ?? gateways.midtrans
}
```

**Metode Pembayaran yang Didukung:**

| Gateway | Metode |
|---------|--------|
| **Midtrans** | GoPay, OVO, DANA, ShopeePay, QRIS, VA BCA/BRI/Mandiri/BNI, Indomaret, Alfamart, Kartu Kredit |
| **Xendit** | QRIS, VA, OVO, DANA, LinkAja, Kartu |
| **Stripe** | Kartu internasional, Apple Pay, Google Pay |

**Webhook Security:**

```typescript
// Semua webhook harus diverifikasi signature
async function verifyMidtransWebhook(
  payload: string,
  serverKey: string,
  signatureKey: string
): Promise<boolean> {
  // Midtrans: SHA512(orderId + statusCode + grossAmount + serverKey)
  const expected = await sha512(
    `${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`
  )
  return expected === signatureKey
}
```

**Checklist:**
- [ ] Midtrans integration (SNAP + Core API)
- [ ] Xendit integration
- [ ] Stripe integration (untuk international)
- [ ] Abstraction layer (mudah tambah gateway baru)
- [ ] Webhook handler per gateway (idempotent, replay-safe)
- [ ] Webhook signature verification (semua gateway)
- [ ] Payment status state machine (pending → paid → expired → refunded)
- [ ] Idempotency key untuk setiap transaksi
- [ ] Failed payment retry (dengan exponential backoff via Queue)
- [ ] Test: mock webhook dari setiap gateway, edge cases

---

### 2.4 — Escrow Engine

```
Status Escrow:

pending_payment → held → released → refunded
                    ↓
                disputed → resolved_release
                         → resolved_refund
```

```typescript
interface EscrowRecord {
  id: string
  orderId: string
  buyerId: string
  sellerId: string
  amount: number                    // dalam rupiah/cents
  platformFee: number
  sellerAmount: number              // amount - platformFee
  status: EscrowStatus
  paymentGateway: string
  gatewayTransactionId: string
  heldAt: string | null
  releasedAt: string | null
  disputeOpenedAt: string | null
  resolvedAt: string | null
  autoReleaseAt: string            // heldAt + 3 hari
}
```

**Auto-Release Mechanism:**

```typescript
// Cloudflare Cron Trigger — setiap jam
// Cek escrow yang sudah lewat autoReleaseAt

export const scheduledHandler = async (event: ScheduledEvent, env: Env) => {
  const expiredEscrows = await findEscrowsReadyForRelease(env.R2, env.KV)

  for (const escrow of expiredEscrows) {
    await releaseEscrow(escrow.id, env)
    await env.QUEUE.send({
      type: 'escrow.auto_released',
      escrowId: escrow.id,
      orderId: escrow.orderId,
    })
  }
}
```

**Checklist:**
- [ ] Escrow creation saat payment confirmed
- [ ] Escrow hold status tracking
- [ ] Manual release saat buyer konfirmasi
- [ ] Auto-release setelah 3 hari (Cron trigger)
- [ ] Dispute flow (buyer buka dispute → mediasi → resolusi)
- [ ] Partial refund support
- [ ] Escrow history / audit trail (immutable log di R2)
- [ ] Seller dapat notifikasi saat escrow released
- [ ] Test: auto-release timing, dispute resolution paths

---

### 2.5 — Order Management

```typescript
// Order State Machine
type OrderStatus =
  | 'pending_payment'   // Order dibuat, menunggu pembayaran
  | 'paid'              // Pembayaran diterima
  | 'processing'        // Seller memproses
  | 'ready_to_ship'     // Siap diserahkan ke kurir
  | 'shipped'           // Kurir pickup, dalam pengiriman
  | 'delivered'         // Terkirim ke buyer
  | 'confirmed'         // Buyer konfirmasi penerimaan
  | 'completed'         // Escrow released
  | 'cancelled'         // Dibatalkan
  | 'refunded'          // Dana dikembalikan
  | 'disputed'          // Dalam sengketa
```

**Seller Order Dashboard:**

```
Tampilan seller:
┌─────────────────────────────────────────────────────┐
│ Orders                               Filter ▼  Sort ▼│
├─────────────────────────────────────────────────────┤
│ #ORD-001  John D.  Sepatu Nike   Rp1.250.000  [BARU]│
│           Jakarta   Air Max 40    +ongkir             │
│           [Proses Order]  [Tolak]                     │
├─────────────────────────────────────────────────────┤
│ #ORD-002  Sarah K.  Tas Kulit    Rp450.000  [KIRIM] │
│           Bandung   Coklat        +ongkir             │
│           [Input Resi]                                │
└─────────────────────────────────────────────────────┘
```

**Checklist:**
- [ ] Order list seller (filter status, sort, search)
- [ ] Detail order (item, buyer, alamat, ongkir, escrow status)
- [ ] Aksi seller: proses, input resi, batalkan
- [ ] Order timeline / history event
- [ ] Buyer: order list + detail + tracking
- [ ] Notifikasi email saat status order berubah (Resend)
- [ ] Order cancellation dengan stock restore
- [ ] Refund request flow
- [ ] Test: state machine transitions, cancellation, refund

---

## 🧠 Fase 3 — Intelligence Layer

> **Durasi:** 6 minggu
> **Tujuan:** Search bertenaga AI, rekomendasi personal, trust score dinamis, analytics seller

### 3.1 — Search Engine

**Arsitektur Search:**

```
Query Buyer
     ↓
Cloudflare Worker (Search Handler)
     ↓
┌────────────────────────────────────┐
│         Search Pipeline            │
│                                    │
│  1. Query Parsing & Normalization  │
│  2. R2 Shard Lookup (15 shards)   │
│  3. Candidate Retrieval            │
│  4. Scoring & Ranking              │
│  5. Filter Application             │
│  6. Pagination + Cursor            │
│  7. Result Assembly                │
└────────────────────────────────────┘
     ↓
Cached Result (KV, TTL 5 menit untuk populer)
     ↓
Response ke Buyer
```

**Scoring Formula:**

```typescript
function calculateSearchScore(product: ProductDoc, query: SearchQuery): number {
  const weights = {
    textMatch: 0.35,       // Kecocokan teks (nama, deskripsi, tag)
    sellerTrust: 0.20,     // Trust score seller
    recency: 0.10,         // Produk baru lebih relevan
    popularity: 0.15,      // Views + sales
    fulfillmentQuality: 0.15, // Tingkat pemenuhan order
    priceCompetitiveness: 0.05, // Harga vs rata-rata kategori
  }

  return (
    textScore(product, query) * weights.textMatch +
    product.sellerTrustScore * weights.sellerTrust +
    recencyScore(product.createdAt) * weights.recency +
    popularityScore(product.stats) * weights.popularity +
    fulfillmentScore(product.sellerStats) * weights.fulfillmentQuality +
    priceScore(product.price, query.categoryAvgPrice) * weights.priceCompetitiveness
  )
}
```

**Semantic Search (AI-powered):**

```typescript
// Untuk query yang tidak menemukan exact match:
// Gunakan embedding untuk semantic similarity

async function semanticSearch(query: string, env: Env): Promise<Product[]> {
  // 1. Generate query embedding via Workers AI
  const embedding = await env.AI.run('@cf/baai/bge-small-en-v1.5', {
    text: query
  })

  // 2. Cari produk dengan embedding paling mirip
  // (simpan embedding produk di R2 + KV index)
  return await vectorSearch(embedding.data, env)
}
```

**Checklist:**
- [ ] Full-text search dengan shard-based index di R2
- [ ] Filter: kategori, harga (min-max), rating, lokasi seller, kondisi
- [ ] Sorting: relevansi, terbaru, harga, terpopuler, terlaris
- [ ] Pagination dengan cursor (bukan offset)
- [ ] Autocomplete / search suggestion (KV prefix lookup)
- [ ] Search analytics (query populer, zero-result queries)
- [ ] Semantic search via Workers AI embedding
- [ ] Search index rebuild pipeline (background Worker)
- [ ] KV caching untuk query populer
- [ ] Performance target: < 100ms P95 response time
- [ ] Test: ranking accuracy, edge cases, load test 1000 QPS

---

### 3.2 — Recommendation Engine

**Sinyal Rekomendasi:**

```typescript
// Event yang dikumpulkan:
type BehaviorEvent =
  | { type: 'product_view'; productId: string; durationMs: number }
  | { type: 'product_click'; productId: string; source: 'search'|'feed'|'category' }
  | { type: 'add_to_cart'; productId: string }
  | { type: 'purchase'; productId: string; orderId: string }
  | { type: 'wishlist_add'; productId: string }
  | { type: 'search'; query: string; clickedProductId?: string }
  | { type: 'live_join'; sellerId: string; sessionId: string }

// Semua event dikirim ke Queue untuk processing async
// Tidak pernah blocking request utama
```

**Rekomendasi Algorithms:**

| Algoritma | Use Case |
|-----------|---------|
| **Collaborative Filtering** | "Buyer seperti kamu juga beli..." |
| **Content-Based** | Produk mirip yang sedang dilihat |
| **Trending** | Produk populer dalam 24 jam terakhir |
| **New Arrivals** | Produk baru dari seller yang diikuti |
| **Cross-Sell** | Produk relevan saat checkout |
| **Live Commerce** | Produk dari seller yang sedang live |

**Checklist:**
- [ ] Event collection pipeline (client → Worker → Queue → R2)
- [ ] Buyer behavior profile di KV (update async)
- [ ] Trending engine (rolling 24 jam, update tiap 15 menit)
- [ ] Similar products (content-based, sama tag/kategori)
- [ ] Collaborative filtering (batch processing harian via Cron)
- [ ] Feed beranda buyer (campuran algoritma)
- [ ] A/B testing framework untuk algoritma rekomendasi
- [ ] CTR tracking per rekomendasi (untuk optimasi)
- [ ] Test: cold start (buyer baru), algorithm accuracy

---

### 3.3 — Trust Score Engine

**Komponen Trust Score Seller:**

```typescript
interface TrustScoreComponents {
  // Verifikasi (bobot: 30%)
  verification: {
    emailVerified: boolean       // +5 pts
    phoneVerified: boolean       // +5 pts
    socialVerified: boolean      // +10 pts
    identityVerified: boolean    // +10 pts
  }

  // Performa Transaksi (bobot: 40%)
  transactionPerformance: {
    fulfillmentRate: number      // % order berhasil dikirim
    onTimeRate: number           // % kirim tepat waktu
    cancelRateByBuyer: number    // % buyer batalkan (negatif)
    disputeRate: number          // % dispute (sangat negatif)
    refundRate: number           // % refund (negatif)
  }

  // Kualitas Layanan (bobot: 20%)
  serviceQuality: {
    avgRating: number            // Rating 1-5 dari buyer
    responseRate: number         // % pesan dibalas < 1 jam
    avgResponseHours: number     // Rata-rata waktu respons
    reviewCount: number          // Jumlah ulasan diterima
  }

  // Aktivitas (bobot: 10%)
  activity: {
    monthsActive: number         // Lama bergabung
    productDiversity: number     // Jumlah kategori
    livestreamFrequency: number  // Frekuensi live
    lastActiveAt: string
  }
}

// Skor akhir: 0-100, diperbarui setiap malam via Cron
```

**Checklist:**
- [ ] Trust score calculation engine (kalkulasi nightly)
- [ ] Real-time adjustments (dispute/fraud langsung turunkan skor)
- [ ] Trust badge assignment (Bronze/Silver/Gold/Platinum)
- [ ] Trust score history (grafik tren per bulan)
- [ ] Seller dapat notifikasi jika trust score turun signifikan
- [ ] Trust score expose di API (untuk search ranking, rekomendasi)
- [ ] Fraud signal detector (pola anomali transaksi)
- [ ] Test: score calculation accuracy, threshold effects

---

### 3.4 — Analytics Engine

**Event Pipeline:**

```
Browser/App Event
       ↓
Cloudflare Worker (event ingestion, < 1ms overhead)
       ↓
Cloudflare Queue (async processing)
       ↓
Analytics Worker (aggregation)
       ↓
R2 (daily snapshots JSON)
       ↓
Seller Dashboard (charts, tables)
```

**Schema Analytics R2:**

```
analytics/sellers/{sellerId}/
├── daily/2024-12-01.json         # Snapshot harian
├── weekly/2024-W49.json          # Snapshot mingguan
├── monthly/2024-12.json          # Snapshot bulanan
└── products/{productId}/
    ├── daily/2024-12-01.json     # Performa produk harian
    └── events/                   # Raw events (7 hari retensi)
```

**Metrik yang Dikumpulkan:**

| Kategori | Metrik |
|----------|--------|
| **Traffic** | Page views, unique visitors, session duration |
| **Product** | Views per produk, click-through rate, add-to-cart rate |
| **Conversion** | Checkout rate, purchase rate, average order value |
| **Search** | Impressi di hasil pencarian, posisi rata-rata, klik |
| **Recommendation** | Muncul di feed, diklik dari feed, convert dari feed |
| **Live Commerce** | Penonton, join rate, produk diklik, konversi dari live |
| **Retention** | Pembeli berulang, customer lifetime value |
| **Geographic** | Distribusi buyer per provinsi |

**Checklist:**
- [ ] Event ingestion Worker (non-blocking, < 1ms overhead)
- [ ] Queue-based processing (tidak ganggu main request)
- [ ] Daily/weekly/monthly aggregation via Cron
- [ ] Seller analytics dashboard UI (chart, tabel)
- [ ] Product-level analytics (per produk)
- [ ] Search analytics (query populer, zero result)
- [ ] Live commerce analytics
- [ ] Export analytics ke CSV
- [ ] Data retention policy (raw: 7 hari, aggregated: 2 tahun)
- [ ] Test: aggregation accuracy, concurrent event handling

---

### 3.5 — AI Commerce Tooling (Seller)

```typescript
// Workers AI + Anthropic Claude API

// 1. Generasi Deskripsi Produk
async function generateProductDescription(
  productName: string,
  category: string,
  images: string[],
  env: Env
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Buat deskripsi produk marketplace yang menarik, informatif, dan SEO-friendly.
Produk: ${productName}
Kategori: ${category}
Panduan: Gunakan bahasa Indonesia yang natural, 150-200 kata, highlight keunggulan produk.
Format: paragraf langsung, tanpa bullet point.`
      }]
    })
  })
  const data = await response.json()
  return data.content[0].text
}
```

**AI Tools yang Dibangun:**

| Tool | Input | Output |
|------|-------|--------|
| **Deskripsi Generator** | Nama, kategori, gambar | Deskripsi 150-200 kata |
| **Judul Optimizer** | Judul existing | 3 variasi judul yang lebih baik |
| **Keyword Generator** | Nama + kategori | 20 keyword relevan |
| **SEO Meta Generator** | Produk info | Meta title + description |
| **Category Suggester** | Nama + deskripsi | Top 3 kategori yang cocok |
| **Review Summarizer** | Array ulasan buyer | Ringkasan 3 poin utama |
| **Price Advisor** | Kategori + fitur | Saran rentang harga kompetitif |

**Checklist:**
- [ ] Rate limiting per seller (kuota AI per bulan)
- [ ] Caching hasil AI (sama input → ambil dari KV)
- [ ] Fallback ke Workers AI jika Anthropic throttle
- [ ] Seller dashboard UI untuk semua AI tools
- [ ] Tracking penggunaan AI per seller
- [ ] Content moderation AI (deteksi produk terlarang)
- [ ] Test: kualitas output, rate limiting, caching

---

## 🚚 Fase 4 — Logistics Network

> **Durasi:** 4 minggu
> **Tujuan:** Vendor logistik bisa daftar, diintegrasikan di checkout, tracking terpadu

### 4.1 — Logistics Vendor Registry

```typescript
interface LogisticsVendor {
  id: string
  name: string                          // "JNE", "J&T", "SiCepat", dll.
  type: 'national' | 'regional' | 'local' | 'instant'
  coverage: {
    provinces: string[]                 // Kode provinsi
    cities: string[]                    // Kode kota (opsional, lebih spesifik)
    isNationwide: boolean
  }
  services: LogisticsService[]
  tracking: {
    endpoint: string                    // https://api.vendor.com/tracking/{id}
    authType: 'api_key' | 'bearer' | 'none'
    latencyMs: number                   // Rata-rata latensi tracking API
  }
  pricing: {
    model: 'per_kg' | 'per_item' | 'flat'
    baseRates: Record<string, number>   // origin_province → base_rate
    calculator: string                  // endpoint kalkulasi ongkir
  }
  reputation: VendorReputationScore
  status: 'pending' | 'verified' | 'suspended'
}

interface LogisticsService {
  code: string                          // "REG", "YES", "OKE"
  name: string                          // "Regular", "Express", "Economy"
  maxWeightKg: number
  estimatedDays: { min: number; max: number }
  isCOD: boolean
  isInsurance: boolean
}
```

**Checklist:**
- [ ] Vendor registration flow (dashboard vendor)
- [ ] Dokumen verifikasi upload (legalitas, armada)
- [ ] Coverage area setup (peta interaktif)
- [ ] Service & pricing configuration
- [ ] Tracking API validation (test endpoint)
- [ ] Vendor dashboard (order masuk, earnings, performa)
- [ ] Pre-integrated vendor: JNE, J&T, SiCepat, Anteraja, Pos Indonesia

---

### 4.2 — Shipping Rate Calculator

```typescript
// Kalkulasi ongkir saat checkout

async function calculateShipping(
  origin: CityCode,
  destination: CityCode,
  weightGram: number,
  vendorIds: string[],
  env: Env
): Promise<ShippingOption[]> {

  // Cek cache KV dulu (TTL 1 jam)
  const cacheKey = `shipping:${origin}:${destination}:${weightGram}`
  const cached = await env.KV.get(cacheKey, 'json')
  if (cached) return cached

  // Query vendor yang cover rute ini
  const availableVendors = await getAvailableVendors(origin, destination, env)

  // Kalkulasi paralel ke semua vendor
  const results = await Promise.allSettled(
    availableVendors.map(v => v.calculateRate(origin, destination, weightGram))
  )

  const options = results
    .filter(r => r.status === 'fulfilled')
    .map(r => (r as PromiseFulfilledResult<ShippingRate>).value)
    .sort((a, b) => a.price - b.price)

  // Cache hasil
  await env.KV.put(cacheKey, JSON.stringify(options), { expirationTtl: 3600 })

  return options
}
```

**Checklist:**
- [ ] Kalkulasi ongkir paralel ke semua vendor
- [ ] KV caching per rute + berat
- [ ] Estimasi waktu tiba per layanan
- [ ] COD option support
- [ ] Asuransi pengiriman option
- [ ] Pilihan ongkir di UI checkout (sorted termurah)
- [ ] Vendor fallback jika API timeout

---

### 4.3 — Unified Tracking System

```typescript
// Tracking aggregator — normalisasi format dari semua vendor

interface TrackingEvent {
  timestamp: string
  status: UnifiedStatus      // enum yang sama untuk semua vendor
  description: string        // deskripsi dalam Bahasa Indonesia
  location?: string
  vendorRawStatus: string    // status asli dari vendor (untuk debugging)
}

type UnifiedStatus =
  | 'picked_up'        // Kurir pickup dari seller
  | 'at_origin_hub'    // Di gudang asal
  | 'in_transit'       // Dalam perjalanan antar kota
  | 'at_destination_hub' // Di gudang tujuan
  | 'out_for_delivery' // Dalam pengiriman terakhir
  | 'delivered'        // Terkirim
  | 'failed_delivery'  // Gagal kirim
  | 'returned'         // Dikembalikan ke seller

// Normalizer per vendor
const jneNormalizer = (raw: JNEStatus): UnifiedStatus => {
  const map: Record<string, UnifiedStatus> = {
    'PICKED UP': 'picked_up',
    'ON PROCESS': 'in_transit',
    'DELIVERED': 'delivered',
    // ...
  }
  return map[raw] ?? 'in_transit'
}
```

**Checklist:**
- [ ] Tracking API wrapper per vendor (JNE, J&T, SiCepat, dll.)
- [ ] Status normalization (semua vendor → unified status)
- [ ] Caching tracking per resi (TTL 10 menit)
- [ ] Webhook receiver dari vendor (push update)
- [ ] Fallback ke polling jika vendor tidak support webhook
- [ ] Buyer tracking page (real-time, update otomatis)
- [ ] Notifikasi buyer saat status berubah (push + email)
- [ ] Alert internal saat pengiriman terlambat > estimasi
- [ ] Test: normalizer untuk semua vendor, stale data handling

---

### 4.4 — Logistics Escrow Sync

```typescript
// Escrow release trigger dari tracking

// Ketika status menjadi 'delivered':
// 1. Tandai order sebagai 'delivered'
// 2. Set auto-confirm timer (3 hari)
// 3. Jika buyer konfirmasi manual → langsung release escrow
// 4. Jika buyer tidak respon 3 hari → auto-release

async function onDelivered(trackingId: string, env: Env) {
  const order = await getOrderByTracking(trackingId, env)

  await updateOrderStatus(order.id, 'delivered', env)

  // Set auto-release timer
  const autoReleaseAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  await updateEscrow(order.escrowId, { autoReleaseAt }, env)

  // Notifikasi buyer
  await sendNotification(order.buyerId, {
    type: 'order_delivered',
    orderId: order.id,
    message: 'Paket telah sampai! Konfirmasi penerimaan atau tunggu otomatis 3 hari.'
  }, env)
}
```

**Checklist:**
- [ ] Otomatis trigger status order dari tracking event
- [ ] Auto-release timer saat status 'delivered'
- [ ] Manual confirmation UI untuk buyer
- [ ] Dispute window saat paket delivered (3 hari)
- [ ] Test: timing auto-release, dispute window edge cases

---

## 📱 Fase 5 — Social & Live Commerce

> **Durasi:** 4 minggu
> **Tujuan:** Seller bisa live di platform sosial, buyer discover dan checkout via marketplace

### 5.1 — Live Session Detection

**Integrasi Platform:**

```typescript
// Instagram: Graph API Webhook untuk live events
// TikTok: TikTok Live API + Webhook
// YouTube: YouTube Data API v3 + Pub/Sub

// Live Session Schema
interface LiveSession {
  id: string
  sellerId: string
  platform: 'instagram' | 'tiktok' | 'youtube'
  platformStreamId: string
  streamUrl: string               // URL untuk join live
  status: 'scheduled' | 'live' | 'ended'
  title: string
  thumbnailUrl: string
  featuredProductIds: string[]    // Produk yang ditampilkan
  viewerCount: number
  startedAt: string
  endedAt: string | null
  analytics: {
    peakViewers: number
    totalViewers: number
    clickCount: number
    orderCount: number
    revenue: number
  }
}
```

**Seller Setup Live:**

```
1. Seller buka "Live Commerce" di dashboard
2. Pilih platform (Instagram/TikTok/YouTube)
3. Pilih produk yang akan ditampilkan (max 30)
4. Platform generate "Live Link" dan QR code
5. Seller mulai live di platform sosial
6. Marketplace auto-detect live session via webhook
7. Live session muncul di marketplace
```

**Checklist:**
- [ ] Instagram Live webhook integration
- [ ] TikTok Live API integration
- [ ] YouTube Live pub/sub integration
- [ ] Live session creation manual (seller input stream URL)
- [ ] Live page di marketplace (semua live aktif)
- [ ] Produk carousel saat buyer buka live
- [ ] Live session analytics real-time
- [ ] Test: webhook handling, auto-detection

---

### 5.2 — Push Notification System

**Channels:**

```typescript
// Web Push (via Service Worker — PWA)
// FCM (Firebase Cloud Messaging — Android native)
// APNs (Apple Push Notification — iOS native)
// Email (Resend — untuk notifikasi penting)
// In-app (badge + notification center)

interface NotificationPayload {
  recipientId: string
  recipientType: 'buyer' | 'seller' | 'logistics'
  type: NotificationType
  title: string
  body: string
  data: Record<string, string>   // Deep link data
  channels: ('push' | 'email' | 'inapp')[]
  priority: 'low' | 'normal' | 'high'
}

type NotificationType =
  | 'order_created' | 'order_paid' | 'order_shipped' | 'order_delivered'
  | 'escrow_released' | 'dispute_opened' | 'dispute_resolved'
  | 'seller_live_started'        // Seller favorit mulai live
  | 'price_drop'                 // Produk wishlist turun harga
  | 'back_in_stock'              // Produk wish list restock
  | 'new_review'                 // Seller dapat ulasan baru
  | 'trust_score_change'         // Trust score naik/turun
```

**Checklist:**
- [ ] Web Push subscription (Service Worker)
- [ ] FCM integration (Android)
- [ ] APNs integration (iOS via Capacitor)
- [ ] Notification center UI (in-app)
- [ ] Notification preferences per user
- [ ] Batch notification (seller live → notify semua follower)
- [ ] Notification analytics (open rate per type)
- [ ] Unsubscribe / opt-out per kategori notifikasi
- [ ] Test: delivery rate, batch performance

---

### 5.3 — PWA Full Implementation

**Service Worker Strategy:**

```javascript
// Caching strategy per resource type
const strategies = {
  // App shell: Cache First
  '/': 'cache-first',
  '/dashboard': 'cache-first',

  // API: Network First (dengan fallback cache offline)
  '/api/products': 'network-first',
  '/api/orders': 'network-first',

  // Gambar seller (CDN eksternal): Stale While Revalidate
  'https://cdn.seller.com': 'stale-while-revalidate',

  // Aset statik: Cache First dengan versi hash
  '*.js': 'cache-first',
  '*.css': 'cache-first',
}
```

**Offline Capabilities:**

| Fitur | Offline Behavior |
|-------|-----------------|
| Browsing produk | ✅ Cached pages tersedia |
| Keranjang | ✅ Tersimpan lokal, sync saat online |
| Order list | ✅ Cached order history |
| Tambah produk baru | ⏳ Queue, sync saat online |
| Checkout | ❌ Butuh koneksi (payment) |

**Checklist:**
- [ ] Service Worker dengan strategi caching yang tepat
- [ ] Offline fallback page yang informatif
- [ ] Background sync untuk aksi offline
- [ ] Install prompt (add to home screen)
- [ ] Splash screen + app icon semua ukuran
- [ ] Lighthouse PWA score > 90
- [ ] Share target API (share produk ke marketplace)
- [ ] File system access (upload gambar dari galeri)
- [ ] Test: offline scenarios, sync conflict resolution

---

## ⚡ Fase 6 — Scale & Hardening

> **Durasi:** 8 minggu
> **Tujuan:** Platform siap traffic tinggi, disaster recovery, monitoring grade produksi

### 6.1 — Load Testing

**Target Performa:**

| Endpoint | P50 | P95 | P99 | Throughput |
|----------|-----|-----|-----|-----------|
| `GET /products/:id` | 20ms | 50ms | 100ms | 10.000 RPS |
| `GET /search` | 50ms | 100ms | 200ms | 5.000 RPS |
| `GET /feed` | 30ms | 80ms | 150ms | 8.000 RPS |
| `POST /checkout` | 200ms | 500ms | 1s | 500 RPS |
| `GET /tracking/:id` | 100ms | 300ms | 500ms | 2.000 RPS |

**Load Testing Tools:**

```bash
# k6 untuk load test
k6 run --vus 1000 --duration 30m scripts/load-test-search.js

# Artillery untuk skenario kompleks
artillery run artillery-checkout-scenario.yml

# Grafana K6 Cloud untuk distributed load test
k6 cloud scripts/marketplace-full.js
```

**Skenario Test:**

```javascript
// k6 script: checkout concurrency test
export default function() {
  // 1. Login buyer
  const loginRes = http.post('/api/auth/login', { email, password })

  // 2. Add to cart
  http.post('/api/cart/add', { productId, quantity: 1 })

  // 3. Checkout (test concurrency — banyak buyer checkout produk sama)
  const checkoutRes = http.post('/api/checkout', { ... })

  // 4. Verifikasi: tidak ada overselling
  check(checkoutRes, { 'no oversell': r => r.status !== 409 || r.stock === 0 })
}
```

**Checklist:**
- [ ] Baseline performance benchmark semua endpoint
- [ ] Load test: normal traffic (1x)
- [ ] Stress test: 5x traffic
- [ ] Spike test: burst 10x traffic selama 5 menit
- [ ] Soak test: 2x traffic selama 24 jam
- [ ] Chaos test: matikan 1 region, validasi degradasi graceful
- [ ] Identify dan fix semua bottleneck
- [ ] Verifikasi tidak ada memory leak di Workers
- [ ] Test overselling prevention di bawah load tinggi

---

### 6.2 — Observability Stack

**Three Pillars of Observability:**

```
LOGS                    METRICS                 TRACES
─────                   ───────                 ──────
Cloudflare Logs    →    Cloudflare Analytics    Cloudflare Trace
Workers Logpush    →    Custom Metrics (R2)     OpenTelemetry
Error tracking     →    Business metrics        Distributed tracing
(Sentry)                (Grafana)               (Jaeger / Honeycomb)
```

**Structured Logging:**

```typescript
// Setiap request di Workers harus log structured JSON
const logger = {
  info: (msg: string, ctx: object) =>
    console.log(JSON.stringify({ level: 'info', msg, ...ctx, ts: Date.now() })),
  error: (msg: string, ctx: object, err?: Error) =>
    console.error(JSON.stringify({
      level: 'error', msg, ...ctx,
      error: err?.message, stack: err?.stack, ts: Date.now()
    }))
}

// Contoh penggunaan:
logger.info('checkout.initiated', {
  orderId, buyerId, itemCount, totalAmount, gateway, requestId
})
```

**Dashboard Monitoring (Grafana):**

```
Business Metrics:
├── Orders per minute (OPM)
├── Revenue per hour
├── Active buyers (last 15 min)
├── Checkout success rate
└── Escrow queue depth

Infrastructure:
├── Workers CPU time (P50/P95/P99)
├── R2 request rate + error rate
├── KV hit rate + latency
├── Queue depth + processing lag
└── Error rate per endpoint

Alerts (PagerDuty):
├── Error rate > 1% untuk 5 menit → WARNING
├── Error rate > 5% untuk 2 menit → CRITICAL
├── Checkout success rate < 95% → CRITICAL
├── R2 latency P99 > 500ms → WARNING
└── Escrow processing lag > 30 menit → CRITICAL
```

**Checklist:**
- [ ] Cloudflare Logpush ke storage (R2 atau Datadog)
- [ ] Sentry error tracking (Workers + frontend)
- [ ] Custom business metrics (KV counter → Grafana via R2 export)
- [ ] Uptime monitoring (BetterUptime / Checkly)
- [ ] PagerDuty alerting untuk critical incidents
- [ ] Dashboard Grafana lengkap (business + infra)
- [ ] Distributed tracing untuk checkout flow
- [ ] SLO dashboard (uptime, latency, error rate)
- [ ] Runbook per alert (apa yang dilakukan saat alert)

---

### 6.3 — Disaster Recovery

**Recovery Objectives:**

| Metric | Target |
|--------|--------|
| **RTO** (Recovery Time Objective) | < 15 menit |
| **RPO** (Recovery Point Objective) | < 5 menit data loss |
| **MTTR** (Mean Time to Recovery) | < 30 menit |

**Backup Strategy:**

```
R2 Data Backup:
├── Real-time: R2 Object Replication ke bucket backup
├── Daily: Full snapshot export ke secondary region
└── Weekly: Immutable archive (tidak bisa dihapus 1 tahun)

KV Data:
├── Hanya cache — dapat direbuild dari R2
└── Recovery: cold start dari R2 snapshot

D1 Database:
├── Automated backup setiap 1 jam
└── Point-in-time recovery (PITR) 30 hari
```

**Incident Response Playbook:**

```markdown
# Severity 1 (S1) — Platform Down

1. T+0: Alert diterima → PagerDuty membangunkan on-call
2. T+2: On-call acknowledge, buka war room (Slack/Discord)
3. T+5: Identifikasi root cause (logs, metrics, traces)
4. T+10: Apply fix atau rollback ke versi stabil
5. T+15: Verifikasi recovery
6. T+30: Status page update (Statuspage.io)
7. T+60: Post-mortem draft
8. T+72h: Post-mortem published (blameless)
```

**Checklist:**
- [ ] R2 Object Replication ke bucket backup (cross-region)
- [ ] Automated DR test setiap bulan
- [ ] Rollback procedure (< 5 menit ke versi sebelumnya)
- [ ] Status page (Statuspage.io atau Instatus)
- [ ] Incident response playbook (S1, S2, S3)
- [ ] Post-mortem template (blameless)
- [ ] Game day: simulasi incident S1 per kuartal
- [ ] On-call rotation yang sustainable (tidak burnout)

---

### 6.4 — Multi-Region & CDN Optimization

**Edge Caching Strategy:**

```
Request → Cloudflare Edge (300+ PoP global)
              │
    ┌─────────┴──────────┐
    │                    │
Cache Hit              Cache Miss
    │                    │
Return Cached       Worker Execution
Response            (< 50ms dari edge)
                         │
                    Update Cache
```

**Cache Rules:**

```typescript
// Cache Control per resource type
const cacheControl = {
  // Produk yang stabil: cache lama
  '/products/:id': 'public, max-age=300, stale-while-revalidate=60',

  // Feed rekomendasi: cache singkat (personalized)
  '/feed': 'private, max-age=30',

  // Search result: cache per query
  '/search': 'public, max-age=60, stale-while-revalidate=30',

  // Order & checkout: tidak boleh di-cache
  '/orders': 'private, no-store',
  '/checkout': 'private, no-store',

  // Aset statik dengan hash: cache selamanya
  '/_immutable/*': 'public, max-age=31536000, immutable',
}
```

**Checklist:**
- [ ] Cache rules dikonfigurasi optimal per endpoint
- [ ] Cache purge strategy saat data berubah
- [ ] Image optimization (Cloudflare Image Resizing)
- [ ] Lazy loading gambar seller dengan blur placeholder
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] Lighthouse performance score > 90 mobile
- [ ] Bundle size analysis + code splitting optimal
- [ ] Critical CSS inlining untuk above-the-fold

---

## 🏭 Fase 7 — Industry Grade

> **Durasi:** 18 minggu
> **Tujuan:** Compliance, security audit, SLA enterprise, siap untuk investor dan enterprise

### 7.1 — Security Hardening

**OWASP Top 10 Compliance:**

```
✅ A01 Broken Access Control    → RBAC di semua endpoint
✅ A02 Cryptographic Failures   → TLS 1.3, Argon2id, signed URLs
✅ A03 Injection                → Parameterized queries, Zod validation
✅ A04 Insecure Design          → Threat modeling per fitur
✅ A05 Security Misconfiguration → Hardened headers, CSP strict
✅ A06 Vulnerable Components    → Dependabot + SBOM
✅ A07 Auth Failures            → MFA, rate limiting, anomaly detection
✅ A08 Integrity Failures       → Webhook signature, HMAC
✅ A09 Logging Failures         → Centralized audit log
✅ A10 SSRF                     → URL whitelist untuk seller CDN
```

**Security Headers:**

```typescript
// Wajib di semua response dari Workers
const securityHeaders = {
  'Content-Security-Policy':
    "default-src 'self'; img-src * data:; connect-src 'self' https://api.anthropic.com",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}
```

**Penetration Testing:**

```
Internal:
├── DAST: OWASP ZAP automated scan (setiap release)
├── SAST: Semgrep static analysis (setiap PR)
└── Secret scanning: TruffleHog (setiap commit)

External:
├── Pentest awal oleh perusahaan independen (sebelum launch)
├── Bug bounty program (post-launch)
└── Annual security audit
```

**Checklist:**
- [ ] RBAC (Role-Based Access Control) di semua endpoint
- [ ] Multi-Factor Authentication untuk seller dan admin
- [ ] Security headers semua response
- [ ] Content Security Policy ketat
- [ ] Input validation di SEMUA endpoint (Zod)
- [ ] SQL injection prevention (meski pakai R2, validasi tetap perlu)
- [ ] SSRF prevention (URL allowlist untuk seller CDN)
- [ ] Audit log immutable (semua aksi sensitif)
- [ ] Dependabot + SBOM (Software Bill of Materials)
- [ ] Bug bounty program
- [ ] External penetration test
- [ ] Remediasi semua temuan pentest

---

### 7.2 — PCI DSS Compliance

> Wajib untuk platform yang menangani data kartu pembayaran

**Pendekatan: Minimal Scope PCI DSS**

```
Strategi: Gunakan Payment Gateway sebagai PCI scope holder
          Marketplace TIDAK menyimpan data kartu

Scope PCI Marketplace:
├── SAQ-A (Self-Assessment Questionnaire A)
│   └── Validasi bahwa marketplace tidak menyimpan/proses kartu
├── Tokenization wajib (kartu → token dari gateway)
└── Webhook data: tidak pernah berisi data kartu lengkap
```

**Checklist:**
- [ ] Pastikan ZERO kartu data tersimpan di R2/KV/D1
- [ ] Tokenization menggunakan gateway (Midtrans/Stripe token)
- [ ] TLS 1.2+ untuk semua komunikasi payment
- [ ] Network segmentation untuk payment workers
- [ ] Audit log semua akses ke payment data
- [ ] SAQ-A self assessment tahunan
- [ ] Vulnerability scan quarterly (ASV scan)

---

### 7.3 — SOC 2 Type II

> Untuk kepercayaan enterprise dan investor

**Trust Service Criteria:**

```
Security (CC):
├── CC6: Logical and Physical Access Controls
├── CC7: System Operations
├── CC8: Change Management
└── CC9: Risk Mitigation

Availability (A):
└── A1: Availability performance and monitoring

Confidentiality (C):
└── C1: Confidentiality of information

Processing Integrity (PI):
└── PI1: Completeness, accuracy, timeliness

Privacy (P):
└── P1-P8: Personal data collection to disposal
```

**Timeline SOC 2:**

```
Bulan 1-3:   Gap assessment → remediation
Bulan 4-6:   Evidence collection (audit period mulai)
Bulan 7-9:   Audit period berjalan
Bulan 10:    Auditor review
Bulan 11-12: SOC 2 Type II report issued
```

**Tools:**
- **Vanta** atau **Drata** — compliance automation
- **Tugboat Logic** — evidence collection
- Auditor: Deloitte / KPMG / BDO

**Checklist:**
- [ ] Vendor risk management program
- [ ] Employee security training (quarterly)
- [ ] Access review (quarterly)
- [ ] Change management process
- [ ] Incident response program
- [ ] Business continuity plan
- [ ] Data classification policy
- [ ] Retention and disposal policy

---

### 7.4 — OJK & Regulasi Indonesia

> Untuk operasi legal di Indonesia

**Regulasi Yang Relevan:**

| Regulasi | Kewajiban |
|----------|-----------|
| **UU ITE** | Konten, data pribadi, transaksi elektronik |
| **PP 71/2019** | PSTE (Penyelenggara Sistem Transaksi Elektronik) |
| **Permendag 31/2023** | Marketplace wajib daftar PSE ke Kominfo |
| **UU PDP (2022)** | Perlindungan data pribadi, mirip GDPR |
| **OJK (jika escrow)** | Izin layanan keuangan untuk escrow |
| **BI (PJSP)** | Jika memproses pembayaran sendiri |

**Checklist:**
- [ ] Daftar PSE ke Kominfo (wajib, atau kena blokir)
- [ ] Privacy Policy + ToS dalam Bahasa Indonesia
- [ ] Mekanisme persetujuan pengumpulan data (consent)
- [ ] Hak pengguna: akses, koreksi, hapus data pribadi
- [ ] Data residency: data WNI di server dalam negeri (atau cek regulasi)
- [ ] Laporan berkala ke OJK (jika ada aktivitas keuangan)
- [ ] Konsultasi legal dengan firma hukum IT/fintech Indonesia

---

### 7.5 — SLA & Uptime Commitment

**SLA Tiers:**

```
Tier FREE (Buyer):
└── Best effort, no SLA commitment

Tier SELLER (Rp60rb/bulan):
├── Uptime: 99.9% (8.7 jam downtime/tahun)
├── Support: Email, respon 24 jam
└── Incident notification dalam 30 menit

Tier ENTERPRISE (custom):
├── Uptime: 99.95% (4.4 jam downtime/tahun)
├── Support: Email + live chat, respon 4 jam
├── Dedicated account manager
├── SLA penalty (kredit jika melanggar)
└── Custom onboarding dan integrasi
```

**Uptime Monitoring:**

```yaml
# Checkly: synthetic monitoring
checks:
  - name: Homepage Load
    type: browser
    url: https://marketplace.id
    frequency: 1 minute
    alert_threshold: 2 failures in 3 minutes

  - name: Search API
    type: api
    url: https://api.marketplace.id/search?q=test
    frequency: 30 seconds
    assertions:
      - status: 200
      - responseTime: < 500

  - name: Checkout Flow
    type: browser
    frequency: 5 minutes
    steps:
      - navigate to product page
      - add to cart
      - proceed to checkout
      - assert checkout page loaded
```

**Checklist:**
- [ ] Status page publik (Statuspage.io)
- [ ] Uptime monitoring setiap 30 detik
- [ ] Synthetic transaction monitoring (checkout flow)
- [ ] SLA dashboard untuk seller
- [ ] Automatic credit calculation saat SLA breach
- [ ] Quarterly SLA review dengan top seller

---

### 7.6 — Developer API & Ecosystem

**Public API untuk Third-Party:**

```yaml
# OpenAPI Spec tersedia di: https://api.marketplace.id/openapi.json

endpoints:
  /v1/products:
    - GET    → List produk (dengan auth API key)
    - POST   → Buat produk (seller API key)

  /v1/orders:
    - GET    → List order seller/buyer

  /v1/webhooks:
    - POST   → Register webhook endpoint
    - DELETE → Unregister webhook

  /v1/analytics:
    - GET    → Analytics data seller

# Rate limits:
# Free tier: 100 req/menit
# Seller tier: 1.000 req/menit
# Enterprise: Custom
```

**Webhook Events (semua):**

```
order.created           order.paid             order.shipped
order.delivered         order.completed        order.cancelled
order.disputed          dispute.resolved
escrow.held             escrow.released        escrow.refunded
seller.verified         seller.trust_changed
product.approved        product.suspended
live.started            live.ended
payment.success         payment.failed         payment.refunded
shipment.updated        shipment.delivered     shipment.failed
```

**Checklist:**
- [ ] Public API dengan versioning (v1, v2)
- [ ] OpenAPI 3.1 spec auto-generated
- [ ] Developer portal (dokumentasi interaktif)
- [ ] API key management (buat, rotasi, revoke)
- [ ] Webhook management UI
- [ ] SDK resmi: JavaScript/TypeScript, Python
- [ ] Postman collection publik
- [ ] API changelog dan deprecation policy
- [ ] Rate limiting per API key dengan headers
- [ ] Sandbox environment untuk developer

---

## 📐 Standar Teknis Per Layer

### Code Quality Standards

```typescript
// Wajib di setiap PR:

// 1. TypeScript strict mode (tidak ada any implisit)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}

// 2. Fungsi tidak lebih dari 50 baris
// 3. File tidak lebih dari 300 baris
// 4. Cyclomatic complexity max 10
// 5. Test coverage minimum per layer:
//    - Core business logic: 90%
//    - API handlers: 80%
//    - UI components: 70%
//    - Utilities: 95%
```

### API Design Standards

```
REST Conventions:
├── Gunakan noun untuk resource (/products, bukan /getProducts)
├── Plural untuk collection (/products)
├── Nested resource maksimal 2 level (/sellers/:id/products)
├── HTTP status code yang tepat (200, 201, 400, 401, 403, 404, 409, 422, 429, 500)
├── Error response konsisten:
│   { "error": { "code": "PRODUCT_NOT_FOUND", "message": "...", "requestId": "..." } }
├── Pagination dengan cursor (bukan offset)
├── Sorting: ?sort=price:asc,name:desc
├── Filtering: ?filter[category]=fashion&filter[price][gte]=100000
└── Versioning via URL prefix /v1/, /v2/
```

### Database / Storage Patterns

```
R2 Key Naming Convention:
├── metadata/sellers/{sellerId}/profile.json
├── metadata/sellers/{sellerId}/products/{productId}.json
├── metadata/orders/{orderId}.json
├── metadata/escrow/{escrowId}.json
├── metadata/logistics/{vendorId}/profile.json
├── analytics/sellers/{sellerId}/daily/{YYYY-MM-DD}.json
├── search/shards/{0-15}/{productId}.json
└── snapshots/{YYYY-MM-DD}/full-catalog.json.gz

KV Key Naming Convention:
├── session:{refreshToken}             TTL: 30 days
├── cache:search:{queryHash}           TTL: 5 menit
├── cache:product:{productId}          TTL: 5 menit
├── cache:seller:{sellerId}            TTL: 10 menit
├── lock:stock:{productId}:{variantSku} TTL: 10 menit
├── ratelimit:{ip}:{endpoint}          TTL: 15 menit
└── trust:{sellerId}                   TTL: 1 jam
```

---

## ✅ Definition of Done Per Fase

### Fase 0 — Done When:
- [ ] `pnpm dev` berjalan dalam < 30 detik di mesin baru
- [ ] `pnpm test` semua pass (0 failures)
- [ ] CI/CD pipeline hijau dari awal
- [ ] 3 ADR pertama terdokumentasi
- [ ] Onboarding developer baru < 1 jam

### Fase 1 — Done When:
- [ ] Seller dapat daftar, verifikasi, dan listing 1 produk
- [ ] Produk muncul di halaman kategori
- [ ] Semua endpoint auth memiliki test coverage > 90%
- [ ] CDN validation berjalan dengan benar

### Fase 2 — Done When:
- [ ] Buyer dapat checkout 1 produk dari 1 seller sampai selesai
- [ ] Uang masuk ke escrow (dengan gateway test)
- [ ] Seller dapat konfirmasi order dan input resi
- [ ] Escrow auto-release berjalan (ditest dengan time-travel)

### Fase 3 — Done When:
- [ ] Search P95 < 100ms untuk 1.000 produk
- [ ] Rekomendasi berbeda untuk buyer baru vs buyer veteran
- [ ] Trust score update nightly dan mempengaruhi search ranking
- [ ] Seller analytics menampilkan data akurat

### Fase 4 — Done When:
- [ ] Minimal 3 vendor logistik terintegrasi
- [ ] Tracking terpadu menampilkan status yang dinormalisasi
- [ ] Escrow ter-release otomatis saat status 'delivered'

### Fase 5 — Done When:
- [ ] Seller bisa setup live dan produk muncul di marketplace
- [ ] Push notification terkirim ke buyer yang follow seller
- [ ] PWA installable di Android dan iOS

### Fase 6 — Done When:
- [ ] Platform tahan 5.000 concurrent checkout tanpa error
- [ ] Recovery time dari simulasi S1 incident < 15 menit
- [ ] Lighthouse score > 90 di semua halaman utama
- [ ] Semua alert PagerDuty terdefinisi dan teruji

### Fase 7 — Done When:
- [ ] External pentest zero critical findings
- [ ] SOC 2 Type II report dalam progress
- [ ] PSE terdaftar di Kominfo
- [ ] SLA 99.95% tercapai dalam 3 bulan terakhir
- [ ] Developer API public dengan dokumentasi lengkap

---

## 💸 Tech Debt & Refactor Budget

> Aturan: **20% kapasitas sprint** selalu dialokasikan untuk tech debt

### Tracking Tech Debt

```markdown
# Tech Debt Register

| ID     | Deskripsi                          | Severity | Fase Dibuat | Target |
|--------|------------------------------------|----------|-------------|--------|
| TD-001 | Search menggunakan linear scan R2  | HIGH     | Fase 1      | Fase 3 |
| TD-002 | Analytics tanpa stream, batch only | MEDIUM   | Fase 3      | Fase 6 |
| TD-003 | Shipping rate hardcoded dummy      | HIGH     | Fase 2      | Fase 4 |
| TD-004 | No integration tests untuk escrow  | HIGH     | Fase 2      | Fase 3 |
```

### Refactor Milestones

| Milestone | Target Fase | Scope |
|-----------|-------------|-------|
| Search index ke dedicated structure | Fase 3 | Search performance |
| Event sourcing untuk order | Fase 5 | Audit trail, replay |
| Separate read/write Workers | Fase 6 | Performance |
| Full integration test suite | Fase 4 | Reliability |

---

## 🧪 Testing Strategy

### Test Pyramid

```
         /\
        /  \
       / E2E \          ← 10% (Playwright, test flow kritis)
      /────────\
     / Integration\     ← 20% (API tests, Worker integration)
    /──────────────\
   /   Unit Tests   \   ← 70% (logic, validation, calculation)
  /──────────────────\
```

### Test Categories

```typescript
// Unit Test (Vitest)
// Cakupan: business logic, kalkulasi, validation, utilities
describe('trust score calculation', () => {
  it('mengurangi skor saat dispute rate tinggi', () => {
    const score = calculateTrustScore({ disputeRate: 0.15, ... })
    expect(score).toBeLessThan(50)
  })
})

// Integration Test (Miniflare + Vitest)
// Cakupan: Worker handler, R2 operations, KV operations
describe('POST /products', () => {
  it('membuat produk dan menyimpan ke R2', async () => {
    const res = await worker.fetch('/products', { method: 'POST', body: ... })
    expect(res.status).toBe(201)
    const stored = await env.R2.get(`metadata/products/${productId}.json`)
    expect(stored).not.toBeNull()
  })
})

// E2E Test (Playwright)
// Cakupan: user flows kritis
test('buyer dapat checkout produk dari seller', async ({ page }) => {
  await page.goto('/products/sepatu-nike-air-max')
  await page.click('[data-testid="add-to-cart"]')
  await page.goto('/checkout')
  await page.fill('[data-testid="address"]', 'Jl. Sudirman No. 1')
  await page.click('[data-testid="pay-now"]')
  await expect(page.locator('[data-testid="order-confirmed"]')).toBeVisible()
})
```

---

## 📊 Observability Roadmap

| Fase | Observability yang Ditambahkan |
|------|-------------------------------|
| **Fase 0** | Basic logging, Sentry error tracking |
| **Fase 1** | Request/response logging, auth audit log |
| **Fase 2** | Payment audit log, escrow state log, business metrics dasar |
| **Fase 3** | Search analytics, recommendation metrics, trust score history |
| **Fase 4** | Logistics tracking SLA metrics, delivery success rate |
| **Fase 5** | Live session analytics, push notification delivery rate |
| **Fase 6** | Full distributed tracing, Grafana dashboards, PagerDuty alerting |
| **Fase 7** | SOC 2 audit log, compliance reporting, SLA dashboard |

---

## 🔐 Security Milestones

| Fase | Security Milestone |
|------|--------------------|
| **Fase 0** | Secret management, `.env` tidak di-commit, Dependabot aktif |
| **Fase 1** | Argon2id password hash, JWT implementation, rate limiting |
| **Fase 2** | Payment webhook signature verification, escrow audit trail |
| **Fase 3** | Input sanitization di semua AI input, moderation pipeline |
| **Fase 4** | Seller CDN URL validation (anti-SSRF), logistics API auth |
| **Fase 5** | Push notification auth, Web Push VAPID key rotation |
| **Fase 6** | OWASP ZAP automated scan, penetration test internal |
| **Fase 7** | External pentest, bug bounty, SOC 2, PCI DSS SAQ-A |

---

## 👥 Tim & Tanggung Jawab

### Rekomendasi Struktur Tim Per Fase

| Fase | Tim Minimum | Tim Ideal |
|------|-------------|-----------|
| 0-1 | 2 fullstack dev | 3 dev + 1 designer |
| 2-3 | 3 dev | 4 dev + 1 QA + 1 designer |
| 4-5 | 4 dev | 5 dev + 1 QA + 1 DevOps |
| 6-7 | 5 dev + 1 DevOps | 7 dev + 2 QA + 1 DevOps + 1 Security |

### Ownership Per Modul

| Modul | Owner | Backup |
|-------|-------|--------|
| Auth & Identity | Backend Dev 1 | Backend Dev 2 |
| Checkout & Escrow | Backend Dev 2 | Backend Dev 1 |
| Search & Recommendation | Backend Dev 3 | Backend Dev 2 |
| Logistics | Backend Dev 4 | Backend Dev 3 |
| Frontend (Storefront) | Frontend Dev 1 | Frontend Dev 2 |
| Seller Dashboard | Frontend Dev 2 | Frontend Dev 1 |
| DevOps & Infrastructure | DevOps | Backend Dev 1 |
| Security | Security Eng | DevOps |

---

## 📌 Quick Reference

### Perintah Penting

```bash
# Development
pnpm dev                    # Start semua services
pnpm dev:workers            # Workers only
pnpm dev:web                # Frontend only

# Testing
pnpm test                   # Semua unit test
pnpm test:integration       # Integration test (Miniflare)
pnpm test:e2e               # E2E (Playwright, butuh browser)
pnpm test:load              # Load test (k6)

# Build & Deploy
pnpm build                  # Build semua packages
pnpm deploy:staging         # Deploy ke staging
pnpm deploy:production      # Deploy ke production (requires tag)

# Maintenance
pnpm db:migrate             # Jalankan D1 migrations
pnpm db:seed                # Seed data development
pnpm search:reindex         # Rebuild search index
pnpm analytics:aggregate    # Trigger manual aggregation
```

### Konvensi Nama Branch

```
main          → production-ready code
develop       → integrasi semua feature
feat/xxx      → feature baru
fix/xxx       → bug fix
chore/xxx     → maintenance, dependency update
docs/xxx      → dokumentasi
hotfix/xxx    → urgent fix untuk production
```

### Conventional Commits

```
feat(checkout): tambah dukungan GoPay via Midtrans
fix(escrow): perbaiki auto-release tidak terpicu saat weekend
chore(deps): update workers-types ke 4.20241224.0
docs(api): tambah contoh webhook payload order.shipped
perf(search): kurangi R2 read call dengan smart caching
test(trust): tambah test untuk seller baru (cold start)
refactor(auth): pisahkan refresh token logic ke service
```

---

<div align="center">

**Marketplace 3.0 Developer Roadmap**

*Dari monorepo kosong hingga platform commerce kelas industri.*

Total estimasi: **52 minggu** untuk tim kecil yang focused.

`Foundation` → `Commerce` → `Intelligence` → `Scale` → `Industry Grade`

</div>
