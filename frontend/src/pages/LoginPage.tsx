import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lock,
  User,
  LogIn,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  BookOpen,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FallingLeavesAndSand from '../components/FallingLeavesAndSand';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('operator');
  const [password, setPassword] = useState('operator123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 3D Book Animation State
  const [isOpen, setIsOpen] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);

  // Automatically trigger the 3D book opening shortly after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  // Replay handler for the user to enjoy the 3D book animation at will
  const handleReplay = () => {
    if (isReplaying) return;
    setIsReplaying(true);
    setIsOpen(false); // smoothly close book in 3D
    setTimeout(() => {
      setIsOpen(true); // smoothly open book in 3D
      setTimeout(() => {
        setIsReplaying(false);
      }, 1500);
    }, 750);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(username.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        'Authentication failed. Please verify your username and password.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccountSelect = (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setError(null);
  };

  const demoAccounts = [
    {
      role: 'Super Admin',
      user: 'admin',
      pass: 'admin123',
      badge: 'Directorate HQ',
    },
    {
      role: 'Shop Operator',
      user: 'operator',
      pass: 'operator123',
      badge: 'FPS-1001 Counter',
    },
    {
      role: 'Beneficiary',
      user: 'beneficiary',
      pass: 'beneficiary123',
      badge: 'RC-01-987654',
    },
    {
      role: 'Auditor',
      user: 'auditor',
      pass: 'auditor123',
      badge: 'Quality Inspector',
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden text-slate-800 select-none">
      {/* Falling Green Leaves & Golden Sand Dust Particles */}
      <FallingLeavesAndSand />

      {/* Top Ambient Bar with 3D Book Replay Action */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-30 mb-4 sm:mb-6 flex items-center justify-between gap-3 w-full max-w-[940px] px-2"
      >
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-sm">
          <BookOpen size={14} className="text-emerald-600" />
          <span className="hidden sm:inline">NATIONAL FOOD SECURITY &bull;</span>
          <span className="text-[#0e487a]">OFFICIAL PDS 3D LEDGER</span>
        </div>

        <button
          onClick={handleReplay}
          disabled={isReplaying}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white/90 hover:bg-white text-slate-700 hover:text-emerald-700 border border-slate-200/80 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-60"
          title="Replay the 3D book opening animation"
        >
          <RotateCcw
            size={13}
            className={isReplaying ? 'animate-spin text-emerald-600' : 'text-emerald-600'}
          />
          <span>{isOpen ? 'Replay 3D Book Opening' : 'Opening Ledger Book...'}</span>
        </button>
      </motion.div>

      {/* ========================================================================= */}
      {/* DESKTOP 3D OPENING BOOK SPREAD (md and larger) */}
      {/* ========================================================================= */}
      <div
        className="hidden md:block relative z-20 w-full max-w-[940px] h-[610px]"
        style={{ perspective: '2200px' }}
      >
        {/* Main 3D Book Motion Rig */}
        <motion.div
          animate={{
            x: isOpen ? 0 : -235,
            rotateX: isOpen ? 0 : 4,
            rotateY: isOpen ? 0 : -6,
            scale: isOpen ? 1 : 0.97,
          }}
          transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full h-full"
        >
          {/* Physical Hardcover Binding Base (Underneath both pages) */}
          <div className="absolute -inset-2 bg-gradient-to-r from-[#0c2842] via-[#083020] to-[#0c2842] rounded-3xl shadow-[0_35px_80px_rgba(0,0,0,0.22),0_15px_30px_rgba(0,0,0,0.14)] -z-10 border border-amber-400/40" />

          {/* Stacked Ledger Pages Rim (simulates 300 pages depth on edges) */}
          <div className="absolute right-[-6px] top-2 bottom-2 w-3 bg-[#ede7d8] border-r border-[#d4cbba] rounded-r-md shadow-inner pointer-events-none" />
          <div className="absolute left-[-6px] top-2 bottom-2 w-3 bg-[#ede7d8] border-l border-[#d4cbba] rounded-l-md shadow-inner pointer-events-none" />
          <div className="absolute bottom-[-6px] left-2 right-2 h-3 bg-[#e8e2d2] border-b border-[#cfc6b4] rounded-b-md shadow-inner pointer-events-none" />

          {/* Central Book Spine Crease & Shadow Gutter */}
          <div className="absolute left-1/2 -ml-5 w-10 inset-y-0 z-30 pointer-events-none bg-gradient-to-r from-black/15 via-black/5 to-black/15" />
          <div className="absolute left-1/2 -ml-[1px] w-[2px] inset-y-2 z-30 pointer-events-none border-l border-dashed border-amber-900/20" />

          {/* Golden Silk Bookmark Ribbon hanging from top gutter */}
          <div
            className="absolute top-0 right-[47.5%] w-7 h-44 bg-gradient-to-b from-amber-600 via-amber-400 to-amber-500 shadow-lg z-40 rounded-b pointer-events-none"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)',
            }}
          >
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-200/40 via-transparent to-transparent" />
          </div>

          {/* ===================================================================== */}
          {/* 3D FLIPPING LEAF: LEFT PAGE & HARDCOVER FRONT COVER */}
          {/* ===================================================================== */}
          <motion.div
            initial={{ rotateY: 180 }}
            animate={{ rotateY: isOpen ? 0 : 180 }}
            transition={{
              duration: 1.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              transformOrigin: 'right center',
              transformStyle: 'preserve-3d',
            }}
            className="absolute inset-y-0 left-0 w-1/2 z-20 cursor-default"
          >
            {/* ----------------------------------------------------------------- */}
            {/* INSIDE LEFT PAGE (Visible when book is open: rotateY = 0) */}
            {/* ----------------------------------------------------------------- */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
              className="absolute inset-0 bg-[#ffffff] rounded-l-2xl border-l border-t border-b border-slate-200/90 p-7 flex flex-col justify-between shadow-[inset_-25px_0_35px_rgba(0,0,0,0.03)]"
            >
              {/* Header / Folio */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <ShieldCheck size={13} />
                    FOLIO № 01 &bull; PDS REGISTRY
                  </span>
                  <span>AUTHO: 2026-IV</span>
                </div>

                {/* Crest Emblem & Title */}
                <div className="flex items-center gap-4 mt-4">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    src="/smart-ration-logo.png"
                    alt="Smart Ration Logo"
                    className="w-20 h-auto object-contain drop-shadow-md select-none pointer-events-none"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-black text-slate-900 tracking-tight">
                        SMART
                      </span>
                      <span className="text-xl font-black text-[#0e487a] tracking-tight">
                        RATION
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-300">
                        PDS
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Real-Time Inventory Analytics
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Public Distribution & Entitlement Portal
                    </p>
                  </div>
                </div>

                {/* Registry Verification Specs */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[9px] font-mono text-slate-400 uppercase block">
                      Target Terminal
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      FPS-1001 Main Counter
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[9px] font-mono text-slate-400 uppercase block">
                      Security Protocol
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      256-Bit SSL Ledger
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick-Select Demo Accounts */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">
                  <Sparkles size={12} className="text-amber-500" />
                  <span>Quick-Select Demo Accounts:</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {demoAccounts.map((demo) => {
                    const isSelected = username === demo.user;
                    return (
                      <button
                        key={demo.user}
                        type="button"
                        onClick={() => handleDemoAccountSelect(demo.user, demo.pass)}
                        className={`p-2.5 rounded-xl text-left border text-xs transition-all relative overflow-hidden cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-sm'
                            : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold block">{demo.role}</span>
                          {isSelected && (
                            <CheckCircle2 size={13} className="text-emerald-600" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                          {demo.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ledger Footer Stamp */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Award size={12} className="text-amber-500" />
                  Official PDS Ledger
                </span>
                <span>Page 01 of 02</span>
              </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* HARDCOVER FRONT COVER (Visible when book is closed: rotateY = 180) */}
            {/* ----------------------------------------------------------------- */}
            <div
              style={{
                transform: 'rotateY(180deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
              className="absolute inset-0 bg-gradient-to-br from-[#0b2b48] via-[#093522] to-[#041a12] rounded-r-2xl border-4 border-amber-400/60 p-8 flex flex-col items-center justify-between text-amber-100 shadow-2xl overflow-hidden"
            >
              {/* Inner Gold Foil Filigree Border */}
              <div className="absolute inset-3 border-2 border-amber-400/30 rounded-xl pointer-events-none" />
              <div className="absolute inset-4 border border-amber-300/20 rounded-lg pointer-events-none" />

              {/* Top Government Title */}
              <div className="text-center relative z-10 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-300/80 font-bold block">
                  GOVERNMENT OF INDIA &bull; PDS PORTAL
                </span>
                <span className="text-xs font-serif italic text-amber-200/90 tracking-wider block">
                  National Food Security Act Register
                </span>
              </div>

              {/* Center Official Crest with Glowing Halo */}
              <div className="relative z-10 flex flex-col items-center text-center my-auto">
                <div className="relative p-3">
                  <div className="absolute -inset-4 bg-amber-400/15 rounded-full blur-xl" />
                  <img
                    src="/smart-ration-logo.png"
                    alt="Smart Ration Crest"
                    className="w-36 h-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] select-none pointer-events-none"
                  />
                </div>
                <div className="mt-2 space-y-0.5">
                  <h2 className="text-xl font-black tracking-tight text-white drop-shadow">
                    SMART RATION SHOP
                  </h2>
                  <p className="text-[11px] font-mono tracking-widest text-amber-300 font-bold uppercase">
                    MANAGEMENT SYSTEM
                  </p>
                </div>
              </div>

              {/* Bottom Volume Info & Clasp */}
              <div className="text-center relative z-10 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 border border-amber-400/40 text-[10px] font-mono text-amber-200">
                  <Lock size={11} className="text-amber-400" />
                  <span>OFFICIAL DIGITAL LEDGER &bull; 2026</span>
                </div>
                <p className="text-[10px] text-amber-300/60 font-mono">
                  {isOpen ? 'Ledger Unfolding in 3D...' : 'Opening Book in 3D...'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* ===================================================================== */}
          {/* INTERMEDIATE FLUTTERING PARCHMENT LEAF (Fanning Page Effect) */}
          {/* ===================================================================== */}
          <motion.div
            initial={{ rotateY: 176 }}
            animate={{ rotateY: isOpen ? 0 : 176 }}
            transition={{
              duration: 1.25,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              transformOrigin: 'right center',
              transformStyle: 'preserve-3d',
            }}
            className="absolute inset-y-1 left-1 w-[calc(50%-4px)] z-15 pointer-events-none rounded-l-xl bg-[#faf7ef] border-r border-amber-900/10 shadow-lg opacity-80"
          />

          {/* ===================================================================== */}
          {/* FIXED RIGHT PAGE: DIGITAL COUNTER SIGN-IN TERMINAL */}
          {/* ===================================================================== */}
          <div className="absolute inset-y-0 right-0 w-1/2 z-10 bg-[#ffffff] rounded-r-2xl border-r border-t border-b border-slate-200/90 p-7 flex flex-col justify-between shadow-[inset_25px_0_35px_rgba(0,0,0,0.03)]">
            {/* Header / Folio */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                <span>DIGITAL COUNTER TERMINAL</span>
                <span className="text-emerald-700">FOLIO № 02 &bull; ACCESS</span>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Sign In to System
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Sign in to access your Public Distribution & Entitlement Portal
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium mt-3"
                >
                  <AlertCircle size={15} className="flex-shrink-0 text-rose-600" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">
                    Username / Credential ID
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="Enter username"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">
                    Security Passphrase
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all font-medium"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      <LogIn size={18} />
                      <span>Sign In to System</span>
                    </>
                  )}
                </motion.button>
              </form>
            </div>

            {/* Right Page Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Smart Ration Shop Management System &bull; Version 1.0.0</span>
              <span>Page 02 of 02</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE 3D OPENING BOOK CARD (Phones and small screens: md:hidden) */}
      {/* ========================================================================= */}
      <div
        className="block md:hidden relative z-20 w-full max-w-sm"
        style={{ perspective: '1600px' }}
      >
        <motion.div
          animate={{
            rotateX: isOpen ? 0 : 5,
            scale: isOpen ? 1 : 0.97,
          }}
          transition={{ duration: 0.8 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full bg-white border border-slate-200 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.08)] space-y-4"
        >
          {/* Mobile 3D Cover Flap that swings open */}
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{
              rotateY: isOpen ? -140 : 0,
              opacity: isOpen ? 0 : 1,
              pointerEvents: isOpen ? 'none' : 'auto',
            }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              transformOrigin: 'left center',
              transformStyle: 'preserve-3d',
            }}
            className="absolute inset-0 z-30 bg-gradient-to-br from-[#0c2e4e] via-[#093522] to-[#041910] rounded-3xl border-2 border-amber-400/50 p-6 flex flex-col items-center justify-between text-amber-100 shadow-2xl"
          >
            <div className="text-[10px] font-mono text-amber-300 uppercase tracking-widest text-center font-bold">
              GOVERNMENT OF INDIA &bull; PDS
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="/smart-ration-logo.png"
                alt="Smart Ration Shield"
                className="w-24 h-auto object-contain drop-shadow-md select-none pointer-events-none"
              />
              <span className="text-base font-black text-white mt-2">SMART RATION</span>
              <span className="text-[10px] font-mono text-amber-300 font-bold uppercase">
                Opening 3D Ledger...
              </span>
            </div>
            <div className="text-[10px] text-amber-200/70 font-mono">Tap anywhere to open</div>
          </motion.div>

          {/* Mobile Login Content */}
          <div className="text-center space-y-1">
            <div className="flex justify-center mb-1">
              <img
                src="/smart-ration-logo.png"
                alt="Smart Ration"
                className="w-16 h-auto object-contain drop-shadow select-none pointer-events-none"
              />
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-base font-black text-slate-900">SMART</span>
              <span className="text-base font-black text-[#0e487a]">RATION</span>
              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded-full border border-emerald-300">
                PDS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Sign in to access your Public Distribution & Entitlement Portal
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              <AlertCircle size={15} className="flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Mobile Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                Username / Credential ID
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter username"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-200 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                Security Passphrase
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={15} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-200 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <LogIn size={15} />
                  <span>Sign In to System</span>
                </>
              )}
            </button>
          </form>

          {/* Quick-Select Demo Accounts */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 uppercase font-mono">
              <Sparkles size={11} className="text-amber-500" />
              <span>Quick-Select Demo:</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {demoAccounts.map((demo) => {
                const isSelected = username === demo.user;
                return (
                  <button
                    key={demo.user}
                    type="button"
                    onClick={() => handleDemoAccountSelect(demo.user, demo.pass)}
                    className={`p-2 rounded-lg text-left border text-[11px] transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                        : 'bg-slate-50/70 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{demo.role}</span>
                      {isSelected && <CheckCircle2 size={11} className="text-emerald-600" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center text-[9px] text-slate-400 font-mono">
            Smart Ration Shop Management System &bull; Version 1.0.0
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
