import { getDb } from './db';
import type { User, Transaction } from './definitions';

export const getInitialBalance = () => 500.00;

export async function getUsers() {
    const db = await getDb();
    return db.data.users;
}

export async function findUserByEmail(email: string) {
    const db = await getDb();
    return db.data.users.find(u => u.email === email) || null;
}

export async function addUser(user: User) {
    const db = await getDb();
    db.data.users.push(user);
    await db.write();
}

export async function getVendors() {
    const db = await getDb();
    return db.data.vendors;
}

export async function getVendorById(id: string) {
    const db = await getDb();
    return db.data.vendors.find(v => v.id === id);
}

export async function getCategories() {
    const db = await getDb();
    return db.data.categories;
}

export async function getTransactions() {
    const db = await getDb();
    return db.data.transactions;
}

export async function getTransactionById(id: string) {
    const db = await getDb();
    return db.data.transactions.find(t => t.id === id);
}

export async function addTransaction(transaction: Transaction) {
    const db = await getDb();
    db.data.transactions.unshift(transaction);
    await db.write();
}

export async function updateTransaction(id: string, updatedTransaction: Partial<Omit<Transaction, 'id'>>) {
    const db = await getDb();
    const index = db.data.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        db.data.transactions[index] = { ...db.data.transactions[index], ...updatedTransaction };
        await db.write();
    }
}

export async function deleteTransaction(id: string) {
    const db = await getDb();
    db.data.transactions = db.data.transactions.filter(t => t.id !== id);
    await db.write();
}
