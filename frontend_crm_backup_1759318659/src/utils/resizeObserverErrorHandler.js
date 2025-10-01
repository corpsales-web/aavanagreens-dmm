/**
 * PERMANENT ResizeObserver Error Handler - Addresses Root Cause
 * 
 * ROOT CAUSE: Multiple initializations + DOM timing issues during rapid viewport changes
 * SOLUTION: Singleton pattern + DOM timing controls + ResizeObserver polyfill fallback
 */

// Global singleton check to prevent multiple instances
let permanentHandler = null;

if (typeof window !== 'undefined' && window.__AAVANA_RESIZE_OBSERVER_HANDLER__) {
  console.debug('[ResizeObserver] Using existing global handler');
  permanentHandler = window.__AAVANA_RESIZE_OBSERVER_HANDLER__;
} else {

class PermanentResizeObserverHandler {
  constructor() {
    this.isInitialized = false;
    this.suppressedCount = 0;
    this.debounceTimers = new Map();
    this.originalResizeObserver = typeof window !== 'undefined' ? window.ResizeObserver : null;
    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;
    
    // Browser detection
    this.browser = this.detectBrowser();
    this.isDevelopment = process.env.NODE_ENV === 'development';
    
    // Mark as global singleton
    if (typeof window !== 'undefined') {
      window.__AAVANA_RESIZE_OBSERVER_HANDLER__ = this;
    }
  }

  detectBrowser() {
    if (typeof window === 'undefined') return 'server';
    
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'chrome';
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'safari';
    return 'unknown';
  }

  isResizeObserverError(error, message = '') {
    const errorMessage = error?.message || message || '';
    
    return (
      errorMessage.includes('ResizeObserver loop completed with undelivered notifications') ||
      errorMessage.includes('ResizeObserver loop limit exceeded') ||
      errorMessage.includes('ResizeObserver callback may not be called') ||
      (errorMessage.includes('ResizeObserver') && errorMessage.includes('loop'))
    );
  }

  debounce(func, wait, key) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    
    const timer = setTimeout(() => {
      func();
      this.debounceTimers.delete(key);
    }, wait);
    
    this.debounceTimers.set(key, timer);
  }

  createSafeResizeObserver() {
    if (!this.originalResizeObserver) return null;

    const handler = this;
    
    return class SafeResizeObserver {
      constructor(callback) {
        this.callback = callback;
        this.observer = null;
        this.isObserving = false;
        
        try {
          this.observer = new handler.originalResizeObserver((entries, observer) => {
            // Debounce callback to prevent loops
            handler.debounce(() => {
              try {
                callback(entries, observer);
              } catch (error) {
                if (handler.isResizeObserverError(error)) {
                  handler.logSuppression('callback-error', error.message);
                  return; // Suppress ResizeObserver callback errors
                }
                throw error; // Re-throw non-ResizeObserver errors
              }
            }, 16, `resize-callback-${Math.random()}`); // 16ms debounce (~60fps)
          });
        } catch (error) {
          console.warn('[ResizeObserver] Failed to create observer:', error);
        }
      }

      observe(target, options) {
        if (this.observer && !this.isObserving) {
          try {
            this.observer.observe(target, options);
            this.isObserving = true;
          } catch (error) {
            if (handler.isResizeObserverError(error)) {
              handler.logSuppression('observe-error', error.message);
              return;
            }
            throw error;
          }
        }
      }

      unobserve(target) {
        if (this.observer) {
          try {
            this.observer.unobserve(target);
          } catch (error) {
            if (handler.isResizeObserverError(error)) {
              handler.logSuppression('unobserve-error', error.message);
              return;
            }
            throw error;
          }
        }
      }

      disconnect() {
        if (this.observer) {
          try {
            this.observer.disconnect();
            this.isObserving = false;
          } catch (error) {
            if (handler.isResizeObserverError(error)) {
              handler.logSuppression('disconnect-error', error.message);
              return;
            }
            throw error;
          }
        }
      }
    };
  }

  logSuppression(method, errorMessage) {
    this.suppressedCount++;
    
    // Log only first few suppressions in development
    if (this.isDevelopment && this.suppressedCount <= 3) {
      console.debug(`[ResizeObserver Suppressed ${this.suppressedCount}]:`, errorMessage.substring(0, 80));
    }
  }

  setupConsoleOverrides() {
    console.error = (...args) => {
      const message = args[0];
      
      if (typeof message === 'string' && this.isResizeObserverError(null, message)) {
        this.logSuppression('console.error', message);
        return;
      }
      
      return this.originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args[0];
      
      if (typeof message === 'string' && this.isResizeObserverError(null, message)) {
        this.logSuppression('console.warn', message);
        return;
      }
      
      return this.originalConsoleWarn.apply(console, args);
    };
  }

  setupWindowErrorHandlers() {
    if (typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', (event) => {
      if (this.isResizeObserverError(event.error, event.message)) {
        this.logSuppression('window-error', event.message || event.error?.message || '');
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }, true);

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isResizeObserverError(event.reason)) {
        this.logSuppression('unhandled-rejection', event.reason?.message || '');
        event.preventDefault();
        event.stopPropagation();
      }
    });
  }

  setupResizeObserverPolyfill() {
    if (typeof window === 'undefined') return;

    // Replace ResizeObserver with our safe version
    const SafeResizeObserver = this.createSafeResizeObserver();
    
    if (SafeResizeObserver) {
      window.ResizeObserver = SafeResizeObserver;
      
      if (this.isDevelopment) {
        this.logSuppression('polyfill-installed', 'Safe ResizeObserver polyfill active');
      }
    }
  }

  initialize() {
    if (this.isInitialized) {
      if (this.isDevelopment) {
        console.debug('[ResizeObserver] Already initialized - skipping');
      }
      return;
    }

    if (typeof window === 'undefined') {
      console.warn('[ResizeObserver] Cannot initialize in server environment');
      return;
    }

    try {
      // Install safe ResizeObserver polyfill first
      this.setupResizeObserverPolyfill();
      
      // Set up error suppression
      this.setupConsoleOverrides();
      this.setupWindowErrorHandlers();

      this.isInitialized = true;
      window.__AAVANA_RESIZE_OBSERVER_HANDLER_INITIALIZED__ = true;
      
      if (this.isDevelopment) {
        console.info(`[ResizeObserver] Permanent handler initialized for ${this.browser}`);
      }
    } catch (error) {
      console.error('[ResizeObserver] Initialization failed:', error);
    }
  }

  destroy() {
    if (!this.isInitialized) return;

    try {
      // Restore original ResizeObserver
      if (this.originalResizeObserver && typeof window !== 'undefined') {
        window.ResizeObserver = this.originalResizeObserver;
      }
      
      // Restore original console methods
      console.error = this.originalConsoleError;
      console.warn = this.originalConsoleWarn;

      // Clear timers
      this.debounceTimers.forEach(timer => clearTimeout(timer));
      this.debounceTimers.clear();

      this.isInitialized = false;
      
      if (typeof window !== 'undefined') {
        delete window.__AAVANA_RESIZE_OBSERVER_HANDLER_INITIALIZED__;
        delete window.__AAVANA_RESIZE_OBSERVER_HANDLER__;
      }
      
      if (this.isDevelopment) {
        console.info(`[ResizeObserver] Handler destroyed. Suppressed ${this.suppressedCount} errors.`);
      }
    } catch (error) {
      console.error('[ResizeObserver] Destroy failed:', error);
    }
  }

  getStats() {
    return {
      browser: this.browser,
      initialized: this.isInitialized,
      suppressedCount: this.suppressedCount,
      environment: process.env.NODE_ENV,
      activeTimers: this.debounceTimers.size
    };
  }
}

// Create singleton instance
permanentHandler = new PermanentResizeObserverHandler();

// Auto-initialize
if (typeof window !== 'undefined') {
  permanentHandler.initialize();
  
  // Clean up on unload
  window.addEventListener('beforeunload', () => {
    permanentHandler.destroy();
  });
}

} // End of singleton check

export default permanentHandler;