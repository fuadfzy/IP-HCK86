import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function QRSessionPage() {
  const { tableCode } = useParams(); // Get table code from URL
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    createSession();
  }, [tableCode]);

  const createSession = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate table code format
      if (!tableCode || !tableCode.match(/^TBL-\d{3}$/)) {
        throw new Error('Invalid table code format');
      }

      // Simulate API call to create session
      // In real implementation, this would call backend API
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qr_code: tableCode
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const sessionData = await response.json();
      setSessionData(sessionData);

      // Start countdown timer
      let timeLeft = 5;
      setCountdown(timeLeft);
      
      const timer = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        
        if (timeLeft <= 0) {
          clearInterval(timer);
          navigate('/login', { 
            state: { 
              sessionId: sessionData.id,
              tableCode: tableCode 
            }
          });
        }
      }, 1000);

    } catch (error) {
      console.error('Session creation error:', error);
      setError(error.message);
      
      // Fallback: redirect to landing page with error
      setTimeout(() => {
        navigate('/', { 
          state: { 
            error: 'Failed to connect to table. Please try again.',
            tableCode: tableCode 
          }
        });
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    createSession();
  };

  return (
    <div className="min-vh-100 bg-dark">
      {/* Header */}
      <div className="bg-dark bg-opacity-50 py-3">
        <div className="px-3 d-flex align-items-center justify-content-between">
          <button 
            onClick={() => navigate('/')}
            className="btn btn-link text-light p-0"
            style={{minWidth: '44px', minHeight: '44px'}}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-center">
            <h1 className="h5 fw-bold mb-0 text-light">Table Connection</h1>
            <p className="small mb-0 text-light text-opacity-75">{tableCode || 'Processing...'}</p>
          </div>
          
          <div style={{width: '44px'}}></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 d-flex align-items-center justify-content-center" style={{minHeight: 'calc(100vh - 80px)'}}>
        <div className="text-center w-100">
          
          {isLoading ? (
            // Loading State
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-light bg-opacity-15" 
                     style={{width: '80px', height: '80px'}}>
                  <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
                <h2 className="h4 fw-bold mb-2 text-light">Connecting to Table</h2>
                <p className="text-light text-opacity-75 small">Creating your session for {tableCode}...</p>
              </div>
            </div>
          ) : error ? (
            // Error State  
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-25" 
                     style={{width: '80px', height: '80px'}}>
                  <svg width="40" height="40" fill="currentColor" className="text-danger" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h2 className="h4 fw-bold mb-2 text-danger">Connection Failed</h2>
                <p className="text-light text-opacity-75 small mb-4">{error}</p>
                
                <div className="text-center">
                  <button 
                    onClick={handleRetry}
                    className="btn btn-light w-100 py-3 fw-semibold"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Success State
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-25" 
                     style={{width: '80px', height: '80px'}}>
                  <svg width="40" height="40" fill="currentColor" className="text-success" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="h4 fw-bold mb-2 text-success">Connected Successfully!</h2>
                <p className="text-light text-opacity-75 small mb-3">Session created for {tableCode}</p>
                
                <div className="bg-dark bg-opacity-50 rounded-4 p-3 mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-light text-opacity-75 small">Session ID:</span>
                    <span className="text-light small font-monospace">{sessionData?.id || 'N/A'}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-light text-opacity-75 small">Status:</span>
                    <span className="badge bg-success">Active</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-light text-opacity-75 small mb-3">Redirecting to login in {countdown} seconds...</p>
                  <div className="d-flex align-items-center justify-content-center gap-2 text-light text-opacity-50">
                    <div className="spinner-border spinner-border-sm" role="status"></div>
                    <span className="small">Please wait</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QRSessionPage;
