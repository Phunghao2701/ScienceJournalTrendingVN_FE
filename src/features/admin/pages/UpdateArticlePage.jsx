import {
  PrimaryInformationSection,
  MetadataSection,
  ManuscriptFilesSection,
  ReviewStatusPanel,
  DeleteArticleModal,
} from '../components/update-article';
import { toast } from '../../../shared/utils/toast';
import useUpdateArticle from '../hooks/useUpdateArticle';

export default function UpdateArticlePage() {
  const {
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
  } = useUpdateArticle();

  if (loading) {
    return (
      <div className="admin-state-card">
        <span className="admin-state-dot" />
        <span>Loading article details from API...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-state-card admin-state-card--error">
        <span className="admin-state-dot" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <>
      <p className="admin-breadcrumb">
        Management / Articles / <span className="admin-breadcrumb__current">Update Article</span>
      </p>

      <div className="admin-page-header">
        <div className="admin-page-header__copy">
          <p className="admin-page-kicker">Article Operations</p>
          <h1 className="admin-page-title">Update Article</h1>
          <p className="admin-page-lede">
            Modify manuscript details, metadata, and publication status for the selected research record.
          </p>
        </div>
      </div>

      <div className={`admin-update-article-row${submitting ? ' admin-form-disabled' : ''}`}>
        <div className="admin-update-article-main">
          <PrimaryInformationSection
            title={title}
            leadAuthor={leadAuthor}
            journal={journal}
            journalOptions={originalData ? [originalData.journal] : [journal]}
            onChangeTitle={setTitle}
            onChangeLeadAuthor={(val) => {
              // This is UI only for now, since BE authors update needs author IDs
              setLeadAuthor(val);
              toast.info('Chỉnh sửa Lead Author chỉ có tác dụng hiển thị ở UI hiện tại.');
            }}
            onChangeJournal={(val) => {
              // Same here, BE requires issue_id to change journals
              setJournal(val);
            }}
          />

          <MetadataSection
            abstract={abstract}
            keywords={keywords}
            submissionId={`ART-${id}`}
            submissionDate={submissionDate}
            onChangeAbstract={setAbstract}
            onChangeKeywords={setKeywords}
            onChangeSubmissionDate={(val) => {
              setSubmissionDate(val);
            }}
          />

          <ManuscriptFilesSection files={[]} />
        </div>

        <ReviewStatusPanel
          status={status}
          onChangeStatus={setStatus}
          stats={stats}
          onUpdate={handleUpdate}
          onCancel={handleCancel}
          onDelete={() => setShowDeleteModal(true)}
        />
      </div>

      <DeleteArticleModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        articleTitle={title}
      />
    </>
  );
}