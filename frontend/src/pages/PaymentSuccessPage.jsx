import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const orderData = location.state?.orderData;
  const paymentResult = location.state?.result;
  const user = location.state?.user || JSON.parse(localStorage.getItem('user') || '{}');

  // Auto redirect if no order data
  useEffect(() => {
    if (!orderData) {
      navigate('/choice');
    }
  }, [orderData, navigate]);

  const handleOrderAgain = () => {
    // Clear any remaining cart data and start fresh
    localStorage.removeItem('cartItems');
    localStorage.removeItem('chatMessages');
    navigate('/choice');
  };

  const handleViewOrder = () => {
    // Navigate to order history page
    navigate('/orders');
  };

  return (
    <div className="min-vh-100 bg-dark">
      {/* Floating Navbar */}
      <nav className="position-fixed top-0 start-50 translate-middle-x z-3" style={{padding: '8px 0', width: '100%', maxWidth: '390px'}}>
        <div style={{margin: '0 12px'}}>
          <div className="bg-light text-dark rounded-4 px-3 py-2">
            <div className="d-flex justify-content-center">
              <div className="navbar-brand d-flex align-items-center mb-0">
                <span className="fs-5 me-2">🍽️</span>
                <span className="fw-semibold fs-6">TableTalk</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="d-flex align-items-center justify-content-center text-white px-3" style={{minHeight: '100vh', paddingTop: '70px'}}>
        <div className="text-center w-100">
          <div className="bg-dark bg-opacity-75 rounded-4 p-4 border border-secondary border-opacity-25">
            
            {/* Success Icon */}
            <div className="mb-4">
              <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-25" 
                   style={{width: '80px', height: '80px'}}>
                <svg width="40" height="40" fill="currentColor" className="text-success" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>
              <h1 className="h4 fw-bold mb-2 text-success">Payment Successful!</h1>
              <p className="text-light text-opacity-75 small mb-4">
                Thank you, {user.name?.split(' ')[0] || 'Guest'}! Your order has been confirmed.
              </p>
            </div>

            {/* Order Details */}
            {orderData && (
              <div className="bg-success bg-opacity-10 rounded-3 p-3 mb-4 border border-success border-opacity-25">
                <h3 className="h6 fw-bold mb-2 text-light">Order Details</h3>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-start">
                    <small className="text-light text-opacity-75">Order ID</small>
                    <p className="text-light fw-semibold mb-1">#{orderData.id}</p>
                    <small className="text-light text-opacity-75">Total</small>
                    <p className="text-success fw-bold mb-0">
                      Rp {orderData.total?.toLocaleString('id-ID') || '0'}
                    </p>
                  </div>
                  <div className="text-end">
                    <small className="text-light text-opacity-75">Status</small>
                    <p className="text-success fw-semibold mb-1">
                      <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                      Paid
                    </p>
                    <small className="text-light text-opacity-75">Payment Method</small>
                    <p className="text-light fw-semibold mb-0">Midtrans</p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="mb-4">
              <h3 className="h6 fw-semibold mb-3 text-light">What's next?</h3>
              <div className="d-flex align-items-start gap-3 text-start mb-3">
                <div className="bg-primary bg-opacity-20 rounded-circle p-2 mt-1">
                  <svg width="16" height="16" fill="currentColor" className="text-primary" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <div className="flex-grow-1">
                  <h6 className="text-light mb-1">Order Processing</h6>
                  <small className="text-light text-opacity-75">
                    Your order is being prepared by our kitchen team
                  </small>
                </div>
              </div>
              
              <div className="d-flex align-items-start gap-3 text-start">
                <div className="bg-warning bg-opacity-20 rounded-circle p-2 mt-1">
                  <svg width="16" height="16" fill="currentColor" className="text-warning" viewBox="0 0 24 24">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                </div>
                <div className="flex-grow-1">
                  <h6 className="text-light mb-1">Estimated Time</h6>
                  <small className="text-light text-opacity-75">
                    Your order will be ready in 15-30 minutes
                  </small>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-grid gap-3">
              <button 
                className="btn btn-primary fw-semibold py-3"
                onClick={handleOrderAgain}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" className="me-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Order Again
              </button>
              
              <button 
                className="btn btn-outline-light"
                onClick={handleViewOrder}
              >
                View Order History
              </button>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-top border-secondary border-opacity-25">
              <p className="text-light text-opacity-50 small mb-0">
                Thank you for choosing TableTalk! 🍽️
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccessPage;
