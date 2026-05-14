import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ReportCategory, ReportPriority, ReportStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const categoryLabels: Record<ReportCategory, string> = {
  sampah: 'Sampah Menumpuk',
  banjir: 'Banjir',
  jalan_rusak: 'Jalan Rusak',
  fasilitas_umum: 'Fasilitas Umum',
  lampu_jalan: 'Lampu Jalan',
  lainnya: 'Lainnya',
}

export const priorityConfig: Record<ReportPriority, { label: string; color: string; bg: string; dot: string }> = {
  high: { label: 'HIGH', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30', dot: 'bg-red-500' },
  medium: { label: 'MEDIUM', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30', dot: 'bg-yellow-500' },
  low: { label: 'LOW', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30', dot: 'bg-green-500' },
}

export const statusConfig: Record<ReportStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-gray-400', bg: 'bg-gray-500/20 border-gray-500/30' },
  processing: { label: 'Processing', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30' },
  resolved: { label: 'Resolved', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' },
  escalated: { label: 'Escalated', color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30' },
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
