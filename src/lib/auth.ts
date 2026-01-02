'use server';

import { cookies } from 'next/headers';
import type { User } from './definitions';

const SESSION_COOKIE_NAME = 'pettyflow_session';

export async function createSession(user: User) {
  const session = JSON.stringify(user);
  cookies().set(SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });
}

export async function getSession(): Promise<User | null> {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME);
  if (!sessionCookie) {
    return null;
  }
  try {
    // In a real app, you'd decrypt the session here
    const session = JSON.parse(sessionCookie.value);
    return session as User;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  cookies().delete(SESSION_COOKIE_NAME);
}
