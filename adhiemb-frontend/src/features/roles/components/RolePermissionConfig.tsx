import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Info, 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingBag, 
  Users, 
  Briefcase, 
  Shield, 
  BarChart3, 
  FileText, 
  Settings,
  LayoutGrid,
  Check
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { useCreateRole, useUpdateRole } from '../hooks/useRoles';
import { Role } from '../types/role.types';

interface ScreenItem {
  id: string;
  code: string;
  name: string;
  enabled: boolean;
  actions: Record<string, { permissionId: number; selected: boolean }>;
}

interface ModuleItem {
  id: string;
  code: string;
  name: string;
  menuId: number;
  icon: any;
  enabled: boolean;
  expanded: boolean;
  screens: ScreenItem[];
}

const ACTION_KEYS = ['View', 'Create', 'Edit', 'Delete', 'Export'];

const INITIAL_MODULES_CONFIG: ModuleItem[] = [
  {
    id: 'm1',
    code: 'DASHBOARD',
    name: 'Dashboard',
    menuId: 1,
    icon: LayoutDashboard,
    enabled: true,
    expanded: true,
    screens: [
      {
        id: 's1_1',
        code: 'DASHBOARD_HOME',
        name: 'Dashboard Home',
        enabled: true,
        actions: {
          View: { permissionId: 1, selected: true },
          Create: { permissionId: 2, selected: true },
          Edit: { permissionId: 3, selected: true },
          Delete: { permissionId: 4, selected: true },
          Export: { permissionId: 5, selected: true },
        }
      },
      {
        id: 's1_2',
        code: 'ANALYTICS_DASHBOARD',
        name: 'Analytics Dashboard',
        enabled: true,
        actions: {
          View: { permissionId: 6, selected: true },
          Create: { permissionId: 7, selected: true },
          Edit: { permissionId: 8, selected: true },
          Delete: { permissionId: 9, selected: true },
          Export: { permissionId: 10, selected: true },
        }
      }
    ]
  },
  {
    id: 'm2',
    code: 'PRODUCTS',
    name: 'Products',
    menuId: 2,
    icon: Package,
    enabled: true,
    expanded: true,
    screens: [
      {
        id: 's2_1',
        code: 'PRODUCT_MANAGEMENT',
        name: 'Product Management',
        enabled: true,
        actions: {
          View: { permissionId: 11, selected: true },
          Create: { permissionId: 12, selected: true },
          Edit: { permissionId: 13, selected: true },
          Delete: { permissionId: 14, selected: false },
          Export: { permissionId: 15, selected: false },
        }
      },
      {
        id: 's2_2',
        code: 'PRODUCT_APPROVAL',
        name: 'Product Approval',
        enabled: true,
        actions: {
          View: { permissionId: 16, selected: true },
          Create: { permissionId: 17, selected: true },
          Edit: { permissionId: 18, selected: true },
          Delete: { permissionId: 19, selected: false },
          Export: { permissionId: 20, selected: false },
        }
      },
      {
        id: 's2_3',
        code: 'PRODUCT_REVIEWS',
        name: 'Product Reviews',
        enabled: true,
        actions: {
          View: { permissionId: 21, selected: true },
          Create: { permissionId: 22, selected: true },
          Edit: { permissionId: 23, selected: true },
          Delete: { permissionId: 24, selected: false },
          Export: { permissionId: 25, selected: false },
        }
      }
    ]
  },
  {
    id: 'm3',
    code: 'CATEGORIES',
    name: 'Categories',
    menuId: 3,
    icon: FolderTree,
    enabled: true,
    expanded: false,
    screens: [
      {
        id: 's3_1',
        code: 'CATEGORY_MGMT',
        name: 'Category Management',
        enabled: true,
        actions: {
          View: { permissionId: 26, selected: true },
          Create: { permissionId: 27, selected: true },
          Edit: { permissionId: 28, selected: true },
          Delete: { permissionId: 29, selected: false },
          Export: { permissionId: 30, selected: false },
        }
      }
    ]
  },
  {
    id: 'm4',
    code: 'ORDERS',
    name: 'Order Management',
    menuId: 5,
    icon: ShoppingBag,
    enabled: true,
    expanded: false,
    screens: [
      {
        id: 's4_1',
        code: 'ORDER_LEDGER',
        name: 'Order Ledger',
        enabled: true,
        actions: {
          View: { permissionId: 31, selected: true },
          Create: { permissionId: 32, selected: true },
          Edit: { permissionId: 33, selected: true },
          Delete: { permissionId: 34, selected: true },
          Export: { permissionId: 35, selected: true },
        }
      },
      {
        id: 's4_2',
        code: 'PAYMENT_LEDGER',
        name: 'Payment Ledger',
        enabled: true,
        actions: {
          View: { permissionId: 36, selected: true },
          Create: { permissionId: 37, selected: true },
          Edit: { permissionId: 38, selected: true },
          Delete: { permissionId: 39, selected: false },
          Export: { permissionId: 40, selected: true },
        }
      }
    ]
  },
  {
    id: 'm5',
    code: 'USERS',
    name: 'User Management',
    menuId: 6,
    icon: Users,
    enabled: true,
    expanded: false,
    screens: [
      {
        id: 's5_1',
        code: 'USER_MGMT',
        name: 'User Directory',
        enabled: true,
        actions: {
          View: { permissionId: 41, selected: true },
          Create: { permissionId: 42, selected: true },
          Edit: { permissionId: 43, selected: true },
          Delete: { permissionId: 44, selected: false },
          Export: { permissionId: 45, selected: false },
        }
      }
    ]
  },
  {
    id: 'm6',
    code: 'EMPLOYEES',
    name: 'Employees',
    menuId: 7,
    icon: Briefcase,
    enabled: false,
    expanded: false,
    screens: [
      {
        id: 's6_1',
        code: 'EMPLOYEE_MGMT',
        name: 'Employee Roster',
        enabled: false,
        actions: {
          View: { permissionId: 46, selected: false },
          Create: { permissionId: 47, selected: false },
          Edit: { permissionId: 48, selected: false },
          Delete: { permissionId: 49, selected: false },
          Export: { permissionId: 50, selected: false },
        }
      }
    ]
  },
  {
    id: 'm7',
    code: 'ROLES',
    name: 'Roles & RBAC',
    menuId: 8,
    icon: Shield,
    enabled: false,
    expanded: false,
    screens: [
      {
        id: 's7_1',
        code: 'ROLE_MGMT',
        name: 'Role & Permissions',
        enabled: false,
        actions: {
          View: { permissionId: 51, selected: false },
          Create: { permissionId: 52, selected: false },
          Edit: { permissionId: 53, selected: false },
          Delete: { permissionId: 54, selected: false },
          Export: { permissionId: 55, selected: false },
        }
      }
    ]
  },
  {
    id: 'm8',
    code: 'ANALYTICS',
    name: 'Analytics',
    menuId: 10,
    icon: BarChart3,
    enabled: false,
    expanded: false,
    screens: [
      {
        id: 's8_1',
        code: 'ANALYTICS_MAIN',
        name: 'Analytics Dashboard',
        enabled: false,
        actions: {
          View: { permissionId: 56, selected: false },
          Create: { permissionId: 57, selected: false },
          Edit: { permissionId: 58, selected: false },
          Delete: { permissionId: 59, selected: false },
          Export: { permissionId: 60, selected: false },
        }
      }
    ]
  },
  {
    id: 'm9',
    code: 'AUDIT',
    name: 'Audit Logs',
    menuId: 11,
    icon: FileText,
    enabled: false,
    expanded: false,
    screens: [
      {
        id: 's9_1',
        code: 'AUDIT_MAIN',
        name: 'Audit Trail',
        enabled: false,
        actions: {
          View: { permissionId: 61, selected: false },
          Create: { permissionId: 62, selected: false },
          Edit: { permissionId: 63, selected: false },
          Delete: { permissionId: 64, selected: false },
          Export: { permissionId: 65, selected: false },
        }
      }
    ]
  },
  {
    id: 'm10',
    code: 'SETTINGS',
    name: 'System Settings',
    menuId: 12,
    icon: Settings,
    enabled: false,
    expanded: false,
    screens: [
      {
        id: 's10_1',
        code: 'SETTINGS_MAIN',
        name: 'Platform Settings',
        enabled: false,
        actions: {
          View: { permissionId: 66, selected: false },
          Create: { permissionId: 67, selected: false },
          Edit: { permissionId: 68, selected: false },
          Delete: { permissionId: 69, selected: false },
          Export: { permissionId: 70, selected: false },
        }
      }
    ]
  }
];

