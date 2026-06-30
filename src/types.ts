export interface User {
  id: string;
  email: string;
  name: string;
  isLoggedIn: boolean;
}

export type CardStatus = 'inactive' | 'active' | 'blocked';
export type CardDesign = 'silver' | 'gold' | 'black' | 'green';

export interface Card {
  id: string;
  type: 'debit';
  design: CardDesign;
  label: string;
  holderName: string;
  pan: string; // e.g. "4111222233334444"
  cvv: string; // e.g. "123"
  expiryDate: string; // e.g. "08/31"
  balance: number;
  pin: string | null; // Null means brand-new and unactivated
  status: CardStatus;
  createdAt: string;
}

export type TransactionCategory = 'shopping' | 'dining' | 'entertainment' | 'utilities' | 'transfer' | 'funding';
export type TransactionStatus = 'approved' | 'pending' | 'declined';

export interface Transaction {
  id: string;
  cardId: string;
  merchant: string;
  category: TransactionCategory;
  amount: number; // Negative for expense, positive for income/funding
  date: string; // ISO string or simple date "YYYY-MM-DD"
  status: TransactionStatus;
}
