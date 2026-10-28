import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit2,
  HelpCircle,
  Calculator,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { entitlementApi } from '../services';
import type { EntitlementRule, CardCategory, CalculationType } from '../types';
import PageContainer from '../components/PageContainer';
import StatusBadge from '../components/StatusBadge';

export const EntitlementsPage: React.FC = () => {
  const { user } = useAuth();
  const [rules, setRules] = useState<EntitlementRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<EntitlementRule | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Edit form
  const [ruleForm, setRuleForm] = useState({
    cardCategory: 'BPL' as CardCategory,
    commodityId: 1,
    calculationType: 'PER_MEMBER' as CalculationType,
    baseQuantity: 3.0,
    maxQuantity: 25.0,
    pricePerUnit: 3.0,
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const data = await entitlementApi.getRules();
      setRules(data);
    } catch (e) {
      console.error(e);
    }
  };

  const openEditModal = (r: EntitlementRule) => {
    setSelectedRule(r);
    setRuleForm({
      cardCategory: r.cardCategory,
      commodityId: r.commodity.id,
      calculationType: r.calculationType,
      baseQuantity: Number(r.baseQuantity),
      maxQuantity: r.maxQuantity ? Number(r.maxQuantity) : 30,
      pricePerUnit: Number(r.pricePerUnit),
    });
    setIsEditOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await entitlementApi.saveRule({
        cardCategory: ruleForm.cardCategory,
        commodityId: ruleForm.commodityId,
        calculationType: ruleForm.calculationType,
        baseQuantity: ruleForm.baseQuantity,
        maxQuantity: ruleForm.maxQuantity,
        pricePerUnit: ruleForm.pricePerUnit,
      });
      setIsEditOpen(false);
      loadRules();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update entitlement rule');
    }
  };

  return (
    <PageContainer
      title="Configurable Monthly Entitlement Engine"
      subtitle="Define statutory grain quotas, per-member scaling formulas, and subsidized tariffs across poverty thresholds"
    >
      {/* Policy Explanation Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-emerald-50/80 border border-emerald-200/90 p-5 shadow-sm space-y-2 text-xs"
      >
        <div className="flex items-center gap-2 text-emerald-900 font-bold tracking-wide">
          <HelpCircle size={17} className="text-emerald-700" />
          <span>Statutory National Food Security Allocation Rules</span>
          <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[10px] text-emerald-800 font-semibold border border-emerald-300">
            <ShieldCheck size={12} />
            NFSA Regulated
          </span>
        </div>
        <p className="text-slate-700 leading-relaxed max-w-4xl">
          <strong className="text-emerald-800 font-bold">AAY (Antyodaya Anna Yojana):</strong> Fixed statutory allocation of 35 kg grain per household (25kg Rice + 10kg Wheat) irrespective of family member count at maximum state subsidies.
          <br />
          <strong className="text-slate-800 font-bold">BPL / Priority Households (PHH):</strong> Scaled dynamically at 3kg Rice + 2kg Wheat per enrolled family member with statutory household caps to prevent diversion.
        </p>
      </motion.div>

      {/* Rules Table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calculator size={18} className="text-emerald-600" />
              <span>Active Entitlement Rules Matrix</span>
              <Sparkles size={14} className="text-amber-500" />
            </h3>
            <p className="text-xs text-slate-500">
              Validated automatically during every distribution counter transaction
            </p>
          </div>
          <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-mono font-bold">
            {rules.length} Rules Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 font-mono text-[11px]">
                <th className="py-3.5 px-4">Card Category</th>
                <th className="py-3.5 px-4">Commodity</th>
                <th className="py-3.5 px-4">Calculation Mode</th>
                <th className="py-3.5 px-4 text-right">Base Allowance</th>
                <th className="py-3.5 px-4 text-right">Max Cap</th>
                <th className="py-3.5 px-4 text-right">Subsidized Tariff</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                {user?.role === 'SUPER_ADMIN' && <th className="py-3.5 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <StatusBadge status={r.cardCategory} />
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 font-sans">
                    {r.commodity.name}
                    <span className="block text-[10px] text-slate-400 font-mono">
                      Unit: {r.commodity.measurementUnit}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700 font-sans">
                    {r.calculationType === 'FIXED_PER_CARD' ? 'Fixed per Household' : 'Per Enrolled Member'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {r.baseQuantity} {r.commodity.measurementUnit}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500">
                    {r.maxQuantity ? `${r.maxQuantity} ${r.commodity.measurementUnit}` : 'No Cap'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-emerald-700">
                    ₹{Number(r.pricePerUnit).toFixed(2)} / {r.commodity.measurementUnit}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </td>
                  {user?.role === 'SUPER_ADMIN' && (
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(r)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                        title="Edit Rule"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Edit Rule Modal */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs text-slate-900"
            >
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Configure Entitlement Rule</span>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-mono">
                  {ruleForm.cardCategory} - {selectedRule?.commodity.name}
                </span>
              </h3>

              <form onSubmit={handleSaveRule} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Calculation Type</label>
                  <select
                    value={ruleForm.calculationType}
                    onChange={(e) =>
                      setRuleForm({ ...ruleForm, calculationType: e.target.value as CalculationType })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="FIXED_PER_CARD">Fixed per Household</option>
                    <option value="PER_MEMBER">Per Enrolled Member</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">Base Quantity</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={ruleForm.baseQuantity}
                      onChange={(e) =>
                        setRuleForm({ ...ruleForm, baseQuantity: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">Max Cap Quantity</label>
                    <input
                      type="number"
                      step="0.5"
                      value={ruleForm.maxQuantity}
                      onChange={(e) =>
                        setRuleForm({ ...ruleForm, maxQuantity: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Subsidized Tariff (INR per unit)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={ruleForm.pricePerUnit}
                    onChange={(e) =>
                      setRuleForm({ ...ruleForm, pricePerUnit: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-extrabold text-emerald-700 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30 transition-all"
                  >
                    Save Rule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default EntitlementsPage;
