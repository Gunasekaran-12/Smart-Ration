import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import { auditLogApi } from '../services';
import type { AuditLog } from '../types';
import PageContainer from '../components/PageContainer';
import StatusBadge from '../components/StatusBadge';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await auditLogApi.getAuditLogs({
        action: actionFilter || undefined,
        page,
        size: 15,
      });
      setLogs(data.content);
      setTotalPages(data.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer
      title="System Audit & Security Logs"
      subtitle="Read-only tamper-proof administrative ledger recording user access, transactions, and adjustments"
    >
      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-emerald-600" />
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(0);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold focus:border-emerald-500 font-mono"
          >
            <option value="">All Audited Actions</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="DISTRIBUTE_COMMODITIES">DISTRIBUTE_COMMODITIES</option>
            <option value="STOCK_INWARD_RECEIPT">STOCK_INWARD_RECEIPT</option>
            <option value="STOCK_ADJUSTMENT">STOCK_ADJUSTMENT</option>
            <option value="CREATE_RATION_CARD">CREATE_RATION_CARD</option>
            <option value="SUBMIT_COMPLAINT">SUBMIT_COMPLAINT</option>
          </select>
        </div>

        <span className="text-slate-500 font-mono text-[11px]">
          {isLoading ? 'Updating records...' : `Showing Page ${page + 1} of ${totalPages || 1}`}
        </span>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 font-mono text-[11px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {new Date(log.createdAt).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 font-sans">
                    {log.username}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={log.userRole} />
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                    {log.entityType} #{log.entityId}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 max-w-sm truncate font-sans">
                    {log.details}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-slate-500 font-mono">Page {page + 1} of {totalPages || 1}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </motion.div>
    </PageContainer>
  );
};

export default AuditLogsPage;
