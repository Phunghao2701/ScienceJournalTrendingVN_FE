/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: shared\components\InputField.jsx
 */
import { Form, InputGroup } from 'react-bootstrap';
import Icon from './Icon';
import { useState, useId } from 'react';

export default function InputField({
  id: customId,
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  icon,
  required = false,
  disabled = false,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const generatedId = useId();
  const inputId = customId || name || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <Form.Group className="mb-3">
      {label && (
        <Form.Label 
          htmlFor={inputId}
          className="text-xs font-bold mb-1.5 d-flex align-items-center gap-1 cursor-pointer"
          style={{ 
            letterSpacing: '0.05em', 
            color: 'var(--text-main)',
            textTransform: 'uppercase'
          }}
        >
          {label}
          {required && <span className="text-danger" aria-hidden="true">*</span>}
        </Form.Label>
      )}
      
      <InputGroup 
        className="rounded-3 overflow-hidden border"
        style={{
          borderColor: error ? '#ef4444' : (isFocused ? 'var(--primary)' : 'var(--border)'),
          background: '#ffffff',
          transition: 'all 0.2s ease-in-out',
          boxShadow: error 
            ? '0 0 0 3px rgba(239, 68, 68, 0.12)' 
            : (isFocused ? '0 0 0 3px rgba(25, 118, 210, 0.15)' : '0 1px 2px rgba(0, 0, 0, 0.02)')
        }}
      >
        {icon && (
          <InputGroup.Text 
            className="bg-transparent border-0 pe-1 text-muted-custom d-flex align-items-center justify-content-center"
            style={{ width: '40px' }}
          >
            <Icon icon={icon} width="18" className="text-muted-custom opacity-70" />
          </InputGroup.Text>
        )}
        
        <Form.Control
          id={inputId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={(e) => {
            setIsFocused(true);
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          required={required}
          className="bg-transparent border-0 text-main text-sm py-2.5 ps-2"
          style={{
            boxShadow: 'none',
            outline: 'none',
            color: 'var(--text-main)'
          }}
          {...props}
        />
      </InputGroup>
      
      {error && (
        <div 
          id={errorId}
          role="alert"
          aria-live="polite"
          className="text-danger text-xs mt-1.5 d-flex align-items-center gap-1 animate-fade-in"
          style={{ fontWeight: 500 }}
        >
          <Icon icon="lucide:alert-circle" width="12" />
          <span>{error}</span>
        </div>
      )}
    </Form.Group>
  );
}

