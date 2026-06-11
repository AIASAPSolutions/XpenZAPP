import { format, isToday as fdIsToday, isYesterday as fdIsYesterday, parseISO, differenceInDays } from 'date-fns';

/**
 * Safely parse any date input to a Date object
 */
export const safeParseDate = (dateInput) => {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;
  try {
    return parseISO(dateInput);
  } catch (e) {
    return new Date(dateInput);
  }
};

/**
 * Format date to standard readable strings
 */
export const formatDate = (date, formatString = 'dd MMM yyyy') => {
  const d = safeParseDate(date);
  return format(d, formatString);
};

export const formatTime = (date) => {
  const d = safeParseDate(date);
  return format(d, 'hh:mm a');
};

export const formatDateWithTime = (date) => {
  const d = safeParseDate(date);
  return format(d, 'dd MMM yyyy, hh:mm a');
};

/**
 * Return friendly relative header (Today, Yesterday, or exact Date)
 */
export const getRelativeDateLabel = (dateString) => {
  const d = safeParseDate(dateString);
  if (fdIsToday(d)) {
    return 'Today';
  }
  if (fdIsYesterday(d)) {
    return 'Yesterday';
  }
  
  const diff = differenceInDays(new Date(), d);
  if (diff < 7) {
    return format(d, 'EEEE'); // Day of the week (e.g. Wednesday)
  }
  
  return format(d, 'dd MMMM yyyy');
};

/**
 * Group list of objects by a date field
 */
export const groupExpensesByDate = (expenses) => {
  if (!expenses || expenses.length === 0) return [];
  
  const groups = {};
  
  expenses.forEach(expense => {
    const dateStr = formatDate(expense.date, 'yyyy-MM-dd');
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(expense);
  });
  
  // Sort date keys in descending order
  const sortedDates = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));
  
  return sortedDates.map(dateKey => ({
    title: getRelativeDateLabel(dateKey),
    dateStr: dateKey,
    data: groups[dateKey].sort((a, b) => new Date(b.date) - new Date(a.date))
  }));
};
