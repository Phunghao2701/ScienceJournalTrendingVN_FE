import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Card, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useJournalManagement } from '../../journal/hooks/useJournalManagement';

export default function EditJournalPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { journals, updateJournal, fetchInitialData } = useJournalManagement();

  const isPreview = window.location.pathname.startsWith('/admin-preview');
  const basePath = isPreview ? '/admin-preview' : '/admin';

  const [formData, setFormData] = useState({
    title: '',
    issn: '',
    onlineIssn: '',
    aimScope: '',
    visibility: 'Public',
    publisher: '',
    subjectCategory: '',
    subjectArea: ''
  });

  const [errors, setErrors] = useState({});
  const [publishers, setPublishers] = useState([]);
  const [subjectAreas, setSubjectAreas] = useState([]);
  const [subjectCategories, setSubjectCategories] = useState([]);
  const [zones, setZones] = useState({ countryZoneId: 1, regionZoneId: 2 });
  const [loadingDeps, setLoadingDeps] = useState(false);

  useEffect(() => {
    const loadDependencies = async () => {
      setLoadingDeps(true);
      try {
        const { getPublishersApi, getSubjectAreasApi, getSubjectCategoriesApi } = await import('../../journal/api/journalApi');
        const { getCountryStatsApi, getRegionStatsApi } = await import('../../zone/api/zone.api');
        
        const [pubRes, countryRes, regionRes, areaRes, catRes] = await Promise.all([
          getPublishersApi({ page: 1, limit: 100 }),
          getCountryStatsApi({ limit: 1 }),
          getRegionStatsApi({ limit: 1 }),
          getSubjectAreasApi({ page: 1, limit: 100 }),
          getSubjectCategoriesApi({ page: 1, limit: 100 })
        ]);
        
        const pubItems = pubRes.data?.data?.items || pubRes.data?.data || [];
        setPublishers(pubItems);

        const areaItems = areaRes.data?.data?.items || areaRes.data?.data || [];
        setSubjectAreas(areaItems);

        const catItems = catRes.data?.data?.items || catRes.data?.data || [];
        setSubjectCategories(catItems);
        
        const countryItems = countryRes.data?.data?.items || countryRes.data?.data || [];
        const regionItems = regionRes.data?.data?.items || regionRes.data?.data || [];
        
        setZones({
          countryZoneId: countryItems[0]?.zone_id || 1,
          regionZoneId: regionItems[0]?.zone_id || 2
        });
      } catch (err) {
        console.error('Failed to load publishers, zones or subjects', err);
      } finally {
        setLoadingDeps(false);
      }
    };
    loadDependencies();
  }, []);

  useEffect(() => {
    if (journals.length === 0) {
      fetchInitialData();
    }
  }, [journals, fetchInitialData]);

  useEffect(() => {
    if (journals.length > 0) {
      const journal = journals.find((j) => String(j.id || j.journal_id) === String(id));
      if (journal) {
        setFormData({
          title: journal.title || journal.display_name || '',
          issn: journal.issn || '',
          onlineIssn: journal.onlineIssn || '',
          aimScope: journal.aimScope || '',
          visibility: journal.visibility || 'Public',
          publisher: journal.publisher_id || journal.publisher || '',
          subjectCategory: journal.subjectCategory || '',
          subjectArea: journal.subjectArea || ''
        });
      }
    }
  }, [journals, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleToggleVisibility = () => {
    setFormData((prev) => ({
      ...prev,
      visibility: prev.visibility === 'Public' ? 'Private' : 'Public'
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Tên tạp chí không được để trống';
    if (!formData.issn.trim()) newErrors.issn = 'Mã số ISSN không được để trống';
    if (!formData.subjectCategory) newErrors.subjectCategory = 'Vui lòng chọn danh mục chính';
    if (!formData.subjectArea.trim()) newErrors.subjectArea = 'Lĩnh vực nghiên cứu cụ thể không được trống';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedPub = publishers.find(p => String(p.publisher_id || p.id) === String(formData.publisher));

    const payload = {
      display_name: formData.title,
      publisher_id: parseInt(formData.publisher),
      country: parseInt(zones.countryZoneId),
      region: parseInt(zones.regionZoneId),
      
      title: formData.title,
      issn: formData.issn,
      onlineIssn: formData.onlineIssn,
      aimScope: formData.aimScope,
      visibility: formData.visibility,
      subjectCategory: formData.subjectCategory,
      subjectArea: formData.subjectArea,
      publisher_name: selectedPub ? selectedPub.display_name : 'ResearchPulse Press',
      publisher: formData.publisher
    };

    updateJournal(id, payload);
    navigate(`${basePath}/journals`);
  };

  return (
    <div className="d-flex flex-column gap-3 text-start">
      <div>
        <div className="admin-breadcrumb mb-2">
          <span className="cursor-pointer text-muted-custom" onClick={() => navigate(`${basePath}/journals`)}>
            Journals
          </span>
          <Icon icon="lucide:chevron-right" className="mx-1" />
          <span className="admin-breadcrumb__current">Edit Journal</span>
        </div>
        <h2 className="font-display fw-bold text-main mb-1">Edit Journal</h2>
        <p className="text-muted-custom small mb-0">
          Modify general information, editorial settings, and visibility for your journal.
        </p>
      </div>

      <Form onSubmit={handleSubmit} className="mt-2">
        <Row className="g-4">
          {/* Left Column */}
          <Col xs={12} lg={8}>
            <Card className="border p-4 shadow-none bg-white rounded-3">
              <h5 className="font-display fw-bold text-main border-bottom pb-2.5 mb-4">
                General Information
              </h5>

              {/* Journal Title */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-medium small text-main">Journal Title <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  isInvalid={!!errors.title}
                  placeholder="e.g. Journal of Computer Science"
                />
                <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
              </Form.Group>

              {/* ISSN inputs */}
              <Row className="g-3 mb-4">
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium small text-main">Print ISSN <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="issn"
                      value={formData.issn}
                      onChange={handleChange}
                      isInvalid={!!errors.issn}
                      placeholder="e.g. 1549-3636"
                    />
                    <Form.Control.Feedback type="invalid">{errors.issn}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium small text-main">Online ISSN</Form.Label>
                    <Form.Control
                      type="text"
                      name="onlineIssn"
                      value={formData.onlineIssn}
                      onChange={handleChange}
                      placeholder="e.g. 1937-478X"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Aim & Scope */}
              <Form.Group className="mb-0">
                <Form.Label className="fw-medium small text-main">Aim and Scope</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  name="aimScope"
                  value={formData.aimScope}
                  onChange={handleChange}
                  placeholder="Describe the editorial aims, scopes, and target audience..."
                />
              </Form.Group>
            </Card>
          </Col>

          {/* Right Column */}
          <Col xs={12} lg={4}>
            <div className="d-flex flex-column gap-4">
              {/* Visibility Card */}
              <Card className="border p-4 shadow-none bg-white rounded-3">
                <h5 className="font-display fw-bold text-main border-bottom pb-2.5 mb-3">
                  Visibility
                </h5>
                <div className="d-flex align-items-center justify-content-between py-2">
                  <div>
                    <div className="fw-bold text-main small mb-0.5">Publicly Listed</div>
                    <small className="text-muted-custom">Visible in main index</small>
                  </div>
                  <Form.Check
                    type="switch"
                    id="visibility-switch"
                    className="admin-toggle-switch"
                    checked={formData.visibility === 'Public'}
                    onChange={handleToggleVisibility}
                    style={{ fontSize: '1.2rem', cursor: 'pointer' }}
                  />
                </div>
              </Card>

              {/* Editorial Board Card */}
              <Card className="border p-4 shadow-none bg-white rounded-3">
                <h5 className="font-display fw-bold text-main border-bottom pb-2.5 mb-4">
                  Editorial Board
                </h5>

                {/* Publisher Select Dropdown */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium small text-main">Nhà xuất bản (Publisher) <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleChange}
                    isInvalid={!!errors.publisher}
                    style={{ cursor: 'pointer' }}
                  >
                    {loadingDeps ? (
                      <option>Đang tải danh sách nhà xuất bản...</option>
                    ) : publishers.length === 0 ? (
                      <option value="">Không có nhà xuất bản nào</option>
                    ) : (
                      publishers.map((pub) => (
                        <option key={pub.publisher_id || pub.id} value={pub.publisher_id || pub.id}>
                          {pub.display_name}
                        </option>
                      ))
                    )}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.publisher}</Form.Control.Feedback>
                </Form.Group>

                {/* Category Selector */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium small text-main">Broad Category <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="subjectCategory"
                    value={formData.subjectCategory}
                    onChange={handleChange}
                    isInvalid={!!errors.subjectCategory}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">-- Choose category --</option>
                    {subjectCategories.map(cat => (
                      <option key={cat.subject_category_id || cat.id || cat.display_name} value={cat.display_name || cat.name}>
                        {cat.display_name || cat.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.subjectCategory}</Form.Control.Feedback>
                </Form.Group>

                {/* Specific Research Area */}
                <Form.Group className="mb-0">
                  <Form.Label className="fw-medium small text-main">Specific Research Area <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="subjectArea"
                    value={formData.subjectArea}
                    onChange={handleChange}
                    isInvalid={!!errors.subjectArea}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">-- Choose area --</option>
                    {subjectAreas.map(area => (
                      <option key={area.subject_area_id || area.id || area.display_name} value={area.display_name || area.name}>
                        {area.display_name || area.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.subjectArea}</Form.Control.Feedback>
                </Form.Group>
              </Card>
            </div>
          </Col>
        </Row>

        {/* Form Actions Footer */}
        <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top" style={{ borderColor: 'var(--border)' }}>
          <Button
            variant="light"
            className="py-2.5 px-4 font-sans text-main border btn-custom-sm"
            onClick={() => navigate(`${basePath}/journals`)}
          >
            Cancel Changes
          </Button>
          <Button
            type="submit"
            className="btn-primary-glow py-2.5 px-4"
          >
            Update Journal
          </Button>
        </div>
      </Form>
    </div>
  );
}
