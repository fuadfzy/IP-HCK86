import React from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentPage() {
  const navigate = useNavigate();

  return (
    <div className="payment-page">
      <header className="mobile-header">
        <div className="header-content">
          <button 
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            ←
          </button>
          <div className="brand-logo">
            <span className="brand-name">Payment</span>
          </div>
        </div>
      </header>

      <main className="mobile-main">
        <div className="mobile-container">
          <section className="payment-section">
            <div className="payment-content">
              <h1>Complete Payment</h1>
              <p>Midtrans payment integration will be here...</p>
              
              <div className="payment-summary">
                <h3>Order Summary</h3>
                <p>Total: Rp 0</p>
              </div>
              
              <div className="payment-actions">
                <button className="action-btn primary">
                  Pay with Midtrans
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default PaymentPage;
