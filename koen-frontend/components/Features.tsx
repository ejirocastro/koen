export default function Features() {
  const features = [
    {
      icon: "🎯",
      title: "Reputation-Based Lending",
      description: "Your on-chain activity builds your credit score. Active Bitcoin users unlock higher borrowing limits beyond traditional collateral ratios."
    },
    {
      icon: "⚡",
      title: "Instant Liquidity",
      description: "Access instant loans against your Bitcoin collateral. Borrow kUSD stablecoin without selling your BTC position."
    },
    {
      icon: "🛡️",
      title: "Soulbound Identity",
      description: "Non-transferable reputation NFTs prove your creditworthiness. Build your financial identity on the blockchain."
    },
    {
      icon: "💎",
      title: "Up to 15x Leverage",
      description: "High-reputation users can borrow significantly more than standard 50% LTV. Maximize capital efficiency with proven track record."
    },
    {
      icon: "🔒",
      title: "Non-Custodial",
      description: "You always maintain full control of your assets. Smart contracts enforce transparent, trustless lending without intermediaries."
    },
    {
      icon: "📊",
      title: "Dynamic Risk Pricing",
      description: "Better reputation means better rates. Your borrowing costs decrease as you build trust through consistent on-chain behavior."
    }
  ];

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gradient">Why Choose Kōen?</span>
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            The first protocol that rewards your Bitcoin activity with increased borrowing power
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="gradient-border rounded-2xl p-8 hover:scale-105 transition-transform duration-300 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors">
                {feature.title}
              </h3>
              <p className="text-foreground/70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* How it works section */}
        <div className="mt-32">
          <h3 className="text-3xl md:text-5xl font-bold text-center mb-16">
            How It <span className="text-gradient">Works</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Connect Wallet", desc: "Link your Stacks wallet to access the protocol" },
              { step: "02", title: "Mint Reputation SBT", desc: "Receive your non-transferable reputation token" },
              { step: "03", title: "Deposit Bitcoin", desc: "Add sBTC as collateral to your lending position" },
              { step: "04", title: "Borrow & Earn", desc: "Access kUSD based on collateral + reputation" }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-accent/20 mb-4">{item.step}</div>
                <h4 className="text-xl font-bold mb-2 text-foreground">{item.title}</h4>
                <p className="text-foreground/60">{item.desc}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 -right-4 w-8 h-0.5 bg-gradient-to-r from-accent to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
