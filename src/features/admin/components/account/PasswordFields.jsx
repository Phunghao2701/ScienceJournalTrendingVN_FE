import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';

/**
 * PasswordFields Component
 * Renders current password, new password, and confirmation password input boxes.
 * 
 * @param {Object} props - Props
 * @param {string} props.currentPassword - Current password state value
 * @param {function} props.onCurrentPasswordChange - Setter for current password
 * @param {string} props.newPassword - New password state value
 * @param {function} props.onNewPasswordChange - Setter for new password
 * @param {string} props.confirmPassword - Confirm password state value
 * @param {function} props.onConfirmPasswordChange - Setter for confirm password
 * @param {boolean} props.isEdit - True if rendering on Edit screen (adds Current Password), false if Add screen
 */
export default function PasswordFields({
  currentPassword,
  onCurrentPasswordChange,
  newPassword,
  onNewPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  isEdit = true
}) {
  return (
    <div>
      <Row className="g-3">
        {/* Current Password - Only required for updating existing profile */}
        {isEdit && (
          <Col xs={12} md={4}>
            <Form.Group controlId="currentPassword">
              <Form.Label className="account-form-label">
                Current Password
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => onCurrentPasswordChange(e.target.value)}
                className="account-form-input"
              />
            </Form.Group>
          </Col>
        )}

        {/* New Password field */}
        <Col xs={12} md={isEdit ? 4 : 6}>
          <Form.Group controlId="newPassword">
            <Form.Label className="account-form-label">
              {isEdit ? 'New Password' : 'Password *'}
            </Form.Label>
            <Form.Control
              type="password"
              placeholder={isEdit ? 'Min. 12 chars' : 'Create a strong password'}
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              required={!isEdit}
              className="account-form-input"
            />
          </Form.Group>
        </Col>

        {/* Confirm password field */}
        <Col xs={12} md={isEdit ? 4 : 6}>
          <Form.Group controlId="confirmPassword">
            <Form.Label className="account-form-label">
              {isEdit ? 'Confirm New Password' : 'Confirm Password *'}
            </Form.Label>
            <Form.Control
              type="password"
              placeholder={isEdit ? 'Repeat new password' : 'Confirm password'}
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              required={!isEdit}
              className="account-form-input"
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Password complexity helper note */}
      <div className="form-text text-muted-custom mt-2 small">
        Password must be at least 8 characters long, and contain uppercase, lowercase letters, and digits.
      </div>
    </div>
  );
}
