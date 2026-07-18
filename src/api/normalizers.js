export const normalizeUser = (data = {}) => {
  // API stores email as full_name when no name was given at signup
  const rawFullName = data.full_name || data.fullName || data.name || '';
  const isEmailAsName = rawFullName === data.email;

  let fullName = '';
  if (!isEmailAsName && rawFullName) {
    fullName = rawFullName;
  } else if (data.organization_name) {
    // Use org name as display name (e.g. "Mohan")
    fullName = data.organization_name.trim();
  } else if (data.email) {
    // Last resort: capitalize email prefix
    fullName = data.email.split('@')[0];
  }

  return {
    id: data.id,
    fullName,
    email: data.email || '',
    phone: data.phone_number || data.phone || '',
    accountType: data.user_type || data.account_type || data.accountType || 'individual',
    hasOrganization: data.has_organization ?? false,
    isVerified: data.is_verified ?? false,
    inviteCode: data.invite_code || '',
    organizationId: data.organization_id || null,
    organizationName: data.organization_name || '',
    organizationCode: data.organization_code || '',
    role: data.role || 'Member',
    avatar: data.avatar || data.avatar_url || '',
    memberSince: data.created_at || data.member_since || '',
    memberCount: data.member_count ?? 0,
    totalExpensesLogged: data.total_expenses ?? data.totalExpensesLogged ?? 0,
    totalAmountTracked: data.total_amount ?? data.totalAmountTracked ?? 0,
  };
};

export const extractAuthPayload = (data = {}) => {
  const token = data.access_token || data.token || data.accessToken;
  const refreshToken = data.refresh_token || data.refreshToken;
  const user = normalizeUser(data.user || data.data || data);
  return { token, refreshToken, user };
};

export const normalizeExpense = (data = {}) => ({
  id: String(data.id),
  amount: Number(data.amount ?? 0),
  vendor: data.vendor || data.merchant || data.description || '',
  category: data.category || 'other',
  date: data.date || data.expense_date || data.created_at || new Date().toISOString(),
  project: String(data.project_id || data.project || ''),
  paymentMethod: data.payment_method || data.paymentMethod || 'UPI',
  notes: data.notes || '',
  receiptUri: data.receipt_url || data.receiptUri || '',
  isAiParsed: Boolean(data.is_ai_parsed ?? data.isAiParsed),
});

export const normalizeExpenseList = (data) => {
  const list = Array.isArray(data) ? data : data?.expenses || data?.data || [];
  return list.map(normalizeExpense);
};

export const normalizeProject = (data = {}) => ({
  id: String(data.id),
  name: data.name || '',
  color: data.color || '#6366f1',
  expenseCount: data.expense_count ?? data.expenseCount ?? 0,
  totalSpent: data.total_spent ?? data.totalSpent ?? 0,
  budget: Number(data.budget ?? 0),
  description: data.description || '',
});

export const normalizeProjectList = (data) => {
  const list = Array.isArray(data) ? data : data?.projects || data?.data || [];
  return list.map(normalizeProject);
};

export const normalizeBudget = (data = {}) => ({
  id: String(data.id || data.category || `bud-${data.name}`),
  name: data.name || data.category_name || '',
  category: data.category || data.category_id || 'other',
  amount: Number(data.amount ?? data.limit ?? 0),
  period: data.period || 'Monthly',
  alertThreshold: data.alert_threshold ?? data.alertThreshold ?? 80,
});

export const normalizeBudgetList = (data) => {
  if (Array.isArray(data)) return data.map(normalizeBudget);
  const list = data?.budgets || data?.budget_limits || data?.category_budgets || [];
  return list.map(normalizeBudget);
};

export const normalizeChatMessage = (data = {}) => ({
  id: String(data.id || `msg-${Date.now()}`),
  sender: data.role === 'assistant' || data.sender === 'ai' ? 'ai' : 'user',
  text: data.content || data.message || data.text || '',
  expenseConfirmation: data.expense_confirmation || data.expenseConfirmation || data.parsed_expense || null,
  timestamp: data.created_at || data.timestamp || new Date().toISOString(),
});

export const normalizeChatHistory = (data) => {
  const list = Array.isArray(data) ? data : data?.messages || data?.history || data?.data || [];
  return list.map(normalizeChatMessage);
};

export const normalizeTrends = (data) => {
  if (data?.labels && data?.data) return data;
  if (Array.isArray(data?.trends)) {
    return {
      labels: data.trends.map((d, i) => d.label || d.date || `D${i + 1}`),
      data: data.trends.map((d) => Number(d.amount ?? d.total ?? 0)),
    };
  }
  if (Array.isArray(data)) {
    return {
      labels: data.map((d, i) => d.label || d.date || `D${i + 1}`),
      data: data.map((d) => Number(d.amount ?? d.total ?? 0)),
    };
  }
  return { labels: [], data: [] };
};

export const normalizeCategoryBreakdown = (data) => {
  if (!data) return {};
  if (data.by_category) return data.by_category;
  if (data.category_breakdown) return data.category_breakdown;
  if (data.categories) return data.categories;
  if (Array.isArray(data)) {
    return data.reduce((acc, item) => {
      const key = item.category || item.name;
      acc[key] = (acc[key] || 0) + Number(item.amount ?? item.total ?? 0);
      return acc;
    }, {});
  }
  return data;
};

export const normalizeOverview = (data = {}) => ({
  totalSpent: data.total_spent ?? data.totalSpent ?? 0,
  remainingBudget: data.remaining_budget ?? data.remainingBudget ?? 0,
  totalExpensesCount: data.total_expenses_count ?? data.totalExpensesCount ?? data.expense_count ?? 0,
  savingsChangePercent: data.savings_change_percent ?? data.savingsChangePercent ?? 0,
  categoryBreakdown: normalizeCategoryBreakdown(data.category_breakdown || data.by_category || data),
});

export const toExpensePayload = (expenseData) => ({
  amount: Number(expenseData.amount),
  vendor: expenseData.vendor,
  category: expenseData.category,
  date: expenseData.date instanceof Date ? expenseData.date.toISOString() : expenseData.date,
  payment_method: expenseData.paymentMethod || expenseData.payment_method,
  notes: expenseData.notes || '',
  receipt_url: expenseData.receiptUri || expenseData.receipt_url || undefined,
  is_ai_parsed: expenseData.isAiParsed ?? false,
});
