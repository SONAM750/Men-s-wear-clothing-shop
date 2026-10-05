import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ShopSettingsProvider } from '@/context/ShopSettingsContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Storefront
import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
import { HomePage } from '@/pages/storefront/HomePage';
import { ShopPage } from '@/pages/storefront/ShopPage';
import { CategoryPage } from '@/pages/storefront/CategoryPage';
import { ProductDetailPage } from '@/pages/storefront/ProductDetailPage';
import { CheckoutPage } from '@/pages/storefront/CheckoutPage';
import { WishlistPage } from '@/pages/storefront/WishlistPage';
import { AboutPage, ContactPage, TermsPage, PrivacyPage } from '@/pages/storefront/InfoPages';

// Admin
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminStockPage } from '@/pages/admin/AdminStockPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="text-sm text-primary-500">Loading...</div>
      </div>
    );
  }
  if (!session) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ShopSettingsProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                <Routes>
                  {/* Storefront */}
                  <Route element={<StorefrontLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/category/:slug" element={<CategoryPage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                  </Route>

                  {/* Admin */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="stock" element={<AdminStockPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </ShopSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
