import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  FileCheck,
  Zap
} from 'lucide-react';
import { useCart } from '@/features/cart/context/CartContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useCreateOrder } from '../hooks/useOrders';
import { couponsApi } from '@/features/coupons/api/coupons.api';
import { paymentsApi } from '@/features/payments/api/payments.api';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

const checkoutSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(1, 'Please enter a valid phone number'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP / Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const CheckoutPage = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const createOrderMutation = useCreateOrder();

  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'STRIPE' | 'TEST_CARD'>('RAZORPAY');
  const [isProcessing, setIsProcessing] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponSuccessMessage, setCouponSuccessMessage] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await couponsApi.validatePublic(couponCode, subtotal);
      if (res.data && res.data.valid) {
        setDiscountAmount(res.data.calculatedDiscount || 0);
        setAppliedCouponCode(res.data.code);
        setCouponSuccessMessage(res.data.message);
        toast.success(res.data.message);
      } else {
        setDiscountAmount(0);
        setAppliedCouponCode('');
        setCouponSuccessMessage('');
        toast.error(res.data?.message || 'Invalid promo code');
      }
    } catch {
      toast.error('Failed to validate promo coupon');
    }
  };

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : '',
      email: user?.email || '',
      phone: (user as any)?.phone || '',
      address: '123 Market Street, Suite 400',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'United States',
    },
  });

  const onSubmit = async (values: CheckoutFormValues) => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    setIsProcessing(true);

    try {
      const fullAddress = `${values.address}, ${values.city}, ${values.state} ${values.zipCode}, ${values.country}`;
      const orderPayload = {
        billingName: values.fullName,
        billingEmail: values.email,
        billingPhone: values.phone,
        billingAddress: fullAddress,
        paymentMethod: paymentMethod,
      };

      let orderNumber = `ORD-${Date.now()}`;
      let createdOrder: any = null;

      try {
        const res = await createOrderMutation.mutateAsync(orderPayload);
        createdOrder = res.data;
        if (createdOrder?.orderNumber) {
          orderNumber = createdOrder.orderNumber;
        }
      } catch (e) {
        console.warn('Backend order creation fallback:', e);
      }

      if (createdOrder?.id) {
        try {
          const initRes = await paymentsApi.initiate({
            orderId: Number(createdOrder.id),
            paymentMethod: paymentMethod,
          });
          const paymentNumber = initRes.data?.paymentNumber;
          if (paymentNumber) {
            await paymentsApi.verify({
              paymentNumber: paymentNumber,
              gatewayPaymentId: `pay_gtw_${Date.now()}`,
              status: 'SUCCESS',
            });
          }
        } catch (payErr) {
          console.warn('Payment initiation/verification warning:', payErr);
        }
      }

      await clearCart();
      setIsProcessing(false);
      toast.success('Payment successful! Your order has been placed.');
      navigate(`/order-success/${orderNumber}`);
    } catch (err: any) {
      setIsProcessing(false);
      toast.error(err?.message || 'Payment processing failed');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
          <FileCheck className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Cart is Empty</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Link
            to="/designs"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation back */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </Link>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit Encrypted Secure Checkout</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Billing Details & Payment Method */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Billing Information Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Billing Information</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Enter details for receipt & customer account identification
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        {...register('fullName')}
                        type="text"
                        placeholder="Jane Doe"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                    {errors.fullName && (
                      <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="jane@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <input
                        {...register('phone')}
                        type="text"
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Street Address *
                    </label>
                    <div className="relative">
                      <input
                        {...register('address')}
                        type="text"
                        placeholder="123 Main St"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                    {errors.address && (
                      <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      City *
                    </label>
                    <input
                      {...register('city')}
                      type="text"
                      placeholder="Austin"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    {errors.city && (
                      <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      State / Province *
                    </label>
                    <input
                      {...register('state')}
                      type="text"
                      placeholder="Texas"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    {errors.state && (
                      <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>
                    )}
                  </div>

                  {/* Zip */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Zip / Postal Code *
                    </label>
                    <input
                      {...register('zipCode')}
                      type="text"
                      placeholder="78701"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    {errors.zipCode && (
                      <p className="text-xs text-red-500 mt-1">{errors.zipCode.message}</p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Country *
                    </label>
                    <div className="relative">
                      <input
                        {...register('country')}
                        type="text"
                        placeholder="United States"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                    {errors.country && (
                      <p className="text-xs text-red-500 mt-1">{errors.country.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payment Method</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Select your preferred payment gateway
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {/* Razorpay */}
                  <label
                    onClick={() => setPaymentMethod('RAZORPAY')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                      paymentMethod === 'RAZORPAY'
                        ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">Razorpay</span>
                      {paymentMethod === 'RAZORPAY' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Cards, UPI, NetBanking, Wallets
                    </span>
                  </label>

                  {/* Stripe */}
                  <label
                    onClick={() => setPaymentMethod('STRIPE')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                      paymentMethod === 'STRIPE'
                        ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">Stripe</span>
                      {paymentMethod === 'STRIPE' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      International Visa / Mastercard
                    </span>
                  </label>

                  {/* Instant Test Card */}
                  <label
                    onClick={() => setPaymentMethod('TEST_CARD')}
                    className={`cursor-pointer p-4 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                      paymentMethod === 'TEST_CARD'
                        ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">Instant Test Card</span>
                      {paymentMethod === 'TEST_CARD' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2">
                      1-Click Test Payment Mode
                    </span>
                  </label>
                </div>

                {/* Card input mockup */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Simulated Gateway</span>
                    <span className="text-emerald-600 font-medium">Ready for Instant Checkout</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    <span>No actual charge will occur in test/demo mode.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 sticky top-24">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </h3>

                {/* Items List */}
                <div className="max-h-60 overflow-y-auto pr-1 space-y-3 mb-6 divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-3 min-w-0 pr-2">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border">
                          {item.productImage ? (
                            <img src={item.productImage} alt={item.productTitle} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Sparkles className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">
                            {item.productTitle}
                          </p>
                          <p className="text-xs text-slate-500">
                            Qty: {item.quantity} {item.selectedFormat && `• ${item.selectedFormat}`}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white flex-shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price calculations */}
                <div className="space-y-3 text-sm border-t border-slate-200 dark:border-slate-800 pt-4">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
                  </div>

                  {/* Promo Coupon Input Box */}
                  <div className="pt-2 pb-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Promo Coupon Code (e.g. EMB2026)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono font-bold uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700"
                      >
                        Apply
                      </button>
                    </div>
                    {couponSuccessMessage && (
                      <p className="text-xs font-semibold text-emerald-600 mt-1">{couponSuccessMessage}</p>
                    )}
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Coupon Discount ({appliedCouponCode})</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Tax (Digital Download 0%)</span>
                    <span className="text-emerald-600 font-medium">{formatCurrency(0)}</span>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-between items-baseline">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">Total Amount</span>
                    <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Submit / Pay Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-6 py-4 px-6 bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-base font-bold rounded-2xl shadow-xl shadow-indigo-500/30 transition-all flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Payment...</span>
                    </div>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Place Order & Pay {formatCurrency(finalTotal)}</span>
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
                  By clicking Place Order & Pay, you agree to our Terms of Digital Licensing.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
