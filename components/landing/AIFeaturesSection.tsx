'use client'

import { motion } from 'framer-motion'
import { Brain, Map, TrendingUp, BarChart3, Zap, Shield } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI Priority Detection',
    desc: 'Sistem scoring AI otomatis menentukan prioritas setiap laporan berdasarkan kata kunci, lokasi, dan konteks.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    icon: Map,
    title: 'Smart Monitoring',
    desc: 'Peta interaktif real-time menampilkan semua laporan dengan marker berwarna berdasarkan tingkat prioritas.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Prediction System',
    desc: 'Analisis tren historis untuk memprediksi area yang berpotensi mengalami peningkatan masalah.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
  },
  {
    icon: BarChart3,
    title: 'Heatmap Analytics',
    desc: 'Visualisasi heatmap menunjukkan konsentrasi masalah per area untuk pengambilan keputusan strategis.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: Zap,
    title: 'Real-time Alerts',
    desc: 'Notifikasi instan kepada pengguna dan admin ketika status laporan berubah atau ada alert area.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
  },
  {
    icon: Shield,
    title: 'Smart Governance',
    desc: 'Dashboard admin komprehensif dengan tools manajemen laporan dan rekomendasi tindakan berbasis AI.',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
  },
]

export default function AIFeaturesSection() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium mb-4">
            <Brain className="w-4 h-4" /> AI Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Teknologi AI Terdepan
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Didukung machine learning dan analitik canggih untuk penanganan masalah publik yang lebih efektif.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`rounded-2xl border ${feature.bg} p-6 transition-all duration-300 group cursor-default`}
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.bg} mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
