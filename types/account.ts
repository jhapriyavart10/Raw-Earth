// /types/account.ts
export type AccountSection = 'orders' | 'details' | 'addresses' | 'payments' | 'subscriptions';

export const SECTIONS = [
  { id: 'orders', label: 'Orders' },
  { id: 'details', label: 'Account Details' },
  { id: 'addresses', label: 'Addresses' },
  { id: 'payments', label: 'Payment Methods' },
  { id: 'subscriptions', label: 'Subscriptions' },
] as const;