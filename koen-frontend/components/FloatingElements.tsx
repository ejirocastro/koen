export default function FloatingElements() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background" />

      {/* Large floating orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDuration: '8s' }} />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDuration: '10s', animationDelay: '1s' }} />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl animate-float" style={{ animationDuration: '12s', animationDelay: '2s' }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold">
              <span className="text-gradient">Decentralized</span> Lending
              <br />
              Powered by <span className="text-gradient">Bitcoin</span>
            </h2>
            <p className="text-xl text-foreground/70 leading-relaxed">
              Kōen revolutionizes DeFi lending by introducing reputation-based credit scoring on Bitcoin.
              Build your on-chain identity and unlock unprecedented borrowing power.
            </p>

            <div className="space-y-4">
              {[
                { icon: "✓", text: "No credit checks required" },
                { icon: "✓", text: "Transparent smart contract execution" },
                { icon: "✓", text: "Rewards for consistent behavior" },
                { icon: "✓", text: "Community-driven governance" }
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold group-hover:scale-110 group-hover:bg-accent/30 transition-all">
                    {item.icon}
                  </div>
                  <span className="text-lg text-foreground/80 group-hover:text-foreground transition-colors">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            <button className="px-8 py-4 bg-accent hover:bg-accent/90 text-background font-semibold rounded-lg transition-all glow hover:glow-strong transform hover:scale-105 mt-6">
              Start Building Your Reputation
            </button>
          </div>

          {/* Right side - Floating cards showcase */}
          <div className="relative h-[600px]">
            {/* Floating card 1 */}
            <div
              className="absolute top-0 left-0 w-72 gradient-border rounded-2xl p-6 bg-background/80 backdrop-blur-sm animate-float"
              style={{ animationDuration: '6s', animationDelay: '0s' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div>
                  <div className="text-sm text-foreground/60">Your Tier</div>
                  <div className="text-xl font-bold text-gradient">Gold Member</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70">Credit Score</span>
                  <span className="font-bold text-accent">850/1000</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-gradient-to-r from-accent to-primary rounded-full" />
                </div>
              </div>
            </div>

            {/* Floating card 2 */}
            <div
              className="absolute top-32 right-0 w-64 gradient-border rounded-2xl p-6 bg-background/80 backdrop-blur-sm animate-float"
              style={{ animationDuration: '7s', animationDelay: '1s' }}
            >
              <div className="text-3xl mb-3">💰</div>
              <div className="text-sm text-foreground/60 mb-1">Available to Borrow</div>
              <div className="text-3xl font-bold text-gradient mb-3">$45,000</div>
              <div className="text-xs text-foreground/50">
                Based on your 0.5 BTC collateral + reputation multiplier
              </div>
            </div>

            {/* Floating card 3 */}
            <div
              className="absolute bottom-20 left-8 w-56 gradient-border rounded-2xl p-6 bg-background/80 backdrop-blur-sm animate-float"
              style={{ animationDuration: '8s', animationDelay: '2s' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">⚡</div>
                <div className="text-sm font-semibold text-accent">Active Loan</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Amount</span>
                  <span className="font-bold">12,500 kUSD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">APR</span>
                  <span className="font-bold text-green-400">3.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Health</span>
                  <span className="font-bold text-accent">Excellent</span>
                </div>
              </div>
            </div>

            {/* Floating card 4 */}
            <div
              className="absolute bottom-0 right-12 w-48 gradient-border rounded-2xl p-5 bg-background/80 backdrop-blur-sm animate-float"
              style={{ animationDuration: '9s', animationDelay: '3s' }}
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-xs text-foreground/60 mb-2">Recent Achievement</div>
              <div className="text-sm font-bold text-foreground mb-1">
                6 Month Streak
              </div>
              <div className="text-xs text-foreground/50">
                +100 reputation points
              </div>
            </div>

            {/* Decorative floating particles */}
            <div className="absolute top-20 left-20 w-3 h-3 bg-accent rounded-full animate-float blur-sm" style={{ animationDuration: '5s' }} />
            <div className="absolute top-40 right-20 w-2 h-2 bg-primary rounded-full animate-float blur-sm" style={{ animationDuration: '6s', animationDelay: '1s' }} />
            <div className="absolute bottom-40 left-32 w-4 h-4 bg-blue-400 rounded-full animate-float blur-sm" style={{ animationDuration: '7s', animationDelay: '2s' }} />
            <div className="absolute bottom-20 right-32 w-3 h-3 bg-purple-400 rounded-full animate-float blur-sm" style={{ animationDuration: '8s', animationDelay: '3s' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
