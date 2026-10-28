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
  ArrowLeft,
  CreditCard,
  Calendar,
  Key,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FallingLeavesAndSand from '../components/FallingLeavesAndSand';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, beneficiaryLogin } = useAuth();

  const [loginMode, setLoginMode] = useState<'STAFF' | 'BENEFICIARY'>('STAFF');

  // Staff Credentials
  const [username, setUsername] = useState('operator');
  const [password, setPassword] = useState('operator123');

  // Beneficiary Credentials (Default demo: Ramesh Sharma -> RAME1982)
  const [cardNumber, setCardNumber] = useState('RC-KA-01-456123');
  const [dateOfBirth, setDateOfBirth] = useState('1982-05-14');
  const [beneficiaryPass, setBeneficiaryPass] = useState('RAME1982');

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

  const handleReplay = () => {
    if (isReplaying) return;
    setIsReplaying(true);
    setIsOpen(false);
    setTimeout(() => {
      setIsOpen(true);
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
      if (loginMode === 'BENEFICIARY') {
        await beneficiaryLogin(
          cardNumber.trim().toUpperCase(),
          dateOfBirth.trim(),
          beneficiaryPass.trim()
        );
      } else {
        await login(username.trim(), password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        (loginMode === 'BENEFICIARY'
          ? 'Cardholder authentication failed. Please verify Card Number and Date of Birth.'
          : 'Authentication failed. Please verify your username and password.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccountSelect = (demo: any) => {
    setLoginMode(demo.mode);
    if (demo.mode === 'BENEFICIARY') {
      setCardNumber(demo.card);
      setDateOfBirth(demo.dob);
      setBeneficiaryPass(demo.initialPwd);
    } else {
      setUsername(demo.user);
      setPassword(demo.pass);
    }
    setError(null);
  };

  const demoAccounts = [
    {
      role: 'Super Admin',
      user: 'admin',
      pass: 'admin123',
      badge: 'Directorate HQ',
      mode: 'STAFF' as const,
    },
    {
      role: 'Shop Operator',
      user: 'operator',
      pass: 'operator123',
      badge: 'FPS-1001 Counter',
      mode: 'STAFF' as const,
    },
    {
      role: 'Quality Auditor',
      user: 'auditor',
      pass: 'auditor123',
      badge: 'Inspector Portal',
      mode: 'STAFF' as const,
    },
    {
      role: 'Beneficiary Login',
      user: 'RC-KA-01-456123',
      pass: 'RAME1982',
      badge: 'Citizen Portal',
      mode: 'BENEFICIARY' as const,
      card: 'RC-KA-01-456123',
      dob: '1982-05-14',
      initialPwd: 'RAME1982',
    },
  ];

  const demoBeneficiaryCards = [
    { card: 'RC-KA-01-456123', name: 'Ramesh Sharma', dob: '1982-05-14', initialPwd: 'RAME1982', category: 'BPL' },
    { card: 'RC-KA-01-987654', name: 'Suresh Kumar', dob: '1982-05-14', initialPwd: 'SURE1982', category: 'BPL' },
    { card: 'RC-KA-01-987655', name: 'Lakshmi Bai', dob: '1964-08-25', initialPwd: 'LAKS1964', category: 'AAY' },
    { card: 'RC-KA-01-987656', name: 'Mohammed Rafiq', dob: '1976-12-10', initialPwd: 'MOHA1976', category: 'BPL' },
    { card: 'RC-KA-01-987657', name: 'Sunita Patil', dob: '1985-04-18', initialPwd: 'SUNI1985', category: 'APL' },
    { card: 'RC-KA-02-123450', name: 'Anand Hegde', dob: '1980-07-03', initialPwd: 'ANAN1980', category: 'BPL' },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#070d18] flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden text-slate-100 select-none">
      {/* Background Ambient Spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.12)_0%,_rgba(6,182,212,0.05)_45%,_transparent_75%)] pointer-events-none" />

      {/* Falling Green Leaves & Golden Sand Dust Particles */}
      <FallingLeavesAndSand />

      {/* Top Ambient Bar with 3D Book Replay Action */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-30 mb-4 sm:mb-6 flex items-center justify-between gap-3 w-full max-w-[940px] px-2"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/40 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            title="Return to Landing Page"
          >
            <ArrowLeft size={13} className="text-emerald-400" />
            <span>Home</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-bold text-slate-300 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
            <BookOpen size={14} className="text-emerald-400" />
            <span>NATIONAL FOOD SECURITY &bull;</span>
            <span className="text-emerald-400">OFFICIAL PDS 3D LEDGER</span>
          </div>
        </div>

        <button
          onClick={handleReplay}
          disabled={isReplaying}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/40 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-60 backdrop-blur-md"
        >
          <RotateCcw
            size={13}
            className={`text-emerald-400 ${isReplaying ? 'animate-spin' : ''}`}
          />
          <span>{isReplaying ? 'Replaying...' : 'Replay 3D Book'}</span>
        </button>
      </motion.div>

      {/* DESKTOP 3D HARDCOVER BOOK (Medium screens and up: md:block) */}
      <div
        className="hidden md:block relative z-20 w-full max-w-[960px] my-auto"
        style={{ perspective: '2200px' }}
      >
        <motion.div
          animate={{
            rotateX: isOpen ? 0 : 5,
            rotateZ: isOpen ? 0 : -1.5,
            scale: isOpen ? 1 : 0.96,
            y: isOpen ? 0 : 10,
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full"
        >
          {/* HARDCOVER BOOK BASE SHADOW */}
          <div
            className={`absolute -inset-4 bg-black/60 rounded-3xl blur-2xl transition-opacity duration-700 pointer-events-none ${
              isOpen ? 'opacity-80 scale-100' : 'opacity-40 scale-90'
            }`}
          />

          {/* 3D BOOK CASING & TWO-PANEL GRID SPREAD */}
          <div className="relative w-full rounded-2xl border-4 border-[#0b2b48]/70 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] bg-[#070d18] grid grid-cols-2 overflow-hidden min-h-[580px]">
            {/* BOOK SPINE CENTER CREASE / HINGE */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-7 z-30 pointer-events-none bg-gradient-to-r from-black/10 via-black/30 to-black/10 shadow-[inset_0_0_8px_rgba(0,0,0,0.35)]" />

            {/* LEFT PANEL: Registry, Logo & Demo Accounts */}
            <div className="relative z-10 bg-white rounded-l-xl p-6 lg:p-7 flex flex-col justify-between border-r border-slate-200/90 shadow-[inset_-20px_0_30px_rgba(0,0,0,0.03)] min-w-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <ShieldCheck size={13} />
                    FOLIO № 01 &bull; PDS REGISTRY
                  </span>
                  <span>AUTHO: 2026-IV</span>
                </div>

                {/* Brand Identity / Logo & Title Block */}
                <div className="flex items-center gap-3.5 pt-1 min-w-0">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 flex-shrink-0 rounded-xl bg-slate-50 border border-slate-200/90 p-1 flex items-center justify-center shadow-sm">
                    <img
                      src="/smart-ration-logo.png"
                      alt="SMART RATION SHOP MANAGEMENT SYSTEM WITH REAL-TIME STOCK ANALYTICS"
                      className="w-full h-full object-contain select-none pointer-events-none"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        SMART
                      </span>
                      <span className="text-base sm:text-lg font-black text-[#0e487a] tracking-tight">
                        RATION SHOP
                      </span>
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-300">
                        PDS
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase">
                      Real-Time Stock Analytics
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      Precision Food Security & Distribution Ledger
                    </p>
                  </div>
                </div>

                {/* Target Terminal & Security Protocol */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[9px] font-mono text-slate-400 uppercase block">
                      Target Terminal
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      FPS-1001 Main Counter
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[9px] font-mono text-slate-400 uppercase block">
                      Security Protocol
                    </span>
                    <span className="text-xs font-bold text-emerald-700 truncate block">
                      256-Bit SSL Ledger
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick-Select Demo Accounts */}
              <div className="space-y-2 my-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-wider font-mono">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-500" />
                    Demo Shortcuts:
                  </span>
                  <span className="text-[9px] text-emerald-700 font-semibold lowercase">4 system roles</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {demoAccounts.map((demo) => {
                    const isSelected =
                      demo.mode === 'BENEFICIARY'
                        ? loginMode === 'BENEFICIARY'
                        : loginMode === 'STAFF' && username === demo.user;

                    return (
                      <button
                        key={demo.role}
                        type="button"
                        onClick={() => handleDemoAccountSelect(demo)}
                        className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-sm ring-1 ring-emerald-400/40'
                            : 'bg-slate-50/90 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] block truncate">{demo.role}</span>
                          {isSelected && <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />}
                        </div>
                        <span className="text-[9px] text-slate-400 block font-mono truncate">
                          {demo.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* 6 Registered Demo Beneficiary Cards Quick-Fill */}
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold flex items-center gap-1 text-slate-700">
                      <CreditCard size={11} className="text-emerald-600" />
                      6 Enrolled Beneficiary Cards:
                    </span>
                    <span className="text-[8px] text-slate-400">Click to fill</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 max-h-24 overflow-y-auto pr-0.5">
                    {demoBeneficiaryCards.map((c) => {
                      const isCardActive = loginMode === 'BENEFICIARY' && cardNumber === c.card;
                      return (
                        <button
                          key={c.card}
                          type="button"
                          onClick={() => {
                            setLoginMode('BENEFICIARY');
                            setCardNumber(c.card);
                            setDateOfBirth(c.dob);
                            setBeneficiaryPass(c.initialPwd);
                            setError(null);
                          }}
                          className={`px-2 py-1 rounded-lg text-left border transition-all cursor-pointer ${
                            isCardActive
                              ? 'bg-emerald-100/80 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <div className="font-bold text-[10px] truncate leading-tight">{c.name}</div>
                          <div className="text-[8px] font-mono text-slate-400 flex items-center justify-between">
                            <span className="truncate max-w-[70px]">{c.card}</span>
                            <span className="text-emerald-700 font-semibold">{c.initialPwd}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Government of India &bull; NFSA</span>
                <span>Page 01 of 02</span>
              </div>
            </div>

            {/* RIGHT PANEL: Digital Sign-In Terminal Form */}
            <div className="relative z-10 bg-white rounded-r-xl p-6 lg:p-7 flex flex-col justify-between shadow-[inset_20px_0_30px_rgba(0,0,0,0.03)] min-w-0">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                  <span>DIGITAL COUNTER TERMINAL</span>
                  <span className="text-emerald-700">FOLIO № 02 &bull; ACCESS</span>
                </div>

                {/* Portal Mode Tabs */}
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode('STAFF');
                      setError(null);
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      loginMode === 'STAFF'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck size={14} className={loginMode === 'STAFF' ? 'text-emerald-600' : ''} />
                    <span>Official Staff</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode('BENEFICIARY');
                      setError(null);
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      loginMode === 'BENEFICIARY'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <CreditCard size={14} className={loginMode === 'BENEFICIARY' ? 'text-emerald-600' : ''} />
                    <span>Cardholder</span>
                  </button>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    {loginMode === 'BENEFICIARY'
                      ? 'Beneficiary Citizen Login'
                      : 'Staff & Inspector Sign-In'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {loginMode === 'BENEFICIARY'
                      ? 'Sign in using your Ration Card Number and Date of Birth'
                      : 'Sign in to access your Public Distribution & Entitlement Portal'}
                  </p>
                </div>

                {/* Error Alert */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
                  >
                    <AlertCircle size={14} className="flex-shrink-0 text-rose-600" />
                    <span className="truncate">{error}</span>
                  </motion.div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-2.5">
                  {loginMode === 'STAFF' ? (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                          Username / Staff ID
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <User size={14} />
                          </span>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Enter username"
                            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                          Security Passphrase
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Lock size={14} />
                          </span>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter password"
                            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                          Ration Card Number
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <CreditCard size={14} />
                          </span>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            required
                            placeholder="e.g. RC-KA-01-456123 or RC-KA-01-987654"
                            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono uppercase focus:outline-none focus:border-emerald-500 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                          Date of Birth (Head of Family)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Calendar size={14} />
                          </span>
                          <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            required
                            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-emerald-500 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[11px] font-bold text-slate-700 font-mono uppercase">
                            Password
                          </label>
                          <span className="text-[10px] text-emerald-700 font-mono font-medium">
                            Initial: First 4 Letters + Birth Year
                          </span>
                        </div>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Key size={14} />
                          </span>
                          <input
                            type="password"
                            value={beneficiaryPass}
                            onChange={(e) => setBeneficiaryPass(e.target.value)}
                            required
                            placeholder="e.g. RAME1982 or SURE1982"
                            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2.5 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Authenticating...
                      </span>
                    ) : (
                      <>
                        <LogIn size={15} />
                        <span>{loginMode === 'BENEFICIARY' ? 'Enter Beneficiary Portal' : 'Sign In to System'}</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="truncate max-w-[280px]">Smart Ration Shop Management System &bull; v1.0</span>
                <span>Page 02 of 02</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* MOBILE LOGIN CARD (Phones and small screens) */}
      <div className="block md:hidden relative z-20 w-full max-w-sm">
        <div className="w-full bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-5 shadow-2xl space-y-4 backdrop-blur-xl text-slate-100">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-base font-black text-white">SMART</span>
              <span className="text-base font-black text-emerald-400">RATION SHOP</span>
              <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                PDS
              </span>
            </div>
            <p className="text-[10px] text-slate-300 font-medium">
              Smart Ration Shop Management System with Real-Time Stock Analytics
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-800 border border-white/10 text-xs">
            <button
              onClick={() => setLoginMode('STAFF')}
              className={`py-1 rounded-lg font-bold ${
                loginMode === 'STAFF' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              Staff
            </button>
            <button
              onClick={() => setLoginMode('BENEFICIARY')}
              className={`py-1 rounded-lg font-bold ${
                loginMode === 'BENEFICIARY' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              Beneficiary
            </button>
          </div>

          {error && (
            <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            {loginMode === 'STAFF' ? (
              <>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 text-white text-xs border border-white/10"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 text-white text-xs border border-white/10"
                />
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Ration Card Number"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 text-white text-xs border border-white/10"
                />
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 text-white text-xs border border-white/10"
                />
                <input
                  type="password"
                  value={beneficiaryPass}
                  onChange={(e) => setBeneficiaryPass(e.target.value)}
                  placeholder="Password (e.g. RAME1982 or SURE1982)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 text-white text-xs border border-white/10"
                />
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Mobile Demo Accounts */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <span className="text-[10px] text-slate-400 font-mono font-semibold flex items-center gap-1">
              <Sparkles size={11} className="text-amber-400" />
              Quick Select Demo:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {demoAccounts.map((d) => {
                const isSelected =
                  d.mode === 'BENEFICIARY'
                    ? loginMode === 'BENEFICIARY'
                    : loginMode === 'STAFF' && username === d.user;
                return (
                  <button
                    key={d.role}
                    type="button"
                    onClick={() => handleDemoAccountSelect(d)}
                    className={`p-2 rounded-xl text-[10px] text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                        : 'bg-slate-800/90 text-slate-300 border-white/5 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold truncate">{d.role}</span>
                      {isSelected && <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />}
                    </div>
                    <span className="text-[8px] text-slate-400 font-mono block truncate">{d.badge}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile 6 Enrolled Cards Quick-Fill */}
            <div className="pt-1.5 border-t border-white/5 space-y-1">
              <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                <CreditCard size={10} className="text-emerald-400" />
                6 Demo Beneficiary Cards (Tap to Fill):
              </span>
              <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto">
                {demoBeneficiaryCards.map((c) => (
                  <button
                    key={c.card}
                    type="button"
                    onClick={() => {
                      setLoginMode('BENEFICIARY');
                      setCardNumber(c.card);
                      setDateOfBirth(c.dob);
                      setBeneficiaryPass(c.initialPwd);
                      setError(null);
                    }}
                    className={`p-1.5 rounded-lg text-left text-[9px] border transition-all ${
                      loginMode === 'BENEFICIARY' && cardNumber === c.card
                        ? 'bg-emerald-500/30 border-emerald-400 text-white font-bold'
                        : 'bg-slate-800/60 border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="font-bold truncate">{c.name}</div>
                    <div className="text-[8px] font-mono text-emerald-300">{c.initialPwd}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
