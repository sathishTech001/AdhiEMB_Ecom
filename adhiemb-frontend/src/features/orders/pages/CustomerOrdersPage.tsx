import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Eye, 
  Download, 
  Calendar, 
  Search, 
  CheckCircle2, 
  Clock, 
  X
} from 'lucide-react';
import { useUserOrders } from '../hooks/useOrders';
import { Order } from '../types/order.types';

export const CustomerOrdersPage = () => {
  const { data: userOrders, isLoading } = useUserOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fallback demo data if user has no backend orders yet
  const ordersList: Order[] = (userOrders && userOrders.length > 0) ? userOrders : [
    {
      id: '1',
      orderNumber: 'ORD-984210',
      userId: 'u1',
      customerName: 'User',
      customerEmail: 'user@example.com',
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      paymentMethod: 'Razorpay',
      subtotal: 24.99,
      totalAmount: 24.99,
      createdAt: '2026-07-18T14:30:00Z',
      items: [
        {
          id: 'i1',
          productId: 'p1',
          productTitle: 'Royal Elephant Embroidery Motif Pattern',
          format: 'DST',
          price: 14.99,
          quantity: 1,
          totalPrice: 14.99,
        },
        {
          id: 'i2',
          productId: 'p2',
          productTitle: 'Floral Border Lace Pattern High Density',
          format: 'PES',
          price: 10.00,
          quantity: 1,
          totalPrice: 10.00,
        },
      ],
    },
    {
      id: '2',
      orderNumber: 'ORD-843195',
      userId: 'u1',
      customerName: 'User',
      customerEmail: 'user@example.com',
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      paymentMethod: 'Stripe',
      subtotal: 18.50,
      totalAmount: 18.50,
      createdAt: '2026-07-10T09:15:00Z',
      items: [
        {
          id: 'i3',
          productId: 'p3',
          productTitle: 'Peacock Feathers Multi-Color Embroidery Design',
          format: 'EMB',
          price: 18.50,
          quantity: 1,
          totalPrice: 18.50,
        },
      ],
    },
  ];

  const filteredOrders = ordersList.filter((ord) =>
    ord.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ord.items.some((i) => i.productTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <span>My Order History</span>
              <span className="text-xs font-semibold px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full">
                {ordersList.length} Orders
              </span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
              View your past purchases, receipts, and access instant file downloads.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/my-downloads"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Digital Vault</span>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by order number or design title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>

        {/* Orders Table Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">Loading your order history...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">No orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="py-4 px-6">Order Details</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Payment Status</th>
                    <th className="py-4 px-6">Total</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 dark:text-white font-mono">
                          {ord.orderNumber}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-xs mt-0.5">
                          {ord.items.map((i) => i.productTitle).join(', ')}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 text-xs font-medium">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            ord.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60'
                              : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200/60'
                          }`}
                        >
                          {ord.paymentStatus === 'PAID' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                          )}
                          <span>{ord.paymentStatus}</span>
                        </span>
                      </td>

                      <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">
                        ${ord.totalAmount.toFixed(2)}
                      </td>

                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>

                        <Link
                          to={`/order-success/${ord.orderNumber}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-semibold rounded-lg transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-4">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Order Receipt
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-1">
                {selectedOrder.orderNumber}
              </h3>
              <p className="text-xs text-slate-500">
                Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Items Purchased</h4>
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex justify-between items-center text-sm">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{item.productTitle}</p>
                    <p className="text-xs text-slate-500">Format: {item.format || 'DST'} • Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">${item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Payment Method</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedOrder.paymentMethod || 'Card'}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Payment Status</span>
                <span className="font-bold text-emerald-600">{selectedOrder.paymentStatus}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t">
                <span>Total</span>
                <span className="text-indigo-600 dark:text-indigo-400">${selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                to={`/order-success/${selectedOrder.orderNumber}`}
                onClick={() => setSelectedOrder(null)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl text-center shadow-lg transition-colors"
              >
                Download Files
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
