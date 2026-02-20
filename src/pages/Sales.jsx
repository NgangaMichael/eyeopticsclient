import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Plus, Eye, Trash2, Search, Calendar, Users, Printer } from 'lucide-react';
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

  const [printData, setPrintData] = useState(null);
  const invoiceRef = useRef(null);

  useEffect(() => { loadSales(); }, []);

  const loadSales = async () => {
    try {
      const data = await saleService.getAllSales();
      console.log("Fetched sales:", data);
      setSales(data);
    } catch (err) {
      toast.error("Failed to load sales history");
    }
  };

  // 1. Filter Logic
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const invCode = `#INV-${sale.id.toString().padStart(4, '0')}`;
      
      // Safely get names for comparison
      const customerName = sale.customer?.name || '';
      const patientName = sale.patient ? `${sale.patient.firstName} ${sale.patient.lastName}` : '';
      
      const matchesSearch = 
        invCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patientName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Safety check for ID comparison to prevent "Blank Page" crash
      const matchesCustomer = customerFilter === 'all' || 
                              (sale.customerId?.toString() === customerFilter) ||
                              (sale.patientId?.toString() === customerFilter);

      const saleDate = new Date(sale.createdAt);
      const matchesDateFrom = !dateFrom || saleDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || saleDate <= new Date(new Date(dateTo).setHours(23, 59, 59));

      return matchesSearch && matchesCustomer && matchesDateFrom && matchesDateTo;
    });
  }, [sales, searchTerm, customerFilter, dateFrom, dateTo]);

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

  // 2. Print Function
  const handlePrint = (sale) => {
    // Basic browser print - usually you'd trigger a specific printable component
    window.print();
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

  const handlePrintTrigger = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: printData ? `Invoice_#INV-${printData.id}` : "Eye_Optics_Invoice",
    onAfterPrint: () => setPrintData(null), // Clean up after printing
  });

  const handlePrintClick = (sale) => {
    setPrintData(sale);
    // Give React a moment to map the sale data to the PrintableInvoice component
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

        <button 
          onClick={() => {setSearchTerm(''); setCustomerFilter('all'); setDateFrom(''); setDateTo('');}}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase"
        >
          Reset Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
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
            {filteredSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">
                  #INV-{sale.id.toString().padStart(4, '0')}
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
                       title="Void Sale"
                       onClick={() => handleDelete(sale.id)} 
                       className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
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
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}