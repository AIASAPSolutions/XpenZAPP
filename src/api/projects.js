import { request } from './client';

export const getProjects = () => {
  return request('get', '/projects');
};

export const createProject = (projectData) => {
  return request('post', '/projects', projectData);
};

export const deleteProject = (id) => {
  return request('delete', `/projects/${id}`);
};
