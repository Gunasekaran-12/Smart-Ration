import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PackagePlus,
  AlertOctagon,
  CheckCircle,
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
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <PackagePlus size={16} />
              Inward Receipt
            </button>
            <button
              onClick={() => setActiveTab('adjust')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'adjust'
                  ? 'bg-amber-500 text-white font-bold shadow-md shadow-amber-500/30'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
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
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-sm">
          <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 shadow-sm">
          <AlertOctagon size={18} className="text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs View */}
      {activeTab === 'movements' && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Traceable Stock Movements Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Chronological audit record of every receipt, distribution deduction, and adjustment
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {isLoading ? 'Loading...' : `Page ${page + 1} of ${totalPages || 1}`} ({batches.length} tracked batches)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 font-mono text-[11px]">
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
              <tbody className="divide-y divide-slate-100 font-mono">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(m.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {m.commodity?.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={m.movementType} />
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-bold ${
                        Number(m.quantity) > 0 ? 'text-emerald-700' : 'text-slate-800'
                      }`}
                    >
                      {Number(m.quantity) > 0 ? `+${m.quantity}` : m.quantity} {m.commodity?.measurementUnit}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                      {m.balanceAfter} {m.commodity?.measurementUnit}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500">
                      {m.referenceId || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate font-sans">
                      {m.reason || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-sans">
                      {m.performedByUser?.fullName || 'System'}
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
            <span className="text-slate-500 font-mono">
              {isLoading ? 'Updating ledger...' : `Page ${page + 1} of ${totalPages || 1}`} ({batches.length} tracked batches)
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 disabled:opacity-40"
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
          className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl max-w-xl mx-auto space-y-5"
        >
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PackagePlus size={20} className="text-emerald-600" />
              <span>Record Inward Stock from Warehouse</span>
            </h3>
            <button
              onClick={() => setActiveTab('movements')}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleReceiveStock} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Commodity
              </label>
              <select
                value={receiveForm.commodityId}
                onChange={(e) => setReceiveForm({ ...receiveForm, commodityId: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:border-emerald-500"
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
                <label className="block font-semibold text-slate-700 mb-1">
                  Batch Number
                </label>
                <input
                  type="text"
                  value={receiveForm.batchNumber}
                  onChange={(e) => setReceiveForm({ ...receiveForm, batchNumber: e.target.value })}
                  placeholder="e.g. BATCH-2026-RICE-05"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Warehouse Challan / Ref
                </label>
                <input
                  type="text"
                  value={receiveForm.warehouseRef}
                  onChange={(e) => setReceiveForm({ ...receiveForm, warehouseRef: e.target.value })}
                  placeholder="e.g. FCI-WH-BLR-904"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Received Date
                </label>
                <input
                  type="date"
                  value={receiveForm.receivedDate}
                  onChange={(e) => setReceiveForm({ ...receiveForm, receivedDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Received Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={receiveForm.quantity}
                  onChange={(e) => setReceiveForm({ ...receiveForm, quantity: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 font-sans">
              <button
                type="button"
                onClick={() => setActiveTab('movements')}
                className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30"
              >
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
          className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl max-w-xl mx-auto space-y-5"
        >
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertOctagon size={20} className="text-amber-500" />
              <span>Record Authorized Stock Adjustment</span>
            </h3>
            <button
              onClick={() => setActiveTab('movements')}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleAdjustStock} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Commodity to Adjust
              </label>
              <select
                value={adjustForm.commodityId}
                onChange={(e) => setAdjustForm({ ...adjustForm, commodityId: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:border-amber-400"
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
                <label className="block font-semibold text-slate-700 mb-1">
                  Adjustment Type
                </label>
                <select
                  value={adjustForm.movementType}
                  onChange={(e) => setAdjustForm({ ...adjustForm, movementType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:border-amber-400"
                >
                  <option value="ADJUSTMENT_DAMAGE">Damage (Moisture / Pest)</option>
                  <option value="ADJUSTMENT_CORRECTION">Correction (Scale Calibration)</option>
                  <option value="ADJUSTMENT_TRANSFER">Inter-Shop Stock Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity to Deduct
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={adjustForm.quantity}
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantity: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mandatory Audit Reason & Responsible Officer
              </label>
              <textarea
                rows={3}
                required
                value={adjustForm.reason}
                onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                placeholder="Explain justification for adjustment for inspector verification..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-amber-400 font-sans"
              />
            </div>

            <div className="pt-3 flex justify-end gap-3 font-sans">
              <button
                type="button"
                onClick={() => setActiveTab('movements')}
                className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md shadow-amber-500/30"
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
