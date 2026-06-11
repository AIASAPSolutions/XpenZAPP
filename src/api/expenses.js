import { request } from './client';

export const getExpenses = () => {
  return request('get', '/expenses');
};

export const addExpense = (expenseData) => {
  return request('post', '/expenses', expenseData);
};

export const getExpenseById = (id) => {
  return request('get', `/expenses/${id}`);
};

export const updateExpense = (id, expenseData) => {
  return request('put', `/expenses/${id}`, expenseData);
};

export const deleteExpense = (id) => {
  return request('delete', `/expenses/${id}`);
};

export const parseReceipt = (receiptBase64) => {
  return request('post', '/expenses/parse-receipt', { receipt: receiptBase64 });
};
