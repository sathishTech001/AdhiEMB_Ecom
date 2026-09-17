import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Logo */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
                <img src="/logo-icon.png" alt="AdhiEMB" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-white tracking-tight leading-none">
                  AdhiEMB
                </span>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-tight mt-0.5">
                  Embroidery Hub
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Premium digital embroidery patterns crafted with industrial precision. Stitch-tested and ready for production on commercial and home embroidery machines.
            </p>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">DST</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">PES</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">EMB</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">JEF</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">EXP</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Marketplace</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/designs" className="hover:text-white transition-colors">Browse Designs</Link></li>
              <li><Link to="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Account & Help</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/downloads" className="hover:text-white transition-colors">My Downloads</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} AdhiEMB Embroidery Hub. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/terms" className="hover:text-slate-400">Terms</Link>
            <Link to="/privacy" className="hover:text-slate-400">Privacy Policy</Link>
            <Link to="/license" className="hover:text-slate-400">Embroidery Licensing</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
