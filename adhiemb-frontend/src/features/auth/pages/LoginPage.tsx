import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl container mx-auto flex flex-col lg:flex-row items-stretch justify-center gap-8 lg:gap-12 my-auto">
        
        {/* Left side - Brand/Hero Card (Visible on lg screens) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between gap-8 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-8 lg:p-10 rounded-3xl text-white shadow-2xl border border-indigo-700/50">
          <div className="flex flex-col gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/95 p-2 flex items-center justify-center shadow-xl shadow-indigo-950/40 border border-white/20">
              <img src="/logo-icon.png" alt="AdhiEMB" className="w-full h-full object-contain" />
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-indigo-200 text-xs font-semibold w-fit border border-white/10">
              AdhiEMB Digital Store
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-indigo-200">AdhiEMB</span>
            </h1>
            <p className="text-sm lg:text-base text-indigo-100/90 leading-relaxed font-normal">
              Your trusted source for professionally digitized embroidery machine files. Download high-density patterns ready for instant production.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
              <h3 className="font-bold text-sm text-white">Instant Machine Downloads</h3>
              <p className="text-xs text-indigo-100/80 leading-normal">Access .DST, .PES, .JEF, .EXP, and master .EMB files instantly.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
              <h3 className="font-bold text-sm text-white">Stitch-Tested Precision</h3>
              <p className="text-xs text-indigo-100/80 leading-normal">Pre-tested on commercial embroidery machines for zero breakage.</p>
            </div>
          </div>
        </div>

        {/* Right side - Form Card Container */}
        <div className="w-full lg:w-1/2 max-w-md mx-auto flex flex-col justify-center gap-6">
          <div className="flex flex-col gap-2 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-1">
              <img src="/logo-icon.png" alt="AdhiEMB Logo" className="w-14 h-14 object-contain rounded-xl shadow-md border border-slate-200 dark:border-slate-800 p-1 bg-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Sign in to your account
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <a href="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Register here
              </a>
            </p>
          </div>

          <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-6">
            <LoginForm />
          </div>
        </div>

      </div>
    </div>
  );
}
