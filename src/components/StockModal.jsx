import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const StockModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: '',
    qty: 0,
    priceUsd: 0,
    priceKsh: 0,
    appPrice: 0,
    costUsd: 0,
    costKsh: 0,
    prevCostPb: 0,
    profitPerBale: 0,
    bought: '',
    etr: '',
    fob: 0,
    loading: 0,
    supplier: '',
    notes: '',
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({
      name: '', code: '', type: '', qty: 0,
      priceUsd: 0, priceKsh: 0, appPrice: 0,
      costUsd: 0, costKsh: 0, prevCostPb: 0, profitPerBale: 0,
      bought: '', etr: '', fob: 0, loading: 0,
      supplier: '', notes: ''
    });
  }, [initialData, isOpen]);

  if (!isOpen) return null;
  const isReadOnly = mode === 'view';

  const numberInput = (label, field) => (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{label}</label>
      <input
        type="number"
        disabled={isReadOnly}
        required={!isReadOnly}
        value={formData[field]}
        onChange={e => setFormData({ ...formData, [field]: Number(e.target.value) })}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
      />
    </div>
  );

  const textInput = (label, field) => (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{label}</label>
      <input
        type="text"
        disabled={isReadOnly}
        required={!isReadOnly}
        value={formData[field]}
        onChange={e => setFormData({ ...formData, [field]: e.target.value })}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800">
            {mode === 'edit' ? 'Update Item' : mode === 'view' ? 'View Item' : 'Add New Item'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20}/>
          </button>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}
          className="p-6 space-y-5 max-h-[75vh] overflow-y-auto"
        >
          <div className="grid grid-cols-2 gap-4">

            {textInput('Name', 'name')}
            {textInput('Code', 'code')}
            {textInput('Type', 'type')}
            {numberInput('Quantity', 'qty')}
            {/* {numberInput('Price (USD)', 'priceUsd')} */}
            {numberInput('Price (KSh)', 'priceKsh')}
            {numberInput('App Price', 'appPrice')}
            {numberInput('Cost (USD)', 'costUsd')}
            {numberInput('Cost (KSh)', 'costKsh')}
            {numberInput('Prev Cost per Bale', 'prevCostPb')}
            {numberInput('Profit per Bale', 'profitPerBale')}
            {textInput('Bought', 'bought')}
            {/* {textInput('ETR', 'etr')} */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                ETR
              </label>
              <input
                type="date"
                disabled={isReadOnly}
                required={!isReadOnly}
                value={formData.etr}
                onChange={e => setFormData({ ...formData, etr: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            {numberInput('FOB', 'fob')}
            {numberInput('Loading', 'loading')}
            {textInput('Supplier', 'supplier')}

            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notes</label>
              <textarea
                disabled={isReadOnly}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
          </div>

          {!isReadOnly && (
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {mode === 'edit' ? 'Update Item' : 'Add to Stock'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default StockModal;