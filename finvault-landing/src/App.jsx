import React from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Features from './components/Features.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import AIInsightsPreview from './components/AIInsightsPreview.jsx'
import GoalPlanning from './components/GoalPlanning.jsx'
import Privacy from './components/Privacy.jsx'
import FinalCTA from './components/FinalCTA.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <div className="min-h-screen">
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
