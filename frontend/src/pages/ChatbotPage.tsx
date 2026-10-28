import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  RefreshCw,
  Sparkles,
  Database,
  Calendar,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { chatbotApi } from '../services';
import { useAuth } from '../context/AuthContext';
import PageContainer from '../components/PageContainer';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  source?: string;
  isError?: boolean;
}

const SUGGESTED_QUESTIONS = [
  'How much rice is available?',
  'Which commodities are out of stock?',
  'Is sugar available?',
  'What is the current stock of wheat?',
  'Which commodities have low stock?',
  'When will rice be replenished?',
  'Can I book a ration slot now?',
  'Which commodities are available for distribution?',
  "What are this month's distribution dates?",
  'What are the ration distribution rules?',
];

const COMMODITY_STATUS_OVERVIEW = [
  { name: 'Boiled Rice (Grade A)', stock: '950.00 KG', status: 'IN_STOCK', color: 'emerald' },
  { name: 'Whole Milling Wheat', stock: '680.00 KG', status: 'IN_STOCK', color: 'emerald' },
  { name: 'Refined Cane Sugar', stock: '0.00 KG', status: 'OUT_OF_STOCK', color: 'rose' },
  { name: 'Toor Dal (Pulses)', stock: '80.00 KG', status: 'IN_STOCK', color: 'emerald' },
  { name: 'Cooking Oil', stock: '25.00 L', status: 'LOW_STOCK', color: 'amber' },
  { name: 'Fortified Iodized Salt', stock: '450.00 KG', status: 'IN_STOCK', color: 'emerald' },
];

export const ChatbotPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Vanakkam! Welcome to the **SMART RATION SHOP MANAGEMENT SYSTEM WITH REAL-TIME STOCK ANALYTICS** Stock Assistant.

I am connected directly to your Fair Price Shop's live database (**MySQL \`smart\`**). I provide real-time updates on:
• Physical, reserved, and available stock for all 6 statutory commodities
• Out-of-stock notices and replenishment delivery dates
• 30-minute booking slot availability & remaining capacity
• Official NFSA entitlement rules and distribution schedules

