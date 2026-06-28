import { useState, useEffect } from 'react';
import { usePrivy, useWallets, useFundWallet } from '@privy-io/react-auth';
import { 
  Copy, 
  RefreshCw, 
  ArrowRight,
  Menu,
  CreditCard,
  ChevronDown
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Opportunities } from './components/Opportunities';
import { Research } from './components/Research';
import { Admin } from './components/Admin';
import { InvestPage } from './components/InvestPage';
import { Portfolio } from './components/Portfolio';
import { LandingPage } from './components/LandingPage';
import { SetUsernameScreen } from './components/SetUsernameScreen';
import { NewsTicker } from './components/NewsTicker';
import { TokenType, BusinessOpportunity, PlatformUser, Investment } from './types';
import { fetchOpportunities, addOpportunity, updateOpportunity } from './lib/opportunities.service';
import { fetchInvestments, addInvestment, getOrCreatePlatformUser, fetchPlatformUsers, updatePlatformUser, deletePlatformUser } from './lib/db.service';

const TOKENS_MAP = {
  USDC: {
    name: 'USD Coin',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/49/USDC_Logo.png',
    ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    arbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    polygon: '0x3c4d53014E5EC97969761662902C5D6486b11545'
  },
  USDT: {
    name: 'Tether USD',
    logo: 'https://i.postimg.cc/DzZkN5GX/65cce1d351081b78c34bbf6a-what-is-usdt-blog-removebg-preview.png',
    ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    base: '0x50c5725949A6F017460147b20a3FC05FFe1B2E9d',
    arbitrum: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
  },
  ETH: {
    name: 'Ethereum',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT03a-pZgK4YvS2rYisg1fV5XvE6bO6g8vL_Q&s',
    ethereum: 'NATIVE',
    base: 'NATIVE',
    arbitrum: 'NATIVE',
    polygon: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
  },
  SOL: {
    name: 'Solana',
    logo: 'https://cryptologos.cc/logos/solana-sol-logo.png',
    solana: 'NATIVE'
  }
};

