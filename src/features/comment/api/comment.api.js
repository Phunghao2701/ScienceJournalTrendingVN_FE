import api from '../../../shared/services/api';

export const getArticleCommentsApi = (articleId) => {
  return api.get(`/articles/${articleId}/comments`);
};

export const createArticleCommentApi = (articleId, content) => {
  return api.post(`/articles/${articleId}/comments`, { content });
};

export const updateCommentApi = (commentId, content) => {
  return api.put(`/comments/${commentId}`, { content });
};

export const deleteCommentApi = (commentId) => {
  return api.delete(`/comments/${commentId}`);
};
