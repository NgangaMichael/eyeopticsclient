import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Plus, Trash2 } from 'lucide-react';

const SaleModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const [formData, setFormData] = useState({ customerId: '', items: [] });
  
  // Example helper to add an empty item row
  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { stockId: '', quantity: 1, price: 0 }]
    });
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-height-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="text-indigo-600" /> New Transaction</h3>
          <button onClick={onClose}><X /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Customer ID</label>
            <input 
              required
              className="w-full px-4 py-2 border rounded-xl"
              placeholder="Enter Customer ID"
              value={formData.customerId}
              onChange={e => setFormData({...formData, customerId: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase text-slate-500">Items (Frames/Lenses)</label>
              <button type="button" onClick={addItemRow} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg font-bold flex items-center gap-1">
                <Plus size={14}/> Add Item
              </button>
            </div>
            
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-2 items-end bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Stock ID</label>
                  <input required className="w-full px-2 py-1 border rounded-lg" value={item.stockId} onChange={e => updateItem(index, 'stockId', e.target.value)} />
                </div>
                <div className="w-20">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Qty</label>
                  <input type="number" required className="w-full px-2 py-1 border rounded-lg" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} />
                </div>
                <div className="w-32">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Price (KSh)</label>
                  <input type="number" required className="w-full px-2 py-1 border rounded-lg" value={item.price} onChange={e => updateItem(index, 'price', e.target.value)} />
                </div>
                <button type="button" onClick={() => removeItemRow(index)} className="p-2 text-rose-500"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between text-lg font-bold text-slate-900">
              <span>Total Amount:</span>
              <span>KSh {formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
            </div>
            <button type="submit" className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
              Complete Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleModal;