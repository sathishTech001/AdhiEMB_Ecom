import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  ShoppingBag, 
  CreditCard, 
  Star, 
  Info, 
  Trash2, 
  Search, 
  Check, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';
import { AppNotification, NotificationType } from '../types/notification.types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageLoader } from '@/components/feedback/PageLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'New Order Received!',
    message: 'Order #ORD-9821 containing 3 embroidery designs was successfully placed by Rajesh P.',
    type: 'ORDER',
    isRead: false,
    linkUrl: '/orders',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'notif-2',
    title: 'Designer Payout Processed',
    message: 'Royalty payout of ₹146,706 for July 2026 has been credited to Master Digitizers Studio.',
    type: 'PAYMENT',
    isRead: false,
    linkUrl: '/designer-payouts',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'notif-3',
    title: '5-Star Review Received',
    message: 'Ananya S. left a glowing 5-star review on "Royal Peacock Zari Embroidery Motif".',
    type: 'REVIEW',
    isRead: false,
    linkUrl: '/reviews',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: 'notif-4',
    title: 'System Security Update',
    message: 'All API keys and Razorpay payment gateway endpoints were updated to TLS 1.3 encryption.',
    type: 'SYSTEM',
    isRead: true,
    linkUrl: '/settings',
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
  },
  {
    id: 'notif-5',
    title: 'New Designer Registration',
    message: 'Designer account request submitted by Zardozi Elite Crafts awaiting category review.',
    type: 'SYSTEM',
    isRead: true,
    linkUrl: '/users',
    createdAt: new Date(Date.now() - 1000 * 60 * 2880).toISOString(),
  },
];

export function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<NotificationType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [localList, setLocalList] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);

  const navigate = useNavigate();
  const { data, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notificationsList = data?.data && data.data.length > 0 ? data.data : localList;

  const filteredNotifications = notificationsList.filter((item) => {
    const matchesTab = activeTab === 'ALL' || item.type === activeTab;
    const matchesSearch =
      !searchTerm ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleMarkOne = async (id: number | string) => {
    setLocalList((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await markAsRead.mutateAsync(id);
    } catch {
      // handled
    }
  };

  const handleMarkAll = async () => {
    setLocalList((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await markAllAsRead.mutateAsync();
    } catch {
      // handled
    }
  };

  const handleDeleteOne = (id: number | string) => {
    setLocalList((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'ORDER':
        return <ShoppingBag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
      case 'PAYMENT':
        return <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
      case 'REVIEW':
        return <Star className="h-5 w-5 text-amber-500 fill-amber-500" />;
      case 'SYSTEM':
      default:
        return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Notification Center
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Sparkles className="h-3 w-3" /> Live Activity Feed
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time updates regarding orders, designer payouts, reviews, and system alerts
          </p>
        </div>

        <Button
          onClick={handleMarkAll}
          leftIcon={<CheckCheck className="h-4 w-4" />}
          variant="secondary"
          className="shadow-sm"
        >
          Mark All as Read
        </Button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['ALL', 'ORDER', 'PAYMENT', 'REVIEW', 'SYSTEM'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {tab === 'ALL' ? 'All Alerts' : tab}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search notification messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-slate-400" />}
            className="h-10 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-12 w-12 text-slate-400" />}
          title="No Notifications Found"
          description="Your notification history is empty or matches no active search filter."
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                'group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl p-5 transition-all ring-1',
                notif.isRead
                  ? 'bg-white ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800'
                  : 'bg-indigo-50/50 ring-indigo-200/80 dark:bg-indigo-950/30 dark:ring-indigo-900/60 shadow-sm'
              )}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={cn(
                      'text-sm font-bold',
                      notif.isRead ? 'text-slate-900 dark:text-white' : 'text-indigo-950 dark:text-indigo-100'
                    )}>
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="h-2 w-2 rounded-full bg-indigo-600 inline-block" />
                    )}
                    <span className="text-[11px] text-slate-400 ml-auto sm:ml-0">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {notif.linkUrl && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      if (!notif.isRead) handleMarkOne(notif.id);
                      navigate(notif.linkUrl!);
                    }}
                    leftIcon={<ExternalLink className="h-3.5 w-3.5" />}
                  >
                    View Details
                  </Button>
                )}

                {!notif.isRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkOne(notif.id)}
                    leftIcon={<Check className="h-3.5 w-3.5 text-indigo-600" />}
                  >
                    Mark Read
                  </Button>
                )}

                <button
                  onClick={() => handleDeleteOne(notif.id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800 transition-colors"
                  title="Remove Notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
