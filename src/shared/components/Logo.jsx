import React from 'react';
import Icon from './Icon';

/**
 * Logo component that matches the style of the ResearchPulse header.
 * 
 * @param {Object} props - Component props
 * @param {number} props.size - Size of the icon box (default: 32)
 * @param {string} props.fontSize - Font size of the text (default: '1.25rem')
 * @param {string} props.className - Custom class names
 */
export default function Logo({ size = 32, fontSize = '1.25rem', className = '', ...props }) {
  return (
    <div 
      className={`d-flex align-items-center text-main fw-bold ${className}`} 
      style={{ fontFamily: "var(--font-display)", fontWeight: 800, cursor: "pointer", ...props.style }} 
      {...props}
    >
      {/* Icon block resembling the original brand design */}
      <div
        className="d-flex align-items-center justify-content-center me-2"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "8px",
          background: "var(--btn-dark)",
          boxShadow: "0 0 10px rgba(7, 26, 28, 0.15)",
        }}
      >
        <Icon icon="lucide:activity" className="text-white text-sm" />
      </div>
      <span style={{ fontSize }}>ResearchPulse</span>
    </div>
  );
}
