import { useState, useEffect } from 'react';
import { usePrivy, useWallets, useFundWallet } from '@privy-io/react-auth';
import { 
  Copy, 
  Check, 
  QrCode, 
  RefreshCw, 
  ArrowRight,
  Menu,
  Lock,
  CheckCircle2,
  CreditCard
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Opportunities } from './components/Opportunities';
import { Research } from './components/Research';
import { Admin } from './components/Admin';
import { InvestPage } from './components/InvestPage';
import { Portfolio } from './components/Portfolio';
import { NetworkConfig, TokenType, BusinessOpportunity, PlatformUser, Investment } from './types';
import { BUSINESS_OPPORTUNITIES } from './data/opportunities';

const NETWORKS: NetworkConfig[] = [
  {
    id: 'base',
    name: 'Base Network',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org/token/'
  },
  {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    symbol: 'ETH',
    rpcUrl: 'https://cloudflare-eth.com',
    explorerUrl: 'https://etherscan.io/token/'
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum One',
    symbol: 'ETH',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io/token/'
  },
  {
    id: 'polygon',
    name: 'Polygon PoS',
    symbol: 'POL',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com/token/'
  }
];

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
  }
};

const isNetworkCompatibleWithToken = (_networkId: string, _token: TokenType): boolean => {
  return true;
};

