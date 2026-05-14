'use client'

import { motion } from 'framer-motion'
import { Upload, Brain, AlertOctagon, Lightbulb } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'User Report',
    desc: 'Masyarakat melaporkan masalah publik dengan foto, deskripsi, dan lokasi melalui platform.',
    color: 'from-cyan-500 to-blue-600',
    glow: 'shadow-cyan-500/30',
  },
  {
    icon: Brain,
    step: '02',
    title: 'AI Analysis',
    desc: 'Sistem AI menganalisis laporan menggunakan NLP dan computer vision untuk memahami konteks masalah.',
    color: 'from-blue-500 to-indigo-600',
    glow: 'shadow-blue-500/30',
  },
  {
    icon: AlertOctagon,
    step: '03',
    title: 'Priority Detection',
    desc: 'AI menentukan tingkat prioritas (LOW/MEDIUM/HIGH) berdasarkan scoring system yang canggih.',
    color: 'from-indigo-500 to-purple-600',
    glow: 'shadow-indigo-500/30',
  },
  {
    icon: Lightbulb,
    step: '04',
    title: 'Smart Recommendation',
    desc: 'Platform memberikan rekomendasi tindakan spesifik kepada pihak berwenang untuk penanganan optimal.',
    color: 'from-purple-500 to-pink-600',
    glow: 'shadow-purple-500/30',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 relative" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium mb-4">
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            4 Langkah Penanganan Cerdas
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Dari laporan masyarakat hingga tindakan nyata, semua diproses secara otomatis oleh AI kami.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20" />

          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -6 }}
              className="relative group"
            >
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm p-6 h-full transition-all duration-300 group-hover:border-slate-600">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${step.color} shadow-lg ${step.glow} mb-4`}>
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl font-black text-slate-700/50 mb-2">{step.step}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
