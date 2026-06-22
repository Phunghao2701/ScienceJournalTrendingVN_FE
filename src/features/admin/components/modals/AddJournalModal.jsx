import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useJournalManagement } from '../../../journal/hooks/useJournalManagement';

export default function AddJournalModal({ show, handleClose }) {
  const { addJournal } = useJournalManagement();

  const [formData, setFormData] = useState({
    title: '',
    issn: '',
    onlineIssn: '',
    publisher: '', // this will store publisher_id
    subjectCategory: '',
    subjectArea: '',
    aimScope: '',
    visibility: 'Public',
    broadCategory: 'Technology',
    specificResearchArea: ''
  });

  const [publishers, setPublishers] = useState([]);
  const [subjectAreas, setSubjectAreas] = useState([]);
  const [subjectCategories, setSubjectCategories] = useState([]);
  const [zones, setZones] = useState({ countryZoneId: 1, regionZoneId: 2 });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      const loadData = async () => {
        setLoading(true);
        
        try {
          const { getPublishersApi, getSubjectAreasApi, getSubjectCategoriesApi } = await import('../../../journal/api/journalApi');
          const { getCountryStatsApi, getRegionStatsApi } = await import('../../../zone/api/zone.api');
          
          const [pubRes, countryRes, regionRes, areaRes, catRes] = await Promise.all([
            getPublishersApi({ page: 1, limit: 100 }),
            getCountryStatsApi({ limit: 1 }),
            getRegionStatsApi({ limit: 1 }),
            getSubjectAreasApi({ page: 1, limit: 100 }),
            getSubjectCategoriesApi({ page: 1, limit: 100 })
          ]);
          
          const pubItems = pubRes.data?.data?.items || pubRes.data?.data || [];
          setPublishers(pubItems);
          if (pubItems.length > 0) {
            setFormData(prev => ({ ...prev, publisher: pubItems[0].publisher_id || pubItems[0].id }));
          }

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

          console.error('Failed to load publishers or zones:', err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Tên tạp chí không được để trống';
    if (!formData.issn.trim()) newErrors.issn = 'Mã số ISSN không được để trống';
    if (!formData.publisher) newErrors.publisher = 'Vui lòng chọn nhà xuất bản';
    if (!formData.subjectCategory) newErrors.subjectCategory = 'Vui lòng chọn danh mục chính';
    if (!formData.subjectArea) newErrors.subjectArea = 'Lĩnh vực nghiên cứu cụ thể không được trống';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const selectedPub = publishers.find(p => String(p.publisher_id || p.id) === String(formData.publisher));
      
      const payload = {
        display_name: formData.title,
        publisher_id: parseInt(formData.publisher),
        country: parseInt(zones.countryZoneId),
        region: parseInt(zones.regionZoneId),
        
        // Include frontend specific fields so normalizer works
        title: formData.title,
        issn: formData.issn,
        onlineIssn: formData.onlineIssn,
        aimScope: formData.aimScope,
        visibility: formData.visibility,
        subjectCategory: formData.subjectCategory,
        subjectArea: formData.subjectArea,
        publisher_name: selectedPub ? selectedPub.display_name : 'ResearchPulse Press'
      };

      await addJournal(payload);
      
      setFormData({
        title: '',
        issn: '',
        onlineIssn: '',
        publisher: publishers[0]?.publisher_id || publishers[0]?.id || '',
        subjectCategory: '',
        subjectArea: '',
        aimScope: '',
        visibility: 'Public',
        broadCategory: 'Technology',
        specificResearchArea: ''
      });
      handleClose();
    } catch (err) {
      alert('Lỗi tạo tạp chí: ' + err.message);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" className="text-main">
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="font-display fw-bold h4 text-main">Thêm Journal Mới</Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="py-4 text-start">
          
          {/* Tên Journal */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium small text-main">Tên Journal <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              isInvalid={!!errors.title}
              placeholder="Nhập tên journal đầy đủ"
            />
            <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
          </Form.Group>

          {/* Row 2: Mã ISSN & Danh mục */}
          <Row className="g-3 mb-3">
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-main">Mã ISSN <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="issn"
                  value={formData.issn}
                  onChange={handleChange}
                  isInvalid={!!errors.issn}
                  placeholder="Ví dụ: 1234-5678"
                />
                <Form.Control.Feedback type="invalid">{errors.issn}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-main">Danh mục <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="subjectCategory"
                  value={formData.subjectCategory}
                  onChange={handleChange}
                  isInvalid={!!errors.subjectCategory}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Chọn danh mục</option>
                  {subjectCategories.map(cat => (
                    <option key={cat.subject_category_id || cat.id || cat.display_name} value={cat.display_name || cat.name}>
                      {cat.display_name || cat.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.subjectCategory}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Row 3: Nhà xuất bản & Lĩnh vực nghiên cứu */}
          <Row className="g-3 mb-3">
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-main">Nhà xuất bản <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleChange}
                  isInvalid={!!errors.publisher}
                  style={{ cursor: 'pointer' }}
                >
                  {loading ? (
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
            </Col>
            
            <Col xs={12} sm={6}>
              <Form.Group>
                <Form.Label className="fw-medium small text-main">Lĩnh vực nghiên cứu <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="subjectArea"
                  value={formData.subjectArea}
                  onChange={handleChange}
                  isInvalid={!!errors.subjectArea}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Chọn lĩnh vực</option>
                  {subjectAreas.map(area => (
                    <option key={area.subject_area_id || area.id || area.display_name} value={area.display_name || area.name}>
                      {area.display_name || area.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.subjectArea}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          <Button variant="light" onClick={handleClose} className="btn-custom-sm text-main">
            Hủy
          </Button>
          <Button type="submit" className="btn-primary-glow px-4">
            + Create Journal
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
