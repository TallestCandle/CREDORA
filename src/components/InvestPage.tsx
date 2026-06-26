import React, { useState } from 'react';
import { ArrowLeft, Wallet, ShieldCheck, CheckCircle2, TrendingUp } from 'lucide-react';
import { BusinessOpportunity, Investment } from '../types';

interface InvestPageProps {
  opportunity: BusinessOpportunity;
  onBack: () => void;
  onInvest: (investment: Investment) => void;
  ethAddress: string;
}

export const InvestPage: React.FC<InvestPageProps> = ({ opportunity, onBack, onInvest, ethAddress }) => {
  const [investAmount, setInvestAmount] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const numAmount = Number(investAmount);
  
  // Calculate shares based on dynamic setup
  // If sharePrice isn't set, default to $1 per share for generalized, or proportional to target for static.
  const effectiveSharePrice = opportunity.sharePrice || 1; 
  const potentialShares = numAmount > 0 ? Math.floor(numAmount / effectiveSharePrice) : 0;
  
  const estimatedTotalReturn = numAmount > 0 ? numAmount * (1 + opportunity.expectedRor / 100) : 0;

  const handleInvest = () => {
    if (!ethAddress) {
      setErrorMessage('Please login to invest.');
      return;
    }
    
    if (numAmount < opportunity.minInvestment) {
      setErrorMessage(`Minimum investment is $${opportunity.minInvestment.toLocaleString()}`);
      return;
    }

    if (opportunity.fundingType === 'Static' && opportunity.raisedAmount > 0) {
      setErrorMessage('This static opportunity has already been backed.');
      return;
    }

    setIsConfirming(true);
    setErrorMessage('');

    setTimeout(() => {
      const investment: Investment = {
        id: `inv-${Date.now()}`,
        opportunityId: opportunity.id,
        opportunityTitle: opportunity.title,
        opportunityLocation: `${opportunity.location}, ${opportunity.country}`,
        amount: numAmount,
        date: new Date().toISOString(),
        expectedRor: opportunity.expectedRor,
        status: opportunity.fundingType === 'Static' ? 'Pending' : 'Active', // static starts after prep time
        termMonths: opportunity.termMonths,
        accruedReturn: 0,
        sharesOwned: potentialShares
      };

      onInvest(investment);
      setIsConfirming(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-12 p-4 md:p-8">
      <button 
        onClick={onBack}
        className="flex items-center text-slate-400 hover:text-white transition font-mono text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Opportunities
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111318] border border-[#222731] rounded-3xl overflow-hidden">
            <div className="h-64 md:h-80 w-full relative">
              <img src={opportunity.imageUrl} alt={opportunity.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111318] to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider mb-3 ${
                  opportunity.fundingType === 'Static' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {opportunity.fundingType || 'Generalized'} Funding
                </span>
                <h1 className="text-3xl md:text-4xl font-serif text-white">{opportunity.title}</h1>
                <p className="text-slate-300 mt-2 font-mono">{opportunity.location}, {opportunity.country} • by {opportunity.ownerName}</p>
              </div>
            </div>
            
            <div className="p-6 md:p-8 space-y-8">
              <div>
                <h2 className="text-xl font-serif text-white mb-4">About this Opportunity</h2>
                <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                  {opportunity.description}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-[#15171D] border border-[#222731] rounded-2xl">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-mono mb-1">Target</p>
                  <p className="text-lg text-white font-serif">${opportunity.targetAmount.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-[#15171D] border border-[#222731] rounded-2xl">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-mono mb-1">Raised</p>
                  <p className="text-lg text-emerald-400 font-serif">${opportunity.raisedAmount.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-[#15171D] border border-[#222731] rounded-2xl">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-mono mb-1">Est. Return</p>
                  <p className="text-lg text-white font-serif">{opportunity.expectedRor}%</p>
                </div>
                <div className="p-4 bg-[#15171D] border border-[#222731] rounded-2xl">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-mono mb-1">Term</p>
                  <p className="text-lg text-white font-serif">{opportunity.termMonths} mo</p>
                </div>
              </div>

              {opportunity.fundingType === 'Static' && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-200 text-sm font-mono flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0 text-purple-400 mt-0.5" />
                  <p>
                    This is a <strong className="text-purple-400">Static Opportunity</strong>. It requires a single backer to fulfill the entire target amount of ${opportunity.targetAmount.toLocaleString()}. 
                    The investment will begin accruing returns after a {opportunity.preparationDays} day preparation period.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111318] border border-[#222731] rounded-3xl p-6 sticky top-24">
            <h2 className="text-xl font-serif text-white mb-6">Invest Now</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Amount (USDC)</span>
                  <span className="text-slate-500">Min: ${opportunity.minInvestment.toLocaleString()}</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-emerald-400 font-mono">$</span>
                  </div>
                  <input 
                    type="number"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    placeholder={opportunity.fundingType === 'Static' ? opportunity.targetAmount.toString() : '1000'}
                    className="w-full bg-[#15171D] border border-[#252B37] rounded-xl pl-8 pr-4 py-4 text-white font-mono text-lg focus:border-emerald-500/50 outline-none transition"
                  />
                </div>
              </div>

              {numAmount > 0 && (
                <div className="p-4 bg-[#15171D] border border-[#222731] rounded-xl space-y-3 font-mono text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Shares Acquired</span>
                    <span className="text-white font-bold">{potentialShares.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Est. Total Return</span>
                    <span className="text-emerald-400 font-bold">${estimatedTotalReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <p className="text-red-400 text-xs font-mono">{errorMessage}</p>
              )}

              <button 
                onClick={handleInvest}
                disabled={isConfirming || !investAmount}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-black font-mono font-bold text-sm uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
              >
                {isConfirming ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    Confirm Investment
                  </>
                )}
              </button>
              
              <div className="pt-4 border-t border-[#222731]">
                <p className="text-[10px] text-slate-500 font-mono leading-relaxed text-center">
                  By investing, you acquire shares proportional to your investment. Revenue will be distributed automatically to shareholders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
