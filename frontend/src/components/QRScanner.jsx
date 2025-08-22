import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

function QRScanner({ isOpen, onClose, onScan }) {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const startScanner = async () => {
      try {
        // Check if camera is available
        const hasCamera = await QrScanner.hasCamera();
        setHasCamera(hasCamera);
        
        if (!hasCamera) {
          console.log('No camera found');
          return;
        }

        // Create QR Scanner instance
        const qrScanner = new QrScanner(
          videoRef.current,
          (result) => {
            console.log('QR Code detected:', result.data);
            
            // Check if it's a full URL (direct scan) or table code (in-app scan)
            if (result.data.includes('localhost') || result.data.includes('http')) {
              // Direct URL scan - redirect immediately
              window.location.href = result.data;
            } else {
              // Table code scan - extract table number
              const tableMatch = result.data.match(/TBL-(\d+)/i);
              const tableNumber = tableMatch ? tableMatch[1] : result.data;
              
              // Call onScan callback for in-app handling
              onScan(tableNumber);
            }
            
            // Stop scanner and close
            qrScanner.stop();
            onClose();
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );

        qrScannerRef.current = qrScanner;
        
        // Start scanning
        await qrScanner.start();
        setIsScanning(true);
        
      } catch (error) {
        console.error('Error starting QR scanner:', error);
        setHasCamera(false);
      }
    };

    startScanner();

    // Cleanup function
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    };
  }, [isOpen, onScan, onClose]);

  const handleClose = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark d-flex align-items-center justify-content-center" style={{zIndex: 9999}}>
      <div className="w-100 h-100 position-relative">
        
        {/* Header */}
        <div className="position-absolute top-0 start-0 end-0 z-3 p-3">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="text-white mb-0 h5 fw-semibold">Scan QR Code</h3>
            <button 
              onClick={handleClose}
              className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
              style={{width: '40px', height: '40px'}}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Camera View */}
        <div className="w-100 h-100 d-flex align-items-center justify-content-center">
          {hasCamera ? (
            <div className="position-relative w-100 h-100">
              <video 
                ref={videoRef}
                className="w-100 h-100 object-fit-cover"
                style={{objectFit: 'cover'}}
                playsInline
                muted
              />
              
              {/* Scanning Overlay */}
              <div className="position-absolute top-50 start-50 translate-middle">
                <div 
                  className="border border-white border-opacity-75 rounded-3"
                  style={{
                    width: '250px',
                    height: '250px',
                    borderWidth: '2px',
                    borderStyle: 'dashed',
                    animation: isScanning ? 'pulse 2s infinite' : 'none'
                  }}
                >
                  <div className="h-100 d-flex align-items-center justify-content-center">
                    <div className="text-center">
                      <div className="text-white mb-2">
                        <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M16 4h4.01M12 4H8.01M4 8h4.01M4 12h4.01M4 16h4.01M8 20h4.01" />
                        </svg>
                      </div>
                      <p className="text-white small mb-0">Position QR code here</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-white p-4">
              <div className="mb-3">
                <svg width="60" height="60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-7-6h14" />
                </svg>
              </div>
              <h4 className="h5 mb-2">No Camera Available</h4>
              <p className="text-white-50 small">Please allow camera access or enter table number manually</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="position-absolute bottom-0 start-0 end-0 p-4">
          <div className="bg-dark bg-opacity-75 rounded-4 p-3 text-center">
            <p className="text-white small mb-2">Point your camera at the QR code on your table</p>
            <p className="text-white-50 small mb-0">Make sure the code is clearly visible and well-lit</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRScanner;
