
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, Truck, Wallet, AlertCircle } from 'lucide-react';
import { MOCK_VANS } from '../constants';
import { VanStatus } from '../types';

const revenueData = [
  { name: 'Jan', value: 4500 },
  { name: 'Feb', value: 5200 },
  { name: 'Mar', value: 4800 },
  { name: 'Apr', value: 6100 },
  { name: 'May', value: 5900 },
  { name: 'Jun', value: 7200 },
];

export const Dashboard: React.FC = () => {
  const stats = {
    total: MOCK_VANS.length,
    available: MOCK_VANS.filter(v => v.status === VanStatus.AVAILABLE).length,
    revenue: 24500,
    utilization: 78
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Fleet Overview</h2>
        <p className="text-slate-500">Real-time status of your logistics network.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Fleet" value={stats.total} icon={<Truck className="w-6 h-6 text-blue-600" />} change="+2 new this month" />
        <StatCard title="Available Now" value={stats.available} icon={<Users className="w-6 h-6 text-green-600" />} change="85% capacity" />
        <StatCard title="Monthly Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={<Wallet className="w-6 h-6 text-indigo-600" />} change="+12.5% vs last month" />
        <StatCard title="Active Maintenance" value={MOCK_VANS.filter(v => v.status === VanStatus.MAINTENANCE).length} icon={<AlertCircle className="w-6 h-6 text-orange-600" />} change="Expected back: 2 days" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Utilization by Status</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Available', value: 4 },
                { name: 'Rented', value: 8 },
                { name: 'Maintenance', value: 2 },
                { name: 'Transit', value: 3 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{title: string, value: string | number, icon: React.ReactNode, change: string}> = ({ title, value, icon, change }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="bg-slate-50 p-3 rounded-xl">{icon}</div>
      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{change}</span>
    </div>
    <h4 className="text-slate-500 text-sm font-medium">{title}</h4>
    <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
  </div>
);
