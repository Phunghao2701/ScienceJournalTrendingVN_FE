import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from '../../../shared/utils/toast';
import { getArticleDetailApi, updateArticleApi, deleteArticleApi } from '../../article/api/articleApi';
import api from '../../../shared/services/api';
import ROUTES from '../../../app/routes/routePaths';

const toInputDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().substring(0, 10);
};

export default function useUpdateArticle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [leadAuthor, setLeadAuthor] = useState('');
  const [journal, setJournal] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [submissionDate, setSubmissionDate] = useState('');
  const [status, setStatus] = useState('published');

  const [stats, setStats] = useState({
    wordCount: 0,
    referencesCount: 0,
    reviewersAssigned: 0,
    reviewersTotal: 0,
    lastUpdated: '',
  });

  const [originalData, setOriginalData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    let ignore = false;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await getArticleDetailApi(id);
        if (ignore) return;

        const payload = res.data?.data;
        if (!payload) throw new Error('Không có dữ liệu bài báo.');

        const authors = payload.authors || [];
        const authorNames = authors.map((a) => a.display_name);
        const kws = (payload.keywords || []).map((keyword) => keyword.display_name);

        setTitle(payload.title || '');
        setLeadAuthor(authorNames[0] || 'Unknown Author');
        setJournal(payload.journal_name || 'N/A');
        setAbstract(payload.abstract || '');
        setKeywords(kws);
        setSubmissionDate(toInputDate(payload.created_at || payload.publication_year));

        const currentStatus = payload.is_deleted ? 'archived' : 'published';
        setStatus(currentStatus);

        const currentStats = {
          wordCount: payload.abstract ? payload.abstract.split(' ').length : 0,
          referencesCount: payload.reference_count || 0,
          reviewersAssigned: 2,
          reviewersTotal: 3,
          lastUpdated: new Date().toLocaleDateString(),
        };
        setStats(currentStats);

        setOriginalData({
          title: payload.title || '',
          leadAuthor: authorNames[0] || 'Unknown Author',
          journal: payload.journal_name || 'N/A',
          abstract: payload.abstract || '',
          keywords: kws,
          submissionDate: toInputDate(payload.created_at || payload.publication_year),
          status: currentStatus,
          is_deleted: payload.is_deleted,
        });
        setError('');
      } catch (err) {
        if (!ignore) setError(err.response?.data?.message || err.message || 'Lỗi tải chi tiết bài báo.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchDetail();
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleUpdate = async () => {
    try {
      setSubmitting(true);

      const updatePayload = {
        title,
        abstract,
        keywords,
      };

      await updateArticleApi(id, updatePayload);

      if (status === 'archived' && originalData?.status !== 'archived') {
        await deleteArticleApi(id);
      } else if (status !== 'archived' && originalData?.status === 'archived') {
        await api.patch(`/articles/${id}/restore`);
      }

      setOriginalData((prev) => ({
        ...prev,
        title,
        abstract,
        keywords,
        status,
      }));

      toast.success('Cập nhật bài báo thành công!');
    } catch (updateError) {
      toast.error(updateError.response?.data?.message || 'Có lỗi khi cập nhật bài báo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (originalData) {
      setTitle(originalData.title);
      setLeadAuthor(originalData.leadAuthor);
      setJournal(originalData.journal);
      setAbstract(originalData.abstract);
      setKeywords(originalData.keywords);
      setSubmissionDate(originalData.submissionDate);
      setStatus(originalData.status);
      toast.info('Changes have been reverted.');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setSubmitting(true);
      await deleteArticleApi(id);
      setShowDeleteModal(false);
      toast.success('Xóa bài báo thành công!');
      navigate(ROUTES.ADMIN_ARTICLES);
    } catch (deleteError) {
      toast.error(deleteError.response?.data?.message || 'Có lỗi khi xóa bài báo.');
      setShowDeleteModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    id,
    loading,
    error,
    submitting,
    title,
    setTitle,
    leadAuthor,
    setLeadAuthor,
    journal,
    setJournal,
    abstract,
    setAbstract,
    keywords,
    setKeywords,
    submissionDate,
    setSubmissionDate,
    status,
    setStatus,
    stats,
    originalData,
    showDeleteModal,
    setShowDeleteModal,
    handleUpdate,
    handleCancel,
    handleConfirmDelete,
  };
}
