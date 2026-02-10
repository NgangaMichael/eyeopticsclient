import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Eye, Edit3, Trash2, Search, Box, Calendar, Download } from 'lucide-react';
import StockModal from '../components/StockModal';
import { stockService } from "../api/services/stockService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from 'xlsx';

export default function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', data: null });

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [sphSearch, setSphSearch] = useState('');
  const [cylSearch, setCylSearch] = useState('');

  useEffect(() => { loadStocks(); }, []);

  const loadStocks = async () => {
    try {
      const data = await stockService.getAllStocks();
      setStocks(data);
    } catch {
      toast.error("Failed to load inventory data");
    }
  };

// filteredStocks useMemo
const filteredStocks = useMemo(() => {
  return stocks.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || item.type === typeFilter;

    // SPH & CYL Filter Logic
    // We use parseFloat to compare numbers, but only if the user has typed something
    const matchesSph = sphSearch === '' || parseFloat(item.sph) === parseFloat(sphSearch);
    const matchesCyl = cylSearch === '' || parseFloat(item.cyl) === parseFloat(cylSearch);

    const createdAt = new Date(item.createdAt).getTime();
    const fromOk = dateFrom ? createdAt >= new Date(dateFrom).getTime() : true;
    const toOk = dateTo ? createdAt <= new Date(dateTo).setHours(23, 59, 59, 999) : true;

    return matchesSearch && matchesType && fromOk && toOk && matchesSph && matchesCyl;
  });
}, [stocks, searchTerm, typeFilter, dateFrom, dateTo, sphSearch, cylSearch]);

  // Unique types for the dropdown
  const categories = useMemo(() => {
    const types = stocks.map(s => s.type).filter(Boolean);
    return [...new Set(types)];
  }, [stocks]);

  const handleSubmit = async (formData) => {
    try {
      if (modalState.mode === 'edit') {
        await stockService.updateStock(modalState.data.id, formData);
        toast.success(`Item "${formData.name}" updated successfully`);
      } else {
        await stockService.createStock(formData);
        toast.success(`Item "${formData.name}" added successfully`);
      }
      closeModal();
      loadStocks();
    } catch {
      toast.error("Failed to save/update Stock Item");
    }
  };

  const openModal = (mode, data = null) => setModalState({ isOpen: true, mode, data });
  const closeModal = () => setModalState({ ...modalState, isOpen: false });

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item permanently?")) return;
    try {
      await stockService.deleteStock(id);
      toast.success("Item deleted successfully");
      loadStocks();
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const exportToExcel = (dataToExport, fileName) => {
    // 1. Prepare the data (Optional: formatting column headers)
    const formattedData = dataToExport.map(item => ({
      'Item Name': item.name,
      'Code': item.code,
      'Category': item.type,
      'Quantity': item.qty,
      'Price (KSH)': item.priceKsh,
      'Price (USD)': item.priceUsd,
      'Supplier': item.supplier,
      'Date Added': new Date(item.createdAt).toLocaleDateString(),
    }));

    // 2. Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

    // 3. Download the file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    toast.success(`${fileName} exported successfully!`);
  };

  // Helper for Low Stock
  const exportLowStock = () => {
    const lowStockItems = stocks.filter(item => item.qty <= 3);
    if (lowStockItems.length === 0) {
      return toast.info("No low stock items to export");
    }
    exportToExcel(lowStockItems, "Low_Stock_Report");
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Inventory</h2>
          <p className="text-slate-500">Monitor and manage your stock levels</p>
        </div>
        
        <div className="flex gap-2">
          {/* Export All Button */}
          <button 
            onClick={() => exportToExcel(stocks, "Full_Inventory_Report")}
            className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all flex items-center gap-2 border border-emerald-100"
          >
            <Download size={16} /> Export All
          </button>

          {/* Export Low Stock Button */}
          <button 
            onClick={exportLowStock}
            className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all flex items-center gap-2 border border-rose-100"
          >
            <Download size={16} /> Export Low Stock
          </button>

          {/* Add Item Button */}
          {/* <button onClick={() => openModal('add')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
          >
            <Plus size={16} /> Add Item
          </button> */}
        </div>
      </div>

      {/* Filter Bar */}
      {/* Replace your current Filter Bar div with this updated grid */}
<div className="grid grid-cols-1 md:grid-cols-7 gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm items-center">
  
  {/* Search (Takes 2 columns now) */}
  <div className="relative md:col-span-1">
    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
    <input
      type="text"
      placeholder="Name/Code..."
      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>

  {/* SPH Search */}
  <div className="relative">
    <input
      type="number"
      step="0.25"
      placeholder="0.00"
      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
      value={sphSearch}
      onChange={(e) => setSphSearch(e.target.value)}
    />
    <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-blue-500 uppercase">SPH</span>
  </div>

  {/* CYL Search */}
  <div className="relative">
    <input
      type="number"
      step="0.25"
      placeholder="0.00"
      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold"
      value={cylSearch}
      onChange={(e) => setCylSearch(e.target.value)}
    />
    <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-emerald-500 uppercase">CYL</span>
  </div>

  {/* Category */}
  <div className="relative">
    <select
      value={typeFilter}
      onChange={(e) => setTypeFilter(e.target.value)}
      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
    >
      <option value="all">All</option>
      {categories.map(type => <option key={type} value={type}>{type}</option>)}
    </select>
      <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase">Type</span>
    </div>

    {/* Date From & To (Keep existing but wrapped for space) */}
    <div className="relative">
      <input type="date" className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px]" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
      <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase">From</span>
    </div>

    <div className="relative">
      <input type="date" className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px]" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase">To</span>
    </div>

    {/* Reset Button */}
    <button
      onClick={() => {
        setSearchTerm('');
        setTypeFilter('all');
        setDateFrom('');
        setDateTo('');
        setSphSearch('');
        setCylSearch('');
      }}
      className="text-xs font-bold text-rose-500 uppercase hover:underline"
    >
      Reset
    </button>
  </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name / Code</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price (USD / KSh)</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredStocks.length > 0 ? (
              filteredStocks.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{item.name}</div>
                    <div className="text-xs text-indigo-500 font-mono bg-indigo-50 px-1.5 py-0.5 rounded inline-block mt-1">
                      {item.code}
                      {/* Logic for Lens specific SPH and CYL */}
                      {item.type?.toLowerCase() === 'lens' && (item.sph !== null || item.cyl !== null) && (
                        <div className="flex items-center gap-1 bg-slate-800 text-white px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm">
                          <span className="text-slate-400">SPH:</span> 
                          <span>{item.sph > 0 ? `+${item.sph}` : item.sph}</span>
                          <span className="mx-1 text-slate-600">|</span>
                          <span className="text-slate-400">CYL:</span> 
                          <span>{item.cyl > 0 ? `+${item.cyl}` : item.cyl}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`font-bold ${item.qty <= 3 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {item.qty}
                      </span>
                      {item.qty <= 3 && (
                        <span className="text-[10px] font-bold text-rose-400 uppercase">Low Stock</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="text-slate-900 font-bold">
                      {Number(item.priceKsh || 0).toLocaleString()} <span className="text-[10px] text-slate-400">KSH</span>
                    </div>
                    <div className="text-slate-400 text-xs">
                      ${Number(item.priceUsd || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal('view', item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Eye size={18} /></button>
                      <button onClick={() => openModal('edit', item)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"><Edit3 size={18} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-medium">
                  No stock items found matching your criteria.
                </td>
              </tr>
            )}
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

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}