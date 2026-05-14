import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ReportPriority } from '@/types'

interface PriorityBadgeProps {
  priority: ReportPriority
  className?: string
  showAnimation?: boolean
}

const priorityConfig = {
  high: {
    label: 'HIGH',
    color: 'text-red-400',
    bg: 'bg-red-500/20 border-red-500/30',
    dot: 'bg-red-500',
    glow: 'shadow-red-500/50',
    pulseColor: '#ef4444',
  },
  medium: {
    label: 'MEDIUM',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20 border-yellow-500/30',
    dot: 'bg-yellow-500',
    glow: 'shadow-yellow-500/50',
    pulseColor: '#eab308',
  },
  low: {
    label: 'LOW',
    color: 'text-green-400',
    bg: 'bg-green-500/20 border-green-500/30',
    dot: 'bg-green-500',
    glow: 'shadow-green-500/50',
    pulseColor: '#22c55e',
  },
}

export function PriorityBadge({ priority, className, showAnimation = true }: PriorityBadgeProps) {
  const config = priorityConfig[priority]

  // Different animation patterns for each priority
  const getAnimationVariant = () => {
    switch (priority) {
      case 'high':
        // Fast, urgent pulse
        return {
          scale: [1, 1.4, 1],
          opacity: [1, 0.3, 1],
          transition: {
            duration: 0.8,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          },
        }
      case 'medium':
        // Moderate, steady pulse
        return {
          scale: [1, 1.3, 1],
          opacity: [1, 0.5, 1],
          transition: {
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          },
        }
      case 'low':
        // Slow, calm pulse
        return {
          scale: [1, 1.2, 1],
          opacity: [1, 0.6, 1],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          },
        }
    }
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold',
        config.bg,
        config.color,
        className
      )}
    >
      {/* Animated Dot */}
      <div className="relative flex items-center justify-center w-2 h-2">
        {/* Outer glow ring */}
        {showAnimation && (
          <motion.div
            className={cn('absolute inset-0 rounded-full', config.dot)}
            style={{ filter: 'blur(4px)' }}
            animate={getAnimationVariant()}
          />
        )}
        
        {/* Middle pulse ring */}
        {showAnimation && (
          <motion.div
            className={cn('absolute inset-0 rounded-full', config.dot)}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{
              duration: priority === 'high' ? 1 : priority === 'medium' ? 1.5 : 2.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}

        {/* Core dot */}
        <motion.div
          className={cn('relative w-2 h-2 rounded-full', config.dot, config.glow)}
          animate={
            showAnimation
              ? {
                  boxShadow: [
                    `0 0 4px ${config.pulseColor}`,
                    `0 0 12px ${config.pulseColor}`,
                    `0 0 4px ${config.pulseColor}`,
                  ],
                }
              : {}
          }
          transition={{
            duration: priority === 'high' ? 0.6 : priority === 'medium' ? 1 : 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Label */}
      <span>{config.label}</span>
    </div>
  )
}
