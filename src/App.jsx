import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { CartDrawerProvider, useCartDrawer } from './contexts/CartDrawerContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AdminProvider } from './contexts/AdminContext';
import { ProductsProvider } from './contexts/ProductsContext';
import { ReviewsProvider } from './contexts/ReviewsContext';
import { StockAlertProvider } from './contexts/StockAlertContext';
import { LoyaltyProvider } from './contexts/LoyaltyContext';
import { AbandonedCartProvider } from './contexts/AbandonedCartContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';
import CookieConsent from './components/layout/CookieConsent';
import CartDrawer from './components/cart/CartDrawer';
import HomePage from './pages/HomePage';
import BoutiquePage from './pages/BoutiquePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ReviewOrderPage from './pages/ReviewOrderPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CGVPage from './pages/CGVPage';
import PrivacyPage from './pages/PrivacyPage';
import MentionsLegalesPage from './pages/MentionsLegalesPage';
import FAQPage from './pages/FAQPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminPage from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import './components/payment/LegalStyles.css';
import './components/admin/AdminStyles.css';
import './components/profile/ProfileStyles.css';
import './App.css';

function AppContent() {
  const { isOpen, closeCart } = useCartDrawer();
  
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/boutique" element={<BoutiquePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="/review/:orderId" element={<ReviewOrderPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/a-propos" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cgv" element={<CGVPage />} />
        <Route path="/confidentialite" element={<PrivacyPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
      <ScrollToTop />
      <CookieConsent />
      <CartDrawer isOpen={isOpen} onClose={closeCart} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <HelmetProvider>
      <LanguageProvider>
        <ToastProvider>
          <ProductsProvider>
            <AdminProvider>
              <AuthProvider>
                <ReviewsProvider>
                  <LoyaltyProvider>
                    <AbandonedCartProvider>
                      <CartProvider>
                        <CartDrawerProvider>
                          <WishlistProvider>
                            <StockAlertProvider>
                              <Routes>
                                <Route path="/admin-login" element={<AdminLoginPage />} />
                                <Route path="/admin/*" element={<AdminPage />} />
                                <Route path="/*" element={<AppContent />} />
                              </Routes>
                            </StockAlertProvider>
                          </WishlistProvider>
                        </CartDrawerProvider>
                      </CartProvider>
                    </AbandonedCartProvider>
                  </LoyaltyProvider>
                </ReviewsProvider>
              </AuthProvider>
            </AdminProvider>
          </ProductsProvider>
        </ToastProvider>
      </LanguageProvider>
      </HelmetProvider>
    </Router>
  );
}

export default App;