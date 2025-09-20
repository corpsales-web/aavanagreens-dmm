/**
 * Camera Utility Functions
 * Comprehensive camera handling for containerized and production environments
 */

/**
 * Check if camera devices are available
 */
export const checkCameraAvailability = async () => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return { available: false, reason: 'NO_MEDIA_DEVICES_API' };
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    if (videoDevices.length === 0) {
      return { available: false, reason: 'NO_CAMERA_DEVICES' };
    }

    return { available: true, devices: videoDevices };
  } catch (error) {
    console.error('Camera availability check failed:', error);
    return { available: false, reason: 'ENUMERATION_FAILED', error };
  }
};

/**
 * Initialize camera with proper error handling
 */
export const initializeCamera = async (constraints = {}) => {
  try {
    // Try multiple constraint strategies for maximum compatibility
    const constraintStrategies = [
      // Strategy 1: Basic video only
      { video: true, audio: false },
      
      // Strategy 2: Specific constraints
      {
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user'
        },
        audio: false
      },
      
      // Strategy 3: Custom constraints
      constraints.video ? constraints : { video: true, audio: false }
    ];

    let stream = null;
    let lastError = null;

    for (let i = 0; i < constraintStrategies.length; i++) {
      try {
        console.log(`Trying camera strategy ${i + 1}:`, constraintStrategies[i]);
        stream = await navigator.mediaDevices.getUserMedia(constraintStrategies[i]);
        console.log(`✅ Camera strategy ${i + 1} successful`);
        break;
      } catch (error) {
        console.log(`❌ Camera strategy ${i + 1} failed:`, error.name);
        lastError = error;
        if (i < constraintStrategies.length - 1) {
          console.log(`Trying next strategy...`);
        }
      }
    }

    if (!stream) {
      throw lastError || new Error('All camera strategies failed');
    }
    
    return {
      success: true,
      stream,
      message: 'Camera initialized successfully'
    };

  } catch (error) {
    console.error('Camera initialization failed:', error);
    
    // Log additional debug information
    console.log('Camera error details:', {
      name: error.name,
      message: error.message,
      constraint: error.constraint,
      userAgent: navigator.userAgent,
      isHttps: window.location.protocol === 'https:',
      isLocalhost: window.location.hostname === 'localhost'
    });
    
    return {
      success: false,
      error: error.name || 'UNKNOWN_ERROR',
      message: getErrorMessage(error.name || 'UNKNOWN_ERROR'),
      fallbackOptions: getFallbackOptions(error.name || 'UNKNOWN_ERROR')
    };
  }
};

/**
 * Capture photo from video stream
 */
export const capturePhoto = (videoElement, quality = 0.8) => {
  try {
    console.log('📸 Starting photo capture...');
    
    if (!videoElement) {
      throw new Error('Video element not provided');
    }
    
    console.log('📸 Video element state:', {
      readyState: videoElement.readyState,
      videoWidth: videoElement.videoWidth,
      videoHeight: videoElement.videoHeight,
      paused: videoElement.paused,
      ended: videoElement.ended
    });
    
    // More lenient check for Safari - allow readyState 2 (HAVE_CURRENT_DATA) or higher
    if (videoElement.readyState < 2) {
      throw new Error('Video not ready for capture (readyState: ' + videoElement.readyState + ')');
    }
    
    // Check if video has actual dimensions
    if (!videoElement.videoWidth || !videoElement.videoHeight) {
      throw new Error('Video dimensions not available (width: ' + videoElement.videoWidth + ', height: ' + videoElement.videoHeight + ')');
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Could not get canvas 2D context');
    }
    
    // Set canvas dimensions to match video
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    console.log('📸 Canvas dimensions:', { width: canvas.width, height: canvas.height });
    
    // Draw current video frame to canvas
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Convert to data URL
    const dataURL = canvas.toDataURL('image/jpeg', quality);
    
    if (!dataURL || dataURL === 'data:,') {
      throw new Error('Failed to generate image data from canvas');
    }
    
    console.log('📸 Photo captured successfully, data size:', dataURL.length);
    
    return {
      success: true,
      dataURL,
      blob: dataURLToBlob(dataURL),
      dimensions: { width: canvas.width, height: canvas.height }
    };

  } catch (error) {
    console.error('📸 Photo capture failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to capture photo. Please try again.'
    };
  }
};

/**
 * Stop camera stream properly
 */
export const stopCameraStream = (stream) => {
  try {
    if (stream && stream.getTracks) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped ${track.kind} track:`, track.label);
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error stopping camera stream:', error);
    return false;
  }
};

/**
 * Get user-friendly error messages
 */
const getErrorMessage = (errorType) => {
  const messages = {
    'NO_MEDIA_DEVICES_API': '📷 Camera API not available. Please use a modern browser like Chrome, Firefox, or Safari.',
    'NO_CAMERA_DEVICES': '📷 No camera found. Please ensure your camera is connected and working.',
    'ENUMERATION_FAILED': '📷 Unable to access camera. Please check your camera permissions.',
    'NotAllowedError': '📷 Camera access denied. Please click "Allow" when prompted for camera permissions.',
    'NotFoundError': '📷 Camera not found. Please ensure your camera is connected and working properly.',
    'NotReadableError': '📷 Camera is busy. Please close other apps using the camera and try again.',
    'OverconstrainedError': '📷 Camera settings not supported. Trying with standard settings.',
    'SecurityError': '📷 Camera blocked by security settings. Please enable camera access for this site.',
    'AbortError': '📷 Camera access interrupted. Please try again.',
    'UNKNOWN_ERROR': '📷 Camera error. Please try again or contact support.'
  };

  return messages[errorType] || messages['UNKNOWN_ERROR'];
};

/**
 * Get fallback options based on error type
 */
const getFallbackOptions = (errorType) => {
  const fallbacks = {
    'NO_CAMERA_DEVICES': [
      { type: 'RETRY', label: 'Try Again', description: 'Retry camera access' },
      { type: 'GPS', label: 'Use GPS Location', description: 'Use your location for check-in' }
    ],
    'NotAllowedError': [
      { type: 'PERMISSIONS', label: 'Enable Camera', description: 'Allow camera access and try again' },
      { type: 'GPS', label: 'Use GPS Location', description: 'Alternative check-in method' }
    ],
    'NotFoundError': [
      { type: 'RETRY', label: 'Try Again', description: 'Check camera connection and retry' },
      { type: 'GPS', label: 'Use GPS Location', description: 'Use your location for check-in' }
    ],
    'NotReadableError': [
      { type: 'RETRY', label: 'Try Again', description: 'Close other camera apps and retry' },
      { type: 'GPS', label: 'Use GPS Location', description: 'Alternative method' }
    ]
  };

  return fallbacks[errorType] || fallbacks['NO_CAMERA_DEVICES'];
};

/**
 * Convert data URL to Blob
 */
const dataURLToBlob = (dataURL) => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
};

/**
 * Check if current environment supports camera
 */
export const isEnvironmentSupported = () => {
  const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  
  return {
    https: isHttps,
    mediaDevices: hasMediaDevices,
    supported: isHttps && hasMediaDevices,
    issues: [
      ...(!isHttps ? ['Camera requires HTTPS or localhost'] : []),
      ...(!hasMediaDevices ? ['Browser does not support camera access'] : [])
    ]
  };
};

/**
 * Get device information for debugging
 */
export const getDeviceInfo = async () => {
  try {
    const environment = isEnvironmentSupported();
    const availability = await checkCameraAvailability();
    
    return {
      userAgent: navigator.userAgent,
      environment,
      availability,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};