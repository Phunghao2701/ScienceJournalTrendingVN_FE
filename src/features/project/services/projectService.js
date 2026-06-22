import * as projectApi from '../api/project.api';

/**
 * Service xử lý logic nghiệp vụ cho Project
 */
const projectService = {
  /**
   * Lấy danh sách dự án
   * @returns {Promise<Array>} Danh sách dự án
   */
  async getAllProjects() {
    const res = await projectApi.getProjectsApi();
    return res.data?.data || [];
  },

  /**
   * Tạo dự án mới
   * @param {Object} data - Payload tạo dự án
   * @returns {Promise<Object>} Dữ liệu trả về từ backend
   */
  async createProject(data) {
    const res = await projectApi.createProjectApi(data);
    return res.data;
  },

  /**
   * Lấy chi tiết dự án
   * @param {number|string} id - ID dự án
   * @returns {Promise<Object>} Chi tiết dự án
   */
  async getProjectById(id) {
    const res = await projectApi.getProjectByIdApi(id);
    return res.data;
  },

  /**
   * Cập nhật dự án
   * @param {number|string} id - ID dự án
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise<Object>} Dữ liệu trả về
   */
  async updateProject(id, data) {
    const res = await projectApi.updateProjectApi(id, data);
    return res.data;
  },

  /**
   * Xóa dự án
   * @param {number|string} id - ID dự án
   * @returns {Promise<Object>} Dữ liệu trả về
   */
  async deleteProject(id) {
    const res = await projectApi.deleteProjectApi(id);
    return res.data;
  }
};

export default projectService;
