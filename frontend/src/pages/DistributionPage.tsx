import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  AlertCircle,
  CreditCard,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { rationCardApi, distributionApi } from '../services';
import type { RationCard, CardEntitlement, Receipt } from '../types';
import PageContainer from '../components/PageContainer';
import ReceiptModal from '../components/ReceiptModal';
import StatusBadge from '../components/StatusBadge';

export const DistributionPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('RC-KA-01-987654');
  const [card, setCard] = useState<RationCard | null>(null);
  const [entitlements, setEntitlements] = useState<CardEntitlement[]>([]);
  const [quantities, setQuantities] = useState<{ [commodityId: number]: number }>({});
  const [receiptNotes, setReceiptNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    setCard(null);
    setEntitlements([]);
    setQuantities({});

    try {
      const foundCard = await rationCardApi.getCardByNumber(searchQuery.trim().toUpperCase());
      setCard(foundCard);

      const ents = await rationCardApi.getCardEntitlements(foundCard.id);
      setEntitlements(ents);

      // Pre-fill quantities with max eligible remaining quota (clamped to available stock)
      const initialQtys: { [key: number]: number } = {};
      ents.forEach((e) => {
        if (e.isEligibleForDistribution) {
          const maxPossible = Math.min(Number(e.remainingQuantity), Number(e.availableShopStock));
          initialQtys[e.commodityId] = maxPossible > 0 ? maxPossible : 0;
        } else {
          initialQtys[e.commodityId] = 0;
        }
      });
      setQuantities(initialQtys);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        `Ration card "${searchQuery}" was not found or is not accessible at this shop.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (commodityId: number, val: number, maxAllowed: number) => {
    const clamped = Math.max(0, Math.min(val, maxAllowed));
    setQuantities((prev) => ({ ...prev, [commodityId]: clamped }));
  };

  const calculateTotal = () => {
    let sum = 0;
    entitlements.forEach((e) => {
      const qty = quantities[e.commodityId] || 0;
      sum += qty * Number(e.unitPrice);
    });
    return sum;
  };

  const handleDistribute = async () => {
    if (!card) return;
    const items = Object.entries(quantities)
      .map(([commodityId, quantity]) => ({
        commodityId: Number(commodityId),
        quantity,
      }))
      .filter((i) => i.quantity > 0);

    if (items.length === 0) {
      setError('Please specify at least one commodity quantity to issue.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const dist = await distributionApi.processDistribution({
        rationCardId: card.id,
        shopId: user?.shopId || card.shopId,
        receiptNotes: receiptNotes || undefined,
        idempotencyKey: `POS-${card.cardNumber}-${Date.now()}`,
        items,
      });

      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#10b981', '#f59e0b', '#34d399'],
      });

      // Load receipt
      const receiptData = await distributionApi.getReceipt(dist.transactionReference);
      setSuccessReceipt(receiptData);

      // Refresh remaining entitlements
      const updatedEnts = await rationCardApi.getCardEntitlements(card.id);
      setEntitlements(updatedEnts);
      const resetQtys: { [key: number]: number } = {};
      updatedEnts.forEach((e) => {
        resetQtys[e.commodityId] = 0;
      });
      setQuantities(resetQtys);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Transaction failed. Please verify stock balances.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="Point-of-Sale (POS) Distribution Counter"
      subtitle="Search cardholders, verify remaining monthly quotas against physical shop stock, and issue digitally signed receipts"
    >
      {/* Search Bar & Quick Fill */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter Ration Card Number (e.g. RC-KA-01-987654)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-mono text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? <span className="animate-spin font-mono">⌛</span> : <Search size={16} />}
            Verify Card
          </button>
        </div>

        {/* Quick Demo Card Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-semibold font-mono text-[11px]">Quick Fictional Cards:</span>
          {['RC-KA-01-987654', 'RC-KA-01-987655', 'RC-KA-01-987656', 'RC-KA-01-987657'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => {
                setSearchQuery(num);
                setTimeout(handleSearch, 50);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 font-mono text-[11px] text-slate-700 transition-colors"
            >
              {num}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Error message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
          <AlertCircle size={18} className="flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Verified Card Information Card */}
      {card && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold shadow-sm">
                <CreditCard size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">
                    {card.headOfFamily}
                  </h3>
                  <StatusBadge status={card.cardCategory} />
                  <StatusBadge status={card.isActive ? 'ACTIVE' : 'INACTIVE'} />
                </div>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  Card No: <strong className="text-slate-900">{card.cardNumber}</strong> &bull; Assigned Shop: {card.shopName} ({card.shopNumber})
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[11px] text-slate-400 block font-mono">Family Members</span>
              <span className="text-sm font-bold text-slate-900 flex items-center gap-1 font-mono">
                <Users size={14} className="text-emerald-600" />
                {card.familyMemberCount} Persons Enrolled
              </span>
            </div>
          </div>

          {/* Entitlements & Distribution Entry Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 font-mono text-[11px]">
                  <th className="py-3 px-4">Commodity</th>
                  <th className="py-3 px-4 text-right">Subsidized Rate</th>
                  <th className="py-3 px-4 text-right">Monthly Quota</th>
                  <th className="py-3 px-4 text-right">Already Issued</th>
                  <th className="py-3 px-4 text-right">Remaining Quota</th>
                  <th className="py-3 px-4 text-right">Shop Stock</th>
                  <th className="py-3 px-4 text-right w-44">Issue Quantity</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {entitlements.map((e) => {
                  const maxAllowed = Math.min(Number(e.remainingQuantity), Number(e.availableShopStock));
                  const qty = quantities[e.commodityId] || 0;
                  const itemTotal = qty * Number(e.unitPrice);

                  return (
                    <tr key={e.commodityId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {e.commodityName}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {e.commodityCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        ₹{Number(e.unitPrice).toFixed(2)} / {e.measurementUnit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                        {Number(e.totalEntitledQuantity).toFixed(1)} {e.measurementUnit}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400">
                        {Number(e.distributedQuantity).toFixed(1)} {e.measurementUnit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                        {Number(e.remainingQuantity).toFixed(1)} {e.measurementUnit}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-semibold ${
                            Number(e.availableShopStock) <= 0
                              ? 'text-rose-600 font-bold'
                              : 'text-slate-800'
                          }`}
                        >
                          {Number(e.availableShopStock).toFixed(1)} {e.measurementUnit}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            min="0"
                            max={maxAllowed}
                            step="0.5"
                            value={qty}
                            disabled={maxAllowed <= 0}
                            onChange={(ev) =>
                              handleQuantityChange(e.commodityId, parseFloat(ev.target.value) || 0, maxAllowed)
                            }
                            className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-right font-bold text-slate-900 focus:outline-none focus:border-emerald-500 disabled:opacity-40"
                          />
                          <span className="text-[11px] text-slate-400 font-medium">
                            {e.measurementUnit}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        ₹{itemTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                  <td colSpan={7} className="py-3.5 px-4 text-right text-slate-700 font-mono">
                    Grand Total Subsidized Payable:
                  </td>
                  <td className="py-3.5 px-4 text-right text-base text-emerald-700 font-black font-mono">
                    ₹{calculateTotal().toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes and Authorization Confirmation */}
          <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-1/2">
              <input
                type="text"
                value={receiptNotes}
                onChange={(e) => setReceiptNotes(e.target.value)}
                placeholder="Optional receipt notes (e.g., Authorized representative collection)..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDistribute}
              disabled={isSubmitting || calculateTotal() <= 0}
              className="w-full md:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing Transaction...
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Authorize & Complete Distribution (₹{calculateTotal().toFixed(2)})
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal receipt={successReceipt} onClose={() => setSuccessReceipt(null)} />
    </PageContainer>
  );
};

export default DistributionPage;
