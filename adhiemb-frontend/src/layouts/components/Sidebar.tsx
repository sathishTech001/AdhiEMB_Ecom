import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Shield, 
  Briefcase,
  X,
  Package,
  FolderTree,
  Ticket,
  ShoppingBag,
  BarChart3,
  Star,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Plus,
  CheckSquare,
  List
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const { user, hasPermission } = useAuth();

  // Role code helper
  const roleCode = user?.roleCode || user?.role || '';
  const isCust = roleCode === 'CUST' || roleCode === 'CUSTOMER';

  // Check if current route is within Products section
  const isProductRoute = 
    location.pathname.startsWith('/products') || 
    location.pathname.startsWith('/categories');

  const [isProductsExpanded, setIsProductsExpanded] = useState<boolean>(isProductRoute);

  // Auto expand Products dropdown on navigation into product routes
  useEffect(() => {
    if (isProductRoute) {
      setIsProductsExpanded(true);
    }
  }, [location.pathname]);

  // Product child menu authorization permissions
  const canViewCategories = !isCust && (roleCode === 'OWNER' || roleCode === 'ADMIN' || roleCode === 'EMPLOYEE' || hasPermission('CATEGORY_VIEW'));
  const canCreateProduct = !isCust && (roleCode === 'OWNER' || roleCode === 'ADMIN' || roleCode === 'DESIGNER' || roleCode === 'EMPLOYEE' || hasPermission('PRODUCT_CREATE'));
  const canApproveProduct = !isCust && (roleCode === 'OWNER' || roleCode === 'ADMIN' || roleCode === 'EMPLOYEE' || hasPermission('PRODUCT_APPROVE'));
  const canViewProductList = !isCust && (roleCode === 'OWNER' || roleCode === 'ADMIN' || roleCode === 'DESIGNER' || roleCode === 'EMPLOYEE' || hasPermission('PRODUCT_VIEW'));

  // Parent Products menu is visible if user can access at least one child feature
  const canAccessProductsGroup = canViewCategories || canCreateProduct || canApproveProduct || canViewProductList;

  // Single top-level menu list (excluding standalone Categories & Products Approval)
  const navItems = [
    { id: 'dashboard', title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, visible: !isCust },
    { id: 'coupons', title: 'Coupons & Promos', path: '/coupons', icon: Ticket, visible: !isCust },
    { id: 'orders', title: 'Orders Ledger', path: '/orders', icon: ShoppingBag, visible: !isCust },
    { id: 'users', title: 'User Management', path: '/users', icon: Users, visible: !isCust && (roleCode === 'OWNER' || roleCode === 'ADMIN' || roleCode === 'EMPLOYEE' || hasPermission('USER_VIEW')) },
    { id: 'employees', title: 'Employees', path: '/employees', icon: Briefcase, visible: !isCust && (roleCode === 'OWNER' || roleCode === 'ADMIN' || hasPermission('EMPLOYEE_VIEW')) },
    { id: 'roles', title: 'Roles & RBAC', path: '/roles', icon: Shield, visible: !isCust && (roleCode === 'OWNER' || roleCode === 'ADMIN' || hasPermission('ROLE_VIEW')) },
    { id: 'reviews', title: 'Reviews Moderation', path: '/reviews', icon: Star, visible: !isCust },
    { id: 'analytics', title: 'Analytics', path: '/analytics', icon: BarChart3, visible: !isCust && (roleCode === 'OWNER' || roleCode === 'ADMIN' || hasPermission('ANALYTICS_VIEW')) },
    { id: 'audit', title: 'Audit Trail', path: '/audit-logs', icon: FileText, visible: !isCust && (roleCode === 'OWNER' || roleCode === 'ADMIN' || hasPermission('AUDIT_VIEW')) },
    { id: 'settings', title: 'System Settings', path: '/settings', icon: Settings, visible: !isCust && (roleCode === 'OWNER' || roleCode === 'ADMIN' || hasPermission('SETTING_VIEW')) },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-900 text-white shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-slate-800 flex flex-col justify-between',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div>
          {/* Logo Header */}
          <div className="flex h-16 items-center justify-between px-6 bg-slate-950/80 border-b border-slate-800/80">
            <Link to="/dashboard" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                AdhiEMB <span className="text-xs text-indigo-400 font-semibold block">Admin Portal</span>
              </span>
            </Link>
            <button 
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 px-3 py-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
            
            {/* 1. Dashboard */}
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className={cn(
                'group flex items-center space-x-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all',
                location.pathname === '/dashboard' 
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              )}
            >
              <LayoutDashboard className={cn(
                'h-4 w-4 flex-shrink-0',
                location.pathname === '/dashboard' ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'
              )} />
              <span>Dashboard</span>
            </Link>

            {/* 2. Expandable Products Parent Menu */}
            {canAccessProductsGroup && (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setIsProductsExpanded(!isProductsExpanded)}
                  className={cn(
                    'w-full group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all select-none',
                    isProductRoute
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Package className={cn(
                      'h-4 w-4 flex-shrink-0',
                      isProductRoute ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'
                    )} />
                    <span>Products</span>
                  </div>
                  {isProductsExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-indigo-400" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-white" />
                  )}
                </button>

                {/* Sub-menu Items */}
                {isProductsExpanded && (
                  <div className="border-l-2 border-indigo-500/30 ml-4 pl-2 space-y-1 py-1">
                    {/* Categories */}
                    {canViewCategories && (
                      <Link
                        to="/categories"
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'group flex items-center space-x-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all',
                          location.pathname === '/categories' || location.pathname === '/products/categories'
                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                        )}
                      >
                        <FolderTree className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
                        <span>Categories</span>
                      </Link>
                    )}

                    {/* Create Product */}
                    {canCreateProduct && (
                      <Link
                        to="/products/create"
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'group flex items-center space-x-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all',
                          location.pathname === '/products/create'
                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                        )}
                      >
                        <Plus className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                        <span>Create Product</span>
                      </Link>
                    )}

                    {/* Product Approval */}
                    {canApproveProduct && (
                      <Link
                        to="/products/approval"
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'group flex items-center space-x-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all',
                          location.pathname === '/products/approval'
                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                        )}
                      >
                        <CheckSquare className="h-3.5 w-3.5 flex-shrink-0 text-blue-400" />
                        <span>Product Approval</span>
                      </Link>
                    )}

                    {/* Product List */}
                    {canViewProductList && (
                      <Link
                        to="/products"
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'group flex items-center space-x-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all',
                          location.pathname === '/products' || location.pathname === '/products/list'
                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                        )}
                      >
                        <List className="h-3.5 w-3.5 flex-shrink-0 text-indigo-400" />
                        <span>Product List</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. Remaining Top-Level Navigation Items */}
            {navItems.slice(1).map((item) => {
              if (!item.visible) return null;
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'group flex items-center space-x-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all',
                    isActive 
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  )}
                >
                  <Icon className={cn(
                    'h-4 w-4 flex-shrink-0',
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'
                  )} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Link */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-center">
          <Link to="/" className="text-xs text-indigo-400 hover:underline font-semibold">
            ← Switch to Marketplace
          </Link>
        </div>
      </aside>
    </>
  );
}
