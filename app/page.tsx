import Navbar from '@/components/layout/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import StatsSection from '@/components/landing/StatsSection'
import HowItWorks from '@/components/landing/HowItWorks'
import AIFeaturesSection from '@/components/landing/AIFeaturesSection'
import CTASection from '@/components/landing/CTASection'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#020817]">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <HowItWorks />
      <AIFeaturesSection />
      <CTASection />
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        © 2026 PANTAU+62. AI-Powered Smart City Monitoring Platform for Indonesia.
      </footer>
    </main>
  )
}
