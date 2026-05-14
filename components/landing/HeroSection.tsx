'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Play, Shield, Zap, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'

const floatingCards = [
  { icon: '🚨', label: 'HIGH Priority', value: '12 Active', color: 'border-red-500/30 bg-red-500/10', delay: 0 },
  { icon: '🤖', label: 'AI Score', value: '94.2%', color: 'border-cyan-500/30 bg-cyan-500/10', delay: 0.2 },
  { icon: '✅', label: 'Resolved Today', value: '47 Cases', color: 'border-green-500/30 bg-green-500/10', delay: 0.4 },
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium mb-6"
            >
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              AI-Powered Smart City Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              <span className="text-white">AI-Powered</span>
              <br />
              <span className="gradient-text">Public Problem</span>
              <br />
              <span className="text-white">Monitoring System</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-400 mb-8 leading-relaxed"
            >
              Deteksi, analisis, dan tangani masalah publik secara real-time menggunakan kecerdasan buatan. 
              Platform smart governance untuk Indonesia yang lebih baik.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <Link href="/report">
                <Button size="lg" className="gap-2">
                  <Shield className="w-5 h-5" />
                  Report Issue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="gap-2">
                  <Activity className="w-5 h-5" />
                  Explore Dashboard
                </Button>
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex gap-8"
            >
              {[
                { value: '10K+', label: 'Reports Handled' },
                { value: '98%', label: 'AI Accuracy' },
                { value: '34', label: 'Cities Covered' },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {/* Main dashboard card */}
            <div className="relative rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Live Monitoring
                </div>
              </div>

              {/* Mini map placeholder */}
              <div className="relative h-48 rounded-xl bg-slate-900/80 border border-slate-700/50 overflow-hidden mb-4">
                <div className="absolute inset-0 grid-bg opacity-50" />
                {/* Fake map markers */}
                {[
                  { top: '30%', left: '25%', color: 'bg-red-500', size: 'w-3 h-3' },
                  { top: '50%', left: '55%', color: 'bg-yellow-500', size: 'w-2.5 h-2.5' },
                  { top: '65%', left: '35%', color: 'bg-green-500', size: 'w-2 h-2' },
                  { top: '25%', left: '70%', color: 'bg-red-500', size: 'w-3 h-3' },
                  { top: '75%', left: '75%', color: 'bg-yellow-500', size: 'w-2.5 h-2.5' },
                ].map((marker, i) => (
                  <motion.div
                    key={i}
                    className={`absolute ${marker.size} ${marker.color} rounded-full shadow-lg`}
                    style={{ top: marker.top, left: marker.left }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  />
                ))}
                <div className="absolute bottom-2 left-2 text-xs text-slate-500 font-mono">
                  Jakarta Metropolitan Area
                </div>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total', value: '1,247', color: 'text-cyan-400' },
                  { label: 'Active', value: '89', color: 'text-yellow-400' },
                  { label: 'Resolved', value: '1,158', color: 'text-green-400' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl bg-slate-900/50 border border-slate-700/50 p-3 text-center">
                    <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating cards */}
            {floatingCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + card.delay }}
                className={`absolute rounded-xl border ${card.color} backdrop-blur-sm px-3 py-2 shadow-xl`}
                style={{
                  top: i === 0 ? '-16px' : i === 1 ? '40%' : 'auto',
                  bottom: i === 2 ? '-16px' : 'auto',
                  right: i === 1 ? '-20px' : 'auto',
                  left: i === 0 ? '10%' : i === 2 ? '10%' : 'auto',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{card.icon}</span>
                  <div>
                    <div className="text-xs text-slate-400">{card.label}</div>
                    <div className="text-sm font-bold text-white">{card.value}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
