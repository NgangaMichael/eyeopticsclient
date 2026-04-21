import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, Users, ShoppingBag, 
  AlertCircle, ArrowUpRight, ArrowDownRight,
  Eye, Calendar, DollarSign, Package, 
  Activity, Zap, FileText
} from 'lucide-react';
import { patientService } from "../api/services/patientService";
import { saleService } from "../api/services/saleService";
import { stockService } from "../api/services/stockService";
import { expenseService } from "../api/services/expenseService";
import { containerService } from "../api/services/containerService";
import { useNavigate } from 'react-router-dom';

const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
const username = storedUser.username || "User";

const Overview = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    patients: [],
    sales: [],
    stocks: [],
    expenses: [],
    containers: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [patients, sales, stocks, expenses, containers] = await Promise.all([
        patientService.getAllPatients(),
        saleService.getAllSales(),
        stockService.getAllStocks(),
        expenseService.getAllExpenses(),
        containerService.getAllContainers(),
      ]);
      
      setDashboardData({ patients, sales, stocks, expenses, containers });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const metrics = React.useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const thisMonthSales = (dashboardData.sales || []).filter(s => {
      const saleDate = new Date(s.createdAt);
      return saleDate.getMonth() === thisMonth && saleDate.getFullYear() === thisYear;
    });

    let retailRev = 0;
    let wholesaleRev = 0;
    let consultationFees = 0;
    let itemsSold = 0;

    thisMonthSales.forEach(s => {
      const total = Number(s.total || 0);
      
      // Split Retail (Patients) vs Wholesale (Bulk Customers)
      if (s.patientId) {
        retailRev += total;
      } else if (s.customerId) {
        wholesaleRev += total;
      } else {
        retailRev += total; // Default walk-ins to retail
      }

      // Logic for Consultation and Items
      s.saleitem?.forEach(item => {
        const itemPrice = Number(item.price || 0) * Number(item.quantity || 0);
        // Match your specific Consultation IDs here
        if (item.stockId === 1 || item.stockId === 246 || item.name?.toLowerCase().includes('consult')) { 
          consultationFees += itemPrice;
        } else {
          itemsSold += Number(item.quantity || 0);
        }
      });
    });

    const totalRevenue = thisMonthSales.reduce((sum, s) => sum + Number(s.total || 0), 0);
    const thisMonthExpenses = (dashboardData.expenses || []).filter(e => {
      const expenseDate = new Date(e.createdAt);
      return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear;
    });
    const totalExpenses = thisMonthExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return {
      totalRevenue,
      retailRev,
      wholesaleRev,
      consultationFees,
      itemsSold,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      lowStockCount: (dashboardData.stocks || []).filter(s => s.qty <= 3).length,
      pendingContainers: (dashboardData.containers || []).filter(c => c.status === 'pending').length,
      newPatients: (dashboardData.patients || []).filter(p => {
        const d = new Date(p.createdAt);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }).length,
      todayRevenue: (dashboardData.sales || []).filter(s => 
        new Date(s.createdAt).toDateString() === now.toDateString()
      ).reduce((sum, s) => sum + Number(s.total || 0), 0)
    };
  }, [dashboardData]);

  const recentSales = React.useMemo(() => {
    return (dashboardData.sales || [])
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [dashboardData.sales]);

  const lowStockItems = React.useMemo(() => {
    return (dashboardData.stocks || [])
      .filter(s => s.qty <= 3)
      .sort((a, b) => a.qty - b.qty)
      .slice(0, 5);
  }, [dashboardData.stocks]);

  const stats = [
    { 
      title: 'Retail Revenue', 
      value: `KSh ${metrics.retailRev.toLocaleString()}`, 
      growth: 'Patient Sales', 
      icon: <Users size={24} />, 
      color: 'bg-blue-600', 
      trend: 'up',
      subtext: 'Direct clinic sales'
    },
    { 
      title: 'Wholesale Rev.', 
      value: `KSh ${metrics.wholesaleRev.toLocaleString()}`, 
      growth: 'B2B Sales', 
      icon: <ShoppingBag size={24} />, 
      color: 'bg-purple-600', 
      trend: 'up',
      subtext: 'Customer/Bulk sales'
    },
    { 
      title: 'Consultation', 
      value: `KSh ${metrics.consultationFees.toLocaleString()}`, 
      growth: 'Fees', 
      icon: <Activity size={24} />, 
      color: 'bg-amber-500', 
      trend: 'up',
      subtext: 'Service revenue'
    },
    { 
      title: 'Net Profit', 
      value: `KSh ${metrics.netProfit.toLocaleString()}`, 
      growth: metrics.netProfit >= 0 ? 'Surplus' : 'Deficit', 
      icon: <TrendingUp size={24} />, 
      color: metrics.netProfit >= 0 ? 'bg-emerald-500' : 'bg-rose-500', 
      trend: metrics.netProfit >= 0 ? 'up' : 'down',
      subtext: 'After monthly expenses'
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {username}
          </h1>
          <p className="text-slate-500 font-medium">
            Here's what's happening with EyeOptics today.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={loadDashboardData}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm text-sm font-bold"
          >
            <Zap size={18} /> Refresh
          </button>
          <button 
            onClick={() => navigate('/dashboard/reports')}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-600 transition-all shadow-lg text-sm font-bold"
          >
            <TrendingUp size={18} /> View Reports
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-3xl border border-slate-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg`}>
                {stat.icon}
              </div>
              <div className={`text-xs font-bold px-2 py-1 rounded-lg ${
                stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {stat.growth}
              </div>
            </div>
            <p className="text-slate-500 text-sm font-semibold mb-1">{stat.title}</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">{stat.subtext}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Sales Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Recent Transactions</h3>
            <button onClick={() => navigate('/dashboard/sales')} className="text-sm font-bold text-indigo-600 hover:underline">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-4 pb-2">Invoice</th>
                  <th className="px-4 pb-2">Customer</th>
                  <th className="px-4 pb-2">Amount</th>
                  <th className="px-4 pb-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="group hover:bg-slate-50 rounded-2xl transition-all">
                    <td className="px-4 py-4 font-mono text-xs font-bold text-indigo-600">
                      #INV-{sale.id.toString().padStart(4, '0')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-800">
                        {sale.customer?.name || (sale.patient ? `${sale.patient.firstName} ${sale.patient.lastName}` : "Walk-in")}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {sale.customer?.phone || sale.patient?.phone || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700 font-semibold">
                      KSh {Number(sale.total).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-500 text-sm">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts Column */}
        <div className="space-y-6">
          {metrics.lowStockCount > 0 && (
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl p-8 text-white shadow-xl shadow-rose-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={24} />
                <h3 className="text-xl font-bold">Low Stock</h3>
              </div>
              <p className="text-rose-100 text-sm mb-4">{metrics.lowStockCount} items running low.</p>
              <button onClick={() => navigate('/dashboard/stocks')} className="w-full py-3 bg-white text-rose-600 rounded-xl font-bold text-sm">
                Restock Now
              </button>
            </div>
          )}

          <div className="bg-slate-900 rounded-3xl p-8 text-white">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <Activity size={20} className="text-emerald-500" /> System Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Monthly Expenses</span>
                <span className="text-rose-400 font-bold">KSh {metrics.totalExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Items Sold (Month)</span>
                <span className="text-white font-bold">{metrics.itemsSold}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">New Patients</span>
                <span className="text-white font-bold">{metrics.newPatients}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-blue-600 text-xs font-bold uppercase mb-1">Total Patients</p>
          <p className="text-2xl font-extrabold text-blue-900">{(dashboardData.patients || []).length}</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <p className="text-amber-600 text-xs font-bold uppercase mb-1">Consultation %</p>
          <p className="text-2xl font-extrabold text-amber-900">
            {metrics.totalRevenue > 0 ? Math.round((metrics.consultationFees / metrics.totalRevenue) * 100) : 0}%
          </p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
          <p className="text-emerald-600 text-xs font-bold uppercase mb-1">Total Rev (MTD)</p>
          <p className="text-2xl font-extrabold text-emerald-900">KSh {metrics.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
          <p className="text-indigo-600 text-xs font-bold uppercase mb-1">Conversion</p>
          <p className="text-2xl font-extrabold text-indigo-900">
            {dashboardData.patients.length > 0 ? Math.round((dashboardData.sales.length / dashboardData.patients.length) * 100) : 0}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default Overview;