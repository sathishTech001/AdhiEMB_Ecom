import React from 'react';
import { Layers, Award, ShieldCheck, Clock } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-20">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-950 py-24 px-4 text-center relative overflow-hidden text-white">
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Elevating Digital Embroidery Precision</h1>
          <p className="text-lg md:text-xl text-indigo-200 font-normal leading-relaxed">
            AdhiEMB is a specialized digital embroidery company delivering professionally digitized, stitch-tested machine files directly to embroiderers worldwide.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Stitch-Tested Designs', value: '5,000+', icon: Award },
            { label: 'Embroidery Machine Formats', value: '7 Formats', icon: Layers },
            { label: 'Commercial Production License', value: 'Included', icon: ShieldCheck },
            { label: 'Instant File Delivery', value: '24/7 Access', icon: Clock },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-8 h-8 mx-auto text-indigo-500 mb-3" />
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="container mx-auto px-4 mt-20 max-w-4xl text-center space-y-6">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Our Quality Commitment</h2>
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Flawless embroidery requires flawless machine files. At AdhiEMB, every digital pattern is crafted by experienced digitizers and thoroughly tested on commercial machines to ensure optimal density, minimal thread stops, and pristine final embroidery output.
        </p>
      </div>
    </div>
  );
};
