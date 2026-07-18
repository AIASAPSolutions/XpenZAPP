import { request } from './client';

export const exportCsv = () => request('get', '/export/csv');

export const exportPdf = () => request('get', '/export/pdf');

export const exportJson = () => request('get', '/export/json');

export const exportData = (format) => {
  if (format === 'csv') return exportCsv();
  if (format === 'pdf') return exportPdf();
  if (format === 'json') return exportJson();
  return Promise.reject(new Error(`Unsupported export format: ${format}`));
};

// Preferred names hitting the /export endpoints
export const getCSV = exportCsv;
export const getPDF = exportPdf;
export const getJSON = exportJson;
