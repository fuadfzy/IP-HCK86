import React from 'react';
import { useNavigate } from 'react-router-dom';

function MenuPage() {
  const navigate = useNavigate();

  return (
    <div className="menu-page">
      <header className="mobile-header">
        <div className="header-content">
          <div className="brand-logo">
            <div className="logo-container">
              <span className="logo-icon">🍽️</span>
            </div>
            <span className="brand-name">TableTalk</span>
          </div>
          <button 
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            ←
          </button>
        </div>
      </header>

      <main className="mobile-main">
        <div className="mobile-container">
          <section className="menu-section">
            <div className="menu-header">
              <h1>Our Menu</h1>
              <p>Choose from our delicious selection</p>
            </div>
            
            <div className="menu-content">
              <p>Menu items will be loaded here with real images from database...</p>
              
              <div className="menu-actions">
                <button 
                  className="action-btn secondary"
                  onClick={() => navigate('/chat')}
                >
                  Get AI Recommendations
                </button>
                <button 
                  className="action-btn primary"
                  onClick={() => navigate('/cart')}
                >
                  View Cart
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default MenuPage;
