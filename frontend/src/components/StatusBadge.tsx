import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = () => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'RESOLVED':
      case 'ACTIVE':
      case 'BALANCED':
      case 'AAY':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'IN_REVIEW':
      case 'BPL':
      case 'ADJUSTMENT_DAMAGE':
      case 'LOW_STOCK':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'REJECTED':
      case 'DISCREPANCY_FLAGGED':
      case 'INACTIVE':
      case 'VOIDED':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'SUBMITTED':
      case 'INWARD_RECEIPT':
      case 'APL':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle()} font-mono`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export default StatusBadge;
