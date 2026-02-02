import React from 'react';
import { X, Package } from 'lucide-react';

export default function SaleModal({ isOpen, onClose, initialData, mode }) {
  if (!isOpen || !initialData) return null;

  const isViewMode = mode === 'view';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {isViewMode ? `Invoice #INV-${initialData.id.toString().padStart(4, '0')}` : 'New Sale'}
            </h3>
            <p className="text-xs text-slate-500">
              {isViewMode ? `Customer: ${initialData.customer?.name || 'Walk-in'}` : 'Create a new transaction'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isViewMode && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2">
                <Package size={18} />
                <span>Items Purchased</span>
              </div>
              
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {initialData.saleitem?.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-700">
                          {item.stock?.name} 
                          <span className="block text-[10px] text-slate-400">{item.stock?.code}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{Number(item.price).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">
                          {(item.quantity * item.price).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50/80 font-bold">
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-right text-slate-500">Grand Total</td>
                      <td className="px-4 py-3 text-right text-indigo-600 text-lg">
                        {Number(initialData.total).toLocaleString()} <span className="text-[10px]">KSH</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}