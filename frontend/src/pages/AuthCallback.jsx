import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get token and user data from URL params
        const token = searchParams.get('token');
        const userString = searchParams.get('user');
        
        if (!token || !userString) {
          throw new Error('Missing authentication data');
        }

        // Parse user data
        const userData = JSON.parse(decodeURIComponent(userString));
        
        // Store token and user data in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Get sessionId from localStorage (set by QRSessionPage)
        const sessionId = localStorage.getItem('sessionId');
        
        // Small delay for UX
        setTimeout(() => {
          setIsProcessing(false);
          
          // Navigate to choice page after successful login
          setTimeout(() => {
            navigate('/choice', { 
              state: { 
                user: userData,
                loginSuccess: true,
                sessionId: sessionId // Pass sessionId to choice page
              }
            });
          }, 1000);
        }, 1000);

      } catch (error) {
        console.error('Auth callback error:', error);
        setError(error.message);
        setIsProcessing(false);
        
        // Redirect to login with error after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              error: 'Login failed. Please try again.' 
            }
          });
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

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

      {/* Content */}
      <div className="d-flex align-items-center justify-content-center text-white px-3" style={{minHeight: '100vh', paddingTop: '70px'}}>
        <div className="text-center w-100">
          <div className="bg-dark bg-opacity-75 rounded-4 p-4 border border-secondary border-opacity-25">
            
            {isProcessing ? (
              // Processing State
              <div className="mb-4">
                <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-light bg-opacity-15" 
                     style={{width: '70px', height: '70px'}}>
                  <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
                <h2 className="h4 fw-bold mb-2 text-light">Processing Login...</h2>
                <p className="text-light text-opacity-75 small">Please wait while we log you in</p>
              </div>
            ) : error ? (
              // Error State
              <div className="mb-4">
                <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-25" 
                     style={{width: '70px', height: '70px'}}>
                  <svg width="35" height="35" fill="currentColor" className="text-danger" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h2 className="h4 fw-bold mb-2 text-danger">Login Failed</h2>
                <p className="text-light text-opacity-75 small mb-3">{error}</p>
                <p className="text-light text-opacity-50 small">Redirecting to login page...</p>
              </div>
            ) : (
              // Success State
              <div className="mb-4">
                <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-25" 
                     style={{width: '70px', height: '70px'}}>
                  <svg width="35" height="35" fill="currentColor" className="text-success" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="h4 fw-bold mb-2 text-success">Login Successful!</h2>
                <p className="text-light text-opacity-75 small mb-3">Welcome to TableTalk</p>
                <p className="text-light text-opacity-50 small">Redirecting to menu...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthCallback;
