import React from 'react';

class ResizeObserverErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Check if this is a ResizeObserver error
    if (error && error.message && 
        (error.message.includes('ResizeObserver loop completed with undelivered notifications') ||
         error.message.includes('ResizeObserver loop limit exceeded'))) {
      // Don't update state for ResizeObserver errors, just ignore them
      return null;
    }
    
    // For other errors, update state to show fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Check if this is a ResizeObserver error
    if (error && error.message && 
        (error.message.includes('ResizeObserver loop completed with undelivered notifications') ||
         error.message.includes('ResizeObserver loop limit exceeded'))) {
      // Silently ignore ResizeObserver errors
      return;
    }
    
    // Log other errors
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI for non-ResizeObserver errors
      return <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

export default ResizeObserverErrorBoundary;