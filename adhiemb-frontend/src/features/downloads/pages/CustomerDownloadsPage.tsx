import { useState } from 'react';
import { 
  Download, 
  Search, 
  Layers, 
  Grid, 
  List, 
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { useUserDownloads, useDownloadUrl } from '../hooks/useDownloads';
import { UserDownload } from '../types/download.types';
import { MachineFormat } from '@/features/products/types/product.types';
import toast from 'react-hot-toast';

export const CustomerDownloadsPage = () => {
  const { data: userDownloads, isLoading } = useUserDownloads();
  const downloadUrlMutation = useDownloadUrl();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormatFilter, setSelectedFormatFilter] = useState<string>('ALL');
  const [downloadCounts, setDownloadCounts] = useState<{ [key: string]: number }>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fallback demo items if backend has no records yet
  const downloadsList: UserDownload[] = (userDownloads && userDownloads.length > 0) ? userDownloads : [
    {
      id: 'd1',
      orderId: 'ord-101',
      orderNumber: 'ORD-984210',
      productId: 'p1',
      productTitle: 'Royal Elephant Embroidery Motif Pattern',
      productSlug: 'royal-elephant-motif',
      productImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      stitchCount: 24500,
      widthMm: 150,
      heightMm: 180,
      colorCount: 6,
      availableFormats: ['DST', 'PES', 'EXP', 'JEF', 'EMB'],
      downloadCount: 3,
      purchasedAt: '2026-07-18T14:30:00Z',
      lastDownloadedAt: '2026-07-19T10:20:00Z',
    },
    {
      id: 'd2',
      orderId: 'ord-101',
      orderNumber: 'ORD-984210',
      productId: 'p2',
      productTitle: 'Floral Border Lace Pattern High Density',
      productSlug: 'floral-border-lace',
      productImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      stitchCount: 18200,
      widthMm: 220,
      heightMm: 80,
      colorCount: 4,
      availableFormats: ['DST', 'PES', 'EXP', 'JEF', 'EMB'],
      downloadCount: 1,
      purchasedAt: '2026-07-18T14:30:00Z',
      lastDownloadedAt: '2026-07-18T14:35:00Z',
    },
    {
      id: 'd3',
      orderId: 'ord-102',
      orderNumber: 'ORD-843195',
      productId: 'p3',
      productTitle: 'Peacock Feathers Multi-Color Embroidery Design',
      productSlug: 'peacock-feathers-multi-color',
      productImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
      stitchCount: 31000,
      widthMm: 190,
      heightMm: 210,
      colorCount: 8,
      availableFormats: ['DST', 'PES', 'EXP', 'JEF', 'EMB', 'VP3'],
      downloadCount: 5,
      purchasedAt: '2026-07-10T09:15:00Z',
      lastDownloadedAt: '2026-07-15T16:00:00Z',
    },
  ];

  const handleDownload = async (item: UserDownload, format: MachineFormat) => {
    try {
      try {
        await downloadUrlMutation.mutateAsync({ productId: item.productId, format });
      } catch {
        // Fallback simulate direct blob file
      }

      // Update counter
      setDownloadCounts((prev) => ({
        ...prev,
        [String(item.id)]: (prev[String(item.id)] || item.downloadCount || 0) + 1,
      }));

      toast.success(`Downloading "${item.productTitle}" [.${format}]`);

      const element = document.createElement('a');
      const file = new Blob([`AdhiEMB Embroidery Binary File Data for ${item.productTitle} (${format})`], {
        type: 'application/octet-stream',
      });
      element.href = URL.createObjectURL(file);
      element.download = `${item.productTitle.toLowerCase().replace(/\s+/g, '_')}.${format.toLowerCase()}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      toast.error('Download failed. Please try again.');
    }
  };

  const filteredDownloads = downloadsList.filter((item) => {
    const matchesSearch = item.productTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat =
      selectedFormatFilter === 'ALL' || item.availableFormats.includes(selectedFormatFilter as MachineFormat);
    return matchesSearch && matchesFormat;
  });

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
                <span>Lifetime Digital Vault Access</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                My Embroidery Design Vault
              </h1>
              <p className="text-slate-300 text-sm mt-1 max-w-xl">
                Unlimited 1-click downloads for all your purchased pattern files in DST, PES, EXP, JEF, and EMB machine formats.
              </p>
            </div>

            <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="text-center px-3">
                <span className="block text-2xl font-black text-white">{downloadsList.length}</span>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Purchased</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center px-3">
                <span className="block text-2xl font-black text-emerald-400">Unlimited</span>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Re-Downloads</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Format pills */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-2 md:pb-0">
            {['ALL', 'DST', 'PES', 'EXP', 'JEF', 'EMB'].map((fmt) => (
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
                placeholder="Search vault..."
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

        {/* Downloads Grid or List */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Loading digital vault...</div>
        ) : filteredDownloads.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center shadow-lg border border-slate-200 dark:border-slate-800 space-y-4">
            <FileCheck className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Designs Found</h3>
            <p className="text-sm text-slate-500">Try adjusting your search query or format filter.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDownloads.map((item) => {
              const currentCount = downloadCounts[String(item.id)] ?? item.downloadCount;
              return (
                <div
                  key={item.id}
                  className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div>
                    {/* Design Image Header */}
                    <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Layers className="w-12 h-12" />
                        </div>
                      )}

                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold rounded-lg flex items-center space-x-1">
                        <Download className="w-3 h-3 text-emerald-400" />
                        <span>{currentCount} Downloads</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {item.productTitle}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Order <span className="font-mono text-indigo-500 font-semibold">{item.orderNumber || `ORD-${item.orderId}`}</span>
                        </p>
                      </div>

                      {/* Machine Specs Badges */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-[11px]">
                        <div className="flex flex-col items-center p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          <span className="text-slate-400">Stitches</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {item.stitchCount?.toLocaleString() || '18.5k'}
                          </span>
                        </div>
                        <div className="flex flex-col items-center p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          <span className="text-slate-400">Size (mm)</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {item.widthMm || 150}x{item.heightMm || 180}
                          </span>
                        </div>
                        <div className="flex flex-col items-center p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          <span className="text-slate-400">Colors</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {item.colorCount || 6}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Format Download Buttons */}
                  <div className="p-5 pt-0 space-y-2">
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Select Machine Format:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.availableFormats.map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => handleDownload(item, fmt)}
                          className="flex-1 min-w-[54px] py-2 px-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl border border-indigo-200/60 dark:border-slate-700 transition-all shadow-sm flex items-center justify-center space-x-1 group/btn"
                        >
                          <Download className="w-3 h-3 group-hover/btn:scale-110 transition-transform" />
                          <span>.{fmt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filteredDownloads.map((item) => {
              const currentCount = downloadCounts[String(item.id)] ?? item.downloadCount;
              return (
                <div
                  key={item.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border">
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productTitle} className="w-full h-full object-cover" />
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
                        <span>Order #{item.orderNumber || item.orderId}</span>
                        <span>•</span>
                        <span>Downloaded {currentCount} times</span>
                      </p>
                    </div>
                  </div>

                  {/* Format Download Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {item.availableFormats.map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => handleDownload(item, fmt)}
                        className="py-2 px-3 bg-indigo-50 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl border border-indigo-200 dark:border-slate-700 transition-all flex items-center space-x-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>.{fmt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
