import { useExpenseStore } from '../store/expenseStore';

export const useExpenses = () => {
  const store = useExpenseStore();
  
  return {
    expenses: store.expenses,
    projects: store.projects,
    loading: store.loading,
    error: store.error,
    filters: store.filters,
    fetchExpenses: store.fetchExpenses,
    addExpense: store.addExpense,
    updateExpense: store.updateExpense,
    deleteExpense: store.deleteExpense,
    fetchProjects: store.fetchProjects,
    createProject: store.createProject,
    parseReceiptImage: store.parseReceiptImage,
    setFilters: store.setFilters,
    resetFilters: store.resetFilters,
    getFilteredExpenses: store.getFilteredExpenses,
    offlineQueue: store.offlineQueue,
    syncOfflineQueue: store.syncOfflineQueue,
  };
};
export default useExpenses;
