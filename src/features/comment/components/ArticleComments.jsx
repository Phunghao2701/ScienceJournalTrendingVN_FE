import { useEffect, useMemo, useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../app/store/authStore';
import AuthRequiredModal from '../../../shared/components/AuthRequiredModal';
import { toast } from '../../../shared/utils/toast';
import {
  createArticleCommentApi,
  deleteCommentApi,
  getArticleCommentsApi,
  updateCommentApi,
} from '../api/comment.api';
import './ArticleComments.css';

const getCurrentUserId = (user) => user?.user_id ?? user?.id ?? user?.account_id ?? null;

const getUniqueIds = (ids) => (
  ids
    .filter((id) => id !== undefined && id !== null && String(id).trim() !== '')
    .map((id) => String(id).trim())
    .filter((id, index, list) => list.indexOf(id) === index)
);

const isArticleNotFoundError = (error) => {
  const message = String(error?.response?.data?.message || error?.message || '').toLowerCase();
  return message.includes('không tìm thấy bài báo') ||
    message.includes('khong tim thay bai bao') ||
    message.includes('article not found') ||
    message.includes('not found');
};

const isOwnedByCurrentUser = (comment, user) => {
  const currentUserId = getCurrentUserId(user);
  if (!currentUserId) return false;
  return String(comment.user_id) === String(currentUserId);
};

const formatCommentDate = (value) => {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return String(value);
  }
};

