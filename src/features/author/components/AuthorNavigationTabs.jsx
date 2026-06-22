/**
 * @file AuthorNavigationTabs.jsx
 * @description Component thanh điều hướng phụ cho trang tác giả.
 */

import { Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';

export default function AuthorNavigationTabs({ activeTab }) {
  const navigate = useNavigate();

  return (
    <Nav
      variant="tabs"
      activeKey={activeTab}
      className="author-tabs mb-4 border-0 d-flex flex-nowrap overflow-x-auto"
    >
      <Nav.Item>
        <Nav.Link
          eventKey="list"
          onClick={() => navigate('/authors')}
          className="d-flex align-items-center gap-2 px-3 py-2 text-nowrap"
        >
          <Icon icon="lucide:users" width="16" />
          Danh sách tác giả
        </Nav.Link>
      </Nav.Item>

      <Nav.Item>
        <Nav.Link
          eventKey="leaderboard"
          onClick={() => navigate('/authors/leaderboard')}
          className="d-flex align-items-center gap-2 px-3 py-2 text-nowrap"
        >
          <Icon icon="lucide:trophy" width="16" />
          Bảng xếp hạng
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
}
