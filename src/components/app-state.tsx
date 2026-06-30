'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Transaction, VaultDeposit, WalletState, LiveVaultData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast.tsx';
import { VAULTS } from '@/lib/constants';
import { BrowserProvider, ethers, formatUnits, parseUnits, WebSocketProvider, TransactionReceipt } from 'ethers';
import { XAUT_CONTRACT_ADDRESS, XAUT_ABI } from '@/lib/contracts';
import { STABLE_VAULT_ABI } from '@/lib/contracts/stable-vault';
import { fetchXAUsVaultMetrics } from '@/lib/lagoon-direct';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface AppState {
    wallet: WalletState | null;
    vaultDeposits: Record<string, VaultDeposit>;
    transactions: Transaction[];
    isConnected: boolean;
    isConnecting: boolean;
    isBalancesLoading: boolean; 
    isVaultsLoading: boolean;
    isProcessing: boolean;
    error: string | null;
    liveVaultData: Record<string, LiveVaultData>;

    connectWallet: () => void;
    disconnectWallet: () => void;
    depositToVault: (vaultId: string, amount: number) => void;
    requestWithdrawalFromVault: (vaultId: string, amount: number) => void;
    claimFromVault: (vaultId: string) => void;
    refreshAll: () => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

// Updated to Ethereum Mainnet WebSocket Provider
const publicProvider = new WebSocketProvider('wss://ethereum-rpc.publicnode.com');

export function AppStateProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();
    const [wallet, setWallet] = useState<WalletState | null>(null);
    const [vaultDeposits, setVaultDeposits] = useState<Record<string, VaultDeposit>>({});
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isConnecting, setIsConnecting] = useState(true);
    const [isBalancesLoading, setIsBalancesLoading] = useState(false);
    const [isVaultsLoading, setIsVaultsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [liveVaultData, setLiveVaultData] = useState<Record<string, LiveVaultData>>({});

    const addTransaction = (tx: Omit<Transaction, 'date' | 'status'>) => {
        const newTx: Transaction = {
            ...tx,
            date: new Date(),
            status: 'Completed' as const,
        };
        setTransactions(prev => [newTx, ...prev].slice(0, 20)); 
    }
    
    const refreshBalances = useCallback(async (address: string) => {
      if (!address) return;
      
      try {
          const xautContract = new ethers.Contract(XAUT_CONTRACT_ADDRESS, XAUT_ABI, publicProvider);
          const xautBalanceBigInt = await xautContract.balanceOf(address);
          const xautBalance = parseFloat(formatUnits(xautBalanceBigInt, 18));
          
          setWallet(prevWallet => {
              if (!prevWallet || prevWallet.address.toLowerCase() !== address.toLowerCase()) return prevWallet;
              return { ...prevWallet, xautBalance };
          });

      } catch (err: any) {
          console.error("Failed to refresh balances:", err);
          toast({ title: "Balance Update Failed", description: "Could not refresh token balances.", variant: "destructive" });
      }
    }, [toast]);

    const refreshLiveVaultData = useCallback(async () => {
        setIsVaultsLoading(true);
        try {
            const promises = VAULTS.map(async (vault) => {
                try {
                    // Check if address is a placeholder (all zeros) - if so, use fallback data
                    if (vault.address === '0x0000000000000000000000000000000000000000' || 
                        vault.address === '0x0000000000000000000000000000000000000001' ||
                        vault.address === '0x0000000000000000000000000000000000000002') {
                        // Get latest performance price or default exchange rate
                        const latestPrice = vault.performance && vault.performance.length > 0 
                            ? vault.performance[vault.performance.length - 1].price 
                            : vault.exchangeRate;
                        return { 
                            vaultId: vault.id, 
                            data: { 
                                apy: vault.apy, 
                                tvl: 0, 
                                exchangeRate: latestPrice 
                            } 
                        };
                    }

                    // For XAU.s (vault id === '1'), fetch real-time metrics from blockchain
                    if (vault.id === '1') {
                        try {
                            const metrics = await fetchXAUsVaultMetrics(vault.address);
                            if (metrics) {
                                console.log(`[v0] XAU.s real-time metrics:`, {
                                    tvl: metrics.tvl,
                                    sharePrice: metrics.sharePrice,
                                    apr: metrics.apr,
                                });
                                
                                return {
                                    vaultId: vault.id,
                                    data: {
                                        apy: metrics.apr, // Use real APR from Lagoon
                                        tvl: metrics.tvl,
                                        exchangeRate: metrics.sharePrice
                                    }
                                };
                            }
                        } catch (xausError) {
                            console.error('[v0] Failed to fetch XAU.s metrics:', xausError);
                        }
                    }

                    // Fallback to configured vault data
                    const latestPrice = vault.performance && vault.performance.length > 0 
                        ? vault.performance[vault.performance.length - 1].price 
                        : vault.exchangeRate;
                    
                    console.log(`[v0] Vault ${vault.id} (${vault.name}) using configured data:`, {
                        apy: vault.apy,
                        tvl: 0,
                        exchangeRate: latestPrice,
                    });
                    
                    return { 
                        vaultId: vault.id, 
                        data: { 
                            apy: vault.apy,
                            tvl: 0, 
                            exchangeRate: latestPrice 
                        } 
                    };
                } catch (e) {
                    console.error(`[v0] Failed to fetch live data for vault ${vault.id}:`, e);
                    // Use configured fallback data
                    const latestPrice = vault.performance && vault.performance.length > 0 
                        ? vault.performance[vault.performance.length - 1].price 
                        : vault.exchangeRate;
                    return { 
                        vaultId: vault.id, 
                        data: { 
                            apy: vault.apy, 
                            tvl: 0, 
                            exchangeRate: latestPrice 
                        } 
                    };
                }
            });

            const results = await Promise.all(promises);
            const newLiveVaultData: Record<string, LiveVaultData> = {};
            results.forEach(result => {
                if (result) {
                    newLiveVaultData[result.vaultId] = result.data;
                }
            });
            setLiveVaultData(newLiveVaultData);
        } catch (error) {
            console.error("Error refreshing live vault data:", error);
        } finally {
            setIsVaultsLoading(false);
        }
    }, []);
    
    useEffect(() => {
        refreshLiveVaultData();
    }, [refreshLiveVaultData]);

    const refreshVaultDeposits = useCallback(async (address: string) => {
        if (!address) return;

        try {
            const depositPromises = VAULTS.map(async (vault) => {
                try {
                    const vaultContract = new ethers.Contract(vault.address, STABLE_VAULT_ABI, publicProvider);
                    const receiptTokenBalance = await vaultContract.balanceOf(address);
                    const xautAmount = await vaultContract.convertToAssets(receiptTokenBalance);
                    
                    return {
                        vaultId: vault.id,
                        deposit: {
                            xautAmount: parseFloat(formatUnits(xautAmount, 18)),
                            receiptTokenAmount: parseFloat(formatUnits(receiptTokenBalance, 18)),
                            withdrawalRequestAmount: vaultDeposits[vault.id]?.withdrawalRequestAmount || 0,
                        }
                    };
                } catch (err) {
                    console.error(`Failed to refresh deposits for vault ${vault.id}:`, err);
                    return { vaultId: vault.id, deposit: { xautAmount: 0, receiptTokenAmount: 0, withdrawalRequestAmount: 0 } };
                }
            });
            
            const depositResults = await Promise.all(depositPromises);

            const newVaultDeposits: Record<string, VaultDeposit> = {};
            depositResults.forEach((result) => {
                if(result) {
                    newVaultDeposits[result.vaultId] = result.deposit;
                }
            });

            setVaultDeposits(newVaultDeposits);

        } catch(e) {
             console.error("Error refreshing vault deposits", e);
        }
    }, [vaultDeposits]);

    const refreshAll = useCallback(async () => {
        if (!wallet?.address) return;
        setIsBalancesLoading(true);
        try {
             await Promise.all([
                refreshBalances(wallet.address),
                refreshVaultDeposits(wallet.address),
                refreshLiveVaultData(),
            ]);
        } catch (e) {
            console.error("Error refreshing all data:", e);
            toast({ title: "Data Refresh Failed", description: "Could not update data from the network.", variant: "destructive" });
        } finally {
            setIsBalancesLoading(false);
        }
    }, [wallet?.address, refreshBalances, refreshVaultDeposits, refreshLiveVaultData, toast]);

    const handleTransaction = async (
        txCreator: () => Promise<any>,
        txInfo: Omit<Transaction, 'date' | 'status' | 'txHash'>,
    ): Promise<TransactionReceipt | null> => {
        if (!wallet || !wallet.provider) return null;
        
        setIsProcessing(true);
        let txResponse;
        try {
            txResponse = await txCreator();
            const receipt = await txResponse.wait();
            
            if (receipt.status === 1) {
                addTransaction({ ...txInfo, txHash: txResponse.hash });
                toast({ title: `${txInfo.type} Successful`, description: `Your transaction has been completed.` });
            } else {
                 toast({ title: `${txInfo.type} Failed`, description: "The transaction was reverted by the blockchain.", variant: "destructive" });
            }
            
            await refreshAll();
            return receipt;
            
        } catch (err: any) {
            console.error(`${txInfo.type} failed: `, err);
            if (err.code === 'ACTION_REJECTED') {
                 toast({ title: "Transaction Rejected", description: "You rejected the transaction in your wallet.", variant: "destructive" });
            } else {
                const errorMessage = err.reason || err.message || "An unknown error occurred.";
                toast({ title: `${txInfo.type} Failed`, description: errorMessage, variant: "destructive" });
            }
            return null;
        } finally {
            setIsProcessing(false);
        }
    };
    
    const depositToVault = async (vaultId: string, amount: number) => {
        if (!wallet || !wallet.signer) return;
        const vault = VAULTS.find(v => v.id === vaultId);
        if (!vault) {
            toast({ title: "Vault not found", variant: "destructive" });
            return;
        }
    
        setIsProcessing(true);
        try {
            const xautContract = new ethers.Contract(XAUT_CONTRACT_ADDRESS, XAUT_ABI, wallet.signer);
            const vaultContract = new ethers.Contract(vault.address, STABLE_VAULT_ABI, wallet.signer);
            const amountInWei = parseUnits(amount.toString(), 18);

            const approvalReceipt = await handleTransaction(
                () => xautContract.approve(vault.address, amountInWei),
                { type: 'Deposit', vault: `Approve ${vault.name}`, amount, token: 'XAUT' }
            );

            if (approvalReceipt && approvalReceipt.status === 1) {
                await handleTransaction(
                    () => vaultContract.deposit(amountInWei, wallet.address),
                    { type: 'Deposit', vault: vault.name, amount, token: 'XAUT' }
                );
            }
        } catch(e: any) {
            console.error("Deposit flow failed", e);
            toast({ title: "Deposit Failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const requestWithdrawalFromVault = async (vaultId: string, amount: number) => {
        if (!wallet || !wallet.signer) return;
        const vault = VAULTS.find(v => v.id === vaultId);
        if (!vault) {
            toast({ title: "Vault not found", variant: "destructive" });
            return;
        }

        setIsProcessing(true);
        try {
            const vaultContract = new ethers.Contract(vault.address, STABLE_VAULT_ABI, wallet.signer);
            const amountInWei = parseUnits(amount.toString(), 18);
            const sharesToRedeem = await vaultContract.convertToShares(amountInWei);

            await handleTransaction(
                () => vaultContract.requestRedeem(sharesToRedeem, wallet.address, wallet.address),
                { type: 'Withdraw', vault: vault.name, amount, token: 'XAUT' }
            );
            
            setVaultDeposits(prev => ({
                ...prev,
                [vaultId]: {
                    ...prev[vaultId],
                    withdrawalRequestAmount: (prev[vaultId]?.withdrawalRequestAmount || 0) + amount,
                    xautAmount: (prev[vaultId]?.xautAmount || 0) - amount
                }
            }));

        } catch(e: any) {
            console.error("Withdrawal request failed", e);
            toast({ title: "Request Failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const claimFromVault = async (vaultId: string) => {
        if (!wallet || !wallet.signer) return;
        const vault = VAULTS.find(v => v.id === vaultId);
        if (!vault) {
            toast({ title: "Vault not found", variant: "destructive" });
            return;
        }

        const userDeposit = vaultDeposits[vaultId];
        const amount = userDeposit?.withdrawalRequestAmount;
        if (!amount || amount <= 0) {
            toast({ title: "Nothing to claim", variant: "destructive" });
            return;
        }
    
        try {
            const vaultContract = new ethers.Contract(vault.address, STABLE_VAULT_ABI, wallet.signer);
            const amountInWei = parseUnits(amount.toString(), 18);
            const sharesToRedeem = await vaultContract.convertToShares(amountInWei);

            const receipt = await handleTransaction(
                () => vaultContract.redeem(sharesToRedeem, wallet.address, wallet.address),
                { type: 'Withdraw', vault: vault.name, amount: amount, token: "XAUT" }
            );

            if (receipt && receipt.status === 1) {
                setVaultDeposits(prev => ({
                    ...prev,
                    [vaultId]: {
                        ...prev[vaultId],
                        withdrawalRequestAmount: 0
                    }
                }))
            }
        } catch (err: any) {
              console.error(`Claim failed: `, err);
              toast({ title: "Claim Failed", description: err.reason || err.message, variant: "destructive" });
        }
    };
    
    const disconnectWallet = useCallback(() => {
        setWallet(null);
        setVaultDeposits({});
        setTransactions([]);
        setIsConnected(false);
        localStorage.removeItem('walletConnected');
        toast({ title: 'Wallet Disconnected' });
    }, [toast]);
    
    const connectWallet = useCallback(async () => {
        if (!window.ethereum) {
            toast({ title: "Wallet Not Found", description: "Please install a browser wallet.", variant: "destructive" });
            setIsConnecting(false);
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            
            if (accounts.length > 0) {
                const signer = await provider.getSigner();
                const address = await signer.getAddress();
                
                const newWallet: WalletState = {
                    address,
                    provider,
                    signer,
                    xautBalance: 0,
                };

                setWallet(newWallet);
                setIsConnected(true);
                localStorage.setItem('walletConnected', 'true');

                const storedTxsJSON = localStorage.getItem(`transactions_${address}`);
                if (storedTxsJSON) {
                    try {
                        const storedTxs = JSON.parse(storedTxsJSON).map((tx: any) => ({
                            ...tx,
                            date: new Date(tx.date),
                        }));
                        setTransactions(storedTxs);
                    } catch (e) {
                        console.error("Failed to parse transactions", e);
                        setTransactions([]);
                    }
                } else {
                    setTransactions([]);
                }
                
                await refreshAll();

                toast({
                    title: 'Wallet Connected',
                    description: 'Connected to Imperium.',
                });
            }
        } catch (err: any) {
            if (err.code === 'ACTION_REJECTED') {
                 toast({ title: "Connection Rejected", description: "You rejected the request in your wallet.", variant: "destructive" });
            } else {
                const errorMessage = err.message || "An unknown error occurred during connection.";
                setError(errorMessage);
                toast({ title: "Connection Failed", description: errorMessage, variant: "destructive" });
            }
            setWallet(null);
            setIsConnected(false);
        } finally {
            setIsConnecting(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toast]);

    useEffect(() => {
        if (wallet?.address && transactions.length > 0) {
            try {
                const transactionsWithIsoDates = transactions.map(tx => ({...tx, date: tx.date.toISOString()}));
                localStorage.setItem(`transactions_${wallet.address}`, JSON.stringify(transactionsWithIsoDates));
            } catch (e) {
                console.error("Could not save transactions", e);
            }
        }
    }, [transactions, wallet?.address]);

    useEffect(() => {
        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
                disconnectWallet();
            } else if(isConnected) {
                connectWallet();
            }
        };

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, [connectWallet, disconnectWallet, isConnected]);
    
    useEffect(() => {
        async function checkIfWalletIsConnected() {
            if (window.ethereum && localStorage.getItem('walletConnected') === 'true') {
                await connectWallet();
            } else {
                setIsConnecting(false);
            }
        }
        checkIfWalletIsConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const value = {
        wallet,
        vaultDeposits,
        transactions,
        isConnected,
        isConnecting,
        isBalancesLoading,
        isVaultsLoading,
        isProcessing,
        error,
        liveVaultData,
        connectWallet,
        disconnectWallet,
        depositToVault,
        requestWithdrawalFromVault,
        claimFromVault,
        refreshAll,
    };

    return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
    const context = useContext(AppStateContext);
    if (context === undefined) {
        throw new Error('useAppState must be used within an AppStateProvider');
    }
    return context;
}
