# 📤 Panduan Upload PANTAU+62 ke GitHub

## 🎯 Langkah Cepat

### 1️⃣ Buat Repository di GitHub
1. Buka https://github.com/new
2. Repository name: `pantau62`
3. Description: `AI Smart City Monitoring Platform`
4. Public/Private: Pilih sesuai kebutuhan
5. ❌ JANGAN centang "Add a README file"
6. Klik **Create repository**

### 2️⃣ Upload dari Terminal

Buka terminal di folder project ini, lalu jalankan:

```bash
# Inisialisasi git (jika belum)
git init

# Set username dan email (ganti dengan milik kamu)
git config user.name "Nama Kamu"
git config user.email "email@kamu.com"

# Tambahkan semua file
git add .

# Commit
git commit -m "feat: PANTAU+62 Smart City Platform - Initial commit"

# Tambahkan remote (GANTI username dan repository-name!)
git remote add origin https://github.com/username/pantau62.git

# Set branch ke main
git branch -M main

# Push ke GitHub
git push -u origin main
```

### 3️⃣ Jika Diminta Login

**Username:** username GitHub kamu  
**Password:** Gunakan **Personal Access Token** (bukan password biasa)

---

## 🔑 Cara Membuat Personal Access Token

1. GitHub → **Settings** → **Developer settings**
2. **Personal access tokens** → **Tokens (classic)**
3. **Generate new token (classic)**
4. Centang **repo** (semua)
5. **Generate token**
6. **COPY TOKEN** (hanya muncul sekali!)
7. Gunakan sebagai password saat `git push`

---

## 🔄 Update Project di Masa Depan

Setelah upload pertama kali, untuk update selanjutnya:

```bash
# Tambahkan perubahan
git add .

# Commit dengan pesan
git commit -m "feat: tambah fitur baru"

# Push ke GitHub
git push
```

---

## ✅ Verifikasi Upload Berhasil

1. Buka repository di GitHub
2. Pastikan semua file sudah ada
3. README.md akan otomatis ditampilkan
4. Cek apakah .env.local TIDAK ter-upload (harus di-ignore)

---

## 🚨 Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/username/pantau62.git
```

### Error: "failed to push"
```bash
git pull origin main --rebase
git push -u origin main
```

### Error: "Permission denied"
- Pastikan Personal Access Token sudah dibuat
- Pastikan token memiliki scope **repo**
- Gunakan token sebagai password (bukan password GitHub)

---

## 📝 Catatan Penting

✅ File yang DI-UPLOAD:
- Semua source code (app/, components/, lib/, dll)
- README.md
- package.json
- .env.example (template)
- LICENSE

❌ File yang TIDAK DI-UPLOAD (sudah di .gitignore):
- .env.local (credentials rahasia)
- node_modules/ (dependencies)
- .next/ (build output)
- .env (semua file environment)

---

## 🎉 Selesai!

Repository kamu sekarang sudah online di GitHub!

**URL Repository:** https://github.com/username/pantau62

Share link ini untuk showcase project kamu! 🚀
