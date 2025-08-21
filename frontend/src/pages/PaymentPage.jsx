import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder } from '../features/orders/orderSlice';

function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get payment data from navigation state
  const cartItems = location.state?.cartItems || [];
  const user = location.state?.user || JSON.parse(localStorage.getItem('user') || '{}');
  const total = location.state?.total || 0;
  const sessionId = location.state?.sessionId || localStorage.getItem('sessionId');
  
  // Check if paying for existing order
  const existingOrderId = location.state?.existingOrderId;
  const orderItems = location.state?.orderItems || [];
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log('PaymentPage - Location state:', location.state);
    console.log('PaymentPage - ExistingOrderId:', existingOrderId);
    console.log('PaymentPage - OrderItems:', orderItems);
    console.log('PaymentPage - CartItems:', cartItems);
    console.log('PaymentPage - Total:', total);
  }, []);

  // Redirect if no items to pay for
  useEffect(() => {
    if (!existingOrderId && cartItems.length === 0) {
      navigate('/cart');
    }
  }, [existingOrderId, cartItems, navigate]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      let orderData;

      if (existingOrderId) {
        // For existing order, use the order ID directly
        orderData = { 
          order_id: existingOrderId, 
          id: existingOrderId,
          total: total 
        };
        console.log('Using existing order:', orderData);
      } else {
        // Create new order flow (existing logic)
        
        // First, check if session exists from QR scan
        console.log('Existing sessionId from state or localStorage:', sessionId);
        if (!sessionId) {
          throw new Error('No active session found. Please scan QR code at your table first.');
        }

        // Then, create order with the session
        const orderResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            session_id: sessionId,
            items: cartItems.map(item => ({
              menu_item_id: item.id,
              quantity: item.quantity
            }))
          })
        });

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          console.error('Order creation failed:', errorData);
          throw new Error(errorData.error || 'Failed to create order');
        }

        orderData = await orderResponse.json();
        console.log('Order created successfully:', orderData);
        
        // Clear cart immediately after order is created successfully
        if (!existingOrderId) {
          localStorage.removeItem('cartItems');
          console.log('Cart cleared after order creation');
        }
      }

      // Then, create payment transaction
      const paymentResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: orderData.order_id || orderData.id
        })
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || 'Failed to create payment');
      }

      const paymentData = await paymentResponse.json();

      // Ensure Midtrans Snap is loaded
      const waitForSnap = () => {
        return new Promise((resolve, reject) => {
          if (window.snap) {
            resolve();
          } else {
            let attempts = 0;
            const checkSnap = setInterval(() => {
              attempts++;
              if (window.snap) {
                clearInterval(checkSnap);
                resolve();
              } else if (attempts > 50) { // 5 seconds timeout
                clearInterval(checkSnap);
                reject(new Error('Midtrans Snap failed to load'));
              }
            }, 100);
          }
        });
      };

      await waitForSnap();

      // Load Midtrans Snap and open payment popup
      window.snap.pay(paymentData.token, {
          onSuccess: function(result) {
            // Clear session and chat after successful payment
            localStorage.removeItem('chatMessages');
            localStorage.removeItem('sessionId'); // Clear session after successful payment
            navigate('/payment/success', { 
              state: { 
                orderData: {
                  ...orderData,
                  id: orderData.order_id || orderData.id
                },
                result,
                user,
                isExistingOrder: !!existingOrderId
              }
            });
          },
          onPending: function(result) {
            console.log('Payment pending:', result);
            setError('Payment is pending. Please complete your payment.');
          },
          onError: function(result) {
            console.log('Payment error:', result);
            navigate('/payment/error', {
              state: {
                error: 'Payment failed. Please try again.',
                result
              }
            });
          },
          onClose: function() {
            console.log('Payment popup closed by user');
            // User closed popup without completing payment
            navigate('/choice', {
              replace: true, // Replace history entry to prevent back button issues
              state: {
                message: 'Payment was cancelled. Your order is saved as pending - you can complete payment from Order History.',
                type: 'warning',
                order_id: orderData.order_id || orderData.id
              }
            });
          }
        });

    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTotalItems = () => {
    if (existingOrderId && orderItems.length > 0) {
      return orderItems.reduce((total, item) => total + item.quantity, 0);
    }
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="min-vh-100 bg-dark">
      {/* Load Midtrans Snap */}
      <script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key={import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "Mid-client-3bbLny3K2qpguDWU"}
      ></script>

      {/* Floating Navbar */}
      <nav className="position-fixed top-0 start-50 translate-middle-x z-3" style={{padding: '8px 0', width: '100%', maxWidth: '390px'}}>
        <div style={{margin: '0 12px'}}>
          <div className="bg-light text-dark rounded-4 px-3 py-2">
            <div className="d-flex justify-content-between align-items-center">
              <button 
                onClick={() => existingOrderId ? navigate('/orders') : navigate('/cart')}
                className="btn btn-link text-dark p-0"
                style={{minWidth: '32px', minHeight: '32px'}}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="navbar-brand d-flex align-items-center mb-0">
                <span className="fs-5 me-2">💳</span>
                <span className="fw-semibold fs-6">Payment</span>
              </div>
              <div style={{width: '32px'}}></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="d-flex flex-column" style={{minHeight: '100vh', paddingTop: '70px', paddingBottom: '100px'}}>
        <div className="flex-grow-1 px-3 pb-3" style={{paddingTop: '1rem'}}>
          
          {/* Order Summary */}
          <div className="bg-dark bg-opacity-75 rounded-4 p-4 border border-secondary border-opacity-25 mb-3">
            <h2 className="h5 fw-bold text-light mb-3">
              {existingOrderId ? `Order #${existingOrderId}` : 'Order Summary'}
            </h2>
            
            {/* Display items from either cart or existing order */}
            {(existingOrderId ? orderItems : cartItems).map((item, index) => (
              <div key={existingOrderId ? index : item.id} className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary border-opacity-25">
                <div>
                  <h6 className="text-light mb-1">
                    {existingOrderId ? item.MenuItem?.name : item.name}
                  </h6>
                  <small className="text-light text-opacity-75">
                    Rp {(existingOrderId ? item.MenuItem?.price : item.price)?.toLocaleString('id-ID')} x {item.quantity}
                  </small>
                </div>
                <span className="text-success fw-semibold">
                  Rp {(existingOrderId ? item.total_price : (item.price * item.quantity)).toLocaleString('id-ID')}
                </span>
              </div>
            ))}
            
            <div className="d-flex justify-content-between align-items-center pt-3 mt-3 border-top border-secondary border-opacity-25">
              <h5 className="text-light mb-0">
                Total ({existingOrderId ? orderItems.reduce((sum, item) => sum + item.quantity, 0) : getTotalItems()} items)
              </h5>
              <h4 className="text-success fw-bold mb-0">
                Rp {total.toLocaleString('id-ID')}
              </h4>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-dark bg-opacity-75 rounded-4 p-4 border border-secondary border-opacity-25 mb-3">
            <h2 className="h6 fw-bold text-light mb-3">Customer Information</h2>
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-20 rounded-circle p-2">
                <svg width="20" height="20" fill="currentColor" className="text-primary" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
              <div>
                <h6 className="text-light mb-1">{user.name || 'Guest'}</h6>
                <small className="text-light text-opacity-75">{user.email || 'No email'}</small>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-danger bg-opacity-20 border border-danger border-opacity-50 rounded-4 p-3 mb-3">
              <div className="d-flex align-items-center gap-2">
                <svg width="20" height="20" fill="currentColor" className="text-danger" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span className="text-danger small">{error}</span>
              </div>
            </div>
          )}

        </div>

        {/* Payment Button - Fixed */}
        <div className="position-fixed bottom-0 start-50 translate-middle-x w-100" style={{maxWidth: '390px', padding: '12px'}}>
          <div className="bg-dark bg-opacity-90 rounded-4 p-3 border border-secondary border-opacity-25">
            <div className="d-grid gap-2">
              <button 
                className="btn btn-success fw-semibold py-3"
                onClick={handlePayment}
                disabled={isProcessing || (!existingOrderId && cartItems.length === 0)}
              >
                {isProcessing ? (
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    Pay Rp {total.toLocaleString('id-ID')}
                  </>
                )}
              </button>
              <small className="text-center text-light text-opacity-50">
                Powered by Midtrans
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
