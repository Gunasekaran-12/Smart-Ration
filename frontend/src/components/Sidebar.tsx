import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  Boxes,
  Sliders,
  FileBarChart2,
  AlertCircle,
  Users,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const links = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'SHOP_OPERATOR', 'BENEFICIARY', 'AUDITOR'],
    },
    {
      to: '/distribution',
      label: 'Distribution Counter',
      icon: ShoppingCart,
      roles: ['SUPER_ADMIN', 'SHOP_OPERATOR'],
    },
    {
      to: '/cards',
      label: role === 'BENEFICIARY' ? 'My Ration Card' : 'Ration Cards',
      icon: CreditCard,
      roles: ['SUPER_ADMIN', 'SHOP_OPERATOR', 'BENEFICIARY'],
    },
    {
      to: '/stock',
      label: 'Stock Ledger',
      icon: Boxes,
      roles: ['SUPER_ADMIN', 'SHOP_OPERATOR', 'AUDITOR'],
    },
    {
      to: '/entitlements',
      label: 'Entitlements & Rules',
      icon: Sliders,
      roles: ['SUPER_ADMIN', 'AUDITOR'],
    },
    {
      to: '/reports',
      label: 'Reports & Reconciliation',
      icon: FileBarChart2,
      roles: ['SUPER_ADMIN', 'AUDITOR', 'SHOP_OPERATOR'],
    },
    {
      to: '/complaints',
      label: 'Grievances / Complaints',
      icon: AlertCircle,
      roles: ['SUPER_ADMIN', 'SHOP_OPERATOR', 'BENEFICIARY', 'AUDITOR'],
    },
    {
      to: '/users-shops',
      label: 'Shops & Accounts',
      icon: Users,
      roles: ['SUPER_ADMIN'],
    },
    {
      to: '/audit-logs',
      label: 'System Audit Logs',
      icon: ShieldCheck,
      roles: ['SUPER_ADMIN', 'AUDITOR'],
    },
  ];

  const allowedLinks = links.filter((link) => link.roles.includes(role));

  return (
    <aside className="w-64 flex-shrink-0 bg-white text-slate-800 border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shadow-sm">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center justify-between">
          <span>PORTAL DIRECTORY</span>
          <BookOpen size={13} className="text-emerald-600" />
        </div>

        {allowedLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/90 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={`transition-transform group-hover:scale-110 ${
                      isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-emerald-600'
                    }`}
                  />
                  <span>{link.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="sidebarActivePill"
                      className="absolute right-2 w-1.5 h-1.5 rounded-full bg-emerald-600"
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Shop / User context footer pill */}
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] space-y-1 shadow-sm">
        <span className="text-slate-400 block font-semibold font-mono text-[10px]">
          ASSIGNED JURISDICTION
        </span>
        <p className="font-bold text-slate-900 truncate">
          {user.shopName || (user.cardNumber ? `Card: ${user.cardNumber}` : 'HQ Directorate')}
        </p>
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
          <span className="text-[10px] text-emerald-700 font-mono font-bold tracking-wider">
            PORTAL CONNECTED
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
