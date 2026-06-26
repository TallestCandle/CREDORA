import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { 
  LayoutDashboard, 
  Globe, 
  ArrowDownLeft, 
  LogOut, 
  Wallet, 
  Copy, 
  Check, 
  ArrowUpRight,
  User,
  Brain,
  ShieldCheck,
  Users,
  Briefcase,
  Database,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  ethAddress: string;
  isAdmin: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, ethAddress, isAdmin, onClose }) => {
  const { authenticated, login, logout, user } = usePrivy();
  const [copied, setCopied] = useState(false);
  const currentUserEmail = user?.email?.address || '';

  const copyAddress = () => {
    if (!ethAddress) return;
    navigator.clipboard.writeText(ethAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'opportunities', label: 'Opportunities', icon: Globe },
    { id: 'portfolio', label: 'Portfolio & Returns', icon: ArrowUpRight },
    { id: 'research', label: 'Credora AI', icon: Brain },
    { id: 'deposit', label: 'Deposit / Wallet', icon: ArrowDownLeft },
  ];

  const adminMenuItems = [
    { id: 'admin-users', label: 'User Management', icon: Users },
    { id: 'admin-business', label: 'Business', icon: Briefcase },
    { id: 'admin-financials', label: 'Financials & Yield', icon: Database },
    ...(currentUserEmail.toLowerCase() === 'eahunanya116@gmail.com' ? [{ id: 'admin-admins', label: 'Platform Admins', icon: Shield }] : [])
  ];

  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <aside className="w-80 border-r border-[#222731] bg-[#0B0D11] flex flex-col h-screen fixed left-0 top-0 z-30">
      <div className="p-6 border-b border-[#222731] flex items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-black text-xl font-mono shadow-[0_0_15px_rgba(255,255,255,0.15)]">
            C
          </div>
          <div>
            <h1 className="text-white text-lg font-bold tracking-wider font-mono">CREDORA</h1>
            <p className="text-[10px] text-emerald-500 font-mono font-bold tracking-widest uppercase">Micro-Finance</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="text-[10px] text-slate-500 font-mono font-bold tracking-widest px-3 mb-3 uppercase">
          NAVIGATION
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition duration-150 text-left cursor-pointer group ${
                isActive 
                  ? 'bg-white text-black font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="font-mono text-sm tracking-wide">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-black rounded-full" />
              )}
            </button>
          );
        })}

        {isAdmin && (
          <>
            <div className="text-[10px] text-slate-500 font-mono font-bold tracking-widest px-3 mb-3 mt-6 uppercase">
              ADMIN PANEL
            </div>
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition duration-150 text-left cursor-pointer group ${
                    isActive 
                      ? 'bg-emerald-500/20 text-emerald-400 font-semibold' 
                      : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                  <span className="font-mono text-sm tracking-wide">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </>
        )}
      </nav>

      {/* User profile & wallet segment */}
      <div className="p-6 border-t border-[#222731] bg-[#0E1015]/80 space-y-4">
        {authenticated ? (
          <>
            {/* User credentials */}
            <div className="flex items-center gap-3 bg-[#151820] p-3 rounded-xl border border-[#222731]">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-mono font-semibold truncate">
                  {user?.email?.address || 'Investor Account'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono font-bold">
                  VERIFIED CLIENT
                </p>
              </div>
            </div>

            {/* Wallet Quickview */}
            {ethAddress ? (
              <div className="bg-[#12141A] p-3.5 rounded-xl border border-slate-800/60 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-slate-400" /> Embedded Wallet
                  </span>
                  <span className="text-emerald-500 font-semibold uppercase tracking-wider text-[8px] bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-slate-300">
                    {shortenAddress(ethAddress)}
                  </span>
                  <button 
                    onClick={copyAddress}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 text-center">
                <span className="text-[10px] font-mono text-amber-500">Creating secure wallet...</span>
              </div>
            )}

            {/* Logout button */}
            <button
              onClick={logout}
              className="w-full py-2.5 bg-[#1C1F26] hover:bg-red-950/40 hover:text-red-400 hover:border-red-950 text-slate-300 border border-[#2A2F3D] rounded-xl transition duration-150 flex items-center justify-center gap-2 text-xs font-mono cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>DISCONNECT</span>
            </button>
          </>
        ) : (
          <button
            onClick={login}
            className="w-full py-3 bg-white hover:bg-slate-200 text-black font-extrabold rounded-xl transition duration-150 flex items-center justify-center gap-2 text-xs font-mono tracking-wider uppercase cursor-pointer"
          >
            <span>CONNECT WALLET</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
