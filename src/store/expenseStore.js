import { create } from 'zustand';
import * as expensesApi from '../api/expenses';
import * as projectsApi from '../api/projects';
import { useBudgetStore } from './budgetStore';

const initialFilters = {
  searchQuery: '',
  dateRange: 'This Month',
  customStartDate: null,
  customEndDate: null,
  categories: [],
  amountRange: [0, 50000],
  project: '',
  sortBy: 'Newest',
};

const resolveProjectId = (get, expenseData = {}) => {
  if (expenseData.project) return expenseData.project;
  const { projects, activeProjectId } = get();
  if (activeProjectId) return activeProjectId;
  if (projects.length) return projects[0].id;
  return null;
};

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  projects: [],
  activeProjectId: null,
  loading: false,
  error: null,
  offlineQueue: [],
  filters: { ...initialFilters },

  syncOfflineQueue: async () => {
    const queue = [...get().offlineQueue];
    if (!queue.length) return { synced: 0 };

    const remaining = [];
    let synced = 0;

    for (const op of queue) {
      try {
        const projectId = op.projectId || resolveProjectId(get, op.payload);
        if (!projectId) {
          remaining.push(op);
          continue;
        }
        if (op.type === 'add') {
          await expensesApi.addExpense(projectId, op.payload);
        } else if (op.type === 'update') {
          await expensesApi.updateExpense(projectId, op.id, op.payload);
        } else if (op.type === 'delete') {
          await expensesApi.deleteExpense(projectId, op.id);
        }
        synced += 1;
      } catch {
        remaining.push(op);
      }
    }

    set({ offlineQueue: remaining });
    if (synced > 0) {
      await get().fetchExpenses();
    }
    return { synced, pending: remaining.length };
  },

  fetchExpenses: async () => {
    set({ loading: true, error: null });
    try {
      await get().syncOfflineQueue();

      let projects = get().projects;
      if (!projects.length) {
        const projRes = await projectsApi.getProjects();
        projects = projRes.data;
        set({
          projects,
          activeProjectId: get().activeProjectId || projects[0]?.id || null,
        });
      }

      if (!projects.length) {
        set({ expenses: [], loading: false });
        return;
      }

      const allExpenses = [];
      for (const project of projects) {
        const response = await expensesApi.getExpenses(project.id);
        const tagged = (response.data || []).map((e) => ({
          ...e,
          project: e.project || project.id,
        }));
        allExpenses.push(...tagged);
      }

      set({ expenses: allExpenses, loading: false });
    } catch (err) {
      set({ error: 'Failed to stream expenses.', loading: false });
    }
  },

  addExpense: async (expenseData) => {
    const projectId = resolveProjectId(get, expenseData);
    if (!projectId) {
      return { success: false, error: 'Create a project before logging expenses.' };
    }

    const tempId = `exp-temp-${Date.now()}`;
    const newExpense = {
      id: tempId,
      ...expenseData,
      project: projectId,
      date: expenseData.date instanceof Date ? expenseData.date.toISOString() : (expenseData.date || new Date().toISOString()),
    };

    const originalExpenses = [...get().expenses];
    set({ expenses: [newExpense, ...originalExpenses] });

    try {
      const response = await expensesApi.addExpense(projectId, expenseData);
      set({
        expenses: get().expenses.map((e) => (e.id === tempId ? { ...response.data, project: projectId } : e)),
      });
      get().fetchProjects();
      const category = response.data.category;
      const categoryTotal = get().expenses
        .filter((e) => e.category === category)
        .reduce((sum, e) => sum + e.amount, 0);
      const priorTotal = categoryTotal - response.data.amount;
      useBudgetStore.getState().checkBudgetThresholds(category, response.data.amount, priorTotal);
      return { success: true, expense: response.data };
    } catch (err) {
      set({ expenses: originalExpenses });
      set({
        offlineQueue: [
          ...get().offlineQueue,
          { type: 'add', payload: expenseData, projectId, tempId, createdAt: new Date().toISOString() },
        ],
      });
      return {
        success: false,
        error: 'Failed to create expense. Queued for offline sync.',
        queued: true,
      };
    }
  },

  updateExpense: async (id, expenseData) => {
    const existing = get().expenses.find((e) => e.id === id);
    const projectId = resolveProjectId(get, { ...expenseData, project: existing?.project });
    if (!projectId) {
      return { success: false, error: 'Project not found for this expense.' };
    }

    const originalExpenses = [...get().expenses];
    const updatedLocal = {
      ...existing,
      ...expenseData,
      project: projectId,
      date: expenseData.date instanceof Date ? expenseData.date.toISOString() : (expenseData.date || new Date().toISOString()),
    };

    set({
      expenses: get().expenses.map((e) => (e.id === id ? updatedLocal : e)),
    });

    try {
      const response = await expensesApi.updateExpense(projectId, id, expenseData);
      set({
        expenses: get().expenses.map((e) => (e.id === id ? { ...response.data, project: projectId } : e)),
      });
      get().fetchProjects();
      return { success: true, expense: response.data };
    } catch (err) {
      set({ expenses: originalExpenses });
      return { success: false, error: 'Failed to edit expense.' };
    }
  },

  deleteExpense: async (id) => {
    const existing = get().expenses.find((e) => e.id === id);
    const projectId = existing?.project || resolveProjectId(get);
    if (!projectId) {
      return { success: false, error: 'Project not found for this expense.' };
    }

    const originalExpenses = [...get().expenses];
    set({
      expenses: get().expenses.filter((e) => e.id !== id),
    });

    try {
      await expensesApi.deleteExpense(projectId, id);
      get().fetchProjects();
      return { success: true };
    } catch (err) {
      set({ expenses: originalExpenses });
      return { success: false, error: 'Failed to delete expense.' };
    }
  },

  fetchProjects: async () => {
    try {
      const response = await projectsApi.getProjects();
      set({
        projects: response.data,
        activeProjectId: get().activeProjectId || response.data[0]?.id || null,
      });
    } catch (err) {
      console.warn('Failed to load projects', err);
    }
  },

  createProject: async (projectName, projectBudget = 0) => {
    try {
      const response = await projectsApi.createProject({
        name: projectName,
        budget: projectBudget,
        description: '',
      });
      set({
        projects: [...get().projects, response.data],
        activeProjectId: get().activeProjectId || response.data.id,
      });
      return { success: true, project: response.data };
    } catch (err) {
      return { success: false, error: 'Failed to create project' };
    }
  },

  parseReceiptImage: async (imageUriOrBase64) => {
    const projectId = resolveProjectId(get);
    if (!projectId) {
      return { success: false, error: 'Create a project before scanning receipts.' };
    }

    set({ loading: true });
    try {
      const { prepareReceiptForUpload } = await import('../utils/imageHelpers');
      const receipt =
        imageUriOrBase64?.startsWith?.('/') || imageUriOrBase64?.startsWith?.('file:')
          ? await prepareReceiptForUpload(imageUriOrBase64)
          : imageUriOrBase64;
      const response = await expensesApi.parseReceipt(projectId, receipt);
      set({ loading: false });
      return { success: true, parsedData: response.data };
    } catch (err) {
      set({ loading: false });
      return {
        success: false,
        error: err.response?.data?.message || err.message || 'AI Receipt scanner failed to parse receipt.',
      };
    }
  },

  setActiveProjectId: (projectId) => set({ activeProjectId: projectId }),

  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
  },

  resetFilters: () => {
    set({ filters: { ...initialFilters } });
  },

  getFilteredExpenses: () => {
    const { expenses, filters } = get();
    let result = [...expenses];

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.vendor.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q))
      );
    }

    const now = new Date();
    result = result.filter((e) => {
      const eDate = new Date(e.date);
      if (filters.dateRange === 'All' || !filters.dateRange) {
        return true;
      }
      if (filters.dateRange === 'This Week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return eDate >= startOfWeek;
      }
      if (filters.dateRange === 'This Month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return eDate >= startOfMonth;
      }
      if (filters.dateRange === 'Custom' && filters.customStartDate && filters.customEndDate) {
        return eDate >= new Date(filters.customStartDate) && eDate <= new Date(filters.customEndDate);
      }
      return true;
    });

    if (filters.categories.length > 0) {
      result = result.filter((e) => filters.categories.includes(e.category));
    }

    result = result.filter(
      (e) => e.amount >= filters.amountRange[0] && e.amount <= filters.amountRange[1]
    );

    if (filters.project) {
      result = result.filter((e) => e.project === filters.project);
    }

    result.sort((a, b) => {
      if (filters.sortBy === 'Newest') return new Date(b.date) - new Date(a.date);
      if (filters.sortBy === 'Oldest') return new Date(a.date) - new Date(b.date);
      if (filters.sortBy === 'Highest') return b.amount - a.amount;
      if (filters.sortBy === 'Lowest') return a.amount - b.amount;
      return 0;
    });

    return result;
  },
}));
