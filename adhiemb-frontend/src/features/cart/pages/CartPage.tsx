import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Tag, 
  Zap, 
  Sparkles, 
  FileCheck 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export const CartPage: React.FC = () => {
  const { items, subtotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isApplyingCode, setIsApplyingCode] = useState(false);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setIsApplyingCode(true);

    setTimeout(() => {
      if (promoCode.toUpperCase() === 'EMBROIDERY10' || promoCode.toUpperCase() === 'WELCOME10') {
        const discountAmount = subtotal * 0.1;
        setDiscount(discountAmount);
        toast.success('10% Promo Code Applied!');
      } else {
        toast.error('Invalid promo code. Try WELCOME10');
      }
      setIsApplyingCode(false);
    }, 600);
  };

  const grandTotal = Math.max(0, subtotal - discount);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Breadcrumb */}
        <div className="flex items-center space-x-3 text-sm text-slate-500 mb-8">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">Shopping Cart</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <span>Shopping Cart</span>
              <span className="text-sm font-semibold px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
                {items.length} {items.length === 1 ? 'Design' : 'Designs'}
              </span>
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Review your selected machine embroidery files before instant download checkout.
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear your cart?')) {
                  clearCart();
                }
              }}
              className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center shadow-xl border border-slate-100 dark:border-slate-800 max-w-2xl mx-auto my-12">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500/10 to-indigo-600/20 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <ShoppingBag className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your Cart is Currently Empty</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8 text-base">
              Looks like you haven't added any digital embroidery patterns to your cart yet. Explore thousands of high-density designs!
            </p>
            <Link
              to="/designs"
              className="inline-flex items-center space-x-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5" />
              <span>Browse Catalog</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                  <div className="col-span-6">Embroidery Design</div>
                  <div className="col-span-2 text-center">Format</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total Price</div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-6 sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Design Details */}
                      <div className="sm:col-span-6 flex items-start space-x-4 mb-4 sm:mb-0">
                        <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/80 dark:border-slate-700 flex-shrink-0">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productTitle}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <FileCheck className="w-8 h-8 stroke-1" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/designs/${item.productSlug}`}
                            className="text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
                          >
                            {item.productTitle}
                          </Link>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <Zap className="w-3 h-3" /> Instant Download
                            </span>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="mt-2 text-xs font-medium text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>

                      {/* Format Badge */}
                      <div className="sm:col-span-2 text-left sm:text-center mb-3 sm:mb-0">
                        <span className="inline-block px-2.5 py-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                          {item.selectedFormat || 'DST'}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="sm:col-span-2 flex items-center justify-start sm:justify-center mb-3 sm:mb-0">
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-semibold px-3 text-slate-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="sm:col-span-2 text-left sm:text-right">
                        <span className="text-base font-extrabold text-slate-900 dark:text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Link
                  to="/designs"
                  className="inline-flex items-center space-x-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200/80 dark:border-slate-800 sticky top-24">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  Order Summary
                </h3>

                {/* Promo Form */}
                <form onSubmit={handleApplyPromo} className="mb-6">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Promo Code
                  </label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="WELCOME10"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 uppercase"
                      />
                      <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    <button
                      type="submit"
                      disabled={isApplyingCode}
                      className="px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                    >
                      {isApplyingCode ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                </form>

                {/* Pricing Details */}
                <div className="space-y-3 text-sm border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Promo Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Digital Tax</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">$0.00</span>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-baseline">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">Total</span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full mt-6 py-4 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-base font-bold rounded-2xl shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2 transform hover:-translate-y-0.5"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Secure Checkout with 256-bit Encryption</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
                    <Zap className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span>Files available in customer vault immediately</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
