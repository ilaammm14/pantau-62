'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Trash2, CheckCircle, Clock, Loader2, Eye, AlertTriangle, X, Wifi, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { createClient } from '@/lib/supabase/client'
import { statusConfig, categoryLabels, formatDate } from '@/lib/utils'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { useRealtimeReports } from '@/hooks/useRealtimeReports'
import type { Report, ReportStatus } from '@/types'
import Link from 'next/link'

export default function AdminReportsPage() {
  const { reports, loading, newReportCount, resetNewCount } = useRealtimeReports()
  const [filtered, setFiltered] = useState<Report[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null)

  // Reset new count when page is visited
  useEffect(() => { resetNewCount() }, [resetNewCount])

  useEffect(() => {
    let result = reports
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(r => 
        r.title.toLowerCase().includes(searchLower) || 
        r.location.toLowerCase().includes(searchLower)
      )
    }
    if (categoryFilter !== 'all') result = result.filter(r => r.category === categoryFilter)
    if (priorityFilter !== 'all') result = result.filter(r => r.priority === priorityFilter)
    if (statusFilter !== 'all') result = result.filter(r => r.status === statusFilter)
    setFiltered(result)
  }, [search, categoryFilter, priorityFilter, statusFilter, reports])

  const updateStatus = async (id: string, status: ReportStatus) => {
    setUpdating(id)
    const supabase = createClient()
    const { error } = await supabase.from('reports').update({ status }).eq('id', id)
    if (error) {
      console.error('Update error:', error)
      alert(`Gagal update status: ${error.message}`)
    }
    // Realtime subscription handles state update automatically
    setUpdating(null)
  }

  const handleDeleteClick = (report: Report) => {
    setReportToDelete(report)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!reportToDelete) return
    setUpdating(reportToDelete.id)
    const supabase = createClient()
    const { error } = await supabase.from('reports').delete().eq('id', reportToDelete.id)
    if (error) {
      console.error('Delete error:', error)
      alert(`Gagal hapus laporan: ${error.message}`)
    }
    // Realtime subscription handles removal automatically
    setUpdating(null)
    setDeleteDialogOpen(false)
    setReportToDelete(null)
  }

  return (
    <div className="p-4 lg:p-8 min-h-screen grid-bg">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl lg:text-2xl font-bold text-white">Reports Management</h1>
          <div className="flex items-center gap-1 ml-auto">
            <Wifi className="w-3 h-3 text-cyan-400" />
            <span className="text-xs text-cyan-400 font-mono hidden sm:inline">LIVE</span>
          </div>
        </div>
        <p className="text-slate-400 text-sm mt-1">{filtered.length} laporan ditemukan</p>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="p-3 lg:p-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari laporan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="text-xs"><SelectValue placeholder="Kategori" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {Object.entries(categoryLabels).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l.split(' ')[0]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="high">HIGH</SelectItem>
                  <SelectItem value="medium">MEDIUM</SelectItem>
                  <SelectItem value="low">LOW</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile: card list */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 rounded-2xl skeleton" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">Tidak ada laporan ditemukan</div>
        ) : filtered.map(report => (
          <motion.div key={report.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="hover:border-slate-600 transition-all">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {report.image_url ? (
                    <img src={report.image_url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center text-xl flex-shrink-0">
                      {report.category === 'sampah' ? '🗑️' : report.category === 'banjir' ? '🌊' : '⚠️'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm truncate">{report.title}</div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">{report.location}</div>
                    {/* Reporter info */}
                    {report.users && (
                      <div className="flex items-center gap-1 mt-1">
                        <User className="w-3 h-3 text-slate-600" />
                        <span className="text-xs text-slate-600 truncate">
                          {report.users.full_name || report.users.email || 'Pengguna'}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-1.5 mt-2 flex-wrap items-center">
                      <PriorityBadge priority={report.priority} />
                      <Badge className={`${statusConfig[report.status].bg} ${statusConfig[report.status].color} border text-xs`}>
                        {statusConfig[report.status].label}
                      </Badge>
                      <span className="text-xs text-cyan-400 font-mono ml-auto">AI:{report.ai_score}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 mt-3 pt-3 border-t border-slate-700/50">
                  <Link href={`/admin/reports/${report.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1 text-xs h-8">
                      <Eye className="w-3 h-3" /> Lihat
                    </Button>
                  </Link>
                  {report.status === 'pending' && (
                    <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs h-8 text-blue-400 border-blue-500/30"
                      onClick={() => updateStatus(report.id, 'processing')} disabled={updating === report.id}>
                      {updating === report.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
                      Proses
                    </Button>
                  )}
                  {report.status === 'processing' && (
                    <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs h-8 text-green-400 border-green-500/30"
                      onClick={() => updateStatus(report.id, 'resolved')} disabled={updating === report.id}>
                      {updating === report.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      Selesai
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 flex-shrink-0"
                    onClick={() => handleDeleteClick(report)} disabled={updating === report.id}>
                    {updating === report.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Desktop: table */}
      <Card className="hidden lg:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Foto', 'Laporan', 'Pelapor', 'Kategori', 'Lokasi', 'Priority', 'Status', 'AI Score', 'Aksi'].map(h => (
                    <th key={h} className="text-left py-4 px-4 text-xs text-slate-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}><td colSpan={8} className="py-3 px-4"><div className="h-12 rounded skeleton" /></td></tr>
                  ))
                ) : filtered.map(report => (
                  <motion.tr key={report.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      {report.image_url ? (
                        <img src={report.image_url} alt={report.title} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-lg">
                          {report.category === 'sampah' ? '🗑️' : report.category === 'banjir' ? '🌊' : '⚠️'}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-white truncate max-w-[160px]">{report.title}</div>
                      <div className="text-xs text-slate-500">{formatDate(report.created_at)}</div>
                    </td>
                    <td className="py-3 px-4">
                      {report.users ? (
                        <div className="flex items-center gap-2">
                          {report.users.avatar_url ? (
                            <img src={report.users.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-cyan-400">
                                {report.users.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs text-white truncate max-w-[100px]">
                              {report.users.full_name || 'Pengguna'}
                            </div>
                            <div className="text-xs text-slate-600 truncate max-w-[100px]">
                              {report.users.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{categoryLabels[report.category as keyof typeof categoryLabels]}</td>
                    <td className="py-3 px-4 text-slate-400 text-xs truncate max-w-[120px]">{report.location}</td>
                    <td className="py-3 px-4"><PriorityBadge priority={report.priority} /></td>
                    <td className="py-3 px-4">
                      <Badge className={`${statusConfig[report.status].bg} ${statusConfig[report.status].color} border text-xs`}>
                        {statusConfig[report.status].label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4"><span className="text-cyan-400 font-mono text-sm">{report.ai_score}</span></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/reports/${report.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-3.5 h-3.5" /></Button>
                        </Link>
                        {report.status === 'pending' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300"
                            onClick={() => updateStatus(report.id, 'processing')} disabled={updating === report.id}>
                            {updating === report.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                          </Button>
                        )}
                        {report.status === 'processing' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-400 hover:text-green-300"
                            onClick={() => updateStatus(report.id, 'resolved')} disabled={updating === report.id}>
                            {updating === report.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300"
                          onClick={() => handleDeleteClick(report)} disabled={updating === report.id}>
                          {updating === report.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {!loading && filtered.length === 0 && (
              <div className="text-center py-16 text-slate-500">Tidak ada laporan ditemukan</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog - Premium Design */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              {/* Warning Icon with Soft Glow */}
              <div className="relative mb-5">
                <motion.div 
                  className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3] 
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                />
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center backdrop-blur-sm">
                  <AlertTriangle className="w-7 h-7 text-red-400" strokeWidth={2.5} />
                </div>
              </div>
              
              {/* Title & Description */}
              <AlertDialogTitle className="mb-2">Hapus Laporan?</AlertDialogTitle>
              <AlertDialogDescription className="max-w-sm">
                Tindakan ini tidak dapat dibatalkan
              </AlertDialogDescription>
            </motion.div>
          </AlertDialogHeader>
          
          {/* Report Preview Card */}
          <AnimatePresence mode="wait">
            {reportToDelete && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="mx-8 mb-6"
              >
                <div className="rounded-2xl bg-slate-800/30 border border-slate-700/40 p-5 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300 group">
                  <div className="flex items-start gap-5">
                    {/* Image Thumbnail */}
                    {reportToDelete.image_url ? (
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-cyan-500/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <img 
                          src={reportToDelete.image_url} 
                          alt={reportToDelete.title}
                          className="relative w-24 h-24 rounded-xl object-cover border border-slate-600/40 shadow-lg" 
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/40 flex items-center justify-center text-4xl flex-shrink-0">
                        {reportToDelete.category === 'sampah' ? '🗑️' : reportToDelete.category === 'banjir' ? '🌊' : '⚠️'}
                      </div>
                    )}
                    
                    {/* Report Info */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div>
                        <h4 className="font-bold text-white text-base mb-1.5 line-clamp-2 leading-snug">
                          {reportToDelete.title}
                        </h4>
                        <p className="text-sm text-slate-400 flex items-center gap-2 truncate">
                          <span className="text-cyan-400/80 text-xs">📍</span>
                          <span className="truncate">{reportToDelete.location}</span>
                        </p>
                      </div>
                      
                      {/* Badges Row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <PriorityBadge priority={reportToDelete.priority} showAnimation={false} />
                        <Badge className={`${statusConfig[reportToDelete.status].bg} ${statusConfig[reportToDelete.status].color} border text-xs`}>
                          {statusConfig[reportToDelete.status].label}
                        </Badge>
                      </div>
                      
                      {/* Date */}
                      <p className="text-xs text-slate-500">
                        {formatDate(reportToDelete.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Warning Notice - Compact */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mx-8 mb-6"
          >
            <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 px-4 py-3 backdrop-blur-sm">
              <p className="flex items-start gap-2.5 text-xs text-amber-300/90">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400/80" strokeWidth={2} />
                <span className="leading-relaxed">
                  Laporan akan <span className="font-semibold text-amber-200">dihapus permanen</span> dari database
                </span>
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <AlertDialogFooter>
            <AlertDialogCancel>
              <X className="w-4 h-4 mr-2" strokeWidth={2.5} />
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              <Trash2 className="w-4 h-4 mr-2" strokeWidth={2.5} />
              Hapus Laporan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}