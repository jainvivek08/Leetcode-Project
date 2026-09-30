import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';
import PreFooterCta from '../components/landing/PreFooterCta';
import Footer from '../components/landing/Footer';

function LandingPage() {
  return (
    <div className="bg-white antialiased flex flex-col min-h-screen text-slate-800">
      {/* 1. STICKY TOP NAVBAR */}
      <Navbar />

      <main className="flex-grow">
        {/* 2. HERO SECTION & COMPACT ARENA */}
        <Hero />

        {/* 3. ALTERNATING FEATURE CARDS */}
        <Features />

        {/* 4. TESTIMONIALS */}
        <Testimonials />

        {/* 5. FREQUENTLY ASKED QUESTIONS */}
        <FAQ />

        {/* 6. PRE-FOOTER CTA */}
        <PreFooterCta />
      </main>

      {/* 7. DARK NAVY MEGA FOOTER */}
      <Footer />
    </div>
  );
}

export default LandingPage;
