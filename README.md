# 🌱 Sirkula Backend

Platform aksi hijau berbasis AI untuk mendorong partisipasi warga dalam pengelolaan sampah, penanaman pohon, dan konsumsi produk ramah lingkungan.

## 📋 Deskripsi

**Sirkula** adalah backend API yang mendukung platform eco-friendly dengan fitur:

- 🤖 **AI-Powered Verification** - Verifikasi otomatis aksi hijau menggunakan Google Generative AI
- 🔐 **Authentication** - Google OAuth & Email OTP
- 🎯 **Gamification** - Sistem poin, badge, dan leaderboard
- 🎁 **Reward System** - Penukaran poin ke voucher UMKM hijau
- 📊 **Dashboard & Reporting** - Statistik aksi hijau per kelurahan/RT/RW
- 🔗 **Webhook Integration** - Daily reward distribution via external scheduler

## 👥 Segmen Pengguna

| Role           | Fitur Utama                                                     |
| -------------- | --------------------------------------------------------------- |
| **Warga**      | Upload aksi hijau, kumpulkan poin, tukar reward, ikut challenge |
| **UMKM Hijau** | Buat campaign voucher, lihat statistik penukaran                |
| **DLH**        | Dashboard agregat, export laporan SDGs                          |
| **Admin**      | Manage user, konfigurasi AI & poin                              |

## 🌿 Kategori Aksi Hijau (AI Detection)

| Kategori              | Contoh Aksi                       | Poin       |
| --------------------- | --------------------------------- | ---------- |
| **Green Waste**       | Pilah sampah organik/anorganik/B3 | 30-70 poin |
| **Green Home**        | Tanam pohon, urban farming        | 40-60 poin |
| **Green Consumption** | Belanja produk UMKM organik       | 20-30 poin |
| **Green Community**   | Kerja bakti, bersih sungai        | Bonus poin |

## 🔄 Flow Aplikasi

```
1. User upload foto/video aksi hijau
2. AI menganalisis & memberikan skor (0-100)
3. Backend konversi skor → poin
4. Poin dikumpulkan untuk reward UMKM
```

## 🏆 Daily Reward System

Top 3 pengguna dengan poin tertinggi mendapatkan bonus harian:

| Peringkat | Bonus Poin |
| --------- | ---------- |
| 🥇 #1     | +15 poin   |
| 🥈 #2     | +10 poin   |
| 🥉 #3     | +5 poin    |

### Webhook Endpoint

Daily reward didistribusikan melalui webhook yang dapat dipanggil oleh external scheduler (cron job, GitHub Actions, dll):

```bash
POST /leaderboard/distribute-reward
Headers:
  x-sha-key: <SHA_WEBHOOK_SECRET>
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Daily reward distributed successfully",
  "data": {
    "date": "2025-12-03",
    "timestamp": "2025-12-03T16:59:00.000Z",
    "winners": [
      {
        "userId": "...",
        "name": "User Name",
        "rank": 1,
        "bonusPoints": 15,
        "newTotalPoints": 150
      }
    ],
    "totalBonusDistributed": 30
  }
}
```

## ⚙️ Environment Variables

Buat file `.env` di root directory:

```env
# ===========================================
# DATABASE
# ===========================================
DATABASE_URL="postgresql://user:password@localhost:5432/sirkula?schema=public"

# ===========================================
# APPLICATION
# ===========================================
PORT=3000
NODE_ENV=development

# ===========================================
# JWT AUTHENTICATION
# ===========================================
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# ===========================================
# GOOGLE OAUTH
# ===========================================
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend URL for OAuth callback
FRONTEND_URL=http://localhost:3000
GOOGLE_CALLBACK_PATH=/auth/callback

# ===========================================
# GOOGLE GENERATIVE AI (for action verification)
# ===========================================
GOOGLE_GENAI_API_KEY=your_google_genai_api_key

# ===========================================
# CLOUDINARY (media storage)
# ===========================================
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ===========================================
# EMAIL (Gmail with App Password)
# ===========================================
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_16_digit_app_password

# ===========================================
# WEBHOOK AUTHENTICATION
# ===========================================
# Secret key for webhook endpoints (daily reward distribution)
SHA_WEBHOOK_SECRET=your_sha_webhook_secret
```

### 📧 Setup Gmail App Password

1. Buka Google Account Settings
2. Security → 2-Step Verification (aktifkan jika belum)
3. App passwords → Buat app password baru
4. Copy 16-digit password ke `EMAIL_APP_PASSWORD`

### 🤖 Setup Google Generative AI

1. Buka [Google AI Studio](https://aistudio.google.com/)
2. Buat API Key baru
3. Copy ke `GOOGLE_GENAI_API_KEY`

### 🔐 Setup Webhook Secret

1. Generate random string yang aman untuk `SHA_WEBHOOK_SECRET`
2. Gunakan secret yang sama di external scheduler untuk header `x-sha-key`

## 🚀 Instalasi

```bash
# Install dependencies
$ pnpm install

# Generate Prisma client
$ npx prisma generate

# Run migrations
$ npx prisma migrate dev

# Seed database (DLH & Admin accounts)
$ pnpm db:seed

# Development mode
$ pnpm run start:dev

# Production mode
$ pnpm run start:prod
```

## 🌱 Database Seeding

Seed database dengan akun DLH dan Admin default:

```bash
$ pnpm db:seed
```

**Default Accounts:**

| Role  | Email            | Password    |
| ----- | ---------------- | ----------- |
| ADMIN | admin@sirkula.id | Admin123456 |
| DLH   | dlh@sirkula.id   | Dlh123456   |

⚠️ **Ganti password default di production!**

## 🧪 Testing

```bash
# Unit tests
$ pnpm run test

# E2E tests
$ pnpm run test:e2e

# Test coverage
$ pnpm run test:cov
```

## 📁 Struktur Project

```
src/
├── commons/          # Decorators, Guards, Interceptors
│   ├── decorators/       # Custom decorators
│   ├── guards/           # Auth guards (JWT, Webhook, Roles)
│   ├── helpers/          # Helper functions
│   ├── interceptors/     # Response interceptors
│   └── strategies/       # Passport strategies
├── config/           # Configuration module
├── database/         # Prisma database service
├── domains/          # Business domains
│   ├── green-waste-ai/   # AI verification service
│   ├── leaderboard/      # Leaderboard, ranking & daily reward webhook
│   ├── user/             # User management & auth
│   └── voucher/          # Voucher & rewards
└── libs/             # External integrations
    ├── cloudinary/       # Media upload
    ├── google-genai/     # AI verification
    ├── mailer/           # Email service
    └── scheduler/        # (Deprecated) Cron jobs

prisma/
├── schema.prisma     # Database schema
├── seed.ts           # Database seeder
└── migrations/       # Migration files
```

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + Google OAuth
- **AI**: Google Generative AI
- **Storage**: Cloudinary
- **Email**: Nodemailer (Gmail)

## 📄 License

[MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE)
