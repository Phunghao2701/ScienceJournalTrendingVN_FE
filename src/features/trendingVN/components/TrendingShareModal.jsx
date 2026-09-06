import React from 'react';
import { Modal, Form } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { toast } from '../../../shared/utils/toast';

export default function TrendingShareModal({ show, onHide }) {
  const { t } = useTranslation();

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className="tvn-modal"
    >
      <Modal.Header>
        <Modal.Title>{t("shareTitle")}</Modal.Title>
        <button
          className="tvn-modal-close-btn"
          onClick={onHide}
        >
          x
        </button>
      </Modal.Header>
      <Modal.Body>
        <div className="share-social-grid">
          <button
            className="share-social-btn twitter"
            onClick={() =>
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(document.title)}&url=${encodeURIComponent(window.location.href)}`,
                "_blank",
              )
            }
          >
            <Icon icon="ri:twitter-x-fill" width="16" />
            {t("shareTwitter")}
          </button>
          <button
            className="share-social-btn linkedin"
            onClick={() =>
              window.open(
                `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
                "_blank",
              )
            }
          >
            <Icon icon="ri:linkedin-box-fill" width="16" />
            {t("shareLinkedIn")}
          </button>
          <button
            className="share-social-btn facebook"
            onClick={() =>
              window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                "_blank",
              )
            }
          >
            <Icon icon="ri:facebook-box-fill" width="16" />
            {t("shareFacebook")}
          </button>
          <button
            className="share-social-btn email"
            onClick={() => {
              window.location.href = `mailto:?subject=${encodeURIComponent(document.title)}&body=${encodeURIComponent(window.location.href)}`;
            }}
          >
            <Icon icon="ri:mail-fill" width="16" />
            {t("shareEmail")}
          </button>
        </div>

        <div className="tvn-modal-panel-title mb-2">
          {t("copyLinkToShare")}
        </div>
        <div className="share-copy-group">
          <Form.Control
            type="text"
            readOnly
            value={window.location.href}
            className="share-copy-input"
          />
          <button
            type="button"
            className="share-copy-btn"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success(t("linkCopied"));
            }}
            title="Copy Link"
          >
            <Icon icon="lucide:copy" width="16" />
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
