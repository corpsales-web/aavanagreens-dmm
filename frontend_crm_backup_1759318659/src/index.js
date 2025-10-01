import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import resizeObserverErrorHandler from "./utils/resizeObserverErrorHandler";

// Initialize unified ResizeObserver error handling
// This replaces all previous ResizeObserver error suppression approaches
resizeObserverErrorHandler.initialize();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
