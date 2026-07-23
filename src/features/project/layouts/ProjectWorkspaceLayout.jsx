import { Icon } from '@iconify/react';
import { Outlet } from 'react-router-dom';
import Header from '../../landing/components/Header';
import WorkspaceSidebar from '../../trendingVN/components/WorkspaceSidebar';
import { useProjectText } from '../i18n/useProjectText';
import '../../trendingVN/trendingVN.css';
import '../projectWorkspace.css';

/**
 * Shared ResearchPulse workspace shell for every Project CRUD screen.
 */
export default function ProjectWorkspaceLayout() {
  const p = useProjectText();
  return (
    <div className="project-workspace">
      <Header />
      <div className="tvn-layout-wrapper">
        <WorkspaceSidebar activeItem="projects" />
        <main className="tvn-main-content project-workspace-main">
          <div className="tvn-top-info-bar">
            <div className="total-count">
              <Icon icon="lucide:folder-kanban" width="13" className="me-1" />
              {p('projects')}
            </div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
