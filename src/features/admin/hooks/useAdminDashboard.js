import { useEffect, useMemo, useState } from 'react';
import {
  getAdminDashboardSummary,
  getAdminPublicationTrends,
  getAdminRecentActivities,
  getAdminVolumeIssueStatus,
} from '../api/adminDashboard.api';

const currentYear = new Date().getFullYear();

const buildStatCards = (data) => [
  {
    key: 'journals',
    label: 'Total Journals',
    value: data.total_journals?.toLocaleString('en-US') || '0',
    icon: 'lucide:book-open',
    note: data.journal_growth > 0 ? `+${data.journal_growth} added today` : 'No new additions today',
    noteType: data.journal_growth > 0 ? 'success' : 'neutral',
  },
  {
    key: 'articles',
    label: 'Total Articles',
    value: data.total_articles?.toLocaleString('en-US') || '0',
    icon: 'lucide:file-text',
    note: data.article_growth > 0 ? `+${data.article_growth} added today` : 'No new additions today',
    noteType: data.article_growth > 0 ? 'success' : 'neutral',
  },
  {
    key: 'reviews',
    label: 'Pending Reviews',
    value: data.pending_reviews?.toLocaleString('en-US') || '0',
    icon: 'lucide:clock',
    note: 'Requires editor assignment',
    noteType: 'warning',
  },
  {
    key: 'users',
    label: 'Active Users',
    value: data.active_users?.toLocaleString('en-US') || '0',
    icon: 'lucide:users',
    note: 'Currently active on system',
    noteType: 'success',
  },
];

const getApiErrorMessage = (error, fallbackMessage) => {
  if (error.response?.status === 403) {
    return 'Backend từ chối quyền admin: token hiện tại không có role ADMINISTRATOR.';
  }

  return error.response?.data?.message || fallbackMessage;
};

const normalizeTrendItems = (items = []) => {
  return items
    .map((item, index) => ({
      year: item.year ? Number(item.year) : null,
      month: Number(item.month || item.month_number || index + 1),
      manuscripts: Number(item.manuscripts || item.submitted || item.total_submissions || 0),
      published: Number(item.published || item.total_published || 0),
    }))
    .filter((item) => item.month || item.year);
};

const mapActivityType = (activity = {}) => {
  const rawType = String(activity.type || activity.action_type || activity.action || '').toLowerCase();

  if (rawType.includes('publish')) return 'published';
  if (rawType.includes('revision') || rawType.includes('update')) return 'revision';
  if (rawType.includes('overdue') || rawType.includes('deadline') || activity.level === 'WARNING') return 'overdue';

  return 'reviewer';
};

const formatLogTime = (rawTime) => {
  if (!rawTime) return 'Recently';
  try {
    const d = new Date(rawTime);
    if (Number.isNaN(d.getTime())) return rawTime;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return rawTime;
  }
};

const normalizeActivities = (items = []) => {
  return items.map((item, index) => {
    const rawTime = item.time || item.created_at || item.logged_at;
    return {
      id: item.id || item.log_id || item.activity_id || index + 1,
      type: mapActivityType(item),
      title: item.title || item.action || item.event || 'System activity',
      description:
        item.description ||
        item.details ||
        item.message ||
        item.entity_table ||
        'Activity details are not available.',
      time: formatLogTime(rawTime),
    };
  });
};

const normalizeVolumeStatus = (items = []) => {
  return items.map((item, index) => ({
    id: item.id || item.volume_id || index + 1,
    volume:
      item.volume ||
      item.volume_label ||
      `Vol ${item.volume_number || item.volume_id || index + 1}${
        item.publication_year ? ` (${item.publication_year})` : ''
      }`,
    totalIssues: Number(item.totalIssues || item.total_issues || 0),
    publicationDate:
      item.publicationDate ||
      item.publication_date ||
      item.planned_publication_date ||
      item.next_release ||
      'TBD',
    status: String(item.status || 'in_prep').toLowerCase(),
    progress: Number(item.progress || item.progress_percent || 0),
  }));
};

const extractItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.logs)) return payload.logs;
  return [];
};

const YEARS_RANGE = Array.from({ length: 8 }, (_, i) => currentYear - i);

