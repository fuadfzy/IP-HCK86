import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SessionPage from './pages/SessionPage';
import QRSessionPage from './pages/QRSessionPage';
import LoginPage from './pages/LoginPage';
import MenuPage from './pages/MenuPage';
import ChatPage from './pages/ChatPage';
import CartPage from './pages/CartPage';
import PaymentPage from './pages/PaymentPage';
import './index.css';

function App() {
  return (
    <Router>
      <div className="mobile-app-container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/session/:tableCode" element={<QRSessionPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/payment" element={<PaymentPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
