import { Footprints } from 'lucide-react';
import Link from 'next/link';

export function AppLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-foreground">
      <Footprints className="h-8 w-8 text-primary" />
      <span className="text-2xl font-headline font-bold">
        <span className="text-stroke text-transparent">SOCIAL</span>
        <span> <span className="text-foreground">WA</span><span className="text-orange-400">L</span><span className="text-foreground">K</span></span>
      </span>
    </Link>
  );
}
