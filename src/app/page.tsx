import { HeroSection } from '@/components/landing/HeroSection'
import {
  HowItWorksSection,
  WhatIsAnalyzedSection,
  TestimonialsSection,
  FAQSection,
  CTASection,
} from '@/components/landing/Sections'
import { PricingSection } from '@/components/landing/PricingSection'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <WhatIsAnalyzedSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </>
  )
}
