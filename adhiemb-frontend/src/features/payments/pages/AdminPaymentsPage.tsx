import { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  Code, 
  X, 
  RefreshCw, 
  Copy,
  Check
} from 'lucide-react';
import { useAdminPayments } from '../hooks/usePayments';
import { Payment } from '../types/payment.types';
import toast from 'react-hot-toast';

export const AdminPaymentsPage = () => {
  const { data: paymentsData, isLoading, refetch } = useAdminPayments();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGateway, setSelectedGateway] = useState<string>('ALL');
  const [inspectPayment, setInspectPayment] = useState<Payment | null>(null);
  const [copied, setCopied] = useState(false);

  // Normalize backend payload array or paged response
  const rawList: Payment[] = Array.isArray(paymentsData)
    ? paymentsData
    : (paymentsData as any)?.content || [];

  // Fallback demo data if no records exist in backend yet
  const paymentsList: Payment[] = rawList.length > 0 ? rawList : [
    {
      id: 'pay-101',
      transactionId: 'txn_rzp_984210x89a',
      orderId: 'ord-101',
      orderNumber: 'ORD-984210',
      customerName: 'Sarah Connor',
      customerEmail: 'sarah@example.com',
      gateway: 'RAZORPAY',
      amount: 45.00,
      currency: 'USD',
      status: 'PAID',
      createdAt: '2026-07-20T10:15:22Z',
      rawResponse: {
        razorpay_payment_id: 'pay_984210x89a',
        razorpay_order_id: 'order_K7x9a8sd',
        razorpay_signature: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        method: 'card',
        card: { last4: '4242', network: 'Visa' },
      },
    },
    {
      id: 'pay-102',
      transactionId: 'ch_stripe_3M8a2Kjsd90',
      orderId: 'ord-102',
      orderNumber: 'ORD-984211',
      customerName: 'Alex Rivera',
      customerEmail: 'alex@example.com',
      gateway: 'STRIPE',
      amount: 19.99,
      currency: 'USD',
      status: 'PAID',
      createdAt: '2026-07-20T12:00:15Z',
      rawResponse: {
        id: 'ch_stripe_3M8a2Kjsd90',
        object: 'charge',
        amount: 1999,
        captured: true,
        receipt_url: 'https://pay.stripe.com/receipts/acct_123/ch_123',
      },
    },
    {
      id: 'pay-103',
      transactionId: 'txn_test_card_7721',
      orderId: 'ord-103',
      orderNumber: 'ORD-984212',
      customerName: 'Marcus Vance',
      customerEmail: 'marcus@example.com',
      gateway: 'TEST_CARD',
      amount: 35.00,
      currency: 'USD',
      status: 'PENDING',
      createdAt: '2026-07-19T18:45:00Z',
      rawResponse: {
        test_mode: true,
        simulated_status: 'PENDING_VERIFICATION',
      },
    },
  ];

  const filteredPayments = paymentsList.filter((pay) => {
    const matchesSearch =
      pay.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pay.orderNumber && pay.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pay.customerName && pay.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGateway = selectedGateway === 'ALL' || pay.gateway === selectedGateway;
    return matchesSearch && matchesGateway;
  });

  const handleCopyPayload = (payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    toast.success('JSON Payload copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const getGatewayBadge = (gateway: string) => {
    switch (gateway) {
      case 'RAZORPAY':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200">
            Razorpay
          </span>
        );
      case 'STRIPE':
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-200">
            Stripe
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200">
            Instant Test Card
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>Payment Ledger</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full">
              Financial Audit
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Real-time transaction log across Razorpay, Stripe, and Test Card gateways.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          {['ALL', 'RAZORPAY', 'STRIPE', 'TEST_CARD'].map((gw) => (
            <button
              key={gw}
              onClick={() => setSelectedGateway(gw)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedGateway === gw
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {gw === 'ALL' ? 'All Gateways' : gw}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search txn ID, order #, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Loading ledger logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="py-4 px-6">Transaction ID</th>
                  <th className="py-4 px-6">Order Number</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Gateway</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Payload Inspector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {pay.transactionId}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(pay.createdAt).toLocaleString()}
                      </p>
                    </td>

                    <td className="py-4 px-6 font-mono text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
                      {pay.orderNumber || `ORD-${pay.orderId}`}
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-900 dark:text-white">{pay.customerName || 'N/A'}</p>
                      <p className="text-xs text-slate-500">{pay.customerEmail}</p>
                    </td>

                    <td className="py-4 px-6">{getGatewayBadge(pay.gateway)}</td>

                    <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">
                      ${pay.amount.toFixed(2)} <span className="text-xs font-normal text-slate-400">{pay.currency}</span>
                    </td>

                    <td className="py-4 px-6">
                      {pay.status === 'PAID' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PAID</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{pay.status}</span>
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setInspectPayment(pay)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                      >
                        <Code className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Inspect Payload</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payload Inspector Modal */}
      {inspectPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-4">
            <button
              onClick={() => setInspectPayment(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950 rounded-xl text-indigo-600">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Gateway Response Audit</h3>
                <p className="text-xs font-mono text-slate-500">{inspectPayment.transactionId}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Raw JSON Gateway Signature & Response</span>
              <button
                onClick={() => handleCopyPayload(inspectPayment.rawResponse || inspectPayment)}
                className="inline-flex items-center space-x-1 text-indigo-600 hover:underline font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Raw JSON'}</span>
              </button>
            </div>

            <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-80 border border-slate-800 shadow-inner">
              <pre>{JSON.stringify(inspectPayment.rawResponse || inspectPayment, null, 2)}</pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectPayment(null)}
                className="px-5 py-2.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
