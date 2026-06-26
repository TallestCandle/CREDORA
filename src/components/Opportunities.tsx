import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { BusinessOpportunity, Investment } from '../types';
import { 
  Globe, 
  MapPin, 
  Calendar, 
  Shield, 
  CheckCircle, 
  Search, 
  Filter, 
  DollarSign, 
  Info, 
  TrendingUp, 
  Sparkles, 
  X,
  AlertTriangle,
  Bot
} from 'lucide-react';

interface OpportunitiesProps {
  liveBalance: string;
  refreshBalance: () => void;
  selectedToken: string;
  onAskAI?: (prompt?: string, opp?: BusinessOpportunity | null) => void;
  opportunities: BusinessOpportunity[];
  setOpportunities: (opps: BusinessOpportunity[]) => void;
}

export const Opportunities: React.FC<OpportunitiesProps & { onInvestClick?: (opp: BusinessOpportunity) => void }> = ({ 
  liveBalance, 
  refreshBalance,
  selectedToken,
  onAskAI,
  opportunities,
  setOpportunities,
  onInvestClick
}) => {
  const { authenticated, login } = usePrivy();
  
  // Local state for opportunities
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get categories dynamically
  const categories = ['All', ...new Set(opportunities.map(opp => opp.category))];

  // Filtered list
  const filteredOpps = opportunities.filter((opp) => {
    const matchesCategory = selectedCategory === 'All' || opp.category === selectedCategory;
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          opp.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          opp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          opp.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950/20 via-slate-900 to-slate-950 border border-[#222731] rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono tracking-wider uppercase">
            <Globe className="w-3.5 h-3.5 animate-spin-slow" /> Global Micro-Finance Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight">
            Invest in Real Local Businesses Globally
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            By connecting local entrepreneurs directly to global micro-capital, Credora reduces funding friction. Hand-vetted brick-and-mortar opportunities offering predictable returns backed by real-world assets.
          </p>
          <button 
            onClick={() => onAskAI && onAskAI()}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer"
          >
            <Bot className="w-4 h-4" /> Ask Credora AI
          </button>
        </div>
        <div className="bg-[#111318]/90 border border-[#222731] p-5 rounded-xl text-left space-y-3 min-w-[240px] shadow-lg">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
            <Sparkles className="w-4 h-4 text-emerald-400" /> SYSTEM STATUS
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span>Active Yield pools:</span>
              <span className="text-white font-bold">{opportunities.length} Pools</span>
            </div>
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span>Avg. expected yield:</span>
              <span className="text-emerald-400 font-bold">13.6% APY</span>
            </div>
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span>Vetting framework:</span>
              <span className="text-white font-bold">Grade A - Tier 1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#0E1014] p-4 rounded-xl border border-[#222731]">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by country, title, owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#15171D] border border-[#252B37] text-white text-sm rounded-lg focus:outline-none focus:border-emerald-500/50 font-mono"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto scrollbar-hide py-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-xs font-mono tracking-wider font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === category
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/10'
                  : 'bg-[#15171D] border border-[#252B37] text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {category.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of opportunities */}
      {filteredOpps.length === 0 ? (
        <div className="text-center py-16 bg-[#0E1014] rounded-xl border border-[#222731]">
          <Filter className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-mono text-sm">No investment pools match your search criteria.</p>
          <button 
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="mt-4 px-4 py-2 bg-[#222731] hover:bg-slate-800 text-white rounded-lg text-xs font-mono cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpps.map((opp) => {
            const raisedPercent = Math.round((opp.raisedAmount / opp.targetAmount) * 100);
            return (
              <div 
                key={opp.id}
                className="bg-[#0E1014] border border-[#222731] hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-emerald-500/2 group text-left"
              >
                {/* Image & Badges */}
                <div className="h-48 w-full relative overflow-hidden bg-slate-900">
                  <img 
                    src={opp.imageUrl} 
                    alt={opp.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  
                  {/* Category and location badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                    <span className="px-2.5 py-0.5 bg-black/80 border border-white/10 backdrop-blur rounded text-[10px] font-bold text-white uppercase font-mono tracking-wider">
                      {opp.category}
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-500 text-black rounded text-[10px] font-bold uppercase font-mono tracking-wider">
                      {opp.expectedRor}% APY EXPECTED
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs text-white font-mono">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    <span>{opp.location}, <strong className="font-semibold text-white">{opp.country}</strong></span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition tracking-tight">
                      {opp.title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                      {opp.description}
                    </p>
                  </div>

                  {/* Funding stats */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="text-left">
                        <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">RAISED OF GOAL</p>
                        <p className="text-sm font-semibold text-white font-mono">
                          ${opp.raisedAmount.toLocaleString()} <span className="text-slate-500 text-xs">/ ${opp.targetAmount.toLocaleString()}</span>
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {raisedPercent}% Full
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${raisedPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-3 bg-[#13161D] p-3.5 rounded-xl border border-[#222731] text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">RISK SCORE</span>
                      <span className={`font-bold flex items-center gap-1 mt-0.5 ${
                        opp.riskScore === 'Low' ? 'text-emerald-400' : opp.riskScore === 'Medium' ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        <Shield className="w-3 h-3" /> {opp.riskScore}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">POOL TERM</span>
                      <span className="text-white font-bold flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" /> {opp.termMonths} Months
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">ASSET STRUCTURE</span>
                      <span className="text-slate-300 font-bold mt-0.5 block">{opp.equityOrDebt}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">MIN ENTRY</span>
                      <span className="text-emerald-400 font-bold mt-0.5 block">${opp.minInvestment} USD</span>
                    </div>
                  </div>

                  {/* Vetted badge */}
                  <div className="flex items-center gap-1.5 text-emerald-500/80 text-[10px] font-mono font-bold bg-emerald-500/5 py-1 px-2.5 rounded-lg border border-emerald-500/10 self-start">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>SPONSORED BY {opp.ownerName.toUpperCase()}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 w-full mt-4">
                    <button
                      onClick={() => {
                        if (onAskAI) {
                          onAskAI(`I'd like to learn more about the ${opp.title} opportunity.`, opp);
                        }
                      }}
                      className="flex-1 py-3 bg-[#111318] border border-[#222731] hover:bg-slate-800 text-slate-300 font-mono text-[10px] font-bold uppercase rounded-xl tracking-wider transition duration-150 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Bot className="w-3.5 h-3.5" /> ASK AI
                    </button>
                    <button
                      onClick={() => {
                        if (onInvestClick) {
                          onInvestClick(opp);
                        }
                      }}
                      disabled={raisedPercent >= 100}
                      className={`flex-[2] py-3 font-mono text-xs font-bold uppercase rounded-xl tracking-wider transition duration-150 cursor-pointer ${
                        raisedPercent >= 100
                          ? 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-white hover:bg-slate-200 text-black hover:scale-[1.01]'
                      }`}
                    >
                      {raisedPercent >= 100 ? 'FUNDED' : 'BACK OPPORTUNITY'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
