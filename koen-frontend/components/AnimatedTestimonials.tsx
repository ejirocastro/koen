'use client';

import { useEffect, useRef, useState } from 'react';

export default function AnimatedTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      quote: "Kōen's reputation system finally brings real credit scoring to DeFi. I've increased my borrowing power by 10x.",
      author: "Alex Chen",
      role: "Bitcoin Maxi",
      avatar: "🧑‍💼",
      rating: 5
    },
    {
      quote: "The transparent smart contracts and on-chain reputation make this the safest lending platform I've used.",
      author: "Sarah Martinez",
      role: "DeFi Investor",
      avatar: "👩‍💼",
      rating: 5
    },
    {
      quote: "Finally, a platform that rewards long-term behavior. My interest rates dropped as I built my reputation.",
      author: "Michael Johnson",
      role: "Crypto Trader",
      avatar: "👨‍💻",
      rating: 5
    },
    {
      quote: "Non-custodial lending with better rates than traditional DeFi? This is the future of Bitcoin finance.",
      author: "Emma Davis",
      role: "Web3 Developer",
      avatar: "👩‍🔬",
      rating: 5
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-primary/5" />

      {/* Floating elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDuration: '15s' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDuration: '20s', animationDelay: '5s' }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Trusted by <span className="text-gradient">Bitcoin Holders</span>
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Join thousands of users building their on-chain reputation
          </p>
        </div>

        {/* Testimonial cards container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main active testimonial */}
          <div className="relative min-h-[400px] flex items-center justify-center">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ${
                  index === activeIndex
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 translate-y-10 pointer-events-none'
                }`}
              >
                <div className="gradient-border rounded-3xl p-12 bg-background/50 backdrop-blur-sm">
                  {/* Stars rating */}
                  <div className="flex justify-center gap-2 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-2xl text-accent">★</span>
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-2xl md:text-3xl text-center text-foreground/90 font-medium mb-8 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Author info */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-3xl">
                      {testimonial.avatar}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg text-foreground">{testimonial.author}</div>
                      <div className="text-foreground/60">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'bg-accent w-8'
                    : 'bg-foreground/20 hover:bg-foreground/40'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Floating mini testimonial cards */}
        <div className="hidden lg:block">
          <div
            className="absolute top-20 left-10 w-64 gradient-border rounded-xl p-4 bg-background/80 backdrop-blur-sm animate-float"
            style={{ animationDuration: '7s' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">😊</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-accent text-sm">★</span>
                ))}
              </div>
            </div>
            <p className="text-sm text-foreground/70">"Best DeFi platform!"</p>
            <p className="text-xs text-foreground/50 mt-1">- John D.</p>
          </div>

          <div
            className="absolute bottom-20 right-10 w-64 gradient-border rounded-xl p-4 bg-background/80 backdrop-blur-sm animate-float"
            style={{ animationDuration: '8s', animationDelay: '2s' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🚀</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-accent text-sm">★</span>
                ))}
              </div>
            </div>
            <p className="text-sm text-foreground/70">"Reputation system is genius!"</p>
            <p className="text-xs text-foreground/50 mt-1">- Maria K.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
