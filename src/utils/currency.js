const EXCHANGE_RATES = {
  INR: 1.0,
  USD: 0.012,  // 1 INR = 0.012 USD
  EUR: 0.011,  // 1 INR = 0.011 EUR
  GBP: 0.0094, // 1 INR = 0.0094 GBP
};

const SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

/**
 * Format numeric value to Indian currency format (e.g., 1,50,000.00)
 */
export const formatINR = (value) => {
  if (isNaN(value) || value === null) return '₹0.00';
  
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);
  } catch (e) {
    // Fallback manual formatter for Indian style commas if Intl fails
    const parts = Number(value).toFixed(2).split('.');
    let lastThree = parts[0].substring(parts[0].length - 3);
    const otherParts = parts[0].substring(0, parts[0].length - 3);
    if (otherParts !== '') {
      lastThree = ',' + lastThree;
    }
    const res = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + (parts[1] ? '.' + parts[1] : '');
    return `₹${res}`;
  }
};

/**
 * Format to any supported currency
 */
export const formatCurrency = (value, currencyCode = 'INR') => {
  const code = currencyCode.toUpperCase();
  const symbol = SYMBOLS[code] || '₹';
  
  if (code === 'INR') {
    return formatINR(value);
  }
  
  try {
    return new Intl.NumberFormat(code === 'USD' ? 'en-US' : code === 'EUR' ? 'de-DE' : 'en-GB', {
      style: 'currency',
      currency: code,
    }).format(value);
  } catch (e) {
    return `${symbol}${Number(value).toFixed(2)}`;
  }
};

/**
 * Convert value from INR to target currency
 */
export const convertFromINR = (valueInINR, targetCurrency = 'INR') => {
  const rate = EXCHANGE_RATES[targetCurrency.toUpperCase()] || 1.0;
  return valueInINR * rate;
};

/**
 * Convert target currency to INR
 */
export const convertToINR = (value, sourceCurrency = 'INR') => {
  const rate = EXCHANGE_RATES[sourceCurrency.toUpperCase()] || 1.0;
  return value / rate;
};

export const getCurrencySymbol = (currencyCode = 'INR') => {
  return SYMBOLS[currencyCode.toUpperCase()] || '₹';
};
