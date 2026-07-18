import { request } from './client';
import { normalizeProject, normalizeProjectList } from './normalizers';

export const getProjects = async () => {
  const res = await request('get', '/projects');
  return { data: normalizeProjectList(res.data) };
};

export const createProject = async (projectData) => {
  const res = await request('post', '/projects', {
    name: projectData.name,
    budget: projectData.budget,
    description: projectData.description || '',
  });
  return { data: normalizeProject(res.data) };
};

export const getProjectById = async (id) => {
  const res = await request('get', `/projects/${id}`);
  return { data: normalizeProject(res.data) };
};

export const updateProject = async (id, projectData) => {
  const res = await request('put', `/projects/${id}`, projectData);
  return { data: normalizeProject(res.data) };
};

export const deleteProject = async (id) => {
  const res = await request('delete', `/projects/${id}`);
  return { data: res.data };
};
