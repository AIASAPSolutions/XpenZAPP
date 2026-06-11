export const categories = [
  { id: 'food', name: 'Food & Dining', icon: 'food-fork-drink', emoji: '🍽', color: '#f59e0b' },
  { id: 'transport', name: 'Transport', icon: 'car', emoji: '🚗', color: '#3b82f6' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping', emoji: '🛍', color: '#ec4899' },
  { id: 'entertainment', name: 'Entertainment', icon: 'popcorn', emoji: '🎬', color: '#8b5cf6' },
  { id: 'healthcare', name: 'Healthcare', icon: 'heart-pulse', emoji: '🏥', color: '#10b981' },
  { id: 'utilities', name: 'Utilities', icon: 'lightning-bolt', emoji: '💡', color: '#eab308' },
  { id: 'travel', name: 'Travel', icon: 'airplane', emoji: '✈', color: '#06b6d4' },
  { id: 'office', name: 'Office', icon: 'briefcase', emoji: '🏢', color: '#6366f1' },
  { id: 'other', name: 'Other', icon: 'package-variant', emoji: '📦', color: '#64748b' }
];

export const getCategoryById = (id) => {
  return categories.find(c => c.id === id) || { id: 'other', name: 'Other', icon: 'package-variant', emoji: '📦', color: '#64748b' };
};
