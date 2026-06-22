import { useEffect, useState } from 'react';
import { Row, Col, Card, ProgressBar, Button } from 'react-bootstrap';
import Pagination from '../../../../shared/components/Pagination';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import UserTable from '../../components/account/UserTable';
import UserFilterBar from '../../components/account/UserFilterBar';
import { getAdminUsers } from '../../api/adminUsers.api';
import ROUTES from '../../../../app/routes/routePaths';

const ITEMS_PER_PAGE = 10;

const getApiErrorMessage = (error) => {
  if (error.response?.status === 403) {
    return 'Backend từ chối quyền admin: token hiện tại không có role ADMINISTRATOR.';
  }

  return error.response?.data?.message || 'Không thể tải danh sách người dùng.';
};

const extractUsers = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.users)) return payload.users;
  return [];
};

const extractTotal = (payload, fallback) => {
  return Number(
    payload?.total ||
      payload?.totalItems ||
      payload?.pagination?.total ||
      payload?.meta?.total ||
      fallback
  );
};

const ROLE_LABELS = {
  RESEARCHER: 'Researcher',
  LECTURER: 'Lecturer',
  STUDENT: 'Student',
  ADMINISTRATOR: 'Administrator',
};

const toRoleLabel = (role = 'RESEARCHER') => ROLE_LABELS[role] || role;

