# 🌱 Impact2Action Backend

Platform aksi hijau berbasis AI untuk mendorong partisipasi warga dalam pengelolaan sampah, penanaman pohon, dan konsumsi produk ramah lingkungan.

## 📋 Deskripsi

**Impact2Action** adalah backend API yang mendukung platform eco-friendly dengan fitur:

- 🤖 **AI-Powered Verification** - Verifikasi otomatis aksi hijau menggunakan Google Generative AI
- 🔐 **Authentication** - Google OAuth & Email OTP
- 🎯 **Gamification** - Sistem poin, badge, dan leaderboard
- 🎁 **Reward System** - Penukaran poin ke voucher UMKM hijau
- 📊 **Dashboard & Reporting** - Statistik aksi hijau per kelurahan/RT/RW

## 👥 Segmen Pengguna

| Role                | Fitur Utama                                                     |
| ------------------- | --------------------------------------------------------------- |
| **Warga**           | Upload aksi hijau, kumpulkan poin, tukar reward, ikut challenge |
| **UMKM Hijau**      | Buat campaign voucher, lihat statistik penukaran                |
| **Bank Sampah**     | Validasi setoran, dashboard tonase sampah                       |
| **Admin Kelurahan** | Dashboard agregat, export laporan SDGs                          |
| **Super Admin**     | Manage user, konfigurasi AI & poin                              |

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

## ⚙️ Environment Variables

Buat file `.env` di root directory:

```env
# ===========================================
# DATABASE
# ===========================================
DATABASE_URL="postgresql://user:password@localhost:5432/impact2action?schema=public"

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

## 🚀 Instalasi

```bash
# Install dependencies
$ pnpm install

# Generate Prisma client
$ npx prisma generate

# Run migrations
$ npx prisma migrate dev

# Development mode
$ pnpm run start:dev

# Production mode
$ pnpm run start:prod
```

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
├── config/           # Configuration module
├── database/         # Prisma database service
├── domains/          # Business domains
│   ├── green-waste-ai/   # AI verification service
│   ├── leaderboard/      # Leaderboard & ranking
│   ├── user/             # User management
│   └── voucher/          # Voucher & rewards
└── libs/             # External integrations
    ├── cloudinary/       # Media upload
    ├── google-genai/     # AI verification
    ├── mailer/           # Email service
    └── scheduler/        # Cron jobs
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
