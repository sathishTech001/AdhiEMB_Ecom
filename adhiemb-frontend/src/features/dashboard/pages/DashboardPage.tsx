import { Users, ShoppingBag, CreditCard, DollarSign } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { useAuth } from '@/features/auth/context/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-purple-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <p className="mb-1 text-primary-100">{date}</p>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.firstName || 'Admin'}! 👋
          </h1>
          <p className="mt-2 max-w-xl text-primary-100">
            Here's what's happening with your store today. You have 3 new orders to review and 5 new users registered.
          </p>
        </div>
        
        {/* Decorative background shapes */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 right-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value="1,248"
          icon={<Users className="h-6 w-6" />}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Total Products"
          value="342"
          icon={<ShoppingBag className="h-6 w-6" />}
          trend={{ value: 2.1, isPositive: true }}
        />
        <StatCard
          title="Total Orders"
          value="85"
          icon={<CreditCard className="h-6 w-6" />}
          trend={{ value: 4.2, isPositive: false }}
        />
        <StatCard
          title="Revenue"
          value="$12,426"
          icon={<DollarSign className="h-6 w-6" />}
          trend={{ value: 8.4, isPositive: true }}
        />
      </div>

      {/* Recent Activity placeholder */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Orders</h2>
          <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-slate-500">Chart Placeholder</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {['Add New Product', 'Manage Users', 'View Reports', 'Store Settings'].map((action, i) => (
              <button 
                key={i}
                className="w-full flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 text-left hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="font-medium text-slate-700 dark:text-slate-200">{action}</span>
                <span className="text-primary-500">&rarr;</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
