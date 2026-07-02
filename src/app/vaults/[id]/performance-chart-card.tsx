
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { Vault } from '@/lib/types';
import { LineChart } from 'lucide-react';
import { useAppState } from '@/components/app-state';
import React from 'react';

export default function PerformanceChartCard({ vault }: { vault: Vault }) {
  const { liveVaultData } = useAppState();
  const liveData = liveVaultData[vault.id];

  const chartData = React.useMemo(() => {
    // For Lagoon vaults, always use live share price data
    if (vault.isLagoonVault && liveData) {
      const today = new Date().toISOString().split('T')[0];
      // Use sharePrice if available (in Wei), otherwise use exchangeRate as fallback
      const currentPrice = liveData.sharePrice ?? liveData.exchangeRate;
      
      if (typeof currentPrice === 'number' && currentPrice > 0) {
        return [{
          date: today,
          price: currentPrice,
        }];
      }
    }

    // For non-Lagoon vaults, use historical performance data with real-time update
    const historicalData = (vault.performance || []).map(d => ({
        date: d.date,
        price: d.price
    }));
    
    if (liveData && typeof liveData.exchangeRate === 'number') {
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = { date: today, price: liveData.exchangeRate };

      // Avoid double entry for today
      const filteredHistorical = historicalData.filter(d => d.date !== today);
      return [...filteredHistorical, todayEntry];
    }
    
    return historicalData;
  }, [vault.performance, vault.isLagoonVault, liveData]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-primary flex items-center gap-2">
          <LineChart />
          Share Price
        </CardTitle>
        <CardDescription>
          Historical share price performance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            price: {
              label: 'Share Price',
              color: 'hsl(var(--primary))',
            },
          }}
          className="h-[250px] w-full"
        >
          <AreaChart
            data={chartData}
            margin={{
              left: -10,
              right: 10,
              top: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
                return utcDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toFixed(4)}
              domain={['auto', 'auto']}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(label) => {
                       if (typeof label === 'string') {
                         const date = new Date(label);
                         const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
                         return utcDate.toLocaleDateString('en-US', {
                           year: 'numeric',
                           month: 'long',
                           day: 'numeric',
                           timeZone: 'UTC',
                         });
                       }
                       return label;
                  }}
                />
              }
            />
            <defs>
                <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
            </defs>
            <Area
              dataKey="price"
              type="monotone"
              fill="url(#fillPrice)"
              stroke="hsl(var(--primary))"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
