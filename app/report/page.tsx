import Navbar from '@/components/layout/Navbar'
import ReportForm from '@/components/report/ReportForm'
import { Brain, Shield, Zap, Eye, Target, Lock } from 'lucide-react'

export default function ReportPage() {
  return (
    <main className="min-h-screen bg-[#020817] grid-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium mb-4">
            <Shield className="w-4 h-4" /> Report Issue
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Laporkan Masalah Publik</h1>
          <p className="text-slate-400">
            Smart Visual AI akan menganalisis foto dan menentukan prioritas secara otomatis.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form - 3 cols */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm p-8">
              <ReportForm />
            </div>
          </div>

          {/* Right panel - 2 cols */}
          <div className="lg:col-span-2 space-y-6">

            {/* Smart Visual AI Info */}
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Smart Visual AI</h3>
                  <p className="text-xs text-slate-400">Image-Only Analysis Engine</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                AI menganalisis <span className="text-cyan-400 font-medium">foto secara visual</span> — bukan dari teks atau kategori.
              </p>
              <ul className="space-y-2.5 text-sm">
                {[
                  { icon: '🌊', text: 'Deteksi cakupan air & banjir' },
                  { icon: '🛣️', text: 'Analisis kerusakan permukaan jalan' },
                  { icon: '🔥', text: 'Deteksi api & asap' },
                  { icon: '🗑️', text: 'Estimasi densitas sampah' },
                  { icon: '🌙', text: 'Deteksi kondisi gelap/malam' },
                  { icon: '📸', text: 'Resolusi foto meningkatkan akurasi' },
                ].map(item => (
                  <li key={item.text} className="flex items-center gap-2 text-slate-400">
                    <span>{item.icon}</span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Score Lock Info */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" /> AI Score Terkunci
              </h3>
              <p className="text-sm text-slate-400 mb-3">
                Setelah foto diupload, AI score <span className="text-white font-medium">dikunci permanen</span> berdasarkan analisis visual.
              </p>
              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Score dari foto — akurat & konsisten
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  Judul & deskripsi tidak mengubah score
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  Kategori bisa di-override manual
                </div>
              </div>
            </div>

            {/* Priority guide */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" /> Skala Prioritas AI
              </h3>
              <div className="space-y-3">
                {[
                  {
                    level: 'CRITICAL',
                    color: 'text-red-400 bg-red-500/10 border-red-500/20',
                    desc: 'Banjir luas, kebakaran, jalan rusak total',
                    score: '78–100',
                  },
                  {
                    level: 'HIGH',
                    color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
                    desc: 'Banjir signifikan, kerusakan besar',
                    score: '58–77',
                  },
                  {
                    level: 'MEDIUM',
                    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
                    desc: 'Kerusakan sedang, perlu penanganan',
                    score: '38–57',
                  },
                  {
                    level: 'LOW',
                    color: 'text-green-400 bg-green-500/10 border-green-500/20',
                    desc: 'Masalah ringan, perlu pemantauan',
                    score: '12–37',
                  },
                ].map(p => (
                  <div key={p.level} className={`rounded-xl border ${p.color} px-4 py-3`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className={`text-xs font-bold ${p.color.split(' ')[0]}`}>{p.level}</div>
                      <div className="text-xs text-slate-600 font-mono">{p.score}</div>
                    </div>
                    <div className="text-xs text-slate-400">{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" /> Tips Foto Terbaik
              </h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>📸 Ambil foto dari jarak yang menunjukkan luas masalah</li>
                <li>☀️ Pastikan pencahayaan cukup (siang hari lebih baik)</li>
                <li>🎯 Fokuskan ke area yang rusak/bermasalah</li>
                <li>📐 Sertakan objek pembanding (motor, orang) untuk skala</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
