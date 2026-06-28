import React, { useState } from 'react';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp, 
  Users, 
  Globe, 
  Car,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingPageProps {
  onLogin: () => void;
}

const PAGES = [
  {
    type: 'cover',
    title: 'CREDORA',
    subtitle: 'Collective Growth Anthology',
    description: 'Flip to discover how we democratize high-yield ventures in emerging markets.',
    image: '/src/assets/images/emerging_market_growth_1782682852496.jpg'
  },
  {
    type: 'content',
    title: 'The Capital Barrier',
    icon: Target,
    text: "Lucrative ventures in emerging economies often require massive upfront capital. For individual small-scale investors, these doors have traditionally been locked.",
    stat: "90%",
    statDesc: "of high-yield emerging ventures are inaccessible to retail investors."
  },
  {
    type: 'content',
    title: 'Pooling Power',
    icon: Users,
    text: "Credora changes the equation. We enable thousands of individuals to pool their capital, creating a combined force capable of funding enterprise-level projects.",
    stat: "$50",
    statDesc: "Minimum investment to start owning fractional real-world assets."
  },
  {
    type: 'example',
    title: 'The Uber Example',
    icon: Car,
    text: "Want to own a ride-sharing vehicle but lack $20,000? Pool funds with 200 others. Together, you buy the car, it generates monthly revenue, and you all share the profit proportionally.",
    image: '/src/assets/images/fractional_ownership_cars_1782682838378.jpg'
  },
  {
    type: 'cta',
    title: 'Write Your Story',
    icon: Globe,
    text: "Your capital, combined with the community, funds the future of emerging markets. Secure, transparent, and high-yield.",
    button: 'LAUNCH APP'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev

  const handleNext = () => {
    if (currentPage < PAGES.length - 1 && !isFlipping) {
      setDirection(1);
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsFlipping(false);
      }, 600);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0 && !isFlipping) {
      setDirection(-1);
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(prev => prev - 1);
        setIsFlipping(false);
      }, 600);
    }
  };

  const page = PAGES[currentPage];

  return (
    <div className="min-h-screen bg-[#060709] text-white flex flex-col items-center justify-center p-4 md:p-6 font-sans overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-emerald-500/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none"></div>
      
      {/* Main Book Container */}
      <div className="relative w-full max-w-5xl h-[750px] md:h-[650px] flex items-center justify-center perspective-[2000px]">
        
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            initial={{ 
              rotateY: direction > 0 ? 90 : -90, 
              opacity: 0,
              scale: 0.9
            }}
            animate={{ 
              rotateY: 0, 
              opacity: 1,
              scale: 1
            }}
            exit={{ 
              rotateY: direction > 0 ? -90 : 90, 
              opacity: 0,
              scale: 0.9
            }}
            transition={{ 
              duration: 0.6, 
              ease: [0.4, 0, 0.2, 1] 
            }}
            className="w-full h-full max-w-4xl bg-[#111318] border border-white/10 rounded-[30px] md:rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row transform-gpu"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Logo in the Center Top of the Card */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-50 pointer-events-none">
              <img 
                src="https://i.postimg.cc/zvC7hNHC/Chat-GPT-Image-Jun-28-2026-03-57-29-PM.png"
                alt="Logo"
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-contain bg-[#111318] p-1 border border-white/10 shadow-lg"
                referrerPolicy="no-referrer"
              />
              <span className="font-bold tracking-[0.2em] text-[10px] md:text-xs font-mono uppercase opacity-50">CREDORA</span>
            </div>

            {/* Left Side: Visual/Stat */}
            <div className="w-full md:w-1/2 h-[40%] md:h-full bg-[#0E1014] border-b md:border-b-0 md:border-r border-white/5 relative overflow-hidden flex flex-col items-center justify-center p-8 md:p-12">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
              </div>

              {page.type === 'cover' && page.image && (
                <img src={page.image} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
              )}

              {page.type === 'content' && (
                <div className="relative z-10 text-center space-y-2 md:space-y-4 pt-8 md:pt-0">
                  <div className="w-12 h-12 md:w-20 md:h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-4 md:mb-8">
                    {page.icon && <page.icon className="w-6 h-6 md:w-10 md:h-10" />}
                  </div>
                  <h4 className="text-4xl md:text-6xl font-bold text-white font-mono tracking-tighter">{page.stat}</h4>
                  <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em]">{page.statDesc}</p>
                </div>
              )}

              {page.type === 'example' && page.image && (
                <div className="relative w-full h-full p-2 md:p-4 pt-12 md:pt-4">
                  <img src={page.image} alt="Example" className="w-full h-full object-cover rounded-xl md:rounded-2xl border border-white/10 shadow-xl" />
                  <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10 bg-black/80 backdrop-blur-md p-3 md:p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Car className="text-emerald-500 w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-[10px] md:text-xs font-mono font-bold">Fractional Ride-Sharing Model</span>
                    </div>
                  </div>
                </div>
              )}

              {page.type === 'cta' && (
                <div className="relative z-10 text-center pt-8 md:pt-0">
                  <div className="w-20 h-20 md:w-32 md:h-32 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-4 md:mb-8 animate-pulse shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                    <TrendingUp className="w-10 h-10 md:w-16 md:h-16" />
                  </div>
                  <p className="text-slate-400 font-mono text-[10px] md:text-sm">Collective Yield Anthology v1.0</p>
                </div>
              )}
            </div>

            {/* Right Side: Narrative */}
            <div className="w-full md:w-1/2 h-[60%] md:h-full p-8 md:p-16 flex flex-col justify-center space-y-6 md:space-y-8 bg-[#111318]">
              <div className="space-y-2 md:space-y-4">
                <span className="text-emerald-500 font-mono text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em]">
                  {page.type === 'cover' ? 'Introduction' : `Chapter 0${currentPage}`}
                </span>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tighter leading-[0.95] md:leading-[0.9] text-white">
                  {page.title}
                </h2>
                {page.subtitle && (
                  <p className="text-slate-400 font-serif italic text-lg md:text-xl">{page.subtitle}</p>
                )}
              </div>

              <p className="text-slate-400 text-base md:text-lg leading-relaxed font-sans">
                {page.text || page.description}
              </p>

              <div className="pt-4">
                {page.type === 'cta' ? (
                  <button 
                    onClick={onLogin}
                    className="group w-full md:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-lg rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(16,185,129,0.2)] hover:-translate-y-1"
                  >
                    {page.button}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button 
                    onClick={handleNext}
                    className="flex items-center gap-2 text-white/50 hover:text-emerald-500 font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Turn Page <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Page Navigation Controls */}
        <div className="absolute -bottom-16 md:-bottom-20 flex items-center gap-4 md:gap-6">
          <button 
            onClick={handlePrev}
            disabled={currentPage === 0 || isFlipping}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition disabled:opacity-0"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <div className="flex gap-1.5 md:gap-2">
            {PAGES.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-500 ${i === currentPage ? 'w-6 md:w-8 bg-emerald-500' : 'w-1.5 md:w-2 bg-white/10'}`}
              />
            ))}
          </div>

          <button 
            onClick={handleNext}
            disabled={currentPage === PAGES.length - 1 || isFlipping}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition disabled:opacity-0"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* Footer / Skip */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8">
        <button 
          onClick={onLogin}
          className="text-slate-600 hover:text-emerald-500 font-mono text-[9px] md:text-[10px] uppercase tracking-widest transition"
        >
          Skip to Dashboard
        </button>
      </div>
    </div>
  );
};

