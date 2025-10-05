export default function CTA() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-primary/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Ready to Unlock Your
          <br />
          <span className="text-gradient">Bitcoin's Potential?</span>
        </h2>

        <p className="text-xl text-foreground/70 max-w-2xl mx-auto mb-12">
          Join the future of reputation-based lending. Start building your on-chain credit score today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button className="px-10 py-5 bg-accent hover:bg-accent/90 text-background font-bold text-lg rounded-lg transition-all glow hover:glow-strong transform hover:scale-105">
            Launch App
          </button>
          <button className="px-10 py-5 bg-transparent border-2 border-accent/50 hover:border-accent text-foreground font-bold text-lg rounded-lg transition-all hover:bg-accent/10">
            Read Documentation
          </button>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-2xl mb-2">
              ⚡
            </div>
            <h3 className="font-bold text-foreground">Instant Setup</h3>
            <p className="text-sm text-foreground/60">Connect wallet and start in minutes</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-2xl mb-2">
              🔒
            </div>
            <h3 className="font-bold text-foreground">Secure & Audited</h3>
            <p className="text-sm text-foreground/60">Battle-tested smart contracts</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-2xl mb-2">
              💎
            </div>
            <h3 className="font-bold text-foreground">High Returns</h3>
            <p className="text-sm text-foreground/60">Maximize your capital efficiency</p>
          </div>
        </div>
      </div>
    </section>
  );
}
