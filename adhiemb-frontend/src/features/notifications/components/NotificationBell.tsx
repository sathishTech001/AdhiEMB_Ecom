import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  ShoppingBag, 
  CreditCard, 
  Star, 
  Info, 
  ExternalLink
} from 'lucide-react';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';
import { AppNotification, NotificationType } from '../types/notification.types';
import { cn } from '@/lib/utils';

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'New Order Received!',
    message: 'Order #ORD-9821 containing 3 embroidery designs was successfully placed by Rajesh P.',
    type: 'ORDER',
    isRead: false,
    linkUrl: '/orders',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  },
  {
    id: 'notif-2',
    title: 'Designer Payout Processed',
    message: 'Royalty payout of ₹146,706 for July 2026 has been credited to Master Digitizers Studio.',
    type: 'PAYMENT',
    isRead: false,
    linkUrl: '/designer-payouts',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
  },
  {
    id: 'notif-3',
    title: '5-Star Review Received',
    message: 'Ananya S. left a glowing 5-star review on "Royal Peacock Zari Embroidery Motif".',
    type: 'REVIEW',
    isRead: false,
    linkUrl: '/reviews',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
  },
  {
    id: 'notif-[#4]',
    title: 'System Security Update',
    message: 'All API keys and Razorpay payment gateway endpoints were updated to TLS 1.3.',
    type: 'SYSTEM',
    isRead: true,
    linkUrl: '/settings',
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), // 1 day ago
  },
];

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: notificationsData } = useNotifications();
  const { data: unreadData } = useUnreadCount();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const apiNotifications = notificationsData?.data;
  const notificationsList = apiNotifications && apiNotifications.length > 0 
    ? apiNotifications 
    : localNotifications;

  const unreadCount = unreadData?.data?.count !== undefined 
    ? unreadData.data.count 
    : notificationsList.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkOneRead = async (id: number | string, linkUrl?: string) => {
    setLocalNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await markAsReadMutation.mutateAsync(id);
    } catch {
      // handled
    }
    if (linkUrl) {
      setIsOpen(false);
      navigate(linkUrl);
    }
  };

  const handleMarkAllRead = async () => {
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch {
      // handled
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'ORDER':
        return <ShoppingBag className="h-4 w-4 text-emerald-500" />;
      case 'PAYMENT':
        return <CreditCard className="h-4 w-4 text-indigo-500" />;
      case 'REVIEW':
        return <Star className="h-4 w-4 text-amber-500 fill-amber-500" />;
      case 'SYSTEM':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 origin-top-right rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-slate-900 dark:ring-slate-800 animate-scaleIn z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notificationsList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No notifications right now
              </div>
            ) : (
              notificationsList.slice(0, 5).map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkOneRead(notif.id, notif.linkUrl)}
                  className={cn(
                    'group flex items-start gap-3 p-3.5 text-left transition-colors cursor-pointer',
                    notif.isRead
                      ? 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                      : 'bg-indigo-50/40 hover:bg-indigo-50/70 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40'
                  )}
                >
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:ring-slate-700">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className={cn(
                        'text-xs font-bold truncate',
                        notif.isRead ? 'text-slate-800 dark:text-slate-200' : 'text-indigo-950 dark:text-indigo-200'
                      )}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>

                  {!notif.isRead && (
                    <span className="h-2 w-2 flex-shrink-0 rounded-full bg-indigo-600 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 p-2.5 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-900/50">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              <span>View All Notifications</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
