import { request } from './client';

export const getReportsSummary = () => {
  return request('get', '/reports/summary');
};

export const getReportsByCategory = () => {
  return request('get', '/reports/by-category');
};

export const getReportsTrends = () => {
  return request('get', '/reports/trends');
};

export const exportReports = (format) => {
  // Simulate dispatching a document url download link
  return request('get', '/reports/export', { format });
};
