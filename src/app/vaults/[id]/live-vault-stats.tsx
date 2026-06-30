
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NumberTicker from '@/components/number-ticker';
import { Skeleton } from '@/components/ui/skeleton';
import type { LiveVaultData, Vault, VaultDeposit } from '@/lib/types';

interface LiveVaultStatsProps {
    vault: Vault;
    userDeposit: VaultDeposit;
    vaultLiveData: LiveVaultData | undefined;
    isVaultsLoading: boolean;
    isBalancesLoading: boolean;
    isConnected: boolean;
}

export default function LiveVaultStats({ 
    vault,
    userDeposit, 
    vaultLiveData, 
    isVaultsLoading, 
    isBalancesLoading,
    isConnected,
}: LiveVaultStatsProps) {
    const isLoading = isVaultsLoading || !vaultLiveData;
    const isUserDepositLoading = isConnected && isBalancesLoading;

    // Ensure APY and TVL are valid numbers, fallback to vault data if corrupted
    const displayApy = (
        vaultLiveData?.apy !== undefined && 
        vaultLiveData.apy !== null && 
        !isNaN(vaultLiveData.apy) && 
        vaultLiveData.apy >= 0 && 
        vaultLiveData.apy <= 1000
    ) 
        ? vaultLiveData.apy 
        : vault.apy;
    const displayTvl = (
        vaultLiveData?.tvl !== undefined && 
        vaultLiveData.tvl !== null && 
        !isNaN(vaultLiveData.tvl) && 
        vaultLiveData.tvl >= 0 &&
        vaultLiveData.tvl < 1e18
    ) 
        ? vaultLiveData.tvl 
        : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-primary">Vault Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground">APY</span>
                    {isLoading ? (
                        <Skeleton className="h-8 w-24" />
                    ) : (
                        <span className="text-2xl font-bold text-green-400">
                            <NumberTicker value={displayApy} suffix="%" maximumFractionDigits={2} />
                        </span>
                    )}
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground">Total Value Locked</span>
                     {isLoading ? (
                        <Skeleton className="h-6 w-32" />
                    ) : (
                        <span className="text-xl font-medium">
                            <NumberTicker value={displayTvl} maximumFractionDigits={2} />
                        </span>
                    )}
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground">Your Deposit (XAUT)</span>
                     {isUserDepositLoading ? (
                        <Skeleton className="h-6 w-20" />
                    ) : (
                        <span className="text-xl font-medium">
                            <NumberTicker value={userDeposit.xautAmount} prefix="" maximumFractionDigits={4} />
                        </span>
                    )}
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground">Pending Withdrawal</span>
                     {isUserDepositLoading ? (
                        <Skeleton className="h-6 w-20" />
                    ) : (
                        <span className="text-xl font-medium">
                            <NumberTicker value={userDeposit.withdrawalRequestAmount} prefix="" maximumFractionDigits={4} />
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
