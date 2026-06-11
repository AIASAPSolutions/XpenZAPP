import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../constants/config';

// ----------------------------------------------------
// 1. IN-MEMORY OFFLINE MOCK DATABASE
// ----------------------------------------------------
let mockDb = {
  user: {
    fullName: "Rahul Sharma",
    email: "rahul@asap.org",
    accountType: "organization",
    organizationName: "AI ASAP Solutions",
    role: "Director",
    avatar: "",
    memberSince: "May 2025",
    totalExpensesLogged: 28,
    totalAmountTracked: 148200
  },
  expenses: [
    { id: 'exp-1', amount: 500, vendor: 'Swiggy', category: 'food', date: new Date().toISOString(), project: 'proj-1', paymentMethod: 'UPI', notes: 'Dinner with client technical lead', isAiParsed: true },
    { id: 'exp-2', amount: 1200, vendor: 'Ola Cabs', category: 'transport', date: new Date(Date.now() - 86400000).toISOString(), project: 'proj-1', paymentMethod: 'UPI', notes: 'Travel to airport for Bangalore meet', isAiParsed: true },
    { id: 'exp-3', amount: 15000, vendor: 'Amazon India', category: 'shopping', date: new Date(Date.now() - 2 * 86400000).toISOString(), project: 'proj-2', paymentMethod: 'Card', notes: 'Office stationary and keyboard replacements', isAiParsed: false },
    { id: 'exp-4', amount: 45000, vendor: 'AWS Hosting', category: 'utilities', date: new Date(Date.now() - 5 * 86400000).toISOString(), project: 'proj-2', paymentMethod: 'Card', notes: 'Monthly server hosting and database costs', isAiParsed: false },
    { id: 'exp-5', amount: 2500, vendor: 'PVR Cinemas', category: 'entertainment', date: new Date(Date.now() - 8 * 86400000).toISOString(), project: '', paymentMethod: 'Cash', notes: 'Team movie night outing', isAiParsed: false },
    { id: 'exp-6', amount: 800, vendor: 'Apollo Pharmacy', category: 'healthcare', date: new Date(Date.now() - 10 * 86400000).toISOString(), project: '', paymentMethod: 'Cash', notes: 'First-aid box restocking supplies', isAiParsed: true },
    { id: 'exp-7', amount: 65000, vendor: 'MakeMyTrip', category: 'travel', date: new Date(Date.now() - 15 * 86400000).toISOString(), project: 'proj-1', paymentMethod: 'Net Banking', notes: 'Flight bookings for tech conference', isAiParsed: false },
    { id: 'exp-8', amount: 18000, vendor: 'WeWork India', category: 'office', date: new Date(Date.now() - 20 * 86400000).toISOString(), project: 'proj-2', paymentMethod: 'Net Banking', notes: 'Hot desk space booking fee', isAiParsed: false }
  ],
  budgets: [
    { id: 'bud-1', name: 'Food & Dinings', category: 'food', amount: 12000, period: 'Monthly', alertThreshold: 80 },
    { id: 'bud-2', name: 'Travel & Transport', category: 'transport', amount: 15000, period: 'Monthly', alertThreshold: 75 },
    { id: 'bud-3', name: 'Office Utilities', category: 'utilities', amount: 50000, period: 'Monthly', alertThreshold: 90 },
    { id: 'bud-4', name: 'Shopping & Equipment', category: 'shopping', amount: 20000, period: 'Monthly', alertThreshold: 80 }
  ],
  projects: [
    { id: 'proj-1', name: 'Client Pitch Alpha', color: '#6366f1', expenseCount: 3, totalSpent: 66700, budget: 100000 },
    { id: 'proj-2', name: 'App Relaunch 2026', color: '#10b981', expenseCount: 3, totalSpent: 81000, budget: 150000 }
  ],
  chat: [
    { id: 'msg-1', sender: 'ai', text: 'Namaste Rahul! 👋 I am XpenZ AI, your smart business spending sidekick. You can type something like "Log ₹650 swiggy meal" or scan any receipt image below to instantly log an expense!', timestamp: new Date(Date.now() - 3600000).toISOString() }
  ]
};

// ----------------------------------------------------
// 2. AXIOS INSTANCE CREATION
// ----------------------------------------------------
const apiClient = axios.create({
  baseURL: CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request Interceptor: Inject JWT token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('user_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Failed to retrieve auth token from SecureStore", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto-refresh tokens on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        if (refreshToken) {
          const res = await axios.post(`${CONFIG.BASE_URL}/auth/refresh`, { refreshToken });
          if (res.data?.token) {
            await SecureStore.setItemAsync('user_token', res.data.token);
            originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed. Directing to logout state.", refreshError);
        // Force clean stores & logout trigger could be bound here
      }
    }
    return Promise.reject(error);
  }
);

