/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: app\layouts\AuthLayout.jsx
 */
import { Row, Col } from 'react-bootstrap';

export default function AuthLayout({ banner, children }) {
  return (
    <div 
      className="auth-layout min-vh-100 w-100 overflow-x-hidden d-flex"
      style={{ 
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-sans)'
      }}
    >
      <Row className="g-0 w-100 min-vh-100">
        {/* Left Column: Banner (Hidden on Mobile) */}
        <Col 
          md={6} 
          className="d-none d-md-block h-100 min-vh-100 position-sticky top-0"
        >
          {banner}
        </Col>

        {/* Right Column: Auth Forms */}
        <Col 
          xs={12} 
          md={6} 
          className="auth-form-panel d-flex align-items-center justify-content-center py-5 px-3 px-sm-4 px-md-5 min-vh-100 overflow-y-auto"
          style={{ backgroundColor: 'var(--bg-main)' }}
        >
          <div 
            className="auth-form-shell w-100"
            style={{ 
              maxWidth: '440px',
              animation: 'slide-up 0.4s ease-out'
            }}
          >
            {children}
          </div>
        </Col>
      </Row>

      {/* Animation Styles */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