interface Props {
  initialRole?: Role;
  isEditMode?: boolean;
}

export const RolePermissionConfig: React.FC<Props> = ({ initialRole, isEditMode = false }) => {
  const navigate = useNavigate();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  // Basic Information State
  const [roleName, setRoleName] = useState(initialRole?.name || '');
  const [roleCode, setRoleCode] = useState(initialRole?.code || '');
  const [description, setDescription] = useState(initialRole?.description || '');
  const [isActive, setIsActive] = useState(initialRole?.isActive ?? true);

  // Modules State
  const [modules, setModules] = useState<ModuleItem[]>(INITIAL_MODULES_CONFIG);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync initialRole permissions if editing
  useEffect(() => {
    if (initialRole) {
      setRoleName(initialRole.name || '');
      setRoleCode(initialRole.code || '');
      setDescription(initialRole.description || '');
      setIsActive(initialRole.isActive ?? true);

      if (initialRole.permissions || initialRole.menuIds) {
        const assignedPermIds = new Set(initialRole.permissions?.map((p: any) => p.id) || []);
        const assignedMenuIds = new Set(initialRole.menuIds || []);

        setModules(prev => prev.map(mod => {
          const isModEnabled = assignedMenuIds.has(mod.menuId);
          const updatedScreens = mod.screens.map(scr => {
            const updatedActions: Record<string, { permissionId: number; selected: boolean }> = {};
            Object.entries(scr.actions).forEach(([actionKey, val]) => {
              updatedActions[actionKey] = {
                ...val,
                selected: assignedPermIds.has(val.permissionId)
              };
            });
            return {
              ...scr,
              enabled: isModEnabled,
              actions: updatedActions
            };
          });
          return {
            ...mod,
            enabled: isModEnabled,
            screens: updatedScreens
          };
        }));
      }
    }
  }, [initialRole]);

  // Handle Module Enable Toggle
  const toggleModuleEnable = (modId: string) => {
    setModules(prev => prev.map(mod => {
      if (mod.id === modId) {
        const newEnabled = !mod.enabled;
        return {
          ...mod,
          enabled: newEnabled,
          screens: mod.screens.map(scr => ({
            ...scr,
            enabled: newEnabled,
            actions: Object.fromEntries(
              Object.entries(scr.actions).map(([k, v]) => [k, { ...v, selected: newEnabled ? true : false }])
            )
          }))
        };
      }
      return mod;
    }));
  };

  // Handle Module Expand Toggle
  const toggleModuleExpand = (modId: string) => {
    setModules(prev => prev.map(mod => mod.id === modId ? { ...mod, expanded: !mod.expanded } : mod));
  };

  // Handle Screen Enable Toggle
  const toggleScreenEnable = (modId: string, scrId: string) => {
    setModules(prev => prev.map(mod => {
      if (mod.id === modId) {
        return {
          ...mod,
          screens: mod.screens.map(scr => {
            if (scr.id === scrId) {
              const newEnabled = !scr.enabled;
              return {
                ...scr,
                enabled: newEnabled,
                actions: Object.fromEntries(
                  Object.entries(scr.actions).map(([k, v]) => [k, { ...v, selected: newEnabled }])
                )
              };
            }
            return scr;
          })
        };
      }
      return mod;
    }));
  };

  // Handle Individual Action Checkbox Toggle
  const toggleActionPermission = (modId: string, scrId: string, actionKey: string) => {
    setModules(prev => prev.map(mod => {
      if (mod.id === modId) {
        return {
          ...mod,
          screens: mod.screens.map(scr => {
            if (scr.id === scrId) {
              const currentAction = scr.actions[actionKey];
              if (!currentAction) return scr;
              return {
                ...scr,
                actions: {
                  ...scr.actions,
                  [actionKey]: {
                    ...currentAction,
                    selected: !currentAction.selected
                  }
                }
              };
            }
            return scr;
          })
        };
      }
      return mod;
    }));
  };

  // Expand All / Collapse All
  const handleExpandAll = () => setModules(prev => prev.map(m => ({ ...m, expanded: true })));
  const handleCollapseAll = () => setModules(prev => prev.map(m => ({ ...m, expanded: false })));

  // Filter Modules by Search
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules;
    const query = searchQuery.toLowerCase();
    return modules.filter(m => 
      m.name.toLowerCase().includes(query) ||
      m.screens.some(s => s.name.toLowerCase().includes(query) || Object.keys(s.actions).some(a => a.toLowerCase().includes(query)))
    );
  }, [modules, searchQuery]);

  // Derived Metrics & Counters
  const totalSelectedPermissions = useMemo(() => {
    let count = 0;
    modules.forEach(m => {
      if (m.enabled) {
        m.screens.forEach(s => {
          if (s.enabled) {
            Object.values(s.actions).forEach(a => {
              if (a.selected) count++;
            });
          }
        });
      }
    });
    return count;
  }, [modules]);

  const enabledMenuGroupsCount = useMemo(() => modules.filter(m => m.enabled).length, [modules]);
  const totalScreensCount = useMemo(() => {
    let count = 0;
    modules.forEach(m => {
      if (m.enabled) count += m.screens.filter(s => s.enabled).length;
    });
    return count;
  }, [modules]);

  const totalActionsAllowed = useMemo(() => {
    const actionsSet = new Set<string>();
    modules.forEach(m => {
      if (m.enabled) {
        m.screens.forEach(s => {
          if (s.enabled) {
            Object.entries(s.actions).forEach(([k, v]) => {
              if (v.selected) actionsSet.add(k);
            });
          }
        });
      }
    });
    return actionsSet.size;
  }, [modules]);

  // Submit Handler
  const handleSave = async () => {
    if (!roleName.trim()) {
      toast.error('Role Name is required');
      return;
    }
    if (!roleCode.trim()) {
      toast.error('Role Code is required');
      return;
    }

    // Collect enabled menuIds and permissionIds
    const selectedMenuIds: number[] = [];
    const selectedPermissionIds: number[] = [];

    modules.forEach(m => {
      if (m.enabled) {
        selectedMenuIds.push(m.menuId);
        m.screens.forEach(s => {
          if (s.enabled) {
            Object.values(s.actions).forEach(a => {
              if (a.selected) {
                selectedPermissionIds.push(a.permissionId);
              }
            });
          }
        });
      }
    });

    try {
      if (isEditMode && initialRole) {
        await updateRole.mutateAsync({
          id: initialRole.id,
          data: {
            name: roleName,
            description: description,
            isActive: isActive,
            permissionIds: selectedPermissionIds,
            menuIds: selectedMenuIds
          }
        });
        toast.success('Role and permissions updated successfully!');
      } else {
        await createRole.mutateAsync({
          name: roleName,
          code: roleCode.toUpperCase().replace(/\s+/g, '_'),
          description: description,
          permissionIds: selectedPermissionIds,
          menuIds: selectedMenuIds
        });
        toast.success('New Role created successfully!');
      }
      navigate('/roles');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save role configuration');
    }
  };

  const isPending = createRole.isPending || updateRole.isPending;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* Header & Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/roles')} 
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="h-6 w-6 text-slate-700 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isEditMode ? `Edit Role: ${roleName}` : 'Create New Role'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Define a new role and configure its access permissions across all platform modules.
          </p>
        </div>
      </div>

      {/* Main Grid: Card 1 (Basic Info) & Card 2 (Menu & Screen Permissions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Card 1 - Basic Information */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                1
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Role Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g., Sales Manager"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Role Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={roleCode}
                  onChange={(e) => setRoleCode(e.target.value)}
                  disabled={isEditMode}
                  placeholder="e.g., SALES_MANAGER"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of responsibilities"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isActive} 
                    onChange={(e) => setIsActive(e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span className="ml-3 text-xs font-bold text-slate-900 dark:text-white">
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setRoleName('');
                    setRoleCode('');
                    setDescription('');
                    setIsActive(true);
                  }}
                  className="rounded-xl"
                >
                  Reset
                </Button>
                <Button 
                  type="button" 
                  size="sm"
                  onClick={handleSave}
                  isLoading={isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                >
                  Save Role
                </Button>
              </div>
            </div>
          </Card>

          {/* Info Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/50 text-indigo-900 dark:text-indigo-200 flex items-start gap-3 text-xs leading-relaxed">
            <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              Define role details and assign menu & screen access permissions. Changes will be applied in real time across the platform.
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Card 2 - Menu & Screen Permissions */}
        <div className="lg:col-span-7">
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
            
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  2
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Menu & Screen Permissions</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExpandAll} className="rounded-lg text-xs py-1 px-2.5 h-auto">
                  Expand All
                </Button>
                <Button variant="outline" size="sm" onClick={handleCollapseAll} className="rounded-lg text-xs py-1 px-2.5 h-auto">
                  Collapse All
                </Button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search permissions..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Permissions Matrix Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Menu / Screen</th>
                    <th className="py-3.5 px-3 text-center">View</th>
                    <th className="py-3.5 px-3 text-center">Create</th>
                    <th className="py-3.5 px-3 text-center">Edit</th>
                    <th className="py-3.5 px-3 text-center">Delete</th>
                    <th className="py-3.5 px-3 text-center">Export</th>
                    <th className="py-3.5 px-3 text-center">Enable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredModules.map((mod) => {
                    const ModuleIcon = mod.icon || LayoutGrid;
                    const totalModScreens = mod.screens.length;
                    const totalModPerms = mod.screens.reduce((acc, s) => acc + Object.keys(s.actions).length, 0);

                    return (
                      <React.Fragment key={mod.id}>
                        {/* Module Row */}
                        <tr className="bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors font-semibold">
                          <td className="py-3.5 px-4 flex items-center gap-3">
                            <button 
                              type="button" 
                              onClick={() => toggleModuleExpand(mod.id)}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                            >
                              {mod.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                              <ModuleIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">{mod.name}</div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                {totalModScreens} {totalModScreens === 1 ? 'screen' : 'screens'} • {totalModPerms} permissions
                              </div>
                            </div>
                          </td>

                          {/* Module Action Checkboxes (Select All Module Actions) */}
                          {ACTION_KEYS.map((actionKey) => {
                            const isAllSelected = mod.enabled && mod.screens.every(s => s.actions[actionKey]?.selected);
                            return (
                              <td key={actionKey} className="py-3.5 px-3 text-center">
                                <button
                                  type="button"
                                  disabled={!mod.enabled}
                                  onClick={() => {
                                    setModules(prev => prev.map(m => {
                                      if (m.id === mod.id) {
                                        return {
                                          ...m,
                                          screens: m.screens.map(s => ({
                                            ...s,
                                            actions: {
                                              ...s.actions,
                                              [actionKey]: {
                                                ...s.actions[actionKey],
                                                selected: !isAllSelected
                                              }
                                            }
                                          }))
                                        };
                                      }
                                      return m;
                                    }));
                                  }}
                                  className={`w-5 h-5 rounded flex items-center justify-center mx-auto transition-all ${
                                    isAllSelected 
                                      ? 'bg-indigo-600 text-white' 
                                      : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-indigo-400'
                                  } ${!mod.enabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                >
                                  {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </button>
                              </td>
                            );
                          })}

                          {/* Module Enable Switch */}
                          <td className="py-3.5 px-3 text-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={mod.enabled} 
                                onChange={() => toggleModuleEnable(mod.id)} 
                                className="sr-only peer" 
                              />
                              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                          </td>
                        </tr>

                        {/* Screen Sub-rows */}
                        {mod.expanded && mod.screens.map((scr) => (
                          <tr key={scr.id} className="bg-slate-50/40 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/60">
                            <td className="py-2.5 pl-12 pr-4 flex items-center gap-2.5">
                              <input 
                                type="checkbox" 
                                checked={scr.enabled} 
                                disabled={!mod.enabled}
                                onChange={() => toggleScreenEnable(mod.id, scr.id)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                              />
                              <span className={`text-xs font-semibold ${scr.enabled && mod.enabled ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                                {scr.name}
                              </span>
                            </td>

                            {ACTION_KEYS.map((actionKey) => {
                              const actionItem = scr.actions[actionKey];
                              const isSelected = actionItem?.selected;

                              return (
                                <td key={actionKey} className="py-2.5 px-3 text-center">
                                  {actionItem ? (
                                    <button
                                      type="button"
                                      disabled={!mod.enabled || !scr.enabled}
                                      onClick={() => toggleActionPermission(mod.id, scr.id, actionKey)}
                                      className={`w-4 h-4 rounded flex items-center justify-center mx-auto transition-all ${
                                        isSelected && scr.enabled && mod.enabled
                                          ? 'bg-indigo-600 text-white' 
                                          : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-indigo-400'
                                      } ${(!mod.enabled || !scr.enabled) ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    >
                                      {isSelected && scr.enabled && mod.enabled && <Check className="w-3 h-3 stroke-[3]" />}
                                    </button>
                                  ) : (
                                    <span className="text-slate-300 dark:text-slate-700">-</span>
                                  )}
                                </td>
                              );
                            })}

                            <td className="py-2.5 px-3 text-center">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={scr.enabled && mod.enabled} 
                                  disabled={!mod.enabled}
                                  onChange={() => toggleScreenEnable(mod.id, scr.id)} 
                                  className="sr-only peer" 
                                />
                                <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                              </label>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Matrix Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                <span>Total Selected Permissions</span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs">
                  {totalSelectedPermissions}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-600"></span> Module</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Screen</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Permission</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* BOTTOM SECTION: Card 3 - Role Summary & Actions */}
      <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            3
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Role Summary</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{enabledMenuGroupsCount}</div>
              <div className="text-[11px] text-slate-500 font-medium">Menu Groups</div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{totalScreensCount}</div>
              <div className="text-[11px] text-slate-500 font-medium">Screens</div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{totalSelectedPermissions}</div>
              <div className="text-[11px] text-slate-500 font-medium">Permissions Enabled</div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{totalActionsAllowed}</div>
              <div className="text-[11px] text-slate-500 font-medium">Actions Allowed</div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex items-center justify-between col-span-2 md:col-span-1">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{isActive ? 'Active' : 'Inactive'}</div>
              <div className="text-[11px] text-slate-500 font-medium">Status</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isActive} 
                onChange={(e) => setIsActive(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/roles')}
            className="rounded-xl px-6"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            isLoading={isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 font-bold shadow-md shadow-indigo-600/20"
          >
            Save Role & Permissions
          </Button>
        </div>
      </Card>
    </div>
  );
};