// ----------------------------------------------------
// 3. ROBUST SIMULATOR FALLBACK HANDLER
// ----------------------------------------------------
const simulateRequest = async (method, path, data = null) => {
  console.log(`[XpenZ Mock API] ${method.toUpperCase()} ${path}`, data);
  // Introduce smooth 400ms loading delays to match real API responses
  await new Promise(resolve => setTimeout(resolve, 400));

  // --- Auth Endpoints ---
  if (path.startsWith('/auth/login')) {
    if (data.email === 'error@xpenz.com') {
      throw { response: { status: 400, data: { message: 'Invalid credentials. Please use standard account info.' } } };
    }
    const token = 'mock-jwt-token-string';
    const refresh = 'mock-refresh-token-string';
    await SecureStore.setItemAsync('user_token', token);
    await SecureStore.setItemAsync('refresh_token', refresh);
    return { data: { success: true, token, refreshToken: refresh, user: mockDb.user } };
  }
  
  if (path.startsWith('/auth/signup')) {
    mockDb.user = {
      fullName: data.fullName,
      email: data.email,
      accountType: data.accountType,
      organizationName: data.organizationName || '',
      role: data.role || 'Member',
      avatar: '',
      memberSince: 'May 2026',
      totalExpensesLogged: 0,
      totalAmountTracked: 0
    };
    const token = 'mock-jwt-token-string';
    const refresh = 'mock-refresh-token-string';
    await SecureStore.setItemAsync('user_token', token);
    await SecureStore.setItemAsync('refresh_token', refresh);
    return { data: { success: true, token, refreshToken: refresh, user: mockDb.user } };
  }

  if (path.startsWith('/auth/logout')) {
    await SecureStore.deleteItemAsync('user_token');
    await SecureStore.deleteItemAsync('refresh_token');
    return { data: { success: true } };
  }

  if (path.startsWith('/auth/forgot-password')) {
    return { data: { success: true, message: 'Reset link dispatched' } };
  }

  // --- Profile Endpoints ---
  if (path === '/profile') {
    if (method === 'get') {
      return { data: mockDb.user };
    } else if (method === 'put') {
      mockDb.user = { ...mockDb.user, ...data };
      return { data: mockDb.user };
    }
  }
  if (path === '/profile/change-password') {
    return { data: { success: true, message: 'Password updated successfully' } };
  }

  // --- Expenses Endpoints ---
  if (path.startsWith('/expenses')) {
    // GET /expenses/:id
    const idMatch = path.match(/^\/expenses\/([a-zA-Z0-9-]+)$/);
    if (idMatch && method === 'get') {
      const exp = mockDb.expenses.find(e => e.id === idMatch[1]);
      if (exp) return { data: exp };
      throw { response: { status: 404, data: { message: 'Expense not found' } } };
    }
    // PUT /expenses/:id
    if (idMatch && method === 'put') {
      const idx = mockDb.expenses.findIndex(e => e.id === idMatch[1]);
      if (idx !== -1) {
        mockDb.expenses[idx] = { ...mockDb.expenses[idx], ...data };
        return { data: mockDb.expenses[idx] };
      }
      throw { response: { status: 404, data: { message: 'Expense not found' } } };
    }
    // DELETE /expenses/:id
    if (idMatch && method === 'delete') {
      const idx = mockDb.expenses.findIndex(e => e.id === idMatch[1]);
      if (idx !== -1) {
        const deleted = mockDb.expenses.splice(idx, 1);
        return { data: deleted[0] };
      }
      throw { response: { status: 404, data: { message: 'Expense not found' } } };
    }
    // POST /expenses/parse-receipt
    if (path.includes('/parse-receipt')) {
      return {
        data: {
          success: true,
          amount: 850,
          vendor: 'Starbucks Coffee',
          category: 'food',
          date: new Date().toISOString(),
          paymentMethod: 'Card',
          notes: 'AI Parsed receipt - Starbucks Cappuccino and Muffin'
        }
      };
    }
    // GET /expenses
    if (method === 'get') {
      return { data: mockDb.expenses };
    }
    // POST /expenses
    if (method === 'post') {
      const newExp = { id: `exp-${Date.now()}`, ...data, date: data.date || new Date().toISOString() };
      mockDb.expenses.unshift(newExp);
      return { data: newExp };
    }
  }

  // --- Budgets Endpoints ---
  if (path.startsWith('/budgets')) {
    const idMatch = path.match(/^\/budgets\/([a-zA-Z0-9-]+)$/);
    if (idMatch && method === 'put') {
      const idx = mockDb.budgets.findIndex(b => b.id === idMatch[1]);
      if (idx !== -1) {
        mockDb.budgets[idx] = { ...mockDb.budgets[idx], ...data };
        return { data: mockDb.budgets[idx] };
      }
    }
    if (idMatch && method === 'delete') {
      const idx = mockDb.budgets.findIndex(b => b.id === idMatch[1]);
      if (idx !== -1) {
        const deleted = mockDb.budgets.splice(idx, 1);
        return { data: deleted[0] };
      }
    }
    if (method === 'get') {
      return { data: mockDb.budgets };
    }
    if (method === 'post') {
      const newBud = { id: `bud-${Date.now()}`, ...data };
      mockDb.budgets.push(newBud);
      return { data: newBud };
    }
  }

  // --- Projects Endpoints ---
  if (path.startsWith('/projects')) {
    const idMatch = path.match(/^\/projects\/([a-zA-Z0-9-]+)$/);
    if (idMatch && method === 'delete') {
      const idx = mockDb.projects.findIndex(p => p.id === idMatch[1]);
      if (idx !== -1) {
        return { data: mockDb.projects.splice(idx, 1)[0] };
      }
    }
    if (method === 'get') {
      return { data: mockDb.projects };
    }
    if (method === 'post') {
      const newProj = { id: `proj-${Date.now()}`, expenseCount: 0, totalSpent: 0, color: '#f59e0b', ...data };
      mockDb.projects.push(newProj);
      return { data: newProj };
    }
  }

  // --- Reports Endpoints ---
  if (path.startsWith('/reports/summary')) {
    const total = mockDb.expenses.reduce((sum, e) => sum + e.amount, 0);
    const count = mockDb.expenses.length;
    return {
      data: {
        totalSpent: total,
        remainingBudget: 97000 - total,
        totalExpensesCount: count,
        savingsChangePercent: 12.4, // Positive means spent less than last month
      }
    };
  }

  if (path.startsWith('/reports/by-category')) {
    const breakdown = {};
    mockDb.expenses.forEach(e => {
      breakdown[e.category] = (breakdown[e.category] || 0) + e.amount;
    });
    return { data: breakdown };
  }

  if (path.startsWith('/reports/trends')) {
    // Generate daily trends mockup
    return {
      data: {
        labels: ['W1', 'W2', 'W3', 'W4'],
        data: [15000, 32000, 48000, 24000]
      }
    };
  }

  // --- AI Chat Endpoints ---
  if (path.startsWith('/ai/chat')) {
    const userText = data.message || '';
    let responseText = "Hmm, I am not sure about that action. Can you try again?";
    let expenseConfirmation = null;

    if (userText.toLowerCase().includes('swiggy') || userText.toLowerCase().includes('dinner') || userText.toLowerCase().includes('log ₹500')) {
      responseText = "Sure, Rahul! I found a Swiggy food expense in your request. Please review the details below and tap Confirm to save it.";
      expenseConfirmation = {
        amount: 500,
        vendor: 'Swiggy',
        category: 'food',
        date: new Date().toISOString(),
        paymentMethod: 'UPI'
      };
    } else if (userText.toLowerCase().includes('ola') || userText.toLowerCase().includes('cab') || userText.toLowerCase().includes('1200')) {
      responseText = "Perfect! I detected an Ola cab booking expense. Confirm below to register it instantly.";
      expenseConfirmation = {
        amount: 1200,
        vendor: 'Ola Cabs',
        category: 'transport',
        date: new Date().toISOString(),
        paymentMethod: 'UPI'
      };
    } else if (userText.toLowerCase().includes('spending') || userText.toLowerCase().includes('this week') || userText.toLowerCase().includes('show')) {
      responseText = "Here is your spending analysis! You have logged a total of ₹1.48L this month, which is looking healthy and trending 12% lower than last month. Outstanding job staying within constraints!";
    } else if (userText.toLowerCase().includes('budget') || userText.toLowerCase().includes('over')) {
      responseText = "You have 4 active monthly budgets set up. Your Food and Transport limits are in the safe green zone (<60% used), but your Shopping budget is approaching the yellow zone at 75%. Keep an eye on it!";
    }

    const aiMsg = { id: `msg-${Date.now()}`, sender: 'ai', text: responseText, expenseConfirmation, timestamp: new Date().toISOString() };
    mockDb.chat.push(aiMsg);
    return { data: aiMsg };
  }

  throw { response: { status: 404, data: { message: 'Route not found' } } };
};

// Wraps an API request. If MOCK_MODE is enabled or the server throws any network error,
// it instantly routes to our offline local-engine database simulation!
export const request = async (method, path, data = null) => {
  if (CONFIG.MOCK_MODE) {
    return simulateRequest(method, path, data);
  }

  try {
    const res = await apiClient({ method, url: path, data });
    return res;
  } catch (err) {
    console.warn(`[XpenZ API Error] Server request failed: ${method.toUpperCase()} ${path}. Routing fallback to Mock DB!`, err.message);
    return simulateRequest(method, path, data);
  }
};
