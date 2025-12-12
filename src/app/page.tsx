import { LoginForm } from '@/components/auth/LoginForm';
import { AppLogo } from '@/components/shared/AppLogo';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    const url = session.role === 'admin' ? '/sk-admin/dashboard' : '/dashboard';
    redirect(url);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <AppLogo />
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
