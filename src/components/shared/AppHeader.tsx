'use client';

import Link from 'next/link';
import { AppLogo } from './AppLogo';
import { UserNav } from './UserNav';
import { buttonVariants } from '../ui/button';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

type AppHeaderProps = {
    name: string;
    email: string;
    role: 'admin' | 'employee';
}

export function AppHeader({ name, email, role }: AppHeaderProps) {
  const pathname = usePathname();
  const navLinks = role === 'admin' 
    ? [
        { href: '/sk-admin/dashboard', label: 'Dashboard' },
        { href: '/sk-admin/employees', label: 'Employees' },
        { href: '/sk-admin/attendance', label: 'Attendance' },
      ]
    : [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/attendance/history', label: 'Attendance History'}
      ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-6 hidden md:flex">
          <AppLogo />
        </div>
        
        <nav className="hidden md:flex items-center space-x-2">
            {navLinks.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'text-sm font-medium',
                    pathname === link.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                </Link>
            ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <UserNav name={name} email={email} />
        </div>
      </div>
    </header>
  );
}
