import React from 'react';
import { useNavigate } from 'react-router-dom';

function CartPage() {
  const navigate = useNavigate();

  return (
    <div className="cart-page">
      <header className="mobile-header">
        <div className="header-content">
          <button 
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            ←
          </button>
          <div className="brand-logo">
            <span className="brand-name">Your Cart</span>
          </div>
        </div>
      </header>

      <main className="mobile-main">
        <div className="mobile-container">
          <section className="cart-section">
            <div className="cart-content">
              <h1>Your Order</h1>
              <p>Cart items will be displayed here...</p>
              
              <div className="cart-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => navigate('/payment')}
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default CartPage;
