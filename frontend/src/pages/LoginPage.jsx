import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get session data from navigation state (if coming from QR scan)
  const sessionData = location.state;

  const handleGoogleLogin = () => {
    setIsLoading(true);
    
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/auth/google`;
  };

  return (
    <div className="min-vh-100 bg-dark">
      {/* Floating Navbar - consistent with landing page */}
      <nav className="position-fixed top-0 start-50 translate-middle-x z-3" style={{padding: '8px 0', width: '100%', maxWidth: '390px'}}>
        <div style={{margin: '0 12px'}}>
          <div className="bg-light text-dark rounded-4 px-3 py-2">
            <div className="d-flex justify-content-between align-items-center">
              <div className="navbar-brand d-flex align-items-center mb-0">
                <span className="fs-5 me-2">🍽️</span>
                <span className="fw-semibold fs-6">TableTalk</span>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="btn btn-link text-dark p-0"
                style={{minWidth: '32px', minHeight: '32px'}}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="d-flex align-items-center justify-content-center text-white px-3" style={{minHeight: '100vh', paddingTop: '70px'}}>
        <div className="text-center w-100">
          <div className="bg-dark bg-opacity-75 rounded-4 p-4 border border-secondary border-opacity-25">
            <div className="mb-4">
              <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-light bg-opacity-15" 
                   style={{width: '70px', height: '70px'}}>
                <span className="fs-1">🔐</span>
              </div>
              <h1 className="h4 fw-bold mb-2 text-light">Welcome Back!</h1>
              <p className="text-light text-opacity-75 small">Please login to access your menu</p>
            </div>
            
            <div>
              <h3 className="h6 fw-semibold mb-3 text-light">Continue with</h3>
              <button 
                className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-3 py-3 fw-semibold"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                style={{borderRadius: '12px'}}
              >
                {isLoading ? (
                  <>
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M44.5 20H24v8.5h12.7c-1.5 4.6-5.8 8-11.2 8c-6.3 0-11.5-5.2-11.5-11.5S19.2 13.5 25.5 13.5c2.7 0 5.1 1 7 2.6l5.6-5.6C34.7 7.5 30.4 5.5 25.5 5.5C14.8 5.5 6 14.3 6 25s8.8 19.5 19.5 19.5c9.7 0 18.5-8.8 18.5-19.5c0-1.3-.8-3.2-1.5-5Z"/>
                      <path fill="#FF3D00" d="M6 14.3l8.7 6.3c2.2-4.5 6.4-7.1 10.8-7.1c2.7 0 5.1 1 7 2.6l5.6-5.6C34.7 7.5 30.4 5.5 25.5 5.5c-7.9 0-14.8 5.2-17.4 12.1Z"/>
                      <path fill="#4CAF50" d="M25.5 44.5c5.3 0 10-2.3 13.2-5.8l-7.1-5.6c-1.9 1.3-4.3 2.1-6.1 2.1c-5.4 0-9.7-3.4-11.2-8l-8.3 6.5c2.6 6.9 9.5 11.8 19.5 11.8Z"/>
                      <path fill="#1976D2" d="M44.5 20H24v8.5h12.7c-.7 2.2-2.1 4.1-4 5.4l7.4 5.7c3.1-2.9 5.4-7.3 5.4-12.1c0-1.8-.3-3.6-1-5.5Z"/>
                    </svg>
                    <span>Login with Google</span>
                  </>
                )}
              </button>
              
              <div className="mt-3">
                <p className="text-light text-opacity-50 small mb-0">
                  By continuing, you agree to our terms of service
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
