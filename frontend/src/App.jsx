import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import LandingPage from './pages/LandingPage';
import SessionPage from './pages/SessionPage';
import QRSessionPage from './pages/QRSessionPage';
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import ChoicePage from './pages/ChoicePage';
import MenuPage from './pages/MenuPage';
import ChatPage from './pages/ChatPage';
import CartPage from './pages/CartPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFinishPage from './pages/PaymentFinishPage';
import PaymentUnfinishPage from './pages/PaymentUnfinishPage';
import PaymentErrorPage from './pages/PaymentErrorPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="mobile-app-container">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/session" element={<SessionPage />} />
            <Route path="/session/:tableCode" element={<QRSessionPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/choice" element={<ChoicePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/finish" element={<PaymentFinishPage />} />
            <Route path="/payment/unfinish" element={<PaymentUnfinishPage />} />
            <Route path="/payment/error" element={<PaymentErrorPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
