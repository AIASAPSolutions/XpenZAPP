import { useBudgetStore } from '../store/budgetStore';

export const useBudgets = () => {
  const store = useBudgetStore();
  
  return {
    budgets: store.budgets,
    loading: store.loading,
    error: store.error,
    fetchBudgets: store.fetchBudgets,
    createBudget: store.createBudget,
    updateBudget: store.updateBudget,
    deleteBudget: store.deleteBudget,
    checkBudgetThresholds: store.checkBudgetThresholds,
  };
};
export default useBudgets;
