
'use client';

import PageHeader from '@/components/page-header';
import VaultCard from '@/components/vault-card';
import { VAULTS } from '@/lib/constants';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppState } from '@/components/app-state';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark } from 'lucide-react';
import Image from 'next/image';
import { Motion } from '@/components/motion';

function VaultsPageComponent() {
  const { liveVaultData, isVaultsLoading } = useAppState();

  return (
    <Motion className="flex-1 flex flex-col">
      <PageHeader
        title="Vaults"
        description="Explore opportunities and deposit into our curated selection of vaults."
      />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {VAULTS.map((vault, index) => {
            const liveData = liveVaultData[vault.id];
            return (
              <VaultCard
                key={vault.id}
                vault={vault}
                index={index}
                liveApy={liveData?.apy}
                liveTvl={liveData?.tvl}
                isLoading={isVaultsLoading}
              />
            );
          })}
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${VAULTS.length * 100}ms`}}>
            <Card className="h-full flex flex-col bg-card/50 border-dashed border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="text-center">
                  <CardTitle className="font-headline text-lg text-primary/80">
                    More Vaults Coming Soon
                  </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex items-center justify-center">
                  <Landmark className="w-16 h-16 text-muted-foreground/50" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </Motion>
  );
}

function VaultsPageSkeleton() {
    return (
        <Motion className="flex-1 flex flex-col">
            <PageHeader
                title="Vaults"
                description="Loading our curated selection of vaults."
            />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {VAULTS.map((vault, i) => (
                       <Card key={i} className="h-full flex flex-col">
                           <CardHeader>
                             <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className='space-y-2'>
                                  <Skeleton className="h-5 w-32" />
                                  <Skeleton className="h-4 w-40" />
                                </div>
                              </div>
                           </CardHeader>
                           <CardContent className="flex-grow space-y-2">
                             <div className="flex justify-between items-baseline">
                               <Skeleton className="h-4 w-8" />
                               <Skeleton className="h-7 w-20" />
                             </div>
                             <div className="flex justify-between items-baseline mt-2">
                               <Skeleton className="h-4 w-8" />
                               <Skeleton className="h-5 w-28" />
                             </div>
                           </CardContent>
                           <CardFooter>
                             <Skeleton className="h-10 w-full" />
                           </CardFooter>
                         </Card>
                    ))}
                </div>
            </main>
        </Motion>
    );
}

export default function VaultsPage() {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <VaultsPageSkeleton />;
    }

    return <VaultsPageComponent />;
}
