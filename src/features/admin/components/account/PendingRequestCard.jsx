import React from 'react';
import { Card, Button } from 'react-bootstrap';

/**
 * PendingRequestCard Component
 * Displays a single authorization upgrade or role request.
 * 
 * @param {Object} props - Props
 * @param {Object} props.request - The request item object
 * @param {function} props.onApprove - Callback for approval action
 * @param {function} props.onDecline - Callback for declination action
 */
export default function PendingRequestCard({ request, onApprove, onDecline }) {
  const { id, name, roleRequested, institution } = request;
  
  // Extract initials for mock avatar circle
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card 
      className="p-3 mb-3 border rounded-3 bg-white"
      style={{ boxShadow: 'none', transition: 'border-color 0.2s' }}
    >
      {/* Card Header section: Initials Avatar + Info metadata */}
      <div className="d-flex align-items-center gap-3 mb-2.5">
        {/* Mock Circle Avatar with initials */}
        <div 
          className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#e0f2fe',
            color: '#0369a1',
            fontSize: '0.9rem'
          }}
        >
          {initials}
        </div>
        <div className="overflow-hidden">
          <div className="fw-bold text-main text-truncate" style={{ fontSize: '0.88rem' }}>{name}</div>
          <div className="text-muted-custom text-truncate" style={{ fontSize: '0.72rem', letterSpacing: '0.02em' }}>{institution}</div>
        </div>
      </div>

      {/* Description payload */}
      <p className="text-muted-custom small mb-3 lh-sm">
        Requesting <strong className="text-main">{roleRequested}</strong> role for the Platform.
      </p>

      {/* Action buttons */}
      <div className="d-flex gap-2">
        <Button 
          onClick={() => onApprove(id)}
          className="btn-primary-glow flex-grow-1 border-0 py-1.5 text-xs fw-semibold rounded-pill"
          style={{ fontSize: '0.8rem' }}
        >
          Approve
        </Button>
        <Button 
          onClick={() => onDecline(id)}
          variant="light"
          className="border flex-grow-1 py-1.5 text-xs fw-semibold rounded-pill"
          style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
        >
          Decline
        </Button>
      </div>
    </Card>
  );
}
