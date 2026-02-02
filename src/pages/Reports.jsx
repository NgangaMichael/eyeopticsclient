import React, { useEffect, useState, useMemo } from 'react';
import { Download, TrendingUp, Wallet, Package, ArrowUpRight, ArrowDownRight, Filter, RefreshCcw } from 'lucide-react';
import { expenseService } from "../api/services/expenseService";
import { saleService } from "../api/services/saleService";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

export default function Reports() {
  const [expenses, setExpenses] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Default to start of month
    to: new Date().toISOString().split('T')[0], 
    category: 'all' 
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
    } catch (err) {
      toast.error("Failed to sync financial records");
    } finally {
      setLoading(false);
    }
  };

  // --- Filtering Logic ---
  const filteredData = useMemo(() => {
    const applyDateFilter = (item) => {
      const date = new Date(item.createdAt).getTime();
      const fromOk = filters.from ? date >= new Date(filters.from).setHours(0,0,0) : true;
      const toOk = filters.to ? date <= new Date(filters.to).setHours(23,59,59) : true;
      return fromOk && toOk;
    };

    return {
      expenses: expenses.filter(e => applyDateFilter(e) && (filters.category === 'all' || e.category === filters.category)),
      sales: sales.filter(applyDateFilter)
    };
  }, [expenses, sales, filters]);

  // --- Analytics Logic ---
  const stats = useMemo(() => {
    const totalSales = filteredData.sales.reduce((sum, s) => sum + Number(s.total), 0);
    const totalExpenses = filteredData.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalItems = filteredData.sales.reduce((sum, s) => sum + (s.saleitem?.length || 0), 0);
    const profit = totalSales - totalExpenses;
    const avgOrderValue = totalSales / (filteredData.sales.length || 1);
    
    return { totalSales, totalExpenses, totalItems, profit, avgOrderValue };
  }, [filteredData]);

  // --- Chart Formatting ---
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

  return (
    <div className="space-y-6 p-2 max-w-7xl mx-auto">
      {/* Header */}
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

      {/* Advanced Filters */}
      <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-1 block">Date Range</label>
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <input type="date" value={filters.from} onChange={e => setFilters({...filters, from: e.target.value})} className="bg-transparent text-sm p-1.5 outline-none w-full" />
            <span className="text-slate-300">/</span>
            <input type="date" value={filters.to} onChange={e => setFilters({...filters, to: e.target.value})} className="bg-transparent text-sm p-1.5 outline-none w-full" />
          </div>
        </div>
        <div className="flex gap-2">
            {['Today', 'This Month', 'This Year'].map(range => (
                <button 
                    key={range}
                    onClick={() => {
                        const now = new Date();
                        if(range === 'Today') setFilters({...filters, from: now.toISOString().split('T')[0], to: now.toISOString().split('T')[0]});
                        if(range === 'This Month') setFilters({...filters, from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0], to: now.toISOString().split('T')[0]});
                    }}
                    className="text-[11px] font-bold px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                >
                    {range}
                </button>
            ))}
        </div>
        <div className="text-right">
            <button onClick={() => setFilters({from: '', to: '', category: 'all'})} className="text-xs font-bold text-rose-500 uppercase tracking-widest">Reset All</button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={stats.totalSales} icon={<TrendingUp />} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard title="Total Expenses" value={stats.totalExpenses} icon={<Wallet />} color="text-rose-600" bg="bg-rose-50" />
        <StatCard title="Net Profit" value={stats.profit} icon={<ArrowUpRight />} color="text-indigo-600" bg="bg-indigo-50" isProfit />
        <StatCard title="Items Sold" value={stats.totalItems} icon={<Package />} color="text-amber-600" bg="bg-amber-50" noCurrency />
      </div>

      {/* Visual Analytics */}
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
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} 
                />
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
                    ></div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, bg, noCurrency, isProfit }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-3 ${bg} ${color} rounded-2xl`}>{icon}</div>
        {isProfit && (
            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${value >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {value >= 0 ? '+ PROFIT' : '- LOSS'}
            </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black text-slate-800 mt-1">
          {!noCurrency && <span className="text-sm font-bold text-slate-400 mr-1">KSh</span>}
          {value.toLocaleString()}
        </h3>
      </div>
    </div>
  );
}