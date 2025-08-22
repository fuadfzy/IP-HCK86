import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function PaymentFinishPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get transaction status from URL params
    const transactionStatus = searchParams.get('transaction_status');
    const orderId = searchParams.get('order_id');
    
    console.log('Payment finish redirect:', { transactionStatus, orderId });

    // Clear cart since payment is finished (success or not)
    localStorage.removeItem('cartItems');
    localStorage.removeItem('chatMessages');
    localStorage.removeItem('sessionId');

    // Redirect based on transaction status
    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
      // Payment successful
      navigate('/payment/success', { 
        state: { 
          orderData: { id: orderId },
          result: { transaction_status: transactionStatus }
        }
      });
    } else {
      // Payment not successful, redirect to error page
      navigate('/payment/error', {
        state: {
          error: `Payment ${transactionStatus}. Please try again.`,
          transactionStatus
        }
      });
    }
  }, [navigate, searchParams]);

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-dark">
      <div className="text-center text-white">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Processing payment result...</p>
      </div>
    </div>
  );
}

export default PaymentFinishPage;
