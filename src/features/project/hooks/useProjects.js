/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\project\hooks\useProjects.js
 */
import { useState, useCallback } from 'react';
import { getProjectsApi, createProjectApi, deleteProjectApi } from '../api/project.api';

export default function useProjects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getProjectsApi();
      if (response.data && response.data.success !== false) {
        setProjects(response.data.data || []);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch projects');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = useCallback(async (projectData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await createProjectApi(projectData);
      if (response.data && response.data.success !== false) {
        await fetchProjects();
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Failed to create project');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProjects]);

  const deleteProject = useCallback(async (id) => {
    setError(null);
    try {
      const response = await deleteProjectApi(id);
      if (response.data && response.data.success !== false) {
        setProjects((prev) => prev.filter((p) => String(p.project_id) !== String(id)));
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Failed to delete project');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  }, []);

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    deleteProject,
  };
}
