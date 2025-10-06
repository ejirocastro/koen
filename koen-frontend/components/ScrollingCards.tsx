'use client';

import { useEffect, useRef } from 'react';

export default function ScrollingCards() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const cards = [
    {
      icon: "₿",
      title: "Deposit Bitcoin",
      description: "Deposit sBTC as collateral and maintain full ownership of your assets",
      gradient: "from-orange-500/20 to-orange-600/20",
      glow: "rgba(251, 146, 60, 0.3)"
    },
    {
      icon: "🎯",
      title: "Build Reputation",
      description: "Your on-chain activity automatically increases your credit score",
      gradient: "from-accent/20 to-primary/20",
      glow: "rgba(52, 211, 153, 0.3)"
    },
    {
      icon: "💰",
      title: "Borrow More",
      description: "High reputation unlocks up to 15x leverage on your collateral",
      gradient: "from-blue-500/20 to-blue-600/20",
      glow: "rgba(59, 130, 246, 0.3)"
    },
    {
      icon: "📈",
      title: "Better Rates",
      description: "Consistent repayment history earns you lower interest rates",
      gradient: "from-purple-500/20 to-purple-600/20",
      glow: "rgba(168, 85, 247, 0.3)"
    },
    {
      icon: "🔐",
      title: "Non-Custodial",
      description: "Smart contracts ensure you always control your digital assets",
      gradient: "from-emerald-500/20 to-emerald-600/20",
      glow: "rgba(16, 185, 129, 0.3)"
    },
    {
      icon: "⚡",
      title: "Instant Loans",
      description: "Get liquidity in seconds without selling your Bitcoin position",
      gradient: "from-yellow-500/20 to-yellow-600/20",
      glow: "rgba(234, 179, 8, 0.3)"
    }
  ];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    const scrollSpeed = 0.5;

    const autoScroll = () => {
      scrollAmount += scrollSpeed;

      if (scrollAmount >= scrollContainer.scrollWidth / 2) {
        scrollAmount = 0;
      }

      scrollContainer.scrollLeft = scrollAmount;
    };

    const intervalId = setInterval(autoScroll, 30);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gradient">Seamless DeFi Experience</span>
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Everything you need to maximize your Bitcoin's potential
          </p>
        </div>

        {/* Scrolling cards container */}
        <div className="relative">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-hidden py-8"
            style={{ scrollBehavior: 'auto' }}
          >
            {/* Duplicate cards for seamless loop */}
            {[...cards, ...cards].map((card, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 w-80 h-96 group cursor-pointer"
              >
                {/* Card glow effect */}
                <div
                  className="absolute -inset-1 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: card.glow }}
                />

                {/* Card content */}
                <div className={`relative h-full gradient-border rounded-3xl p-8 bg-gradient-to-br ${card.gradient} hover:scale-105 transition-all duration-300`}>
                  {/* Floating icon */}
                  <div className="mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center text-4xl backdrop-blur-sm border border-accent/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                      {card.icon}
                    </div>
                  </div>

                  {/* Card content */}
                  <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-gradient transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-foreground/70 leading-relaxed">
                    {card.description}
                  </p>

                  {/* Decorative floating orbs */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-accent/20 rounded-full blur-2xl animate-pulse" />
                  <div className="absolute bottom-4 left-4 w-20 h-20 bg-primary/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="text-center mt-8 text-foreground/50 text-sm">
          Auto-scrolling showcase • Hover to explore
        </div>
      </div>
    </section>
  );
}
