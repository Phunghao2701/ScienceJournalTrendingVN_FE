import React from 'react';
import { Nav } from 'react-bootstrap';
import Icon from '../../../../shared/components/Icon';

/**
 * SubmissionTabs Component
 * Toggles between Manual Entry and PDF Upload submission modes.
 * 
 * @param {Object} props - Props
 * @param {string} props.activeTab - Active tab identifier: 'manual' or 'pdf'
 * @param {function} props.onTabChange - Callback on tab click
 */
export default function SubmissionTabs({ activeTab, onTabChange }) {
  return (
    <Nav className="nav nav-tabs tab-nav-custom mb-4 border-bottom-0 gap-4" style={{ paddingLeft: '1rem' }}>
      {/* Manual Entry Tab */}
      <Nav.Item>
        <button 
          className={`nav-link bg-transparent px-0 pb-3 fw-medium d-flex align-items-center gap-2 ${
            activeTab === 'manual' 
              ? 'active' 
              : 'text-muted-custom'
          }`}
          onClick={() => onTabChange('manual')}
          style={{ transition: 'all 0.2s' }}
        >
          <Icon icon="lucide:edit-3" width="18" />
          <span>Manual Entry</span>
        </button>
      </Nav.Item>

      {/* PDF Upload Tab */}
      <Nav.Item>
        <button 
          className={`nav-link bg-transparent px-0 pb-3 fw-medium d-flex align-items-center gap-2 ${
            activeTab === 'pdf' 
              ? 'active' 
              : 'text-muted-custom'
          }`}
          onClick={() => onTabChange('pdf')}
          style={{ transition: 'all 0.2s' }}
        >
          <Icon icon="lucide:file-text" width="18" />
          <span>PDF Upload</span>
        </button>
      </Nav.Item>
    </Nav>
  );
}
