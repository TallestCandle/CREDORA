import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, MessageSquarePlus, Brain, User, Trash2, ArrowUp, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { BUSINESS_OPPORTUNITIES } from '../data/opportunities';
import { BusinessOpportunity } from '../types';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

interface ResearchProps {
  initialPrompt?: string;
  contextOpportunity?: BusinessOpportunity | null;
}

export const Research: React.FC<ResearchProps> = ({ initialPrompt = '', contextOpportunity }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load sessions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('credora_research_chats');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSessions(parsed);
        if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error('Failed to parse sessions');
      }
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('credora_research_chats', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Handle incoming initial prompt
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() !== '') {
      // Start a new chat session automatically for the initial prompt
      const newSession: ChatSession = {
        id: `chat-${Date.now()}`,
        title: contextOpportunity ? `Research: ${contextOpportunity.title}` : 'New Research',
        messages: [
          { role: 'ai', text: `Hi! I am the Credora AI Research assistant. I can help you analyze the ${contextOpportunity?.title || 'opportunities'} and answer your questions.` },
          { role: 'user', text: initialPrompt }
        ],
        updatedAt: Date.now()
      };
      
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      
      // Auto-send the prompt
      sendAiRequest(newSession.id, [newSession.messages[0], newSession.messages[1]]);
    } else if (sessions.length === 0) {
      handleNewChat();
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessions, activeSessionId, isLoading]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `chat-${Date.now()}`,
      title: 'New Research',
      messages: [
        { role: 'ai', text: 'Hi! I am the Credora AI Research assistant. How can I help you research our investment opportunities today? My responses include real-world data from Google Search to assist you.' }
      ],
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id) {
      setActiveSessionId(updated.length > 0 ? updated[0].id : null);
    }
    if (updated.length === 0) {
      localStorage.removeItem('credora_research_chats');
    } else {
      localStorage.setItem('credora_research_chats', JSON.stringify(updated));
    }
  };

  const sendAiRequest = async (sessionId: string, currentMessages: Message[]) => {
    setIsLoading(true);
    try {
      const contextData = JSON.stringify(BUSINESS_OPPORTUNITIES.map(o => ({
        title: o.title,
        owner: o.ownerName,
        category: o.category,
        location: o.location,
        expectedReturn: o.expectedRor,
        raisedAmount: o.raisedAmount,
        targetAmount: o.targetAmount,
        riskProfile: o.riskScore,
        businessModel: o.description 
      })));

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: currentMessages,
          contextData 
        })
      });
      
      const data = await response.json();
      
      setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          const title = s.title === 'New Research' && currentMessages.length > 1 
            ? currentMessages[1].text.slice(0, 30) + '...' 
            : s.title;
            
          return {
            ...s,
            title,
            messages: [...currentMessages, { role: 'ai', text: data.text }],
            updatedAt: Date.now()
          };
        }
        return s;
      }));
    } catch (error) {
      setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            messages: [...currentMessages, { role: 'ai', text: 'Sorry, I encountered an error while processing your request. Please try again.' }],
            updatedAt: Date.now()
          };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!input.trim() || !activeSessionId) return;

    const userMsg = input;
    setInput('');
    
    const sessionToUpdate = sessions.find(s => s.id === activeSessionId);
    if (!sessionToUpdate) return;
    
    const updatedMessages = [...sessionToUpdate.messages, { role: 'user' as const, text: userMsg }];
    
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, messages: updatedMessages, updatedAt: Date.now() };
      }
      return s;
    }));
    
    sendAiRequest(activeSessionId, updatedMessages);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-6rem)] w-full max-w-7xl mx-auto gap-4 animate-fade-in">
      {/* Sidebar for chat history */}
      <div className={`w-full md:w-1/3 md:max-w-[320px] bg-[#0B0D11] border border-[#222731] rounded-2xl flex-col overflow-hidden ${activeSessionId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-[#222731] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2 tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-400" /> RESEARCH
          </h3>
          <button 
            onClick={handleNewChat}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition tooltip"
            title="New Research"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sessions.map(session => (
            <div 
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`w-full text-left p-3 rounded-xl border flex items-start justify-between group cursor-pointer transition ${
                activeSessionId === session.id 
                  ? 'bg-[#15171D] border-emerald-500/30' 
                  : 'bg-transparent border-transparent hover:bg-[#15171D] hover:border-[#222731]'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-mono truncate ${activeSessionId === session.id ? 'text-white' : 'text-slate-400'}`}>
                  {session.title}
                </p>
                <p className="text-[10px] text-slate-600 font-mono mt-1">
                  {new Date(session.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={(e) => handleDeleteChat(e, session.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-950/40 hover:text-red-400 text-slate-500 rounded transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-center p-6 text-slate-500 text-xs font-mono">
              No research history found. Start a new session.
            </div>
          )}
        </div>
      </div>

      {/* Main chat interface */}
      <div className={`flex-1 bg-[#0B0D11] border border-[#222731] rounded-2xl flex-col overflow-hidden ${!activeSessionId ? 'hidden md:flex' : 'flex'}`}>
        {activeSession ? (
          <>
            <div className="p-4 border-b border-[#222731] flex items-center md:hidden bg-[#0E1015]">
              <button 
                onClick={() => setActiveSessionId(null)}
                className="mr-2 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-bold text-white font-mono truncate">{activeSession.title}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
              {activeSession.messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-white text-black'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Brain className="w-5 h-5" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl p-4 text-sm font-sans ${
                    msg.role === 'user'
                      ? 'bg-[#15171D] border border-[#252B37] text-white'
                      : 'bg-transparent text-slate-300'
                  }`}>
                    {msg.role === 'ai' ? (
                      <div className="prose prose-invert prose-emerald max-w-none text-sm prose-p:leading-relaxed prose-pre:bg-[#15171D] prose-pre:border prose-pre:border-[#222731]">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-slate-500 font-mono self-center animate-pulse">
                    Analyzing investment data...
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-[#222731] bg-[#0E1015]">
              <div className="relative">
                <input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="w-full bg-[#15171D] border border-[#252B37] text-white rounded-xl pl-4 pr-12 py-3.5 text-sm font-mono focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="Ask about business models, returns, risks..."
                  disabled={isLoading}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white text-black rounded-lg hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center mt-2">
                <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                  AI uses Google Search Grounding to provide accurate real-time data
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
            <Sparkles className="w-8 h-8 opacity-20" />
            <p className="text-sm font-mono tracking-widest uppercase">Select or start a research chat</p>
          </div>
        )}
      </div>
    </div>
  );
};
