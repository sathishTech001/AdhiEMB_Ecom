import React from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export const WelcomeCard: React.FC = () => {
  const { user } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-8 text-white shadow-xl">
      {/* Decorative background shapes */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="absolute top-1/2 right-1/4 h-32 w-32 -translate-y-1/2 rounded-full bg-emerald-400/20 blur-2xl animate-pulse" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {getGreeting()}, {user?.firstName || 'User'}!
            </h1>
            <Badge variant="success" className="bg-emerald-500/20 text-emerald-100 border-emerald-500/30">
              {typeof user?.role === 'object' ? user.role.name : (user?.role || 'User')}
            </Badge>
          </div>
          <p className="text-indigo-100 max-w-xl text-lg">
            Welcome back to AdhiEMB Dashboard. Here's what's happening with your projects today.
          </p>
        </div>
        
        <div className="flex flex-col items-start sm:items-end bg-black/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <span className="text-sm text-indigo-200 font-medium uppercase tracking-wider">Today's Date</span>
          <span className="text-xl font-semibold">{formatDate(new Date().toISOString())}</span>
        </div>
      </div>
    </div>
  );
};
