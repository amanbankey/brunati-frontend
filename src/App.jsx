import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import AccountDashboard from './pages/AccountDashboard';
import CheckoutRoute from './pages/CheckoutRoute';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { UserAuthProvider } from './context/UserAuthContext';
import { StorefrontProvider } from './context/StorefrontContext';
import AdminLayout from './admin/AdminLayout.jsx';
import { Toaster } from 'react-hot-toast';
import AdminLogin from './admin/pages/AdminLogin.jsx';
import Payment from "./pages/Payment.jsx"

function App() {

  return (
    <Router>
      <Toaster
        position="top-center"
        containerStyle={{ zIndex: 20000 }}
        toastOptions={{
          duration: 5000,
        }}
      />
      <StorefrontProvider>
        <AuthProvider>
          <UserAuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Routes>
                  {/* 
                  Admin Route 
                  Hidden management route behind secret key sequence.
                */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/*" element={<AdminLayout />} />

                  {/* Storefront Routes */}
                  <Route
                    path="/*"
                    element={
                      <div className="App flex flex-col min-h-screen relative">
                        <Navbar />
                        <main className="flex-1">
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/product/:slug" element={<ProductDetail />} />

                            <Route path="/signin" element={<Signin />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/wishlist" element={<WishlistPage />} />
                            <Route path="/account" element={<AccountDashboard />} />
                            <Route path="/checkout" element={<CheckoutRoute />} />
                           <Route path="/payment-gateway" element={<Payment />} />
                          </Routes>
                        </main>
                        <Footer />
                      </div>
                    }
                  />
                </Routes>
              </WishlistProvider>
            </CartProvider>
          </UserAuthProvider>
        </AuthProvider>
      </StorefrontProvider>
    </Router>
  );
}

export default App;
