import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/guards/ProtectedRoute';
import { GuestRoute } from '@/guards/GuestRoute';

// Layouts
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PublicLayout } from '@/layouts/PublicLayout';

// Auth Pages
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';

// Dashboard
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';

// Users
import { UserListPage } from '@/features/users/pages/UserListPage';
import { CreateUserPage } from '@/features/users/pages/CreateUserPage';
import { UserDetailPage } from '@/features/users/pages/UserDetailPage';

// Employees
import { EmployeeListPage } from '@/features/employees/pages/EmployeeListPage';
import { CreateEmployeePage } from '@/features/employees/pages/CreateEmployeePage';

// Roles
import { RoleListPage } from '@/features/roles/pages/RoleListPage';
import { CreateRolePage } from '@/features/roles/pages/CreateRolePage';
import { RoleDetailPage } from '@/features/roles/pages/RoleDetailPage';

// Menus
import { MenuListPage } from '@/features/menus/pages/MenuListPage';

// Categories (Admin)
import { CategoryListPage } from '@/features/categories/pages/CategoryListPage';

// Products (Admin / Designer)
import { ProductListPage } from '@/features/products/pages/ProductListPage';
import { CreateProductPage } from '@/features/products/pages/CreateProductPage';
import { ProductDetailPage } from '@/features/products/pages/ProductDetailPage';
import { ProductApprovalPage } from '@/features/products/pages/ProductApprovalPage';

// Marketplace Public
import { HomePage } from '@/features/marketplace/pages/HomePage';
import { AboutPage } from '@/features/marketplace/pages/AboutPage';
import { ContactPage } from '@/features/marketplace/pages/ContactPage';
import { FaqPage } from '@/features/marketplace/pages/FaqPage';
import { ProductCatalogPage } from '@/features/marketplace/pages/ProductCatalogPage';
import { PublicProductDetailPage } from '@/features/marketplace/pages/PublicProductDetailPage';

// Phase 3 Features
import { CartPage } from '@/features/cart/pages/CartPage';
import { CheckoutPage } from '@/features/orders/pages/CheckoutPage';
import { OrderSuccessPage } from '@/features/orders/pages/OrderSuccessPage';
import { CustomerOrdersPage } from '@/features/orders/pages/CustomerOrdersPage';
import { AdminOrdersPage } from '@/features/orders/pages/AdminOrdersPage';
import { AdminPaymentsPage } from '@/features/payments/pages/AdminPaymentsPage';
import { CustomerDownloadsPage } from '@/features/downloads/pages/CustomerDownloadsPage';

// Phase 4 Features
import { AdminReviewsPage } from '@/features/reviews/pages/AdminReviewsPage';
import { AnalyticsPage } from '@/features/analytics/pages/AnalyticsPage';
import { DesignerPayoutsPage } from '@/features/analytics/pages/DesignerPayoutsPage';
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { AuditLogsPage } from '@/features/audit-logs/pages/AuditLogsPage';
import { UserProfilePage } from '@/features/profile/pages/UserProfilePage';
import { WishlistPage } from '@/features/wishlist/pages/WishlistPage';
import { AdminCouponsPage } from '@/features/coupons/pages/AdminCouponsPage';

export function AppRouter() {
  return (
    <Routes>
      {/* Public / Marketplace routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/designs" element={<ProductCatalogPage />} />
        <Route path="/designs/:slug" element={<PublicProductDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />

        {/* Phase 3 Marketplace & Customer Vault Routes */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
        <Route path="/my-orders" element={<CustomerOrdersPage />} />
        <Route path="/my-downloads" element={<CustomerDownloadsPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
      </Route>

      {/* Guest routes (Auth) - redirect to dashboard if already logged in */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Protected routes (Dashboard/Admin/Designer) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Users */}
          <Route path="/users" element={<UserListPage />} />
          <Route path="/users/create" element={<CreateUserPage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />

          {/* Employees */}
          <Route path="/employees" element={<EmployeeListPage />} />
          <Route path="/employees/create" element={<CreateEmployeePage />} />

          {/* Roles */}
          <Route path="/roles" element={<RoleListPage />} />
          <Route path="/roles/create" element={<CreateRolePage />} />
          <Route path="/roles/:id" element={<RoleDetailPage />} />

          {/* Menus */}
          <Route path="/menus" element={<MenuListPage />} />

          {/* Categories */}
          <Route path="/categories" element={<CategoryListPage />} />
          <Route path="/products/categories" element={<CategoryListPage />} />

          {/* Products */}
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/list" element={<ProductListPage />} />
          <Route path="/products/create" element={<CreateProductPage />} />
          <Route path="/products/approval" element={<ProductApprovalPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />

          {/* Phase 3 Admin Orders & Payments */}
          <Route path="/orders" element={<AdminOrdersPage />} />
          <Route path="/payments" element={<AdminPaymentsPage />} />

          {/* Phase 4 Admin Analytics, Reviews, Settings, Audit Logs, Profile */}
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/designer-payouts" element={<DesignerPayoutsPage />} />
          <Route path="/reviews" element={<AdminReviewsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/coupons" element={<AdminCouponsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
        </Route>
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
