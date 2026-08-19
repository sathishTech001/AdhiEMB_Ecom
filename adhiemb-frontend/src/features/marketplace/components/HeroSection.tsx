import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';


export const HeroSection: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-slate-900 min-h-[600px] flex items-center justify-center">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 opacity-80" />
      
      {/* Decorative floating shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
      <div className="absolute top-40 right-20 w-72 h-72 bg-emerald-500/20 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg">
          Premium Embroidery <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Designs for Your Business
          </span>
        </h1>
        
        <p className="mt-4 max-w-2xl text-xl text-slate-300 mx-auto mb-10">
          Browse thousands of ready-to-use embroidery machine files created by top designers. High quality, instant download, multiple formats.
        </p>

        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl flex items-center mb-10">
          <div className="pl-4">
            <Search className="h-6 w-6 text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search for florals, logos, monograms..." 
            className="w-full bg-transparent border-none text-white placeholder-slate-400 px-4 py-3 focus:outline-none focus:ring-0 text-lg"
          />
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-4 h-auto text-lg">
            Search
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white border-none h-14 px-8 text-lg rounded-xl shadow-lg shadow-emerald-500/30">
            Browse Designs
          </Button>
          <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 h-14 px-8 text-lg rounded-xl backdrop-blur-sm">
            Start Selling
          </Button>
        </div>
      </div>
    </div>
  );
};
