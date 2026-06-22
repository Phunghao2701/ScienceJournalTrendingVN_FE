/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\keywords\components\KeywordListItem.jsx
 */
import { Badge, Button } from 'react-bootstrap';
import { Icon } from '@iconify/react';

/**
 * Card hiển thị một keyword trong danh sách.
 */
export default function KeywordListItem({ keyword, onViewArticles }) {
  const keywordId = keyword.keyword_id || keyword.id || keyword.keywordId;
  const articleCount = Number(keyword.article_count || 0);

  return (
    <div className="keyword-card">
      <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
        <div>
          <div className="keyword-card-label">
            Research keyword
          </div>
          <h3 className="keyword-card-title">
            {keyword.display_name}
          </h3>
        </div>
        <Icon icon="lucide:sparkles" width="18" className="keyword-card-icon" />
      </div>

      <div className="d-flex align-items-center gap-2 flex-wrap mb-4">
        {articleCount > 0 && (
          <Badge className="keyword-count-badge">
            {articleCount} bài báo
          </Badge>
        )}
        {(keyword.topic_name || keyword.topic) && (
          <Badge className="keyword-topic-badge">
            {keyword.topic_name || keyword.topic}
          </Badge>
        )}
      </div>

      <Button
        id={`keyword-view-${keywordId || keyword.display_name}`}
        type="button"
        disabled={!keywordId}
        onClick={() => keywordId && onViewArticles && onViewArticles(keywordId)}
        className="keyword-card-action d-inline-flex align-items-center gap-2"
      >
        <span>Xem bài báo liên quan</span>
        <Icon icon="lucide:arrow-up-right" width="16" />
      </Button>
    </div>
  );
}
