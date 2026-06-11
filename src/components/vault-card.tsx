
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Vault } from '@/lib/types';
import NumberTicker from './number-ticker';
import { ArrowUpRight, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from './ui/skeleton';
import * as icons from 'lucide-react';

interface VaultCardProps {
  vault: Vault;
  index: number;
  liveApy?: number;
  isLoading: boolean;
}

export default function VaultCard({ vault, index, liveApy, isLoading }: VaultCardProps) {
  const router = useRouter();
  
  const handlePrefetch = () => {
    router.prefetch(`/vaults/${vault.id}`);
  };
  
  const displayApy = liveApy ?? vault.apy;
  
  const isUrl = typeof vault.icon === 'string' && (vault.icon.includes('/') || vault.icon.includes('.'));
  const LucideIcon = !isUrl && typeof vault.icon === 'string' ? (icons[vault.icon as keyof typeof icons] || HelpCircle) : null;

  return (
    <div 
        className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
        style={{ animationDelay: `${index * 100}ms`}}
    >
        <Link 
          href={`/vaults/${vault.id}`} 
          className="group block h-full"
          onMouseEnter={handlePrefetch}
          onFocus={handlePrefetch}
        >
          <Card className="h-full flex flex-col transition-all duration-300 ease-in-out group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-background rounded-full border-2 border-primary/20 flex items-center justify-center h-12 w-12">
                  {isUrl && typeof vault.icon === 'string' ? (
                    <Image 
                      src={vault.icon} 
                      alt={`${vault.name} icon`} 
                      width={32} 
                      height={32}
                      data-ai-hint={vault.iconHint}
                      className="rounded-full" 
                    />
                  ) : LucideIcon ? (
                    <LucideIcon className="h-8 w-8 text-primary" />
                  ) : null}
                </div>
                <div>
                  <CardTitle className="font-headline text-lg text-primary">{vault.name}</CardTitle>
                  <CardDescription className="mt-1">{vault.shortDescription}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground text-sm">APY</span>
                    <Skeleton className="h-7 w-20" />
                  </div>
                  <div className="flex justify-between items-baseline mt-2">
                    <span className="text-muted-foreground text-sm">TVL</span>
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground text-sm">APY</span>
                    <span className="text-2xl font-bold text-green-400">
                      <NumberTicker value={displayApy} suffix="%" maximumFractionDigits={2} />
                    </span>
                  </div>
                  {/* TVL is now handled in the Vaults page directly to simplify this component */}
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full">
                <span>Details</span>
                <ArrowUpRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:rotate-45" />
              </Button>
            </CardFooter>
          </Card>
        </Link>
    </div>
  );
}
