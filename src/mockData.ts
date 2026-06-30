import { Card, Transaction } from './types';

export const INITIAL_USER = {
  id: 'usr_1',
  email: 'abiolahafeez@gmail.com',
  name: 'Abiola Hafeez',
};

export const MOCK_MERCHANTS = {
  shopping: ['Jumia Nigeria', 'Konga Mall', 'Spar Nigeria', 'Slot Systems', 'Payporte NG'],
  dining: ['Chicken Republic', 'The Place Restaurant', 'Kilimanjaro', 'Cold Stone NG', 'Debonairs Pizza'],
  entertainment: ['Netflix Nigeria', 'Apple Music NG', 'Spotify Premium NG', 'Showmax Nigeria', 'DSTV Subscription'],
  utilities: ['IKEDC Prepaid', 'EKEDC Power', 'MTN Airtime NG', 'Airtel NG Bundle', 'Lagos Water Co.'],
  transfer: ['Flutterwave Transfer', 'Paystack Send', 'Moniepoint Payout', 'Opay Transfer', 'PiggyVest Lock'],
  funding: ['GTBank Deposit', 'Zenith Direct Pay', 'Interswitch Fund', 'Access Bank Cash', 'Naira Refunding'],
};

// Generates a random card number (PAN), CVV, and Expiration Date
export function generateCardDetails(name: string, design: 'silver' | 'gold' | 'black' | 'green'): Omit<Card, 'id' | 'createdAt' | 'balance' | 'label' | 'pin' | 'status'> {
  // Let's make sure it's realistic
  const bin = '411122'; // Visa standard BIN
  const remainingDigits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
  const pan = bin + remainingDigits;
  
  const cvv = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join('');
  
  // Expiry date is 5 years in future
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String((now.getFullYear() + 5) % 100).padStart(2, '0');
  const expiryDate = `${month}/${year}`;

  return {
    type: 'debit',
    design,
    holderName: name,
    pan,
    cvv,
    expiryDate,
  };
}

export const INITIAL_CARDS: Card[] = [
  {
    id: 'card_1',
    type: 'debit',
    design: 'black',
    label: 'Primary Spending',
    holderName: 'Abiola Hafeez',
    pan: '4111228833445566',
    cvv: '581',
    expiryDate: '11/30',
    balance: 345500.00,
    pin: '1234', // Already active
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'card_2',
    type: 'debit',
    design: 'gold',
    label: 'Online Shopping Card',
    holderName: 'Abiola Hafeez',
    pan: '4111225500112233',
    cvv: '824',
    expiryDate: '05/31',
    balance: 45000.00,
    pin: null, // Inactive, awaiting PIN activation
    status: 'inactive',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    cardId: 'card_1',
    merchant: 'Apple Music NG',
    category: 'entertainment',
    amount: -1200.00,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
  },
  {
    id: 'tx_2',
    cardId: 'card_1',
    merchant: 'Chicken Republic',
    category: 'dining',
    amount: -4500.00,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
  },
  {
    id: 'tx_3',
    cardId: 'card_1',
    merchant: 'Netflix Nigeria',
    category: 'entertainment',
    amount: -4400.00,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
  },
  {
    id: 'tx_4',
    cardId: 'card_1',
    merchant: 'Interswitch Payout',
    category: 'funding',
    amount: 450000.00,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
  },
  {
    id: 'tx_5',
    cardId: 'card_1',
    merchant: 'MTN Airtime NG',
    category: 'utilities',
    amount: -10000.00,
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
  },
  {
    id: 'tx_6',
    cardId: 'card_1',
    merchant: 'Jumia Nigeria',
    category: 'shopping',
    amount: -32500.00,
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
  },
  {
    id: 'tx_7',
    cardId: 'card_1',
    merchant: 'The Place Restaurant',
    category: 'dining',
    amount: -5500.00,
    date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
  },
];
