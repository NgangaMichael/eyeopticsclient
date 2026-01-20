import React, { useEffect, useState } from 'react';
import { Plus, Eye, Edit3, Trash2, Package } from 'lucide-react';
import OrderModal from '../components/OrderModal';
import { orderService } from "../api/services/orderService";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', data: null });

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (modalState.mode === 'edit') {
        await orderService.updateOrder(modalState.data.id, formData);
      } else {
        await orderService.createOrder(formData);
      }
      closeModal();
      loadOrders();
    } catch (err) {
      alert("Could not save order. Check connection.");
    }
  };

  const openModal = (mode, data = null) => setModalState({ isOpen: true, mode, data });
  const closeModal = () => setModalState({ ...modalState, isOpen: false });

  const handleDelete = async (id) => {
    if (window.confirm("Delete this order?")) {
      try {
        await orderService.deleteOrder(id);
        loadOrders();
      } catch (err) { console.error("Delete failed", err); }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Orders</h2>
          <p className="text-slate-500">Track lens supply and inventory restocks.</p>
        </div>
        <button 
          onClick={() => openModal('add')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-1.5"
        >
          <Plus size={16} /> Add Order
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier & Lens</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Landed Cost</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{order.supplierName}</div>
                  <div className="text-[10px] font-bold uppercase text-indigo-500">{order.lensType} - {order.material}</div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-600">
                  {order.quantityReceived} / {order.quantityOrdered}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">
                  <span className="text-xs text-slate-400 mr-1">KSh</span>
                  {Number(order.landedCost).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    order.status === 'received' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openModal('view', order)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Eye size={18} /></button>
                    <button onClick={() => openModal('edit', order)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"><Edit3 size={18} /></button>
                    <button onClick={() => handleDelete(order.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OrderModal 
        isOpen={modalState.isOpen} 
        onClose={closeModal} 
        onSubmit={handleSubmit} 
        initialData={modalState.data}
        mode={modalState.mode}
      />
    </div>
  );
}