import { HeroSection } from '@/components/landing/HeroSection'
import { HowItWorksSection } from '@/components/landing/HowItWorks'
import { FeaturesSection } from '@/components/landing/Features'
import { PricingSection } from '@/components/landing/PricingSection'
import { TestimonialsSection } from '@/components/landing/Testimonials'
import { FAQSection } from '@/components/landing/FAQ'
import { CTASection } from '@/components/landing/CTA'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  )
}
