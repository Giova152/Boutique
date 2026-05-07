import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { CartDrawerProvider, useCartDrawer } from './contexts/CartDrawerContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AdminProvider } from './contexts/AdminContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import './components/payment/LegalStyles.css';
import './components/admin/AdminStyles.css';
import './components/profile/ProfileStyles.css';
import './App.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const BoutiquePage = lazy(() => import('./pages/BoutiquePage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CGVPage = lazy(() => import('./pages/CGVPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));

function LoadingFallback() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '60vh',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div className="loading-spinner"></div>
      <p style={{ color: 'var(--text-light)' }}>Chargement...</p>
    </div>
  );
}

function AppContent() {
  const { isOpen, closeCart } = useCartDrawer();
  
  return (
    <div className="app">
      <Header />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/boutique" element={<BoutiquePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cgv" element={<CGVPage />} />
          <Route path="/confidentialite" element={<PrivacyPage />} />
        </Routes>
      </Suspense>
      <Footer />
      <CartDrawer isOpen={isOpen} onClose={closeCart} />
    </div>
  );
}

function AdminLayout() {
  return (
    <Routes>
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <LanguageProvider>
        <ToastProvider>
          <AdminProvider>
            <AuthProvider>
              <CartProvider>
                <CartDrawerProvider>
                  <WishlistProvider>
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        <Route path="/admin-login" element={<AdminLoginPage />} />
                        <Route path="/admin/*" element={<AdminPage />} />
                        <Route path="/*" element={<AppContent />} />
                      </Routes>
                    </Suspense>
                  </WishlistProvider>
                </CartDrawerProvider>
              </CartProvider>
            </AuthProvider>
          </AdminProvider>
        </ToastProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;