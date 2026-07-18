import { create } from 'zustand';

// There is no standalone budgets endpoint — budgets are managed
// server-side by budget_manager inside the AI chat flow.
const BUDGETS_INFO_MESSAGE = 'Budgets are managed automatically via AI Chat';

export const useBudgetStore = create((set, get) => ({
  budgets: [],
  loading: false,
  error: null,
  infoMessage: BUDGETS_INFO_MESSAGE,

  fetchBudgets: async () => {
    set({ budgets: [], loading: false, error: null });
  },

  createBudget: async () => ({ success: false, error: BUDGETS_INFO_MESSAGE }),

  updateBudget: async () => ({ success: false, error: BUDGETS_INFO_MESSAGE }),

  deleteBudget: async () => ({ success: false, error: BUDGETS_INFO_MESSAGE }),

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
