import Navbar from '@/components/layout/Navbar'
import ReportForm from '@/components/report/ReportForm'
import { Brain, Shield, Zap } from 'lucide-react'

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
          <p className="text-slate-400">AI kami akan menganalisis dan menentukan prioritas laporan Anda secara otomatis.</p>
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
            {/* AI Info */}
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI Analysis</h3>
                  <p className="text-xs text-slate-400">Powered by Smart Scoring</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Sistem AI kami menganalisis laporan Anda berdasarkan:
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                {['Kata kunci dalam deskripsi', 'Kategori masalah', 'Kepadatan area lokasi', 'Ketersediaan foto bukti', 'Panjang & detail deskripsi'].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Priority guide */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" /> Panduan Prioritas
              </h3>
              <div className="space-y-3">
                {[
                  { level: 'HIGH', color: 'text-red-400 bg-red-500/10 border-red-500/20', desc: 'Bahaya, darurat, banjir besar' },
                  { level: 'MEDIUM', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', desc: 'Rusak, bocor, mengganggu' },
                  { level: 'LOW', color: 'text-green-400 bg-green-500/10 border-green-500/20', desc: 'Perlu perhatian, tidak mendesak' },
                ].map(p => (
                  <div key={p.level} className={`rounded-xl border ${p.color} px-4 py-3`}>
                    <div className={`text-xs font-bold ${p.color.split(' ')[0]} mb-1`}>{p.level}</div>
                    <div className="text-xs text-slate-400">{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
              <h3 className="font-semibold text-white mb-3">💡 Tips Laporan Efektif</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Sertakan foto yang jelas dan relevan</li>
                <li>• Deskripsikan masalah secara detail</li>
                <li>• Cantumkan alamat lengkap dan spesifik</li>
                <li>• Gunakan kata kunci yang tepat</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
