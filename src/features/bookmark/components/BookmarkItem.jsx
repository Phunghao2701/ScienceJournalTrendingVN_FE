import { memo } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { ExternalLink, BookmarkMinus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBookmarkStore } from '../store/bookmarkStore';

/**
 * BookmarkItem — dùng React.memo + lucide-react bundled icons (không fetch mạng).
 * onClick handlers là stable ref từ parent (useCallback).
 */
const BookmarkItem = memo(function BookmarkItem({ item, onRemove, onViewDetail }) {
  const { t } = useTranslation();
  const articleId = item.article_id;
  const isRemoving = useBookmarkStore((state) => (
    Boolean(state.loadingByArticleId[String(articleId)])
  ));

  return (
    <article className="bookmark-item">
      <div className="bookmark-item-main">
        <button
          type="button"
          className="bookmark-title"
          onClick={() => onViewDetail(articleId)}
        >
          {item.title || t('untitledArticle')}
        </button>
        {item.abstract && <p>{item.abstract}</p>}
        <div className="bookmark-meta">
          {item.publication_year && <span>{item.publication_year}</span>}
          {item.doi && <span>DOI: {item.doi}</span>}
          {item.bookmarked_at && (
            <span>
              {t('savedOn')} {new Date(item.bookmarked_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <div className="bookmark-actions">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => onViewDetail(articleId)}
        >
          <ExternalLink size={14} />
          {t('viewDetail')}
        </Button>
        <Button
          variant="outline-danger"
          size="sm"
          disabled={isRemoving}
          onClick={() => onRemove(articleId)}
        >
          {isRemoving
            ? <Spinner animation="border" size="sm" />
            : <BookmarkMinus size={14} />
          }
          {t('remove')}
        </Button>
      </div>
    </article>
  );
});

export default BookmarkItem;
