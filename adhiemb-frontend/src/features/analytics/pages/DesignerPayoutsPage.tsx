import { useState } from 'react';
import { 
  IndianRupee, 
  Search, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { useDesignerPayouts, useProcessPayout } from '../hooks/useAnalytics';
import { DesignerPayout, PayoutStatus } from '../types/analytics.types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/feedback/PageLoader';
import { EmptyState } from '@/components/ui/EmptyState';

const MOCK_PAYOUTS: DesignerPayout[] = [
  {
    id: 'pay-1',
    designerId: 'des-101',
    designerName: 'Master Digitizers Studio',
    designerEmail: 'digitizers@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    totalSalesVolume: 420,
    grossRevenue: 209580,
    commissionPercentage: 70,
    designerEarnings: 146706,
    platformFee: 62874,
    status: 'PENDING',
    payoutMethod: 'Bank Transfer (HDFC)',
    period: 'July 2026',
  },
  {
    id: 'pay-2',
    designerId: 'des-102',
    designerName: 'Craftsman Embroidery Crafts',
    designerEmail: 'craftsman@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    totalSalesVolume: 390,
    grossRevenue: 136110,
    commissionPercentage: 70,
    designerEarnings: 95277,
    platformFee: 40833,
    status: 'PAID',
    payoutMethod: 'UPI (craftsman@okhdfc)',
    payoutDate: '2026-07-05T12:00:00Z',
    period: 'June 2026',
  },
  {
    id: 'pay-3',
    designerId: 'des-103',
    designerName: 'Zardozi Elite Motifs',
    designerEmail: 'zardozi.elite@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    totalSalesVolume: 215,
    grossRevenue: 171785,
    commissionPercentage: 70,
    designerEarnings: 120249.5,
    platformFee: 51535.5,
    status: 'PENDING',
    payoutMethod: 'Razorpay Auto-Payout',
    period: 'July 2026',
  },
  {
    id: 'pay-4',
    designerId: 'des-104',
    designerName: 'Ananya Boutique Patterns',
    designerEmail: 'ananya.designs@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    totalSalesVolume: 310,
    grossRevenue: 92690,
    commissionPercentage: 70,
    designerEarnings: 64883,
    platformFee: 27807,
    status: 'PAID',
    payoutMethod: 'Bank Transfer (ICICI)',
    payoutDate: '2026-07-01T10:30:00Z',
    period: 'June 2026',
  },
];

export function DesignerPayoutsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | 'ALL'>('ALL');

  const { data, isLoading } = useDesignerPayouts();
  const processPayout = useProcessPayout();

  const payoutsList = data?.data && data.data.length > 0 ? data.data : MOCK_PAYOUTS;

  const filteredPayouts = payoutsList.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      item.designerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.designerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.period.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPending = payoutsList
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.designerEarnings, 0);

  const totalPaid = payoutsList
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.designerEarnings, 0);

  const handleExportCSV = () => {
    const headers = [
      'Payout ID',
      'Designer Name',
      'Email',
      'Period',
      'Sales Volume',
      'Gross Revenue (INR)',
      'Designer Royalty (70%)',
      'Platform Fee (30%)',
      'Payout Method',
      'Status',
    ];

    const rows = filteredPayouts.map((p) => [
      p.id,
      `"${p.designerName}"`,
      p.designerEmail,
      p.period,
      p.totalSalesVolume,
      p.grossRevenue,
      p.designerEarnings,
      p.platformFee,
      `"${p.payoutMethod}"`,
      p.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `designer_payouts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: PayoutStatus) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success">Paid</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'PROCESSING':
        return <Badge variant="info">Processing</Badge>;
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
              Designer Payouts Portal
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Sparkles className="h-3 w-3" /> Royalty Settlement
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track designer commissions (70% split), process monthly earnings & export settlement logs
          </p>
        </div>

        <Button
          onClick={handleExportCSV}
          leftIcon={<FileSpreadsheet className="h-4 w-4" />}
          variant="secondary"
          className="shadow-sm"
        >
          Export CSV Log
        </Button>
      </div>

      {/* Commission Split Banner & Summary Stat Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Royalty Split Highlight Box */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Commission Architecture
            </span>
            <span className="rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-md">
              Automated 70/30
            </span>
          </div>

          <div className="mt-6 flex items-center justify-around gap-4 text-center">
            <div>
              <span className="text-3xl font-black text-emerald-400">70%</span>
              <span className="block text-xs font-semibold text-slate-300 mt-1">
                Designer Royalty
              </span>
            </div>
            <div className="h-10 w-px bg-indigo-700" />
            <div>
              <span className="text-3xl font-black text-indigo-300">30%</span>
              <span className="block text-xs font-semibold text-slate-300 mt-1">
                Platform Commission
              </span>
            </div>
          </div>

          <p className="mt-6 text-xs text-indigo-200/80 leading-relaxed border-t border-indigo-700/60 pt-4">
            * Royalties are calculated automatically upon order delivery. Settlement is disbursed via direct bank transfer or Razorpay Payouts.
          </p>
        </div>

        {/* Pending Payout Balance */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pending Disbursal
            </span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">
              ₹{totalPending.toLocaleString('en-IN')}
            </h3>
            <p className="mt-2 text-xs text-slate-500">
              Awaiting admin approval & payout execution
            </p>
          </div>
        </div>

        {/* Total Settled Payouts */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Disbursed (Paid)
            </span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              ₹{totalPaid.toLocaleString('en-IN')}
            </h3>
            <p className="mt-2 text-xs text-slate-500">
              Successfully transferred to designer accounts
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex items-center space-x-2">
          {(['ALL', 'PENDING', 'PAID'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                statusFilter === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {tab === 'ALL' ? 'All Payouts' : tab}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by designer name, email or month..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-slate-400" />}
            className="h-10 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Payouts Table */}
      {filteredPayouts.length === 0 ? (
        <EmptyState
          icon={<IndianRupee className="h-12 w-12 text-slate-400" />}
          title="No Payout Records Found"
          description="No designer payouts match your current search or filter criteria."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Designer</th>
                  <th className="px-6 py-4">Period</th>
                  <th className="px-6 py-4 text-right">Sales Vol</th>
                  <th className="px-6 py-4 text-right">Gross Rev</th>
                  <th className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400">
                    Designer (70%)
                  </th>
                  <th className="px-6 py-4 text-right">Fee (30%)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPayouts.map((payout) => (
                  <tr
                    key={payout.id}
                    className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {payout.avatarUrl ? (
                          <img
                            src={payout.avatarUrl}
                            alt={payout.designerName}
                            className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {payout.designerName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-snug">
                            {payout.designerName}
                          </p>
                          <p className="text-xs text-slate-400">{payout.designerEmail}</p>
                          <span className="inline-block mt-0.5 text-[10px] text-slate-500 font-medium">
                            {payout.payoutMethod}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                      {payout.period}
                    </td>

                    <td className="px-6 py-4 text-right font-medium text-slate-800 dark:text-slate-200">
                      {payout.totalSalesVolume} units
                    </td>

                    <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-white">
                      ₹{payout.grossRevenue.toLocaleString('en-IN')}
                    </td>

                    <td className="px-6 py-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{payout.designerEarnings.toLocaleString('en-IN')}
                    </td>

                    <td className="px-6 py-4 text-right text-xs text-slate-400">
                      ₹{payout.platformFee.toLocaleString('en-IN')}
                    </td>

                    <td className="px-6 py-4">{getStatusBadge(payout.status)}</td>

                    <td className="px-6 py-4 text-right">
                      {payout.status === 'PENDING' ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => processPayout.mutate(payout.id)}
                          isLoading={processPayout.isPending}
                          leftIcon={<Check className="h-3.5 w-3.5" />}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Disburse
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
