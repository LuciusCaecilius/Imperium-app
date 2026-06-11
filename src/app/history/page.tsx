'use client';
import PageHeader from '@/components/page-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppState } from '@/components/app-state';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { History as HistoryIcon } from 'lucide-react';
import { Motion } from '@/components/motion';

const TypeIcon = ({ type }: { type: 'Deposit' | 'Withdraw' }) => {
  const iconMap = {
    Deposit: <ArrowDownLeft className="h-4 w-4 text-green-400" />,
    Withdraw: <ArrowUpRight className="h-4 w-4 text-red-400" />,
  };

  return iconMap[type];
};

const getStatusClass = (status: 'Completed' | 'Pending' | 'Failed') => {
  switch (status) {
    case 'Completed':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'Pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'Failed':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return '';
  }
}

function HistoryPageComponent() {
  const { transactions, isConnected } = useAppState();
  
  if (!isConnected) {
    return (
       <Motion className="flex-1 flex flex-col">
          <PageHeader
            title="Transaction History"
            description="Connect your wallet to view your transactions."
          />
          <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
              <Alert className="max-w-md text-center">
                  <HistoryIcon className="h-4 w-4" />
                  <AlertTitle>No History Found</AlertTitle>
                  <AlertDescription>
                     Please connect your wallet to view your transaction history.
                  </AlertDescription>
              </Alert>
          </main>
      </Motion>
    );
  }

  if (transactions.length === 0) {
    return (
      <Motion className="flex-1 flex flex-col">
         <PageHeader
           title="Transaction History"
           description="Review your recent deposits and withdrawals."
         />
         <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
             <Alert className="max-w-md text-center">
                 <HistoryIcon className="h-4 w-4" />
                 <AlertTitle>No Transactions Yet</AlertTitle>
                 <AlertDescription>
                    Your transaction history will appear here once you make your first move.
                 </AlertDescription>
             </Alert>
         </main>
     </Motion>
   );
  }

  return (
    <Motion className="flex-1 flex flex-col">
      <PageHeader
        title="Transaction History"
        description="Review your recent deposits and withdrawals."
      />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {/* Desktop Table */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Tx</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.txHash} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <TypeIcon type={tx.type} />
                      {tx.type}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {tx.vault ?? tx.token}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {tx.amount.toLocaleString('en-US', { maximumFractionDigits: 6 })} {tx.token}
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(tx.date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.status === 'Completed' ? 'default' : 'secondary'} 
                           className={cn(getStatusClass(tx.status))}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <a href={`https://etherscan.io/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex justify-end items-center gap-1">
                      View <ArrowUpRight className="w-3 h-3"/>
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Mobile Cards */}
        <div className="grid gap-4 md:hidden">
            {transactions.map((tx) => (
                <Card key={tx.txHash} className="shadow-md">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <TypeIcon type={tx.type} />
                                <CardTitle className="text-lg font-bold">{tx.type}</CardTitle>
                            </div>
                            <Badge variant={tx.status === 'Completed' ? 'default' : 'secondary'} className={cn(getStatusClass(tx.status))}>
                                {tx.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">Details</p>
                            <p className="font-medium">{tx.vault ?? tx.token}</p>
                        </div>
                         <div>
                            <p className="text-xs text-muted-foreground">Amount</p>
                            <p className="font-mono text-base">{tx.amount.toLocaleString('en-US', { maximumFractionDigits: 6 })} {tx.token}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Date</p>
                            <p>{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(tx.date)}</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <a href={`https://etherscan.io/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex justify-end items-center gap-1 w-full text-sm">
                            View Transaction <ArrowUpRight className="w-3 h-3"/>
                        </a>
                    </CardFooter>
                </Card>
            ))}
        </div>
      </main>
    </Motion>
  );
}

function HistoryPageSkeleton() {
    return (
        <Motion className="flex-1 flex flex-col">
            <PageHeader
                title="Transaction History"
                description="Review your recent deposits, and withdrawals."
            />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-1/4" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-4 w-1/4 ml-auto" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </main>
        </Motion>
    );
}

export default function HistoryPage() {
    const [isMounted, setIsMounted] = React.useState(false);
    const { isConnected } = useAppState();

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <HistoryPageSkeleton />;
    }
  
    return <HistoryPageComponent />;
}
