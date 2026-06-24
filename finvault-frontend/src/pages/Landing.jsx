import React from 'react'
import Navbar from '../components/landing/Navbar.jsx'
import Hero from '../components/landing/Hero.jsx'
import Features from '../components/landing/Features.jsx'
import HowItWorks from '../components/landing/HowItWorks.jsx'
import AIInsightsPreview from '../components/landing/AIInsightsPreview.jsx'
import GoalPlanning from '../components/landing/GoalPlanning.jsx'
import Privacy from '../components/landing/Privacy.jsx'
import FinalCTA from '../components/landing/FinalCTA.jsx'
import Footer from '../components/landing/Footer.jsx'

/**
 * Public marketing page, mounted at "/". Deliberately always-dark — see
 * tailwind.config.js / index.css — independent of the dashboard's
 * light/dark ThemeContext, which only governs the authenticated app under
 * /app/*. This keeps the dashboard's theme toggle from ever affecting the
 * marketing page (and vice versa).
 */
export default function Landing() {
  return (
    <div className="bg-paper dark:bg-ink-950 text-ledger-light-primary dark:text-ledger-dark-primary min-h-screen transition-colors duration-150">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <AIInsightsPreview />
        <GoalPlanning />
        <Privacy />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
