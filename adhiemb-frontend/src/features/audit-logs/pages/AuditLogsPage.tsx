import { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Code2, 
  Sparkles
} from 'lucide-react';
import { AuditLog } from '../types/audit-log.types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-101',
    userName: 'Sathish Kumar',
    userEmail: 'admin@adhiemb.com',
    userRole: 'SUPER_ADMIN',
    action: 'UPDATE',
    module: 'SETTINGS',
    description: 'Updated Designer Commission percentage from 65% to 70%',
    ipAddress: '103.120.45.12',
    timestamp: '2026-07-20T14:25:00Z',
    changes: {
      before: { designerCommissionPercent: 65, minPayoutAmount: 1000 },
      after: { designerCommissionPercent: 70, minPayoutAmount: 1000 },
    },
  },
  {
    id: 'log-102',
    userName: 'Ananya Verma',
    userEmail: 'ananya.mod@adhiemb.com',
    userRole: 'MODERATOR',
    action: 'MODERATE',
    module: 'REVIEWS',
    description: 'Approved customer review #rev-2 for Royal Peacock Zari Motif',
    ipAddress: '49.207.180.89',
    timestamp: '2026-07-20T12:10:00Z',
    changes: {
      before: { reviewId: 'rev-2', status: 'PENDING' },
      after: { reviewId: 'rev-2', status: 'APPROVED' },
    },
  },
  {
    id: 'log-103',
    userName: 'Sathish Kumar',
    userEmail: 'admin@adhiemb.com',
    userRole: 'SUPER_ADMIN',
    action: 'PAYOUT',
    module: 'PAYMENTS',
    description: 'Disbursed monthly payout of ₹146,706 to Master Digitizers Studio',
    ipAddress: '103.120.45.12',
    timestamp: '2026-07-19T18:45:00Z',
    changes: {
      before: { payoutId: 'pay-1', status: 'PENDING' },
      after: { payoutId: 'pay-1', status: 'PAID', transactionRef: 'TXN-984920' },
    },
  },
  {
    id: 'log-104',
    userName: 'Rajesh Craftsman',
    userEmail: 'rajesh@example.com',
    userRole: 'DESIGNER',
    action: 'CREATE',
    module: 'PRODUCTS',
    description: 'Uploaded new digital embroidery design "Floral Border Neck Line"',
    ipAddress: '115.240.92.34',
    timestamp: '2026-07-18T16:20:00Z',
    changes: {
      before: null,
      after: {
        id: 102,
        title: 'Floral Border Neck Line',
        price: 349,
        formats: ['DST', 'EMB', 'PES'],
      },
    },
  },
  {
    id: 'log-105',
    userName: 'Sathish Kumar',
    userEmail: 'admin@adhiemb.com',
    userRole: 'SUPER_ADMIN',
    action: 'DELETE',
    module: 'USERS',
    description: 'Deactivated suspended bot account user_test_882',
    ipAddress: '103.120.45.12',
    timestamp: '2026-07-17T09:15:00Z',
    changes: {
      before: { id: 882, email: 'bot@spam.test', status: 'SUSPENDED' },
      after: { id: 882, status: 'DELETED' },
    },
  },
];

export function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = MOCK_AUDIT_LOGS.filter((log) => {
    const matchesModule = selectedModule === 'ALL' || log.module === selectedModule;
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    const matchesSearch =
      !searchTerm ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);
    return matchesModule && matchesAction && matchesSearch;
  });

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'CREATE':
        return <Badge variant="success">CREATE</Badge>;
      case 'UPDATE':
        return <Badge variant="info">UPDATE</Badge>;
      case 'DELETE':
        return <Badge variant="danger">DELETE</Badge>;
      case 'MODERATE':
        return <Badge variant="warning">MODERATE</Badge>;
      case 'PAYOUT':
        return <Badge variant="primary">PAYOUT</Badge>;
      default:
        return <Badge variant="default">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              System Audit Trail
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Sparkles className="h-3 w-3" /> Security Logs
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Immutable log of administrative changes, payout approvals, settings modifications, and role updates
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          {/* Module Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Module:</span>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Modules</option>
              <option value="SETTINGS">SETTINGS</option>
              <option value="PRODUCTS">PRODUCTS</option>
              <option value="PAYMENTS">PAYMENTS</option>
              <option value="REVIEWS">REVIEWS</option>
              <option value="USERS">USERS</option>
            </select>
          </div>

          {/* Action Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Action:</span>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="MODERATE">MODERATE</option>
              <option value="PAYOUT">PAYOUT</option>
            </select>
          </div>
        </div>

        <div className="w-full lg:w-80">
          <Input
            placeholder="Search by user, description or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-slate-400" />}
            className="h-10 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={<ShieldAlert className="h-12 w-12 text-slate-400" />}
          title="No Audit Logs Found"
          description="No security audit events match the specified filters."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4 text-right">Delta Viewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white leading-snug">
                          {log.userName}
                        </p>
                        <p className="text-xs text-slate-400">{log.userEmail}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">{getActionBadge(log.action)}</td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {log.module}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">
                      {log.description}
                    </td>

                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      {log.ipAddress}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {log.changes ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedLog(log)}
                          leftIcon={<Code2 className="h-4 w-4 text-indigo-600" />}
                          className="hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                        >
                          View JSON
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JSON Delta Viewer Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Delta: Log #${selectedLog.id}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800 space-y-1">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {selectedLog.action} on {selectedLog.module}
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {selectedLog.description}
              </p>
              <p className="text-xs text-slate-400">
                By {selectedLog.userName} ({selectedLog.userEmail}) at {new Date(selectedLog.timestamp).toLocaleString()}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-2">
                  State Before Change
                </span>
                <pre className="rounded-xl bg-slate-900 p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-60">
                  {JSON.stringify(selectedLog.changes?.before || {}, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-2">
                  State After Change
                </span>
                <pre className="rounded-xl bg-slate-900 p-4 text-xs font-mono text-amber-300 overflow-x-auto max-h-60">
                  {JSON.stringify(selectedLog.changes?.after || {}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
