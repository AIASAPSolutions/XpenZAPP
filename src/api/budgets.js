import { request } from './client';

export const getBudgets = () => {
  return request('get', '/budgets');
};

export const createBudget = (budgetData) => {
  return request('post', '/budgets', budgetData);
};

export const updateBudget = (id, budgetData) => {
  return request('put', `/budgets/${id}`, budgetData);
};

export const deleteBudget = (id) => {
  return request('delete', `/budgets/${id}`);
};
