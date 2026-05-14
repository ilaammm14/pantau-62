export const dynamic = 'force-dynamic'

import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminGuard from '@/components/admin/AdminGuard'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#020817]">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </AdminGuard>
  )
}
