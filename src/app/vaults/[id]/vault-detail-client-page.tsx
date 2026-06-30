
'use client';
import Image from 'next/image';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PerformanceChartCard from './performance-chart-card';
import { useAppState } from '@/components/app-state';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast.tsx';
import type { Vault } from '@/lib/types';
import LiveVaultStats from './live-vault-stats';
import { Motion } from '@/components/motion';
import NumberTicker from '@/components/number-ticker';

export default function VaultDetailClientPage({ vault }: { vault: Vault }) {
  const { 
    wallet, 
    vaultDeposits, 
    depositToVault, 
    requestWithdrawalFromVault,
    claimFromVault,
    isConnected, 
    isBalancesLoading, 
    liveVaultData,
    isVaultsLoading,
    isProcessing,
  } = useAppState();
  const { toast } = useToast();
  
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const userDeposit = vaultDeposits[vault.id] || { xautAmount: 0, receiptTokenAmount: 0, withdrawalRequestAmount: 0 };
  const xautBalance = wallet?.xautBalance ?? 0;
  
  const userBalanceInVault = userDeposit.xautAmount;
  const pendingWithdrawal = userDeposit.withdrawalRequestAmount;

  const handleMaxDeposit = () => {
    setDepositAmount(xautBalance.toString());
  };
  
  const handleMaxWithdraw = () => {
    setWithdrawAmount(userBalanceInVault.toString());
  };

  const handleDeposit = () => {
    if (!isConnected) {
      toast({ title: 'Wallet Not Connected', description: 'Please connect your wallet first.', variant: 'destructive' });
      return;
    }
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a positive amount to deposit.', variant: 'destructive' });
      return;
    }
    if (amount > xautBalance) {
      toast({ title: 'Insufficient XAUT', description: 'You do not have enough XAUT to make this deposit.', variant: 'destructive' });
      return;
    }

    depositToVault(vault.id, amount);
    setDepositAmount('');
  };
  
  const handleWithdrawRequest = () => {
    if (!isConnected) {
      toast({ title: 'Wallet Not Connected', description: 'Please connect your wallet first.', variant: 'destructive' });
      return;
    }
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a positive amount to withdraw.', variant: 'destructive' });
      return;
    }
    
    if (amount > userBalanceInVault) {
      const tokenSymbol = 'XAUT';
      toast({ title: 'Insufficient Balance', description: `You do not have enough ${tokenSymbol} in this vault.`, variant: 'destructive' });
      return;
    }
    
    requestWithdrawalFromVault(vault.id, amount);
    setWithdrawAmount('');
  };

  const handleClaim = () => {
    if (!isConnected) {
      toast({ title: 'Wallet Not Connected', description: 'Please connect your wallet first.', variant: 'destructive' });
      return;
    }
    if (pendingWithdrawal <= 0) {
        toast({ title: 'No Withdrawal to Claim', description: 'You do not have a pending withdrawal request.', variant: 'destructive' });
        return;
    }
    claimFromVault(vault.id);
  }

  const isUIDisabled = !isConnected || isBalancesLoading || isProcessing;

  const withdrawTokenSymbol = 'XAUT';
  const withdrawBalance = userBalanceInVault.toFixed(4);
  
  // Use live exchange rate from vault data with validation
  const liveExchangeRate = (
    liveVaultData?.exchangeRate !== undefined && 
    liveVaultData.exchangeRate !== null &&
    !isNaN(liveVaultData.exchangeRate) &&
    liveVaultData.exchangeRate > 0
  ) 
    ? liveVaultData.exchangeRate 
    : vault.exchangeRate;
  
  const exchangeRateInfo = `1 ${vault.receiptTokenSymbol} ≈ ${liveExchangeRate.toFixed(6)} XAUT`;
  const inverseExchangeRateInfo = `1 XAUT ≈ ${(1 / liveExchangeRate).toFixed(6)} ${vault.receiptTokenSymbol}`;


  return (
    <Motion>
      <PageHeader title={vault.name} description={vault.shortDescription} />
      <main className="flex-1 p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <PerformanceChartCard vault={vault} />
            <Card>
                <CardHeader>
                    <CardTitle>Strategy Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-muted-foreground">{vault.description}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Fees</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Performance Fees</span>
                        <span>20%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Management Fee</span>
                        <span>0%</span>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="space-y-8">
          <LiveVaultStats 
            vault={vault}
            userDeposit={userDeposit}
            vaultLiveData={liveVaultData[vault.id]}
            isVaultsLoading={isVaultsLoading}
            isBalancesLoading={isBalancesLoading}
            isConnected={isConnected}
          />
          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-card border">
              <TabsTrigger value="deposit" disabled={!isConnected}>Deposit</TabsTrigger>
              <TabsTrigger value="withdraw" disabled={!isConnected}>Withdraw</TabsTrigger>
              <TabsTrigger value="claim" disabled={!isConnected}>Claim</TabsTrigger>
            </TabsList>
            <TabsContent value="deposit">
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="font-headline text-primary">Deposit XAUT</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deposit-amount">Amount</Label>
                    <div className="relative">
                      <Input id="deposit-amount" type="number" placeholder="0.0" className="pr-16 text-lg" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} disabled={isUIDisabled}/>
                       <div className="absolute inset-y-0 right-0 flex items-center">
                          <Button variant="ghost" size="sm" onClick={handleMaxDeposit} disabled={isUIDisabled}>Max</Button>
                       </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-right">Balance: {xautBalance.toFixed(4)} XAUT</p>
                  </div>
                  <div className="text-sm text-muted-foreground text-center py-2">
                      {inverseExchangeRateInfo}
                  </div>
                  <Button size="lg" className="w-full text-lg font-bold pulse-bg-primary" onClick={handleDeposit} disabled={isUIDisabled || !depositAmount}>
                    {isProcessing ? "Processing..." : "Deposit"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="withdraw">
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="font-headline text-primary">Request Withdrawal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-amount">Amount ({withdrawTokenSymbol})</Label>
                     <div className="relative">
                        <Input id="withdraw-amount" type="number" placeholder="0.0" className="pr-16 text-lg" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} disabled={isUIDisabled} />
                        <div className="absolute inset-y-0 right-0 flex items-center">
                           <Button variant="ghost" size="sm" onClick={handleMaxWithdraw} disabled={isUIDisabled}>Max</Button>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-right">Balance: {withdrawBalance} {withdrawTokenSymbol}</p>
                  </div>
                  <Button size="lg" className="w-full text-lg font-bold" onClick={handleWithdrawRequest} disabled={isUIDisabled || !withdrawAmount}>
                    {isProcessing ? "Processing..." : "Request Withdrawal"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
             <TabsContent value="claim">
              <Card className="mt-4">
                <CardHeader>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2 text-center">
                    <Label>Pending Withdrawal</Label>
                    <p className="text-3xl font-bold">
                        <NumberTicker value={pendingWithdrawal} maximumFractionDigits={6} />
                        <span className="text-lg ml-2">XAUT</span>
                    </p>
                  </div>
                  <Button size="lg" className="w-full text-lg font-bold" onClick={handleClaim} disabled={isUIDisabled || pendingWithdrawal <= 0}>
                    {isProcessing ? "Processing..." : "Claim"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </Motion>
  );
}
