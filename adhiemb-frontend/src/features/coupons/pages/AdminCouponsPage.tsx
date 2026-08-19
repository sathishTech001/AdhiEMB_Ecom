import { useState } from 'react';
import { Ticket, Plus, Trash2, Tag, Percent, DollarSign, CheckCircle2 } from 'lucide-react';
import { useCouponsQuery, useCreateCoupon, useDeleteCoupon } from '../hooks/useCoupons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { DiscountType } from '../types/coupon.types';

export function AdminCouponsPage() {
  const { data: coupons = [], isLoading } = useCouponsQuery();
  const createCoupon = useCreateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('15');
  const [minOrderAmount, setMinOrderAmount] = useState('10');
  const [usageLimit, setUsageLimit] = useState('500');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    createCoupon.mutate(
      {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue) || 0,
        minOrderAmount: parseFloat(minOrderAmount) || 0,
        usageLimit: parseInt(usageLimit) || 1000,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setCode('');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
        <p className="text-slate-500 text-sm mt-4 font-medium">Loading promo coupons...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-indigo-200 text-xs font-semibold border border-white/10">
            <Ticket className="w-4 h-4 text-emerald-400" />
            <span>Promotional Engine</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Coupon & Discount Management</h1>
          <p className="text-indigo-100/80 text-sm max-w-xl">
            Create and manage promotional discount codes for digital marketplace checkout.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg"
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Create New Coupon
        </Button>
      </div>

      {/* Coupons Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-lg font-black text-slate-900 dark:text-white tracking-wider uppercase">
                      {coupon.code}
                    </span>
                    <Badge variant={coupon.isActive ? 'success' : 'default'} className="ml-2">
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <button
                  onClick={() => deleteCoupon.mutate(coupon.id)}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">Discount Value</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% OFF` : `$${coupon.discountValue} OFF`}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">Min Order Spend</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    ${coupon.minOrderAmount || '0.00'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Used: {coupon.usedCount} / {coupon.usageLimit || '∞'}
              </span>
              <span>
                {coupon.expiresAt ? `Expires: ${new Date(coupon.expiresAt).toLocaleDateString()}` : 'Never expires'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Promo Coupon">
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <Input
            label="Coupon Code"
            placeholder="e.g. EMB2026"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="uppercase"
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Discount Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDiscountType('PERCENTAGE')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-sm transition-all ${
                  discountType === 'PERCENTAGE'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                    : 'border-slate-200 text-slate-600 dark:border-slate-700'
                }`}
              >
                <Percent className="w-4 h-4" /> Percentage OFF
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('FIXED_AMOUNT')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-sm transition-all ${
                  discountType === 'FIXED_AMOUNT'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                    : 'border-slate-200 text-slate-600 dark:border-slate-700'
                }`}
              >
                <DollarSign className="w-4 h-4" /> Fixed Amount OFF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={discountType === 'PERCENTAGE' ? 'Discount %' : 'Discount ($)'}
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              required
            />
            <Input
              label="Min Spend ($)"
              type="number"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
            />
          </div>

          <Input
            label="Usage Limit (Count)"
            type="number"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
          />

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold" isLoading={createCoupon.isPending}>
              Create Coupon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