How may I assist you with your ration quota today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'State Civil Supplies Database (MySQL `smart`)',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[]>(SUGGESTED_QUESTIONS.slice(0, 6));

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setLastFailedMessage(null);

    try {
      const response = await chatbotApi.sendMessage(
        textToSend,
        user?.rationCardId,
        user?.shopId || 1
      );

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: response.source || 'MySQL `smart` Database',
      };

      setMessages((prev) => [...prev, botMsg]);
      if (response.quickReplies && response.quickReplies.length > 0) {
        setQuickReplies(response.quickReplies);
      }
    } catch (err: any) {
      setLastFailedMessage(textToSend);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'bot',
          text: '⚠️ **Communication Notice:** Unable to reach the central Fair Price Shop database server. Please verify your connection or click Retry.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper to render basic markdown bold/lists
  const renderFormattedText = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold rendering
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="text-white font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      return (
        <p key={i} className="min-h-[1.25rem] leading-relaxed">
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <PageContainer
      title="Stock Assistant & Real-Time Query Desk"
      subtitle="Data-driven conversational agent connected directly to the Fair Price Shop MySQL database."
      actions={
        <div className="flex items-center gap-3">
          <Link
            to="/booking"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]"
          >
            <Calendar size={14} />
            <span>Book Ration Slot</span>
            <ArrowRight size={12} />
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-mono">
            <Database size={13} className="text-emerald-400" />
            <span>DB: smart (Live)</span>
          </div>
        </div>
      }
    >
      {/* 1. Real-Time Commodity Stock Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {COMMODITY_STATUS_OVERVIEW.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-2xl bg-gradient-to-br from-[#0c1629]/90 to-[#070d18]/90 border border-white/10 backdrop-blur-xl hover:border-emerald-500/30 transition-all shadow-lg"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 truncate">
                {item.name.split(' ')[0]}
              </span>
              {item.status === 'IN_STOCK' && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 size={10} /> In Stock
                </span>
              )}
              {item.status === 'LOW_STOCK' && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                  <AlertTriangle size={10} /> Low
                </span>
              )}
              {item.status === 'OUT_OF_STOCK' && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-full border border-rose-500/20">
                  <AlertCircle size={10} /> Out
                </span>
              )}
            </div>
            <div className="text-base font-black text-white">{item.stock}</div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.name}</div>
          </div>
        ))}
      </div>

      {/* 2. Main Chatbot Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Suggestions & Guidance Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1629]/95 to-[#070d18]/95 border border-white/10 backdrop-blur-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              <Sparkles size={14} />
              <span>Suggested Queries</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click any verified prompt below to run a real-time query against the Fair Price Shop stock ledger:
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  disabled={isLoading}
                  className="text-left p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 text-xs text-slate-300 hover:text-emerald-300 transition-all font-medium leading-snug group flex items-start gap-2"
                >
                  <ArrowRight size={13} className="text-slate-400 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5 flex-shrink-0 mt-0.5" />
                  <span>{q}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy & Safeguard Notice Card */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 backdrop-blur-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <ShieldCheck size={14} />
              <span>Privacy-Guarded Telemetry</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              General commodity stock, open hours, and slot capacities are public. Individual household quotas and family registers are strictly restricted to authenticated cardholders.
            </p>
          </div>
        </div>

        {/* Right Chat Stream Container */}
        <div className="lg:col-span-3 flex flex-col h-[650px] rounded-3xl bg-gradient-to-b from-[#0c1629]/95 to-[#070d18]/95 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="p-4 px-6 border-b border-white/10 bg-[#091120]/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <div className="w-full h-full bg-[#070d18] rounded-[14px] flex items-center justify-center text-emerald-400">
                  <Bot size={20} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white tracking-wide">
                    Smart Ration Stock Assistant
                  </h2>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Fair Price Shop #1 (FPS-1001) • Department of Food & Civil Supplies
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([
                  {
                    id: `reset-${Date.now()}`,
                    sender: 'bot',
                    text: 'Chat history cleared. How may I assist you with current stock, distribution dates, or slot booking?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    source: 'State Civil Supplies Database (MySQL `smart`)',
                  },
                ]);
              }}
              title="Reset Conversation"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

          {/* Conversation Stream */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 scroll-smooth"
          >
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-tr from-cyan-600 to-blue-500 text-white'
                      : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {msg.sender === 'user' ? <User size={15} /> : <Bot size={15} />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`space-y-1.5 ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`p-4 rounded-2xl text-xs md:text-[13px] leading-relaxed shadow-lg ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none font-medium'
                        : msg.isError
                        ? 'bg-rose-950/40 border border-rose-500/30 text-rose-200 rounded-tl-none'
                        : 'bg-[#0f1d33] border border-white/10 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {renderFormattedText(msg.text)}
                  </div>

                  {/* Metadata: Timestamp & Source */}
                  <div
                    className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.source && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono text-emerald-400">
                          <Database size={10} />
                          {msg.source}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mr-auto max-w-[80%]"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Bot size={15} />
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-none bg-[#0f1d33] border border-white/10 text-slate-300 text-xs flex items-center gap-2 shadow-lg">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 ml-1">
                    Querying live MySQL stock tables...
                  </span>
                </div>
              </motion.div>
            )}

            {/* Error Retry Option */}
            {lastFailedMessage && !isLoading && (
              <div className="flex items-center justify-center gap-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
                <span>Failed to process query.</span>
                <button
                  onClick={() => handleSend(lastFailedMessage)}
                  className="font-bold underline hover:text-white flex items-center gap-1"
                >
                  <RefreshCw size={11} /> Retry
                </button>
              </div>
            )}
          </div>

          {/* Quick Replies Bar */}
          <div className="px-5 py-2.5 border-t border-white/5 bg-[#0a1324]/90 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono uppercase text-slate-400 flex-shrink-0 flex items-center gap-1">
              <Sparkles size={11} className="text-emerald-400" />
              Follow-up:
            </span>
            {quickReplies.map((qr, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qr)}
                disabled={isLoading}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/30 text-xs text-slate-300 hover:text-emerald-300 transition-all font-medium flex-shrink-0"
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Input & Send Controls */}
          <div className="p-4 px-6 border-t border-white/10 bg-[#091120] flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Rice, Wheat, Sugar availability, low stock, distribution dates, or slot booking..."
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#0d182b] border border-white/10 focus:border-emerald-500 rounded-2xl text-xs md:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium shadow-inner"
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 group"
            >
              <Send size={18} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ChatbotPage;
