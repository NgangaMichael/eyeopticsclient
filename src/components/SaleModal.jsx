import React, { useState, useEffect } from 'react';
import { X, Package, Receipt, BadgeCheck, Save, Layers, AlertCircle } from 'lucide-react';

export default function SaleModal({ isOpen, onClose, initialData, mode, onUpdate, onBulkUpdate }) {
  const [formData, setFormData] = useState({
    etimsReceipt: '',
    etimsAmount: ''
  });

  useEffect(() => {
    if (initialData) {
      // For bulk mode, initialData is an array — pre-fill only if all have the same value
      if (mode === 'bulk' && Array.isArray(initialData)) {
        const allSameReceipt = initialData.every(s => s.etimsReceipt === initialData[0].etimsReceipt);
        const allSameAmount = initialData.every(s => s.etimsAmount === initialData[0].etimsAmount);
        setFormData({
          etimsReceipt: allSameReceipt ? (initialData[0].etimsReceipt || '') : '',
          etimsAmount: allSameAmount ? (initialData[0].etimsAmount || '') : '',
        });
      } else {
        setFormData({
          etimsReceipt: initialData.etimsReceipt || '',
          etimsAmount: initialData.etimsAmount || initialData.total || ''
        });
      }
    }
  }, [initialData, mode]);

  if (!isOpen || !initialData) return null;

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isBulkMode = mode === 'bulk';

  // The list of sales when in bulk mode
  const bulkSales = isBulkMode && Array.isArray(initialData) ? initialData : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isBulkMode) {
      const ids = bulkSales.map(s => s.id);
      onBulkUpdate(ids, formData);
    } else {
      onUpdate(initialData.id, formData);
    }
  };

  // For single sale display in view/edit mode
  const singleSale = !isBulkMode ? initialData : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className={`px-6 py-4 border-b border-slate-100 flex justify-between items-center ${isBulkMode ? 'bg-indigo-600' : 'bg-slate-50/50'}`}>
          <div>
            <h3 className={`text-xl font-bold ${isBulkMode ? 'text-white' : 'text-slate-800'}`}>
              {isBulkMode
                ? `Bulk eTIMS Update`
                : isEditMode
                  ? `Update eTIMS Details`
                  : `Invoice #INV-${singleSale.id.toString().padStart(4, '0')}`
              }
            </h3>
            <p className={`text-xs ${isBulkMode ? 'text-indigo-200' : 'text-slate-500'}`}>
              {isBulkMode
                ? `Applying same eTIMS details to ${bulkSales.length} invoice${bulkSales.length !== 1 ? 's' : ''}`
                : `Customer: ${singleSale.customer?.name || (singleSale.patient ? `${singleSale.patient.firstName} ${singleSale.patient.lastName}` : "Walk-in")}`
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isBulkMode ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-200'}`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">

            {/* --- BULK: Warning / Info Banner --- */}
            {isBulkMode && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800">
                  The eTIMS details below will <span className="font-bold">overwrite</span> any existing eTIMS data on all {bulkSales.length} selected invoices.
                </p>
              </div>
            )}

            {/* --- eTIMS SECTION --- */}
            <div className={`${isBulkMode || isEditMode ? 'bg-indigo-50 border-indigo-100' : 'bg-emerald-50 border-emerald-100'} border rounded-2xl p-4 transition-colors`}>
              <div className={`flex items-center gap-2 font-bold mb-4 text-sm ${isBulkMode || isEditMode ? 'text-indigo-700' : 'text-emerald-700'}`}>
                {isBulkMode ? <Layers size={18} /> : isEditMode ? <Receipt size={18} /> : <BadgeCheck size={18} />}
                <span>eTIMS Fiscal Details</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Receipt Number</p>
                  {isViewMode ? (
                    <p className="font-mono text-sm font-bold text-slate-700 bg-white/50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      {singleSale.etimsReceipt || 'Not Recorded'}
                    </p>
                  ) : (
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                      placeholder="e.g. KRA2024..."
                      value={formData.etimsReceipt}
                      onChange={(e) => setFormData({ ...formData, etimsReceipt: e.target.value })}
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Reported Amount</p>
                  {isViewMode ? (
                    <p className="text-sm font-bold text-slate-700 bg-white/50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      {singleSale.etimsAmount ? `${Number(singleSale.etimsAmount).toLocaleString()} KSH` : 'Not Recorded'}
                    </p>
                  ) : (
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                      placeholder={isBulkMode ? 'Enter amount for all invoices' : ''}
                      value={formData.etimsAmount}
                      onChange={(e) => setFormData({ ...formData, etimsAmount: e.target.value })}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* --- BULK: Selected Invoices Summary --- */}
            {isBulkMode && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                  <Layers size={18} />
                  <span>Selected Invoices</span>
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">{bulkSales.length}</span>
                </div>

                <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0">
                      <tr>
                        <th className="px-4 py-3">Invoice</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3 text-center">eTIMS Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {bulkSales.map(sale => (
                        <tr key={sale.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-mono text-xs font-bold text-indigo-600">
                            #INV-{sale.id.toString().padStart(4, '0')}
                          </td>
                          <td className="px-4 py-2.5 text-slate-700 text-xs">
                            {sale.customer?.name || (sale.patient ? `${sale.patient.firstName} ${sale.patient.lastName}` : 'Walk-in')}
                          </td>
                          <td className="px-4 py-2.5 text-right text-slate-700 font-bold text-xs">
                            {Number(sale.total).toLocaleString()} KSH
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {(sale.etimsReceipt || sale.etimsAmount) ? (
                              <span className="flex items-center justify-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-tighter w-fit mx-auto">
                                <BadgeCheck size={10} />
                                eTIMS
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-tighter">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- SINGLE SALE: Items Table --- */}
            {!isBulkMode && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                  <Package size={18} />
                  <span>Items Purchased</span>
                </div>

                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {singleSale.saleitem?.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-700">{item.stock?.name}</div>
                            <div className="text-[10px] text-slate-400">{item.stock?.code}</div>
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
                          {Number(singleSale.total).toLocaleString()} <span className="text-[10px]">KSH</span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all"
            >
              {isViewMode ? 'Close' : 'Cancel'}
            </button>

            {(isEditMode || isBulkMode) && (
              <button
                type="submit"
                className={`px-6 py-2 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all
                  ${isBulkMode
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                  }`}
              >
                {isBulkMode ? <Layers size={18} /> : <Save size={18} />}
                {isBulkMode ? `Update ${bulkSales.length} Invoices` : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}