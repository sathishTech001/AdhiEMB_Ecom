import { RegisterForm } from '../components/RegisterForm';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export function RegisterPage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-6 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 my-auto">
        
        {/* Left side - Hero Card */}
        <div className="w-full lg:w-1/2 max-w-xl flex flex-col gap-6 bg-gradient-to-br from-purple-900 via-indigo-900 to-indigo-950 p-6 sm:p-10 lg:p-12 rounded-3xl text-white shadow-2xl border border-purple-800/50">
          <div className="flex flex-col gap-4">
            <h1 className="text-[clamp(1.85rem,4vw,3.25rem)] font-black tracking-tight leading-tight">
              Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-indigo-200">AdhiEMB</span> Today
            </h1>
            <p className="text-[clamp(0.95rem,1.5vw,1.125rem)] text-indigo-100/90 leading-relaxed font-normal">
              Purchase premium digitized embroidery machine files directly. Create your free customer account in seconds.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2 text-sm text-indigo-100/90 font-medium">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Access to thousands of stitch-tested digital embroidery patterns</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Multi-format files included (.DST, .PES, .EXP, .JEF, .VP3, .XXX, .EMB)</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Secure 24/7 instant downloads from your personal Digital Vault</span>
            </div>
          </div>
        </div>

        {/* Right side - Form Container */}
        <div className="w-full lg:w-1/2 max-w-lg mx-auto flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center lg:text-left">
            <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-black tracking-tight text-slate-900 dark:text-white">
              Create an account
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Sign in instead
              </Link>
            </p>
          </div>

          <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-6">
            <RegisterForm />
          </div>
        </div>

      </div>
    </div>
  );
}
