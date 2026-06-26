import React, { useState, useEffect } from 'react';
import { Investment } from '../types';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Activity, 
  Briefcase,
  Layers,
  Award
} from 'lucide-react';

interface DashboardProps {
  liveBalance: string;
  selectedToken: string;
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  liveBalance, 
  selectedToken,
  setActiveTab
}) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [simulatedBalance, setSimulatedBalance] = useState<number>(10000);

  // Load state from localStorage on mount
  useEffect(() => {
    // 1. Investments
    const storedInvestments = localStorage.getItem('credora_investments');
    if (storedInvestments) {
      try {
        setInvestments(JSON.parse(storedInvestments));
      } catch (e) {
        setInvestments([]);
      }
    } else {
      // Set some initial mock investments so the dashboard has rich content on first load
      const initialInvestments: Investment[] = [
        {
          id: 'inv-init-1',
          opportunityId: 'opp-1',
          opportunityTitle: 'Solar Power Microgrid Expansion',
          opportunityLocation: 'Kisumu County, Kenya',
          amount: 2500,
          date: 'May 12, 2026',
          expectedRor: 12.5,
          status: 'Active',
          termMonths: 24,
          accruedReturn: 41.67
        },
        {
          id: 'inv-init-2',
          opportunityId: 'opp-4',
          opportunityTitle: 'Artisan Textile Cooperative Facility',
          opportunityLocation: 'Sacred Valley, Cusco, Peru',
          amount: 1000,
          date: 'Jun 02, 2026',
          expectedRor: 9.8,
          status: 'Active',
          termMonths: 12,
          accruedReturn: 8.17
        }
      ];
      localStorage.setItem('credora_investments', JSON.stringify(initialInvestments));
      setInvestments(initialInvestments);
    }

    // 2. Simulated Balance
    const storedSimBalance = localStorage.getItem('credora_simulated_balance');
    if (storedSimBalance) {
      setSimulatedBalance(parseFloat(storedSimBalance));
    } else {
      localStorage.setItem('credora_simulated_balance', '10000');
      setSimulatedBalance(10000);
    }
  }, []);

  // Calculate stats
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalAccruedReturns = investments.reduce((sum, inv) => sum + inv.accruedReturn, 0);
  
  // Weighted Average APY calculation
  const averageApy = totalInvested > 0
    ? (investments.reduce((sum, inv) => sum + (inv.amount * inv.expectedRor), 0) / totalInvested).toFixed(1)
    : '0.0';

  // Total Portfolio Value
  const realBalanceNum = parseFloat(liveBalance) || 0;
  const portfolioTotalValue = totalInvested + simulatedBalance + realBalanceNum;

  // Render dummy chart points based on actual portfolio value
  const chartPoints = [
    { label: 'Jan', value: portfolioTotalValue * 0.85 },
    { label: 'Feb', value: portfolioTotalValue * 0.88 },
    { label: 'Mar', value: portfolioTotalValue * 0.91 },
    { label: 'Apr', value: portfolioTotalValue * 0.94 },
    { label: 'May', value: portfolioTotalValue * 0.97 },
    { label: 'Jun', value: portfolioTotalValue }
  ];

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
          <p className="text-xs font-mono text-emerald-500 font-bold tracking-widest uppercase">
            INVESTOR CONSOLE
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans mt-1">
            Global Portfolio Overview
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 bg-[#12141A] border border-[#222731] px-4 py-2 rounded-xl text-xs font-mono text-slate-300">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Network: Mainnet-beta
          </span>
          <button 
            onClick={() => setActiveTab('opportunities')}
            className="px-4 py-2 bg-emerald-500 text-black font-semibold rounded-xl text-xs font-mono tracking-wider hover:bg-emerald-400 transition hover:scale-[1.02] cursor-pointer"
          >
            BROWSE POOLS
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Value */}
        <div className="bg-[#0E1014] border border-[#222731] rounded-2xl p-6 relative overflow-hidden group text-left">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition duration-300" />
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 uppercase">
              <span>PORTFOLIO VALUE</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                ${portfolioTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">
                Asset Allocation: USD Stablecoins + Yield
              </p>
            </div>
          </div>
        </div>

        {/* Active Capital */}
        <div className="bg-[#0E1014] border border-[#222731] rounded-2xl p-6 relative overflow-hidden group text-left">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" />
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 uppercase">
              <span>ACTIVE INVESTMENTS</span>
              <Briefcase className="w-4 h-4 text-blue-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">
                Locked in {investments.length} global micro-finance pools
              </p>
            </div>
          </div>
        </div>

        {/* Accrued Yield */}
        <div className="bg-[#0E1014] border border-[#222731] rounded-2xl p-6 relative overflow-hidden group text-left">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 uppercase">
              <span>ACCRUED INTEREST</span>
              <DollarSign className="w-4 h-4 text-amber-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
                +${totalAccruedReturns.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">
                Accruing daily from dynamic enterprise yield
              </p>
            </div>
          </div>
        </div>

        {/* Average APY */}
        <div className="bg-[#0E1014] border border-[#222731] rounded-2xl p-6 relative overflow-hidden group text-left">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 uppercase">
              <span>WEIGHTED APY</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                {averageApy}%
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">
                Vetted local business yield index
              </p>
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
            <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
              +14.2% GROWTH
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

          {/* Liquid balances block */}
          <div className="pt-4 border-t border-[#222731] grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#121419] p-4 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono font-bold block">CONNECTED WALLET BALANCE</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-white">
                  {parseFloat(liveBalance) ? parseFloat(liveBalance).toFixed(4) : '0.00'}
                </span>
                <span className="text-xs text-slate-400 font-mono">{selectedToken}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-mono leading-relaxed">
                Available to deploy via multi-chain deposit router.
              </p>
            </div>

            <div className="bg-[#121419] p-4 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono font-bold block">SIMULATED VIRTUAL CASH</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-white">
                  ${simulatedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-emerald-400 font-mono">USD</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-mono leading-relaxed">
                Test balances provided for paper investment trials.
              </p>
            </div>
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
              <Award className="w-4 h-4" /> IMPACT INDEX
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Your investments support 100% green solar deployment in Kenya, double sustainable artisan cooperative incomes in Cusco Peru, and fund eco-aligned micro-enterprises globally.
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
                      +${inv.accruedReturn.toFixed(2)}
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