export default function useAdminDashboard() {
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState('');

  const [trendItems, setTrendItems] = useState([]);
  const [trendYears] = useState(YEARS_RANGE);
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [trendsError, setTrendsError] = useState('');

  const [activityItems, setActivityItems] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState('');

  const [volumeStatusItems, setVolumeStatusItems] = useState([]);
  const [volumeLoading, setVolumeLoading] = useState(true);
  const [volumeError, setVolumeError] = useState('');
  
  // Volume Pagination
  const [volumePage, setVolumePage] = useState(1);
  const volumeLimit = 5;
  const [volumeTotalPages, setVolumeTotalPages] = useState(1);
  const [volumeTotalItems, setVolumeTotalItems] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardSummary = async () => {
      try {
        setSummaryLoading(true);
        setSummaryError('');

        const response = await getAdminDashboardSummary();

        if (!isMounted) return;
        setDashboardSummary(response.data?.data || null);
      } catch (error) {
        if (!isMounted) return;
        setSummaryError(getApiErrorMessage(error, 'Không thể tải số liệu Dashboard.'));
        setDashboardSummary(null);
      } finally {
        if (isMounted) setSummaryLoading(false);
      }
    };

    fetchDashboardSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchPublicationTrends = async () => {
      try {
        setTrendsLoading(true);
        setTrendsError('');

        const response = await getAdminPublicationTrends({ year: selectedYear });
        const payload = response.data?.data;
        const normalizedItems = normalizeTrendItems(extractItems(payload));


        if (!isMounted) return;
        setTrendItems(normalizedItems);
      } catch (error) {
        if (!isMounted) return;
        setTrendItems([]);
        setTrendsError(getApiErrorMessage(error, 'Không thể tải dữ liệu Publication Trends.'));
      } finally {
        if (isMounted) setTrendsLoading(false);
      }
    };

    fetchPublicationTrends();

    return () => {
      isMounted = false;
    };
  }, [selectedYear]);

  useEffect(() => {
    let isMounted = true;

    const fetchRecentActivities = async () => {
      try {
        setActivityLoading(true);
        setActivityError('');

        const response = await getAdminRecentActivities({ page: 1, limit: 10 });
        const normalizedItems = normalizeActivities(extractItems(response.data?.data));

        if (!isMounted) return;
        setActivityItems(normalizedItems);
      } catch (error) {
        if (!isMounted) return;
        setActivityItems([]);
        setActivityError(getApiErrorMessage(error, 'Không thể tải hoạt động gần đây.'));
      } finally {
        if (isMounted) setActivityLoading(false);
      }
    };

    fetchRecentActivities();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchVolumeIssueStatus = async () => {
      try {
        setVolumeLoading(true);
        setVolumeError('');

        const response = await getAdminVolumeIssueStatus({ page: volumePage, limit: volumeLimit });
        const payload = response.data;
        const normalizedItems = normalizeVolumeStatus(extractItems(payload?.data));
        const pagination = payload?.pagination || {};

        if (!isMounted) return;
        setVolumeStatusItems(normalizedItems);
        setVolumeTotalPages(Number(pagination.totalPages || 1));
        setVolumeTotalItems(Number(pagination.total || 0));
      } catch (error) {
        if (!isMounted) return;
        setVolumeStatusItems([]);
        setVolumeError(getApiErrorMessage(error, 'Không thể tải Volume & Issue Overview.'));
      } finally {
        if (isMounted) setVolumeLoading(false);
      }
    };

    fetchVolumeIssueStatus();

    return () => {
      isMounted = false;
    };
  }, [volumePage, volumeLimit]);

  const statCards = useMemo(
    () => (dashboardSummary ? buildStatCards(dashboardSummary) : []),
    [dashboardSummary]
  );

  return {
    selectedYear,
    setSelectedYear,
    statCards,
    summaryLoading,
    summaryError,
    trendItems,
    trendYears,
    trendsLoading,
    trendsError,
    activityItems,
    activityLoading,
    activityError,
    volumeStatusItems,
    volumeLoading,
    volumeError,
    volumePage,
    setVolumePage,
    volumeLimit,
    volumeTotalPages,
    volumeTotalItems,
  };
}
