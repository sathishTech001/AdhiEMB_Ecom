import { Menu, Search } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { Input } from '@/components/ui/Input';

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 md:px-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="hidden md:block w-64">
          <Input 
            placeholder="Search..." 
            leftIcon={<Search className="h-4 w-4 text-slate-400" />}
            className="h-9 rounded-full bg-slate-100 border-transparent dark:bg-slate-800 text-xs"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Integrated Notification Bell */}
        <NotificationBell />
        
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
        
        <UserMenu />
      </div>
    </header>
  );
}
