import { useEffect, useRef, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Icon from '../../../shared/components/Icon';
import { isValidOrcid, normalizeOrcid } from '../utils/orcid';

export default function OrcidScanForm({
  initialValue = '',
  isScanning = false,
  serverError = '',
  onSubmit,
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isScanning) return;

    const normalized = normalizeOrcid(value);
    if (!isValidOrcid(normalized)) {
      setValidationError(t('orcidScan.validationError'));
      inputRef.current?.focus();
      return;
    }

    setValidationError('');
    setValue(normalized);
    await onSubmit(normalized);
  };

  const error = validationError || serverError;
  const describedBy = [
    'orcid-scan-help',
    'orcid-scan-example',
    error ? 'orcid-scan-error' : '',
  ].filter(Boolean).join(' ');

  return (
    <Form className="orcid-scan-form" onSubmit={handleSubmit} noValidate>
      <Form.Label htmlFor="orcid-scan-input" className="orcid-scan-label">
        {t('orcidScan.inputLabel')}
      </Form.Label>
      <InputGroup className="orcid-scan-input-group">
        <InputGroup.Text aria-hidden="true">
          <Icon icon="lucide:fingerprint" width="18" />
        </InputGroup.Text>
        <Form.Control
          ref={inputRef}
          id="orcid-scan-input"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (validationError) setValidationError('');
          }}
          placeholder={t('orcidScan.placeholder')}
          aria-describedby={describedBy}
          aria-errormessage={error ? 'orcid-scan-error' : undefined}
          aria-invalid={Boolean(error)}
          disabled={isScanning}
          autoComplete="off"
          spellCheck="false"
        />
        <Button
          type="submit"
          className="orcid-scan-submit"
          disabled={isScanning || !value.trim()}
        >
          {isScanning ? (
            <>
              <span className="spinner-border spinner-border-sm" aria-hidden="true" />
              {t('orcidScan.scanning')}
            </>
          ) : (
            <>
              <Icon icon="lucide:scan-search" width="17" aria-hidden="true" />
              {t('orcidScan.submit')}
            </>
          )}
        </Button>
      </InputGroup>
      <p id="orcid-scan-help" className="orcid-scan-help">
        {t('orcidScan.inputHelp')}
      </p>
      <p id="orcid-scan-example" className="orcid-scan-example">
        {t('orcidScan.inputExample')}
      </p>
      <div
        id="orcid-scan-error"
        className="orcid-scan-field-error"
        role={error ? 'alert' : undefined}
      >
        {error}
      </div>
    </Form>
  );
}
