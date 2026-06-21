import React from 'react'
import Button from './Button.jsx'

export default function FinalCTA() {
  return (
    <section id="get-started" className="border-t border-white/[0.06] py-24 bg-grid bg-radial-glow">
      <div className="max-w-3xl mx-auto px-5 lg:px-8 text-center">
        <h2 className="font-display font-semibold text-3xl sm:text-[2.5rem] tracking-tight leading-tight">
          Start making smarter financial decisions.
        </h2>
        <div className="mt-9 flex items-center justify-center gap-3">
          <Button href="#">Create Account</Button>
          <Button variant="secondary" href="#login">
            Login
          </Button>
        </div>
      </div>
    </section>
  )
}
