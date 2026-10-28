import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../services';
import type { NotificationItem } from '../types';
import SmartRationLogo from './SmartRationLogo';

interface NavbarProps {
  isSseConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isSseConnected }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationApi.getMyNotifications();
      setNotifications(data);
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  };

  const markRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SHOP_OPERATOR':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'AUDITOR':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'BENEFICIARY':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: 3D Book Brand Logo */}
        <div className="flex items-center gap-4">
          <SmartRationLogo size="sm" />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Nature Leaves & Sand Live Indicator */}
          <div
            title="Falling green leaves & sand atmospheric engine active"
            className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 border border-emerald-200/80 text-emerald-800 shadow-sm"
          >
            <Sparkles size={13} className="text-emerald-600 animate-pulse" />
            <span className="text-[10px] tracking-wide text-emerald-700">LEAVES & SAND FLOW</span>
          </div>

          {/* Live SSE Status Badge */}
          <div
            title={isSseConnected ? 'Live real-time telemetry stream active' : 'Connecting to live stream...'}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              {isSseConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isSseConnected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-400'
                }`}
              />
            </span>
            <span className="hidden sm:inline text-slate-700 font-mono text-[11px] font-bold">
              {isSseConnected ? 'LIVE' : 'CONNECTING'}
            </span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-md">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 space-y-3 backdrop-blur-xl text-slate-800"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
                    <span className="text-xs text-slate-500 font-mono">{unreadCount} unread</span>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-center py-6 text-slate-400">No notifications</p>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            n.isRead
                              ? 'bg-slate-50 border-slate-200 text-slate-500'
                              : 'bg-emerald-50/70 border-emerald-200 text-slate-900 shadow-sm'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold text-slate-900 block">
                              {n.title}
                            </span>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="mt-1 text-slate-600 line-clamp-2">{n.message}</p>
                          <span className="mt-2 block text-[10px] text-slate-400 font-mono">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User profile pill */}
          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {user.fullName}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border self-end mt-1 ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {user.role.replace(/_/g, ' ')}
                </span>
              </div>

              <button
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
