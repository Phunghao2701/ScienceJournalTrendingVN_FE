import React from 'react';

/**
 * AdminFooter Component
 * Renders the page footer aligned at the bottom of administrative content.
 */
export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <div 
      className="d-flex flex-column flex-md-row align-items-center justify-content-between px-4 py-3 border-top mt-auto bg-white"
      style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
    >
      {/* Copyright branding */}
      <div className="mb-2 mb-md-0">
        © {currentYear} ResearchPulse Admin. All rights reserved.
      </div>

      {/* Useful helper links matching the mockup footer */}
      <div className="d-flex gap-4">
        <a href="#privacy" className="text-decoration-none text-muted-custom hover-primary">Privacy Policy</a>
        <a href="#terms" className="text-decoration-none text-muted-custom hover-primary">Terms of Service</a>
        <a href="#docs" className="text-decoration-none text-muted-custom hover-primary">Documentation</a>
        <a href="#support" className="text-decoration-none text-muted-custom hover-primary">Contact Support</a>
      </div>
    </div>
  );
}
