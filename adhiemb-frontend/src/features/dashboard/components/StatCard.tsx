import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <Card className="hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
          
          {trend && (
            <div className="mt-2 flex items-center text-sm">
              <span
                className={cn(
                  'font-medium',
                  trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                )}
              >
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
              <span className="ml-2 text-slate-500 dark:text-slate-400">vs last month</span>
            </div>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 dark:from-primary-900/50 dark:to-primary-800/50 dark:text-primary-400 shadow-inner">
          {icon}
        </div>
      </div>
    </Card>
  );
}
