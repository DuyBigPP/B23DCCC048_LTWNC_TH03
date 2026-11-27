import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Đăng nhập' };

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  if (await auth()) redirect('/');
  const { callbackUrl } = await searchParams;

  return (
    <main className="narrow">
      <div className="card">
        <h1>Đăng nhập</h1>
        <LoginForm callbackUrl={typeof callbackUrl === 'string' ? callbackUrl : ''} />
      </div>
    </main>
  );
}
