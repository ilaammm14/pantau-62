import Navbar from '@/components/layout/Navbar'
import DashboardContent from '@/components/dashboard/DashboardContent'

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#020817] grid-bg">
      <Navbar />
      <div className="pt-16">
        <DashboardContent />
      </div>
    </main>
  )
}
