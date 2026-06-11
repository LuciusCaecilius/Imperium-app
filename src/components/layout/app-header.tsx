
'use client';

import { Button } from '@/components/ui/button';
import { Menu, Wallet, Home, Shield, History, LogOut, CircleDashed, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import SvgComponent from '../icons';
import { useAppState } from '../app-state';
import React, { useState, useEffect } from 'react';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/vaults', label: 'Vaults', icon: Shield },
  { href: '/history', label: 'History', icon: History },
];

export default function AppHeader() {
  const pathname = usePathname();
  const { wallet, connectWallet, disconnectWallet, isBalancesLoading, isConnected, isConnecting } = useAppState();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleConnect = () => {
    connectWallet();
  }
  
  const handleDisconnect = () => {
    disconnectWallet();
  }
  
  const headerClasses = cn(
      "sticky top-0 z-30 flex h-20 items-center justify-between gap-4 px-4 transition-all duration-300 md:px-6",
      isMounted && scrolled ? "backdrop-blur-sm" : ""
  );

  const ConnectButtonContent = () => {
    if (isConnecting) {
      return (
        <>
          <CircleDashed className="h-5 w-5 md:mr-2 animate-spin" />
          <span className="hidden md:inline">Connecting...</span>
        </>
      );
    }
    if (isConnected && wallet) {
      return (
        <>
          {isBalancesLoading ? <CircleDashed className="h-5 w-5 animate-spin" /> : <Wallet className="h-5 w-5" />}
          <span className="hidden md:inline ml-2">{formatAddress(wallet.address)}</span>
        </>
      );
    }
    return (
      <>
        <Wallet className="h-5 w-5" />
        <span className="hidden md:inline ml-2">Connect Wallet</span>
      </>
    );
  };

  return (
    <header className={headerClasses}>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
                <DropdownMenu onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <X className={cn("h-6 w-6 absolute transition-all duration-300 ease-in-out", !menuOpen && "rotate-90 scale-0 opacity-0")} />
                      <Menu className={cn("h-6 w-6 transition-all duration-300 ease-in-out", menuOpen && "-rotate-90 scale-0 opacity-0")} />
                      <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {menuItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                        <Link
                        href={item.href}
                        className={cn(
                            'flex items-center gap-2 w-full',
                            (item.href === '/' ? pathname === item.href : pathname.startsWith(item.href)) && 'bg-accent'
                        )}
                        >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        </Link>
                    </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <Link href="/" className="flex items-center gap-2">
              <SvgComponent className="h-16 w-16 text-primary" />
            </Link>
        </div>
        <div className="flex items-center gap-4">
            {isConnected && wallet ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" disabled={isBalancesLoading} size="icon" className="md:w-auto md:px-4">
                      <ConnectButtonContent />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleDisconnect}>
                       <LogOut className="mr-2 h-4 w-4" />
                       Disconnect
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleConnect} disabled={isConnecting} size="icon" className="md:w-auto md:px-4">
                  <ConnectButtonContent />
              </Button>
            )}
        </div>
    </header>
  );
}

    