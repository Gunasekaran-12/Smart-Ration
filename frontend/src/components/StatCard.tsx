import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  trend,
}) => {
  const styles = {
    blue: {
      border: 'border-slate-200 hover:border-sky-300',
      iconBg: 'bg-sky-50 text-sky-600 border border-sky-200',
      accent: 'text-sky-600',
    },
    emerald: {
      border: 'border-slate-200 hover:border-emerald-300',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
      accent: 'text-emerald-600',
    },
    amber: {
      border: 'border-slate-200 hover:border-amber-300',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200',
      accent: 'text-amber-600',
    },
    purple: {
      border: 'border-slate-200 hover:border-purple-300',
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-200',
      accent: 'text-purple-600',
    },
    rose: {
      border: 'border-slate-200 hover:border-rose-300',
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-200',
      accent: 'text-rose-600',
    },
  }[variant];

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
      className={`p-5 rounded-2xl bg-white border ${styles.border} shadow-sm hover:shadow-md transition-all relative overflow-hidden`}
    >
      <div className="flex items-center justify-between relative z-10">
        <div>
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {value}
            </span>
            {trend && (
              <span className={`text-xs font-bold ${styles.accent}`}>
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>

        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${styles.iconBg}`}>
          <Icon size={22} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
