import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/QRScanner';

function LandingPage() {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Handle QR scan - open camera scanner
  const handleQrScan = () => {
    setShowQRScanner(true);
  };

  // Handle QR scan result
  const handleQRScanResult = (tableNumber) => {
    console.log('QR Code scanned, table number:', tableNumber);
    setIsLoading(true);
    
    // Simulate API call to create session
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/session/${tableNumber}`);
    }, 1000);
  };

  // Close QR scanner
  const handleCloseQRScanner = () => {
    setShowQRScanner(false);
  };

  return (
    <div className="min-vh-100 bg-dark">
      {/* Bootstrap Navbar - Floating Island Style - Mobile Width */}
      <nav className="position-fixed top-0 start-50 translate-middle-x z-3" style={{padding: '8px 0', width: '100%', maxWidth: '390px'}}>
        <div style={{margin: '0 12px'}}>
          <div className="bg-light text-dark rounded-4 px-3 py-2">
            <div className="d-flex justify-content-start">
              <div className="navbar-brand d-flex align-items-center mb-0">
                <span className="fs-5 me-2">🍽️</span>
                <span className="fw-semibold fs-6">TableTalk</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Fixed Mobile Width */}
      <div className="d-flex align-items-center justify-content-center text-white px-3" style={{minHeight: '100vh', paddingTop: '70px'}}>
        <div className="text-center w-100 px-3">
          
          {/* Logo & Brand - Mobile Optimized */}
          <div className="mb-4">
            <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-light bg-opacity-15 border border-light border-opacity-25" 
                 style={{width: '70px', height: '70px'}}>
              <span className="fs-1">🍽️</span>
            </div>
            <h1 className="display-6 fw-bold mb-2">TableTalk</h1>
            <p className="fs-6 text-light text-opacity-75 fw-light">Smart Restaurant Ordering</p>
          </div>

          {/* Main CTA - Mobile Optimized */}
          <div className="mb-4">
            <h2 className="h5 fw-semibold mb-2">Ready to Order?</h2>
            <p className="text-light text-opacity-75 mb-4 small">Scan your table QR code to get started</p>
            
            {/* Primary Action - QR Scan Only */}
            <button 
              className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-2 mb-3 fw-semibold py-3 fs-6"
              onClick={handleQrScan}
              disabled={isLoading}
              style={{borderRadius: '12px'}}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-dark">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M16 4h4.01M12 4H8.01M4 8h4.01M4 12h4.01M4 16h4.01M8 20h4.01" />
              </svg>
              <span>Scan QR Code</span>
            </button>

            <p className="text-light text-opacity-50 small text-center">
              🔍 Look for the QR code on your table
            </p>
          </div>
        </div>
      </div>

      {/* Features Preview - Mobile Width */}
      <div className="bg-dark bg-opacity-50 py-4 border-top border-secondary border-opacity-25">
        <div className="px-3">
          <div className="text-center">
            <h3 className="h6 fw-semibold text-light mb-3">What's Next?</h3>
            
            <div className="row g-3 mx-0">
              <div className="col-12 px-2">
                <div className="bg-light text-dark rounded-4 h-100" style={{padding: '16px'}}>
                  <div className="text-center">
                    <div className="fs-4 mb-2">🍜</div>
                    <h6 className="fw-semibold mb-1">Browse Menu</h6>
                    <p className="small mb-0 opacity-75">Explore delicious dishes with photos</p>
                  </div>
                </div>
              </div>
              
              <div className="col-12 px-2">
                <div className="bg-light text-dark rounded-4 h-100" style={{padding: '16px'}}>
                  <div className="text-center">
                    <div className="fs-4 mb-2">🤖</div>
                    <h6 className="fw-semibold mb-1">AI Assistant</h6>
                    <p className="small mb-0 opacity-75">Get personalized recommendations</p>
                  </div>
                </div>
              </div>
              
              <div className="col-12 px-2">
                <div className="bg-light text-dark rounded-4 h-100" style={{padding: '16px'}}>
                  <div className="text-center">
                    <div className="fs-4 mb-2">💳</div>
                    <h6 className="fw-semibold mb-1">Easy Payment</h6>
                    <p className="small mb-0 opacity-75">Secure checkout options</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works - Mobile Width */}
      <div className="bg-dark bg-opacity-75 py-4 border-top border-secondary border-opacity-25">
        <div className="px-3">
          <h3 className="h6 fw-semibold text-center text-light mb-3">How It Works</h3>
          
          <div className="d-flex flex-column gap-3">
            <div className="d-flex align-items-start gap-3">
              <div className="bg-light text-dark rounded-circle d-flex align-items-center justify-content-center fw-semibold flex-shrink-0" style={{width: '32px', height: '32px', fontSize: '13px'}}>
                1
              </div>
              <div className="flex-grow-1">
                <h6 className="fw-semibold mb-1 small text-light">Scan QR Code</h6>
                <p className="text-light text-opacity-75 small mb-0" style={{fontSize: '13px'}}>Find QR code on your table and scan</p>
              </div>
            </div>
            
            <div className="d-flex align-items-start gap-3">
              <div className="bg-light text-dark rounded-circle d-flex align-items-center justify-content-center fw-semibold flex-shrink-0" style={{width: '32px', height: '32px', fontSize: '13px'}}>
                2
              </div>
              <div className="flex-grow-1">
                <h6 className="fw-semibold mb-1 small text-light">Login & Browse</h6>
                <p className="text-light text-opacity-75 small mb-0" style={{fontSize: '13px'}}>Quick login and explore menu</p>
              </div>
            </div>
            
            <div className="d-flex align-items-start gap-3">
              <div className="bg-light text-dark rounded-circle d-flex align-items-center justify-content-center fw-semibold flex-shrink-0" style={{width: '32px', height: '32px', fontSize: '13px'}}>
                3
              </div>
              <div className="flex-grow-1">
                <h6 className="fw-semibold mb-1 small text-light">Order & Pay</h6>
                <p className="text-light text-opacity-75 small mb-0" style={{fontSize: '13px'}}>Add items to cart and pay securely</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay - Mobile Optimized */}
      {isLoading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-white bg-dark bg-opacity-75" 
             style={{zIndex: 1050}}>
          <div className="text-center">
            <div className="spinner-border text-white mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="fw-medium fs-6">Connecting to table...</p>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      <QRScanner 
        isOpen={showQRScanner}
        onClose={handleCloseQRScanner}
        onScan={handleQRScanResult}
      />
    </div>
  );
}

export default LandingPage;

