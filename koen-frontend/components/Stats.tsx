export default function Stats() {
  return (
    <section className="relative py-32 px-6">
      {/* Background with glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-primary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(52,211,153,0.15),transparent_70%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Main stats showcase */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Trusted by the <span className="text-gradient">Bitcoin Community</span>
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Built on Stacks, secured by Bitcoin's proof-of-work
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            { value: "$0M", label: "Total Value Locked", trend: "+0%" },
            { value: "0", label: "Active Users", trend: "+0%" },
            { value: "0", label: "Loans Issued", trend: "+0%" },
            { value: "0%", label: "Liquidation Rate", trend: "-0%" }
          ].map((stat, index) => (
            <div key={index} className="gradient-border rounded-2xl p-8 text-center hover:scale-105 transition-transform">
              <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                {stat.value}
              </div>
              <div className="text-foreground/60 mb-2">{stat.label}</div>
              <div className="text-accent text-sm font-semibold">{stat.trend}</div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="gradient-border rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold mb-2">Audited Smart Contracts</h3>
            <p className="text-foreground/60">Security-first protocol design with multiple audits</p>
          </div>

          <div className="gradient-border rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">Bitcoin Secured</h3>
            <p className="text-foreground/60">Leveraging Bitcoin's security via Stacks blockchain</p>
          </div>

          <div className="gradient-border rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-xl font-bold mb-2">100% Decentralized</h3>
            <p className="text-foreground/60">No central authority, fully on-chain governance</p>
          </div>
        </div>

        {/* Reputation tiers showcase */}
        <div className="mt-20">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Reputation <span className="text-gradient">Tiers</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="gradient-border rounded-2xl p-8 hover:scale-105 transition-transform">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-2xl">
                  🥉
                </div>
                <h4 className="text-2xl font-bold">Bronze</h4>
              </div>
              <div className="space-y-2 text-foreground/70">
                <p>• Score: 0-300</p>
                <p>• Credit Multiplier: 5x</p>
                <p>• Max LTV: 50% + reputation</p>
              </div>
            </div>

            <div className="gradient-border rounded-2xl p-8 hover:scale-105 transition-transform border-accent/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-2xl">
                  🥈
                </div>
                <h4 className="text-2xl font-bold">Silver</h4>
              </div>
              <div className="space-y-2 text-foreground/70">
                <p>• Score: 301-600</p>
                <p>• Credit Multiplier: 10x</p>
                <p>• Max LTV: 50% + reputation</p>
              </div>
            </div>

            <div className="gradient-border rounded-2xl p-8 hover:scale-105 transition-transform border-accent">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center text-2xl">
                  🥇
                </div>
                <h4 className="text-2xl font-bold text-gradient">Gold</h4>
              </div>
              <div className="space-y-2 text-foreground/70">
                <p>• Score: 601-1000</p>
                <p>• Credit Multiplier: 15x</p>
                <p>• Max LTV: 50% + reputation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
