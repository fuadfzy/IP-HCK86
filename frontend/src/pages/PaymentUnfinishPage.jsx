import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function PaymentUnfinishPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get transaction details from URL params
    const transactionStatus = searchParams.get('transaction_status');
    const orderId = searchParams.get('order_id');
    
    console.log('Payment unfinish redirect:', { transactionStatus, orderId });

    // User clicked "Back to Order Website" - redirect to choice page
    setTimeout(() => {
      navigate('/choice', {
        replace: true, // Replace history entry to prevent back button issues
        state: {
          message: 'Payment was cancelled. Your order is saved as pending - you can complete payment from Order History.',
          type: 'warning'
        }
      });
    }, 2000);
  }, [navigate, searchParams]);

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-dark">
      <div className="text-center text-white">
        <div className="mb-4">
          <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
        </div>
        <h3 className="mb-3">Payment Cancelled</h3>
        <p className="text-muted mb-4">You cancelled the payment process.</p>
        <div className="spinner-border text-warning mb-3" role="status">
          <span className="visually-hidden">Redirecting...</span>
        </div>
        <p className="small">Redirecting you back to menu...</p>
      </div>
    </div>
  );
}

export default PaymentUnfinishPage;
