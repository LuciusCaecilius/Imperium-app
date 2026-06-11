
'use client';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ShieldCheck, DollarSign, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useAppState } from '@/components/app-state';
import { Skeleton } from '@/components/ui/skeleton';
import NumberTicker from '@/components/number-ticker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { VAULTS } from '@/lib/constants';
import type { WalletState, VaultDeposit } from '@/lib/types';
import { Motion } from '@/components/motion';


interface DashboardContentProps {
  totalBalance: number;
  portfolioYield: number;
  vaultDeposits: Record<string, VaultDeposit>;
}

function DashboardContent({ totalBalance, portfolioYield, vaultDeposits }: DashboardContentProps) {
    return (
        <Motion className="flex-1 flex flex-col">
            <PageHeader
                title="Dashboard"
                description="Here's an overview of your Imperium activity."
            />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="text-4xl font-bold">
                        <NumberTicker value={totalBalance} maximumFractionDigits={4} />
                    </div>
                    <p className="text-xs text-muted-foreground">Your total XAUT holdings</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Portfolio APY</CardTitle>
                    <BarChart2 className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-4xl font-bold text-green-400">
                        <NumberTicker value={portfolioYield} maximumFractionDigits={2} suffix="%" />
                    </div>
                    <p className="text-xs text-muted-foreground">Weighted average APY</p>
                    </CardContent>
                </Card>
                </div>
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Active Vaults</CardTitle>
                            <CardDescription>
                            {Object.keys(vaultDeposits).length > 0
                                ? "Here are the vaults you've deposited into."
                                : "You haven't deposited into any vaults yet."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                        {Object.values(vaultDeposits).some(d => (d.xautAmount ?? 0) > 0) ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(vaultDeposits).map(([vaultId, deposit]) => {
                                const vault = VAULTS.find(v => v.id === vaultId);
                                if (!vault || (deposit.xautAmount ?? 0) <= 0) return null;
                                return (
                                    <Link href={`/vaults/${vaultId}`} key={vaultId} className="group">
                                    <Card className="hover:border-primary transition-colors">
                                        <CardHeader>
                                        <CardTitle className="text-lg text-primary group-hover:underline">{vault.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                        <p className="text-2xl font-bold">
                                            <NumberTicker value={deposit.xautAmount} maximumFractionDigits={4} /> XAUT
                                        </p>
                                        <p className="text-sm text-muted-foreground">Current Deposit</p>
                                        </CardContent>
                                    </Card>
                                    </Link>
                                );
                                })}
                            </div>
                        ) : (
                            <Button asChild>
                                <Link href="/vaults">
                                    Explore Vaults <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </Motion>
    );
}


function DashboardPageComponent({ wallet, vaultDeposits }: { wallet: WalletState, vaultDeposits: Record<string, VaultDeposit> }) {
  const { liveVaultData } = useAppState();

  const totalVaultBalance = React.useMemo(() => 
    Object.values(vaultDeposits).reduce((sum, deposit) => sum + (deposit.xautAmount ?? 0), 0),
    [vaultDeposits]
  );
  
  const totalBalance = (wallet?.xautBalance ?? 0) + totalVaultBalance;
  
  const portfolioYield = React.useMemo(() => {
      if (totalVaultBalance === 0) return 0;
      const weightedApy = Object.entries(vaultDeposits).reduce((sum, [vaultId, deposit]) => {
          const vaultInfo = liveVaultData[vaultId];
          if (!vaultInfo) return sum;
          return sum + ((deposit.xautAmount ?? 0) * vaultInfo.apy);
      }, 0);
      return weightedApy / totalVaultBalance;
  }, [vaultDeposits, totalVaultBalance, liveVaultData]);
  
  return <DashboardContent 
    totalBalance={totalBalance}
    portfolioYield={portfolioYield}
    vaultDeposits={vaultDeposits} 
  />;
}

function DashboardPageSkeleton() {
    return (
        <Motion className="flex-1 flex flex-col">
            <PageHeader title="Dashboard" description="Connect your wallet to view your portfolio." />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                           <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <Skeleton className="h-10 w-3/4 mb-2" />
                           <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                           <CardTitle className="text-sm font-medium">Portfolio APY</CardTitle>
                           <BarChart2 className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                           <Skeleton className="h-10 w-1/2 mb-2" />
                           <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                    </Card>
                </div>
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-7 w-1/3" />
                            <Skeleton className="h-4 w-1/2 mt-2" />
                        </CardHeader>
                        <CardContent>
                           <div className="flex items-center justify-center p-8">
                              <Skeleton className="h-12 w-48" />
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </Motion>
    );
}


export default function DashboardPage() {
    const [isMounted, setIsMounted] = React.useState(false);
    const { isConnected, isBalancesLoading, isVaultsLoading, wallet, vaultDeposits } = useAppState();

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <DashboardPageSkeleton />;
    }
    
    if (isConnected && (isBalancesLoading || isVaultsLoading)) {
        return <DashboardPageSkeleton />;
    }
    
    if (!isConnected || !wallet) {
      return (
        <Motion className="flex-1 flex flex-col">
          <PageHeader
            title="Dashboard"
            description="Connect your wallet to view your portfolio."
          />
          <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
            <Alert className="max-w-md text-center">
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Access Your Portfolio</AlertTitle>
              <AlertDescription>
                Connect your wallet to view your balances and manage your
                investments.
              </AlertDescription>
            </Alert>
          </main>
        </Motion>
      );
    }
    
    return <DashboardPageComponent wallet={wallet} vaultDeposits={vaultDeposits} />;
}
