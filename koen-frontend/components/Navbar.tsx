'use client';

import { useState } from 'react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center text-2xl font-bold text-background">
              K
            </div>
            <span className="text-2xl font-bold">
              <span className="text-gradient">Kōen</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground/70 hover:text-accent transition-colors font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-foreground/70 hover:text-accent transition-colors font-medium">
              How It Works
            </a>
            <a href="#stats" className="text-foreground/70 hover:text-accent transition-colors font-medium">
              Stats
            </a>
            <a href="#docs" className="text-foreground/70 hover:text-accent transition-colors font-medium">
              Docs
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button className="px-6 py-2.5 bg-transparent border border-border hover:border-accent/50 text-foreground font-semibold rounded-lg transition-all hover:bg-muted/30">
              Connect Wallet
            </button>
            <button className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-background font-semibold rounded-lg transition-all glow">
              Launch App
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <a href="#features" className="block text-foreground/70 hover:text-accent transition-colors font-medium">
              Features
            </a>
            <a href="#how-it-works" className="block text-foreground/70 hover:text-accent transition-colors font-medium">
              How It Works
            </a>
            <a href="#stats" className="block text-foreground/70 hover:text-accent transition-colors font-medium">
              Stats
            </a>
            <a href="#docs" className="block text-foreground/70 hover:text-accent transition-colors font-medium">
              Docs
            </a>
            <div className="pt-4 space-y-2">
              <button className="w-full px-6 py-2.5 bg-transparent border border-border hover:border-accent/50 text-foreground font-semibold rounded-lg transition-all">
                Connect Wallet
              </button>
              <button className="w-full px-6 py-2.5 bg-accent hover:bg-accent/90 text-background font-semibold rounded-lg transition-all">
                Launch App
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
