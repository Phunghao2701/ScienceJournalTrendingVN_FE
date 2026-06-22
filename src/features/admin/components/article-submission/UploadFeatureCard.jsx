import React from 'react';
import { Card } from 'react-bootstrap';
import Icon from '../../../../shared/components/Icon';

/**
 * UploadFeatureCard Component
 * Displays a feature highlight badge card used below upload file zone.
 * 
 * @param {Object} props - Props
 * @param {string} props.title - Feature title
 * @param {string} props.description - Feature details text
 * @param {string} props.icon - Lucide iconify name
 */
export default function UploadFeatureCard({ title, description, icon }) {
  return (
    <Card 
      className="p-3 border rounded-3 bg-white h-100"
      style={{ boxShadow: 'none' }}
    >
      <div className="d-flex flex-column gap-2">
        {/* Bullet Icon indicator */}
        <div 
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)'
          }}
        >
          <Icon icon={icon} width="16" />
        </div>

        {/* Feature title & description details */}
        <div>
          <h6 className="fw-bold text-main mb-1" style={{ fontSize: '0.88rem' }}>{title}</h6>
          <p className="text-muted-custom small mb-0 lh-sm" style={{ fontSize: '0.78rem' }}>
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}
