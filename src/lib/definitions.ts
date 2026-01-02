export type Transaction = {
  id: string;
  date: string;
  description: string;
  vendorId: string;
  categoryId: string;
  amount: number;
  type: 'income' | 'expense';
  paymentMode: 'cash' | 'upi' | 'bank' | 'others';
  notes?: string;
};

export type Vendor = {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
};

export type Category = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
};
