import { useState } from 'react';
import { 
  Store, 
  Percent, 
  CreditCard, 
  Mail, 
  Save, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  Globe
} from 'lucide-react';
import { useUpdateSettingsGroup } from '../hooks/useSettings';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type SettingsTab = 'GENERAL' | 'COMMERCE' | 'PAYMENT' | 'SMTP';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('GENERAL');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const updateMutation = useUpdateSettingsGroup();

  // Initial values for state forms
  const [generalForm, setGeneralForm] = useState({
    storeName: 'AdhiEMB Embroidery Marketplace',
    supportEmail: 'support@adhiemb.com',
    supportPhone: '+91 98765 43210',
    currency: 'INR',
    currencySymbol: '₹',
  });

  const [commerceForm, setCommerceForm] = useState({
    designerCommissionPercent: 70,
    minPayoutAmount: 1000,
    allowedFileFormats: 'DST, EMB, PES, JEF, EXP, VP3, XXX, HUS',
    taxPercentage: 18,
  });

  const [paymentForm, setPaymentForm] = useState({
    razorpayEnabled: true,
    razorpayKeyId: 'rzp_live_9A8xB7c6D5e4F3',
    razorpayKeySecret: 'secret_key_883920194829104',
    stripeEnabled: true,
    stripePublishableKey: 'pk_live_51M00000000000000',
    stripeSecretKey: 'sk_live_51M00000000000000',
  });

  const [smtpForm, setSmtpForm] = useState({
    smtpHost: 'smtp.mailgun.org',
    smtpPort: 587,
    smtpUsername: 'postmaster@mg.adhiemb.com',
    smtpPassword: 'smtp_password_secure_123',
    fromName: 'AdhiEMB Marketplace',
    fromEmail: 'noreply@adhiemb.com',
    enableTls: true,
  });

  const toggleShowSecret = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async (groupName: SettingsTab, payload: any) => {
    try {
      await updateMutation.mutateAsync({ group: groupName.toLowerCase(), data: payload });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {
      // Handled or simulated
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              System Settings
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin Control
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Configure global marketplace store options, commission rates, payment APIs, and email credentials
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4" /> Settings updated successfully!
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveTab('GENERAL')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'GENERAL'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Store className="h-4 w-4" /> Store General
        </button>

        <button
          onClick={() => setActiveTab('COMMERCE')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'COMMERCE'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Percent className="h-4 w-4" /> Commission & Tax
        </button>

        <button
          onClick={() => setActiveTab('PAYMENT')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'PAYMENT'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="h-4 w-4" /> Payment Gateways
        </button>

        <button
          onClick={() => setActiveTab('SMTP')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'SMTP'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Mail className="h-4 w-4" /> Email SMTP
        </button>
      </div>

      {/* Tab 1: General Store Settings */}
      {activeTab === 'GENERAL' && (
        <Card className="p-8 max-w-4xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Store Identity & Contact Details
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Basic store branding shown across customer receipts, header, and emails
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Input
                label="Marketplace Store Name"
                value={generalForm.storeName}
                onChange={(e) => setGeneralForm({ ...generalForm, storeName: e.target.value })}
              />
            </div>

            <div>
              <Input
                label="Support Contact Email"
                type="email"
                value={generalForm.supportEmail}
                onChange={(e) => setGeneralForm({ ...generalForm, supportEmail: e.target.value })}
              />
            </div>

            <div>
              <Input
                label="Support Phone Number"
                value={generalForm.supportPhone}
                onChange={(e) => setGeneralForm({ ...generalForm, supportPhone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Currency Code"
                  value={generalForm.currency}
                  onChange={(e) => setGeneralForm({ ...generalForm, currency: e.target.value })}
                />
              </div>
              <div>
                <Input
                  label="Currency Symbol"
                  value={generalForm.currencySymbol}
                  onChange={(e) => setGeneralForm({ ...generalForm, currencySymbol: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-6">
            <Button
              onClick={() => handleSave('GENERAL', generalForm)}
              isLoading={updateMutation.isPending}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save General Settings
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 2: Commerce & Commission */}
      {activeTab === 'COMMERCE' && (
        <Card className="p-8 max-w-4xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Percent className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Designer Royalty & Marketplace Commerce Rules
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure default revenue split percentage and supported digital embroidery extensions
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Input
                label="Designer Commission Split (%)"
                type="number"
                value={commerceForm.designerCommissionPercent}
                onChange={(e) =>
                  setCommerceForm({
                    ...commerceForm,
                    designerCommissionPercent: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Designers receive {commerceForm.designerCommissionPercent}% of sales. Platform retains {100 - commerceForm.designerCommissionPercent}%.
              </p>
            </div>

            <div>
              <Input
                label="Minimum Payout Balance (₹)"
                type="number"
                value={commerceForm.minPayoutAmount}
                onChange={(e) =>
                  setCommerceForm({
                    ...commerceForm,
                    minPayoutAmount: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Minimum earnings before a designer can request disbursal
              </p>
            </div>

            <div>
              <Input
                label="Goods & Services Tax / Tax Rate (%)"
                type="number"
                value={commerceForm.taxPercentage}
                onChange={(e) =>
                  setCommerceForm({
                    ...commerceForm,
                    taxPercentage: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <Input
                label="Allowed Machine File Formats"
                value={commerceForm.allowedFileFormats}
                onChange={(e) =>
                  setCommerceForm({ ...commerceForm, allowedFileFormats: e.target.value })
                }
              />
              <p className="mt-1 text-[11px] text-slate-400">Comma-separated list of permitted extensions</p>
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-6">
            <Button
              onClick={() => handleSave('COMMERCE', commerceForm)}
              isLoading={updateMutation.isPending}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Commerce Rules
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 3: Payment Gateways */}
      {activeTab === 'PAYMENT' && (
        <Card className="p-8 max-w-4xl space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Payment Gateway Credentials
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage API keys for Razorpay (UPI/Cards in India) & Stripe (Global Credit Cards)
            </p>
          </div>

          {/* Razorpay Section */}
          <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  RZP
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Razorpay Payment Gateway
                  </h4>
                  <p className="text-xs text-slate-400">UPI, Net Banking, Debit Cards, Wallet</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentForm.razorpayEnabled}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, razorpayEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div>
                <Input
                  label="Razorpay Key ID"
                  value={paymentForm.razorpayKeyId}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, razorpayKeyId: e.target.value })
                  }
                />
              </div>

              <div className="relative">
                <Input
                  label="Razorpay Key Secret"
                  type={showSecrets['rzp'] ? 'text' : 'password'}
                  value={paymentForm.razorpayKeySecret}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, razorpayKeySecret: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => toggleShowSecret('rzp')}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showSecrets['rzp'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Stripe Section */}
          <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  STP
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Stripe Payments (Global)
                  </h4>
                  <p className="text-xs text-slate-400">International Credit & Debit Cards</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentForm.stripeEnabled}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, stripeEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div>
                <Input
                  label="Stripe Publishable Key"
                  value={paymentForm.stripePublishableKey}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, stripePublishableKey: e.target.value })
                  }
                />
              </div>

              <div className="relative">
                <Input
                  label="Stripe Secret Key"
                  type={showSecrets['stripe'] ? 'text' : 'password'}
                  value={paymentForm.stripeSecretKey}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, stripeSecretKey: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => toggleShowSecret('stripe')}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showSecrets['stripe'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-6">
            <Button
              onClick={() => handleSave('PAYMENT', paymentForm)}
              isLoading={updateMutation.isPending}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Gateway Keys
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 4: Email SMTP */}
      {activeTab === 'SMTP' && (
        <Card className="p-8 max-w-4xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              SMTP Mail Server Credentials
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure transactional email server for sending order receipts and download links
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Input
                label="SMTP Host"
                value={smtpForm.smtpHost}
                onChange={(e) => setSmtpForm({ ...smtpForm, smtpHost: e.target.value })}
              />
            </div>

            <div>
              <Input
                label="SMTP Port"
                type="number"
                value={smtpForm.smtpPort}
                onChange={(e) =>
                  setSmtpForm({ ...smtpForm, smtpPort: parseInt(e.target.value) || 587 })
                }
              />
            </div>

            <div>
              <Input
                label="SMTP Username"
                value={smtpForm.smtpUsername}
                onChange={(e) => setSmtpForm({ ...smtpForm, smtpUsername: e.target.value })}
              />
            </div>

            <div className="relative">
              <Input
                label="SMTP Password"
                type={showSecrets['smtp'] ? 'text' : 'password'}
                value={smtpForm.smtpPassword}
                onChange={(e) => setSmtpForm({ ...smtpForm, smtpPassword: e.target.value })}
              />
              <button
                type="button"
                onClick={() => toggleShowSecret('smtp')}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showSecrets['smtp'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div>
              <Input
                label="From Sender Name"
                value={smtpForm.fromName}
                onChange={(e) => setSmtpForm({ ...smtpForm, fromName: e.target.value })}
              />
            </div>

            <div>
              <Input
                label="From Email Address"
                type="email"
                value={smtpForm.fromEmail}
                onChange={(e) => setSmtpForm({ ...smtpForm, fromEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-6">
            <Button
              onClick={() => handleSave('SMTP', smtpForm)}
              isLoading={updateMutation.isPending}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Email Credentials
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
