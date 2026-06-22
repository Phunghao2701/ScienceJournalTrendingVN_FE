/**
 * Hook / Zustand Store quản lý trạng thái tập trung cho phân hệ Journal, Volume, Issue.
 * Thỏa mãn tiêu chuẩn: Comment mô tả ngắn gọn cho từng hàm xử lý.
 */
import { create } from 'zustand';
import { getIssuesApi, getVolumesApi, searchJournalsApi } from '../api/journalApi';

const getApiItems = (response) => response?.data?.data?.items || response?.data?.data || [];

const normalizeJournal = (journal) => ({
  ...journal,
  id: journal.journal_id || journal.id,
  title: journal.display_name || journal.title || 'Untitled Journal',
  subjectCategory: journal.subject_category_name || journal.subject_area_name || journal.type || 'General Category',
  publisher: journal.publisher_name || journal.publisher || '—',
  lastUpdated: journal.updated_at?.slice?.(0, 10) || journal.created_at?.slice?.(0, 10) || '—',
  status: journal.is_deleted ? 'Inactive' : 'Active',
});

const normalizeVolume = (volume) => ({
  ...volume,
  id: volume.volume_id || volume.id,
  journalId: volume.journal_id || volume.journalId,
  volumeNumber: volume.volume_number ? `Volume ${volume.volume_number}` : volume.volumeNumber,
  publicationYear: volume.publication_year || volume.publicationYear,
  totalIssues: volume.issue_count || volume.totalIssues || 0,
  totalArticles: volume.article_count || volume.totalArticles || 0,
});

const normalizeIssue = (issue) => ({
  ...issue,
  id: issue.issue_id || issue.id,
  volumeId: issue.volume_id || issue.volumeId,
  issueNumber: issue.issue_number || issue.issueNumber,
  publicationYear: issue.publication_year || issue.publicationYear,
  status: issue.is_deleted ? 'Deleted' : (issue.status || 'Active'),
});

