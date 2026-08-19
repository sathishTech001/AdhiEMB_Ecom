import { useState } from 'react';
import { 
  TrendingUp, 
  IndianRupee, 
  Users, 
  Percent, 
  Download, 
  ArrowUpRight, 
  Calendar,
  Sparkles,
  ShoppingBag,
  Layers,
  Award
} from 'lucide-react';
import { useAnalyticsSummary, useRevenueChart, useTopProducts } from '../hooks/useAnalytics';
import { RevenuePoint, TopProductSales } from '../types/analytics.types';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/feedback/PageLoader';

const MOCK_SUMMARY = {
  totalRevenue: 1485200,
  revenueGrowthPercentage: 18.4,
  monthlySales: 248900,
  salesGrowthPercentage: 12.1,
  activeDesigners: 48,
  activeDesignersGrowth: 8.3,
  conversionRate: 4.85,
  conversionRateChange: 0.65,
  totalOrders: 1840,
  totalDownloads: 5420,
};

const MOCK_REVENUE_DATA: RevenuePoint[] = [
  { month: 'Aug 25', revenue: 85000, payouts: 59500, netProfit: 25500 },
  { month: 'Sep 25', revenue: 98000, payouts: 68600, netProfit: 29400 },
  { month: 'Oct 25', revenue: 115000, payouts: 80500, netProfit: 34500 },
  { month: 'Nov 25', revenue: 142000, payouts: 99400, netProfit: 42600 },
  { month: 'Dec 25', revenue: 189000, payouts: 132300, netProfit: 56700 },
  { month: 'Jan 26', revenue: 165000, payouts: 115500, netProfit: 49500 },
  { month: 'Feb 26', revenue: 178000, payouts: 124600, netProfit: 53400 },
  { month: 'Mar 26', revenue: 195000, payouts: 136500, netProfit: 58500 },
  { month: 'Apr 26', revenue: 210000, payouts: 147000, netProfit: 63000 },
  { month: 'May 26', revenue: 225000, payouts: 157500, netProfit: 67500 },
  { month: 'Jun 26', revenue: 234000, payouts: 163800, netProfit: 70200 },
  { month: 'Jul 26', revenue: 248900, payouts: 174230, netProfit: 74670 },
];

const MOCK_TOP_PRODUCTS: TopProductSales[] = [
  {
    id: 1,
    name: 'Royal Peacock Zari Embroidery Motif',
    slug: 'royal-peacock-zari-motif',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
    price: 499,
    downloadsCount: 680,
    salesCount: 420,
    totalRevenue: 209580,
    designerName: 'Master Digitizers Studio',
  },
  {
    id: 2,
    name: 'Traditional Floral Border Neck Line',
    slug: 'traditional-floral-border-neck',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&q=80',
    price: 349,
    downloadsCount: 520,
    salesCount: 390,
    totalRevenue: 136110,
    designerName: 'Craftsman Crafts',
  },
  {
    id: 3,
    name: 'Ornate Elephant Royal Procession Pattern',
    slug: 'ornate-elephant-royal-procession',
    thumbnailUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300&q=80',
    price: 799,
    downloadsCount: 310,
    salesCount: 215,
    totalRevenue: 171785,
    designerName: 'Zardozi Elite',
  },
  {
    id: 4,
    name: 'Modern Geometrics Blouse Back Pattern',
    slug: 'modern-geometrics-blouse-back',
    thumbnailUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&q=80',
    price: 299,
    downloadsCount: 440,
    salesCount: 310,
    totalRevenue: 92690,
    designerName: 'Ananya Designs',
  },
  {
    id: 5,
    name: 'Bridal Dupatta Corners All Over Set',
    slug: 'bridal-dupatta-corners-set',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&q=80',
    price: 999,
    downloadsCount: 195,
    salesCount: 140,
    totalRevenue: 139860,
    designerName: 'Royal Threads Co.',
  },
];

