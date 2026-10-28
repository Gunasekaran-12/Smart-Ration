import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';
import type { Receipt } from '../types';

interface ReceiptModalProps {
  receipt: Receipt | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white border border-slate-200 text-slate-900 rounded-3xl shadow-2xl max-w-xl w-full p-6 md:p-8 my-8 print:shadow-none print:border-none print:m-0 print:p-0 print:bg-white print:text-black"
        >
          {/* Close button - hidden when printing */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors print:hidden"
          >
            <X size={20} />
          </button>

          {/* Printable Voucher Section */}
          <div id="printable-receipt" className="space-y-6">
            {/* Header */}
            <div className="text-center border-b border-slate-200 pb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mb-3 print:hidden">
                <CheckCircle size={28} />
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-wide uppercase text-slate-900 print:text-black">
                Public Distribution System
              </h2>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest mt-0.5 font-mono">
                Official Fair Price Distribution Receipt
              </p>
              <div className="mt-3 text-xs text-slate-600 space-y-0.5">
                <p className="font-bold text-slate-900">{receipt.shopName} ({receipt.shopNumber})</p>
                <p>{receipt.shopAddress}</p>
                {receipt.shopContact && <p className="font-mono">Helpline: {receipt.shopContact}</p>}
              </div>
            </div>

            {/* Reference Badge */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs gap-2">
              <div>
                <span className="text-slate-500 block font-bold font-mono text-[10px]">TRANSACTION REFERENCE</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {receipt.transactionReference}
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-slate-500 block font-bold font-mono text-[10px]">DATE & TIMESTAMP</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {new Date(receipt.distributionDate).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Beneficiary Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200 font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">Ration Card No.</span>
                <span className="font-bold text-slate-900">{receipt.cardNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Head of Household</span>
                <span className="font-bold text-slate-900">{receipt.headOfFamily}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Category</span>
                <span className="font-bold text-emerald-700">{receipt.cardCategory}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Family Members</span>
                <span className="font-semibold text-slate-800">{receipt.familyMembers} Persons</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold font-mono text-[11px]">
                    <th className="py-2">Commodity</th>
                    <th className="py-2 text-right">Quantity</th>
                    <th className="py-2 text-right">Rate (₹)</th>
                    <th className="py-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {receipt.items.map((item, idx) => (
                    <tr key={idx} className="font-medium text-slate-800">
                      <td className="py-2.5">
                        <span className="font-bold text-slate-900">{item.commodityName}</span>
                        {item.batchNumber && (
                          <span className="block text-[10px] text-slate-400">
                            Batch: {item.batchNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right font-semibold">
                        {item.quantity} {item.measurementUnit}
                      </td>
                      <td className="py-2.5 text-right text-slate-500">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-bold text-slate-900">
                        ₹{item.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 font-extrabold text-sm text-slate-900">
                    <td colSpan={3} className="py-3 text-right font-mono">Total Subsidized Payable:</td>
                    <td className="py-3 text-right text-emerald-700 font-black font-mono">
                      ₹{receipt.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Verification Footer */}
            <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-2 font-mono">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Digitally Authenticated by: <strong className="text-slate-800">{receipt.operatorName}</strong></span>
              </div>
              <p className="italic text-[10px]">Government Authorized Fair Price Distribution</p>
            </div>
          </div>

          {/* Action buttons - hidden when printing */}
          <div className="mt-8 flex items-center justify-end gap-3 print:hidden">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Printer size={16} />
              Print Receipt
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReceiptModal;
