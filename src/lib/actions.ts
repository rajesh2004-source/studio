'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createSession, deleteSession } from './auth';
import { findUserByEmail, addUser, addTransaction, updateTransaction, deleteTransaction as dbDeleteTransaction, addVendor, updateVendor as dbUpdateVendor, deleteVendor as dbDeleteVendor, getVendorByName } from './data';
import type { Transaction } from './definitions';

export type AuthState = {
  message?: string;
};

const LoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export async function login(prevState: AuthState | undefined, formData: FormData) {
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please check your inputs.',
    };
  }
  
  const { email, password } = validatedFields.data;
  
  const user = await findUserByEmail(email);

  if (!user || user.password !== password) {
    return { message: 'Invalid credentials.' };
  }
  
  await createSession(user);
  redirect('/dashboard');
}

const SignupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});


export async function signup(prevState: AuthState | undefined, formData: FormData) {
  const validatedFields = SignupSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.errors.map(e => e.message).join(' ');
    return {
      message: errorMessages,
    };
  }
  
  const { name, email, password } = validatedFields.data;

  if (await findUserByEmail(email)) {
    return { message: 'An account with this email already exists.' };
  }
  
  const newUser = { id: Date.now().toString(), name, email, password };
  await addUser(newUser);
  
  // Do not create session here, redirect to login
  redirect('/login?message=Account created successfully! Please log in.');
}


export async function logout() {
  await deleteSession();
  redirect('/login');
}


export type FormState = {
    message: string;
    errors?: Record<string, string[] | undefined>;
};

const TransactionSchema = z.object({
    id: z.string(),
    date: z.string().refine(d => !isNaN(Date.parse(d)), { message: "Invalid date" }),
    description: z.string().min(1, "Description is required"),
    vendorId: z.string().min(1, "Vendor is required"),
    categoryId: z.string().min(1, "Category is required"),
    amount: z.coerce.number().gt(0, "Amount must be greater than 0"),
    type: z.enum(['income', 'expense']),
    paymentMode: z.enum(['cash', 'upi', 'bank', 'others']),
    notes: z.string().optional(),
});
   
const CreateTransaction = TransactionSchema.omit({ id: true });

export async function createTransaction(prevState: FormState, formData: FormData) {
    const validatedFields = CreateTransaction.safeParse({
        date: formData.get('date'),
        description: formData.get('description'),
        vendorId: formData.get('vendorId'),
        categoryId: formData.get('categoryId'),
        amount: formData.get('amount'),
        type: formData.get('type'),
        paymentMode: formData.get('paymentMode'),
        notes: formData.get('notes'),
    });

    if (!validatedFields.success) {
        return {
          message: 'Failed to create transaction. Please check your inputs.',
          errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const newTransaction: Transaction = {
        id: `t${Date.now()}`,
        ...validatedFields.data,
    };

    try {
        await addTransaction(newTransaction);
    } catch (error) {
        return { message: 'Database Error: Failed to Create Transaction.' };
    }
    
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    return { message: 'Successfully created transaction' };
}

const UpdateTransaction = TransactionSchema.omit({ id: true });

export async function editTransaction(id: string, prevState: FormState, formData: FormData) {
    const validatedFields = UpdateTransaction.safeParse({
        date: formData.get('date'),
        description: formData.get('description'),
        vendorId: formData.get('vendorId'),
        categoryId: formData.get('categoryId'),
        amount: formData.get('amount'),
        type: formData.get('type'),
        paymentMode: formData.get('paymentMode'),
        notes: formData.get('notes'),
    });

    if (!validatedFields.success) {
        return {
          message: 'Failed to update transaction. Please check your inputs.',
          errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await updateTransaction(id, validatedFields.data);
    } catch (error) {
        return { message: 'Database Error: Failed to Update Transaction.' };
    }

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/vendors');
    return { message: 'Successfully updated transaction' };
}

export async function deleteTransactionAction(id: string) {
    try {
        await dbDeleteTransaction(id);
        revalidatePath('/transactions');
        revalidatePath('/dashboard');
        revalidatePath('/vendors');
    } catch (error) {
        return { message: 'Database Error: Failed to Delete Transaction.' };
    }
}


// Vendor Actions

const VendorSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    contactPerson: z.string().optional(),
    email: z.string().email({ message: "Invalid email" }).optional().or(z.literal('')),
    phone: z.string().optional(),
});

const CreateVendor = VendorSchema.omit({ id: true });

export async function createVendor(prevState: FormState, formData: FormData) {
    const validatedFields = CreateVendor.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: 'Failed to create vendor. Please check your inputs.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { name } = validatedFields.data;
    if (await getVendorByName(name)) {
        return {
            message: 'A vendor with this name already exists.',
            errors: { name: ['Name already exists'] }
        };
    }

    try {
        await addVendor(validatedFields.data);
    } catch (error) {
        return { message: 'Database Error: Failed to Create Vendor.' };
    }

    revalidatePath('/vendors');
    revalidatePath('/transactions');
    return { message: 'Successfully created vendor' };
}

const UpdateVendor = VendorSchema.omit({ id: true });

export async function updateVendor(id: string, prevState: FormState, formData: FormData) {
    const validatedFields = UpdateVendor.safeParse(Object.fromEntries(formData.entries()));
    
    if (!validatedFields.success) {
        return {
            message: 'Failed to update vendor. Please check your inputs.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        await dbUpdateVendor(id, validatedFields.data);
    } catch (error) {
        return { message: 'Database Error: Failed to Update Vendor.' };
    }
    
    revalidatePath('/vendors');
    revalidatePath('/transactions');
    return { message: 'Successfully updated vendor' };
}

export async function deleteVendor(id: string) {
    try {
        await dbDeleteVendor(id);
        revalidatePath('/vendors');
        revalidatePath('/transactions');
    } catch (error) {
        return { message: 'Database Error: Failed to Delete Vendor.' };
    }
}