export const useJournalManagement = create((set, get) => ({
  // --- STATE SYSTEM ---
  journals: [],
  volumes: [],
  issues: [],
  currentJournal: null,  // Lưu trữ tạp chí đang hoạt động/được chọn trong khu vực quản lý
  selectedVolume: null,   // Lưu trữ Volume đang được xem chi tiết để render ra Issue tương ứng
  loading: false,
  error: null,

  // --- FUNCTIONS / ACTIONS ---

  /** Khởi tạo dữ liệu Journal, Volume, Issue từ API backend */
  fetchInitialData: async ({ force = false } = {}) => {
    if (!force && get().journals && get().journals.length > 0) {
      return;
    }

    set({ loading: true, error: null });
    try {
      const journalResponse = await searchJournalsApi({ page: 1, limit: 100, sort_by: 'display_name', sort_order: 'asc' });
      const journals = getApiItems(journalResponse).map(normalizeJournal);
      const firstJournal = journals[0] || null;

      const [volumeResponse, issueResponse] = await Promise.all([
        firstJournal ? getVolumesApi({ page: 1, limit: 100, journal_id: firstJournal.id }) : Promise.resolve(null),
        firstJournal ? getIssuesApi({ page: 1, limit: 100, journal_id: firstJournal.id }) : Promise.resolve(null),
      ]);

      const volumes = getApiItems(volumeResponse).map(normalizeVolume);
      const issues = getApiItems(issueResponse).map(normalizeIssue);

      set({
        journals,
        volumes,
        issues,
        currentJournal: firstJournal,
        selectedVolume: volumes[0]?.id || null,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.status === 403
          ? 'Backend từ chối quyền admin: token hiện tại không có role ADMINISTRATOR.'
          : 'Không thể tải dữ liệu journal từ backend.',
        loading: false,
      });
    }
  },

  /** Đặt tạp chí đang hoạt động hiện tại (Ứng dụng cho Switch Journal Modal) */
  setCurrentJournal: (journalId) => {
    const targetJournal = get().journals.find(j => j.id === journalId);
    set({ currentJournal: targetJournal, selectedVolume: null }); // Reset lại volume khi chuyển đổi tạp chí
  },

  /** Thêm mới một Tạp chí (Journal) vào danh sách tổng */
  addJournal: async (journalData) => {
    try {
      set({ loading: true });
      const { createJournalApi } = await import('../api/journalApi');
      const res = await createJournalApi(journalData);
      const createdJournal = res.data?.data;
      
      const newJournal = normalizeJournal(createdJournal || journalData);
      set((state) => ({ 
        journals: [newJournal, ...state.journals],
        loading: false
      }));
      return res.data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  /** Cập nhật thông tin chi tiết cấu hình của Journal (Dùng cho Edit Journal) */
  updateJournal: async (id, updatedData) => {
    try {
      set({ loading: true });
      const { updateJournalApi } = await import('../api/journalApi');
      await updateJournalApi(id, updatedData);
      
      set((state) => ({
        journals: state.journals.map(j => (j.id === id || j.journal_id === id) ? { ...j, ...updatedData } : j),
        currentJournal: (state.currentJournal?.id === id || state.currentJournal?.journal_id === id) ? { ...state.currentJournal, ...updatedData } : state.currentJournal,
        loading: false
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  /** Đặt Volume đang chọn để thực hiện lọc danh sách Issue hiển thị song song */
  setSelectedVolume: (volumeId) => {
    set({ selectedVolume: volumeId });
  },

  /** Tạo một Volume mới liên kết vào Journal hiện tại đang quản lý */
  createVolume: async (volumeFields) => {
    try {
      set({ loading: true });
      const { createVolumeApi } = await import('../api/journalApi');
      const activeJournal = get().currentJournal;
      const journalId = activeJournal?.journal_id || activeJournal?.id;
      
      const payload = {
        journal_id: parseInt(journalId),
        volume_number: parseInt(volumeFields.volumeNumber || 1),
        publication_year: parseInt(volumeFields.publicationYear || new Date().getFullYear())
      };
      
      const res = await createVolumeApi(payload);
      const createdVolume = res.data?.data;
      
      const newVol = normalizeVolume(createdVolume || {
        volume_id: res.data?.volume_id,
        journal_id: journalId,
        volume_number: payload.volume_number,
        publication_year: payload.publication_year,
        ...volumeFields
      });
      
      set((state) => ({ 
        volumes: [newVol, ...(state.volumes || [])],
        selectedVolume: state.selectedVolume ? state.selectedVolume : newVol.id,
        loading: false
      }));
      return res.data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  /** Tạo một Issue mới gắn chặt vào Volume đang được chỉ định xem và cập nhật totalIssues của Volume tương ứng */
  createIssue: async (issueFields) => {
    try {
      set({ loading: true });
      const { createIssueApi } = await import('../api/journalApi');
      const activeVolumeId = get().selectedVolume;
      
      const payload = {
        volume_id: parseInt(activeVolumeId),
        issue_number: parseInt(issueFields.issueNumber || 1),
        publication_year: parseInt(issueFields.publicationYear || new Date().getFullYear())
      };
      
      const res = await createIssueApi(payload);
      const createdIssue = res.data?.data;
      
      const newIssue = normalizeIssue(createdIssue || {
        issue_id: res.data?.issue_id,
        volume_id: activeVolumeId,
        issue_number: payload.issue_number,
        publication_year: payload.publication_year,
        ...issueFields
      });
      
      set((state) => {
        const updatedVolumes = (state.volumes || []).map(vol => 
          vol.id === activeVolumeId 
            ? { ...vol, totalIssues: (vol.totalIssues || 0) + 1 }
            : vol
        );
        
        return {
          issues: [newIssue, ...(state.issues || [])],
          volumes: updatedVolumes,
          loading: false
        };
      });
      return res.data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  }
}));