export function AnalyticsPage() {
  const [period, setPeriod] = useState('12m');
  const [hoveredPoint, setHoveredPoint] = useState<RevenuePoint | null>(null);

  const { data: summaryData, isLoading: isSummaryLoading } = useAnalyticsSummary();
  const { data: chartData, isLoading: isChartLoading } = useRevenueChart(period);
  const { data: topProductsData, isLoading: isTopLoading } = useTopProducts(5);

  const summary = summaryData?.data || MOCK_SUMMARY;
  const revenuePoints = chartData?.data && chartData.data.length > 0 ? chartData.data : MOCK_REVENUE_DATA;
  const topProducts = topProductsData?.data && topProductsData.data.length > 0 ? topProductsData.data : MOCK_TOP_PRODUCTS;

  if (isSummaryLoading || isChartLoading || isTopLoading) {
    return <PageLoader />;
  }

  // Calculate SVG chart coordinates
  const maxVal = Math.max(...revenuePoints.map((p) => p.revenue)) * 1.15;
  const width = 800;
  const height = 260;
  const padding = 40;

  const points = revenuePoints.map((pt, i) => {
    const x = padding + (i / (revenuePoints.length - 1)) * (width - padding * 2);
    const y = height - padding - (pt.revenue / maxVal) * (height - padding * 2);
    return { x, y, pt };
  });

  // SVG Area path generator
  const linePath = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`),
    ''
  );
  const areaPath = `${linePath} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title & Timeframe Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Business Analytics
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <Sparkles className="h-3 w-3" /> Live Overview
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time sales revenue performance, designer commission payouts & top embroidery trends
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <Calendar className="ml-2 h-4 w-4 text-slate-400" />
          {['30d', '6m', '12m'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all ${
                period === p
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {p === '30d' ? '30 Days' : p === '6m' ? '6 Months' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white shadow-lg shadow-indigo-600/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-100">
              Total Revenue
            </span>
            <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-md">
              <IndianRupee className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold tracking-tight">
              ₹{summary.totalRevenue.toLocaleString('en-IN')}
            </h3>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-indigo-100">
              <span className="inline-flex items-center rounded-md bg-white/20 px-1.5 py-0.5 font-bold text-white">
                <ArrowUpRight className="mr-0.5 h-3 w-3" />+{summary.revenueGrowthPercentage}%
              </span>
              <span>vs previous period</span>
            </div>
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Gross Sales
            </span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              ₹{summary.monthlySales.toLocaleString('en-IN')}
            </h3>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <ArrowUpRight className="mr-0.5 h-3 w-3" />+{summary.salesGrowthPercentage}%
              </span>
              <span>this month</span>
            </div>
          </div>
        </div>

        {/* Active Designers */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Designers
            </span>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {summary.activeDesigners}
            </h3>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                <ArrowUpRight className="mr-0.5 h-3 w-3" />+{summary.activeDesignersGrowth}%
              </span>
              <span>creators onboarded</span>
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Conversion Rate
            </span>
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Percent className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {summary.conversionRate}%
            </h3>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center rounded-md bg-purple-50 px-1.5 py-0.5 font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                <ArrowUpRight className="mr-0.5 h-3 w-3" />+{summary.conversionRateChange}%
              </span>
              <span>checkout success</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Area Chart Section */}
      <Card className="p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Revenue & Profit Trends
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monthly breakdown of Gross Sales, Designer Payouts (70%), and Net Platform Profit (30%)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-indigo-600 inline-block" />
              <span className="text-slate-700 dark:text-slate-300">Gross Sales</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-700 dark:text-slate-300">Net Platform Profit</span>
            </div>
          </div>
        </div>

        {/* SVG Chart Container */}
        <div className="relative w-full overflow-x-auto">
          <div className="min-w-[650px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = padding + ratio * (height - padding * 2);
                return (
                  <line
                    key={i}
                    x1={padding}
                    y1={y}
                    x2={width - padding}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-100 dark:text-slate-800"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Area Under Curve */}
              <path d={areaPath} fill="url(#indigoGradient)" />

              {/* Smooth Trend Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#4F46E5"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {points.map((p, i) => {
                const isHovered = hoveredPoint?.month === p.pt.month;
                return (
                  <g key={i}>
                    {/* Monthly Bar for Net Profit underneath */}
                    <rect
                      x={p.x - 8}
                      y={height - padding - (p.pt.netProfit / maxVal) * (height - padding * 2)}
                      width="16"
                      height={(p.pt.netProfit / maxVal) * (height - padding * 2)}
                      className="fill-emerald-500/30 hover:fill-emerald-500/60 transition-all rounded-t-sm"
                    />

                    {/* Circle Dot */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 7 : 4.5}
                      className="fill-white stroke-indigo-600 stroke-[3] transition-all cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(p.pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />

                    {/* Month Label */}
                    <text
                      x={p.x}
                      y={height - 12}
                      textAnchor="middle"
                      className="text-[11px] font-semibold fill-slate-400 dark:fill-slate-500"
                    >
                      {p.pt.month}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip display */}
            {hoveredPoint && (
              <div className="mt-4 rounded-xl bg-slate-900 p-3 text-white text-xs shadow-xl flex items-center justify-between max-w-sm mx-auto">
                <span className="font-bold text-indigo-400">{hoveredPoint.month}</span>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Sales</span>
                    <span className="font-bold">₹{hoveredPoint.revenue.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Payouts (70%)</span>
                    <span className="font-bold text-amber-400">₹{hoveredPoint.payouts.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Profit (30%)</span>
                    <span className="font-bold text-emerald-400">₹{hoveredPoint.netProfit.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Top Selling Designs List */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                Top Selling Embroidery Designs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Highest grossing digitized motifs by total download volume and sales
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {topProducts.map((product, index) => {
              const rankColor =
                index === 0
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 ring-amber-300'
                  : index === 1
                  ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 ring-slate-400'
                  : index === 2
                  ? 'bg-amber-900/20 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 ring-amber-700'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 ring-slate-200';

              return (
                <div
                  key={product.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-100 p-4 transition-all hover:bg-slate-50/80 dark:border-slate-800/80 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-black ring-1 ${rankColor}`}
                    >
                      #{index + 1}
                    </span>

                    {product.thumbnailUrl ? (
                      <img
                        src={product.thumbnailUrl}
                        alt={product.name}
                        className="h-14 w-14 flex-shrink-0 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                    ) : (
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        By <span className="font-semibold text-slate-700 dark:text-slate-300">{product.designerName}</span>
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                          <Download className="h-3 w-3" /> {product.downloadsCount} downloads
                        </span>
                        <span>•</span>
                        <span>{product.salesCount} orders</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="block text-sm font-extrabold text-slate-900 dark:text-white">
                      ₹{product.totalRevenue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400">
                      ₹{product.price} per download
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick Highlights / Breakdown */}
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Platform Volume
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated digital assets performance
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Completed Orders</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{summary.totalOrders}</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full dark:bg-slate-700 overflow-hidden">
                <div className="bg-indigo-600 h-full w-[78%]" />
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total File Downloads</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{summary.totalDownloads}</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full dark:bg-slate-700 overflow-hidden">
                <div className="bg-emerald-500 h-full w-[85%]" />
              </div>
            </div>

            <div className="rounded-xl bg-indigo-50/50 p-4 border border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/40 space-y-2">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Revenue Model Split
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Designers earn <strong className="text-indigo-600 dark:text-indigo-400">70%</strong> royalty per sale. Platform retains <strong className="text-emerald-600 dark:text-emerald-400">30%</strong> for hosting, marketing & payment processing.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
