import api from '../../../shared/services/api';

export const scanOrcidApi = (orcid) => (
  api.post('/orcid/scan', { orcid })
);

export const getOrcidScanJobApi = (jobId) => (
  api.get(`/orcid/scan/${encodeURIComponent(jobId)}`)
);

export const getOrcidScanPublicationsApi = (
  jobId,
  { cursor = '0', limit = 20 } = {},
) => (
  api.get(`/orcid/scan/${encodeURIComponent(jobId)}/publications`, {
    params: { cursor, limit },
  })
);