const toTitleCaseEnum = (value = '') => {
  return String(value)
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const normalizeUser = (user = {}) => {
  const firstName = user.first_name || user.firstName || '';
  const lastName = user.last_name || user.lastName || '';
  const fullName = user.name || [firstName, lastName].filter(Boolean).join(' ').trim();

  return {
    id: user.id || user.user_id || user.uuid,
    name: fullName || user.email || 'Unnamed user',
    email: user.email || 'No email',
    role: user.role || 'RESEARCHER',
    roleLabel: toRoleLabel(user.role || 'RESEARCHER'),
    status: toTitleCaseEnum(user.status || 'INACTIVE'),
    avatar: user.avatar || user.avatar_url || '',
  };
};

/**
 * UserDirectoryPage Component
 * Renders the administrator's account directory page with real admin users API data.
 */
export default function UserDirectoryPage() {
  const navigate = useNavigate();

  // Search and filter states
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getAdminUsers({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: search || undefined,
          role: selectedRole === 'all' ? undefined : selectedRole,
          status: selectedStatus === 'all' ? undefined : selectedStatus.toUpperCase(),
          sortBy: 'email',
          sortOrder: 'asc',
        });

        const payload = response.data?.data;
        const rawUsers = extractUsers(payload);

        if (!isMounted) return;
        setUsers(rawUsers.map(normalizeUser));
        setTotalItems(extractTotal(payload, rawUsers.length));
      } catch (apiError) {
        if (!isMounted) return;
        setUsers([]);
        setTotalItems(0);
        setError(getApiErrorMessage(apiError));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [currentPage, search, selectedRole, selectedStatus]);



  /**
   * Pagination is API-driven, so changing page triggers a fresh request.
   */
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleUnavailableDelete = () => {
    alert('BE hiện chưa có API xóa user. Cần bổ sung DELETE /api/v1/admin/users/:id trước khi bật chức năng này.');
  };

  return (
    <div className="container-fluid py-2">
      {/* Page Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb text-muted-custom small mb-0">
          <li className="breadcrumb-item">Management</li>
          <li className="breadcrumb-item active" aria-current="page">User Directory</li>
        </ol>
      </nav>

      {/* Main Header title & actions section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3 mb-4">
        <div>
          <h1 className="font-display fw-bold text-main mb-1" style={{ fontSize: '1.8rem' }}>User Directory</h1>
          <p className="text-muted-custom small mb-0" style={{ maxWidth: '680px' }}>
            Manage platform contributors, their access levels, and account status within the ResearchPulse ecosystem.
          </p>
        </div>
        
        {/* Submit New Account button (leads to Page 17) - Sử dụng hằng số định tuyến */}
        <Button 
          onClick={() => navigate(ROUTES.ADMIN_USERS_CREATE)}
          className="btn-primary-glow border-0 d-flex align-items-center gap-2 rounded-pill px-4 py-2"
          style={{ fontSize: '0.88rem' }}
        >
          <Icon icon="lucide:plus-circle" width="18" />
          <span>Submit New Account</span>
        </Button>
      </div>

      <Row className="g-4">
        {/* Left column: User filter bar and User Table */}
        <Col xs={12} lg={8.5} className="col-lg-8">
          <Card className="p-4 rounded-4 border bg-white shadow-sm">
            {/* Filter controls */}
            <UserFilterBar 
              search={search}
              onSearchChange={handleFilterChange(setSearch)}
              selectedRole={selectedRole}
              onRoleChange={handleFilterChange(setSelectedRole)}
              selectedStatus={selectedStatus}
              onStatusChange={handleFilterChange(setSelectedStatus)}
              totalCount={totalItems}
            />

            {loading ? (
              <div className="text-center py-5 text-muted-custom small">Đang tải danh sách người dùng...</div>
            ) : error ? (
              <div className="text-center py-5 border rounded-3 bg-white">
                <Icon icon="lucide:shield-alert" width="48" className="text-danger mb-2 opacity-75" />
                <h6 className="text-main fw-bold">Không thể tải người dùng</h6>
                <p className="text-muted-custom small mb-0">{error}</p>
              </div>
            ) : (
              <UserTable 
                users={users}
                onEdit={(id) => navigate(ROUTES.ADMIN_USERS_EDIT.replace(':id', id))}
                onDelete={handleUnavailableDelete}
              />
            )}

            {/* Pagination Controls */}
            {!loading && !error && totalItems > 0 && (
              <div className="px-3 pb-3 pt-2">
                <Pagination
                  totalItems={totalItems}
                  currentPage={currentPage}
                  limit={ITEMS_PER_PAGE}
                  onPageChange={handlePageChange}
                  entityName="users"
                />
              </div>
            )}
          </Card>
        </Col>

        {/* Right column: Access Control and Pending Requests widgets */}
        <Col xs={12} lg={3.5} className="col-lg-4 d-flex flex-column gap-4">
          {/* Access Control Information box */}
          <Card 
            className="p-4 rounded-4 border-0 text-white"
            style={{
              background: 'linear-gradient(135deg, #ff7a33 0%, #ea580c 100%)',
              boxShadow: '0 4px 20px rgba(234, 88, 12, 0.15)'
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2.5">
              <Icon icon="lucide:shield-check" width="22" className="text-white" />
              <h5 className="fw-bold mb-0" style={{ fontSize: '1.05rem', letterSpacing: '-0.01em' }}>Access Control</h5>
            </div>
            <p className="mb-4 text-white-50 small lh-sm">
              Review system permissions and security logs for auditing purposes. Maintain strict compliance across all journal volumes.
            </p>
            <a 
              href="#security" 
              onClick={(e) => { e.preventDefault(); alert('Redirecting to Security Logs Overview...'); }}
              className="text-white fw-semibold small text-decoration-none d-flex align-items-center gap-1.5 hover-white-glow"
            >
              <span>Security Overview</span>
              <Icon icon="lucide:arrow-right" width="16" />
            </a>
          </Card>

          {/* Pending Requests Sidebar Widget */}
          <Card className="p-4 rounded-4 border bg-white shadow-sm">
            <div className="d-flex align-items-center justify-content-between mb-3.5">
              <div className="d-flex align-items-center gap-2">
                <h6 className="fw-bold text-main mb-0" style={{ fontSize: '0.925rem' }}>PENDING REQUESTS</h6>
              </div>
            </div>

            <div className="text-center py-4 text-muted-custom small">
              <Icon icon="lucide:check-circle-2" width="32" className="admin-accent-text mb-2 opacity-50" />
              <p className="mb-1">Chưa có API pending role requests.</p>
              <p className="mb-0">Đã xóa dữ liệu mock khỏi khu vực này.</p>
            </div>
          </Card>

          {/* Platform Health indicators widget */}
          <Card className="p-4 rounded-4 border bg-white shadow-sm">
            <h6 className="fw-bold text-main mb-3 text-uppercase tracking-wider" style={{ fontSize: '0.78rem' }}>
              Platform Health
            </h6>
            
            {/* Storage indicator */}
            <div className="mb-3.5">
              <div className="d-flex justify-content-between small text-muted-custom mb-1.5" style={{ fontSize: '0.825rem' }}>
                <span>Storage Capacity</span>
                <strong className="text-main fw-semibold">N/A</strong>
              </div>
              <ProgressBar now={0} variant="warning" style={{ height: '5px' }} />
            </div>

            {/* Active Authors indicator */}
            <div>
              <div className="d-flex justify-content-between small text-muted-custom mb-1.5" style={{ fontSize: '0.825rem' }}>
                <span>Active Authors</span>
                <strong className="text-main fw-semibold">N/A</strong>
              </div>
              <ProgressBar now={0} style={{ height: '5px', backgroundColor: '#e2e8f0', '--bs-progress-bar-bg': 'var(--btn-dark)' }} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
