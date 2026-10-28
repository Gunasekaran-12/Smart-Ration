import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle,
  AlertCircle,
  Clock,
  CheckCircle2,
  X,
  Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { complaintApi } from '../services';
import type { Complaint, ComplaintCategory, ComplaintStatus } from '../types';
import PageContainer from '../components/PageContainer';
import StatusBadge from '../components/StatusBadge';

export const ComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // New Complaint Form
  const [newForm, setNewForm] = useState({
    category: 'WEIGHMENT_ISSUE' as ComplaintCategory,
    subject: '',
    description: '',
  });

  // Resolve Form
  const [resolveStatus, setResolveStatus] = useState<ComplaintStatus>('RESOLVED');
  const [resolutionRemarks, setResolutionRemarks] = useState('');

  useEffect(() => {
    loadComplaints();
  }, [user]);

  const loadComplaints = async () => {
    try {
      if (user?.role === 'BENEFICIARY') {
        const data = await complaintApi.getMyComplaints();
        setComplaints(data);
      } else {
        const res = await complaintApi.getShopComplaints(user?.shopId);
        setComplaints(res.content || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await complaintApi.createComplaint({
        category: newForm.category,
        subject: newForm.subject,
        description: newForm.description,
        shopId: user?.shopId,
      });
      setIsSubmitOpen(false);
      setNewForm({ category: 'WEIGHMENT_ISSUE', subject: '', description: '' });
      loadComplaints();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit grievance');
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await complaintApi.updateStatus(selectedComplaint.id, resolveStatus, resolutionRemarks);
      setIsResolveOpen(false);
      setSelectedComplaint(null);
      setResolutionRemarks('');
      loadComplaints();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update grievance status');
    }
  };

  return (
    <PageContainer
      title="Beneficiary Grievance & Complaint Redressal"
      subtitle="Submit service grievances, track resolution timelines, and maintain administrative accountability"
      actions={
        user?.role === 'BENEFICIARY' ? (
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle size={16} />
            File New Grievance
          </button>
        ) : undefined
      }
    >
      {/* Grievance Timeline Cards */}
      <div className="space-y-4">
        {complaints.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs font-mono shadow-sm">
            No complaints currently recorded in system
          </div>
        ) : (
          complaints.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 text-slate-900"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-700">
                    {c.complaintNumber}
                  </span>
                  <StatusBadge status={c.category} />
                  <StatusBadge status={c.status} />
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                  <Clock size={13} className="text-slate-400" />
                  <span>Filed: {new Date(c.createdAt).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {c.subject}
                </h4>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed font-sans">
                  {c.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 gap-2 font-mono">
                <span>
                  Beneficiary: <strong className="text-slate-800 font-sans">{c.beneficiaryName}</strong> &bull; Card: {c.cardNumber} &bull; Shop: {c.shopName}
                </span>

                {user?.role !== 'BENEFICIARY' && (
                  <button
                    onClick={() => {
                      setSelectedComplaint(c);
                      setResolveStatus(c.status);
                      setResolutionRemarks(c.resolutionRemarks || '');
                      setIsResolveOpen(true);
                    }}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 hover:text-slate-900 border border-slate-200 font-bold self-start sm:self-auto transition-colors"
                  >
                    Update Redressal Status
                  </button>
                )}
              </div>

              {c.resolutionRemarks && (
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5 font-mono">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    Official Redressal Resolution
                  </span>
                  <p className="text-slate-700 font-sans">{c.resolutionRemarks}</p>
                  {c.resolvedBy && (
                    <span className="block text-[10px] text-slate-500 font-mono">
                      Resolved by: {c.resolvedBy} on {new Date(c.resolvedAt || '').toLocaleDateString('en-IN')}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* File Complaint Modal */}
      <AnimatePresence>
        {isSubmitOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs text-slate-900"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertCircle size={18} className="text-amber-500" />
                  <span>Submit Fair Price Grievance</span>
                </h3>
                <button onClick={() => setIsSubmitOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Grievance Category</label>
                  <select
                    value={newForm.category}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value as ComplaintCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:border-emerald-500 font-mono"
                  >
                    <option value="WEIGHMENT_ISSUE">Electronic Scale Calibration / Weighment Issue</option>
                    <option value="STOCK_UNAVAILABLE">Stock Unavailable at Fair Price Shop</option>
                    <option value="OVERCHARGING">Overcharging Above Subsidized Tariff</option>
                    <option value="OPERATOR_BEHAVIOR">Operator Conduct / Behavior</option>
                    <option value="CARD_UPDATE">Family Member / Card Update Request</option>
                    <option value="OTHER">Other Query</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Subject</label>
                  <input
                    type="text"
                    required
                    value={newForm.subject}
                    onChange={(e) => setNewForm({ ...newForm, subject: e.target.value })}
                    placeholder="Brief description of grievance"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Detailed Explanation</label>
                  <textarea
                    rows={4}
                    required
                    value={newForm.description}
                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                    placeholder="Provide specific details, visit dates, and context..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:border-emerald-500 font-sans"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => setIsSubmitOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                  >
                    <Send size={14} />
                    Submit Grievance
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Resolve / Update Status Modal */}
      <AnimatePresence>
        {isResolveOpen && selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs text-slate-900"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Update Redressal: {selectedComplaint.complaintNumber}
                </h3>
                <button onClick={() => setIsResolveOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleResolveSubmit} className="space-y-4 font-mono">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Status</label>
                  <select
                    value={resolveStatus}
                    onChange={(e) => setResolveStatus(e.target.value as ComplaintStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:border-emerald-500"
                  >
                    <option value="IN_REVIEW">IN_REVIEW (Under Administrative Inspection)</option>
                    <option value="RESOLVED">RESOLVED (Action Taken & Verified)</option>
                    <option value="REJECTED">REJECTED (Invalid or Ineligible)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Resolution Remarks / Action Taken</label>
                  <textarea
                    rows={4}
                    required
                    value={resolutionRemarks}
                    onChange={(e) => setResolutionRemarks(e.target.value)}
                    placeholder="Document investigation outcome and remedial measures enacted..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:border-emerald-500 font-sans"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => setIsResolveOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30"
                  >
                    Confirm Status Update
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

export default ComplaintsPage;
