import { request } from './client';
import { normalizeExpense, normalizeExpenseList } from './normalizers';

export const getExpenses = async (projectId, params = {}) => {
  const res = await request('get', `/projects/${projectId}/expenses`, null, { params });
  return { data: normalizeExpenseList(res.data) };
};

export const getExpenseById = async (projectId, id) => {
  const res = await request('get', `/projects/${projectId}/expenses/${id}`);
  return { data: normalizeExpense(res.data) };
};

export const addExpense = async (projectId, data) => {
  const res = await request('post', `/projects/${projectId}/expenses`, data);
  return { data: normalizeExpense(res.data) };
};

export const createExpense = addExpense;

export const updateExpense = async (projectId, id, data) => {
  const res = await request('put', `/projects/${projectId}/expenses/${id}`, data);
  return { data: normalizeExpense(res.data) };
};

export const deleteExpense = async (projectId, id) => {
  const res = await request('delete', `/projects/${projectId}/expenses/${id}`);
  return { data: res.data };
};

export const parseReceipt = async (projectId, receiptData) => {
  const res = await request('post', `/projects/${projectId}/expenses/parse-receipt`, receiptData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return { data: res.data };
};