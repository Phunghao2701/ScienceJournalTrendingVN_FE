import React from 'react';

/**
 * UI/UX Pro Max Page Loading Bar
 * Minimalist top progress bar with pulsing glow and layout skeleton.
 */
export default function PageLoadingBar() {
  return (
    <div
      role="progressbar"
      aria-label="Loading page..."
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '40vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '6rem',
      }}
    >
      {/* Top Nano Progress Line */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          zIndex: 99999,
          background: 'rgba(59, 130, 246, 0.1)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #06b6d4, #6366f1)',
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.7)',
            animation: 'pageLoadingPulse 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          }}
        />
      </div>

      {/* Subtle pulse spinner and skeleton */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          opacity: 0.85,
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '3px solid rgba(59, 130, 246, 0.2)',
            borderTopColor: '#2563eb',
            animation: 'pageLoadingSpin 0.75s linear infinite',
          }}
        />
        <span
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted, #64748b)',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          Loading content...
        </span>
      </div>

      <style>{`
        @keyframes pageLoadingPulse {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pageLoadingSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
