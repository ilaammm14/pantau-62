'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { FileText, CheckCircle, AlertTriangle, MapPin } from 'lucide-react'

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

const stats = [
  {
    icon: FileText,
    label: 'Total Reports',
    value: 12847,
    suffix: '+',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    glow: 'shadow-cyan-500/20',
  },
  {
    icon: CheckCircle,
    label: 'Resolved Cases',
    value: 11203,
    suffix: '+',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    glow: 'shadow-green-500/20',
  },
  {
    icon: AlertTriangle,
    label: 'Active Alerts',
    value: 89,
    suffix: '',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    glow: 'shadow-yellow-500/20',
  },
  {
    icon: MapPin,
    label: 'High Priority Areas',
    value: 34,
    suffix: '',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    glow: 'shadow-red-500/20',
  },
]

export default function StatsSection() {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-3">Platform Impact</h2>
          <p className="text-slate-400">Data real-time dari seluruh wilayah Indonesia</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className={`rounded-2xl border ${stat.bg} p-6 shadow-xl ${stat.glow} text-center transition-all duration-300`}
            >
              <div className={`inline-flex p-3 rounded-xl ${stat.bg} mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                <AnimatedCounter target={stat.value} />
                {stat.suffix}
              </div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