export default function App() {
  const { ready, authenticated, user: privyUser, login } = usePrivy();
  const { wallets } = useWallets();
  const { fundWallet } = useFundWallet();

  const [ethAddress, setEthAddress] = useState<string>('');
  const [solanaAddress, setSolanaAddress] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState<boolean>(true);
  const [opportunities, setOpportunities] = useState<BusinessOpportunity[]>([]);
  const [selectedOpportunityToInvest, setSelectedOpportunityToInvest] = useState<BusinessOpportunity | null>(null);
  
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [admins, setAdmins] = useState<string[]>(['eahunanya116@gmail.com', 'xostip@gmail.com']);
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<PlatformUser | null>(null);

  const currentUserEmail = privyUser?.email?.address || '';
  const isAdmin = currentUserEmail ? admins.includes(currentUserEmail.toLowerCase()) : false;

  useEffect(() => {
    async function syncAndLoadUser() {
      if (authenticated && privyUser) {
        const email = privyUser.email?.address || 'no-email@privy.io';
        const address = privyUser.wallet?.address || ethAddress || 'Unknown';
        
        try {
          // 1. Get or create platform user in Firestore
          const profile = await getOrCreatePlatformUser(privyUser.id, email, address);
          setCurrentUserProfile(profile);
          
          // 2. Load user's investments from Firestore
          const fetchedInvestments = await fetchInvestments(privyUser.id);
          setInvestments(fetchedInvestments);
          
          // 3. Load all platform users if Admin
          if (isAdmin) {
            const allUsers = await fetchPlatformUsers();
            setPlatformUsers(allUsers);
          } else {
            setPlatformUsers([profile]);
          }
        } catch (e) {
          console.error("Error syncing and loading user details from Firestore:", e);
        }
      } else {
        setInvestments([]);
        setPlatformUsers([]);
        setCurrentUserProfile(null);
      }
    }
    syncAndLoadUser();
  }, [authenticated, privyUser, ethAddress, isAdmin]);
  
  useEffect(() => {
    async function loadOpportunities() {
      const opps = await fetchOpportunities();
      setOpportunities(opps);
    }
    loadOpportunities();
  }, []);

  useEffect(() => {
    if (opportunities.length > 0) {
      localStorage.setItem('credora_opportunities', JSON.stringify(opportunities));
    }
  }, [opportunities]);
  
  // Research flow states
  const [researchInitialPrompt, setResearchInitialPrompt] = useState<string>('');
  const [researchContextOpportunity, setResearchContextOpportunity] = useState<BusinessOpportunity | null>(null);

  const navigateToResearch = (prompt?: string, opp?: BusinessOpportunity | null) => {
    if (prompt !== undefined) setResearchInitialPrompt(prompt);
    if (opp !== undefined) setResearchContextOpportunity(opp);
    setActiveTab('research');
  };
  
  // Interactive deposit flow states
  const [selectedToken, setSelectedToken] = useState<TokenType>('USDC');
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState<boolean>(false);
  const [liveBalance, setLiveBalance] = useState<string>('0.00');
  
  const [isInIframe, setIsInIframe] = useState<boolean>(false);

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      setIsInIframe(true);
    }
  }, []);

  // Fetch and sum all connected Privy wallet balances + Firestore balance
  useEffect(() => {
    let active = true;
    async function updateBalances() {
      if (!authenticated || !wallets || wallets.length === 0) {
        if (active) setLiveBalance('0.00');
        return;
      }
      try {
        // Fetch balance for all connected wallets in parallel across public RPC
        const balancePromises = wallets.map(async (wallet) => {
          const rpcUrl = 'https://mainnet.base.org';
          try {
            const response = await fetch(rpcUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getBalance',
                params: [wallet.address, 'latest']
              })
            });
            const data = await response.json();
            if (data && data.result) {
              const hexBalance = data.result;
              const wei = BigInt(hexBalance);
              return Number(wei) / 1e18;
            }
          } catch (err) {
            console.error(`Failed to fetch Base balance for ${wallet.address}:`, err);
          }
          return 0;
        });

        const ethBalances = await Promise.all(balancePromises);
        const totalEth = ethBalances.reduce((sum, b) => sum + b, 0);

        // Convert ETH to USD (at a test price of $3500/ETH)
        const ethInUsd = totalEth * 3500;

        // Fetch user's persistent simulated/added funds from Firestore
        let addedFunds = 0;
        if (privyUser?.id) {
          const email = privyUser.email?.address || 'no-email@privy.io';
          const address = privyUser.wallet?.address || ethAddress || 'Unknown';
          const profile = await getOrCreatePlatformUser(privyUser.id, email, address);
          addedFunds = profile.balance || 0;
        }

        const finalBalance = ethInUsd + addedFunds;
        if (active) {
          setLiveBalance(finalBalance.toFixed(2));
        }
      } catch (e) {
        console.error("Error updating balances:", e);
      }
    }

    updateBalances();
    // Refresh every 15 seconds to keep balances up to date
    const interval = setInterval(updateBalances, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [authenticated, wallets, privyUser, ethAddress]);

  // Retrieve the real Privy embedded wallet address
  useEffect(() => {
    if (ready && authenticated && privyUser) {
      console.log("Privy User info for debugging:", privyUser);
      console.log("Privy Wallets info for debugging:", wallets);

      const ethWallet = wallets?.find(
        (w) => (w.walletClientType === 'privy' || w.connectorType === 'embedded') && w.address.startsWith('0x')
      );
      if (ethWallet?.address) {
        setEthAddress(ethWallet.address);
      } else if (privyUser?.wallet?.address && privyUser.wallet.address.startsWith('0x')) {
        setEthAddress(privyUser.wallet.address);
      } else if (wallets?.[0]?.address && wallets[0].address.startsWith('0x')) {
        setEthAddress(wallets[0].address);
      }

      // Robust extraction of Solana address
      let foundSolana = '';
      
      // 1. Check wallets list
      const solanaWallet = wallets?.find(
        (w) => (w.walletClientType === 'privy' || w.connectorType === 'embedded') && !w.address.startsWith('0x')
      );
      if (solanaWallet?.address) {
        foundSolana = solanaWallet.address;
      }
      
      // 2. Check linkedAccounts comprehensively
      if (!foundSolana && privyUser?.linkedAccounts) {
        const solanaAccount = privyUser.linkedAccounts.find(
          (account: any) => 
            (account.type === 'wallet' && account.chainType === 'solana') ||
            (account.type === 'solana_wallet') ||
            (account.type === 'wallet' && account.walletClientType === 'privy' && !account.address.startsWith('0x')) ||
            (account.type === 'wallet' && !account.address.startsWith('0x') && account.address.length >= 32 && account.address.length <= 44)
        );
        if (solanaAccount && 'address' in solanaAccount) {
          foundSolana = solanaAccount.address;
        }
      }

      // 3. Fallback: Any wallet in linkedAccounts that does not start with 0x and has solana-like length
      if (!foundSolana && privyUser?.linkedAccounts) {
        const fallbackAccount = privyUser.linkedAccounts.find(
          (account: any) => 
            'address' in account &&
            account.address && 
            typeof account.address === 'string' &&
            !account.address.startsWith('0x') && 
            account.address.length >= 32 && 
            account.address.length <= 44
        );
        if (fallbackAccount && 'address' in fallbackAccount) {
          foundSolana = (fallbackAccount as any).address;
        }
      }

      if (foundSolana) {
        setSolanaAddress(foundSolana);
      } else {
        console.warn("Solana address could not be extracted automatically. Check user.linkedAccounts:", privyUser.linkedAccounts);
      }
    } else {
      setEthAddress('');
      setSolanaAddress('');
    }
  }, [ready, authenticated, wallets, privyUser]);


  // Render views
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            liveBalance={liveBalance} 
            selectedToken={selectedToken}
            investments={investments}
            username={currentUserProfile?.username}
            firestoreBalance={currentUserProfile?.balance ?? 0}
            opportunities={opportunities}
          />
        );
      case 'portfolio':
        return (
          <Portfolio 
            investments={investments}
            opportunities={opportunities}
          />
        );
      case 'invest':
        if (!selectedOpportunityToInvest) {
          setActiveTab('opportunities');
          return null;
        }
        return (
          <InvestPage 
            opportunity={selectedOpportunityToInvest}
            onBack={() => {
              setSelectedOpportunityToInvest(null);
              setActiveTab('opportunities');
            }}
            onInvest={async (investment) => {
              if (privyUser?.id) {
                // Double check balance before completing investment
                const balanceNum = parseFloat(liveBalance) || 0;
                if (investment.amount > balanceNum) {
                  alert("Insufficient balance to complete this transaction.");
                  return;
                }

                try {
                  // 1. Add investment in Firestore
                  await addInvestment({ ...investment, userId: privyUser.id });
                  setInvestments(prev => [investment, ...prev]);

                  // 2. Deduct from user's persistent balance in Firestore
                  const email = privyUser.email?.address || 'no-email@privy.io';
                  const address = privyUser.wallet?.address || ethAddress || 'Unknown';
                  const profile = await getOrCreatePlatformUser(privyUser.id, email, address);
                  const newBalance = Math.max(0, (profile.balance || 0) - investment.amount);
                  await updatePlatformUser(privyUser.id, { balance: newBalance });
                  setCurrentUserProfile(prev => prev ? { ...prev, balance: newBalance } : null);

                  // 3. Update and persist opportunity in Firestore
                  let updatedOppData: Partial<BusinessOpportunity> = {};
                  const updatedOpps = opportunities.map(o => {
                    if (o.id === investment.opportunityId) {
                      const nextRaised = Math.min(o.targetAmount, o.raisedAmount + investment.amount);
                      const effectiveSharePrice = o.sharePrice || 1;
                      const newShares = Math.floor(investment.amount / effectiveSharePrice);
                      const remainingShares = (o.availableShares ?? (o.totalShares ?? 0)) - newShares;
                      
                      updatedOppData = {
                        raisedAmount: nextRaised,
                        availableShares: Math.max(0, remainingShares)
                      };

                      return { 
                        ...o, 
                        ...updatedOppData
                      };
                    }
                    return o;
                  });
                  setOpportunities(updatedOpps);

                  if (investment.opportunityId && Object.keys(updatedOppData).length > 0) {
                    await updateOpportunity(investment.opportunityId, updatedOppData);
                  }

                  // 4. Force a refresh of the balance state immediately
                  setLiveBalance(prev => {
                    const current = parseFloat(prev) || 0;
                    return Math.max(0, current - investment.amount).toFixed(2);
                  });
                } catch (e) {
                  console.error("Failed to complete investment transaction:", e);
                  alert("An error occurred while finalizing your investment. Please try again.");
                }
              }
              
              // 5. Navigate to portfolio
              setActiveTab('portfolio');
            }}
            ethAddress={ethAddress}
            liveBalance={liveBalance}
          />
        );
      case 'opportunities':
        return (
          <Opportunities 
            liveBalance={liveBalance} 
            refreshBalance={() => {}}
            selectedToken={selectedToken}
            onAskAI={navigateToResearch}
            opportunities={opportunities}
            setOpportunities={setOpportunities}
            onInvestClick={(opp) => {
              setSelectedOpportunityToInvest(opp);
              setActiveTab('invest');
            }}
          />
        );
      case 'research':
        return (
          <Research 
            initialPrompt={researchInitialPrompt}
            contextOpportunity={researchContextOpportunity}
            opportunities={opportunities}
          />
        );
      case 'admin-users':
      case 'admin-business':
      case 'admin-financials':
      case 'admin-admins':
        if (!isAdmin) return null;
        return (
          <Admin 
            opportunities={opportunities}
            onAddOpportunity={async (opp) => {
              await addOpportunity(opp);
              setOpportunities([opp, ...opportunities]);
            }}
            onUpdateOpportunity={(updatedOpp) => {
              setOpportunities(opportunities.map(o => o.id === updatedOpp.id ? updatedOpp : o));
            }}
            admins={admins}
            onAddAdmin={(email) => setAdmins([...admins, email.toLowerCase()])}
            onRemoveAdmin={(email) => setAdmins(admins.filter(a => a !== email.toLowerCase()))}
            currentUserEmail={currentUserEmail}
            platformUsers={platformUsers}
            activeAdminTab={activeTab.replace('admin-', '') as 'users' | 'business' | 'financials' | 'admins'}
            onAddUserFunds={async (user, amount) => {
              try {
                if (user.id) {
                  const newBalance = (user.balance || 0) + amount;
                  await updatePlatformUser(user.id, { balance: newBalance });
                  
                  // Reload the platform users lists so the Admin page displays the new balance instantly
                  const allUsers = await fetchPlatformUsers();
                  setPlatformUsers(allUsers);
                  
                  // If we updated the active user's own balance, update liveBalance as well
                  if (user.id === privyUser?.id) {
                    setLiveBalance(prev => (parseFloat(prev) + amount).toFixed(2));
                    setCurrentUserProfile(prev => prev ? { ...prev, balance: newBalance } : null);
                  }
                  
                  alert(`Successfully added $${amount.toLocaleString()} to ${user.email || user.address}!`);
                } else {
                  console.error("User does not have a persistent ID");
                }
              } catch (err) {
                console.error("Failed to add user funds:", err);
                alert("An error occurred while adding funds. Please try again.");
              }
            }}
            onRemoveUserFunds={async (user, amount) => {
              try {
                if (user.id) {
                  const newBalance = Math.max(0, (user.balance || 0) - amount);
                  await updatePlatformUser(user.id, { balance: newBalance });
                  
                  // Reload the platform users lists so the Admin page displays the new balance instantly
                  const allUsers = await fetchPlatformUsers();
                  setPlatformUsers(allUsers);
                  
                  // If we updated the active user's own balance, update liveBalance as well
                  if (user.id === privyUser?.id) {
                    setLiveBalance(prev => Math.max(0, parseFloat(prev) - amount).toFixed(2));
                    setCurrentUserProfile(prev => prev ? { ...prev, balance: newBalance } : null);
                  }
                  
                  alert(`Successfully removed $${amount.toLocaleString()} from ${user.email || user.address}!`);
                } else {
                  console.error("User does not have a persistent ID");
                }
              } catch (err) {
                console.error("Failed to remove user funds:", err);
                alert("An error occurred while removing funds. Please try again.");
              }
            }}
            onDeleteUser={async (userId) => {
              try {
                await deletePlatformUser(userId);
                
                // Reload the platform users lists
                const allUsers = await fetchPlatformUsers();
                setPlatformUsers(allUsers);
                
                alert("Successfully deleted user from platform database.");
              } catch (err) {
                console.error("Failed to delete user:", err);
                alert("An error occurred while deleting the user. Please try again.");
              }
            }}
          />
        );
      case 'deposit':
        return (
          /* Simplified & Clear Deposit UI */
          <div className="space-y-8 animate-fade-in text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111318] border border-[#1E232D] rounded-2xl p-6">
              <div className="max-w-xl text-left">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight font-mono">
                  Deposit Funds
                </h2>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Easily add funds to your secure MPC wallet. Follow the steps to get your receiving address.
                </p>
              </div>

              {/* Wallet balance */}
              <div className="bg-[#15171C] border border-[#222731] rounded-xl p-4 flex items-center justify-between gap-6 min-w-[280px] text-left">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">
                    Your Balance
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-bold text-white leading-none">
                      {liveBalance}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {selectedToken}
                    </span>
                  </div>
                </div>


              </div>
            </div>

            {/* Quick Purchase */}
            <div className="bg-[#111318] border border-[#1E232D] rounded-2xl p-6">
               <h3 className="text-sm font-bold text-white mb-4">Don't have crypto?</h3>
               <button
                  onClick={() => {
                    const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
                    if (embeddedWallet) {
                      fundWallet(embeddedWallet.address);
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 border border-emerald-500/50 text-black rounded-xl transition font-bold font-mono text-sm cursor-pointer shadow-lg"
                >
                  <CreditCard className="w-4 h-4" />
                  Purchase Crypto via Privy
                </button>
            </div>

            {/* Deposit Steps */}
            <div className="bg-[#111318] border border-[#1E232D] rounded-2xl p-6 space-y-8">
                
                {/* 1. Select Asset */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    1. Select Asset
                  </h3>
                  
                  {/* Custom Dropdown Selector */}
                  <div className="relative z-40 max-w-md text-left">
                    <button
                      type="button"
                      onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[#15171D] border border-[#222731] rounded-xl hover:border-slate-500 transition text-left cursor-pointer focus:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={TOKENS_MAP[selectedToken].logo} 
                          alt={selectedToken} 
                          className="w-7 h-7 object-contain rounded-full" 
                          referrerPolicy="no-referrer" 
                        />
                        <div>
                          <span className="block text-sm font-bold text-white">
                            {TOKENS_MAP[selectedToken].name}
                          </span>
                          <span className="block text-xs font-mono text-slate-400">
                            {selectedToken}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isAssetDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isAssetDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-full bg-[#15171D] border border-[#222731] rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-[#1F242E] max-h-60 overflow-y-auto">
                        {(['USDC', 'USDT', 'ETH', 'SOL'] as TokenType[]).map((token) => {
                          const info = TOKENS_MAP[token];
                          const isSelected = selectedToken === token;
                          return (
                            <button
                              key={token}
                              type="button"
                              onClick={() => {
                                setSelectedToken(token);
                                setIsAssetDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#1E232E] transition text-left cursor-pointer ${
                                isSelected ? 'bg-[#1E232E]/50' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <img 
                                  src={info.logo} 
                                  alt={token} 
                                  className="w-6 h-6 object-contain rounded-full" 
                                  referrerPolicy="no-referrer" 
                                />
                                <div>
                                  <span className="block text-xs font-bold text-white">
                                    {info.name}
                                  </span>
                                  <span className="block text-[10px] font-mono text-slate-400">
                                    {token}
                                  </span>
                                </div>
                              </div>
                              {isSelected && (
                                <span className="text-[10px] font-bold text-emerald-400 font-mono uppercase">
                                  Selected
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Receiving Address */}
                <div className="space-y-4 border-t border-[#1E232D] pt-8">
                  {selectedToken === 'SOL' ? (
                    <>
                      <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                        2. Send to Solana Address
                      </h3>
                      <p className="text-xs text-slate-500">
                        Supported Network: Solana Mainnet. <br/>
                        <span className="text-amber-500">Only send SOL or Solana-native SPL tokens to this address.</span>
                      </p>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Solana Address</span>
                            <div className="flex gap-2">
                                <div className="bg-[#15171C] border border-[#222731] rounded-xl p-4 font-mono text-sm break-all text-white flex-1">
                                    {solanaAddress || 'Generating...'}
                                </div>
                                <button
                                    onClick={() => solanaAddress && navigator.clipboard.writeText(solanaAddress)}
                                    className="p-3 bg-[#1C2028] hover:bg-[#252B36] border border-[#2D3442] text-slate-300 rounded-xl transition cursor-pointer"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                        2. Send to EVM Address
                      </h3>
                      <p className="text-xs text-slate-500">
                        Supported Networks: Ethereum, Base, Arbitrum, Polygon. <br/>
                        <span className="text-amber-500">Only send {selectedToken} to this EVM address.</span>
                      </p>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">EVM Address (Base/Eth/Arb/Poly)</span>
                            <div className="flex gap-2">
                                <div className="bg-[#15171C] border border-[#222731] rounded-xl p-4 font-mono text-sm break-all text-white flex-1">
                                    {ethAddress || 'Generating...'}
                                </div>
                                <button
                                    onClick={() => ethAddress && navigator.clipboard.writeText(ethAddress)}
                                    className="p-3 bg-[#1C2028] hover:bg-[#252B36] border border-[#2D3442] text-slate-300 rounded-xl transition cursor-pointer"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0C0E12] flex flex-col items-center justify-center space-y-4 font-sans text-slate-200">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">
          Initializing Credora Multi-Chain Gateway...
        </p>
      </div>
    );
  }

  // Prevent blank screen by showing a loading screen during profile synchronization
  if (authenticated && !currentUserProfile && privyUser) {
    return (
      <div className="min-h-screen bg-[#0C0E12] flex flex-col items-center justify-center space-y-4 font-sans text-slate-200">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-[#64748B] text-xs font-mono uppercase tracking-widest animate-pulse">
          Synchronizing secure vault profile...
        </p>
      </div>
    );
  }

  // Compulsory username setting onboarding screen
  if (authenticated && currentUserProfile && !currentUserProfile.username && privyUser) {
    return (
      <SetUsernameScreen 
        userId={privyUser.id} 
        onUsernameSet={(newUsername) => {
          setCurrentUserProfile(prev => prev ? { ...prev, username: newUsername } : null);
        }} 
      />
    );
  }

  if (!authenticated && isInIframe) {
    return (
      <div className="min-h-screen bg-[#0C0E12] flex items-center justify-center p-6 text-slate-200 font-sans">
        <div className="max-w-md w-full bg-[#111318] border border-amber-500/20 rounded-2xl p-8 shadow-2xl text-center space-y-6">
          <div className="space-y-2 text-center flex flex-col items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono uppercase tracking-wider w-fit">
              Sandbox Iframe Warning
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white mt-2 font-mono">
              OPEN CREDORA IN A NEW TAB
            </h2>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Web3 secure wallets and Privy authentication are restricted inside sandboxed iframes due to security policies (preventing clickjacking and credential extraction).
            </p>
          </div>

          <div className="bg-[#15171C] border border-[#222731] rounded-xl p-4 text-xs text-left text-slate-400 space-y-2">
            <span className="text-white font-semibold font-mono block">Required Actions:</span>
            <p className="leading-relaxed">
              Please click the button below to load Credora in a standalone tab. Your connection will sync seamlessly with your secure MPC wallet setup.
            </p>
          </div>

          <a
            href={window.location.href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-white hover:bg-slate-200 text-black font-extrabold rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer text-sm font-mono tracking-wider uppercase shadow-lg"
          >
            <span>OPEN IN STANDALONE TAB</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <LandingPage onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-[#0C0E12] text-slate-200 flex font-sans antialiased overflow-hidden">
      {/* Sidebar for Desktop */}
      <div 
        className={`hidden md:block fixed left-0 top-0 h-full bg-[#0B0D11] border-r border-[#222731] transition-all duration-300 z-30 ${isDesktopSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`}
      >
        <div className="w-80">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} ethAddress={ethAddress} isAdmin={isAdmin} />
        </div>
      </div>

      {/* Mobile Menu Slide-over overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden flex">
          <div className="relative w-80 max-w-xs animate-slide-in">
            <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); }} ethAddress={ethAddress} isAdmin={isAdmin} onClose={() => setIsMobileMenuOpen(false)} />
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Right Workspace */}
      <div className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${isDesktopSidebarOpen ? 'md:pl-80' : 'md:pl-0'}`}>
        {/* Top navigation bar */}
        <header className="flex flex-col bg-[#0B0D11] sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {!isDesktopSidebarOpen && (
                <div className="hidden md:flex items-center gap-3">
                  <button 
                    onClick={() => setIsDesktopSidebarOpen(true)}
                    className="p-2 bg-[#12141A] rounded-lg border border-[#222731] text-slate-300 hover:text-white cursor-pointer"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <img 
                    src="https://i.postimg.cc/zvC7hNHC/Chat-GPT-Image-Jun-28-2026-03-57-29-PM.png"
                    alt="Credora Logo"
                    className="w-8 h-8 rounded object-contain bg-[#111318] p-0.5 border border-slate-800"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-white font-bold font-mono tracking-wider text-sm">CREDORA</span>
                </div>
              )}
              <div className="md:hidden flex items-center gap-3">
                <img 
                  src="https://i.postimg.cc/zvC7hNHC/Chat-GPT-Image-Jun-28-2026-03-57-29-PM.png"
                  alt="Credora Logo"
                  className="w-8 h-8 rounded object-contain bg-[#111318] p-0.5 border border-slate-800"
                  referrerPolicy="no-referrer"
                />
                <span className="text-white font-bold font-mono tracking-wider text-sm">CREDORA</span>
              </div>
            </div>

            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 bg-[#12141A] rounded-lg border border-[#222731] text-slate-300 hover:text-white cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <NewsTicker />
        </header>

        {/* Dynamic Inner Workspace Panel */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 w-full max-w-7xl mx-auto">
          {renderActiveView()}
        </main>

        {/* Solid Corporate Footer */}
        <footer className="border-t border-[#1E232D] bg-[#0E1116] py-6 text-center text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left sm:text-center">
            <span>© 2026 Credora. Secure Multi-Party Computation Vault Gateway.</span>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider font-mono justify-center">
              <span>Privy KMS Secure</span>
              <span>•</span>
              <span>On-Chain Syncing</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
