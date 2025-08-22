import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function FloatingOrderHistoryButton() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    navigate('/orders');
  };

  return (
    <div className="position-fixed" style={{ bottom: '20px', left: '20px', zIndex: 1000 }}>
      {/* Tooltip */}
      <div 
        className={`position-absolute bg-dark text-white px-3 py-2 rounded-3 shadow-lg transition-all ${isHovered ? 'opacity-100 translate-middle-y' : 'opacity-0'}`}
        style={{
          bottom: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.3s ease',
          pointerEvents: 'none'
        }}
      >
        Order History
        {/* Arrow pointing down */}
        <div 
          className="position-absolute"
          style={{
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #212529'
          }}
        />
      </div>

      {/* Main Button */}
      <button
        className="btn btn-outline-light rounded-circle shadow-lg"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '56px',
          height: '56px',
          border: '2px solid rgba(255,255,255,0.3)',
          backgroundColor: 'rgba(33, 37, 41, 0.9)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        }}
        title="Order History"
      >
        <div className="d-flex flex-column align-items-center">
          <div className="d-flex align-items-center mb-1">
            <span style={{ fontSize: '16px' }}>⏰</span>
            <i className="bi bi-receipt fs-6 text-light ms-1"></i>
          </div>
          <div style={{ fontSize: '8px', lineHeight: '1', color: 'rgba(255,255,255,0.8)' }}>
            History
          </div>
        </div>
      </button>
    </div>
  );
}

export default FloatingOrderHistoryButton;
