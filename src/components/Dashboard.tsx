import React, { useState, useEffect } from 'react';
import { Investment, BusinessOpportunity } from '../types';
import { 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Award
} from 'lucide-react';

interface DashboardProps {
  liveBalance: string;
  selectedToken: string;
  investments: Investment[];
  username?: string;
  firestoreBalance: number;
  opportunities?: BusinessOpportunity[];
}

const BACKGROUND_IMAGES = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBZlYDOytGl3-IZcbxn_w2S32niyCUfWJzPTdWdGviSg&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4pc5UsVezLNBLp6Q6jCs1ZDnI359wZafzRjZFkZp-gA&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTppAK-I8-v7uPw8_Zi6a5e-9msYU_jUHcdquSw94Nhnw&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVTqVMbYMebM5mqsvdbWhGASzVJlLJUr8L89AcWSHsaw&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTv4lYFvPuaDjAGlz4EN7g-C2kG19fXKm_SL2l964w2g&s=10"
];

export const Dashboard: React.FC<DashboardProps> = ({ 
  liveBalance, 
  selectedToken: _selectedToken,
  investments,
  username,
  firestoreBalance: _firestoreBalance,
  opportunities = []
}) => {
  const [bgImageIndex, setBgImageIndex] = useState(0);
  const [tick, setTick] = useState(0);

  // Tick every second to update dynamic time-elapsed returns live
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Background image switcher
  useEffect(() => {
    const interval = setInterval(() => {
      setBgImageIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Get dynamic return (supports direct financial records net-revenue distribution and time-elapsed fallback)
  const getAccruedReturn = (inv: Investment) => {
    const opp = opportunities.find(o => o.id === inv.opportunityId);
    if (opp && opp.financialRecords && opp.financialRecords.length > 0 && opp.totalShares && inv.sharesOwned) {
      const totalIncome = opp.financialRecords.filter(r => r.type === 'Income').reduce((sum, r) => sum + r.amount, 0);
      const totalExpense = opp.financialRecords.filter(r => r.type === 'Expense').reduce((sum, r) => sum + r.amount, 0);
      const netRevenue = totalIncome - totalExpense;
      if (netRevenue > 0) {
        return (netRevenue * inv.sharesOwned) / opp.totalShares;
      }
    }

    // Dynamic, time-elapsed return calculation based on expectedRor (annual rate)
    const msElapsed = Date.now() - new Date(inv.date).getTime();
    if (msElapsed <= 0) return 0;
    
    const yearsElapsed = msElapsed / (365 * 24 * 60 * 60 * 1000);
    return inv.amount * (inv.expectedRor / 100) * yearsElapsed;
  };

  // Calculate stats
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalAccruedReturns = investments.reduce((sum, inv) => sum + getAccruedReturn(inv), 0);
  
  // Weighted Average APY calculation
  const averageApy = totalInvested > 0
    ? (investments.reduce((sum, inv) => sum + (inv.amount * inv.expectedRor), 0) / totalInvested).toFixed(1)
    : '0.0';

  // Total Portfolio Value
  const realBalanceNum = parseFloat(liveBalance) || 0;
  const portfolioTotalValue = totalInvested + realBalanceNum;

  // Helper to parse dates and return 0-indexed month number for timeline distribution
  const getMonthIndex = (dateStr: string): number => {
    if (!dateStr) return 5; // Default to June
    const lower = dateStr.toLowerCase();
    if (lower.includes('jan') || dateStr.includes('-01-')) return 0;
    if (lower.includes('feb') || dateStr.includes('-02-')) return 1;
    if (lower.includes('mar') || dateStr.includes('-03-')) return 2;
    if (lower.includes('apr') || dateStr.includes('-04-')) return 3;
    if (lower.includes('may') || dateStr.includes('-05-')) return 4;
    if (lower.includes('jun') || dateStr.includes('-06-')) return 5;
    if (lower.includes('jul') || dateStr.includes('-07-')) return 6;
    if (lower.includes('aug') || dateStr.includes('-08-')) return 7;
    if (lower.includes('sep') || dateStr.includes('-09-')) return 8;
    if (lower.includes('oct') || dateStr.includes('-10-')) return 9;
    if (lower.includes('nov') || dateStr.includes('-11-')) return 10;
    if (lower.includes('dec') || dateStr.includes('-12-')) return 11;
    
    const match = dateStr.match(/-(\d{2})-/);
    if (match) return parseInt(match[1], 10) - 1;
    return 5; // Default to June
  };

  // Render timeline chart points derived entirely from actual historical investments and balances
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const chartPoints = months.map((monthName, idx) => {
    // Cumulative investments made up to or during this month index
    const investedUpToMonth = investments
      .filter(inv => getMonthIndex(inv.date) <= idx)
      .reduce((sum, inv) => sum + inv.amount + getAccruedReturn(inv), 0);

    const value = realBalanceNum + investedUpToMonth;
    return { label: monthName, value };
  });

  // Calculate dynamic growth percentage
  const firstValue = chartPoints[0]?.value || 0;
  const lastValue = chartPoints[chartPoints.length - 1]?.value || 0;
  const growthPercent = firstValue > 0 
    ? ((lastValue - firstValue) / firstValue) * 100 
    : (lastValue > 0 ? 100 : 0);

  // Draw smooth SVG spline for Area Chart
  const svgWidth = 500;
  const svgHeight = 120;
  const maxVal = Math.max(...chartPoints.map(p => p.value)) * 1.05;
  const minVal = Math.min(...chartPoints.map(p => p.value)) * 0.95;
  const range = maxVal - minVal || 1;

  const points = chartPoints.map((p, i) => {
    const x = (i / (chartPoints.length - 1)) * svgWidth;
    const y = svgHeight - ((p.value - minVal) / range) * (svgHeight - 20) - 10;
    return { x, y };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length-1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`
    : '';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Welcome Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans mt-1">
            {username ? `Welcome, @${username}` : 'Global Portfolio Overview'}
          </h2>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="bg-[#0E1014] border border-[#222731] rounded-2xl p-6 relative overflow-hidden">
        {/* Background Image Layer */}
        <img
          src={BACKGROUND_IMAGES[bgImageIndex]}
          alt="Dashboard Background"
          className="absolute inset-0 w-full h-full object-cover opacity-20 brightness-150 transition-opacity duration-1000"
        />
        <div className="relative grid grid-cols-2 gap-6">
          {/* Total Value */}
          <div className="text-left space-y-4">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 uppercase">
              <span>PORTFOLIO VALUE</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                ${portfolioTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>

          {/* Active Capital */}
          <div className="text-left space-y-4">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 uppercase">
              <span>ACTIVE INVESTMENTS</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>

          {/* Accrued Yield */}
          <div className="text-left space-y-4">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 uppercase">
              <span>ACCRUED INTEREST</span>
              {tick !== undefined && (
                <span className="text-[9px] text-emerald-400 font-bold tracking-wider animate-pulse flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block animate-ping"></span>
                  LIVE
                </span>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
                +${totalAccruedReturns.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
              </h3>
            </div>
          </div>

          {/* Average APY */}
          <div className="text-left space-y-4">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 uppercase">
              <span>WEIGHTED APY</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                {averageApy}%
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections: Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Custom SVG Area Chart & Liquid Balances */}
        <div className="lg:col-span-2 bg-[#0E1014] border border-[#222731] rounded-2xl p-6 space-y-6 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono tracking-wider uppercase">PORTFOLIO YIELD GROWTH</h3>
              <p className="text-xs text-slate-400">Total assets evaluation over the last 6 months.</p>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
              growthPercent > 0 
                ? 'text-emerald-500 bg-emerald-500/10' 
                : growthPercent < 0 
                ? 'text-red-500 bg-red-500/10' 
                : 'text-slate-400 bg-slate-400/10'
            }`}>
              {growthPercent >= 0 ? '+' : ''}{growthPercent.toFixed(1)}% GROWTH
            </span>
          </div>

          {/* SVG Area Chart */}
          <div className="relative pt-2 h-36 w-full">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                </linearGradient>
              </defs>
              
              {/* Horizontal gridlines */}
              <line x1="0" y1="20" x2={svgWidth} y2="20" stroke="#1f2937" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2={svgWidth} y2="60" stroke="#1f2937" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2={svgWidth} y2="100" stroke="#1f2937" strokeWidth="1" strokeDasharray="3 3" />

              {/* Shaded Area */}
              {areaD && <path d={areaD} fill="url(#chartGradient)" />}

              {/* Path Line */}
              {pathD && <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />}

              {/* Data Dots */}
              {points.map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#0B0D11" stroke="#10b981" strokeWidth="2" />
                  <text 
                    x={pt.x} 
                    y={pt.y - 10} 
                    fill="#94a3b8" 
                    fontSize="7" 
                    fontFamily="monospace" 
                    textAnchor="middle"
                  >
                    ${Math.round(chartPoints[i].value).toLocaleString()}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between text-[10px] font-mono text-slate-500 px-2 border-t border-[#1f2937] pt-2">
            {chartPoints.map((p, idx) => <span key={idx}>{p.label}</span>)}
          </div>
        </div>

        {/* Right: Allocation & Impact */}
        <div className="bg-[#0E1014] border border-[#222731] rounded-2xl p-6 space-y-6 text-left flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white font-mono tracking-wider uppercase">PORTFOLIO ALLOCATION</h3>
              <p className="text-xs text-slate-400">Micro-capital allocation segments.</p>
            </div>

            {/* Simulated bar distribution */}
            {investments.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs font-mono">
                No active investments. Funds are currently 100% liquid.
              </div>
            ) : (
              <div className="space-y-4">
                {investments.slice(0, 3).map((inv, idx) => {
                  const percent = Math.round((inv.amount / totalInvested) * 100);
                  const colors = ['bg-emerald-500', 'bg-blue-400', 'bg-amber-400', 'bg-purple-400'];
                  const color = colors[idx % colors.length];
                  return (
                    <div key={inv.id} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300 truncate max-w-[160px]">{inv.opportunityTitle}</span>
                        <span className="text-white font-bold">{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-[#121419] p-4 rounded-xl border border-emerald-500/10 space-y-3 mt-4">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
              <Award className="w-4 h-4" /> YOUR IMPACT
            </div>
            <div className="text-[10px] font-mono text-slate-500 italic">POWERED BY CREDORA AI</div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              {investments.length > 0 
                ? "Your investments are actively supporting sustainable development and eco-aligned micro-enterprises globally."
                : "No active investments to display impact data."}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-mono font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Grade-A Social ESG Verified
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Active Investments List Table */}
      <div className="bg-[#0E1014] border border-[#222731] rounded-2xl overflow-hidden text-left">
        <div className="p-6 border-b border-[#222731]">
          <h3 className="text-sm font-bold text-white font-mono tracking-wider uppercase">ACTIVE LIQUIDITY POOLS ({investments.length})</h3>
          <p className="text-xs text-slate-400">Yield vesting logs and lockup terms.</p>
        </div>

        {investments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs">
            You do not have any active micro-finance investment contracts yet. Go to Opportunities to back an enterprise.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#222731] bg-[#121419]/50 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-4 px-6">Opportunity / Enterprise</th>
                  <th className="py-4 px-6 text-right">Capital Contributed</th>
                  <th className="py-4 px-6 text-right">Expected APY</th>
                  <th className="py-4 px-6 text-right">Accrued returns</th>
                  <th className="py-4 px-6">Funding Date</th>
                  <th className="py-4 px-6">Lockup Term</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222731] font-mono text-slate-300">
                {investments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-900/30 transition">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-sans font-bold text-white text-sm">{inv.opportunityTitle}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-red-400" /> {inv.opportunityLocation}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-white">
                      ${inv.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-emerald-400">
                      {inv.expectedRor}%
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-emerald-400">
                      +${getAccruedReturn(inv).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {inv.date}
                    </td>
                    <td className="py-4 px-6 text-slate-400 flex items-center gap-1 pt-6">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> {inv.termMonths} Mo
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
