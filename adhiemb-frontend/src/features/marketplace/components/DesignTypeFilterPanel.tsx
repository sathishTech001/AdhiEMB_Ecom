import React, { useState } from 'react';
import { DESIGN_TYPES } from '@/features/products/types/product.types';
import { Layers, ChevronDown, ChevronUp, Check, X, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface DesignTypeFilterPanelProps {
  selectedDesignType: string;
  onSelectDesignType: (designType: string) => void;
}

export const DesignTypeFilterPanel: React.FC<DesignTypeFilterPanelProps> = ({
  selectedDesignType,
  onSelectDesignType,
}) => {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const handleSelect = (type: string) => {
    onSelectDesignType(type);
    setIsMobileExpanded(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Design Type</h3>
            <p className="text-[11px] text-slate-400 font-medium">Filter embroidery style</p>
          </div>
        </div>

        {/* Clear Filter Button (desktop & mobile) */}
        {selectedDesignType && (
          <button
            type="button"
            onClick={() => handleSelect('')}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-1 rounded-lg transition-colors"
            title="Clear design type filter"
          >
            <X className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}

        {/* Mobile Toggle Button */}
        <button
          type="button"
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle Design Types"
        >
          {isMobileExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Selected Indicator for Mobile when collapsed */}
      <div className="lg:hidden px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">Current Selection:</span>
        <Badge variant={selectedDesignType ? 'primary' : 'default'} className="font-semibold">
          {selectedDesignType || 'All Design Types'}
        </Badge>
      </div>

      {/* Filter Options List */}
      <div
        className={`p-3 space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto ${
          isMobileExpanded ? 'block' : 'hidden lg:block'
        }`}
      >
        {/* Option: All Design Types */}
        <button
          type="button"
          onClick={() => handleSelect('')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
            !selectedDesignType
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className={`w-3.5 h-3.5 ${!selectedDesignType ? 'text-white' : 'text-slate-400'}`} />
            <span>All Design Types</span>
          </div>
          {!selectedDesignType && <Check className="w-3.5 h-3.5" />}
        </button>

        {/* Options: Specific Design Types */}
        {DESIGN_TYPES.map((type) => {
          const isSelected = selectedDesignType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleSelect(type)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="truncate">{type}</span>
              {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
