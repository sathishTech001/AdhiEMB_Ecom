import { useState } from 'react';
import { 
  Search, 
  Eye, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RefreshCw, 
  X
} from 'lucide-react';
import { useAdminOrders, useUpdateOrderStatus } from '../hooks/useOrders';
import { Order, OrderStatus } from '../types/order.types';
import { formatCurrency } from '@/lib/utils';

export const AdminOrdersPage = () => {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusModalOrder, setStatusModalOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('COMPLETED');

  const { data: pagedData, isLoading, refetch } = useAdminOrders({
    status: activeTab === 'ALL' ? undefined : (activeTab as OrderStatus),
    search: searchTerm,
  });

  const updateStatusMutation = useUpdateOrderStatus();

  // Fallback data for admin demo display if API is empty
  const ordersList: Order[] = pagedData?.content?.length ? pagedData.content : [
    {
      id: 'ord-101',
      orderNumber: 'ORD-984210',
      userId: 'u101',
      customerName: 'Sarah Connor',
      customerEmail: 'sarah@example.com',
      customerPhone: '+1 555-0192',
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      paymentMethod: 'Razorpay',
      subtotal: 45.00,
      totalAmount: 45.00,
      createdAt: '2026-07-20T10:15:00Z',
      items: [
        {
          id: 'i1',
          productId: 'p1',
          productTitle: 'Royal Elephant Motif Pattern',
          format: 'DST',
          price: 25.00,
          quantity: 1,
          totalPrice: 25.00,
        },
        {
          id: 'i2',
          productId: 'p2',
          productTitle: 'Vintage Gold Lace Embroidery',
          format: 'PES',
          price: 20.00,
          quantity: 1,
          totalPrice: 20.00,
        },
      ],
    },
    {
      id: 'ord-102',
      orderNumber: 'ORD-984211',
      userId: 'u102',
      customerName: 'Alex Rivera',
      customerEmail: 'alex@example.com',
      customerPhone: '+1 555-0841',
      status: 'PROCESSING',
      paymentStatus: 'PAID',
      paymentMethod: 'Stripe',
      subtotal: 19.99,
      totalAmount: 19.99,
      createdAt: '2026-07-20T12:00:00Z',
      items: [
        {
          id: 'i3',
          productId: 'p3',
          productTitle: 'Peacock Feather Multi-Color Design',
          format: 'EMB',
          price: 19.99,
          quantity: 1,
          totalPrice: 19.99,
        },
      ],
    },
    {
      id: 'ord-103',
      orderNumber: 'ORD-984212',
      userId: 'u103',
      customerName: 'Marcus Vance',
      customerEmail: 'marcus@example.com',
      customerPhone: '+1 555-0321',
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentMethod: 'Razorpay',
      subtotal: 35.00,
      totalAmount: 35.00,
      createdAt: '2026-07-19T18:45:00Z',
      items: [
        {
          id: 'i4',
          productId: 'p4',
          productTitle: 'Floral Crest Embroidery Monogram',
          format: 'DST',
          price: 35.00,
          quantity: 1,
          totalPrice: 35.00,
        },
      ],
    },
  ];

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalOrder) return;

    await updateStatusMutation.mutateAsync({
      id: statusModalOrder.id,
      status: newStatus,
    });
    setStatusModalOrder(null);
    refetch();
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </span>
        );
      case 'CANCELLED':
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>{status}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>Order Management</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full">
              Admin Portal
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Monitor customer transactions, order statuses, and digital distribution logs.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Tabs & Search controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-2 md:pb-0">
          {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search order or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Loading order registry...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Items Count</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {ordersList.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {ord.orderNumber}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {ord.customerName || 'Anonymous'}
                      </div>
                      <div className="text-xs text-slate-500">{ord.customerEmail}</div>
                    </td>

                    <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">
                      {ord.items.length} {ord.items.length === 1 ? 'Design' : 'Designs'}
                    </td>

                    <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(ord.totalAmount)}
                    </td>

                    <td className="py-4 px-6">{getStatusBadge(ord.status)}</td>

                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 rounded-xl transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setStatusModalOrder(ord);
                          setNewStatus(ord.status);
                        }}
                        className="p-2 text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 rounded-xl transition-colors"
                        title="Update status"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-4">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Admin Order View</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-1">
                {selectedOrder.orderNumber}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold block uppercase">Customer</span>
                <p className="font-bold text-slate-900 dark:text-white">{selectedOrder.customerName}</p>
                <p className="text-slate-500">{selectedOrder.customerEmail}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold block uppercase">Payment</span>
                <p className="font-bold text-slate-900 dark:text-white">{selectedOrder.paymentMethod || 'Gateway'}</p>
                <p className="text-emerald-600 font-bold">{selectedOrder.paymentStatus}</p>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Items Breakdown</span>
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="p-3 border rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{item.productTitle}</p>
                    <p className="text-slate-500">Format: {item.format || 'DST'}</p>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-4">
            <button
              onClick={() => setStatusModalOrder(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Update Status for {statusModalOrder.orderNumber}
            </h3>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                  Select New Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalOrder(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateStatusMutation.isPending}
                  className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-md"
                >
                  {updateStatusMutation.isPending ? 'Updating...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
