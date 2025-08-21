import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function ChoicePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('warning');
  
  // Get user data from location state or localStorage
  const user = location.state?.user || JSON.parse(localStorage.getItem('user') || '{}');

  // Show alert if there's a message from payment cancellation
  useEffect(() => {
    if (location.state?.message) {
      setAlertMessage(location.state.message);
      setAlertType(location.state.type || 'warning');
      setShowAlert(true);
      // Auto-hide alert after 5 seconds
      setTimeout(() => setShowAlert(false), 5000);
      
      // Clear the state to prevent showing alert again on back navigation
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location.state, location.pathname]);

  const handleChatWithAI = () => {
    navigate('/chat', { state: { user } });
  };

  const handleGoToMenu = () => {
    navigate('/menu', { state: { user } });
  };

  const handleViewOrderHistory = () => {
    navigate('/orders');
  };

  // Custom styles for shimmer animation
  const shimmerStyles = `
    .choice-card {
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .choice-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        rgba(255, 255, 255, 0.2),
        rgba(255, 255, 255, 0.1),
        transparent
      );
      transition: left 0.6s ease;
      z-index: 1;
    }
    
    .choice-card:hover::before {
      left: 100%;
    }
    
    .choice-card:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.4) !important;
      background: rgba(255, 255, 255, 0.05) !important;
    }
    
    /* Mobile touch states - override Bootstrap defaults */
    .choice-card:active,
    .choice-card:focus,
    .choice-card.btn:active,
    .choice-card.btn:focus {
      background: rgba(255, 255, 255, 0.05) !important;
      border-color: rgba(255, 255, 255, 0.4) !important;
      color: #ffffff !important;
      transform: translateY(-1px);
      box-shadow: none !important;
    }
    
    .choice-card:active::before,
    .choice-card:focus::before {
      left: 100%;
      transition: left 0.4s ease;
    }
    
    /* Ensure text stays visible on all states */
    .choice-card .choice-card-content,
    .choice-card:active .choice-card-content,
    .choice-card:focus .choice-card-content,
    .choice-card:hover .choice-card-content {
      color: #ffffff !important;
    }
    
    .choice-card-content {
      position: relative;
      z-index: 2;
    }
    
    /* Force text colors to stay white */
    .choice-card h3,
    .choice-card p,
    .choice-card svg,
    .choice-card:active h3,
    .choice-card:active p,
    .choice-card:active svg,
    .choice-card:focus h3,
    .choice-card:focus p,
    .choice-card:focus svg {
      color: #ffffff !important;
    }
  `;

  return (
    <div className="min-vh-100 bg-dark">
      {/* Add custom styles */}
      <style>{shimmerStyles}</style>
      
      {/* Floating Navbar */}
      <nav className="position-fixed top-0 start-50 translate-middle-x z-3" style={{padding: '8px 0', width: '100%', maxWidth: '390px'}}>
        <div style={{margin: '0 12px'}}>
          <div className="bg-light text-dark rounded-4 px-3 py-2">
            <div className="d-flex justify-content-between align-items-center">
              <div className="navbar-brand d-flex align-items-center mb-0">
                <span className="fs-5 me-2">🍽️</span>
                <span className="fw-semibold fs-6">TableTalk</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Hi, {user.name?.split(' ')[0] || 'Guest'}</span>
                <button 
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/');
                  }}
                  className="btn btn-link text-dark p-0"
                  style={{minWidth: '32px', minHeight: '32px'}}
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Alert for payment cancellation */}
      {showAlert && alertMessage && (
        <div className="position-fixed w-100 z-2" style={{top: '80px', maxWidth: '390px', left: '50%', transform: 'translateX(-50%)'}}>
          <div style={{margin: '0 12px'}}>
            <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
              <div className="d-flex align-items-center">
                <i className={`bi bi-${alertType === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2`}></i>
                <small>{alertMessage}</small>
              </div>
              <button 
                type="button" 
                className="btn-close btn-close-dark" 
                onClick={() => setShowAlert(false)}
                style={{fontSize: '10px'}}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="d-flex align-items-center justify-content-center text-white px-3" style={{minHeight: '100vh', paddingTop: '70px'}}>
        <div className="text-center w-100">
          <div className="bg-dark bg-opacity-75 rounded-4 p-4 border border-secondary border-opacity-25">
            
            {/* Welcome Section */}
            <div className="mb-4">
              <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-light bg-opacity-15" 
                   style={{width: '70px', height: '70px'}}>
                <span className="fs-1">👋</span>
              </div>
              <h1 className="h4 fw-bold mb-2 text-light">Welcome, {user.name?.split(' ')[0] || 'Guest'}!</h1>
              <p className="text-light text-opacity-75 small mb-4">How would you like to order today?</p>
            </div>
            
            {/* Choice Buttons */}
            <div className="d-grid gap-3">
              
              {/* Chat with AI Option */}
              <button 
                className="choice-card btn btn-outline-light d-flex align-items-center justify-content-start gap-3 p-4 text-start"
                onClick={handleChatWithAI}
                style={{borderRadius: '16px', border: '2px solid rgba(255,255,255,0.2)'}}
              >
                <div className="choice-card-content d-flex align-items-center justify-content-start gap-3 w-100">
                  <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-20" 
                       style={{width: '50px', height: '50px', minWidth: '50px'}}>
                    <span className="fs-4">🤖</span>
                  </div>
                  <div className="flex-grow-1">
                    <h3 className="h6 fw-bold mb-1 text-light">Chat with AI Assistant</h3>
                    <p className="small text-light text-opacity-75 mb-0">
                      Get personalized recommendations and ask questions about our menu
                    </p>
                  </div>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-light text-opacity-50">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Browse Menu Option */}
              <button 
                className="choice-card btn btn-outline-light d-flex align-items-center justify-content-start gap-3 p-4 text-start"
                onClick={handleGoToMenu}
                style={{borderRadius: '16px', border: '2px solid rgba(255,255,255,0.2)'}}
              >
                <div className="choice-card-content d-flex align-items-center justify-content-start gap-3 w-100">
                  <div className="d-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-20" 
                       style={{width: '50px', height: '50px', minWidth: '50px'}}>
                    <span className="fs-4">📋</span>
                  </div>
                  <div className="flex-grow-1">
                    <h3 className="h6 fw-bold mb-1 text-light">Browse Menu</h3>
                    <p className="small text-light text-opacity-75 mb-0">
                      Explore our full menu and add items to your order directly
                    </p>
                  </div>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-light text-opacity-50">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Order History Option */}
              <button 
                className="choice-card btn btn-outline-light d-flex align-items-center justify-content-start gap-3 p-4 text-start"
                onClick={handleViewOrderHistory}
                style={{borderRadius: '16px', border: '2px solid rgba(255,255,255,0.2)'}}
              >
                <div className="choice-card-content d-flex align-items-center justify-content-start gap-3 w-100">
                  <div className="d-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-20" 
                       style={{width: '50px', height: '50px', minWidth: '50px'}}>
                    <span className="fs-4">⏰</span>
                  </div>
                  <div className="flex-grow-1">
                    <h3 className="h6 fw-bold mb-1 text-light">Order History</h3>
                    <p className="small text-light text-opacity-75 mb-0">
                      View your previous orders and order again easily
                    </p>
                  </div>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-light text-opacity-50">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

            </div>

            {/* Footer Info */}
            <div className="mt-4 pt-3 border-top border-secondary border-opacity-25">
              <p className="text-light text-opacity-50 small mb-0">
                Choose your preferred way to order or check your order history
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChoicePage;
