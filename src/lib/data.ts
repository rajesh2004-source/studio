import type { User, Vendor, Category, Transaction } from './definitions';

// In a real app, this data would be in a database.
// For this demo, we'll store it in-memory.

let users: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@pettyflow.com', password: 'password123' },
];

let vendors: Vendor[] = [
  { id: 'v1', name: 'Office Supplies Co.', email: 'sales@officesupplies.com' },
  { id: 'v2', name: 'Quick Eats Cafe', email: 'contact@qec.com' },
  { id: 'v3', name: 'City Transport', phone: '555-0103' },
  { id: 'v4', name: 'Tech Solutions Ltd.', contactPerson: 'Jane Doe' },
  { id: 'v5', name: 'Client A', email: 'contact@clienta.com' },
];

let categories: Category[] = [
  { id: 'c1', name: 'Office Supplies' },
  { id: 'c2', name: 'Food & Beverage' },
  { id: 'c3', name: 'Travel' },
  { id: 'c4', name: 'Software' },
  { id: 'c5', name: 'Utilities' },
  { id: 'c6', name: 'Client Revenue' },
];

let transactions: Transaction[] = [
  { id: 't1', date: '2024-05-20', description: 'Printer paper and pens', vendorId: 'v1', categoryId: 'c1', amount: 55.0, type: 'expense', paymentMode: 'card' },
  { id: 't2', date: '2024-05-20', description: 'Team lunch', vendorId: 'v2', categoryId: 'c2', amount: 120.5, type: 'expense', paymentMode: 'cash' },
  { id: 't3', date: '2024-05-19', description: 'Taxi fare for client meeting', vendorId: 'v3', categoryId: 'c3', amount: 35.0, type: 'expense', paymentMode: 'cash' },
  { id: 't4', date: '2024-05-18', description: 'Monthly subscription for design tool', vendorId: 'v4', categoryId: 'c4', amount: 49.0, type: 'expense', paymentMode: 'card' },
  { id: 't5', date: '2024-05-15', description: 'Initial cash deposit', vendorId: 'v5', categoryId: 'c6', amount: 1000.0, type: 'income', paymentMode: 'cash' },
  { id: 't6', date: '2024-04-25', description: 'Payment for project phase 1', vendorId: 'v5', categoryId: 'c6', amount: 1500.0, type: 'income', paymentMode: 'online' },
  { id: 't7', date: '2024-04-10', description: 'Internet Bill', vendorId: 'v3', categoryId: 'c5', amount: 80.0, type: 'expense', paymentMode: 'online' },
];


export const getInitialBalance = () => 500.00;

// In a real app, these would be async and fetch from a database.
export const getUsers = () => users;
export const findUserByEmail = (email: string) => users.find(u => u.email === email);
export const addUser = (user: User) => {
  users.push(user);
}

export const getVendors = () => vendors;
export const getVendorById = (id: string) => vendors.find(v => v.id === id);

export const getCategories = () => categories;

export const getTransactions = () => transactions;
export const getTransactionById = (id: string) => transactions.find(t => t.id === id);
export const addTransaction = (transaction: Transaction) => {
    transactions.unshift(transaction);
}
export const updateTransaction = (id: string, updatedTransaction: Partial<Transaction>) => {
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updatedTransaction };
    }
}
export const deleteTransaction = (id: string) => {
    transactions = transactions.filter(t => t.id !== id);
}
