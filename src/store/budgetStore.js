import { create } from 'zustand';
import * as budgetsApi from '../api/budgets';

export const useBudgetStore = create((set, get) => ({
  budgets: [],
  loading: false,
  error: null,

  fetchBudgets: async () => {
    set({ loading: true, error: null });
    try {
      const response = await budgetsApi.getBudgets();
      set({ budgets: response.data, loading: false });
    } catch (err) {
      set({ error: 'Failed to retrieve budgets.', loading: false });
    }
  },

  createBudget: async (budgetData) => {
    set({ loading: true });
    try {
      const response = await budgetsApi.createBudget(budgetData);
      set({ budgets: [...get().budgets, response.data], loading: false });
      return { success: true, budget: response.data };
    } catch (err) {
      set({ loading: false });
      return { success: false, error: 'Failed to create budget limit.' };
    }
  },

  updateBudget: async (id, budgetData) => {
    set({ loading: true });
    try {
      const response = await budgetsApi.updateBudget(id, budgetData);
      set({
        budgets: get().budgets.map(b => b.id === id ? response.data : b),
        loading: false
      });
      return { success: true, budget: response.data };
    } catch (err) {
      set({ loading: false });
      return { success: false, error: 'Failed to modify budget ceiling.' };
    }
  },

  deleteBudget: async (id) => {
    const originalBudgets = [...get().budgets];
    set({
      budgets: get().budgets.filter(b => b.id !== id)
    });
    try {
      await budgetsApi.deleteBudget(id);
      return { success: true };
    } catch (err) {
      set({ budgets: originalBudgets });
      return { success: false, error: 'Failed to delete budget limit.' };
    }
  },

  // Dynamic monitor that matches a category expense, checks if it crosses any thresholds,
  // and raises native OS alerts if needed
  checkBudgetThresholds: async (category, newExpenseAmount, currentCategoryTotal) => {
    const budgets = get().budgets;
    const categoryBudget = budgets.find(b => b.category === category);
    
    if (!categoryBudget) return;

    const totalSpent = currentCategoryTotal + newExpenseAmount;
    const limit = categoryBudget.amount;
    const usagePercent = (totalSpent / limit) * 100;
    const alertTrigger = categoryBudget.alertThreshold || 80;

    if (usagePercent >= 100) {
      // Direct push alert
      const title = `🚫 Budget Exceeded: ${categoryBudget.name}`;
      const body = `You spent ₹${totalSpent.toLocaleString()} of your ₹${limit.toLocaleString()} budget!`;
      console.log('[Budget Alert]', title, body);
    } else if (usagePercent >= alertTrigger) {
      const title = `⚠ Nearing Budget Limit: ${categoryBudget.name}`;
      const body = `You have consumed ${Math.round(usagePercent)}% of your ₹${limit.toLocaleString()} category limit.`;
      console.log('[Budget Alert]', title, body);
    }
  }
}));
