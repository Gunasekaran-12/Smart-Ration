import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileBarChart2,
  Download,
  Calendar,
  Building,
  RefreshCw,
  Printer,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reportApi, shopApi } from '../services';
import type { RationShop } from '../types';
import PageContainer from '../components/PageContainer';
import StatusBadge from '../components/StatusBadge';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [shops, setShops] = useState<RationShop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<number>(user?.shopId || 1);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    shopApi.getAll().then((data) => {
      setShops(data);
      if (data.length > 0 && !user?.shopId) {
        setSelectedShopId(data[0].id);
      }
    }).catch(console.error);
  }, [user]);

  useEffect(() => {
    loadReconciliation();
  }, [selectedShopId]);

  const loadReconciliation = async () => {
    setIsLoading(true);
    try {
      const data = await reportApi.getReconciliation(selectedShopId);
      setReconciliation(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportDistributions = () => {
    reportApi.exportDistributionsCsv(selectedShopId, startDate, endDate);
  };

  const handleExportLedger = () => {
    reportApi.exportLedgerCsv(selectedShopId);
  };

  return (
    <PageContainer
      title="Statutory Audit Reports & Stock Reconciliation"
      subtitle="Verify stock ledger mathematical consistency (Opening + Inward - Distributed ± Adjustments = Closing) and download official CSV logs"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportDistributions}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
          >
            <Download size={15} />
            Export Distributions CSV
          </button>
          <button
            onClick={handleExportLedger}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/30 flex items-center gap-1.5 transition-all"
          >
            <Download size={15} />
            Export Ledger CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all print:hidden"
          >
            <Printer size={15} />
            Print
          </button>
        </div>
      }
    >
      {/* Controls Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs print:hidden"
      >
        <div className="flex items-center gap-3">
          <Building size={16} className="text-emerald-600" />
          <select
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold focus:border-emerald-500 font-mono"
          >
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.shopName} ({s.shopNumber})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <Calendar size={16} className="text-emerald-600" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900"
          />
          <span className="text-slate-400 font-bold">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900"
          />
        </div>
      </motion.div>

      {/* Reconciliation Table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileBarChart2 size={18} className="text-emerald-600" />
              <span>Expected vs. Actual Stock Balance Reconciliation</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Formula: Expected Stock = Opening Stock + Inward Receipts - Distributions + Authorized Adjustments
            </p>
          </div>

          <button
            onClick={loadReconciliation}
            className="p-2 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Recalculate"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 font-mono text-[11px]">
                <th className="py-3 px-4">Commodity</th>
                <th className="py-3 px-4 text-right">Inward Receipts</th>
                <th className="py-3 px-4 text-right">Distributions</th>
                <th className="py-3 px-4 text-right">Adjustments</th>
                <th className="py-3 px-4 text-right">Calculated Expected Stock</th>
                <th className="py-3 px-4 text-right">Actual Recorded Stock</th>
                <th className="py-3 px-4 text-center">Variance / Discrepancy</th>
                <th className="py-3 px-4 text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {reconciliation?.reconciliationData?.map((row: any) => (
                <tr key={row.commodityId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 font-sans">
                    {row.commodityName}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-emerald-700">
                    +{Number(row.inwardReceipts).toFixed(2)} {row.unit}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500">
                    -{Number(row.distributions).toFixed(2)} {row.unit}
                  </td>
                  <td className="py-3.5 px-4 text-right text-amber-700">
                    {Number(row.adjustments).toFixed(2)} {row.unit}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {Number(row.expectedStock).toFixed(2)} {row.unit}
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                    {Number(row.actualRecordedStock).toFixed(2)} {row.unit}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold">
                    {Number(row.discrepancy) === 0 ? (
                      <span className="text-emerald-700">0.00 {row.unit}</span>
                    ) : (
                      <span className="text-rose-600">
                        {Number(row.discrepancy) > 0 ? `+${row.discrepancy}` : row.discrepancy} {row.unit}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </PageContainer>
  );
};

export default ReportsPage;
