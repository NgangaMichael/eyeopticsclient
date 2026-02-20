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
import { orderService } from "../api/services/orderService";
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
    orders: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [patients, sales, stocks, expenses, orders] = await Promise.all([
        patientService.getAllPatients(),
        saleService.getAllSales(),
        stockService.getAllStocks(),
        expenseService.getAllExpenses(),
        orderService.getAllOrders()
      ]);
      
      setDashboardData({ patients, sales, stocks, expenses, orders });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate metrics
  const metrics = React.useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    // Total Revenue (this month)
    const thisMonthSales = dashboardData.sales.filter(s => {
      const saleDate = new Date(s.createdAt);
      return saleDate.getMonth() === thisMonth && saleDate.getFullYear() === thisYear;
    });
    const totalRevenue = thisMonthSales.reduce((sum, s) => sum + Number(s.total || 0), 0);

    // Last month revenue for comparison
    const lastMonthSales = dashboardData.sales.filter(s => {
      const saleDate = new Date(s.createdAt);
      return saleDate.getMonth() === lastMonth && saleDate.getFullYear() === lastMonthYear;
    });
    const lastMonthRevenue = lastMonthSales.reduce((sum, s) => sum + Number(s.total || 0), 0);
    const revenueGrowth = lastMonthRevenue > 0 
      ? (((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
      : totalRevenue > 0 ? 100 : 0;

    // New Patients (this month)
    const thisMonthPatients = dashboardData.patients.filter(p => {
      const patientDate = new Date(p.createdAt);
      return patientDate.getMonth() === thisMonth && patientDate.getFullYear() === thisYear;
    });
    const newPatients = thisMonthPatients.length;

    // Last month patients for comparison
    const lastMonthPatients = dashboardData.patients.filter(p => {
      const patientDate = new Date(p.createdAt);
      return patientDate.getMonth() === lastMonth && patientDate.getFullYear() === lastMonthYear;
    });
    const patientGrowth = lastMonthPatients.length > 0
      ? (((newPatients - lastMonthPatients.length) / lastMonthPatients.length) * 100).toFixed(1)
      : newPatients > 0 ? 100 : 0;

    // Items Sold (this month)
    const itemsSold = thisMonthSales.reduce((sum, s) => sum + (s.saleitem?.length || 0), 0);
    const lastMonthItems = lastMonthSales.reduce((sum, s) => sum + (s.saleitem?.length || 0), 0);
    const itemsGrowth = lastMonthItems > 0
      ? (((itemsSold - lastMonthItems) / lastMonthItems) * 100).toFixed(1)
      : itemsSold > 0 ? 100 : 0;

    // Low Stock Alert Count
    const lowStockCount = dashboardData.stocks.filter(s => s.qty <= 3).length;

    // Pending Orders
    const pendingOrders = dashboardData.orders.filter(o => o.status === 'pending').length;

    // Today's Sales
    const today = new Date().toDateString();
    const todaySales = dashboardData.sales.filter(s => 
      new Date(s.createdAt).toDateString() === today
    );
    const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.total || 0), 0);

    // This Month Expenses
    const thisMonthExpenses = dashboardData.expenses.filter(e => {
      const expenseDate = new Date(e.createdAt);
      return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear;
    });
    const totalExpenses = thisMonthExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // Net Profit (Revenue - Expenses)
    const netProfit = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      revenueGrowth,
      newPatients,
      patientGrowth,
      itemsSold,
      itemsGrowth,
      lowStockCount,
      pendingOrders,
      todayRevenue,
      todaySales: todaySales.length,
      totalExpenses,
      netProfit
    };
  }, [dashboardData]);

  // Recent activity (last 5 sales)
  const recentSales = React.useMemo(() => {
    return dashboardData.sales
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [dashboardData.sales]);

  // Low stock items
  const lowStockItems = React.useMemo(() => {
    return dashboardData.stocks
      .filter(s => s.qty <= 3)
      .sort((a, b) => a.qty - b.qty)
      .slice(0, 5);
  }, [dashboardData.stocks]);

  const stats = [
    { 
      title: 'Monthly Revenue', 
      value: `KSh ${metrics.totalRevenue.toLocaleString()}`, 
      growth: `${metrics.revenueGrowth >= 0 ? '+' : ''}${metrics.revenueGrowth}%`, 
      icon: <DollarSign size={24} />, 
      color: 'bg-emerald-500', 
      trend: metrics.revenueGrowth >= 0 ? 'up' : 'down',
      subtext: `KSh ${metrics.todayRevenue.toLocaleString()} today`
    },
    { 
      title: 'New Patients', 
      value: metrics.newPatients.toString(), 
      growth: `${metrics.patientGrowth >= 0 ? '+' : ''}${metrics.patientGrowth}%`, 
      icon: <Users size={24} />, 
      color: 'bg-blue-500', 
      trend: metrics.patientGrowth >= 0 ? 'up' : 'down',
      subtext: 'This month'
    },
    { 
      title: 'Items Sold', 
      value: metrics.itemsSold.toString(), 
      growth: `${metrics.itemsGrowth >= 0 ? '+' : ''}${metrics.itemsGrowth}%`, 
      icon: <ShoppingBag size={24} />, 
      color: 'bg-indigo-500', 
      trend: metrics.itemsGrowth >= 0 ? 'up' : 'down',
      subtext: `${metrics.todaySales} sales today`
    },
    { 
      title: 'Net Profit', 
      value: `KSh ${metrics.netProfit.toLocaleString()}`, 
      growth: metrics.netProfit >= 0 ? 'Positive' : 'Loss', 
      icon: <Activity size={24} />, 
      color: metrics.netProfit >= 0 ? 'bg-purple-500' : 'bg-rose-500', 
      trend: metrics.netProfit >= 0 ? 'up' : 'down',
      subtext: 'Revenue - Expenses'
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
      {/* Header Section */}
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
            <Zap size={18} />
            Refresh
          </button>
          <button 
          onClick={() => navigate('/dashboard/reports')}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 text-sm font-bold">
            <TrendingUp size={18} />
            View Reports
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="group bg-white p-6 rounded-3xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 
                stat.trend === 'down' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
              }`}>
                {stat.trend === 'up' && <ArrowUpRight size={14} />}
                {stat.trend === 'down' && <ArrowDownRight size={14} />}
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
        <div className="lg:col-span-2 bg-white rounded-3xl p-2">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Recent Transactions</h3>
              <button className="text-sm font-bold text-indigo-600 hover:underline transition-all">
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
                  {recentSales.length > 0 ? (
                    recentSales.map((sale) => (
                      <tr key={sale.id} className="group hover:bg-slate-50 rounded-2xl transition-all duration-200">
                        <td className="px-4 py-4 font-mono text-xs font-bold text-indigo-600">
                          #INV-{sale.id.toString().padStart(4, '0')}
                        </td>
                        {/* <td className="px-4 py-4 font-bold text-slate-700">
                          {sale.customer?.name || 'Walk-in'}
                        </td> */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">
                            {sale.customer 
                              ? sale.customer.name 
                              : sale.patient 
                                ? `${sale.patient.firstName} ${sale.patient.lastName}` 
                                : "Walk-in"}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            <span className='text-xs font-bold text-indigo-600'>Phone:</span> {sale.customer?.phone || sale.patient?.phone || "No Contact"}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-700 font-semibold">
                          KSh {Number(sale.total).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right text-slate-500 text-sm">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-slate-400">
                        No recent sales
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Alerts & Status Column */}
        <div className="space-y-6">
          {/* Low Stock Alert */}
          {metrics.lowStockCount > 0 && (
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-rose-200">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Package size={80} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={24} />
                  <h3 className="text-xl font-bold">Low Stock Alert</h3>
                </div>
                <p className="text-rose-100 text-sm mb-4 font-medium">
                  {metrics.lowStockCount} item{metrics.lowStockCount !== 1 ? 's' : ''} running low. 
                  Restock recommended.
                </p>
                <div className="space-y-2 mb-4">
                  {lowStockItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between text-xs bg-white/10 rounded-lg p-2">
                      <span className="font-medium">{item.name}</span>
                      <span className="font-bold">{item.qty} left</span>
                    </div>
                  ))}
                </div>
                <button 
                onClick={() => navigate('/dashboard/stocks')}
                className="w-full py-3 bg-white text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-50 transition-colors shadow-lg">
                  View Inventory
                </button>
              </div>
            </div>
          )}

          {/* Pending Orders */}
          {metrics.pendingOrders > 0 && (
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-amber-200">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <FileText size={80} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Package size={24} />
                  <h3 className="text-xl font-bold">Pending Orders</h3>
                </div>
                <p className="text-amber-100 text-sm mb-4 font-medium">
                  {metrics.pendingOrders} order{metrics.pendingOrders !== 1 ? 's' : ''} awaiting 
                  delivery and processing.
                </p>
                <button className="w-full py-3 bg-white text-amber-600 rounded-xl font-bold text-sm hover:bg-amber-50 transition-colors shadow-lg">
                  View Orders
                </button>
              </div>
            </div>
          )}

          {/* System Status */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Activity size={20} />
              </div>
              <h3 className="font-bold">System Status</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Patients</span>
                <span className="text-white font-bold">{dashboardData.patients.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Stock Items</span>
                <span className="text-white font-bold">{dashboardData.stocks.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Sales</span>
                <span className="text-white font-bold">{dashboardData.sales.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Monthly Expenses</span>
                <span className="text-rose-400 font-bold">
                  KSh {metrics.totalExpenses.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
          <p className="text-blue-600 text-xs font-bold uppercase mb-1">Total Patients</p>
          <p className="text-2xl font-extrabold text-blue-900">{dashboardData.patients.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-4 border border-emerald-200">
          <p className="text-emerald-600 text-xs font-bold uppercase mb-1">Stock Value</p>
          <p className="text-2xl font-extrabold text-emerald-900">
            KSh {dashboardData.stocks.reduce((sum, s) => sum + (s.qty * s.priceKsh), 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
          <p className="text-purple-600 text-xs font-bold uppercase mb-1">Avg Sale</p>
          <p className="text-2xl font-extrabold text-purple-900">
            KSh {dashboardData.sales.length > 0 
              ? Math.round(dashboardData.sales.reduce((sum, s) => sum + Number(s.total), 0) / dashboardData.sales.length).toLocaleString()
              : '0'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-4 border border-indigo-200">
          <p className="text-indigo-600 text-xs font-bold uppercase mb-1">Conversion Rate</p>
          <p className="text-2xl font-extrabold text-indigo-900">
            {dashboardData.patients.length > 0 
              ? Math.round((dashboardData.sales.length / dashboardData.patients.length) * 100)
              : 0}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default Overview;