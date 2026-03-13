import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Plus, Eye, Trash2, Search, Calendar, Users, Printer, Edit3, BadgeCheck, CheckSquare, Square, Layers } from 'lucide-react';
import SaleModal from '../components/SaleModal';
import { saleService } from "../api/services/saleService";
import { toast, ToastContainer } from "react-toastify";
import { useReactToPrint } from 'react-to-print';
import PrintableInvoice from '../components/PrintableInvoice';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', data: null });

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [etimsFilter, setEtimsFilter] = useState('all');

  // Multi-select State
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [printData, setPrintData] = useState(null);
  const invoiceRef = useRef(null);

  useEffect(() => { loadSales(); }, []);

  const loadSales = async () => {
    try {
      const data = await saleService.getAllSales();
      setSales(data);
    } catch (err) {
      toast.error("Failed to load sales history");
    }
  };

  // Filter Logic
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const invCode = `#INV-${sale.id.toString().padStart(4, '0')}`;
      const customerName = sale.customer?.name || '';
      const patientName = sale.patient ? `${sale.patient.firstName} ${sale.patient.lastName}` : '';

      const matchesSearch =
        invCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patientName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCustomer = customerFilter === 'all' ||
        (sale.customerId?.toString() === customerFilter) ||
        (sale.patientId?.toString() === customerFilter);

      const hasEtims = !!(sale.etimsReceipt || sale.etimsAmount);
      const matchesEtims =
        etimsFilter === 'all' ? true :
        etimsFilter === 'with' ? hasEtims : !hasEtims;

      const saleDate = new Date(sale.createdAt);
      const matchesDateFrom = !dateFrom || saleDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || saleDate <= new Date(new Date(dateTo).setHours(23, 59, 59));

      return matchesSearch && matchesCustomer && matchesDateFrom && matchesDateTo && matchesEtims;
    });
  }, [sales, searchTerm, customerFilter, dateFrom, dateTo, etimsFilter]);

  // Unique customers for the dropdown
  const uniqueCustomers = useMemo(() => {
    const list = [];
    const seen = new Set();
    sales.forEach(s => {
      if (s.customer && !seen.has(`c-${s.customer.id}`)) {
        seen.add(`c-${s.customer.id}`);
        list.push({ id: s.customer.id, name: `${s.customer.name} (Client)` });
      }
      if (s.patient && !seen.has(`p-${s.patient.id}`)) {
        seen.add(`p-${s.patient.id}`);
        list.push({ id: s.patient.id, name: `${s.patient.firstName} ${s.patient.lastName} (Patient)` });
      }
    });
    return list;
  }, [sales]);

  // --- Selection Helpers ---
  const allFilteredSelected = filteredSales.length > 0 && filteredSales.every(s => selectedIds.has(s.id));
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      // Deselect all currently filtered
      setSelectedIds(prev => {
        const next = new Set(prev);
        filteredSales.forEach(s => next.delete(s.id));
        return next;
      });
    } else {
      // Select all currently filtered
      setSelectedIds(prev => {
        const next = new Set(prev);
        filteredSales.forEach(s => next.add(s.id));
        return next;
      });
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  // Open bulk edit modal — pass all selected sale objects
  const handleBulkEdit = () => {
    const selectedSales = sales.filter(s => selectedIds.has(s.id));
    setModalState({ isOpen: true, mode: 'bulk', data: selectedSales });
  };

  const closeModal = () => setModalState({ ...modalState, isOpen: false });

  const handleDelete = async (id) => {
    if (window.confirm("Void this sale? This action cannot be undone.")) {
      try {
        await saleService.deleteSale(id);
        toast.success("Sale voided");
        loadSales();
      } catch (err) { toast.error("Delete failed"); }
    }
  };

  const handleUpdateSale = async (id, updatedData) => {
    try {
      await saleService.updateSale(id, updatedData);
      toast.success("Invoice updated successfully");
      loadSales();
      closeModal();
    } catch (err) {
      toast.error("Failed to update invoice");
    }
  };

  // Bulk update: update all selected sales with the same eTIMS data
  const handleBulkUpdate = async (ids, updatedData) => {
    try {
      await Promise.all(ids.map(id => saleService.updateSale(id, updatedData)));
      toast.success(`${ids.length} invoice${ids.length > 1 ? 's' : ''} updated with eTIMS details`);
      clearSelection();
      loadSales();
      closeModal();
    } catch (err) {
      toast.error("Bulk update failed. Some invoices may not have been updated.");
    }
  };

  const handlePrintTrigger = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: printData ? `Invoice_#INV-${printData.id}` : "Eye_Optics_Invoice",
    onAfterPrint: () => setPrintData(null),
  });

  const handlePrintClick = (sale) => {
    setPrintData(sale);
    setTimeout(() => {
      if (invoiceRef.current) {
        handlePrintTrigger();
      } else {
        toast.error("Invoice is still loading...");
      }
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sales & Invoices</h2>
          <p className="text-slate-500">History of all transactions and revenue.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text" placeholder="Search Invoice #..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <Users className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <select
            value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
          >
            <option value="all">All Customers</option>
            {uniqueCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="relative flex items-center gap-2">
          <input
            type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
          />
          <span className="text-slate-400">to</span>
          <input
            type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            value={dateTo} onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div className="relative">
          <select
            value={etimsFilter} onChange={(e) => setEtimsFilter(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
          >
            <option value="all">All Records</option>
            <option value="with">eTIMS Only</option>
            <option value="without">Non-eTIMS</option>
          </select>
        </div>

        <button
          onClick={() => { setSearchTerm(''); setCustomerFilter('all'); setDateFrom(''); setDateTo(''); }}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase"
        >
          Reset Filters
        </button>
      </div>

      {/* Bulk Action Bar — slides in when items are selected */}
      {someSelected && (
        <div className="flex items-center justify-between bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-indigo-200 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-lg px-3 py-1 text-sm font-bold">
              {selectedIds.size} selected
            </div>
            <span className="text-indigo-200 text-sm">
              {selectedIds.size === 1 ? '1 invoice selected' : `${selectedIds.size} invoices selected`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkEdit}
              className="flex items-center gap-2 bg-white text-indigo-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all shadow"
            >
              <Layers size={16} />
              Bulk eTIMS Update
            </button>
            <button
              onClick={clearSelection}
              className="text-indigo-200 hover:text-white text-sm font-medium px-3 py-2 hover:bg-white/10 rounded-xl transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {/* Select-all checkbox */}
              <th className="px-4 py-4 w-10">
                <button onClick={toggleSelectAll} className="text-slate-400 hover:text-indigo-600 transition-colors">
                  {allFilteredSelected
                    ? <CheckSquare size={18} className="text-indigo-600" />
                    : <Square size={18} />
                  }
                </button>
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Receipt ID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">REF NO</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Customer</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Total Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Items</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredSales.map((sale) => {
              const isSelected = selectedIds.has(sale.id);
              return (
                <tr
                  key={sale.id}
                  className={`hover:bg-slate-50 transition-colors group ${isSelected ? 'bg-indigo-50/60' : ''}`}
                >
                  {/* Row checkbox */}
                  <td className="px-4 py-4">
                    <button onClick={() => toggleSelect(sale.id)} className="text-slate-300 hover:text-indigo-600 transition-colors">
                      {isSelected
                        ? <CheckSquare size={18} className="text-indigo-600" />
                        : <Square size={18} />
                      }
                    </button>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-600">
                        #INV-{sale.id.toString().padStart(4, '0')}
                      </span>
                      {(sale.etimsReceipt || sale.etimsAmount) ? (
                        <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-tighter">
                          <BadgeCheck size={10} />
                          eTIMS
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-tighter">
                          Pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">
                    {sale.referenceNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">
                      {sale.customer
                        ? sale.customer.name
                        : sale.patient
                          ? `${sale.patient.firstName} ${sale.patient.lastName}`
                          : "Walk-in"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {sale.customer?.phone || sale.patient?.phone || "No Contact"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-extrabold text-slate-700">{Number(sale.total).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 ml-1">KSH</span>
                    <div className="text-[10px] text-slate-400">Discount: <span className="font-extrabold text-slate-700">{sale.discount}</span></div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">
                      {sale.saleitem?.length || 0} Products
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        title="View Items"
                        onClick={() => setModalState({ isOpen: true, mode: 'view', data: sale })}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        title="Print Receipt"
                        onClick={() => handlePrintClick(sale)}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <Printer size={18} />
                      </button>
                      <button
                        title="Edit eTIMS"
                        onClick={() => setModalState({ isOpen: true, mode: 'edit', data: sale })}
                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        title="Void Sale"
                        onClick={() => handleDelete(sale.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'none' }}>
        <div ref={invoiceRef}>
          <PrintableInvoice sale={printData} />
        </div>
      </div>

      <SaleModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        initialData={modalState.data}
        mode={modalState.mode}
        onUpdate={handleUpdateSale}
        onBulkUpdate={handleBulkUpdate}
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}