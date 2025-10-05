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

          {/* Right side - Product Mockup */}
          <div className="relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {/* Phone mockup container */}
            <div className="relative mx-auto max-w-sm lg:max-w-md">
              {/* Phone frame */}
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] p-4 shadow-2xl border-8 border-gray-800">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-800 rounded-b-3xl z-10" />

                {/* Screen content */}
                <div className="relative bg-gradient-to-br from-background to-muted rounded-[2.5rem] overflow-hidden aspect-[9/19.5]">
                  {/* App Header */}
                  <div className="p-6 border-b border-border/30">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center text-xl font-bold">
                        K
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">🔔</div>
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">⚙️</div>
                      </div>
                    </div>
                    <div className="text-sm text-foreground/60">Available Balance</div>
                    <div className="text-3xl font-bold text-gradient">$25,450.75</div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-3 gap-3 p-6">
                    <div className="text-center p-4 rounded-xl bg-muted/50">
                      <div className="text-2xl mb-2">💰</div>
                      <div className="text-xs font-semibold">Deposit</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-accent/20 border border-accent/50">
                      <div className="text-2xl mb-2">⚡</div>
                      <div className="text-xs font-semibold text-accent">Borrow</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-muted/50">
                      <div className="text-2xl mb-2">📤</div>
                      <div className="text-xs font-semibold">Send</div>
                    </div>
                  </div>

                  {/* Reputation Card */}
                  <div className="mx-6 mb-4 p-4 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold">Reputation Score</div>
                      <div className="text-lg">🥇</div>
                    </div>
                    <div className="text-2xl font-bold text-gradient mb-1">750 / 1000</div>
                    <div className="text-xs text-foreground/60">Gold Tier - 15x Credit Multiplier</div>
                  </div>

                  {/* Assets List */}
                  <div className="px-6 pb-6">
                    <div className="text-sm font-semibold mb-3">Your Assets</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-sm">₿</div>
                          <div>
                            <div className="text-xs font-semibold">Bitcoin</div>
                            <div className="text-xs text-foreground/60">0.5 BTC</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold">$32,500</div>
                          <div className="text-xs text-green-400">+2.5%</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-sm">$</div>
                          <div>
                            <div className="text-xs font-semibold">kUSD</div>
                            <div className="text-xs text-foreground/60">12,500 kUSD</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold">$12,500</div>
                          <div className="text-xs text-foreground/60">0.0%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notifications */}
              <div className="absolute -left-4 top-32 bg-background/95 backdrop-blur-sm border border-accent/50 rounded-xl p-4 shadow-2xl max-w-[200px] animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">🎯</div>
                  <div className="text-xs font-semibold">Reputation Boost!</div>
                </div>
                <div className="text-xs text-foreground/60">You earned +50 points for consistent repayment</div>
              </div>

              <div className="absolute -right-4 top-96 bg-background/95 backdrop-blur-sm border border-accent/50 rounded-xl p-4 shadow-2xl max-w-[200px] animate-float" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">💎</div>
                  <div className="text-xs font-semibold">New Credit Limit</div>
                </div>
                <div className="text-xs text-foreground/60">Your limit increased to $18,750 kUSD</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
