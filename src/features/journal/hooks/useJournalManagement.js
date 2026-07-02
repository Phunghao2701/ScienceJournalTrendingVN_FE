/**
 * useJournalManagement: Zustand store for centralized Journal / Volume / Issue management state.
 *
 * File: src/features/journal/hooks/useJournalManagement.js
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
  currentJournal: null,  // Currently active/selected journal in the management area
  selectedVolume: null,   // Currently selected volume; used to filter the visible issue list
  loading: false,
  error: null,

  // --- FUNCTIONS / ACTIONS ---

  /** Load journals, volumes, and issues from the backend on first use (or when force=true). */
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

  /** Set the active journal (used by the Switch Journal Modal). */
  setCurrentJournal: (journalId) => {
    const targetJournal = get().journals.find(j => j.id === journalId);
    set({ currentJournal: targetJournal, selectedVolume: null }); // Reset selected volume when switching journals
  },

  /** Add a newly created journal to the top of the list. */
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

  /** Update journal configuration details (used by Edit Journal page). */
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

  /** Set the selected volume to filter the issue list displayed alongside it. */
  setSelectedVolume: (volumeId) => {
    set({ selectedVolume: volumeId });
  },

  /** Create a new volume linked to the currently active journal. */
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

  /** Create a new issue under the selected volume and increment that volume's totalIssues count. */
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