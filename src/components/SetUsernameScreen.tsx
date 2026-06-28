import React, { useState } from 'react';
import { RefreshCw, UserCheck, Shield, ChevronRight } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { updatePlatformUser } from '../lib/db.service';

interface SetUsernameScreenProps {
  userId: string;
  onUsernameSet: (username: string) => void;
}

export const SetUsernameScreen: React.FC<SetUsernameScreenProps> = ({ userId, onUsernameSet }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = username.trim().toLowerCase();
    
    // Alphanumeric validation + length check
    if (trimmed.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (trimmed.length > 20) {
      setError('Username must be at most 20 characters long.');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      setError('Only letters, numbers, and underscores are allowed.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if username is already taken in Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', trimmed));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError('This username is already taken. Please try another one.');
        setIsSubmitting(false);
        return;
      }

      // Update in Firestore
      await updatePlatformUser(userId, { username: trimmed });
      
      // Notify parent component
      onUsernameSet(trimmed);
    } catch (err: any) {
      console.error('Failed to set username:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0E12] flex flex-col items-center justify-center p-6 text-slate-200 font-sans">
      <div className="max-w-md w-full bg-[#111318] border border-[#222731] rounded-2xl p-8 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20 mb-2">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase font-mono">
            Register Identity
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
            Choose a unique identifier to register your secure MPC portal on the Credora multi-chain gateway.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-left">
            <label htmlFor="username-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Choose Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">
                @
              </span>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="username"
                autoComplete="off"
                disabled={isSubmitting}
                className="w-full pl-9 pr-4 py-3 bg-[#15171D] border border-[#222731] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            {error ? (
              <p className="text-red-400 text-[11px] font-mono mt-1 leading-relaxed">
                {error}
              </p>
            ) : (
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                Letters, numbers, and underscores only. 3-20 characters.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !username.trim()}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-[#1A2026] disabled:text-slate-600 disabled:border-transparent text-black font-extrabold rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer text-xs font-mono tracking-wider uppercase shadow-lg border border-emerald-400/20"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying and saving...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Confirm Identifier</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
