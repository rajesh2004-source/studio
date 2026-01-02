'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createSession, deleteSession } from './auth';
import { getUsers } from './data';

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
  
  const { email } = validatedFields.data;
  
  // MOCK: In a real app, you would look up the user in the database
  const users = getUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return { message: 'Invalid credentials.' };
  }

  // MOCK: In a real app, you would verify the password
  // const passwordsMatch = await bcrypt.compare(password, user.password);
  // if (!passwordsMatch) return { message: 'Invalid credentials.' };
  
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
    return {
      message: 'Invalid form data. Please check your inputs.',
    };
  }

  // MOCK: In a real app, you'd create a new user in the database
  const { name, email } = validatedFields.data;
  const newUser = { id: Date.now().toString(), name, email };
  
  await createSession(newUser);
  redirect('/dashboard');
}


export async function logout() {
  await deleteSession();
  redirect('/login');
}