export default function ArticleComments({ articleId, articleIds = [] }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoggedIn = Boolean(token || user || isAuthenticated);
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const articleIdsKey = articleIds.join(',');
  const commentArticleIds = useMemo(() => {
    const list = articleIdsKey ? articleIdsKey.split(',') : [];
    return getUniqueIds([articleId, ...list]);
  }, [articleId, articleIdsKey]);
  const commentArticleIdsKey = commentArticleIds.join('|');
  const [resolvedArticleId, setResolvedArticleId] = useState('');
  const activeArticleId = resolvedArticleId || commentArticleIds[0] || '';

  useEffect(() => {
    setResolvedArticleId('');
  }, [commentArticleIdsKey]);

  const commentsQueryKey = useMemo(() => ['article-comments', activeArticleId], [activeArticleId]);

  const commentsQuery = useQuery({
    queryKey: commentsQueryKey,
    queryFn: async () => {
      const response = await getArticleCommentsApi(activeArticleId);
      if (!response.data?.success) {
        throw new Error(response.data?.message || t('commentsLoadError'));
      }
      return response.data.data || [];
    },
    enabled: Boolean(activeArticleId),
  });

  const addMutation = useMutation({
    mutationFn: async (nextContent) => {
      let lastError;
      for (const candidateId of commentArticleIds) {
        try {
          const response = await createArticleCommentApi(candidateId, nextContent);
          if (response.data?.success === false) {
            throw new Error(response.data?.message || t('commentAddError'));
          }
          return { response, articleId: candidateId };
        } catch (error) {
          lastError = error;
          if (!isArticleNotFoundError(error)) break;
        }
      }
      throw lastError;
    },
    onSuccess: ({ articleId: successfulArticleId }) => {
      setResolvedArticleId(successfulArticleId);
      setContent('');
      commentArticleIds.forEach((candidateId) => {
        queryClient.invalidateQueries({ queryKey: ['article-comments', candidateId] });
      });
      toast.success(t('commentAdded'));
    },
    onError: (error) => toast.error(error.response?.data?.message || t('commentAddError')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ commentId, nextContent }) => updateCommentApi(commentId, nextContent),
    onSuccess: () => {
      setEditingId(null);
      setEditingContent('');
      queryClient.invalidateQueries({ queryKey: commentsQueryKey });
      toast.success(t('commentUpdated'));
    },
    onError: (error) => toast.error(error.response?.data?.message || t('commentUpdateError')),
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId) => deleteCommentApi(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsQueryKey });
      toast.success(t('commentDeleted'));
    },
    onError: (error) => toast.error(error.response?.data?.message || t('commentDeleteError')),
  });

  const comments = commentsQuery.data || [];
  const isSaving = addMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    const trimmed = content.trim();
    if (!trimmed || addMutation.isPending) return;
    addMutation.mutate(trimmed);
  };

  const startEditing = (comment) => {
    setEditingId(comment.id);
    setEditingContent(comment.content || '');
  };

  const submitEdit = (commentId) => {
    const trimmed = editingContent.trim();
    if (!trimmed || updateMutation.isPending) return;
    updateMutation.mutate({ commentId, nextContent: trimmed });
  };

  const removeComment = (commentId) => {
    if (deleteMutation.isPending) return;
    if (window.confirm(t('confirmDeleteComment') || 'Are you sure you want to delete this comment?')) {
      deleteMutation.mutate(commentId);
    }
  };

  return (
    <section className="article-comments-section">
      <div className="article-comments-header">
        <div>
          <h2 className="article-section-title mb-1">{t('commentsTitle')}</h2>
          <p className="article-comments-subtitle mb-0">
            {t('commentsSubtitle')}
          </p>
        </div>
        <span className="article-comments-count">
          {t('commentsCount', { count: comments.length })}
        </span>
      </div>

      <Form onSubmit={handleSubmit} className="article-comment-form">
        <Form.Control
          as="textarea"
          rows={3}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          /* No placeholder — keep the textarea clean; aria-label handles accessibility */
          aria-label={isLoggedIn ? t('commentPlaceholder') : t('commentLoginPlaceholder')}
          disabled={addMutation.isPending}
        />
        <div className="d-flex justify-content-end mt-2">
          <Button
            type="submit"
            className="btn-primary-glow border-0"
            disabled={addMutation.isPending || (isLoggedIn && !content.trim())}
          >
            {addMutation.isPending && <Spinner animation="border" size="sm" className="me-2" />}
            {t('postComment')}
          </Button>
        </div>
      </Form>

      {commentsQuery.isLoading ? (
        /* Loading state */
        <div className="article-comments-state">
          <Spinner animation="border" size="sm" className="comments-state-icon" />
          {t('commentsLoading')}
        </div>
      ) : commentsQuery.isError ? (
        /* Error state */
        <div className="article-comments-state is-error">
          <Icon icon="lucide:alert-circle" width="24" className="comments-state-icon" />
          <span>{commentsQuery.error?.message || t('commentsLoadError')}</span>
          <Button variant="link" onClick={() => commentsQuery.refetch()} className="p-0">
            {t('tryAgain')}
          </Button>
        </div>
      ) : comments.length === 0 ? (
        /* Empty state */
        <div className="article-comments-state">
          <Icon icon="lucide:message-circle" width="28" className="comments-state-icon" />
          <span>{t('commentsEmpty')}</span>
        </div>
      ) : (
        <div className="article-comments-list">
          {comments.map((comment) => {
            const canManage = isOwnedByCurrentUser(comment, user);
            const isEditing = editingId === comment.id;
            return (
              <article key={comment.id} className="article-comment-item">
                <div className="article-comment-avatar">
                  {comment.avatar ? (
                    <img src={comment.avatar} alt={comment.user || 'avatar'} />
                  ) : (
                    <span>{String(comment.user || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="article-comment-body">
                  <div className="article-comment-meta">
                    <strong>{comment.user || t('userLabel')}</strong>
                    <span>{formatCommentDate(comment.created_at)}</span>
                  </div>

                  {isEditing ? (
                    <div className="article-comment-edit">
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={editingContent}
                        onChange={(event) => setEditingContent(event.target.value)}
                        disabled={updateMutation.isPending}
                        aria-label={t('editComment')}
                      />
                      <div className="d-flex gap-2 justify-content-end mt-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          disabled={updateMutation.isPending}
                          onClick={() => {
                            setEditingId(null);
                            setEditingContent('');
                          }}
                        >
                          {t('cancel')}
                        </Button>
                        <Button
                          size="sm"
                          disabled={updateMutation.isPending || !editingContent.trim()}
                          onClick={() => submitEdit(comment.id)}
                        >
                          {t('save')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="article-comment-content">{comment.content}</p>
                  )}

                  {canManage && !isEditing && (
                    <div className="article-comment-actions d-flex gap-2">
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        disabled={isSaving} 
                        onClick={() => startEditing(comment)}
                        className="d-flex align-items-center gap-1 py-1 px-2 text-xs"
                      >
                        <Icon icon="lucide:edit-2" width="13" />
                        {t('editComment')}
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        disabled={isSaving} 
                        onClick={() => removeComment(comment.id)}
                        className="d-flex align-items-center gap-1 py-1 px-2 text-xs"
                      >
                        <Icon icon="lucide:trash-2" width="13" />
                        {t('deleteComment')}
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <AuthRequiredModal show={showLoginModal} onHide={() => setShowLoginModal(false)} />
    </section>
  );
}
