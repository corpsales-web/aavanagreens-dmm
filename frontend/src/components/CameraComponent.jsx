import React, { useState, useRef, useCallback } from 'react';
import { initializeCamera, capturePhoto, stopCameraStream, checkCameraAvailability } from '../utils/cameraUtils';

const CameraComponent = ({ onPhotoCapture, onClose, title = "Camera Capture" }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [error, setError] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = useCallback(async () => {
    setError(null);
    
    try {
      // Stop any existing stream first
      if (cameraStream) {
        stopCameraStream(cameraStream);
        setCameraStream(null);
      }

      // Initialize camera with comprehensive error handling
      const result = await initializeCamera({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'environment' // Back camera for better photos
        }
      });

      if (result.success) {
        setCameraStream(result.stream);
        if (videoRef.current) {
          videoRef.current.srcObject = result.stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(err => {
              console.error('Video play failed:', err);
              setError('📷 Video preview failed but camera may still work for capture.');
            });
          };
        }
        setCameraActive(true);
        setError(null);
        console.log('✅ Camera component initialized successfully');
        
      } else {
        setError(result.message);
        setCameraActive(false);
        console.error('Camera initialization failed:', result.error);
      }
      
    } catch (err) {
      console.error('Unexpected camera error:', err);
      setError('📷 Unexpected camera error. Please try again or use file upload instead.');
      setCameraActive(false);
    }
  }, [cameraStream]);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      stopCameraStream(cameraStream);
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, [cameraStream]);

  const handleCapturePhoto = useCallback(() => {
    if (!videoRef.current || !cameraStream) {
      setError('Camera not ready for capture');
      return;
    }

    try {
      // Use the comprehensive capture utility
      const result = capturePhoto(videoRef.current, 0.8);
      
      if (result.success) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `camera-capture-${timestamp}.jpg`;
        
        const newImage = {
          id: Date.now(),
          file: new File([result.blob], filename, { type: 'image/jpeg' }),
          blob: result.blob,
          dataURL: result.dataURL,
          url: URL.createObjectURL(result.blob),
          timestamp: new Date(),
          dimensions: result.dimensions
        };
        
        setCapturedImages(prev => [...prev, newImage]);
        
        // Notify parent component
        if (onPhotoCapture) {
          onPhotoCapture(newImage);
        }

        setError(null);
        console.log('✅ Photo captured successfully:', result.dimensions);
        
      } else {
        setError(result.message);
        console.error('Photo capture failed:', result.error);
      }
      
    } catch (error) {
      console.error('Unexpected capture error:', error);
      setError('📷 Failed to capture photo. Please try again.');
    }
  }, [onPhotoCapture, cameraStream]);

  const removeImage = useCallback((imageId) => {
    setCapturedImages(prev => {
      const updated = prev.filter(img => img.id !== imageId);
      // Clean up URL
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return updated;
    });
  }, []);

  const handleClose = useCallback(() => {
    stopCamera();
    // Clean up URLs
    capturedImages.forEach(image => {
      URL.revokeObjectURL(image.url);
    });
    setCapturedImages([]);
    if (onClose) {
      onClose();
    }
  }, [stopCamera, capturedImages, onClose]);

  return (
    <div className="camera-component">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={startCamera}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {!cameraActive && !error && (
        <div className="text-center">
          <div className="mb-4 p-6 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-4xl mb-2">📸</div>
            <p className="text-gray-600">Ready to capture photos</p>
          </div>
          <button
            onClick={startCamera}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            📷 Start Camera
          </button>
        </div>
      )}

      {cameraActive && (
        <div className="text-center">
          <div className="mb-4 bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleCapturePhoto}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
            >
              📸 Capture Photo
            </button>
            <button
              onClick={stopCamera}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Stop Camera
            </button>
          </div>
        </div>
      )}

      {/* Display captured images */}
      {capturedImages.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Captured Photos ({capturedImages.length})
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {capturedImages.map((image) => (
              <div key={image.id} className="relative">
                <img
                  src={image.url}
                  alt="Captured"
                  className="w-full h-20 object-cover rounded border"
                />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraComponent;