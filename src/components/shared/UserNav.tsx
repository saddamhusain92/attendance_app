'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logout } from '@/lib/actions/auth.actions';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';

type UserNavProps = {
  name: string;
  email: string;
};

export function UserNav({ name, email }: UserNavProps) {
  const initials = name ? name.charAt(0).toUpperCase() : 'U';

  const handleLogout = async () => {
    await logout();
    // No need to use router.refresh() or transition here, 
    // the page will reload automatically after the server action.
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative flex items-center gap-2 h-8 rounded-full hover:bg-transparent">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://avatar.vercel.sh/${email}.png`} alt={`@${name}`} />
            <AvatarFallback className="bg-transparent">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
