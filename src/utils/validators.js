import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export const signupSchema = z.object({
  accountType: z.enum(['individual', 'organization']),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().optional(),
  subscriptionCode: z.string().optional(),
  mobileNumber: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  organizationName: z.string().optional(),
  role: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.accountType === 'organization' && !data.organizationName) {
    return false;
  }
  return true;
}, {
  message: "Organization name is required for organization accounts",
  path: ["organizationName"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

export const expenseSchema = z.object({
  amount: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number({ required_error: 'Amount is required', invalid_type_error: 'Amount must be a number' }).positive('Amount must be positive')
  ),
  vendor: z.string().min(1, 'Vendor/Merchant is required'),
  category: z.string().min(1, 'Category is required'),
  date: z.date({ required_error: 'Date is required' }),
  project: z.string().optional(),
  paymentMethod: z.enum(['Cash', 'UPI', 'Card', 'Net Banking'], {
    required_error: 'Payment method is required'
  }),
  notes: z.string().optional(),
  receiptUri: z.string().optional(),
  isAiParsed: z.boolean().optional(),
});

export const budgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number({ required_error: 'Budget amount is required' }).positive('Amount must be positive')
  ),
  period: z.enum(['Monthly', 'Weekly', 'Custom']),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  alertThreshold: z.number().min(10).max(100),
});
