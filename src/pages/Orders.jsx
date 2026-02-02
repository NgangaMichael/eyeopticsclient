import React, { useEffect, useState, useRef } from 'react';
import { Plus, Eye, Edit3, Trash2, Package, FileUp, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import OrderModal from '../components/OrderModal';
import { orderService } from "../api/services/orderService";
import { stockService } from "../api/services/stockService"; // Add this import

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', data: null });
  const fileInputRef = useRef(null);
  const [stocks, setStocks] = useState([]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (err) {
      toast.error("Failed to load orders from server");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStocks = async () => {
    try {
      const stockData = await stockService.getAllStocks(); // Changed from getAllStock to getAllStocks
      setStocks(stockData);
    } catch (err) {
      console.error("Failed to load stocks", err);
      toast.error("Failed to load stock items");
    }
  };

  // Single useEffect to load both orders and stocks
  useEffect(() => { 
    loadOrders(); 
    loadStocks();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      if (modalState.mode === 'edit') {
        await orderService.updateOrder(modalState.data.id, formData);
        toast.success("Order updated successfully");
      } else {
        await orderService.createOrder(formData);
        toast.success("Order created successfully");
      }
      closeModal();
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save order.");
    }
  };

  const handleReceiveStock = async (order) => {
    if (order.status === 'received') return;
    
    if (window.confirm(`Add ${order.quantityOrdered} units of ${order.name} to inventory?`)) {
      try {
        await orderService.updateOrder(order.id, { 
          status: 'received',
          receivedDate: new Date().toISOString(),
          quantityReceived: order.quantityOrdered 
        });
        toast.success("Inventory updated and order marked as received!");
        loadOrders();
      } catch (err) {
        toast.error("Failed to update inventory.");
      }
    }
  };

  const handleCsvImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let successCount = 0;
        let errorCount = 0;

        toast.info(`Importing ${results.data.length} orders...`);

        for (const row of results.data) {
          try {
            await orderService.createOrder(row);
            successCount++;
          } catch (err) {
            errorCount++;
          }
        }

        toast.success(`Import complete! ${successCount} added.`);
        if (errorCount > 0) toast.warning(`${errorCount} rows failed to import.`);
        loadOrders();
        fileInputRef.current.value = "";
      }
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This will remove the record permanently.")) {
      try {
        await orderService.deleteOrder(id);
        toast.success("Order deleted");
        loadOrders();
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  const openModal = (mode, data = null) => setModalState({ isOpen: true, mode, data });
  const closeModal = () => setModalState({ ...modalState, isOpen: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Supply Orders</h2>
          <p className="text-slate-500">Manage procurement and incoming lens stock.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleCsvImport} 
            accept=".csv" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-1.5"
          >
            <FileUp size={16} /> Import CSV
          </button>
          <button 
            onClick={() => openModal('add')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus size={16} /> New Order
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Supplier & Lens</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Qty (Rec/Ord)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Landed Cost</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400">No orders found. Click "New Order" to start.</td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{order.supplierName}</div>
                    <div className="text-[10px] font-bold uppercase text-indigo-500">
                      {order.type} <span className="text-slate-300 mx-1">|</span> {order.code}                    
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    <span className={order.quantityReceived >= order.quantityOrdered ? "text-emerald-600" : "text-slate-600"}>
                      {order.quantityReceived || 0}
                    </span>
                    <span className="text-slate-300 mx-1">/</span>
                    {order.quantityOrdered}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    <span className="text-xs text-slate-400 mr-1">KSh</span>
                    {Number(order.landedCost).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm ${
                      order.status === 'received' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => handleReceiveStock(order)}
                        disabled={order.status === 'received'}
                        className={`p-2 rounded-lg transition-all ${
                          order.status === 'received' 
                          ? 'text-slate-200 cursor-not-allowed opacity-50' 
                          : 'text-emerald-500 hover:bg-emerald-50'
                        }`}
                      >
                        <Package size={18} />
                      </button>

                      <button 
                        onClick={() => openModal('view', order)} 
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Eye size={18} />
                      </button>

                      <button 
                        onClick={() => openModal('edit', order)}
                        disabled={order.status === 'received'}
                        className={`p-2 rounded-lg transition-all ${
                          order.status === 'received' 
                          ? 'hidden'
                          : 'text-amber-500 hover:bg-amber-50'
                        }`}
                      >
                        <Edit3 size={18} />
                      </button>

                      <button 
                        onClick={() => handleDelete(order.id)} 
                        disabled={order.status === 'received'}
                        className={`p-2 rounded-lg transition-all ${
                          order.status === 'received' 
                          ? 'text-slate-200 cursor-not-allowed opacity-50' 
                          : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                        }`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <OrderModal 
        isOpen={modalState.isOpen} 
        existingStocks={stocks}
        onClose={closeModal} 
        onSubmit={handleSubmit} 
        initialData={modalState.data}
        mode={modalState.mode}
      />
    </div>
  );
}