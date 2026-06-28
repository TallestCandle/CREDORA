import React from 'react';
import { Activity } from 'lucide-react';
import { Investment, BusinessOpportunity } from '../types';

interface PortfolioProps {
  investments: Investment[];
  opportunities: BusinessOpportunity[];
}

export const Portfolio: React.FC<PortfolioProps> = ({ investments, opportunities }) => {
  const [tick, setTick] = React.useState(0);

  // Tick every second to update dynamic time-elapsed returns live
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeInvestments = investments.filter(inv => inv.status === 'Active' || inv.status === 'Pending');
  
  // Calculate total invested
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  
  // Calculate accrued returns dynamically based on actual opportunity financials or time elapsed
  let totalAccrued = 0;

  const enrichedInvestments = investments.map(inv => {
    void tick; // Force evaluation of tick to trigger recalculation on tick updates
    const opp = opportunities.find(o => o.id === inv.opportunityId);
    let calculatedReturn = 0;

    // 1. If opportunity has financial records, use revenue share
    if (opp && opp.financialRecords && opp.financialRecords.length > 0 && opp.totalShares && inv.sharesOwned) {
      const totalIncome = opp.financialRecords.filter(r => r.type === 'Income').reduce((sum, r) => sum + r.amount, 0);
      const totalExpense = opp.financialRecords.filter(r => r.type === 'Expense').reduce((sum, r) => sum + r.amount, 0);
      const netRevenue = totalIncome - totalExpense;

      if (netRevenue > 0) {
        calculatedReturn = (netRevenue * inv.sharesOwned) / opp.totalShares;
      }
    } else {
      // 2. Otherwise, dynamic real-time elapsed accrual based on expectedRor (annual APY)
      const msElapsed = Date.now() - new Date(inv.date).getTime();
      if (msElapsed > 0) {
        const yearsElapsed = msElapsed / (365 * 24 * 60 * 60 * 1000);
        calculatedReturn = inv.amount * (inv.expectedRor / 100) * yearsElapsed;
      }
    }

    totalAccrued += calculatedReturn;

    return {
      ...inv,
      calculatedReturn,
      opp
    };
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in pb-12 p-4 md:p-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif text-white mb-2">Portfolio & Returns</h1>
        <p className="text-slate-400 font-mono text-sm max-w-2xl">
          Track your active investments, shares owned, and real-time revenue distributions.
        </p>
      </div>

      <div className="bg-[#111318] border border-[#222731] rounded-3xl p-8 md:p-10 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 relative z-10">
          <div className="space-y-2">
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em]">Total Invested</p>
            <h3 className="text-3xl md:text-4xl font-serif text-white">${totalInvested.toLocaleString()}</h3>
          </div>
          
          <div className="space-y-2 md:border-x border-[#222731] md:px-12">
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em]">Total Returns</p>
            <h3 className="text-3xl md:text-4xl font-serif text-emerald-400">
              ${totalAccrued.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
            </h3>
          </div>
          
          <div className="space-y-2 md:pl-12">
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em]">Active Holdings</p>
            <h3 className="text-3xl md:text-4xl font-serif text-white">{activeInvestments.length}</h3>
          </div>
        </div>
        
        {/* Subtle background graphic */}
        <div className="absolute -right-24 -top-24 opacity-[0.03] pointer-events-none">
          <Activity className="w-80 h-80 text-white" />
        </div>
      </div>

      <div className="bg-[#111318] border border-[#222731] rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-6">Investment Ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-[#222731]">
                <th className="pb-3 font-normal">Project</th>
                <th className="pb-3 font-normal">Status</th>
                <th className="pb-3 font-normal">Shares Owned</th>
                <th className="pb-3 font-normal">Amount Invested</th>
                <th className="pb-3 font-normal">Returns Earned</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {enrichedInvestments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">You haven't made any investments yet.</td>
                </tr>
              )}
              {enrichedInvestments.map(inv => (
                <tr key={inv.id} className="border-b border-[#222731]/50 last:border-0 hover:bg-slate-800/30">
                  <td className="py-4">
                    <div className="font-semibold text-white">{inv.opportunityTitle}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{inv.opportunityLocation}</div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider ${
                      inv.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' :
                      inv.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4">{inv.sharesOwned?.toLocaleString() || 0}</td>
                  <td className="py-4">${inv.amount.toLocaleString()}</td>
                  <td className="py-4 text-emerald-400 font-semibold">
                    ${inv.calculatedReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
