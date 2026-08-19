import React from 'react';
import { MenuTree } from '@/features/menus/types/menu.types';
import { Check, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';

interface MenuAssignmentProps {
  menuTree: MenuTree[];
  selectedMenuIds: number[];
  onChange: (ids: number[]) => void;
}

export const MenuAssignment: React.FC<MenuAssignmentProps> = ({ menuTree, selectedMenuIds, onChange }) => {
  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getDescendantIds = (menu: MenuTree): number[] => {
    let ids = [menu.id];
    if (menu.children) {
      menu.children.forEach(child => {
        ids = [...ids, ...getDescendantIds(child)];
      });
    }
    return ids;
  };

  const handleToggle = (menu: MenuTree) => {
    const idsToToggle = getDescendantIds(menu);
    const isSelected = selectedMenuIds.includes(menu.id);
    
    if (isSelected) {
      // Remove all descendants
      onChange(selectedMenuIds.filter(id => !idsToToggle.includes(id)));
    } else {
      // Add all descendants and make sure parents are added (simple implementation here)
      const newIds = new Set([...selectedMenuIds, ...idsToToggle]);
      onChange(Array.from(newIds));
    }
  };

  const renderTree = (menus: MenuTree[], level = 0) => {
    return (
      <ul className={cn("space-y-2", level > 0 && "ml-6 mt-2 border-l border-slate-200 dark:border-slate-700 pl-4")}>
        {menus.map(menu => {
          const hasChildren = menu.children && menu.children.length > 0;
          const isExpanded = expanded[menu.id] ?? true;
          const isSelected = selectedMenuIds.includes(menu.id);
          const Icon = (Icons as any)[menu.icon || 'Circle'] || Icons.Circle;
          
          return (
            <li key={menu.id}>
              <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <button
                  type="button"
                  onClick={() => hasChildren && toggleExpand(menu.id)}
                  className={cn("w-5 h-5 flex items-center justify-center text-slate-400", !hasChildren && "invisible")}
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                <button
                  type="button"
                  onClick={() => handleToggle(menu)}
                  className={cn(
                    "w-5 h-5 rounded flex items-center justify-center transition-all flex-shrink-0",
                    isSelected 
                      ? "bg-indigo-600 text-white shadow-sm" 
                      : "bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-transparent"
                  )}
                >
                  <Check className={cn("w-3 h-3", isSelected ? "opacity-100" : "opacity-0")} />
                </button>
                
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer" onClick={() => handleToggle(menu)}>
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{menu.name}</span>
                  {menu.path && <span className="text-xs text-slate-400 font-mono ml-2">{menu.path}</span>}
                </div>
              </div>
              
              {hasChildren && isExpanded && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                  {renderTree(menu.children, level + 1)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
      {menuTree.length > 0 ? renderTree(menuTree) : <p className="text-slate-500 p-4">No menus available.</p>}
    </div>
  );
};
