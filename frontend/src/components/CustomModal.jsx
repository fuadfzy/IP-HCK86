import React from 'react';

function CustomModal({ 
  show, 
  onHide, 
  title, 
  message, 
  type = 'info', // 'info', 'success', 'warning', 'danger'
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  showCancel = false,
  isLoading = false
}) {
  if (!show) return null;

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: 'bi-check-circle', color: 'success' };
      case 'warning':
        return { icon: 'bi-exclamation-triangle', color: 'warning' };
      case 'danger':
        return { icon: 'bi-x-circle', color: 'danger' };
      default:
        return { icon: 'bi-info-circle', color: 'primary' };
    }
  };

  const { icon, color } = getIconAndColor();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onHide();
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '350px' }}>
        <div className="modal-content bg-dark border border-secondary">
          <div className="modal-body text-center p-4">
            {/* Icon */}
            <div className="mb-3">
              <i className={`bi ${icon} text-${color}`} style={{ fontSize: '3rem' }}></i>
            </div>
            
            {/* Title */}
            {title && (
              <h5 className="text-light mb-3">{title}</h5>
            )}
            
            {/* Message */}
            <p className="text-light mb-4">{message}</p>
            
            {/* Buttons */}
            <div className="d-flex gap-2 justify-content-center">
              {showCancel && (
                <button 
                  className="btn btn-outline-secondary"
                  onClick={onHide}
                  disabled={isLoading}
                >
                  {cancelText}
                </button>
              )}
              
              <button 
                className={`btn btn-${color}`}
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Loading...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomModal;
