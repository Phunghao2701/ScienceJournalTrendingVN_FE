import { useState } from 'react';
import { Card, Button, Row, Col, Modal, Form } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import SubmissionTabs from '../../components/article-submission/SubmissionTabs';
import ManualArticleForm from '../../components/article-submission/ManualArticleForm';
import PdfDropzone from '../../components/article-submission/PdfDropzone';
import UploadFeatureCard from '../../components/article-submission/UploadFeatureCard';
import { useAdminStore } from '../../../../app/store/adminStore';

/**
 * SubmitArticlePage Component
 * Orchestrates the full submit article flow (Page 15 & 16).
 */
export default function SubmitArticlePage() {
  const navigate = useNavigate();
  const { saveDraft } = useAdminStore();

  // Tab State
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'pdf'

  // Shared state: values are preserved when switching tabs
  const [manualFormData, setManualFormData] = useState({
    title: '',
    abstract: '',
    keywords: [],
    author: '',
    journalId: '',
    categoryId: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Operation / Feedback UX states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  /**
   * Safe Draft submission handler.
   */
  const handleSaveDraft = () => {
    const draftItem = {
      type: activeTab,
      data: activeTab === 'manual' ? manualFormData : { fileName: selectedFile?.name, fileSize: selectedFile?.size },
      savedAt: new Date().toLocaleTimeString()
    };
    saveDraft(draftItem);
    alert(`Draft saved successfully at ${draftItem.savedAt}!`);
  };

  /**
   * Submits the article. Triggers client-side checks and uses available APIs only.
   */
  const handleSubmitArticle = async (e) => {
    e.preventDefault();

    if (activeTab === 'manual') {
      // Validate manual form fields
      const { title, abstract, author, journalId, categoryId, keywords } = manualFormData;
      if (!title || !abstract || !author || !journalId || !categoryId) {
        alert('Please fill in all required fields in the Manual Entry form.');
        return;
      }

      setIsSubmitting(true);
      try {
        const { getAuthorsApi, createAuthorApi } = await import('../../../../features/author/api/author.api');
        const { createArticleApi } = await import('../../../../features/article/api/articleApi');
        
        // Resolve author
        const authorNames = author.split(',').map(n => n.trim()).filter(Boolean);
        const authorIds = [];
        for (const name of authorNames) {
          const searchRes = await getAuthorsApi({ search: name, limit: 1 });
          const items = searchRes.data?.data?.items || searchRes.data?.data || [];
          if (items.length > 0 && items[0].display_name.toLowerCase() === name.toLowerCase()) {
            authorIds.push(items[0].author_id || items[0].id);
          } else {
            const createRes = await createAuthorApi({ display_name: name });
            authorIds.push(createRes.data?.data?.author_id || createRes.data?.data?.id);
          }
        }
        
        // Prepare article payload
        const payload = {
          title,
          abstract,
          issue_id: null,
          publication_year: new Date().getFullYear(),
          primary_topic: parseInt(categoryId),
          authors: authorIds,
          keywords: keywords || []
        };
        
        await createArticleApi(payload);

        setIsSubmitting(false);
        setSuccessInfo({
          mode: 'manual',
          title: title,
          author: author,
        });
        setShowSuccessModal(true);
      } catch (err) {
        setIsSubmitting(false);
        alert('Error submitting article: ' + (err.response?.data?.message || err.message));
      }
    } else {
      // Validate PDF upload file selection
      if (!selectedFile) {
        alert('Please select or drop a valid PDF manuscript to submit.');
        return;
      }
      
      setIsSubmitting(true);
      setIsSubmitting(false);
      alert('ChÆ°a cÃ³ API submit PDF article. ÄÃ£ xÃ³a dá»¯ liá»‡u mock khá»i khu vá»±c nÃ y.');
    }
  };


  /**
   * Reset form and file values.
   */
  const resetSubmissionForm = () => {
    setManualFormData({
      title: '',
      abstract: '',
      keywords: [],
      author: '',
      journalId: '',
      categoryId: ''
    });
    setSelectedFile(null);
    setShowSuccessModal(false);
  };

  return (
    <div className="container-fluid py-2">
      {/* Page Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb text-muted-custom small mb-0">
          <li className="breadcrumb-item"><Link to="/dashboard" className="text-decoration-none text-muted-custom hover-primary">Articles</Link></li>
          <li className="breadcrumb-item active" aria-current="page">New Submission</li>
        </ol>
      </nav>

      {/* Main Header banner with Save Draft */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="font-display fw-bold text-main mb-1" style={{ fontSize: '1.8rem' }}>Submit Article</h1>
        </div>
        
        {/* Top Aligned Save Draft Button */}
        <Button 
          variant="light"
          onClick={handleSaveDraft}
          className="border rounded-3 py-2 px-3 fw-semibold text-main hover-primary-light"
          style={{ fontSize: '0.85rem' }}
        >
          Save Draft
        </Button>
      </div>

      <div className="mx-auto" style={{ maxWidth: '850px' }}>
        {/* Primary submission wrapper card */}
        <Card className="p-4 rounded-4 border bg-white shadow-sm mb-5">
          {/* Tab nav selectors */}
          <SubmissionTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <Form onSubmit={handleSubmitArticle}>
            {/* Conditional Tab Body Rendering */}
            <div className="py-2 mb-4">
              {activeTab === 'manual' ? (
                // Tab 1: Manual Form Fields
                <ManualArticleForm 
                  formData={manualFormData}
                  onChange={setManualFormData}
                />
              ) : (
                // Tab 2: PDF dropzone upload area
                <div className="d-flex flex-column gap-4">
                  <PdfDropzone 
                    selectedFile={selectedFile}
                    onFileSelect={setSelectedFile}
                    onFileRemove={() => setSelectedFile(null)}
                  />

                  {/* Highlight feature cards rendered at the bottom of upload view (Page 16) */}
                  <Row className="g-3 mt-1">
                    <Col xs={12} md={4}>
                      <UploadFeatureCard 
                        title="OCR Processing"
                        description="System automatically extracts metadata from your uploaded PDF."
                        icon="lucide:scan-eye"
                      />
                    </Col>
                    <Col xs={12} md={4}>
                      <UploadFeatureCard 
                        title="Secure Upload"
                        description="Encrypted storage ensures your intellectual property is protected."
                        icon="lucide:lock"
                      />
                    </Col>
                    <Col xs={12} md={4}>
                      <UploadFeatureCard 
                        title="Fast Review"
                        description="Uploaded PDFs enter the review queue immediately."
                        icon="lucide:zap"
                      />
                    </Col>
                  </Row>
                </div>
              )}
            </div>

            {/* Bottom-right alignment Submit Action Button */}
            <div className="d-flex justify-content-end pt-3 border-top">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-primary-glow border-0 rounded-pill px-4.5 py-2"
                style={{ minWidth: '150px' }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Article'
                )}
              </Button>
            </div>
          </Form>
        </Card>
      </div>

      {/* Success modal */}
      <Modal 
        show={showSuccessModal} 
        onHide={() => setShowSuccessModal(false)}
        centered
        backdrop="static"
        contentClassName="border-0 rounded-4 shadow-lg"
      >
        <Modal.Body className="p-4 p-md-5 text-center">
          {/* Animated/Glowing Check Icon */}
          <div 
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4 success-glow"
            style={{
              width: '72px',
              height: '72px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)'
            }}
          >
            <Icon icon="lucide:check-circle" width="36" />
          </div>

          <h3 className="font-display fw-bold text-main mb-2">Submission Successful!</h3>
          <p className="text-muted-custom small mb-4">
            Your manuscript has been safely received. The review board and OCR pipelines will evaluate this entry.
          </p>

          {successInfo && (
            <div 
              className="p-3.5 rounded-3 border mb-4 text-start"
              style={{ backgroundColor: '#f8fafc', fontSize: '0.85rem' }}
            >
              <div className="mb-2">
                <span className="text-muted-custom">Mode: </span>
                <strong className="text-main text-capitalize">{successInfo.mode} Entry</strong>
              </div>
              <div className="mb-2 text-truncate">
                <span className="text-muted-custom">Identifier: </span>
                <strong className="text-main">{successInfo.title}</strong>
              </div>
              <div className="text-truncate">
                <span className="text-muted-custom">Author: </span>
                <strong className="text-main">{successInfo.author}</strong>
              </div>
            </div>
          )}

          <div className="d-flex flex-column gap-2">
            <Button 
              className="btn-primary-glow border-0 rounded-pill py-2.5"
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/dashboard');
              }}
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="light"
              className="border rounded-pill py-2"
              onClick={resetSubmissionForm}
            >
              Submit Another Article
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
