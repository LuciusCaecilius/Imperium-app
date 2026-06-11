
'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { PanelLeft } from 'lucide-react';

import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type SidebarContextValue = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

export function SidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(true);
  const [openMobile, setOpenMobile] = React.useState(false);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev);
    } else {
      setOpen((prev) => !prev);
    }
  }, [isMobile]);

  const state = open ? 'expanded' : 'collapsed';

  const contextValue = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, openMobile, isMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
}

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { isMobile, state } = useSidebar();

  if (isMobile) {
    return null; // Don't render sidebar on mobile
  }

  return (
    <aside
      ref={ref}
      className={cn(
        'hidden md:flex flex-col border-r bg-card transition-[width] duration-300',
        'data-[state=expanded]:w-[250px]',
        'data-[state=collapsed]:w-[60px]',
        className
      )}
      data-state={state}
      {...props}
    >
     {children}
    </aside>
  );
});
Sidebar.displayName = 'Sidebar';


export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const { state } = useSidebar();
    return (
      <div
        ref={ref}
        className={cn('p-4 flex items-center', 
        {'justify-center': state === 'collapsed'},
        className)}
        {...props}
      />
    );
});
SidebarHeader.displayName = 'SidebarHeader';

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 overflow-y-auto', className)}
    {...props}
  />
));
SidebarContent.displayName = 'SidebarContent';

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-4 mt-auto border-t', className)}
    {...props}
  />
));
SidebarFooter.displayName = 'SidebarFooter';


export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn('space-y-2 px-2', className)} {...props} />
));
SidebarMenu.displayName = 'SidebarMenu';

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('relative', className)} {...props} />
));
SidebarMenuItem.displayName = 'SidebarMenuItem';

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { isActive?: boolean; asChild?: boolean; }
>(({ isActive, asChild, ...props }, ref) => {
  const { state } = useSidebar();
  const Comp = asChild ? Slot : 'button';

  return (
    <Tooltip>
        <TooltipTrigger asChild>
             <Comp
                ref={ref}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  { 'justify-center': state === 'collapsed' }
                )}
                {...props}
              >
                  {props.children}
             </Comp>
        </TooltipTrigger>
        {state === 'collapsed' && (
            <TooltipContent side="right">
                {
                    // Find the span inside the children and get its content
                    React.Children.toArray(props.children).find(child => (child as React.ReactElement).type === 'span')?.['props']?.children
                }
            </TooltipContent>
        )}
    </Tooltip>
  );
});
SidebarMenuButton.displayName = 'SidebarMenuButton';


export const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <main ref={ref} className={cn('flex-1', className)} {...props} />
    )
});
SidebarInset.displayName = 'SidebarInset';


export const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, children, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      {children}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"
