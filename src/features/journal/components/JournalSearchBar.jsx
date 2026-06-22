/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\journal\components\JournalSearchBar.jsx
 */
import { Form, Row, Col, Button, InputGroup } from 'react-bootstrap';
import { Icon } from '@iconify/react';

export default function JournalSearchBar({
  searchInput,
  setSearchInput,
  quartile,
  setQuartile,
  isOpenAccess,
  setIsOpenAccess,
  onSubmit,
  onClear
}) {
  return (
    <Form onSubmit={onSubmit} className="journal-search-panel">
      <Row className="g-3 align-items-center">
        {/* Search Input Box */}
        <Col lg={6} md={12}>
          <InputGroup className="journal-search-group">
            <InputGroup.Text className="journal-search-addon">
              <Icon icon="lucide:search" width="18" />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Tìm journal..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="journal-search-input"
            />
            {searchInput && (
              <Button 
                variant="link" 
                className="journal-search-clear p-2"
                onClick={() => setSearchInput('')}
              >
                <Icon icon="lucide:x" width="16" />
              </Button>
            )}
            <Button 
              type="submit" 
              className="journal-search-submit px-4 border-0"
            >
              Tìm kiếm
            </Button>
          </InputGroup>
        </Col>

        {/* Quartile Dropdown */}
        <Col lg={2.5} md={4} sm={6} xs={12}>
          <Form.Select
            value={quartile}
            onChange={(e) => setQuartile(e.target.value)}
            className="journal-filter-select text-main py-2.5"
          >
            <option value="all">Tất cả quartile</option>
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </Form.Select>
        </Col>

        {/* Access Dropdown */}
        <Col lg={2.5} md={4} sm={6} xs={12}>
          <Form.Select
            value={isOpenAccess}
            onChange={(e) => setIsOpenAccess(e.target.value)}
            className="journal-filter-select text-main py-2.5"
          >
            <option value="all">Tất cả truy cập</option>
            <option value="oa">Open Access (OA)</option>
            <option value="subscription">Subscription</option>
          </Form.Select>
        </Col>

        {/* Clear Button */}
        <Col lg={1} md={4} sm={12} xs={12} className="text-md-end text-center">
          <Button
            variant="link"
            className="journal-reset-btn py-2"
            onClick={onClear}
          >
            <Icon icon="lucide:refresh-cw" className="me-1" />
            Reset
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
