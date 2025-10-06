export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(52,211,153,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(52,211,153,0.08),transparent_50%)]" />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm text-foreground/80">Built on Bitcoin & Stacks</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
              <span className="block mb-2">Your Bitcoin Activity</span>
              <span className="text-gradient">Is Your Credit Score</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-foreground/70 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Access the premier DeFi lending platform built to grow your Bitcoin holdings. Leverage your on-chain reputation for unprecedented borrowing power.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <button className="px-8 py-4 bg-accent hover:bg-accent/90 text-background font-semibold rounded-lg transition-all glow hover:glow-strong transform hover:scale-105">
                Launch App
              </button>
              <button className="px-8 py-4 bg-transparent border border-border hover:border-accent/50 text-foreground font-semibold rounded-lg transition-all hover:bg-muted/30">
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-gradient mb-1">Operating</div>
                <div className="text-sm text-foreground/60">since 2024</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-gradient mb-1">24/7</div>
                <div className="text-sm text-foreground/60">Support</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-gradient mb-1">$0M+</div>
                <div className="text-sm text-foreground/60">TVL</div>
              </div>
            </div>
          </div>

          {/* Right side - 3D Rotating Globe Masterpiece */}
          <div className="relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {/* Massive radial glow background */}
            <div className="absolute inset-0 bg-gradient-radial from-accent/30 via-accent/10 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />

            {/* Outer rotating ring glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/40 via-primary/40 to-accent/40 blur-3xl opacity-60 animate-spin-slow" style={{ animationDuration: '40s' }} />

            {/* Inner pulsing glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-accent/20 to-primary/20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '3s' }} />

            <div className="relative mx-auto max-w-lg lg:max-w-2xl xl:max-w-3xl perspective-1000">
              {/* Top light beam effect */}
              <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-accent/30 to-transparent blur-3xl pointer-events-none" />

              {/* Side light beams */}
              <div className="absolute top-1/2 -left-40 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDuration: '8s' }} />
              <div className="absolute top-1/2 -right-40 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDuration: '10s', animationDelay: '2s' }} />

              {/* Main globe container with 3D perspective */}
              <div className="relative transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
                {/* Rotating shadow base */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-8 bg-black/40 rounded-full blur-2xl" />

                {/* Main globe with rotation */}
                <div className="relative">
                  <img
                    src="/globe33.png"
                    alt="Kōen Global DeFi Network - 3D Rotating Globe"
                    className="w-full h-auto relative z-10 animate-spin-slow"
                    style={{
                      animationDuration: '25s',
                      filter: 'drop-shadow(0 25px 50px rgba(52, 211, 153, 0.4)) brightness(1.1) contrast(1.15)',
                      transformStyle: 'preserve-3d'
                    }}
                  />

                  {/* Multi-layer glow effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-transparent to-primary/40 rounded-full pointer-events-none blur-2xl" />
                  <div className="absolute inset-0 bg-accent/30 rounded-full pointer-events-none blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />

                  {/* Shine effect overlay */}
                  <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] bg-gradient-to-br from-white/30 via-white/10 to-transparent rounded-full pointer-events-none blur-xl" />
                </div>

                {/* Orbiting light particles */}
                <div className="absolute top-[20%] left-[10%] w-4 h-4 bg-accent rounded-full blur-sm animate-float" style={{ animationDuration: '6s', animationDelay: '0s' }} />
                <div className="absolute top-[60%] right-[15%] w-3 h-3 bg-primary rounded-full blur-sm animate-float" style={{ animationDuration: '7s', animationDelay: '1s' }} />
                <div className="absolute bottom-[30%] left-[20%] w-5 h-5 bg-accent/80 rounded-full blur-sm animate-float" style={{ animationDuration: '8s', animationDelay: '2s' }} />
                <div className="absolute top-[40%] right-[25%] w-2 h-2 bg-emerald-400 rounded-full blur-sm animate-float" style={{ animationDuration: '9s', animationDelay: '3s' }} />
              </div>

              {/* Large floating particle effects */}
              <div className="absolute top-10 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0.5s', animationDuration: '12s' }} />
              <div className="absolute bottom-20 -right-24 w-48 h-48 bg-primary/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s', animationDuration: '14s' }} />
              <div className="absolute top-1/3 -right-16 w-32 h-32 bg-accent/25 rounded-full blur-2xl animate-float" style={{ animationDelay: '2.5s', animationDuration: '10s' }} />
              <div className="absolute bottom-1/3 -left-16 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '3.5s', animationDuration: '16s' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
