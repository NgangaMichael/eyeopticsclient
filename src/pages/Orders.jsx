import React, { useEffect, useState, useRef, useMemo } from 'react'; // Added useMemo
import { Plus, Eye, Edit3, Trash2, Package, FileUp, Search, Calendar, Filter, Tag } from 'lucide-react'; // Added icons
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import OrderModal from '../components/OrderModal';
import { orderService } from "../api/services/orderService";
import { stockService } from "../api/services/stockService";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', data: null });
  const fileInputRef = useRef(null);
  const [stocks, setStocks] = useState([]);

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

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
      const stockData = await stockService.getAllStocks();
      setStocks(stockData);
    } catch (err) {
      console.error("Failed to load stocks", err);
    }
  };

  useEffect(() => { 
    loadOrders(); 
    loadStocks();
  }, []);

  // --- Filter Logic ---
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search by Supplier or Code
      const matchesSearch = 
        order.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.code?.toLowerCase().includes(searchTerm.toLowerCase());

      // Date Range (using createdAt)
      const createdAt = new Date(order.createdAt).getTime();
      const fromOk = dateFrom ? createdAt >= new Date(dateFrom).getTime() : true;
      const toOk = dateTo ? createdAt <= new Date(dateTo).setHours(23, 59, 59, 999) : true;

      // Status Filter
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      // Type Filter
      const matchesType = typeFilter === 'all' || order.type?.toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && fromOk && toOk && matchesStatus && matchesType;
    });
  }, [orders, searchTerm, dateFrom, dateTo, statusFilter, typeFilter]);

  // ... (Keep handleSubmit, handleReceiveStock, handleCsvImport, handleDelete, etc. same as before)
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
        toast.success("Inventory updated!");
        loadOrders();
      } catch (err) {
        toast.error("Failed to update inventory.");
      }
    }
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Supply Orders</h2>
          <p className="text-slate-500">Manage procurement and incoming lens stock.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} onChange={(e) => {/* your CSV logic */}} accept=".csv" className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-1.5">
            <FileUp size={16} /> Import CSV
          </button>
          <button onClick={() => openModal('add')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-1.5">
            <Plus size={16} /> New Order
          </button>
        </div>
      </div>

      {/* Filter Bar (Matching Patients Design) */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm items-center">
        {/* Search */}
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Supplier or code..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Date From */}
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="date"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase">From</span>
        </div>

        {/* Date To */}
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="date"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase">To</span>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none transition-all"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="received">Received</option>
          </select>
          <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase">Status</span>
        </div>

        {/* Type Filter */}
        <div className="relative">
          <Tag className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none transition-all"
          >
            <option value="all">All Types</option>
            <option value="lens">Lens</option>
            <option value="frame">Frame</option>
          </select>
          <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase">Type</span>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            setSearchTerm('');
            setDateFrom('');
            setDateTo('');
            setStatusFilter('all');
            setTypeFilter('all');
          }}
          className="text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-tight text-center"
        >
          Reset
        </button>
      </div>

      {/* Table Section */}
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
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400">No orders found matching your criteria.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{order.supplierName}</div>
                      <div className="text-[10px] font-bold uppercase text-indigo-500">
                        {order.type} <span className="text-slate-300 mx-1">|</span> {order.code} 
                        {/* In Orders.js Table Body */}
                          {order.type?.toLowerCase() === 'lens' && (
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded text-[9px] font-bold">
                                {order.lensCategory}
                              </span>
                              <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-bold border border-indigo-100">
                                <span>S: {order.sph}</span>
                                <span className="text-indigo-200">|</span>
                                <span>C: {order.cyl}</span>
                                {order.axis && (
                                  <>
                                    <span className="text-indigo-200">|</span>
                                    <span>A: {order.axis}°</span>
                                  </>
                                )}
                                {order.nearAdd && (
                                  <>
                                    <span className="text-indigo-200">|</span>
                                    <span>Add: {order.nearAdd}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}                
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
                        order.status === 'received' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleReceiveStock(order)} disabled={order.status === 'received'} className={`p-2 rounded-lg transition-all ${order.status === 'received' ? 'text-slate-200 opacity-50' : 'text-emerald-500 hover:bg-emerald-50'}`}><Package size={18} /></button>
                        <button onClick={() => openModal('view', order)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Eye size={18} /></button>
                        <button onClick={() => handleDelete(order.id)} disabled={order.status === 'received'} className={`p-2 rounded-lg transition-all ${order.status === 'received' ? 'text-slate-200 opacity-50' : 'text-slate-400 hover:text-rose-500'}`}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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