import React, { useState } from 'react';
import { Users, Briefcase, Plus, CheckCircle, Database, Shield } from 'lucide-react';
import { BusinessOpportunity, PlatformUser, FinancialRecord } from '../types';

const FinancialsTab: React.FC<{ opportunities: BusinessOpportunity[], onUpdateOpportunity: (opp: BusinessOpportunity) => void }> = ({ opportunities, onUpdateOpportunity }) => {
  const [selectedOppId, setSelectedOppId] = useState<string>('');
  const [recordType, setRecordType] = useState<'Income' | 'Expense'>('Income');
  const [amount, setAmount] = useState<string>('');
  const [period, setPeriod] = useState<'Daily' | 'Weekly' | 'Monthly' | 'One-off'>('One-off');
  const [description, setDescription] = useState<string>('');

  const selectedOpp = opportunities.find(o => o.id === selectedOppId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;
    
    const record: FinancialRecord = {
      id: `rec-${Date.now()}`,
      date: new Date().toISOString(),
      type: recordType,
      amount: Number(amount),
      period,
      description
    };
    
    const updatedOpp = {
      ...selectedOpp,
      financialRecords: [...(selectedOpp.financialRecords || []), record]
    };

    onUpdateOpportunity(updatedOpp);
    
    setAmount('');
    setDescription('');
    alert('Financial record added successfully!');
  };

  const calculateNetRevenue = (opp: BusinessOpportunity) => {
    const records = opp.financialRecords || [];
    const income = records.filter(r => r.type === 'Income').reduce((sum, r) => sum + r.amount, 0);
    const expense = records.filter(r => r.type === 'Expense').reduce((sum, r) => sum + r.amount, 0);
    return income - expense;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-serif text-white mb-2">Financials & Yield Distribution</h1>
      <p className="text-slate-400 font-mono text-sm max-w-2xl mb-8">
        Record revenue and expenses for funded opportunities. Net revenue is automatically distributed to shareholders based on their shares owned.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#111318] border border-[#222731] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-6">Record Transaction</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-mono uppercase tracking-wider">Select Opportunity</label>
              <select 
                value={selectedOppId} 
                onChange={(e) => setSelectedOppId(e.target.value)}
                className="w-full bg-[#15171D] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition"
              >
                <option value="">-- Choose an opportunity --</option>
                {opportunities.filter(o => o.raisedAmount > 0).map(o => (
                  <option key={o.id} value={o.id}>{o.title} (Raised: ${o.raisedAmount})</option>
                ))}
              </select>
            </div>

            {selectedOpp && (
              <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-[#222731]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-mono uppercase tracking-wider">Type</label>
                    <select 
                      value={recordType} 
                      onChange={(e) => setRecordType(e.target.value as 'Income' | 'Expense')}
                      className="w-full bg-[#15171D] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition"
                    >
                      <option value="Income">Income (Revenue)</option>
                      <option value="Expense">Expense (Cost)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-mono uppercase tracking-wider">Period</label>
                    <select 
                      value={period} 
                      onChange={(e) => setPeriod(e.target.value as any)}
                      className="w-full bg-[#15171D] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="One-off">One-off</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-mono uppercase tracking-wider">Amount ($)</label>
                  <input 
                    required 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    className="w-full bg-[#15171D] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-mono uppercase tracking-wider">Description</label>
                  <input 
                    required 
                    type="text" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    className="w-full bg-[#15171D] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition" 
                    placeholder="e.g. November Sales Revenue"
                  />
                </div>

                <button type="submit" className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-mono font-bold text-sm uppercase tracking-wider rounded-xl transition cursor-pointer mt-4">
                  Submit Record
                </button>
              </form>
            )}
          </div>
        </div>

        {selectedOpp && (
          <div className="bg-[#111318] border border-[#222731] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-6">Opportunity Ledger</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#15171D] border border-[#222731] p-4 rounded-xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Net Revenue</span>
                <span className="text-xl font-serif text-emerald-400">${calculateNetRevenue(selectedOpp).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
              </div>
              <div className="bg-[#15171D] border border-[#222731] p-4 rounded-xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Total Shares</span>
                <span className="text-xl font-serif text-white">{selectedOpp.totalShares?.toLocaleString() || selectedOpp.targetAmount.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {(!selectedOpp.financialRecords || selectedOpp.financialRecords.length === 0) ? (
                <p className="text-slate-500 font-mono text-sm text-center py-4">No financial records yet.</p>
              ) : (
                selectedOpp.financialRecords.slice().reverse().map((rec, i) => (
                  <div key={i} className="bg-[#15171D] border border-[#222731] p-3 rounded-xl flex justify-between items-center text-sm">
                    <div>
                      <span className="text-white font-semibold font-mono block">{rec.description}</span>
                      <span className="text-[10px] text-slate-500">{new Date(rec.date).toLocaleDateString()} • {rec.period}</span>
                    </div>
                    <span className={`font-mono font-bold ${rec.type === 'Income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {rec.type === 'Income' ? '+' : '-'}${rec.amount.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface AdminProps {
  opportunities: BusinessOpportunity[];
  onAddOpportunity: (opp: BusinessOpportunity) => void;
  onUpdateOpportunity: (opp: BusinessOpportunity) => void;
  admins: string[];
  onAddAdmin: (email: string) => void;
  onRemoveAdmin: (email: string) => void;
  currentUserEmail: string;
  platformUsers: PlatformUser[];
  activeAdminTab?: 'users' | 'business' | 'financials' | 'admins';
}

export const Admin: React.FC<AdminProps> = ({ opportunities, onAddOpportunity, onUpdateOpportunity, admins, onAddAdmin, onRemoveAdmin, currentUserEmail, platformUsers, activeAdminTab = 'users' }) => {
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newOpp, setNewOpp] = useState<Partial<BusinessOpportunity>>({
    title: '',
    category: '',
    location: '',
    country: '',
    description: '',
    targetAmount: 0,
    raisedAmount: 0,
    minInvestment: 0,
    expectedRor: 0,
    termMonths: 0,
    riskScore: 'Low',
    imageUrl: '',
    equityOrDebt: 'Debt',
    ownerName: '',
    impactMetrics: [''],
    fundingType: 'Generalized',
    preparationDays: 0
  });

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `opp-${Date.now()}`;
    const newOpportunity = { ...newOpp, id, financialRecords: [], sharePrice: 1, totalShares: newOpp.targetAmount, availableShares: newOpp.targetAmount } as BusinessOpportunity;
    onAddOpportunity(newOpportunity);
    setNewOpp({
      title: '',
      category: '',
      location: '',
      country: '',
      description: '',
      targetAmount: 0,
      raisedAmount: 0,
      minInvestment: 0,
      expectedRor: 0,
      termMonths: 0,
      riskScore: 'Low',
      imageUrl: '',
      equityOrDebt: 'Debt',
      ownerName: '',
      impactMetrics: [''],
      fundingType: 'Generalized',
      preparationDays: 0
    });
    alert('Investment Opportunity Posted Successfully!');
  };

  const handleMetricChange = (index: number, value: string) => {
    const metrics = [...(newOpp.impactMetrics || [])];
    metrics[index] = value;
    setNewOpp({ ...newOpp, impactMetrics: metrics });
  };

  const addMetricField = () => {
    setNewOpp({ ...newOpp, impactMetrics: [...(newOpp.impactMetrics || []), ''] });
  };

  return (
    <div className="w-full h-full flex flex-col animate-fade-in bg-[#0C0E12] min-h-[calc(100vh-2rem)] rounded-2xl overflow-hidden border border-[#222731]">
      {/* Admin Content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {activeAdminTab === 'users' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-serif text-white mb-2">User Management</h1>
            <p className="text-slate-400 font-mono text-sm max-w-2xl mb-8">
              View all app users and their balances.
            </p>
            <div className="bg-[#111318] border border-[#222731] rounded-2xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-sm">
                  <thead>
                    <tr className="text-slate-500 border-b border-[#222731]">
                      <th className="pb-3 font-normal">Wallet Address / Email</th>
                      <th className="pb-3 font-normal">KYC Status</th>
                      <th className="pb-3 font-normal">Account Balance</th>
                      <th className="pb-3 font-normal">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {platformUsers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500 font-mono">No users found.</td>
                      </tr>
                    )}
                    {platformUsers.map((user, i) => (
                      <tr key={i} className="border-b border-[#222731]/50 last:border-0 hover:bg-slate-800/30">
                        <td className="py-4">
                          <div className="font-semibold text-white">{user.address}</div>
                          {user.email && <div className="text-[10px] text-slate-500">{user.email}</div>}
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider ${
                            user.kyc === 'Verified' ? 'bg-emerald-500/20 text-emerald-400' :
                            user.kyc === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {user.kyc}
                          </span>
                        </td>
                        <td className="py-4 text-emerald-400">${user.balance.toLocaleString()}</td>
                        <td className="py-4 text-slate-500">{new Date(user.joined).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeAdminTab === 'business' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-serif text-white mb-2">Business Management</h1>
              <p className="text-slate-400 font-mono text-sm max-w-2xl mb-8">
                Create new business opportunities and manage existing ones. Static funding is for single investors, generalized is for crowd funding.
              </p>
            </div>
            
            <div className="bg-[#111318] border border-[#222731] rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-6 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" /> Create Opportunity
              </h3>
              <form onSubmit={handlePost} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-mono uppercase tracking-wider">Project Title</label>
                    <input required type="text" value={newOpp.title} onChange={e => setNewOpp({...newOpp, title: e.target.value})} className="w-full bg-[#15171D] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition" placeholder="e.g. Solar Microgrid" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-mono uppercase tracking-wider">Owner Name</label>
                    <input required type="text" value={newOpp.ownerName} onChange={e => setNewOpp({...newOpp, ownerName: e.target.value})} className="w-full bg-[#15171D] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition" placeholder="e.g. Samuel Ochieng" />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2 p-4 bg-[#15171D] rounded-xl border border-[#222731]">
                    <label className="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-3">Funding Type & Logic</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <select value={newOpp.fundingType} onChange={e => setNewOpp({...newOpp, fundingType: e.target.value as any})} className="w-full bg-[#111318] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition">
                          <option value="Generalized">Generalized (Crowd Funding)</option>
                          <option value="Static">Static (Single Investor)</option>
                        </select>
                      </div>
                      {newOpp.fundingType === 'Static' && (
                        <div className="space-y-2">
                          <input required type="number" min="0" value={newOpp.preparationDays || ''} onChange={e => setNewOpp({...newOpp, preparationDays: Number(e.target.value)})} className="w-full bg-[#111318] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition" placeholder="Preparation timeframe (days)" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 mt-3 leading-relaxed">
                      {newOpp.fundingType === 'Static' 
                        ? 'Static opportunity requires exactly ONE investor. Investment returns start counting AFTER the preparation timeframe.' 
                        : 'Generalized funding allows MULTIPLE investors. Investment returns start counting AFTER the funding target is fully reached.'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-mono uppercase tracking-wider">Category</label>
                    <input required type="text" value={newOpp.category} onChange={e => setNewOpp({...newOpp, category: e.target.value})} className="w-full bg-[#15171D] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition" placeholder="e.g. Energy & Infrastructure" />
                  </div>
                  <div className="space-y-2 flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-slate-400 font-mono uppercase tracking-wider">Location</label>
                      <input required type="text" value={newOpp.location} onChange={e => setNewOpp({...newOpp, location: e.target.value})} className="w-full bg-[#15171D] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition mt-2" placeholder="e.g. Kisumu" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-slate-400 font-mono uppercase tracking-wider">Country</label>
                      <input required type="text" value={newOpp.country} onChange={e => setNewOpp({...newOpp, country: e.target.value})} className="w-full bg-[#15171D] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition mt-2" placeholder="e.g. Kenya" />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs text-slate-400 font-mono uppercase tracking-wider">Image URL</label>
                    <input required type="text" value={newOpp.imageUrl} onChange={e => setNewOpp({...newOpp, imageUrl: e.target.value})} className="w-full bg-[#15171D] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition" placeholder="https://images.unsplash.com/..." />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs text-slate-400 font-mono uppercase tracking-wider">Description</label>
                    <textarea required value={newOpp.description} onChange={e => setNewOpp({...newOpp, description: e.target.value})} className="w-full bg-[#15171D] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition min-h-[100px]" placeholder="Detailed description of the business model and use of funds..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-mono uppercase tracking-wider">Target Amount ($)</label>
                    <input required type="number" min="0" value={newOpp.targetAmount || ''} onChange={e => setNewOpp({...newOpp, targetAmount: Number(e.target.value)})} className="w-full bg-[#15171D] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-mono uppercase tracking-wider">Min Investment ($)</label>
                    <input required type="number" min="0" value={newOpp.minInvestment || ''} onChange={e => setNewOpp({...newOpp, minInvestment: Number(e.target.value)})} className="w-full bg-[#15171D] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-mono uppercase tracking-wider">Expected Return (%)</label>
                    <input required type="number" step="0.1" min="0" value={newOpp.expectedRor || ''} onChange={e => setNewOpp({...newOpp, expectedRor: Number(e.target.value)})} className="w-full bg-[#15171D] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-mono uppercase tracking-wider">Term (Months)</label>
                    <input required type="number" min="0" value={newOpp.termMonths || ''} onChange={e => setNewOpp({...newOpp, termMonths: Number(e.target.value)})} className="w-full bg-[#15171D] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-mono uppercase tracking-wider">Risk Score</label>
                    <select value={newOpp.riskScore} onChange={e => setNewOpp({...newOpp, riskScore: e.target.value as any})} className="w-full bg-[#15171D] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-mono uppercase tracking-wider">Type</label>
                    <select value={newOpp.equityOrDebt} onChange={e => setNewOpp({...newOpp, equityOrDebt: e.target.value as any})} className="w-full bg-[#15171D] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition">
                      <option value="Debt">Debt</option>
                      <option value="Equity">Equity</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs text-slate-400 font-mono uppercase tracking-wider block">Impact Metrics</label>
                    {newOpp.impactMetrics?.map((metric, i) => (
                      <input key={i} type="text" value={metric} onChange={e => handleMetricChange(i, e.target.value)} className="w-full bg-[#15171D] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition mb-2" placeholder={`Metric ${i+1}`} />
                    ))}
                    <button type="button" onClick={addMetricField} className="text-xs font-mono text-emerald-400 hover:text-emerald-300">
                      + Add Metric
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#222731] flex justify-end">
                  <button type="submit" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-mono font-bold text-sm uppercase tracking-wider rounded-xl transition cursor-pointer">
                    Publish Opportunity
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-[#111318] border border-[#222731] rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" /> Managed Opportunities
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-sm">
                  <thead>
                    <tr className="text-slate-500 border-b border-[#222731]">
                      <th className="pb-3 font-normal">Project</th>
                      <th className="pb-3 font-normal">Type</th>
                      <th className="pb-3 font-normal">Shares Owned/Total</th>
                      <th className="pb-3 font-normal">Raised</th>
                      <th className="pb-3 font-normal">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {opportunities.map(opp => {
                      const totalS = opp.totalShares || opp.targetAmount;
                      const availS = opp.availableShares ?? (opp.targetAmount - opp.raisedAmount);
                      const ownedS = totalS - availS;
                      
                      return (
                        <tr key={opp.id} className="border-b border-[#222731]/50 last:border-0 hover:bg-slate-800/30">
                          <td className="py-4">
                            <div className="font-semibold text-white">{opp.title}</div>
                            <div className="text-[10px] text-slate-500 mt-1">{opp.location}, {opp.country}</div>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider ${
                              opp.fundingType === 'Static' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {opp.fundingType || 'Generalized'}
                            </span>
                          </td>
                          <td className="py-4 text-slate-400">{ownedS.toLocaleString()} / {totalS.toLocaleString()}</td>
                          <td className="py-4 text-emerald-400">${opp.raisedAmount.toLocaleString()} / ${opp.targetAmount.toLocaleString()}</td>
                          <td className="py-4">
                            {opp.raisedAmount >= opp.targetAmount ? (
                              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-[10px] uppercase tracking-wider flex w-fit items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Funded
                              </span>
                            ) : (
                              <span className="bg-slate-500/20 text-slate-400 px-2 py-1 rounded text-[10px] uppercase tracking-wider">
                                Active
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeAdminTab === 'financials' && (
          <FinancialsTab opportunities={opportunities} onUpdateOpportunity={onUpdateOpportunity} />
        )}

        {activeAdminTab === 'admins' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-serif text-white mb-2">Admin Roles</h1>
            <p className="text-slate-400 font-mono text-sm max-w-2xl mb-8">
              Manage platform administrators. Root admin has full control.
            </p>
            <div className="bg-[#111318] border border-[#222731] rounded-2xl p-6">
              <div className="mb-6 space-y-4">
                {currentUserEmail.toLowerCase() === 'eahunanya116@gmail.com' && (
                  <div className="flex flex-col md:flex-row gap-4">
                    <input 
                      type="email" 
                      value={newAdminEmail} 
                      onChange={e => setNewAdminEmail(e.target.value)} 
                      className="flex-1 bg-[#15171D] border border-[#252B37] rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none transition" 
                      placeholder="Enter email address" 
                    />
                    <button 
                      onClick={() => {
                        if (newAdminEmail && !admins.includes(newAdminEmail.toLowerCase())) {
                          onAddAdmin(newAdminEmail);
                          setNewAdminEmail('');
                        }
                      }}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-mono font-bold text-sm uppercase tracking-wider rounded-xl transition cursor-pointer"
                    >
                      Add Admin
                    </button>
                  </div>
                )}
                <p className="text-xs text-slate-400 font-mono">
                  Root Admin: eahunanya116@gmail.com
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-sm">
                  <thead>
                    <tr className="text-slate-500 border-b border-[#222731]">
                      <th className="pb-3 font-normal">Email Address</th>
                      <th className="pb-3 font-normal">Role</th>
                      <th className="pb-3 font-normal text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {admins.map((email, i) => (
                      <tr key={i} className="border-b border-[#222731]/50 last:border-0 hover:bg-slate-800/30">
                        <td className="py-4 font-semibold text-white">{email}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider ${
                            email === 'eahunanya116@gmail.com' ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {email === 'eahunanya116@gmail.com' ? 'Root Admin' : 'Admin'}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          {email !== 'eahunanya116@gmail.com' && currentUserEmail.toLowerCase() === 'eahunanya116@gmail.com' && (
                            <button 
                              onClick={() => onRemoveAdmin(email)}
                              className="text-xs text-red-400 hover:text-red-300 transition"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
