/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\catalog\components\JournalResultCard.jsx
 */
import { Card, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function JournalResultCard({
  journal,
  isFollowed = false,
  onFollow,
  onTagClick
}) {
  const navigate = useNavigate();
  const id = journal.id || journal.journal_id;
  const {
    display_name,
    publisher,
    country,
    issn,
    is_open_access,
    quartile,
    subject_category_name,
    subject_area_name,
    metric_value,
    metric_name,
    metric_year
  } = journal;

  return (
    <Card 
      onClick={() => navigate(`/journals/${id}`)}
      className="journal-dark-card mb-3 text-start position-relative transition-all duration-300 card-hover-lift"
      style={{ 
        borderRadius: '16px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer'
      }}
    >
      <Card.Body className="p-4">
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-4">
          
          {/* Main info block (Left) */}
          <div className="flex-grow-1">
            <Link 
              to={`/journals/${id}`} 
              onClick={(e) => e.stopPropagation()}
              className="text-decoration-none text-main hover:text-primary d-block mb-2"
            >
              <h5 className="font-display fw-bold mb-1 fs-5" style={{ letterSpacing: '-0.02em', lineHeight: '1.3' }}>
                {display_name}
              </h5>
            </Link>
            
            {/* Publisher & Meta info line */}
            <div className="d-flex flex-wrap align-items-center gap-2 text-muted-custom text-xs mb-3" style={{ fontSize: '0.8rem' }}>
              <span>{publisher}</span>
              <span className="text-muted-custom">•</span>
              <span>{country}</span>
              <span className="text-muted-custom">•</span>
              <span className="font-monospace">ISSN: {issn}</span>
            </div>

            {/* Badges line */}
            <div className="d-flex flex-wrap align-items-center gap-2">
              
              {quartile && (
                <Badge 
                  className="font-display fw-bold px-2.5 py-1.5"
                  style={{ 
                    borderRadius: '6px', 
                    fontSize: '0.75rem',
                    backgroundColor: quartile === 'Q1' ? 'var(--primary-light)' : 'var(--bg-main)',
                    color: quartile === 'Q1' ? 'var(--primary)' : 'var(--text-muted)',
                    border: '1px solid var(--border)'
                  }}
                >
                  {quartile}
                </Badge>
              )}

              {/* Open Access / Subscription Badge */}
              {is_open_access ? (
                <Badge 
                  bg="success" 
                  className="d-flex align-items-center gap-1 px-2.5 py-1.5 border border-success-20"
                  style={{ borderRadius: '6px', fontSize: '0.75rem', backgroundColor: 'rgba(40, 167, 69, 0.08)', color: '#28a745' }}
                >
                  <Icon icon="lucide:unlock" width="12" />
                  <span>Open Access</span>
                </Badge>
              ) : (
                <Badge 
                  bg="warning" 
                  className="d-flex align-items-center gap-1 px-2.5 py-1.5 border border-warning-20"
                  style={{ borderRadius: '6px', fontSize: '0.75rem', backgroundColor: 'rgba(255, 193, 7, 0.08)', color: '#b28000' }}
                >
                  <Icon icon="lucide:lock" width="12" />
                  <span>Subscription</span>
                </Badge>
              )}

              {/* Subject Category tag */}
              {subject_category_name && (
                <Badge 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onTagClick) onTagClick(subject_category_name);
                  }}
                  className="px-2.5 py-1.5 text-muted-custom hover:text-primary border border-light"
                  style={{ 
                    borderRadius: '6px', 
                    fontSize: '0.72rem', 
                    backgroundColor: 'var(--bg-main)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {subject_category_name}
                </Badge>
              )}

              {/* Subject Area tag */}
              {subject_area_name && subject_area_name !== subject_category_name && (
                <Badge 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onTagClick) onTagClick(subject_area_name);
                  }}
                  className="px-2.5 py-1.5 text-muted-custom hover:text-primary border border-light"
                  style={{ 
                    borderRadius: '6px', 
                    fontSize: '0.72rem', 
                    backgroundColor: 'var(--bg-main)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {subject_area_name}
                </Badge>
              )}
            </div>

          </div>

          {/* Metric & Action button block (Right) */}
          <div className="d-flex flex-row flex-md-column align-items-center align-items-md-end justify-content-between justify-content-md-center gap-3 w-100 w-md-auto border-top border-md-top-0 border-light pt-3 pt-md-0" style={{ minWidth: '130px' }}>
            
            {/* Metric Score */}
            <div className="text-start text-md-end">
              {metric_value ? (
                <>
                  <div className="font-monospace text-primary fw-bold lh-1 fs-3">
                    {metric_value}
                  </div>
                  <div className="text-muted-custom text-uppercase tracking-wide mt-1" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                    {metric_name || 'SJR'}{metric_year ? ` · ${metric_year}` : ''}
                  </div>
                </>
              ) : (
                <span className="text-muted-custom text-xs italic" style={{ fontSize: '0.75rem' }}>Chưa có dữ liệu</span>
              )}
            </div>

            <div className="d-flex flex-wrap align-items-center justify-content-end gap-2">
              <Button
                size="sm"
                variant={isFollowed ? 'outline-success' : 'outline-primary'}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onFollow(id);
                }}
                className={`d-flex align-items-center justify-content-center gap-1.5 px-3 py-1.5 fw-semibold ${isFollowed ? 'bg-success-10' : 'btn-outline-glow'}`}
                style={{ 
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {isFollowed ? (
                  <>
                    <Icon icon="lucide:check" width="14" />
                    <span>Đã theo dõi</span>
                  </>
                ) : (
                  <>
                    <Icon icon="lucide:plus" width="14" />
                    <span>Theo dõi</span>
                  </>
                )}
              </Button>
            </div>

          </div>

        </div>
      </Card.Body>
    </Card>
  );
}