export default function App() {
  const { ready, authenticated, user: privyUser, login } = usePrivy();
  const { wallets } = useWallets();
  const { fundWallet } = useFundWallet();

  const [ethAddress, setEthAddress] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState<boolean>(true);
  const [opportunities, setOpportunities] = useState<BusinessOpportunity[]>(BUSINESS_OPPORTUNITIES);
  const [selectedOpportunityToInvest, setSelectedOpportunityToInvest] = useState<BusinessOpportunity | null>(null);
  
  const [investments, setInvestments] = useState<Investment[]>(() => {
    const stored = localStorage.getItem('credora_investments');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('credora_investments', JSON.stringify(investments));
  }, [investments]);

  const [admins, setAdmins] = useState<string[]>(() => {
    const stored = localStorage.getItem('credora_admins');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return ['eahunanya116@gmail.com'];
      }
    }
    return ['eahunanya116@gmail.com'];
  });
  
  useEffect(() => {
    localStorage.setItem('credora_admins', JSON.stringify(admins));
  }, [admins]);

  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>(() => {
    const stored = localStorage.getItem('credora_users');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('credora_users', JSON.stringify(platformUsers));
  }, [platformUsers]);

  useEffect(() => {
    if (authenticated && privyUser) {
      const email = privyUser.email?.address;
      const address = privyUser.wallet?.address || ethAddress || 'Unknown';
      
      setPlatformUsers(prev => {
        const existingIndex = prev.findIndex(u => (email && u.email === email) || u.address === address);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            email: email || updated[existingIndex].email,
            address: address !== 'Unknown' ? address : updated[existingIndex].address
          };
          return updated;
        } else {
          return [...prev, {
            address,
            email,
            kyc: 'Pending',
            balance: 0,
            joined: new Date().toISOString()
          }];
        }
      });
    }
  }, [authenticated, privyUser, ethAddress]);

  const currentUserEmail = privyUser?.email?.address || '';
  const isAdmin = currentUserEmail ? admins.includes(currentUserEmail.toLowerCase()) : false;
  
  useEffect(() => {
    const storedOpps = localStorage.getItem('credora_opportunities');
    if (storedOpps) {
      try {
        setOpportunities(JSON.parse(storedOpps));
      } catch (e) {
        setOpportunities(BUSINESS_OPPORTUNITIES);
      }
    } else {
      localStorage.setItem('credora_opportunities', JSON.stringify(BUSINESS_OPPORTUNITIES));
      setOpportunities(BUSINESS_OPPORTUNITIES);
    }
  }, []);

  useEffect(() => {
    if (opportunities !== BUSINESS_OPPORTUNITIES && opportunities.length > 0) {
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
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkConfig>(NETWORKS[0]); // Base by default
  const [liveBalance, setLiveBalance] = useState<string>('0.00');
  
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);
  const [isAddressUpdating, setIsAddressUpdating] = useState<boolean>(false);
  const [isInIframe, setIsInIframe] = useState<boolean>(false);

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      setIsInIframe(true);
    }
  }, []);

  // Retrieve the real Privy embedded wallet address
  useEffect(() => {
    if (ready && authenticated && privyUser) {
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
    } else {
      setEthAddress('');
    }
  }, [ready, authenticated, wallets, privyUser]);

  // Query ERC-20 balance via JSON-RPC eth_call
  const queryErc20Balance = async (rpcUrl: string, tokenAddress: string, walletAddress: string): Promise<string> => {
    try {
      const cleanAddress = walletAddress.startsWith('0x') ? walletAddress.slice(2) : walletAddress;
      const paddedAddress = cleanAddress.toLowerCase().padStart(64, '0');
      const data = '0x70a08231' + paddedAddress;

      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: tokenAddress,
              data: data
            },
            'latest'
          ],
          id: 1,
        }),
      });
      const result = await response.json();
      if (result.result && result.result !== '0x') {
        const balanceBigInt = BigInt(result.result);
        const balanceNum = Number(balanceBigInt) / 1e6; // Default decimals: 6 (USDC/USDT)
        return balanceNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
      }
    } catch (e) {
      console.error('Balance fetch failed:', e);
    }
    return '0.00';
  };

  // Query native currency balance (ETH, etc.) via JSON-RPC eth_getBalance
  const queryNativeBalance = async (rpcUrl: string, walletAddress: string): Promise<string> => {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [walletAddress, 'latest'],
          id: 1,
        }),
      });
      const result = await response.json();
      if (result.result) {
        const balanceBigInt = BigInt(result.result);
        const balanceNum = Number(balanceBigInt) / 1e18; // 18 decimals for ETH/POL
        return balanceNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
      }
    } catch (e) {
      console.error('Native balance fetch failed:', e);
    }
    return '0.00';
  };

  // Fetch live balance
  const fetchSelectedBalance = async (address: string, token: TokenType, network: NetworkConfig) => {
    if (!address) return;
    setIsLoadingBalance(true);
    try {
      const tokenAddress = TOKENS_MAP[token][network.id as keyof typeof TOKENS_MAP['USDC']];
      if (tokenAddress === 'NATIVE') {
        const balance = await queryNativeBalance(network.rpcUrl, address);
        setLiveBalance(balance);
      } else if (tokenAddress) {
        const balance = await queryErc20Balance(network.rpcUrl, tokenAddress, address);
        setLiveBalance(balance);
      } else {
        setLiveBalance('0.00');
      }
    } catch (e) {
      console.error('Balance query error:', e);
      setLiveBalance('0.00');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const activeAddress = ethAddress;

  useEffect(() => {
    if (activeAddress) {
      fetchSelectedBalance(activeAddress, selectedToken, selectedNetwork);
    } else {
      setLiveBalance('0.00');
    }
  }, [activeAddress, selectedToken, selectedNetwork]);

  useEffect(() => {
    if (activeAddress) {
      setIsAddressUpdating(true);
      
      const timer = setTimeout(() => {
        setIsAddressUpdating(false);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [activeAddress, selectedToken, selectedNetwork]);

  // Clipboard Helpers
  const handleCopyAddress = () => {
    if (!activeAddress) return;
    navigator.clipboard.writeText(activeAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const qrCodeUrl = activeAddress
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(activeAddress)}&color=ffffff&bgcolor=111317`
    : '';

  // Render views
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            liveBalance={liveBalance} 
            selectedToken={selectedToken}
            setActiveTab={setActiveTab}
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
            onInvest={(investment) => {
              // 1. Add investment
              const newInvestments = [investment, ...investments];
              setInvestments(newInvestments);
              
              // 2. Update raised amount and available shares
              const updatedOpps = opportunities.map(o => {
                if (o.id === investment.opportunityId) {
                  const nextRaised = Math.min(o.targetAmount, o.raisedAmount + investment.amount);
                  const effectiveSharePrice = o.sharePrice || 1;
                  const newShares = Math.floor(investment.amount / effectiveSharePrice);
                  const remainingShares = (o.availableShares ?? (o.totalShares ?? 0)) - newShares;
                  return { 
                    ...o, 
                    raisedAmount: nextRaised,
                    availableShares: Math.max(0, remainingShares)
                  };
                }
                return o;
              });
              setOpportunities(updatedOpps);

              // 3. Navigate to portfolio
              setActiveTab('portfolio');
            }}
            ethAddress={ethAddress}
          />
        );
      case 'opportunities':
        return (
          <Opportunities 
            liveBalance={liveBalance} 
            refreshBalance={() => activeAddress && fetchSelectedBalance(activeAddress, selectedToken, selectedNetwork)}
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
            onAddOpportunity={(opp) => setOpportunities([opp, ...opportunities])}
            onUpdateOpportunity={(updatedOpp) => {
              setOpportunities(opportunities.map(o => o.id === updatedOpp.id ? updatedOpp : o));
            }}
            admins={admins}
            onAddAdmin={(email) => setAdmins([...admins, email.toLowerCase()])}
            onRemoveAdmin={(email) => setAdmins(admins.filter(a => a !== email.toLowerCase()))}
            currentUserEmail={currentUserEmail}
            platformUsers={platformUsers}
            activeAdminTab={activeTab.replace('admin-', '') as 'users' | 'business' | 'financials' | 'admins'}
          />
        );
      case 'deposit':
        if (!authenticated) {
          return (
            <div className="max-w-xl mx-auto py-16 text-center space-y-6">
              <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-lg font-bold text-white font-mono tracking-wider uppercase">WALLET CONFIGURATION SECURED</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  To view your multi-chain deposit routing configurations, unique MPC addresses, and receive testnet assets, please connect your secure embedded account.
                </p>
              </div>
              <button 
                onClick={login}
                className="px-8 py-3 bg-white text-black font-mono font-bold text-xs uppercase rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                CONNECT WALLET
              </button>
            </div>
          );
        }
        return (
          /* Streamlined & Serious Deposit UI */
          <div className="space-y-8 animate-fade-in text-left">
            {/* Context Title & Balance Card Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111318] border border-[#1E232D] rounded-2xl p-6">
              <div className="max-w-xl text-left">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight font-mono">
                  Deposit Configuration
                </h2>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Select your digital asset and desired network below. The corresponding address will update immediately.
                </p>
              </div>

              {/* separated wallet balance card */}
              <div className="bg-[#15171C] border border-[#222731] rounded-xl p-4 flex items-center justify-between gap-6 min-w-[280px] text-left">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">
                    Total Wallet Balance
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

                <button
                  onClick={() => activeAddress && fetchSelectedBalance(activeAddress, selectedToken, selectedNetwork)}
                  disabled={isLoadingBalance}
                  className="p-2.5 bg-[#1C2028] hover:bg-[#252B36] border border-[#2D3442] text-slate-300 rounded-lg transition flex items-center justify-center cursor-pointer"
                  title="Refresh Balance"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
                if (embeddedWallet) {
                  fundWallet(embeddedWallet.address);
                }
              }}
              className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 border border-emerald-500/50 text-black rounded-xl transition font-bold font-mono text-sm cursor-pointer shadow-lg"
            >
              <CreditCard className="w-4 h-4" />
              Purchase Crypto
            </button>

            {/* Core Workspace Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
              {/* Left Side Config & Outputs */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* selectors */}
                <div className="bg-[#111318] border border-[#1E232D] rounded-2xl p-6 text-left">
                  <div className="space-y-6">
                    
                    {/* ASSET SELECTOR */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
                          1. Select Asset Type
                        </h3>
                        <span className="text-[10px] font-mono text-slate-500">
                          Select any asset to auto-configure networks
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {(['USDC', 'USDT', 'ETH'] as TokenType[]).map((token) => {
                          const info = TOKENS_MAP[token];
                          const isSelected = selectedToken === token;
                          return (
                            <button
                              key={token}
                              onClick={() => {
                                setSelectedToken(token);
                              }}
                              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-white border-white text-black font-semibold'
                                  : 'bg-[#15171D] border-[#222731] text-slate-400 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className={`text-xs font-mono font-bold tracking-wider ${isSelected ? 'text-black' : 'text-white'}`}>
                                  {token}
                                </span>
                                <img
                                  src={info.logo}
                                  alt={token}
                                  className="w-5 h-5 object-contain rounded-full"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <span className="text-[10px] font-mono text-slate-500 mt-4 block">
                                {info.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* NETWORK SELECTOR */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
                          2. Select Network / Blockchain
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {NETWORKS.map((net) => {
                          const isSelected = selectedNetwork.id === net.id;
                          const isCompatible = isNetworkCompatibleWithToken(net.id, selectedToken);
                          return (
                            <button
                              key={net.id}
                              disabled={!isCompatible}
                              onClick={() => setSelectedNetwork(net)}
                              className={`p-3.5 rounded-xl border text-left transition ${
                                isSelected
                                  ? 'bg-white border-white text-black font-semibold'
                                  : isCompatible
                                    ? 'bg-[#15171D] border-[#222731] text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer'
                                    : 'bg-[#0E1015] border-[#1C1F26] text-slate-600 cursor-not-allowed opacity-40'
                              }`}
                            >
                              <span className="text-xs font-mono font-bold block">{net.name}</span>
                              <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                                {net.symbol} Chain
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>

                {/* RECEIVING ADDRESS DETAILS PANEL */}
                <div className="bg-[#111318] border border-[#1E232D] rounded-2xl p-6 space-y-6 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
                      3. Send Funds to Address
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                      Verified Secure Vault
                    </span>
                  </div>

                  {/* MPC Address display block */}
                  <div className="bg-[#15171C] border border-[#222731] rounded-xl p-5 relative overflow-hidden">
                    {isAddressUpdating && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                          <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                          <span>Generating dynamic address...</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">
                          Your Unique {selectedNetwork.name} Receiving Address
                        </span>
                        <p className="text-sm sm:text-base font-mono font-bold text-white break-all tracking-tight leading-none">
                          {activeAddress || '0x0000000000000000000000000000000000000000'}
                        </p>
                      </div>

                      <button
                        onClick={handleCopyAddress}
                        className="py-3 px-5 bg-white hover:bg-slate-200 text-black rounded-lg text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5 transition self-start md:self-auto cursor-pointer"
                      >
                        {copiedAddress ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>COPY ADDRESS</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Educational details helper */}
                  <div className="bg-[#121419]/50 p-4 rounded-xl border border-[#222731] space-y-3.5 text-xs text-slate-400">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Unified Multi-Chain Address Verified</span>
                    </div>
                    <p className="font-sans leading-relaxed">
                      Because Ethereum, Base, Arbitrum, and Polygon are EVM-compatible networks, they utilize <strong className="text-white">one identical, unified address</strong>.
                    </p>
                    <p className="font-sans leading-relaxed">
                      You can safely send your <strong className="text-white">{selectedToken}</strong> via the <strong className="text-white">{selectedNetwork.name}</strong> to the exact address above. Our system will automatically detect the inbound chain and deposit your funds securely.
                    </p>
                  </div>

                </div>

              </div>

              {/* Right Side: Guidelines & QR */}
              <div className="lg:col-span-4 space-y-6 text-left">
                
                {/* QR Code Card */}
                <div className="bg-[#111318] border border-[#1E232D] rounded-2xl p-6 text-center space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1E232D] pb-3 text-left">
                    <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
                      QR Gateway
                    </h3>
                  </div>

                  <div className="bg-[#15171D] p-5 rounded-xl border border-[#222731] flex flex-col items-center justify-center">
                    {showQr ? (
                      <div className="bg-white p-3.5 rounded-lg border border-slate-700/50 shadow-inner">
                        <img
                          src={qrCodeUrl}
                          alt="Wallet QR Code"
                          className="w-36 h-36 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowQr(true)}
                        className="py-10 px-6 w-full bg-[#1C2028]/40 hover:bg-[#1C2028]/80 border border-dashed border-[#2D3442] hover:border-slate-500 rounded-xl transition flex flex-col items-center justify-center gap-3 cursor-pointer group"
                      >
                        <QrCode className="w-8 h-8 text-slate-500 group-hover:text-white transition" />
                        <span className="text-[10px] font-mono text-slate-400 group-hover:text-white font-bold tracking-wider uppercase">
                          SHOW QR CODE
                        </span>
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono leading-relaxed text-left">
                    Scan with any external wallet (Metamask, Coinbase Wallet, etc.) to trigger a secure mobile transaction.
                  </p>
                </div>

                {/* Guidelines Panel */}
                <div className="bg-[#111318] border border-[#1E232D] rounded-2xl p-6 space-y-4 text-left">
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider pb-3 border-b border-[#1E232D]">
                    Deposit Guidelines
                  </h3>

                  <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                    <p>
                      - Transfer only <strong className="text-white">{selectedToken}</strong> to this specific address. Sending other assets will result in permanent loss.
                    </p>
                    <p>
                      - Confirm your transfer network matches <strong className="text-white">{selectedNetwork.name}</strong>.
                    </p>
                    <p>
                      - MPC keys are locally generated and secure. Deposits register automatically on-chain.
                    </p>
                  </div>
                </div>

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

  return (
    <div className="min-h-screen bg-[#0C0E12] text-slate-200 flex font-sans antialiased overflow-hidden">
      {/* Sidebar for Desktop */}
      <div 
        className={`hidden md:block fixed left-0 top-0 h-full bg-[#0B0D11] border-r border-[#222731] transition-all duration-300 z-30 ${isDesktopSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`}
      >
        <div className="w-80">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} ethAddress={ethAddress} isAdmin={isAdmin} onClose={() => setIsDesktopSidebarOpen(false)} />
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
        <header className="flex items-center justify-between p-4 bg-[#0B0D11] border-b border-[#222731] sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {!isDesktopSidebarOpen && (
              <div className="hidden md:flex items-center gap-3">
                <button 
                  onClick={() => setIsDesktopSidebarOpen(true)}
                  className="p-2 bg-[#12141A] rounded-lg border border-[#222731] text-slate-300 hover:text-white cursor-pointer"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center font-bold text-black font-mono">
                  C
                </div>
                <span className="text-white font-bold font-mono tracking-wider text-sm">CREDORA</span>
              </div>
            )}
            <div className="md:hidden flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center font-bold text-black font-mono">
                C
              </div>
              <span className="text-white font-bold font-mono tracking-wider text-sm">CREDORA</span>
            </div>
          </div>

          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 bg-[#12141A] rounded-lg border border-[#222731] text-slate-300 hover:text-white cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Global guest preview banner if not authenticated on Dashboard */}
        {!authenticated && activeTab === 'dashboard' && (
          <div className="bg-amber-500/5 border-b border-amber-500/15 py-3 px-6 text-center text-xs text-amber-400 font-mono flex flex-col sm:flex-row items-center justify-center gap-2">
            <span>Currently browsing in guest mode. Connect your secure wallet to trace investments and generate APY.</span>
            <button 
              onClick={login}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-2.5 py-1 rounded text-[10px] uppercase tracking-wider transition cursor-pointer ml-2"
            >
              CONNECT
            </button>
          </div>
        )}

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
