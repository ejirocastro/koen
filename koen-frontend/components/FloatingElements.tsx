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

          {/* Right side - Floating Bitcoin Image */}
          <div className="relative h-[600px] flex items-center justify-center">
            {/* Glowing background effects */}
            <div className="absolute inset-0 bg-gradient-radial from-accent/20 via-transparent to-transparent blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute inset-0 bg-gradient-to-r from-accent/15 to-primary/15 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }} />

            {/* Main floating Bitcoin image */}
            <div className="relative animate-float" style={{ animationDuration: '6s' }}>
              {/* Glow effect behind image */}
              <div className="absolute inset-0 bg-accent/30 rounded-full blur-3xl" />

              <img
                src="/btc.png"
                alt="Bitcoin - Powered Lending"
                className="relative z-10 w-full max-w-md lg:max-w-lg drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 20px 40px rgba(52, 211, 153, 0.3)) brightness(1.1)'
                }}
              />

              {/* Additional glow layers */}
              <div className="absolute inset-0 bg-gradient-to-t from-accent/20 via-transparent to-primary/20 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Decorative floating particles around Bitcoin */}
            <div className="absolute top-20 left-20 w-4 h-4 bg-accent rounded-full animate-float blur-sm" style={{ animationDuration: '5s' }} />
            <div className="absolute top-40 right-20 w-3 h-3 bg-primary rounded-full animate-float blur-sm" style={{ animationDuration: '6s', animationDelay: '1s' }} />
            <div className="absolute bottom-40 left-32 w-5 h-5 bg-accent/80 rounded-full animate-float blur-sm" style={{ animationDuration: '7s', animationDelay: '2s' }} />
            <div className="absolute bottom-20 right-32 w-3 h-3 bg-emerald-400 rounded-full animate-float blur-sm" style={{ animationDuration: '8s', animationDelay: '3s' }} />
            <div className="absolute top-1/2 left-10 w-2 h-2 bg-primary rounded-full animate-float blur-sm" style={{ animationDuration: '9s', animationDelay: '4s' }} />
            <div className="absolute top-1/3 right-16 w-4 h-4 bg-accent/70 rounded-full animate-float blur-sm" style={{ animationDuration: '10s', animationDelay: '2.5s' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
