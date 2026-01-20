import React, { useEffect, useState } from 'react';
import { Plus, Eye, Edit3, Trash2, Box } from 'lucide-react';
import StockModal from '../components/StockModal';
import { stockService } from "../api/services/stockService";

export default function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', data: null });

  useEffect(() => { loadStocks(); }, []);

  const loadStocks = async () => {
    try {
      const data = await stockService.getAllStocks();
      setStocks(data);
    } catch (err) {
      console.error("Failed to load inventory data");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (modalState.mode === 'edit') {
        await stockService.updateStock(modalState.data.id, formData);
      } else {
        await stockService.createStock(formData);
      }
      closeModal();
      loadStocks();
    } catch (err) {
      alert("Could not save item. Check server connection.");
    }
  };

  const openModal = (mode, data = null) => setModalState({ isOpen: true, mode, data });
  const closeModal = () => setModalState({ ...modalState, isOpen: false });

  const handleDelete = async (id) => {
    if (window.confirm("Delete this item from inventory permanently?")) {
      try {
        await stockService.deleteStock(id);
        loadStocks();
      } catch (err) { console.error("Delete failed", err); }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Inventory</h2>
          <p className="text-slate-500">Manage your frames, lenses, and stock levels.</p>
        </div>
        <button 
          onClick={() => openModal('add')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-1.5"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Item Details</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type / Material</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {stocks.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{item.brand}</div>
                  <div className="text-[10px] font-bold uppercase text-indigo-500">{item.itemType} {item.model ? `- ${item.model}` : ''}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-600">{item.type}</div>
                  <div className="text-xs text-slate-400">{item.material}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.quantity < 5 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                    {item.quantity} units
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-slate-400 mr-1">KSh</span>
                  <span className="font-extrabold text-slate-700">{Number(item.price).toLocaleString()}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openModal('view', item)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Eye size={18} /></button>
                    <button onClick={() => openModal('edit', item)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"><Edit3 size={18} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <StockModal 
        isOpen={modalState.isOpen} 
        onClose={closeModal} 
        onSubmit={handleSubmit} 
        initialData={modalState.data}
        mode={modalState.mode}
      />
    </div>
  );
}