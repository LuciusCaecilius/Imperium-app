
'use client';

import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import SvgComponent from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, History, Home, LogOut, PanelLeft, Shield, Wallet, CircleDashed } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAppState } from '../app-state';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/vaults', label: 'Vaults', icon: Shield },
  { href: '/history', label: 'History', icon: History },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile, state } = useSidebar();
  const { wallet, connectWallet, disconnectWallet, isConnected } = useAppState();

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <Sidebar>
      <SidebarHeader className="h-20">
        <Link href="/" className="flex items-center gap-2">
          <SvgComponent className="h-16 w-16 text-primary" />
          <h1 className={cn("text-2xl font-headline font-bold text-primary whitespace-nowrap", {
            'sr-only': state === 'collapsed'
          })}>Imperium</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link
                href={item.href}
                passHref
                onClick={() => setOpenMobile(false)}
              >
                <SidebarMenuButton
                  isActive={
                    item.href === '/'
                      ? pathname === item.href
                      : pathname.startsWith(item.href)
                  }
                  asChild
                >
                  <div className="flex items-center gap-3">
                    <item.icon />
                    <span className={state === 'collapsed' ? 'sr-only' : ''}>{item.label}</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className={cn({ 'hidden': state === 'expanded' })}>
          <SidebarTrigger>
            <PanelLeft className="h-6 w-6" />
          </SidebarTrigger>
        </div>
        <div className={cn("space-y-2", { 'hidden': state === 'collapsed' })}>
           {isConnected && wallet ? (
             <div className="space-y-2">
                <div className="px-3 text-sm">
                    <p className="text-muted-foreground">{formatAddress(wallet.address)}</p>
                    <p className="font-mono text-base">{wallet.xautBalance.toFixed(4)} XAUT</p>
                </div>
                <Button variant="outline" className="w-full" onClick={disconnectWallet}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect
                </Button>
             </div>
           ) : (
             <Button variant="secondary" className="w-full" onClick={connectWallet}>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
           )}
          
          <SidebarMenu>
             <SidebarMenuItem>
                <SidebarTrigger>
                    <PanelLeft className="h-6 w-6" />
                    <span className={state === 'collapsed' ? 'sr-only' : ''}>Collapse</span>
                </SidebarTrigger>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
