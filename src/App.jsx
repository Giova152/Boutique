import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { CartDrawerProvider, useCartDrawer } from './contexts/CartDrawerContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import HomePage from './pages/HomePage';
import BoutiquePage from './pages/BoutiquePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CGVPage from './pages/CGVPage';
import PrivacyPage from './pages/PrivacyPage';
import './components/payment/LegalStyles.css';
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
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/a-propos" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cgv" element={<CGVPage />} />
        <Route path="/confidentialite" element={<PrivacyPage />} />
      </Routes>
      <Footer />
      <CartDrawer isOpen={isOpen} onClose={closeCart} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <CartDrawerProvider>
                <WishlistProvider>
                  <AppContent />
                </WishlistProvider>
              </CartDrawerProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;