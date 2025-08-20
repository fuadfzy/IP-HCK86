import React from 'react';
import { useNavigate } from 'react-router-dom';

function SessionPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-primary text-white py-3">
        <div className="px-3 d-flex align-items-center justify-content-between">
          <button 
            onClick={() => navigate('/')}
            className="btn btn-link text-white p-0"
            style={{minWidth: '44px', minHeight: '44px'}}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-center">
            <h1 className="h5 fw-bold mb-0">Table Session</h1>
            <p className="small mb-0 text-white-50">Session Active</p>
          </div>
          
          <div style={{width: '44px'}}></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 d-flex align-items-center justify-content-center" style={{minHeight: 'calc(100vh - 80px)'}}>
        <div className="text-center w-100">
          <div className="bg-white rounded-4 p-4 shadow">
            <div className="mb-4">
              <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-25" 
                   style={{width: '70px', height: '70px'}}>
                <svg width="35" height="35" fill="currentColor" className="text-success" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="h4 fw-bold mb-2 text-success">Table Connected!</h1>
              <p className="text-muted small">Session ID: session_12345</p>
            </div>
            
            <div className="mb-4">
              <h2 className="h6 fw-semibold">Please login to continue</h2>
              <p className="text-muted small mb-0">Login to access menu and place your order</p>
            </div>
            
            <button 
              className="btn btn-primary w-100 py-3 fw-semibold" 
              onClick={handleLogin}
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionPage;
