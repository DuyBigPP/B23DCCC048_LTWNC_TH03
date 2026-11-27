'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/auth';
import { safeCallback } from '@/lib/safe-callback';

export async function loginAction(
  _prev: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: safeCallback(formData.get('callbackUrl')),
    });
  } catch (error) {
    if (error instanceof AuthError) return 'Email hoặc mật khẩu không đúng';
    throw error; // redirect() của Next.js là exception, phải ném lại
  }
}
