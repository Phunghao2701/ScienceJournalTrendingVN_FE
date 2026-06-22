/**
 * Card hiển thị keyword và topic trong trang chi tiết bài báo.
 * - Keywords: click được, điều hướng tới /keywords/:id/articles hoặc /keywords?keyword=...
 * - Topics: chỉ hiển thị, KHÔNG click vì route /topics/:id/articles chưa có trong AppRoutes.
 *
 * File: features/article/components/KeywordTopicCard.jsx
 */
import { Card, Badge } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { normalizeKeywords } from '../utils/articleFormatters';

export default function KeywordTopicCard({ primaryTopic, keywords, topics = [] }) {
  const navigate = useNavigate();
  const keywordList = normalizeKeywords(keywords);

  const topicList = Array.isArray(topics)
    ? topics.filter((topic) => topic?.display_name)
    : [];

  const fallbackTopic = primaryTopic
    ? [{ topic_id: null, display_name: primaryTopic, is_primary: true }]
    : [];

  // Dùng topics từ BE nếu có, nếu không thì fallback về primaryTopic string
  const displayTopics = topicList.length > 0 ? topicList : fallbackTopic;

  /**
   * Điều hướng khi bấm vào keyword trong trang chi tiết bài báo.
   *
   * - Nếu BE trả `keyword_id`, đi thẳng tới danh sách bài báo theo keyword.
   * - Nếu chỉ có text keyword, dùng trang keyword list và truyền query search.
   */
  const handleKeywordClick = (keyword) => {
    if (keyword.keyword_id) {
      navigate(`/keywords/${keyword.keyword_id}/articles`);
      return;
    }
    navigate(`/keywords?keyword=${encodeURIComponent(keyword.display_name)}`);
  };

  const hasKeywords = keywordList.length > 0;
  const hasTopics = displayTopics.length > 0;
  const hasContent = hasKeywords || hasTopics;

  return (
    <Card
      className="journal-dark-card border-0 p-4 mb-4"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.02)',
      }}
    >
      <h5 className="font-display font-weight-bold text-main mb-3 d-flex align-items-center gap-2">
        <Icon icon="lucide:tags" style={{ color: 'var(--primary)' }} width="20" />
        Từ khóa & Chủ đề (Keywords & Topics)
      </h5>

      {!hasContent ? (
        <span className="text-muted-custom text-sm">Chưa có thông tin từ khóa hoặc chủ đề.</span>
      ) : (
        <div className="d-flex flex-column gap-3">

          {/* ── Keywords ── click được, route /keywords/:id/articles */}
          <section>
            <div className="d-flex align-items-center gap-2 mb-2">
              <Icon icon="lucide:key-round" width="14" style={{ color: 'var(--primary)' }} />
              <span className="text-uppercase fw-semibold" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                Keywords
              </span>
            </div>

            {hasKeywords ? (
              <div className="d-flex flex-wrap gap-2">
                {keywordList.map((keyword) => (
                  <span
                    key={`keyword-${keyword.keyword_id || keyword.display_name}`}
                    onClick={() => handleKeywordClick(keyword)}
                    className="px-3 py-1 rounded-pill font-display text-main fw-semibold"
                    title="Xem các bài báo theo keyword này"
                    style={{ cursor: 'pointer', backgroundColor: 'rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.10)' }}
                  >
                    {keyword.display_name}
                  </span>
                ))}
              </div>
            ) : (
              <div
                className="text-xs px-3 py-2 rounded-3"
                style={{
                  color: 'var(--text-muted)',
                  backgroundColor: 'rgba(0,0,0,0.03)',
                  border: '1px dashed var(--border)',
                }}
              >
                Bài báo này chưa có keyword từ dữ liệu backend.
              </div>
            )}
          </section>

          {/* ── Topics ── chỉ hiển thị, KHÔNG click (route chưa hoàn thiện) */}
          {hasTopics && (
            <section>
              <div className="d-flex align-items-center gap-2 mb-2">
              <Icon icon="lucide:network" width="14" style={{ color: 'var(--primary)' }} />
              <span className="text-uppercase fw-semibold" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                Topics (đang phát triển)
              </span>
            </div>

              <div className="d-flex flex-wrap gap-2">
                {displayTopics.map((topic) => (
                  <span
                    key={`topic-${topic.topic_id || topic.display_name}`}
                    className="px-3 py-1 rounded-pill font-display text-main fw-semibold"
                    title="Topic route chưa hoàn thiện"
                    style={{ cursor: 'pointer', backgroundColor: 'rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.10)' }}
                  >
                    {topic.is_primary && <Icon icon="lucide:star" width="12" />}
                    {topic.display_name}
                  </span>
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </Card>
  );
}
