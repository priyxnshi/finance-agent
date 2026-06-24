import React from 'react'
import { ThemeProvider } from './context/ThemeContext.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Features from './components/Features.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import AIInsightsPreview from './components/AIInsightsPreview.jsx'
import GoalPlanning from './components/GoalPlanning.jsx'
import Privacy from './components/Privacy.jsx'
import FinalCTA from './components/FinalCTA.jsx'
import Footer from './components/Footer.jsx'
import CustomCursor from './components/CustomCursor.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <div className="bg-paper dark:bg-ink-950 text-ledger-light-primary dark:text-ledger-dark-primary min-h-screen transition-colors duration-150 custom-cursor-active">
        <CustomCursor />
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
    </ThemeProvider>
  )
}
