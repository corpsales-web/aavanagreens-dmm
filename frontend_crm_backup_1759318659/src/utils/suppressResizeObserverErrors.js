// Utility to suppress ResizeObserver errors in development
export const suppressResizeObserverErrors = () => {
  // Override the React DevTools error handler
  if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    const originalOnErrorOverlay = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onErrorOverlay;
    if (originalOnErrorOverlay) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onErrorOverlay = (error) => {
        if (error && error.message && error.message.includes('ResizeObserver loop completed with undelivered notifications')) {
          // Don't show error overlay for ResizeObserver errors
          return;
        }
        return originalOnErrorOverlay(error);
      };
    }
  }

  // Override React's error overlay completely for ResizeObserver errors
  if (process.env.NODE_ENV === 'development') {
    const originalConsoleError = console.error;
    
    // Override console.error to filter out ResizeObserver errors from React's error overlay
    console.error = (...args) => {
      const message = args[0];
      
      // Skip ResizeObserver errors completely
      if (typeof message === 'string' && 
          (message.includes('ResizeObserver loop completed with undelivered notifications') ||
           message.includes('ResizeObserver loop limit exceeded'))) {
        return;
      }
      
      // Skip React error overlay messages for ResizeObserver
      if (typeof message === 'string' && 
          message.includes('The above error occurred in') && 
          args.join(' ').includes('ResizeObserver')) {
        return;
      }
      
      return originalConsoleError.apply(console, args);
    };
  }

  // Disable React's runtime error overlay for ResizeObserver errors
  if (typeof window !== 'undefined' && window.ReactDOM && window.ReactDOM.render) {
    const originalRender = window.ReactDOM.render;
    window.ReactDOM.render = function(...args) {
      try {
        return originalRender.apply(this, args);
      } catch (error) {
        if (error && error.message && error.message.includes('ResizeObserver')) {
          // Silently ignore ResizeObserver errors during rendering
          return;
        }
        throw error;
      }
    };
  }
};

// Also export a function to handle uncaught errors
export const handleUncaughtResizeObserverErrors = () => {
  // Handle uncaught promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && 
        event.reason.message.includes('ResizeObserver')) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && 
        event.error.message.includes('ResizeObserver')) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
};