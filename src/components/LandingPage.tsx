import React from 'react';
import { ArrowRight, ShieldCheck, TrendingUp, Zap } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-[#0B0D11] text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute inset-0 z-0 opacity-40">
           <img 
            src="/src/assets/images/landing_hero_image_1782545522284.jpg"
            alt="Hero Background"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
           />
        </div>
        
        <div className="relative z-10 max-w-4xl space-y-8">
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-white font-sans leading-tight">
                Empowering <span className="text-emerald-500">Global</span> Micro-Finance.
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 font-mono max-w-2xl mx-auto leading-relaxed">
                Seamless, transparent yield generation backed by vetted enterprise micro-enterprises.
            </p>
            
            <button 
                onClick={onLogin}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-bold font-mono text-lg rounded-2xl transition flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
                CONNECT WALLET <ArrowRight className="w-5 h-5" />
            </button>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-[#0E1014]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 text-left">
            {[
                { icon: ShieldCheck, title: "Secure MPC Wallets", desc: "Enterprise-grade security for your digital assets." },
                { icon: TrendingUp, title: "Dynamic Yield", desc: "Accruing daily returns from real-world business activities." },
                { icon: Zap, title: "Instant Routing", desc: "Multi-chain deposit routing for maximum efficiency." }
            ].map((feature, i) => (
                <div key={i} className="space-y-4">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                        <feature.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold font-sans tracking-tight">{feature.title}</h3>
                    <p className="text-slate-400 font-mono text-sm leading-relaxed">{feature.desc}</p>
                </div>
            ))}
        </div>
      </section>
    </div>
  );
};
