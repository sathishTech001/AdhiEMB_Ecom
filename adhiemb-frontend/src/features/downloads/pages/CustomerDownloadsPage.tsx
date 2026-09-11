import { useState } from 'react';
import { 
  Download, 
  Search, 
  Layers, 
  Grid, 
  List, 
  ShieldCheck,
  FileCheck,
  Clock,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { useUserDownloads, useDownloadFile } from '../hooks/useDownloads';
import { UserDownload, DownloadToken } from '../types/download.types';
import toast from 'react-hot-toast';

export const CustomerDownloadsPage = () => {
  const { data: userDownloads = [], isLoading, refetch } = useUserDownloads();
  const downloadMutation = useDownloadFile();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormatFilter, setSelectedFormatFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const downloadsList: UserDownload[] = Array.isArray(userDownloads) ? userDownloads : [];

  const handleDownloadToken = async (token: DownloadToken) => {
    try {
      toast.loading(`Downloading "${token.fileName}"...`, { id: token.token });
      await downloadMutation.mutateAsync({
        token: token.token,
        fileName: token.fileName,
      });
      toast.success(`Downloaded "${token.fileName}"!`, { id: token.token });
      refetch();
    } catch {
      toast.error(`Download failed for "${token.fileName}"`, { id: token.token });
    }
  };

  const filteredDownloads = downloadsList
    .map((item) => {
      const matchesSearch = item.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.orderNumber && item.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchingTokens = (item.tokens || []).filter((t) => {
        if (selectedFormatFilter === 'ALL') return true;
        return t.fileFormat?.toUpperCase() === selectedFormatFilter.toUpperCase();
      });

      if (!matchesSearch || matchingTokens.length === 0) return null;

      return {
        ...item,
        tokens: matchingTokens,
      };
    })
    .filter(Boolean) as UserDownload[];

  const totalTokensCount = downloadsList.reduce((acc, item) => acc + (item.tokens?.length || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-2xl border border-slate-800">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Lifetime Digital Access</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                My Embroidery Files Vault
              </h1>
              <p className="text-slate-300 text-sm mt-1 max-w-xl">
                Access and re-download your purchased machine files anytime with permanent, lifetime ownership.
              </p>
            </div>

            <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="text-center px-3">
                <span className="block text-2xl font-black text-white">{totalTokensCount}</span>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Purchased Files</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center px-3">
                <span className="block text-2xl font-black text-emerald-400">Lifetime</span>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Unlimited Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Format pills */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-2 md:pb-0">
            {['ALL', 'DST', 'PES', 'EXP', 'JEF', 'EMB', 'VP3', 'HUS'].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormatFilter(fmt)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedFormatFilter === fmt
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {fmt === 'ALL' ? 'All Formats' : `.${fmt}`}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Search purchased designs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* View Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Downloads Display */}
        {isLoading ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Loading your purchased files vault...</span>
          </div>
        ) : filteredDownloads.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center shadow-lg border border-slate-200 dark:border-slate-800 space-y-4">
            <FileCheck className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Machine Files Found</h3>
            <p className="text-sm text-slate-500">
              {downloadsList.length === 0
                ? "You haven't purchased any machine files yet. Complete an order to get instant lifetime access."
                : "No purchased files match your search query or format filter."}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDownloads.map((item) => (
              <div
                key={`${item.orderNumber}-${item.productId}`}
                className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div>
                  {/* Product Image Header */}
                  <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {item.primaryImageUrl ? (
                      <img
                        src={item.primaryImageUrl}
                        alt={item.productTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Layers className="w-12 h-12" />
                      </div>
                    )}

                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-900/90 backdrop-blur-md text-emerald-300 text-[11px] font-bold rounded-lg flex items-center space-x-1 border border-emerald-500/30">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>Lifetime Access</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {item.productTitle}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <span>Order <span className="font-mono text-indigo-500 font-semibold">{item.orderNumber}</span></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {item.purchasedAt ? new Date(item.purchasedAt).toLocaleDateString() : 'Paid'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Purchased Files List */}
                <div className="p-5 pt-0 space-y-3">
                  <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Purchased Machine Files ({item.tokens?.length || 0}):
                  </span>
                  
                  <div className="space-y-2">
                    {item.tokens.map((token) => (
                      <div
                        key={token.token}
                        className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-extrabold rounded-md uppercase">
                              {token.fileFormat}
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {token.machineInfo || token.fileName}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                            {token.fileName} • {token.downloadCount > 0 ? `${token.downloadCount} downloads` : 'Never downloaded'}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDownloadToken(token)}
                          disabled={downloadMutation.isPending}
                          className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center space-x-1.5 flex-shrink-0 disabled:opacity-50"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filteredDownloads.map((item) => (
              <div
                key={`${item.orderNumber}-${item.productId}`}
                className="p-6 space-y-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border">
                      {item.primaryImageUrl ? (
                        <img src={item.primaryImageUrl} alt={item.productTitle} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Layers className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {item.productTitle}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                        <span>Order <span className="font-mono font-bold text-indigo-500">{item.orderNumber}</span></span>
                        <span>•</span>
                        <span>Purchased: {item.purchasedAt ? new Date(item.purchasedAt).toLocaleDateString() : 'Paid'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Lifetime Download Granted</span>
                  </div>
                </div>

                {/* Machine files tokens for this product */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {item.tokens.map((token) => (
                    <div
                      key={token.token}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-extrabold rounded-md uppercase">
                            {token.fileFormat}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {token.machineInfo || token.fileName}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                          {token.fileName}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDownloadToken(token)}
                        disabled={downloadMutation.isPending}
                        className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1.5 flex-shrink-0 disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
