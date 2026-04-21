import React, { useEffect, useState, useMemo } from 'react';
import { Download, TrendingUp, Wallet, Package, ArrowUpRight, RefreshCcw } from 'lucide-react';
import { expenseService } from "../api/services/expenseService";
import { saleService } from "../api/services/saleService";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const [expenses, setExpenses] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
    category: 'all'
  });

  // Table-specific filters — default to current month, no trade filter
  const [tableFilters, setTableFilters] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
    trade: 'all'   // 'all' | 'lens' | 'frame'
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expenseData, saleData] = await Promise.all([
        expenseService.getAllExpenses(),
        saleService.getAllSales()
      ]);
      setExpenses(expenseData);
      setSales(saleData);
      console.log("Loaded expenses:", saleData);
    } catch (err) {
      toast.error("Failed to sync financial records");
    } finally {
      setLoading(false);
    }
  };

  // ── Filtering for metric cards / chart ──────────────────────────────────
  const filteredData = useMemo(() => {
    const applyDateFilter = (item) => {
      const date = new Date(item.createdAt).getTime();
      const fromOk = filters.from ? date >= new Date(filters.from).setHours(0, 0, 0) : true;
      const toOk = filters.to ? date <= new Date(filters.to).setHours(23, 59, 59) : true;
      return fromOk && toOk;
    };
    return {
      expenses: expenses.filter(e => applyDateFilter(e) && (filters.category === 'all' || e.category === filters.category)),
      sales: sales.filter(applyDateFilter)
    };
  }, [expenses, sales, filters]);

  // ── Analytics ────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    let totals = { totalSales: 0, totalExpenses: 0, retailProfit: 0, wholesaleProfit: 0, totalItems: 0, profit: 0, avgOrderValue: 0 };
    filteredData.sales.forEach(s => {
      const amount = Number(s.total || 0);
      totals.totalSales += amount;
      totals.totalItems += (s.saleitem?.length || 0);
      if (s.patientId) totals.retailProfit += amount;
      else if (s.customerId) totals.wholesaleProfit += amount;
    });
    totals.totalExpenses = filteredData.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    totals.profit = totals.totalSales - totals.totalExpenses;
    totals.avgOrderValue = totals.totalSales / (filteredData.sales.length || 1);
    return totals;
  }, [filteredData]);

  // ── Chart data ───────────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    const dataMap = {};
    filteredData.sales.forEach(s => {
      const date = new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dataMap[date] = { ...dataMap[date], date, sales: (dataMap[date]?.sales || 0) + Number(s.total) };
    });
    filteredData.expenses.forEach(e => {
      const date = new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dataMap[date] = { ...dataMap[date], date, expenses: (dataMap[date]?.expenses || 0) + Number(e.amount) };
    });
    return Object.values(dataMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredData]);

  // ── Items Sold Table ─────────────────────────────────────────────────────
  // Flatten all sale items within the table date range, with optional trade filter
  // Product schema: name, priceKsh (selling), costKsh (cost), type ('lens'|'frame'|...)
  const tableRows = useMemo(() => {
    const rows = [];
    sales.forEach(sale => {
      const saleDate = new Date(sale.createdAt).getTime();
      const fromOk = tableFilters.from ? saleDate >= new Date(tableFilters.from).setHours(0, 0, 0) : true;
      const toOk = tableFilters.to ? saleDate <= new Date(tableFilters.to).setHours(23, 59, 59) : true;
      if (!fromOk || !toOk) return;

      (sale.saleitem || []).forEach(item => {
        const stock = item.stock || {};
        const productName = stock.name || item.name || 'Unknown';

        // Normalize Type
        const rawType = (stock.type || stock.lensCategory || '').toLowerCase();
        let resolvedType = rawType.includes('frame') ? 'frame' : rawType.includes('lens') ? 'lens' : 'other';

        if (tableFilters.trade !== 'all' && resolvedType !== tableFilters.trade) return;

        // Financials from Stock record
        const costPrice = Number(stock.costKsh ?? 0);
        const retailPrice = Number(stock.priceKsh ?? 0);
        const wholesalePrice = Number(stock.wholesalePrice ?? 0);

        // Actual Sale Data
        const actualSoldPrice = Number(item.price ?? 0);
        const qty = Number(item.quantity || 1);
        
        // Determine if this specific sale was Retail or Wholesale
        // (Assuming if patientId exists, it's retail; if customerId exists, it's wholesale)
        const isWholesale = !!sale.customerId;

        rows.push({
          id: `${sale.id}-${item.id}`,
          name: productName,
          type: resolvedType.charAt(0).toUpperCase() + resolvedType.slice(1),
          qty,
          actualSoldPrice,
          costPrice,
          retailPrice,
          wholesalePrice,
          // Profit based on what we actually charged vs cost
          actualProfit: (actualSoldPrice - costPrice) * qty,
          isWholesale,
          createdAt: sale.createdAt,
        });
      });
    });
    return rows;
  }, [sales, tableFilters]);

  // Subtotals
  const tableTotals = useMemo(() => ({
    qty: tableRows.reduce((s, r) => s + r.qty, 0),
    revenue: tableRows.reduce((s, r) => s + r.qty * r.sellingPrice, 0),
    cost: tableRows.reduce((s, r) => s + r.qty * r.costPrice, 0),
  }), [tableRows]);

  // ── Exports ──────────────────────────────────────────────────────────────
  const exportToExcel = () => {
    const data = [
      ...filteredData.sales.map(s => ({ Date: s.createdAt, Type: 'SALE', Ref: `INV-${s.id}`, Amount: s.total, Note: s.customer?.name })),
      ...filteredData.expenses.map(e => ({ Date: e.createdAt, Type: 'EXPENSE', Ref: e.title, Amount: e.amount, Note: e.category }))
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Financials");
    XLSX.writeFile(wb, `Business_Report_${filters.from}_to_${filters.to}.xlsx`);
  };

  const exportTableToCSV = () => {
    const headers = ['Item', 'Type', 'Index', 'Qty Sold', 'Selling Price (KSh)', 'Cost Price (KSh)', 'Revenue (KSh)', 'Date'];
    const rows = tableRows.map(r => [
      r.name,
      r.type,
      r.index || '—',
      r.qty,
      r.sellingPrice.toFixed(2),
      r.costPrice.toFixed(2),
      (r.qty * r.sellingPrice).toFixed(2),
      new Date(r.createdAt).toLocaleDateString()
    ]);
    // Subtotal row
    rows.push([
      'SUBTOTAL', '', '',
      tableTotals.qty,
      '',
      '',
      tableTotals.revenue.toFixed(2),
      ''
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Items_Sold_${tableFilters.from}_to_${tableFilters.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-2 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence Report</h2>
          <p className="text-slate-500 font-medium">Financial performance and volume analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={exportToExcel} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
            <Download size={18} /> Export Data
          </button>
        </div>
      </div>

      {/* ── Card Filters ── */}
      <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-1 block">Date Range</label>
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <input type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} className="bg-transparent text-sm p-1.5 outline-none w-full" />
            <span className="text-slate-300">/</span>
            <input type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} className="bg-transparent text-sm p-1.5 outline-none w-full" />
          </div>
        </div>
        <div className="flex gap-2">
          {['Today', 'This Month', 'This Year'].map(range => (
            <button
              key={range}
              onClick={() => {
                const now = new Date();
                if (range === 'Today') setFilters({ ...filters, from: now.toISOString().split('T')[0], to: now.toISOString().split('T')[0] });
                if (range === 'This Month') setFilters({ ...filters, from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0], to: now.toISOString().split('T')[0] });
                if (range === 'This Year') setFilters({ ...filters, from: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0], to: now.toISOString().split('T')[0] });
              }}
              className="text-[11px] font-bold px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
            >
              {range}
            </button>
          ))}
        </div>
        <div className="text-right">
          <button onClick={() => setFilters({ from: '', to: '', category: 'all' })} className="text-xs font-bold text-rose-500 uppercase tracking-widest">Reset All</button>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="xl:col-span-2 grid grid-cols-2 gap-4">
          <StatCard title="Total Revenue" value={stats.totalSales} icon={<TrendingUp />} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard title="Total Expenses" value={stats.totalExpenses} icon={<Wallet />} color="text-rose-600" bg="bg-rose-50" />
        </div>
        <div className="xl:col-span-2 grid grid-cols-2 gap-4 border-x border-slate-100 px-4">
          <StatCard title="Retail Rev." value={stats.retailProfit} icon={<Package />} color="text-blue-600" bg="bg-blue-50" />
          <StatCard title="Wholesale Rev." value={stats.wholesaleProfit} icon={<RefreshCcw />} color="text-purple-600" bg="bg-purple-50" />
        </div>
        <div className="xl:col-span-2 grid grid-cols-2 gap-4">
          <StatCard title="Net Profit" value={stats.profit} icon={<ArrowUpRight />} color="text-indigo-600" bg="bg-indigo-50" isProfit />
          <StatCard title="Items Sold" value={stats.totalItems} icon={<Package />} color="text-amber-600" bg="bg-amber-50" noCurrency />
        </div>
      </div>

      {/* ── Items Sold Table ── */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 pt-6 pb-4">
          <div>
            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
              <Package size={18} className="text-indigo-500" />
              Items Sold
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{tableRows.length} line items in selected period</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Date range */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <input
                type="date"
                value={tableFilters.from}
                onChange={e => setTableFilters({ ...tableFilters, from: e.target.value })}
                className="bg-transparent text-xs outline-none"
              />
              <span className="text-slate-300 text-xs">–</span>
              <input
                type="date"
                value={tableFilters.to}
                onChange={e => setTableFilters({ ...tableFilters, to: e.target.value })}
                className="bg-transparent text-xs outline-none"
              />
            </div>

            {/* Trade filter pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { label: 'All', value: 'all' },
                { label: 'Lens', value: 'lens' },
                { label: 'Frame', value: 'frame' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTableFilters({ ...tableFilters, trade: opt.value })}
                  className={`text-xs font-bold px-4 py-1.5 rounded-lg transition-all ${
                    tableFilters.trade === opt.value
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Quick range shortcuts for table */}
            <div className="flex gap-1">
              {['Today', 'Month', 'Year'].map(range => (
                <button
                  key={range}
                  onClick={() => {
                    const now = new Date();
                    if (range === 'Today') setTableFilters({ ...tableFilters, from: now.toISOString().split('T')[0], to: now.toISOString().split('T')[0] });
                    if (range === 'Month') setTableFilters({ ...tableFilters, from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0], to: now.toISOString().split('T')[0] });
                    if (range === 'Year') setTableFilters({ ...tableFilters, from: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0], to: now.toISOString().split('T')[0] });
                  }}
                  className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-200"
                >
                  {range}
                </button>
              ))}
            </div>

            {/* CSV Export */}
            <button
              onClick={exportTableToCSV}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
            >
              <Download size={14} /> CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
  <table className="w-full text-left text-sm">
    <thead className="bg-slate-50 border-y border-slate-100">
      <tr>
        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">Item Details</th>
        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase text-right">Unit Cost</th>
        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase text-right">Retail Price</th>
        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase text-right">Wholesale</th>
        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase text-right">Sold At (Qty)</th>
        <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase text-right">Net Profit</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-50">
      {tableRows.map(row => (
        <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
          <td className="px-6 py-4">
            <div className="font-bold text-slate-800">{row.name}</div>
            <div className="flex gap-2 mt-1">
               <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">{row.type}</span>
               {row.isWholesale ? 
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-600 uppercase">Wholesale Order</span> :
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 uppercase">Retail Sale</span>
               }
            </div>
          </td>
          <td className="px-6 py-4 text-right text-slate-600 font-medium">
            {row.costPrice.toLocaleString()}
          </td>
          <td className="px-6 py-4 text-right text-slate-600">
            {row.retailPrice.toLocaleString()}
          </td>
          <td className="px-6 py-4 text-right text-slate-600">
            {row.wholesalePrice.toLocaleString()}
          </td>
          <td className="px-6 py-4 text-right">
            <div className="font-black text-slate-900">{row.actualSoldPrice.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400">× {row.qty} units</div>
          </td>
          <td className="px-6 py-4 text-right">
            <span className={`font-black ${row.actualProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              KSh {row.actualProfit.toLocaleString()}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
    <tfoot>
       <tr className="bg-slate-900 text-white">
         <td className="px-6 py-4 font-black uppercase text-xs" colSpan={5}>Total Period Profit</td>
         <td className="px-6 py-4 text-right font-black text-lg">
           KSh {tableRows.reduce((sum, r) => sum + r.actualProfit, 0).toLocaleString()}
         </td>
       </tr>
    </tfoot>
  </table>
</div>
      </div>

      {/* ── Charts (bottom) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-500" />
            Cashflow Trends
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 mb-6">Efficiency KPI</h3>
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase">Avg. Order Value</p>
              <p className="text-xl font-black text-slate-800">KSh {stats.avgOrderValue.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase">Expense-to-Income Ratio</p>
              <p className="text-xl font-black text-slate-800">
                {((stats.totalExpenses / (stats.totalSales || 1)) * 100).toFixed(1)}%
              </p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-full transition-all duration-1000"
                  style={{ width: `${Math.min((stats.totalExpenses / (stats.totalSales || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value = 0, icon, color, bg, noCurrency, isProfit }) {
  const numericValue = Number(value || 0);
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 ${bg} ${color} rounded-xl`}>{icon}</div>
        {isProfit && (
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${numericValue >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {numericValue >= 0 ? 'PROFIT' : 'LOSS'}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-xl font-black text-slate-800 mt-0.5 truncate">
          {!noCurrency && <span className="text-xs font-bold text-slate-400 mr-0.5">KSh</span>}
          {numericValue.toLocaleString()}
        </h3>
      </div>
    </div>
  );
}