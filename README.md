# PANTAU+62 — AI Smart City Monitoring Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)]()
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

Platform berbasis AI untuk monitoring, analisis, prediksi, dan penanganan masalah publik secara real-time di Indonesia.

![PANTAU+62 Dashboard](https://via.placeholder.com/800x400/020817/06b6d4?text=PANTAU%2B62+Dashboard)

## ✨ Features

### 🤖 AI-Powered System
- **Smart Scoring**: AI menghitung prioritas laporan berdasarkan keyword, lokasi, kategori, dan foto
- **Image Analysis**: Deteksi otomatis kategori dan severity dari foto yang diupload
- **Recommendations**: AI memberikan rekomendasi tindakan untuk setiap laporan

### 📊 Real-time Dashboard
- **Live Statistics**: Total laporan, pending, processing, resolved
- **Interactive Charts**: Trend mingguan, distribusi per kategori
- **Priority Alerts**: Notifikasi real-time untuk laporan prioritas tinggi

### 🗺️ Interactive Maps
- **Leaflet Integration**: Visualisasi laporan di peta real-time
- **Location Picker**: Drag & drop marker untuk pilih lokasi
- **Reverse Geocoding**: Auto-detect alamat lengkap dari koordinat

### 🔐 Role-Based Access
- **User**: Submit laporan, tracking status
- **Admin**: Full access ke dashboard, reports management, analytics

### 📱 Responsive Design
- Mobile-first approach
- Smooth animations dengan Framer Motion
- Dark mode UI dengan glassmorphism effect

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Animation**: Framer Motion
- **Maps**: Leaflet + React Leaflet
- **Charts**: Recharts
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Deployment**: Vercel-ready

## 📦 Installation

### Prerequisites
- Node.js 20+ 
- npm or yarn
- Supabase account

### Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/pantau62.git
cd pantau62

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
# Copy content from lib/supabase/complete-fix.sql
# Run in Supabase SQL Editor

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Admin Registration (Server-side only)
ADMIN_SECRET_KEY=your_secure_random_key
```

### Database Setup

1. Create Supabase project
2. Run SQL from `lib/supabase/complete-fix.sql`
3. Create admin user:

```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your@email.com';
```

## 👤 Creating Admin Account

### Option 1: SQL (Fastest)
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
```

### Option 2: Admin Register Page
1. Go to `/auth/admin-register`
2. Enter secret key (from `.env.local`)
3. Complete registration

### Option 3: Debug Page (Development Only)
1. Go to `/debug-role`
2. Click "Set: admin"
3. Logout and login again

## 📁 Project Structure

```
pantau62/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── report/            # Report submission
│   └── my-reports/        # User's reports
├── components/
│   ├── admin/             # Admin components
│   ├── landing/           # Landing page sections
│   ├── map/               # Map components
│   ├── report/            # Report form
│   └── ui/                # Reusable UI components
├── lib/
│   ├── supabase/          # Supabase client & schema
│   ├── ai-scoring.ts      # AI scoring logic
│   ├── location.ts        # Geocoding utilities
│   └── utils.ts           # Helper functions
├── types/                 # TypeScript definitions
└── middleware.ts          # Route protection

```

## 🛡️ Security

- ✅ Server-side middleware protection
- ✅ Row Level Security (RLS) policies
- ✅ Environment variable validation
- ✅ Admin secret key on server-side only
- ✅ Input sanitization
- ✅ HTTPS enforced (production)

## 🧪 Testing

```bash
# Type checking
npm run build

# Linting
npm run lint
```

## 📈 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/pantau62)

1. Click button above
2. Connect your GitHub repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_SECRET_KEY`
4. Deploy!

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Radix UI](https://www.radix-ui.com/) - Unstyled UI components
- [Leaflet](https://leafletjs.com/) - Interactive maps
- [Framer Motion](https://www.framer.com/motion/) - Animation library

## 📞 Support

For support, email support@pantau62.id or open an issue on GitHub.

---

**Made with ❤️ for Indonesia's Smart Cities**
