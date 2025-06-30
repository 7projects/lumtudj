// Snackbar.js
import React, { useEffect } from 'react';
 

const Snackbar = ({ message, show, duration = 1000, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <div className={`snackbar ${show ? 'show' : ''}`}>
      {message}
    </div>
  );
};

export default Snackbar;
