import React, { useEffect, useState } from 'react';
import { Plus, Eye, Trash2, ReceiptText } from 'lucide-react';
import SaleModal from '../components/SaleModal';
import { saleService } from "../api/services/saleService";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', data: null });

  useEffect(() => { loadSales(); }, []);

  const loadSales = async () => {
    try {
      const data = await saleService.getAllSales();
      setSales(data);
    } catch (err) {
      console.error("Failed to load sales data");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      // Sales are typically not "edited" in a retail flow; they are created or deleted/refunded
      await saleService.createSale(formData);
      closeModal();
      loadSales();
    } catch (err) {
      alert("Could not process sale. Check inventory levels.");
    }
  };

  const openModal = (mode, data = null) => setModalState({ isOpen: true, mode, data });
  const closeModal = () => setModalState({ ...modalState, isOpen: false });

  const handleDelete = async (id) => {
    if (window.confirm("Void this sale? This will not automatically revert stock unless handled by backend.")) {
      try {
        await saleService.deleteSale(id);
        loadSales();
      } catch (err) { console.error("Delete failed", err); }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sales & Invoices</h2>
          <p className="text-slate-500">View transaction history and generate new receipts.</p>
        </div>
        <button 
          onClick={() => openModal('add')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-1.5"
        >
          <Plus size={16} /> New Sale
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Receipt ID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Customer</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Total Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">
                  #INV-{sale.id.toString().padStart(4, '0')}
                </td>
                <td className="px-6 py-4 font-bold text-slate-800">
                  {sale.customer?.name || `Customer #${sale.customerId}`}
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-slate-400 mr-1">KSh</span>
                  <span className="font-extrabold text-slate-700">{Number(sale.total).toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(sale.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openModal('view', sale)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Eye size={18} /></button>
                    <button onClick={() => handleDelete(sale.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SaleModal 
        isOpen={modalState.isOpen} 
        onClose={closeModal} 
        onSubmit={handleSubmit} 
        initialData={modalState.data}
        mode={modalState.mode}
      />
    </div>
  );
}