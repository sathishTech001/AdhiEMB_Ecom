import React, { useState } from 'react';
import { useMenuTree, useDeleteMenu } from '../hooks/useMenus';
import { MenuTree } from '../types/menu.types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
// Note: Form and Modal implementation elided for brevity, using basic tree view
import { Spinner } from '@/components/ui/Spinner';

export const MenuListPage: React.FC = () => {
  const { data: menuTree, isLoading } = useMenuTree();
  const deleteMenu = useDeleteMenu();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTree = (menus: MenuTree[], level = 0) => {
    return (
      <ul className={cn("space-y-2", level > 0 && "ml-8 mt-2 border-l-2 border-indigo-100 dark:border-indigo-900/30 pl-4")}>
        {menus.map(menu => {
          const hasChildren = menu.children && menu.children.length > 0;
          const isExpanded = expanded[menu.id] ?? true;
          const Icon = (Icons as any)[menu.icon || 'Circle'] || Icons.Circle;
          
          return (
            <li key={menu.id}>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 transition-colors">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => hasChildren && toggleExpand(menu.id)}
                    className={cn("w-6 h-6 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded", !hasChildren && "invisible")}
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <div className="w-8 h-8 rounded-md bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{menu.name}</span>
                      <Badge variant={menu.isActive ? 'success' : 'danger'}>{menu.isActive ? 'Active' : 'Hidden'}</Badge>
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-1">
                      Code: {menu.code} | Path: {menu.path || '/'} | Order: {menu.sortOrder}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => {}} className="text-slate-600 hover:text-indigo-600">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(menu.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {hasChildren && isExpanded && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200 mt-2">
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Menu Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure the sidebar navigation structure.</p>
        </div>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="h-4 w-4" />
          Add Menu Item
        </Button>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        {isLoading ? (
          <div className="flex justify-center p-12"><Spinner size="lg" className="text-indigo-600" /></div>
        ) : menuTree?.length ? (
          renderTree(menuTree)
        ) : (
          <p className="text-center text-slate-500 py-12">No menus configured yet.</p>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteMenu.mutate(deleteId);
            setDeleteId(null);
          }
        }}
        title="Delete Menu"
        message="Are you sure you want to delete this menu item? Any child items will also be deleted. This action cannot be undone."
        confirmLabel="Delete"
        isDanger={true}
      />
    </div>
  );
};
