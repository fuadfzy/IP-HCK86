import { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

function PaymentErrorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    // Get error details from URL params or state
    const transactionStatus = searchParams.get('transaction_status');
    const orderId = searchParams.get('order_id');
    const statusMessage = searchParams.get('status_message');
    
    console.log('Payment error redirect:', { transactionStatus, orderId, statusMessage });
  }, [searchParams]);

  const errorMessage = location.state?.error || 
                      searchParams.get('status_message') || 
                      'Payment failed. Please try again.';

  const handleRetry = () => {
    navigate('/menu');
  };

  const handleHome = () => {
    navigate('/choice');
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-dark">
      <div className="container" style={{ maxWidth: '390px' }}>
        <div className="text-center text-white">
          <div className="mb-4">
            <i className="bi bi-x-circle text-danger" style={{ fontSize: '4rem' }}></i>
          </div>
          
          <h3 className="mb-3">Payment Failed</h3>
          <p className="text-muted mb-4">{errorMessage}</p>
          
          <div className="d-grid gap-3">
            <button 
              className="btn btn-primary btn-lg"
              onClick={handleRetry}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>
            
            <button 
              className="btn btn-outline-light"
              onClick={handleHome}
            >
              <i className="bi bi-house me-2"></i>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentErrorPage;
