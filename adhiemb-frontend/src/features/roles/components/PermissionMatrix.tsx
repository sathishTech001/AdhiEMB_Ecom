import React from 'react';
import { PermissionGroup } from '../types/role.types';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PermissionMatrixProps {
  permissions: PermissionGroup[];
  selectedPermissionIds: number[];
  onChange: (ids: number[]) => void;
}

const ACTION_TYPES = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'MANAGE', 'APPROVE', 'UPLOAD', 'EXPORT'];

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ 
  permissions, 
  selectedPermissionIds, 
  onChange 
}) => {
  
  const handleTogglePermission = (permissionId: number) => {
    if (selectedPermissionIds.includes(permissionId)) {
      onChange(selectedPermissionIds.filter(id => id !== permissionId));
    } else {
      onChange([...selectedPermissionIds, permissionId]);
    }
  };

  const handleToggleModule = (module: string) => {
    const group = permissions.find(p => p.module === module);
    if (!group) return;
    
    const groupIds = group.permissions.map(p => p.id);
    const allSelected = groupIds.every(id => selectedPermissionIds.includes(id));
    
    if (allSelected) {
      onChange(selectedPermissionIds.filter(id => !groupIds.includes(id)));
    } else {
      const newIds = new Set([...selectedPermissionIds, ...groupIds]);
      onChange(Array.from(newIds));
    }
  };

  const handleToggleAction = (action: string) => {
    const actionIds: number[] = [];
    permissions.forEach(group => {
      const p = group.permissions.find(p => p.action === action);
      if (p) actionIds.push(p.id);
    });
    
    const allSelected = actionIds.every(id => selectedPermissionIds.includes(id));
    
    if (allSelected) {
      onChange(selectedPermissionIds.filter(id => !actionIds.includes(id)));
    } else {
      const newIds = new Set([...selectedPermissionIds, ...actionIds]);
      onChange(Array.from(newIds));
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700">
              Module
            </th>
            {ACTION_TYPES.map(action => (
              <th key={action} className="px-4 py-4 text-center border-b border-slate-200 dark:border-slate-700">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                    {action}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleAction(action)}
                    className="text-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-2 py-1 rounded transition-colors"
                  >
                    Toggle All
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {permissions.map((group, index) => (
            <tr 
              key={group.module} 
              className={cn(
                "border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/50"
              )}
            >
              <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>{group.module}</span>
                <button
                  type="button"
                  onClick={() => handleToggleModule(group.module)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 ml-4 font-medium"
                >
                  Select All
                </button>
              </td>
              {ACTION_TYPES.map(action => {
                const permission = group.permissions.find(p => p.action === action);
                const isSelected = permission ? selectedPermissionIds.includes(permission.id) : false;
                
                return (
                  <td key={`${group.module}-${action}`} className="px-4 py-4 text-center">
                    {permission ? (
                      <button
                        type="button"
                        onClick={() => handleTogglePermission(permission.id)}
                        className={cn(
                          "w-6 h-6 rounded flex items-center justify-center mx-auto transition-all",
                          isSelected 
                            ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700" 
                            : "bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-transparent hover:border-indigo-400"
                        )}
                        title={permission.description}
                      >
                        <Check className={cn("w-4 h-4", isSelected ? "opacity-100" : "opacity-0")} />
                      </button>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
