import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PackagePlus,
  AlertOctagon,
  CheckCircle,
  Layers,
  ArrowDownRight,
  History,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { stockApi, commodityApi } from '../services';
import type { StockMovement, StockBatch, Commodity } from '../types';
import PageContainer from '../components/PageContainer';
import StatusBadge from '../components/StatusBadge';

export const StockManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'movements' | 'receive' | 'adjust'>('movements');
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inward Receipt Form State
  const [receiveForm, setReceiveForm] = useState({
    commodityId: 1,
    batchNumber: '',
    warehouseRef: '',
    receivedDate: new Date().toISOString().split('T')[0],
    quantity: 1000,
  });

  // Adjustment Form State
  const [adjustForm, setAdjustForm] = useState({
    commodityId: 1,
    batchId: '',
    movementType: 'ADJUSTMENT_DAMAGE',
    quantity: 10,
    reason: '',
  });

  useEffect(() => {
    loadCommodities();
    loadBatches();
    loadMovements();
  }, [page]);

  const loadCommodities = async () => {
    try {
      const data = await commodityApi.getAll();
      setCommodities(data);
      if (data.length > 0) {
        setReceiveForm((f) => ({ ...f, commodityId: data[0].id }));
        setAdjustForm((f) => ({ ...f, commodityId: data[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadBatches = async () => {
    try {
      const data = await stockApi.getBatches(user?.shopId || 1);
      setBatches(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadMovements = async () => {
    setIsLoading(true);
    try {
      const data = await stockApi.getMovements(user?.shopId || 1, page, 10);
      setMovements(data.content);
      setTotalPages(data.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReceiveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!receiveForm.batchNumber.trim() || !receiveForm.warehouseRef.trim()) {
      setErrorMsg('Please specify batch number and warehouse challan reference.');
      return;
    }

    try {
      await stockApi.receiveStock({
        shopId: user?.shopId || 1,
        commodityId: Number(receiveForm.commodityId),
        batchNumber: receiveForm.batchNumber.trim().toUpperCase(),
        warehouseRef: receiveForm.warehouseRef.trim().toUpperCase(),
        receivedDate: receiveForm.receivedDate,
        quantity: Number(receiveForm.quantity),
      });

      setSuccessMsg('Stock batch successfully recorded in traceable ledger!');
      loadMovements();
      loadBatches();
      setActiveTab('movements');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to record stock batch');
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!adjustForm.reason.trim()) {
      setErrorMsg('Audit reason is required for any stock adjustment.');
      return;
    }

    try {
      await stockApi.adjustStock({
        shopId: user?.shopId || 1,
        commodityId: Number(adjustForm.commodityId),
        batchId: adjustForm.batchId ? Number(adjustForm.batchId) : undefined,
        movementType: adjustForm.movementType,
        quantity: Number(adjustForm.quantity),
        reason: adjustForm.reason,
      });

      setSuccessMsg('Stock adjustment recorded successfully.');
      loadMovements();
      loadBatches();
      setActiveTab('movements');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to process adjustment');
    }
  };

  return (
    <PageContainer
      title="Warehouse Stock Ledger & Movements"
      subtitle="Record incoming central consignments, track immutable batch ledger, and execute authorized adjustments"
      actions={
        user?.role !== 'AUDITOR' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('receive')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'receive'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-700/60 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <PackagePlus size={16} />
              Inward Receipt
            </button>
            <button
              onClick={() => setActiveTab('adjust')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'adjust'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold shadow-lg shadow-amber-950/50'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-700/60 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <AlertOctagon size={16} />
              Stock Adjustment
            </button>
          </div>
        ) : undefined
      }
    >
      {/* Alert Banners */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shadow-sm backdrop-blur-md">
          <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 shadow-sm backdrop-blur-md">
          <AlertOctagon size={18} className="text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs View */}
      {activeTab === 'movements' && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.3)] backdrop-blur-xl overflow-hidden"
        >
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <History size={16} className="text-emerald-400" />
                <span>Traceable Stock Movements Ledger</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Chronological audit record of every receipt, distribution deduction, and adjustment
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {isLoading ? 'Loading...' : `Page ${page + 1} of ${totalPages || 1}`} ({batches.length} tracked batches)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 font-mono text-[11px]">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Commodity</th>
                  <th className="py-3 px-4">Movement Type</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-right">Balance After</th>
                  <th className="py-3 px-4">Reference ID</th>
                  <th className="py-3 px-4">Audit Reason</th>
                  <th className="py-3 px-4">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                      {isLoading ? 'Loading movements ledger...' : 'No stock movements recorded yet.'}
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(m.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100 flex items-center gap-1.5">
                        <Layers size={13} className="text-slate-500" />
                        {m.commodity?.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={m.movementType} />
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-bold ${
                          Number(m.quantity) > 0 ? 'text-emerald-400' : 'text-slate-300'
                        }`}
                      >
                        {Number(m.quantity) > 0 ? `+${m.quantity}` : m.quantity} {m.commodity?.measurementUnit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-100">
                        {m.balanceAfter} {m.commodity?.measurementUnit}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-400">
                        {m.referenceId || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate font-sans">
                        {m.reason || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-sans">
                        {m.performedByUser?.fullName || 'System'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-800/80 flex justify-between items-center text-xs">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-700/60 bg-slate-950/50 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <span className="text-slate-400 font-mono">
              {isLoading ? 'Updating ledger...' : `Page ${page + 1} of ${totalPages || 1}`} ({batches.length} tracked batches)
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg border border-slate-700/60 bg-slate-950/50 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </motion.div>
      )}

      {/* Inward Receipt Form Modal/Card */}
      {activeTab === 'receive' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-slate-900 border border-slate-700/70 rounded-3xl p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.7)] max-w-xl mx-auto space-y-5 text-slate-100"
        >
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PackagePlus size={20} className="text-emerald-400" />
              <span>Record Inward Stock from Warehouse</span>
            </h3>
            <button
              onClick={() => setActiveTab('movements')}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleReceiveStock} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Commodity
              </label>
              <select
                value={receiveForm.commodityId}
                onChange={(e) => setReceiveForm({ ...receiveForm, commodityId: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 font-semibold focus:border-emerald-500/80 focus:outline-none"
              >
                {commodities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.measurementUnit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Batch Number
                </label>
                <input
                  type="text"
                  value={receiveForm.batchNumber}
                  onChange={(e) => setReceiveForm({ ...receiveForm, batchNumber: e.target.value })}
                  placeholder="e.g. BATCH-2026-RICE-05"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-emerald-400 font-bold focus:border-emerald-500/80 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Warehouse Challan / Ref
                </label>
                <input
                  type="text"
                  value={receiveForm.warehouseRef}
                  onChange={(e) => setReceiveForm({ ...receiveForm, warehouseRef: e.target.value })}
                  placeholder="e.g. FCI-WH-BLR-904"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:border-emerald-500/80 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Received Date
                </label>
                <input
                  type="date"
                  value={receiveForm.receivedDate}
                  onChange={(e) => setReceiveForm({ ...receiveForm, receivedDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:border-emerald-500/80 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Received Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={receiveForm.quantity}
                  onChange={(e) => setReceiveForm({ ...receiveForm, quantity: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 font-bold focus:border-emerald-500/80 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 font-sans">
              <button
                type="button"
                onClick={() => setActiveTab('movements')}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition-all"
              >
                <ArrowDownRight size={15} />
                Save Inward Receipt
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Authorized Stock Adjustment Form */}
      {activeTab === 'adjust' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-slate-900 border border-slate-700/70 rounded-3xl p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.7)] max-w-xl mx-auto space-y-5 text-slate-100"
        >
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertOctagon size={20} className="text-amber-400" />
              <span>Record Authorized Stock Adjustment</span>
            </h3>
            <button
              onClick={() => setActiveTab('movements')}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleAdjustStock} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Commodity to Adjust
              </label>
              <select
                value={adjustForm.commodityId}
                onChange={(e) => setAdjustForm({ ...adjustForm, commodityId: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 font-semibold focus:border-amber-400/80 focus:outline-none"
              >
                {commodities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.measurementUnit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Adjustment Type
                </label>
                <select
                  value={adjustForm.movementType}
                  onChange={(e) => setAdjustForm({ ...adjustForm, movementType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 font-semibold focus:border-amber-400/80 focus:outline-none"
                >
                  <option value="ADJUSTMENT_DAMAGE">Damage (Moisture / Pest)</option>
                  <option value="ADJUSTMENT_CORRECTION">Correction (Scale Calibration)</option>
                  <option value="ADJUSTMENT_TRANSFER">Inter-Shop Stock Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Quantity to Deduct
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={adjustForm.quantity}
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantity: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 font-bold focus:border-amber-400/80 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Mandatory Audit Reason & Responsible Officer
              </label>
              <textarea
                rows={3}
                required
                value={adjustForm.reason}
                onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                placeholder="Explain justification for adjustment for inspector verification..."
                className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:outline-none focus:border-amber-400/80 font-sans"
              />
            </div>

            <div className="pt-3 flex justify-end gap-3 font-sans">
              <button
                type="button"
                onClick={() => setActiveTab('movements')}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl shadow-lg shadow-amber-950/50 transition-all"
              >
                Submit Adjustment
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </PageContainer>
  );
};

export default StockManagementPage;
