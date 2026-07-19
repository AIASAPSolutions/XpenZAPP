import { request } from './client';
import { normalizeOverview } from './normalizers';

export const getAnalyticsOverview = async () => {
  const res = await request('get', '/analytics/overview');
  return { data: normalizeOverview(res.data) };
};

export const getAnalyticsTrends = async (days = 30) => {
  const res = await request('get', '/analytics/trends', null, { params: { days } });
  // Raw payload — shape varies by deployment, normalized by the consuming chart component.
  return { data: res.data };
};

export const getOrgSummary = async () => {
  const res = await request('get', '/analytics/org/summary');
  return { data: res.data };
};

export const getMySummary = async () => {
  const res = await request('get', '/analytics/my/summary');
  return { data: res.data };
};

/** Backward-compatible aliases used by screens */
export const getReportsSummary = () => getAnalyticsOverview();

export const getReportsByCategory = async () => {
  const res = await getAnalyticsOverview();
  return { data: res.data.categoryBreakdown || {} };
};

export const getReportsTrends = (days = 30) => getAnalyticsTrends(days);
