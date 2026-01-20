import React from 'react';
import { 
  TrendingUp, Users, ShoppingBag, 
  AlertCircle, ArrowUpRight, ArrowDownRight,
  Eye, Calendar, DollarSign 
} from 'lucide-react';

const Overview = () => {
  // Mock data for the dashboard
  const stats = [
    { title: 'Total Revenue', value: '$24,500', growth: '+12.5%', icon: <DollarSign size={24} />, color: 'bg-emerald-500', trend: 'up' },
    { title: 'New Patients', value: '128', growth: '+8.2%', icon: <Users size={24} />, color: 'bg-blue-500', trend: 'up' },
    { title: 'Frames Sold', value: '43', growth: '-3.1%', icon: <ShoppingBag size={24} />, color: 'bg-indigo-500', trend: 'down' },
    { title: 'Appointments', value: '12', growth: 'Today', icon: <Calendar size={24} />, color: 'bg-purple-500', trend: 'neutral' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, Admin</h1>
          <p className="text-slate-500 font-medium">Here's what's happening with EyeOptics today.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 text-sm font-bold">
          <TrendingUp size={18} />
          View Monthly Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="group bg-white p-6 rounded-3xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
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
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Appointments Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-2">
          <div className="p-6">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-bold text-slate-800">Upcoming Consultations</h3>
               <button className="text-sm font-bold text-indigo-600 hover:underline transition-all">View All</button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-separate border-spacing-y-3">
                 <thead>
                   <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                     <th className="px-4 pb-2">Patient</th>
                     <th className="px-4 pb-2">Service</th>
                     <th className="px-4 pb-2">Time</th>
                     <th className="px-4 pb-2 text-right">Status</th>
                   </tr>
                 </thead>
                 <tbody>
                   {[
                     { name: 'Sarah Jenkins', type: 'Eye Exam', time: '10:30 AM', status: 'Confirmed' },
                     { name: 'Michael Chen', type: 'Frame Fitting', time: '11:45 AM', status: 'Pending' },
                     { name: 'Emma Wilson', type: 'Contact Lens Consultation', time: '02:00 PM', status: 'In Progress' }
                   ].map((row, i) => (
                     <tr key={i} className="group hover:bg-slate-50 rounded-2xl transition-all duration-200">
                       <td className="px-4 py-4 font-bold text-slate-700">{row.name}</td>
                       <td className="px-4 py-4 text-slate-500 text-sm">{row.type}</td>
                       <td className="px-4 py-4 text-slate-500 text-sm">{row.time}</td>
                       <td className="px-4 py-4 text-right">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-tight ${
                           row.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                           row.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                         }`}>
                           {row.status}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* Inventory Alert / Actions */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Eye size={80} />
            </div>
            <h3 className="text-xl font-bold mb-2">Inventory Alert</h3>
            <p className="text-indigo-100 text-sm mb-6 font-medium">3 premium frames are currently low on stock. Restock suggested.</p>
            <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg">
              Check Inventory
            </button>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-500 rounded-lg">
                <AlertCircle size={20} />
              </div>
              <h3 className="font-bold">System Status</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Database Connection</span>
                <span className="text-emerald-400 font-bold">Stable</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Last Backup</span>
                <span className="text-slate-300">2h ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;